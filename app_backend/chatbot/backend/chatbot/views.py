from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decouple import config
import requests
import re

class ChatView(APIView):

    def autocorrect(self, text):
        corrections = {
            "fevr": "fever", "hedache": "headache", "unconsious": "unconscious",
            "diahrea": "diarrhea", "vommiting": "vomiting", "alergy": "allergy",
            "medicen": "medicine", "surgary": "surgery", "injuree": "injury",
            "treatmnt": "treatment", "medcation": "medication"
        }
        words = text.split()
        corrected_words = [corrections.get(w.lower(), w) for w in words]
        return ' '.join(corrected_words)

    def is_health_related(self, message: str) -> bool:
        emergency_keywords = [
            "unconscious", "emergency", "first aid", "choking", "bleeding", "seizure",
            "burn", "faint", "resuscitation", "cpr"
        ]
        health_keywords = [
            "pain", "surgery", "medicine", "medication", "therapy", "treatment", "injury",
            "headache", "fever", "wound", "illness", "recovery", "diagnosis", "prescription",
            "health", "doctor", "nurse", "hospital", "symptoms", "infection", "disease",
            "cough", "cold", "fracture", "allergy", "vomit", "nausea", "bleeding",
            "appointment", "physiotherapy", "nutrition", "sleep", "mental", "anxiety",
            "depression", "diabetes", "asthma", "hypertension", "heart", "lungs", "sugar",
            "bp", "covid", "corona", "malaria", "dengue", "flu", "virus", "bacteria",
            "cancer", "tumor", "radiation", "chemotherapy", "oncology"
        ]
        all_keywords = health_keywords + emergency_keywords
        message_lower = message.lower()
        return any(re.search(rf"\b{kw}\b", message_lower) for kw in all_keywords)

    def check_common_medication_requests(self, message: str) -> str or None:
        message = message.lower()

        if "headache" in message and any(x in message for x in ["tablet", "medicine", "medication"]):
            return (
                "For mild headache, you may take paracetamol (Crocin, Tylenol) or ibuprofen (Brufen, Advil) as per dosage guidelines. "
                "Avoid overuse and consult a doctor if symptoms persist."
            )

        if "fever" in message and any(x in message for x in ["tablet", "medicine", "medication"]):
            return (
                "Paracetamol (e.g., Calpol, Crocin) is typically used for fever. Stay hydrated and rest. Seek medical help if fever continues beyond 48 hours."
            )

        if "cold" in message and any(x in message for x in ["tablet", "medicine", "medication"]):
            return (
                "For cold symptoms, OTC medications like cetirizine or paracetamol may help. Use steam inhalation and stay warm. Avoid cold drinks."
            )

        if "pain" in message and any(x in message for x in ["tablet", "medicine", "medication"]):
            return (
                "For general pain, paracetamol or ibuprofen may be taken after food. Avoid ibuprofen if you have ulcers or kidney issues."
            )

        return None

    def post(self, request):
        raw_user_input = request.data.get('message', '').strip()

        if not raw_user_input:
            return Response({'error': 'No message provided.'}, status=status.HTTP_400_BAD_REQUEST)

        user_input = self.autocorrect(raw_user_input)

        greetings = ["hi", "hello", "hey", "good morning", "good evening", "hii", "helo"]
        if user_input.lower() in greetings:
            return Response({"reply": "Hello! How may I assist you today?"})

        if not self.is_health_related(user_input):
            return Response({
                "reply": "I'm here to assist with medical or healthcare-related questions only. Please ask a health-related query."
            })

        medication_response = self.check_common_medication_requests(user_input)
        if medication_response:
            return Response({"reply": medication_response})

        API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"
        headers = {
            "Authorization": f"Bearer {config('HF_API_KEY')}",
            "Content-Type": "application/json"
        }

        prompt = (
            "You are Veloria AI 🤖, a certified digital healthcare assistant. "
            "You ONLY provide concise medical advice, post-surgery recovery tips, safe medication guidance, or therapy recommendations. "
            "Your responses must be short, medically factual, and directly related to health conditions, medications, symptoms, or recovery guidance. "
            "DO NOT explain exercise steps, routines, lifestyle suggestions, motivational content, or conversational fluff. "
            "If the question is not health-related, politely redirect the user to focus only on medical topics.\n\n"
            f"User: {user_input}\nVeloria AI:"
        )

        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": 300,  # Allows full list responses
                "temperature": 0.4,
                "top_p": 0.8,
                "do_sample": True,
                "return_full_text": False
            },
            "options": {
                "wait_for_model": True
            }
        }

        try:
            response = requests.post(API_URL, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()

            if isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
                raw_reply = result[0]['generated_text'].strip()
                # 🛑 Stop at "User:" or "Veloria AI:" if the model tries to continue the chat
                clean_reply = re.split(r"\n?User:|\n?Veloria AI:", raw_reply)[0].strip()
                reply = clean_reply
            elif isinstance(result, dict) and 'error' in result:
                reply = "⚠️ Model error: " + result['error']
            else:
                reply = "⚠️ No valid AI reply."

            return Response({"reply": reply})
        except Exception as e:
            return Response(
                {"reply": "⚠️ Sorry, the AI is not responding right now.", "error": str(e)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
