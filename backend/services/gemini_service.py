import os
import json
import re
import requests
from typing import Dict, Any, Optional

# Supported fallback models in priority order
GEMINI_MODELS = [
    os.getenv("GEMINI_MODEL", "gemini-3.5-flash"),
    "gemini-3.5-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-latest"
]

class GeminiVoiceService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 10)

    def generate_content(self, prompt: str, system_instruction: Optional[str] = None) -> Optional[str]:
        """Calls Google Generative Language API with automatic model fallback."""
        if not self.is_configured():
            return None

        headers = {
            "Content-Type": "application/json"
        }

        contents = []
        if system_instruction:
            contents.append({
                "role": "user",
                "parts": [{"text": f"SYSTEM INSTRUCTION: {system_instruction}\n\nUSER PROMPT: {prompt}"}]
            })
        else:
            contents.append({
                "role": "user",
                "parts": [{"text": prompt}]
            })

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 1024
            }
        }

        for model in GEMINI_MODELS:
            url = f"{self.base_url}/{model}:generateContent?key={self.api_key}"
            try:
                response = requests.post(url, headers=headers, json=payload, timeout=12)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"]
                elif response.status_code in [404, 429, 503]:
                    # Model not available or temporarily overloaded, fallback to next
                    continue
            except Exception as e:
                continue

        return None

    def process_voice_command(self, query: str, language_code: str = "en", current_route: str = "/") -> Dict[str, Any]:
        """
        Interprets user voice command in ANY language (Telugu, Hindi, English, etc.)
        and maps to navigation or actionable security tasks with spoken feedback.
        """
        system_instruction = (
            "You are AegisGuard's Multilingual Cyber Security Voice Assistant. "
            "You control the Digital Risk Protection SOC web application. "
            "The available application routes are:\n"
            "- '/' (Threat Overview / Dashboard)\n"
            "- '/brand-setup' (Brand Profile & Monitoring Settings)\n"
            "- '/social-monitoring' (Social Media Impersonation & Fake Profile Monitoring)\n"
            "- '/app-monitoring' (Suspicious Mobile Apps & APK Analysis)\n"
            "- '/url-monitoring' (Phishing Domains & Typosquatting Monitoring)\n"
            "- '/campaigns' (Attack Campaigns & Threat Actor Clusters)\n"
            "- '/intelligence' (Threat Intelligence Hub & MITRE ATT&CK Matrix)\n"
            "- '/reports' (Compliance & Security Audit Reports)\n\n"
            "Actions you can perform:\n"
            "- 'TRIGGER_SCAN': Trigger a live security scan across all surface vectors\n"
            "- 'FILTER_CRITICAL': Filter threats by CRITICAL severity\n"
            "- 'SHOW_ALERTS': Open threat alerts drawer\n"
            "- 'CHECK_STATUS': Report the real-time defense shield status\n"
            "- 'CYBER_QUESTION': Answer a cybersecurity/threat question\n\n"
            "IMPORTANT: Always reply in JSON format ONLY, without markdown code fences:\n"
            "{\n"
            '  "intent": "NAVIGATE" | "TRIGGER_SCAN" | "FILTER_CRITICAL" | "SHOW_ALERTS" | "CHECK_STATUS" | "CYBER_QUESTION",\n'
            '  "target_route": "/path" or null,\n'
            '  "action": action string or null,\n'
            '  "spoken_response": "Short natural response to be spoken aloud in the user\'s spoken language (e.g. Telugu if query was Telugu, Hindi if Hindi, English if English)",\n'
            '  "display_text": "Clean explanation or status for display on screen",\n'
            '  "detected_language": "language code e.g. te, hi, en, ta, es, fr"\n'
            "}"
        )

        prompt = (
            f"User Voice Query: \"{query}\"\n"
            f"Client language code: \"{language_code}\"\n"
            f"Current active route: \"{current_route}\"\n"
            "Return valid JSON only."
        )

        raw_output = self.generate_content(prompt, system_instruction=system_instruction)

        if raw_output:
            try:
                # Clean possible codeblock wrappers
                cleaned = raw_output.strip()
                if cleaned.startswith("```"):
                    cleaned = re.sub(r"^```(?:json)?\n?", "", cleaned)
                    cleaned = re.sub(r"\n?```$", "", cleaned)
                parsed = json.loads(cleaned)
                return parsed
            except Exception:
                pass

        # Robust multilingual fallback if API is unreachable or format error
        return self._rule_based_fallback(query, language_code)

    def _rule_based_fallback(self, query: str, language_code: str) -> Dict[str, Any]:
        """Zero-latency rule-based multilingual fallback."""
        q = query.lower()

        # Telugu checks
        is_te = language_code.startswith("te") or any(c in query for c in "తెలుగుడ్యాష్‌బోర్డ్‌స్కాన్యాప్ఫిషింగ్")
        # Hindi checks
        is_hi = language_code.startswith("hi") or any(c in query for c in "डैशबोर्डस्कैनखतरे")

        # 1. Trigger Scan
        if any(w in q for w in ["scan", "స్కాన్", "రన్ స్కాన్", "స్కానింగ్", "स्कैन", "सर्च", "analiz"]):
            return {
                "intent": "TRIGGER_SCAN",
                "target_route": None,
                "action": "TRIGGER_SCAN",
                "spoken_response": "డిజిటల్ థ్రెట్ స్కాన్ ప్రారంభించబడింది." if is_te else ("सुरक्षा स्कैन शुरू कर दिया गया है।" if is_hi else "Security scan initiated across all vectors."),
                "display_text": "Live digital risk scan triggered across web, social, mobile APK, and domain assets.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 2. Critical Threats
        if any(w in q for w in ["critical", "high threat", "క్రిటికల్", "ప్రమాదకర", "తీవ్రమైన", "गंभीर", "खतरे", "danger"]):
            return {
                "intent": "FILTER_CRITICAL",
                "target_route": "/",
                "action": "FILTER_CRITICAL",
                "spoken_response": "క్రిటికల్ థ్రెట్స్ ఫిల్టర్ చేయబడ్డాయి." if is_te else ("गंभीर खतरों को फ़िल्टर किया गया है।" if is_hi else "Filtered for Critical severity threats."),
                "display_text": "Showing active Critical threats requiring immediate SOC intervention.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 3. Social Monitoring
        if any(w in q for w in ["social", "ఇన్‌స్టాగ్రామ్", "ఫేస్‌బుక్", "సోషల్", "सोशल"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/social-monitoring",
                "action": None,
                "spoken_response": "సోషల్ మీడియా మానిటరింగ్ పేజీ ఓపెన్ చేస్తున్నాను." if is_te else ("सोशल मीडिया मॉनिटरिंग खोला जा रहा है।" if is_hi else "Opening Social Monitoring module."),
                "display_text": "Navigated to Social Media Impersonation & Scam Profile Monitor.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 4. App Monitoring
        if any(w in q for w in ["app", "apk", "mobile", "యాప్", "మొబైల్", "ऐप", "एपीके"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/app-monitoring",
                "action": None,
                "spoken_response": "మొబైల్ యాప్ మానిటరింగ్ పేజీ ఓపెన్ చేస్తున్నాను." if is_te else ("ऐप मॉनिटरिंग खोला जा रहा है।" if is_hi else "Opening Mobile App & APK Monitoring."),
                "display_text": "Navigated to Rogue Mobile App & Malware Detection.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 5. URL Monitoring
        if any(w in q for w in ["url", "domain", "phishing link", "యూఆర్ఎల్", "డొమైన్", "फिशिंग", "डोमेन"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/url-monitoring",
                "action": None,
                "spoken_response": "యూఆర్ఎల్ మానిటరింగ్ పేజీ ఓపెన్ చేస్తున్నాను." if is_te else ("यूआरएल मॉनिटरिंग खोला जा रहा है।" if is_hi else "Opening URL & Domain Monitoring."),
                "display_text": "Navigated to Phishing URL & Domain Typosquatting Scanner.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 6. Campaigns
        if any(w in q for w in ["campaign", "attack", "దాడి", "క్యాంపెయిన్", "अभियान"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/campaigns",
                "action": None,
                "spoken_response": "అటాక్ క్యాంపెయిన్స్ పేజీ ఓపెన్ చేస్తున్నాను." if is_te else ("अटैक कैंपेन खोला जा रहा है।" if is_hi else "Navigating to Attack Campaigns."),
                "display_text": "Opening Attack Campaigns and Infrastructure Correlation Graph.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 7. Intelligence Hub
        if any(w in q for w in ["intel", "intelligence", "ioc", "mitre", "ఇంటెలిజెన్స్", "ఇండికేటర్స్", "खुफिया"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/intelligence",
                "action": None,
                "spoken_response": "థ్రెట్ ఇంటెలిజెన్స్ హబ్ ఓపెన్ చేస్తున్నాను." if is_te else ("थ्रेट इंटेलिजेंस हब खोला जा रहा है।" if is_hi else "Opening Threat Intelligence Hub."),
                "display_text": "Navigated to Threat Intelligence & MITRE ATT&CK Matrix.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 8. Reports
        if any(w in q for w in ["report", "audit", "రిపోర్ట్", "నివేదిక", "रिपोर्ट", "ऑडिट"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/reports",
                "action": None,
                "spoken_response": "ఆడిట్ రిపోర్ట్స్ పేజీ ఓపెన్ చేస్తున్నాను." if is_te else ("ऑडिट रिपोर्ट खोली जा रही है।" if is_hi else "Opening Audit Reports."),
                "display_text": "Navigated to Security & Compliance Audit Reports.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 9. Brand Setup
        if any(w in q for w in ["brand", "setup", "బ్రాండ్", "సెటప్", "ब्रांड"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/brand-setup",
                "action": None,
                "spoken_response": "బ్రాండ్ సెటప్ పేజీ ఓపెన్ చేస్తున్నాను." if is_te else ("ब्रांड सेटअप खोला जा रहा है।" if is_hi else "Opening Brand Setup."),
                "display_text": "Navigated to Brand Asset & Keyword Configuration.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # 10. Dashboard
        if any(w in q for w in ["home", "dash", "డాష్‌బోర్డ్", "హోమ్", "డ్యాష్‌బోర్డ్", "होम"]):
            return {
                "intent": "NAVIGATE",
                "target_route": "/",
                "action": None,
                "spoken_response": "డ్యాష్‌బోర్డ్‌కి వెళ్తున్నాను." if is_te else ("डैशबोर्ड पर जा रहे हैं।" if is_hi else "Returning to Security Dashboard."),
                "display_text": "Navigated to Central Threat Dashboard.",
                "detected_language": "te" if is_te else ("hi" if is_hi else "en")
            }

        # General Question / Fallback
        return {
            "intent": "CYBER_QUESTION",
            "target_route": None,
            "action": None,
            "spoken_response": f"నేను మీ ఆదేశాన్ని విన్నాను: '{query}'. ఏజిస్ గార్డ్ సెక్యూరిటీ సెంటినల్ సిద్ధంగా ఉంది." if is_te else (
                f"आदेश मिला: '{query}'. एजिस गार्ड सुरक्षा सेंटिनल तैयार है।" if is_hi else
                f"Understood: '{query}'. AegisGuard AI Sentinel is monitoring."
            ),
            "display_text": f"Voice instruction processed: \"{query}\".",
            "detected_language": "te" if is_te else ("hi" if is_hi else "en")
        }


gemini_voice_service = GeminiVoiceService()
