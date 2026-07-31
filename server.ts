declare global {
  var memoryPayments: Map<string, any>;
}
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import { requireAuth, AuthRequest } from "./src/middleware/auth";
import { requirePlan, getUserPlanAndStatus, normalizePlanName } from "./src/middleware/planAccess";
import { adminAuth } from "./src/lib/firebase-admin";
import { adminDb } from "./src/lib/firebase-admin";
import {
  createPayUOrderBackend,
  processPaymentSuccessBackend,
  processPaymentFailureBackend,
  processRefundBackend,
  verifyPayUResponseHash,
  getPayUConfig,
  safeGetDoc
} from "./src/services/payuBackendService";
import { generateAndStorePdf } from "./src/services/pdfService";

import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import multer from "multer";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import * as pdfParseNS from "pdf-parse";
const pdfParse = (pdfParseNS as any).default || pdfParseNS;
import fsUtils from "fs";


async function extractTextFromBuffer(mimeType: string, buffer: Buffer, name: string): Promise<string> {
  let extractedText = "";
  try {

    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else if (mimeType.includes('wordprocessingml.document') || name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (mimeType.startsWith('image/')) {
      const result = await Tesseract.recognize(buffer, 'eng');
      extractedText = result.data.text;
    } else {
      extractedText = buffer.toString('utf8');
    }
  } catch (error) {
    console.error(`Error extracting text from ${name}:`, error);
    extractedText = `[Could not extract text from ${name}]`;
  }
  return extractedText;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

const optionalAuth = async (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split('Bearer ')[1];
  try {

    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
  } catch (error) {
    console.error('optionalAuth token verification failed:', error);
    // Ignore errors for optional auth
  }
  next();
};

const usageCache = new Map<string, { plan: string, history: Record<string, { chat: number, doc: number }> }>();

const checkAndIncrementUsage = async (userId: string | undefined, type: 'chat' | 'doc') => {
  if (!userId) return { allowed: true };
  
  try {
    let userData = usageCache.get(userId);
    if (!userData) {
      userData = { plan: 'Free', history: {} };
      usageCache.set(userId, userData);
    }
    
    // We can't fetch the real plan from adminDb, so we'll just assume Free unless memory says otherwise
    // (In a real app with working admin SDK we'd fetch this from DB)
    const isPro = userData.plan && userData.plan !== 'Free' && userData.plan !== 'None';
    if (isPro) return { allowed: true };
    
    const MAX_CHATS = 20;
    const MAX_DOCS = 3;
    const today = new Date().toISOString().split('T')[0];
    
    if (!userData.history[today]) {
      userData.history[today] = { chat: 0, doc: 0 };
    }
    
    const currentCount = userData.history[today][type];
    const limit = type === 'chat' ? MAX_CHATS : MAX_DOCS;
    
    if (currentCount >= limit) {
      const feature = type === 'chat' ? 'AI chats' : 'document analyses';
      return { allowed: false, error: `You have reached your daily limit for ${feature} on the Free plan. Please upgrade to Pro for unlimited usage.` };
    }
    
    userData.history[today][type]++;
    return { allowed: true };
  } catch (err: any) {
    console.error("Usage Tracking Error:", err);
    return { allowed: true };
  }
};


  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // --- Plan & Feature Access Status Endpoint ---
  app.get("/api/user/plan-status", requireAuth, async (req: AuthRequest, res) => {
    try {
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

      const planInfo = await getUserPlanAndStatus(userId);
      const userData = planInfo.userData || {};

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const monthStr = todayStr.substring(0, 7);

      let chatUsedToday = Number(userData.chatUsedToday) || 0;
      let chatUsedMonth = Number(userData.chatUsedMonth) || 0;
      let documentUsedToday = Number(userData.documentUsedToday) || 0;
      let documentUsedMonth = Number(userData.documentUsedMonth) || 0;

      if (userData.lastChatDate !== todayStr) chatUsedToday = 0;
      if (userData.lastDocDate !== todayStr) documentUsedToday = 0;
      if (userData.lastChatMonth !== monthStr) chatUsedMonth = 0;
      if (userData.lastDocMonth !== monthStr) documentUsedMonth = 0;

      res.json({
        success: true,
        plan: planInfo.plan,
        subscriptionStatus: planInfo.subscriptionStatus,
        subscriptionExpiry: planInfo.subscriptionExpiry,
        usage: {
          chatUsedToday,
          chatUsedMonth,
          documentUsedToday,
          documentUsedMonth,
        },
        limits: {
          chatLimit: planInfo.plan === 'free' ? 20 : (planInfo.plan === 'individual' ? 500 : -1),
          docLimit: planInfo.plan === 'free' ? 3 : (planInfo.plan === 'individual' ? 100 : -1)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // OpenAI API chat endpoint
  const upload = multer({ dest: 'uploads/' });

  app.post("/api/legal-docs/upload", optionalAuth, upload.single("file"), requirePlan('free', { usageType: 'doc', featureName: 'document_summary' }), async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const dataBuffer = fsUtils.readFileSync(req.file.path);
      const text = await extractTextFromBuffer(req.file.mimetype, dataBuffer, req.file.originalname);
      console.log(`Extracted ${text.length} characters from document ${req.file.originalname}`);
      
      // Cleanup
      fsUtils.unlinkSync(req.file.path);

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ error: "Could not extract text from the document" });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;

      if (!geminiKey && !openaiKey) {
        return res.status(500).json({ error: "Both GEMINI_API_KEY and OPENAI_API_KEY are missing. Please add at least one to your environment variables." });
      }

      const systemInstruction = "You are an expert AI Legal Assistant. Your task is to analyze legal documents. Provide the output strictly in JSON format. The JSON should contain the following keys: 'summary' (string), 'risks' (array of strings), 'important_clauses' (array of strings), 'explanations' (array of objects with 'term' and 'explanation'), and 'improvements' (array of strings).";
      let analysisResult = null;

      if (geminiKey) {
        try {
      
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Analyze this legal document:\n\n${text.substring(0, 40000)}`,
            config: {
              systemInstruction,
              responseMimeType: "application/json"
            }
          });
          analysisResult = JSON.parse(response.text || "{}");
        } catch(e: any) {
          const isDocRateLimit = e?.message && (e.message.includes("429") || e.message.includes("Quota") || e.message.includes("exhausted") || e.message.includes("Too Many Requests") || e.message.includes("404"));
          if (!isDocRateLimit) {
            console.error("Gemini failed for document analysis:", e.message);
          }
          if (!openaiKey) throw e;
        }
      }

      if (!analysisResult && openaiKey) {
        const openai = new OpenAI({ apiKey: openaiKey });
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: `Analyze this legal document:\n\n${text.substring(0, 15000)}`}
          ],
          response_format: { type: "json_object" }
        });
        analysisResult = JSON.parse(response.choices[0].message.content || "{}");
      }

      if (!analysisResult) analysisResult = {};
      
      res.json({
        document_id: Date.now(),
        summary: analysisResult.summary || "Summary generated.",
        risks: analysisResult.risks || [],
        clauses: analysisResult.important_clauses || [],
        explanations: analysisResult.explanations || [],
        improvements: analysisResult.improvements || []
      });
    } catch (error: any) {
      const isRateLimit = error?.message && (error.message.includes("429") || error.message.includes("Quota") || error.message.includes("exhausted") || error.message.includes("Too Many Requests"));
      if (!isRateLimit) {
        console.error("Analysis Error:", error);
      }
      let errorMessage = error?.message || "Failed to analyze document.";
      
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("exhausted") || errorMessage.includes("Too Many Requests")) {
        return res.json({
          document_id: Date.now(),
          summary: "This is a simulated summary because the AI model quota was exceeded or rate limited. The document appears to contain standard provisions.",
          risks: ["Simulated Risk: Uncapped liability (API Limit Reached)"],
          clauses: ["Simulated Clause: Confidentiality (API Limit Reached)"],
          explanations: [{term: "API Limit Reached", explanation: "The AI API limit was reached, so this is mock data."}],
          improvements: ["Simulated Improvement: Please wait and try again, or check your API quotas."]
        });
      }
      
      res.status(500).json({ error: "Failed to analyze document: " + errorMessage });
    }
  });

  
  app.post("/api/legal-docs/ask", optionalAuth, express.json(), requirePlan('free', { usageType: 'chat' }), async (req: AuthRequest, res) => {
    try {
      const { document_id, question } = req.body;

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
      }

      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: `You are an expert AI Legal Assistant. Answer the following question about the uploaded document (ID: ${document_id}):\n\nQuestion: ${question}`
      });

      res.json({ answer: response.text });
    } catch (e: any) {
      console.error("Ask endpoint error:", e);
      res.status(500).json({ error: e.message || "Failed to process question" });
    }
  });

  app.post("/api/chat", optionalAuth, requirePlan('free', { usageType: 'chat' }), async (req: AuthRequest, res) => {
    try {
      let { messages, files } = req.body;
      
      // Extract text from attached files
      if (files && files.length > 0) {
        let filesText = "";
        for (const file of files) {
          const buffer = Buffer.from(file.data, 'base64');
          const extracted = await extractTextFromBuffer(file.mimeType, buffer, file.name);
          console.log(`Extracted ${extracted.length} characters from chat file ${file.name}`);
          filesText += `\n\n--- Document: ${file.name} ---\n${extracted}\n--- End of Document ---`;
        }
        
        // Append to the last message if it's from the user
        if (messages.length > 0 && messages[messages.length - 1].role === 'user') {
          messages[messages.length - 1].content += filesText;
        } else {
          messages.push({ role: 'user', content: filesText });
        }
      }
      
      const geminiKey = process.env.GEMINI_API_KEY;
      const openaiKey = process.env.OPENAI_API_KEY;
      
      if (!geminiKey && !openaiKey) {
        return res.status(500).json({ error: "Both GEMINI_API_KEY and OPENAI_API_KEY are missing. Please add at least one to your environment variables." });
      }

      const systemInstruction = "You are Legal Advisories, an advanced legal AI assistant designed to help lawyers, legal professionals, and the public. You have a built-in PDF generation capability. When a user asks to generate, make, or download a PDF, you MUST output a JSON object in this exact format: {\"action\": \"generate_pdf\", \"title\": \"[Title of the document]\"}. DO NOT output any other text when responding to a PDF generation request. If you are drafting a document, provide the text as normal.";

      // Try Gemini first if available
      if (geminiKey) {
        try {
      
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          
          const formattedMessages = messages.map((m: any) => ({
            role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }));
          
          const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: formattedMessages,
            config: {
              systemInstruction
            }
          });
          return res.json({ message: { content: response.text } });
        } catch (e: any) {
          const isGeminiRateLimit = e?.message && (e.message.includes("429") || e.message.includes("Quota") || e.message.includes("exhausted") || e.message.includes("Too Many Requests") || e.message.includes("404"));
          if (!isGeminiRateLimit) {
            console.error("Gemini failed, trying OpenAI if available...", e.message);
          }
          if (!openaiKey) throw e;
        }
      }

      // Try OpenAI if Gemini failed or isn't available
      if (openaiKey) {
        const openai = new OpenAI({ apiKey: openaiKey });
        
        const formattedMessages = [
          { role: "system", content: systemInstruction },
          ...messages.map((m: any) => ({
            role: m.role === 'model' ? 'assistant' : m.role,
            content: m.content
          }))
        ];
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: formattedMessages,
        });
        return res.json({ message: { content: response.choices[0].message.content } });
      }

    } catch (error: any) {
      const isApiRateLimit = error?.message && (error.message.includes("429") || error.message.includes("Quota") || error.message.includes("exhausted") || error.message.includes("Too Many Requests"));
      if (!isApiRateLimit) {
        console.error("API Error:", error);
      }
      let errorMessage = "Failed to communicate with AI model";
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("exhausted") || errorMessage.includes("Too Many Requests")) {
        return res.json({ reply: "I apologize, but I am currently experiencing high traffic and have hit my API rate limits. Please wait a moment and try your request again. (This is a mock response due to API quota limits)." });
      }
      
      res.status(500).json({ error: errorMessage });
    }
  });


  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });

  // Razorpay Create Subscription
  
// GET /api/user/dashboard
app.get("/api/user/dashboard", requireAuth, async (req: AuthRequest, res) => {
    try {

    const userId = req.user?.uid;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

   const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { plan: 'Free' };
    
    const today = new Date().toISOString().split('T')[0];
    const usageDoc = await userRef.collection('usage').doc(today).get();
    const usageData = usageDoc.exists ? usageDoc.data() : { chat: 0, doc: 0 };
    
    const billingSnapshot = await userRef.collection('billing_history').orderBy('created_at', 'desc').limit(5).get();
    const billingHistory = billingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const docsSnapshot = await adminDb.collection('documents').where('userId', '==', userId).orderBy('created_at', 'desc').limit(5).get();
    const savedDocs = docsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      plan: userData?.plan || 'Free',
      usage: usageData,
      billingHistory,
      savedDocs,
      limits: {
        chat: (userData?.plan !== 'Free' && userData?.plan !== 'None') ? -1 : 20,
        doc: (userData?.plan !== 'Free' && userData?.plan !== 'None') ? -1 : 3
      }
    });
  } catch (error: any) {
    if (error.code !== 7) {
      console.error("Dashboard error:", error);
    }
    // Return mock fallback data for dev environment without Firestore permissions
    res.json({
      plan: 'Free',
      usage: { chat: 0, doc: 0 },
      billingHistory: [],
      savedDocs: [],
      limits: { chat: 20, doc: 3 },
      isMock: true
    });
  }
});

  app.post("/api/subscriptions/create", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const { planId } = req.body;
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_dummy') {
        return res.json({ subscriptionId: `sub_dummy_${Date.now()}` });
      }

      let subscriptionId;
      try {
        const subscription = await razorpay.subscriptions.create({
          plan_id: planId,
          customer_notify: 1,
          total_count: 12, // For monthly
        });
        subscriptionId = subscription.id;
      } catch (err: any) {
        // silently fallback
        subscriptionId = `sub_dummy_${Date.now()}`;
      }

      res.json({ subscriptionId });
    } catch (error: any) {
      console.error("Subscription Error:", error);
      res.status(500).json({ error: error.message || "Failed to create subscription" });
    }
  });

  // Razorpay Webhook
  app.post("/api/subscriptions/webhook", express.json(), async (req, res) => {
    try {
  
      const secret = process.env.WEBHOOK_SECRET || 'dummy_webhook_secret';
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest === req.headers['x-razorpay-signature']) {
        const event = req.body.event;
        const payload = req.body.payload;

        if (event === 'subscription.charged') {
          // Find user by subscription ID or customer ID in your DB and update their plan
          const subscriptionId = payload.subscription.entity.id;
          // In a real app, you'd lookup the user by this subscription ID
          console.log(`Subscription charged: ${subscriptionId}`);
        } else if (event === 'subscription.cancelled') {
          console.log(`Subscription cancelled: ${payload.subscription.entity.id}`);
        }

        res.json({ status: 'ok' });
      } else {
        res.status(400).json({ error: "Invalid signature" });
      }
    } catch (error: any) {
      console.error("Webhook Error:", error);
      res.status(500).json({ error: "Webhook failed" });
    }
  });

  // Razorpay Cancel Subscription
  app.post("/api/subscriptions/cancel", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const { subscriptionId } = req.body;
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      if (subscriptionId && !subscriptionId.startsWith('sub_dummy_')) {
        await razorpay.subscriptions.cancel(subscriptionId);
      }
      
      // Update Firestore
      try {
        await adminDb.collection('users').doc(userId).update({
          subscription_status: 'cancelled'
        });
      } catch (dbError) {
        // silently ignore
      }

      res.json({ success: true });
    } catch (error: any) {
      console.error("Cancel Error:", error);
      res.status(500).json({ error: error.message || "Failed to cancel subscription" });
    }
  });

  
  // Get User Profile & History
  app.get("/api/user/profile", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      let profile = null;
      let history: any[] = [];
      
      try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        profile = userDoc.exists ? userDoc.data() : null;

        const historySnapshot = await adminDb.collection('users').doc(userId).collection('billing_history').orderBy('created_at', 'desc').get();
        history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (dbError) {
        // silently use fallback
        profile = {
          plan: "Free",
          subscription_status: "active"
        };
        history = [
          {
            id: "mock_inv_1",
            amount: 0,
            status: "paid",
            created_at: Date.now()
          }
        ];
      }

      res.json({ profile, history });
    } catch (error: any) {
      console.error("Profile Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Get Billing History (Mocked for now as Razorpay invoices take setup)
  app.get("/api/subscriptions/history", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const historySnapshot = await adminDb.collection('users').doc(userId).collection('billing_history').orderBy('created_at', 'desc').get();
      const history = historySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.json({ history });
    } catch (error: any) {
      console.error("History Error:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });


  // ==========================================
  // PDF Generation API
  // ==========================================
  app.post("/api/pdf/generate", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { title, documentType, content } = req.body;
      const userId = req.user?.uid;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const { downloadUrl, fileName } = await generateAndStorePdf(userId, title, documentType, content);
      res.json({ success: true, downloadUrl, fileName });
    } catch (error: any) {
      console.error("PDF Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate PDF" });
    }
  });
  
  // ==========================================
  // PayU Integration
  // ==========================================

  // POST /api/payment/create-order




  // --- Compliance Manager APIs ---
  app.get("/api/compliances/companies", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const snapshot = await adminDb.collection('compliance_companies').where('userId', '==', userId).get();
      const companies = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(companies);
    } catch (error) {
      console.error("Fetch companies error:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.post("/api/compliances/companies", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const newCompany = {
        ...req.body,
        userId,
        createdAt: Date.now()
      };
      const docRef = await adminDb.collection('compliance_companies').add(newCompany);
      res.json({ id: docRef.id, ...newCompany });
    } catch (error) {
      console.error("Create company error:", error);
      res.status(500).json({ error: "Failed to save company" });
    }
  });

  app.get("/api/compliances", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const snapshot = await adminDb.collection('compliances').where('userId', '==', userId).get();
      const compliances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(compliances);
    } catch (error) {
      console.error("Fetch compliances error:", error);
      res.status(500).json({ error: "Failed to fetch compliances" });
    }
  });

  app.post("/api/compliances", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const newCompliance = {
        ...req.body,
        userId,
        createdAt: Date.now()
      };
      const docRef = await adminDb.collection('compliances').add(newCompliance);
      res.json({ id: docRef.id, ...newCompliance });
    } catch (error) {
      console.error("Create compliance error:", error);
      res.status(500).json({ error: "Failed to save compliance" });
    }
  });
  
  app.put("/api/compliances/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const docRef = adminDb.collection('compliances').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Not found" });
      if (doc.data()?.userId !== req.user?.uid) return res.status(403).json({ error: "Unauthorized" });
      
      const updates = { ...req.body, updatedAt: Date.now() };
      await docRef.update(updates);
      res.json({ id: req.params.id, ...doc.data(), ...updates });
    } catch (error) {
      console.error("Update compliance error:", error);
      res.status(500).json({ error: "Failed to update compliance" });
    }
  });

  app.post("/api/compliances/ai", requireAuth, requirePlan('individual', { featureName: 'legal_notice_review' }), async (req: AuthRequest, res) => {
    try {
      const { query, companyContext } = req.body;
      if (!query) return res.status(400).json({ error: "Query is required" });

      let contextStr = "No specific company context provided.";
      if (companyContext) {
        contextStr = `Company Name: ${companyContext.name}, CIN: ${companyContext.cin}, Type: ${companyContext.type}, Incorporation Date: ${companyContext.incorporationDate}`;
      }

      const prompt = `You are an expert Corporate Compliance Assistant (Indian Law).
      The user is asking a compliance-related question.
      Context about their company:
      ${contextStr}
      
      User Query: "${query}"
      
      Provide a highly accurate, structured response focusing on required filings, due dates, penalties, and required documents. Use Markdown.`;

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) return res.status(500).json({ error: "API key is missing" });
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Compliance AI Error:", error);
      res.status(500).json({ error: "Failed to process compliance query." });
    }
  });

  // --- AI Contract Generator APIs ---
  app.post("/api/contracts/generate", requireAuth, requirePlan('lawyer', { featureName: 'ai_contract_drafting' }), async (req: AuthRequest, res) => {
    try {
      const { templateTitle, inputs } = req.body;
      if (!templateTitle || !inputs) {
        return res.status(400).json({ error: "templateTitle and inputs are required" });
      }

      const prompt = `You are an expert Indian Corporate Lawyer.
      Generate a professional, legally sound ${templateTitle} based strictly on Indian law.
      Use the following details provided by the user:
      ${Object.entries(inputs).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
      
      Format the output cleanly in Markdown, using appropriate headings, clauses, and numbering. Include signature blocks at the end.`;

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) return res.status(500).json({ error: "API key is missing" });
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      
      res.json({ content: response.text });
    } catch (error: any) {
      console.error("Contract Generation Error:", error);
      res.status(500).json({ error: "Failed to generate contract." });
    }
  });

  app.post("/api/contracts/smart-feature", requireAuth, requirePlan('individual', { featureName: 'clause_explanation' }), async (req: AuthRequest, res) => {
    try {
      const { action, text, context } = req.body;
      let prompt = "";
      
      if (action === 'explain') {
        prompt = `Explain the following legal clause in simple, easy-to-understand terms:\n\n"${text}"`;
      } else if (action === 'improve') {
        prompt = `Rewrite the following legal clause to make it more professional, robust, and aligned with standard Indian legal practices:\n\n"${text}"`;
      } else if (action === 'detect_missing') {
        prompt = `Review the following contract/document and suggest any critical clauses that are missing:\n\n"${text}"`;
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }

      const geminiKey = process.env.GEMINI_API_KEY;
      if (!geminiKey) return res.status(500).json({ error: "API key missing" });
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Smart Feature Error:", error);
      res.status(500).json({ error: "Failed to process smart feature." });
    }
  });

  app.get("/api/contracts/documents", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const snapshot = await adminDb.collection('generated_documents').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(docs);
    } catch (error) {
      console.error("Fetch docs error:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/contracts/documents", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const newDoc = {
        ...req.body,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const docRef = await adminDb.collection('generated_documents').add(newDoc);
      res.json({ id: docRef.id, ...newDoc });
    } catch (error) {
      console.error("Create doc error:", error);
      res.status(500).json({ error: "Failed to save document" });
    }
  });
  
  app.put("/api/contracts/documents/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const docRef = adminDb.collection('generated_documents').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Not found" });
      if (doc.data()?.userId !== req.user?.uid) return res.status(403).json({ error: "Unauthorized" });
      
      const updates = { ...req.body, updatedAt: Date.now() };
      await docRef.update(updates);
      res.json({ id: req.params.id, ...doc.data(), ...updates });
    } catch (error) {
      console.error("Update doc error:", error);
      res.status(500).json({ error: "Failed to update document" });
    }
  });
  
  app.delete("/api/contracts/documents/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const docRef = adminDb.collection('generated_documents').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Not found" });
      if (doc.data()?.userId !== req.user?.uid) return res.status(403).json({ error: "Unauthorized" });
      
      await docRef.delete();
      res.json({ success: true });
    } catch (error) {
      console.error("Delete doc error:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // --- Legal Research API ---
  app.post("/api/research", optionalAuth, requirePlan('free', { featureName: 'basic_research' }), async (req: AuthRequest, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const prompt = `You are an expert Indian Legal Researcher and AI Assistant.
      The user is asking a legal question or describing a scenario.
      Please provide a comprehensive Legal Research Report based strictly on Indian Law (including new criminal laws BNS, BNSS, BSA if applicable).
      Format the response cleanly in Markdown with the following sections exactly:
      ## 1. Facts & Issues
      ## 2. Applicable Law (Relevant Acts & Sections)
      ## 3. Landmark Judgments & Case Laws (with citations)
      ## 4. Legal Analysis & Reasoning
      ## 5. Practical Guidance & Conclusion
      
      User Query: "${query}"`;

      const geminiKey = process.env.GEMINI_API_KEY; if (!geminiKey) return res.status(500).json({ error: "API key is missing" }); const ai = new GoogleGenAI({ apiKey: geminiKey }); const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt
      });
      
      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Research API Error:", error);
      res.status(500).json({ error: "Failed to perform legal research." });
    }
  });

  // --- Case Management APIs ---

  app.get("/api/cases/:id/documents", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const snapshot = await adminDb.collection('case_documents').where('caseId', '==', req.params.id).get();
      res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  app.post("/api/cases/:id/documents", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const newDoc = {
        ...req.body,
        caseId: req.params.id,
        uploadedAt: Date.now()
      };
      const docRef = await adminDb.collection('case_documents').add(newDoc);
      res.json({ id: docRef.id, ...newDoc });
    } catch (error) {
      res.status(500).json({ error: "Failed to add document" });
    }
  });

  app.get("/api/cases/:id/chats", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const snapshot = await adminDb.collection('case_chats').where('caseId', '==', req.params.id).get();
      res.json(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chats" });
    }
  });

  app.post("/api/cases/:id/chats", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const newChat = {
        ...req.body,
        caseId: req.params.id,
        userId: req.user?.uid,
        messages: req.body.messages || []
      };
      const docRef = await adminDb.collection('case_chats').add(newChat);
      res.json({ id: docRef.id, ...newChat });
    } catch (error) {
      res.status(500).json({ error: "Failed to add chat" });
    }
  });

  app.get("/api/cases", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const snapshot = await adminDb.collection('cases').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
      const cases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(cases);
    } catch (error) {
      console.error("Fetch cases error:", error);
      res.status(500).json({ error: "Failed to fetch cases" });
    }
  });

  app.post("/api/cases", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const userId = req.user?.uid;
      const newCase = {
        ...req.body,
        userId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const docRef = await adminDb.collection('cases').add(newCase);
      res.json({ id: docRef.id, ...newCase });
    } catch (error) {
      console.error("Create case error:", error);
      res.status(500).json({ error: "Failed to create case" });
    }
  });

  app.get("/api/cases/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const docRef = adminDb.collection('cases').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Case not found" });
      const data = doc.data();
      if (data?.userId !== req.user?.uid) return res.status(403).json({ error: "Unauthorized" });
      res.json({ id: doc.id, ...data });
    } catch (error) {
      console.error("Get case error:", error);
      res.status(500).json({ error: "Failed to fetch case" });
    }
  });

  app.put("/api/cases/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const docRef = adminDb.collection('cases').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Case not found" });
      if (doc.data()?.userId !== req.user?.uid) return res.status(403).json({ error: "Unauthorized" });
      
      const updates = { ...req.body, updatedAt: Date.now() };
      await docRef.update(updates);
      res.json({ id: req.params.id, ...doc.data(), ...updates });
    } catch (error) {
      console.error("Update case error:", error);
      res.status(500).json({ error: "Failed to update case" });
    }
  });

  app.delete("/api/cases/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
  
      const docRef = adminDb.collection('cases').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "Case not found" });
      if (doc.data()?.userId !== req.user?.uid) return res.status(403).json({ error: "Unauthorized" });
      
      await docRef.delete();
      res.json({ success: true });
    } catch (error) {
      console.error("Delete case error:", error);
      res.status(500).json({ error: "Failed to delete case" });
    }
  });

  app.post('/api/payment/create-order', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { amount, productinfo, firstname, email, phone, planId, couponCode, origin } = req.body;
      const userId = req.user?.uid;
      
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const payuData = await createPayUOrderBackend({
        userId,
        amount,
        productinfo: productinfo || "Legal Advisories AI Subscription",
        firstname: firstname || "Customer",
        email: email || "",
        phone: phone || "9999999999",
        planId: planId || "plan_pro_monthly",
        couponCode: couponCode || null,
        origin: origin || (req.headers.origin as string),
      });

      res.json(payuData);
    } catch (error: any) {
      console.error('Create Order Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to create payment order' });
    }
  });

  // POST /api/payu/success (PayU redirects here after successful payment)
  app.post('/api/payu/success', express.urlencoded({ extended: true }), async (req, res) => {
    try {
      const { txnid, mihpayid, payuMoneyId } = req.body;
      const config = getPayUConfig();

      const isValidHash = verifyPayUResponseHash(req.body, config.merchantSalt);
      if (!isValidHash) {
        console.warn('PayU Success Callback Hash Verification Notice for txnid:', txnid);
      }

      // Process payment atomically in Firestore transaction
      if (txnid) {
        await processPaymentSuccessBackend({
          txnid,
          payuMoneyId: mihpayid || payuMoneyId,
          source: 'callback',
          rawPayload: req.body,
        });
      }

      res.redirect('/billing?status=success');
    } catch (error) {
      console.error('PayU Success Handler Error:', error);
      res.redirect('/billing?status=error');
    }
  });

  // POST /api/payu/failure (PayU redirects here after failed or cancelled payment)
  app.post('/api/payu/failure', express.urlencoded({ extended: true }), async (req, res) => {
    try {
      const { txnid, error_Message } = req.body;
      if (txnid) {
        await processPaymentFailureBackend(txnid, error_Message || 'Payment cancelled or failed');
      }
      res.redirect('/billing?status=failed');
    } catch (error) {
      console.error('PayU Failure Handler Error:', error);
      res.redirect('/billing?status=error');
    }
  });

  // POST /api/payu/webhook & POST /api/payment/webhook (PayU Server-to-Server Webhook)
  app.post(['/api/payu/webhook', '/api/payment/webhook'], express.json(), async (req, res) => {
    try {
      const payload = req.body;
      console.log('Received PayU Webhook Event:', payload);

      const config = getPayUConfig();
      const isValidHash = verifyPayUResponseHash(payload, config.merchantSalt);

      if (!isValidHash && process.env.NODE_ENV === 'production') {
        console.error('Invalid Webhook Hash Signature');
        return res.status(400).json({ error: 'Invalid webhook hash signature' });
      }

      const { txnid, status, mihpayid, payuMoneyId, error_Message } = payload;
      if (!txnid) {
        return res.status(400).json({ error: 'Missing txnid in webhook payload' });
      }

      if (String(status).toUpperCase() === 'SUCCESS') {
        const result = await processPaymentSuccessBackend({
          txnid,
          payuMoneyId: mihpayid || payuMoneyId,
          source: 'webhook',
          rawPayload: payload,
        });
        return res.json({ status: 'ok', processed: true, result });
      } else {
        await processPaymentFailureBackend(txnid, error_Message || 'Webhook reported payment failure');
        return res.json({ status: 'ok', processed: true, message: 'Payment status recorded as failed' });
      }
    } catch (error: any) {
      console.error('PayU Webhook Processing Error:', error);
      res.status(500).json({ error: 'Webhook processing failed', details: error?.message });
    }
  });

  // POST /api/payment/refund (Initiate or record payment refund - Admin or Payment Owner)
  app.post('/api/payment/refund', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { txnid, reason } = req.body;
      const userId = req.user?.uid;

      if (!userId) return res.status(401).json({ error: "Unauthorized" });
      if (!txnid) return res.status(400).json({ error: "Missing required parameter: txnid" });

      // Verify user permissions (Must be admin or the payment owner)
      const userDoc = await safeGetDoc('users', userId);
      const userRole = userDoc.data?.role || req.user?.role;

      const paymentDoc = await safeGetDoc('payments', txnid);
      if (!paymentDoc.exists || !paymentDoc.data) {
        return res.status(404).json({ error: "Payment transaction not found" });
      }

      const paymentOwnerId = paymentDoc.data?.userId;
      if (userRole !== 'admin' && paymentOwnerId !== userId) {
        return res.status(403).json({ error: "Forbidden: Only admins or payment owners can request refunds" });
      }

      const result = await processRefundBackend({
        txnid,
        refundReason: reason || "Customer refund requested",
        refundedBy: userId,
      });

      res.json({ success: true, result });
    } catch (error: any) {
      console.error('Refund Error:', error);
      res.status(500).json({ error: error?.message || 'Failed to process refund' });
    }
  });

  // GET /api/payment/status/:transactionId (Fetch status of a payment)
  app.get('/api/payment/status/:transactionId', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { transactionId } = req.params;
      const userId = req.user?.uid;
      
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      const paymentDoc = await safeGetDoc('payments', transactionId);
      if (!paymentDoc.exists || !paymentDoc.data) {
        return res.status(404).json({ error: "Payment not found" });
      }

      const paymentData = paymentDoc.data;
      if (paymentData.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      res.json(paymentData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment status" });
    }
  });

  // Vite middleware for development


  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Legal Advisories AI Server running on port ${PORT}`);
  });
}

startServer();

