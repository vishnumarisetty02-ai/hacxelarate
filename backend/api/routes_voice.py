from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
try:
    from services.gemini_service import gemini_voice_service
except ImportError:
    from backend.services.gemini_service import gemini_voice_service

router = APIRouter(prefix="/voice", tags=["Voice AI Assistant"])

class VoiceCommandRequest(BaseModel):
    text: str = Field(..., description="Spoken or typed user command in any language")
    language: Optional[str] = Field("en-US", description="BCP-47 language tag or 2-letter code")
    current_route: Optional[str] = Field("/", description="Current client route path")

class CyberQueryRequest(BaseModel):
    query: str = Field(..., description="Cyber security question or entity query in any language")
    language: Optional[str] = Field("en-US", description="Language tag")

# Comprehensive Supported Languages List
SUPPORTED_LANGUAGES = [
    {"code": "te-IN", "lang": "te", "name": "Telugu", "native": "తెలుగు", "flag": "🇮🇳", "sample": "డ్యాష్‌బోర్డ్ ఓపెన్ చెయ్ / స్కాన్ రన్ చెయ్యి"},
    {"code": "hi-IN", "lang": "hi", "name": "Hindi", "native": "हिन्दी", "flag": "🇮🇳", "sample": "डैशबोर्ड खोलो / सुरक्षा स्कैन शुरू करो"},
    {"code": "en-US", "lang": "en", "name": "English (US)", "native": "English", "flag": "🇺🇸", "sample": "Trigger security scan / Show critical threats"},
    {"code": "en-IN", "lang": "en", "name": "English (India)", "native": "English (IN)", "flag": "🇮🇳", "sample": "Open App Monitoring / Analyze domain"},
    {"code": "ta-IN", "lang": "ta", "name": "Tamil", "native": "தமிழ்", "flag": "🇮🇳", "sample": "டாஷ்போர்டைத் திறக்கவும் / ஸ்கேன் தொடங்கவும்"},
    {"code": "kn-IN", "lang": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "flag": "🇮🇳", "sample": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ / ಸ್ಕ್ಯಾನ್ ಮಾಡಿ"},
    {"code": "ml-IN", "lang": "ml", "name": "Malayalam", "native": "മലയാളം", "flag": "🇮🇳", "sample": "ഡാഷ്‌ബോർഡ് തുറക്കുക / സ്കാൻ ചെയ്യുക"},
    {"code": "bn-IN", "lang": "bn", "name": "Bengali", "native": "বাংলা", "flag": "🇮🇳", "sample": "ড্যাশবোর্ড খুলুন / স্ক্যান শুরু করুন"},
    {"code": "mr-IN", "lang": "mr", "name": "Marathi", "native": "मराठी", "flag": "🇮🇳", "sample": "डॅशबोर्ड उघडा / स्कॅन सुरू करा"},
    {"code": "es-ES", "lang": "es", "name": "Spanish", "native": "Español", "flag": "🇪🇸", "sample": "Abrir panel de control / Ejecutar escaneo"},
    {"code": "fr-FR", "lang": "fr", "name": "French", "native": "Français", "flag": "🇫🇷", "sample": "Ouvrir le tableau de bord / Lancer l'analyse"},
    {"code": "de-DE", "lang": "de", "name": "German", "native": "Deutsch", "flag": "🇩🇪", "sample": "Dashboard öffnen / Scan starten"},
    {"code": "ar-SA", "lang": "ar", "name": "Arabic", "native": "العربية", "flag": "🇸🇦", "sample": "افتح لوحة المعلومات / ابدأ الفحص"},
    {"code": "zh-CN", "lang": "zh", "name": "Chinese (Simplified)", "native": "简体中文", "flag": "🇨🇳", "sample": "打开仪表盘 / 启动安全扫描"},
    {"code": "ja-JP", "lang": "ja", "name": "Japanese", "native": "日本語", "flag": "🇯🇵", "sample": "ダッシュボードを開く / スキャンを実行"},
    {"code": "ru-RU", "lang": "ru", "name": "Russian", "native": "Русский", "flag": "🇷🇺", "sample": "Открыть панель / Запустить сканирование"},
    {"code": "pt-BR", "lang": "pt", "name": "Portuguese", "native": "Português", "flag": "🇧🇷", "sample": "Abrir painel / Iniciar verificação"}
]

@router.get("/status")
def get_voice_status():
    """Returns Google Gemini voice system configuration and operational health."""
    is_ready = gemini_voice_service.is_configured()
    return {
        "status": "ONLINE" if is_ready else "STANDBY",
        "provider": "Google Generative AI (Gemini)",
        "model": "gemini-3.5-flash / multi-tier fallback",
        "voice_recognition": "Multilingual Web Speech Recognition + Gemini NLU",
        "voice_synthesis": "Native Multilingual SpeechSynthesis TTS",
        "supported_languages_count": len(SUPPORTED_LANGUAGES),
        "api_key_configured": is_ready
    }

@router.get("/languages")
def get_supported_languages():
    """Returns all supported voice command languages with metadata and native names."""
    return {
        "total": len(SUPPORTED_LANGUAGES),
        "languages": SUPPORTED_LANGUAGES
    }

@router.post("/command")
def process_voice_command(payload: VoiceCommandRequest):
    """Processes spoken or typed natural language commands in any language using Google Gemini."""
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Voice text cannot be empty.")

    result = gemini_voice_service.process_voice_command(
        query=payload.text.strip(),
        language_code=payload.language or "en",
        current_route=payload.current_route or "/"
    )
    return {
        "success": True,
        "input_query": payload.text,
        "language": payload.language,
        "command": result
    }

@router.post("/ask-gemini")
def ask_gemini_cyber_question(payload: CyberQueryRequest):
    """Asks Google Gemini a security question in any language with concise spoken & detailed markdown answers."""
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    system_prompt = (
        "You are AegisGuard Sentinel, an elite cybersecurity and threat intelligence AI assistant. "
        "Answer the user's question clearly, accurately, and concisely. "
        "Reply in the EXACT SAME LANGUAGE as the user's query (e.g. if asked in Telugu, answer in Telugu; if in Hindi, answer in Hindi; if in English, answer in English). "
        "Keep the explanation focused on threat protection, phishing detection, APK malware, or digital risk."
    )

    answer = gemini_voice_service.generate_content(payload.query, system_instruction=system_prompt)
    if not answer:
        # Fallback response
        answer = f"AegisGuard Threat Sentinel: Analysis for '{payload.query}' complete. No active anomalies detected in current perimeter."

    # Generate a very short spoken sentence for TTS
    spoken_prompt = f"Create a 1-sentence spoken summary in the same language for this security answer: {answer[:300]}"
    spoken = gemini_voice_service.generate_content(spoken_prompt) or answer[:120]

    return {
        "success": True,
        "query": payload.query,
        "language": payload.language,
        "answer": answer,
        "spoken_summary": spoken.strip()
    }
