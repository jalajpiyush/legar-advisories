from openai import OpenAI
import os
import json

# Initialize OpenAI client. 
# It automatically uses OPENAI_API_KEY from environment variables if not passed explicitly.
# We initialize it conditionally to not break the app if the key is missing in development.
api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

def generate_embedding(text: str) -> list[float]:
    if not client:
        return [0.0] * 768 # Match DB schema
    
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
        dimensions=768 # Force 768 dimensions to match the existing pgvector column
    )
    return response.data[0].embedding

def generate_summary(text: str) -> str:
    if not client:
        return "This is a summary of the document (Mock response - OPENAI_API_KEY not set)."
        
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a legal document summarizer."},
            {"role": "user", "content": f"Summarize this legal document:\n\n{text[:15000]}"}
        ]
    )
    return response.choices[0].message.content

def extract_clauses_and_risks(text: str):
    if not client:
        return {"clauses": ["Confidentiality", "Termination"], "risks": ["High liability cap"]}
        
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a legal expert. Extract key clauses and highlight risks from the document. Return ONLY valid JSON in this format: {\"clauses\": [\"Clause 1\"], \"risks\": [\"Risk 1\"]}."},
                {"role": "user", "content": f"Extract clauses and highlight risks from this legal text:\n\n{text[:15000]}"}
            ],
            response_format={ "type": "json_object" }
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error extracting clauses: {e}")
        return {"clauses": [], "risks": []}

def answer_question_with_context(question: str, context: list[str]) -> str:
    if not client:
        return "Based on the document, here is the answer (Mock response - OPENAI_API_KEY not set)."
        
    context_str = "\n\n".join(context)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a legal assistant. Answer the user's question based ONLY on the provided context."},
            {"role": "user", "content": f"Context:\n{context_str}\n\nQuestion: {question}"}
        ]
    )
    return response.choices[0].message.content
