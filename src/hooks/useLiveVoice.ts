import { useState, useRef, useCallback } from 'react';

// Helper to convert Float32Array to base64 for 16-bit PCM
function pcmToBase64(channelData: Float32Array): string {
  const length = channelData.length;
  const buffer = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    // scale to 16-bit
    let s = Math.max(-1, Math.min(1, channelData[i]));
    buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // convert to uint8 array to base64
  const bytes = new Uint8Array(buffer.buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function useLiveVoice() {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'interrupted' | 'error' | 'disconnected'>('idle');
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  
  const nextStartTimeRef = useRef<number>(0);
  const audioEndTimeoutRef = useRef<any>(null);

  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    if (audioEndTimeoutRef.current) {
       clearTimeout(audioEndTimeoutRef.current);
    }
    setVoiceState('idle');
    setIsVoiceMode(false);
    console.log("[VOICE] Live session closed and cleaned up");
  }, []);

  const playAudioChunk = useCallback((audioCtx: AudioContext, base64Audio: string) => {
    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const buffer = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(buffer.length);
      for (let i = 0; i < buffer.length; i++) {
        float32Data[i] = buffer[i] / 32768.0;
      }
      
      const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
         nextStartTimeRef.current = currentTime;
      }
      
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      
      // Update UI state to speaking
      setVoiceState('speaking');
      
      if (audioEndTimeoutRef.current) {
          clearTimeout(audioEndTimeoutRef.current);
      }
      
      const timeUntilEndMs = (nextStartTimeRef.current - currentTime) * 1000;
      audioEndTimeoutRef.current = setTimeout(() => {
          setVoiceState('listening');
      }, timeUntilEndMs);
      
    } catch (e) {
      console.error("[VOICE] Error playing audio chunk", e);
    }
  }, []);

  const startVoiceMode = useCallback(async (initialContext?: string) => {
    try {
      console.log("[VOICE] button clicked");
      console.log("[VOICE] microphone permission requested");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      console.log("[VOICE] microphone permission granted");
      streamRef.current = stream;
      
      setVoiceState('connecting');
      setIsVoiceMode(true);
      console.log("[VOICE] Live session connecting");
      
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
         console.log("[VOICE] Live session connected");
         console.log("[VOICE] microphone streaming started");
         
         const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
         inputAudioCtxRef.current = inputAudioCtx;
         
         const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
         outputAudioCtxRef.current = outputAudioCtx;
         nextStartTimeRef.current = outputAudioCtx.currentTime;
         
         const source = inputAudioCtx.createMediaStreamSource(stream);
         sourceRef.current = source;
         const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
         processorRef.current = processor;
         
         source.connect(processor);
         processor.connect(inputAudioCtx.destination);
         
         processor.onaudioprocess = (e) => {
           const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
           if (ws.readyState === WebSocket.OPEN) {
             ws.send(JSON.stringify({ audio: base64 }));
           }
         };
         
         if (initialContext) {
            ws.send(JSON.stringify({ clientContent: initialContext }));
         }
         
         setVoiceState('listening');
      };
      
      ws.onmessage = (event) => {
         try {
           const msg = JSON.parse(event.data);
           if (msg.audio && outputAudioCtxRef.current) {
             playAudioChunk(outputAudioCtxRef.current, msg.audio);
           }
           if (msg.interrupted) {
              console.log("[VOICE] user interrupted AI");
              setVoiceState('interrupted');
              // Clear queue by resetting audio context
              if (outputAudioCtxRef.current) {
                 outputAudioCtxRef.current.close().catch(()=>{});
                 outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                 nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
              }
              setTimeout(() => {
                 setVoiceState('listening');
              }, 500);
           }
           if (msg.error) {
              console.error("[VOICE] Live session error msg from server", msg.error);
              setVoiceState('error');
           }
         } catch(e) {
            console.error("[VOICE] Error parsing ws message from server", e);
         }
      };
      
      ws.onerror = (e) => {
         console.error("[VOICE] Live session failed", e);
         setVoiceState('error');
      };
      
      ws.onclose = () => {
         console.log("[VOICE] Live session closed");
         cleanup();
      };
      
    } catch(err) {
      console.error("[VOICE] mic permission denied or connection error", err);
      setVoiceState('error');
      alert("Microphone access is required and could not be established.");
      cleanup();
    }
  }, [cleanup, playAudioChunk]);

  return {
    isVoiceMode,
    voiceState,
    startVoiceMode,
    stopVoiceMode: cleanup
  };
}
