import os
import json
import logging
import httpx
from typing import Dict, List, Any

logger = logging.getLogger(__name__)

class ClinicalAssistantService:
    def __init__(self):
        self.api_key = os.getenv("MISTRAL_API_KEY")
        self.model = os.getenv("MISTRAL_MODEL", "mistral-medium")
        self.api_url = "https://api.mistral.ai/v1/chat/completions"
        
        # Verify API key configuration
        if not self.api_key:
            logger.warning("MISTRAL_API_KEY is not set. Clinical assistant will run in mock/fallback mode.")

    async def _call_mistral_api(self, messages: List[Dict[str, str]], json_mode: bool = True) -> Dict[str, Any]:
        """
        Helper method to communicate with Mistral AI chat completions API asynchronously.
        """
        if not self.api_key:
            # Return a generic fallback if API key is missing
            return {"error": "Mistral API key not configured"}

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2, # Low temperature for clinical accuracy
        }
        
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.api_url, headers=headers, json=payload)
                response.raise_for_status()
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                
                if json_mode:
                    return json.loads(content)
                return {"text": content}
        except httpx.HTTPStatusError as e:
            logger.error(f"Mistral API error: {e.response.status_code} - {e.response.text}")
            raise RuntimeError(f"Mistral API returned error: {e.response.status_code}")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Mistral JSON response: {e}")
            raise RuntimeError("Mistral response was not valid JSON")
        except Exception as e:
            logger.error(f"Unexpected error communicating with Mistral AI: {e}")
            raise RuntimeError("Failed to communicate with AI Assistant")

    async def analyze_symptoms(self, symptoms: str) -> Dict[str, Any]:
        """
        Analyzes symptoms provided by a patient or doctor.
        Returns potential diagnoses, urgency classification, and preliminary coding mappings.
        """
        if not self.api_key:
            return self._mock_symptom_analysis(symptoms)

        system_prompt = (
            "You are a clinical AI assistant. Analyze the user's symptoms and return a structured JSON response. "
            "Do not output any introductory or concluding text, only return a JSON object with the following fields: "
            "{\n"
            '  "primary_concern": "brief description of main clinical issue",\n'
            '  "potential_diagnoses": [\n'
            '    {"condition": "name", "probability_pct": 80, "explanation": "why"}\n'
            "  ],\n"
            '  "urgency_level": "Low" | "Medium" | "High" | "Critical",\n'
            '  "snomed_mapping": {"code": "string", "description": "string"},\n'
            '  "icd10_mapping": {"code": "string", "description": "string"},\n'
            '  "clinical_summary": "summary paragraph for clinical notes",\n'
            '  "recommended_specialty": "e.g., Cardiologist, General Practitioner",\n'
            '  "triage_instructions": "immediate advice/first aid or go to ER"\n'
            "}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Analyze these patient symptoms: {symptoms}"}
        ]

        try:
            return await self._call_mistral_api(messages, json_mode=True)
        except Exception as e:
            logger.warning(f"Error in symptom analysis, falling back to mock: {e}")
            return self._mock_symptom_analysis(symptoms)

    async def calculate_risk_score(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates a clinical risk score (cardiovascular/metabolic) based on demographics and vitals.
        """
        if not self.api_key:
            return self._mock_risk_score(patient_data)

        system_prompt = (
            "You are a medical risk calculator AI. Analyze the patient demographics, history, and vitals, "
            "and calculate a cardiovascular & metabolic risk percentage. "
            "Return a structured JSON response with the following format:\n"
            "{\n"
            '  "risk_score": 45.5,\n'
            '  "risk_classification": "Low | Medium | High",\n'
            '  "key_risk_factors": ["list", "of", "risk", "factors"],\n'
            '  "protective_factors": ["list", "of", "positives"],\n'
            '  "recommendations": ["list", "of", "actions"]\n'
            "}"
        )

        user_content = f"Calculate risk for patient: {json.dumps(patient_data)}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        try:
            return await self._call_mistral_api(messages, json_mode=True)
        except Exception as e:
            logger.warning(f"Error in risk score calculation, falling back to mock: {e}")
            return self._mock_risk_score(patient_data)

    async def generate_recommendations(self, patient_profile: Dict[str, Any], consultation_history: List[Dict[str, Any]]) -> List[str]:
        """
        Generates comprehensive personalized medical recommendations based on patient profile and history.
        """
        if not self.api_key:
            return ["Maintain a balanced diet.", "Regular physical activity (30 mins daily).", "Follow up with primary care physician."]

        system_prompt = (
            "You are an AI Clinical Care Coordinator. Based on the patient's profile and history of consultations, "
            "provide a list of exactly 3 to 5 clear, actionable healthcare recommendations. "
            "Return a JSON object in this format:\n"
            "{\n"
            '  "recommendations": ["rec 1", "rec 2", "rec 3"]\n'
            "}"
        )

        user_content = f"Patient: {json.dumps(patient_profile)}\nHistory: {json.dumps(consultation_history)}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ]

        try:
            res = await self._call_mistral_api(messages, json_mode=True)
            return res.get("recommendations", [])
        except Exception as e:
            logger.warning(f"Error generating recommendations, falling back to default list: {e}")
            return [
                "Schedule annual lipid profile and HbA1c screening.",
                "Adopt a DASH-style diet high in whole grains and lean proteins.",
                "Engage in moderate aerobic exercise for 150 minutes per week."
            ]

    # --- MOCK FALLBACKS FOR ROBUSTNESS ---
    def _mock_symptom_analysis(self, symptoms: str) -> Dict[str, Any]:
        """Fallback analysis when AI is not accessible."""
        symptoms_lower = symptoms.lower()
        if "chest pain" in symptoms_lower or "shortness of breath" in symptoms_lower:
            return {
                "primary_concern": "Acute Cardiovascular distress symptoms",
                "potential_diagnoses": [
                    {"condition": "Angina Pectoris", "probability_pct": 60, "explanation": "Symptoms of chest discomfort during exertion or stress."},
                    {"condition": "Gastroesophageal Reflux Disease (GERD)", "probability_pct": 40, "explanation": "Acid reflux can mimic cardiac chest pain."}
                ],
                "urgency_level": "High",
                "snomed_mapping": {"code": "426396005", "description": "Cardiac chest pain"},
                "icd10_mapping": {"code": "I20.9", "description": "Angina pectoris, unspecified"},
                "clinical_summary": "Patient presented with chest tightness and mild shortness of breath. Suggestive of ischemic etiology.",
                "recommended_specialty": "Cardiology / Emergency Medicine",
                "triage_instructions": "Instruct patient to seek emergency care immediately if pain worsens, spreads to arm/jaw, or is accompanied by sweating."
            }
        
        # Default fallback
        return {
            "primary_concern": "Viral Upper Respiratory Infection",
            "potential_diagnoses": [
                {"condition": "Common Cold", "probability_pct": 75, "explanation": "Classic presentation of congestion, sore throat, and mild cough."},
                {"condition": "Allergic Rhinitis", "probability_pct": 25, "explanation": "May explain sneezing and nasal symptoms without active fever."}
            ],
            "urgency_level": "Low",
            "snomed_mapping": {"code": "82272006", "description": "Common cold"},
            "icd10_mapping": {"code": "J00", "description": "Acute nasopharyngitis [common cold]"},
            "clinical_summary": "Mild upper respiratory symptoms consistent with rhinitis or acute viral nasopharyngitis.",
            "recommended_specialty": "General Medicine",
            "triage_instructions": "Rest, hydration, and over-the-counter symptomatic relief. Follow up if symptoms persist beyond 10 days."
        }

    def _mock_risk_score(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Fallback risk scoring logic based on demographic parameters."""
        age = patient_data.get("age", 40)
        gender = patient_data.get("gender", "Other").lower()
        
        # Heuristic calculations for mock score
        base_score = 10.0
        factors = []
        
        if age > 50:
            base_score += 15.0
            factors.append("Age > 50 years")
        if gender == "male":
            base_score += 5.0
            factors.append("Male gender statistical risk")
            
        # Add random variations or check for key variables if they exist
        systolic_bp = patient_data.get("systolic_bp", 120)
        if systolic_bp > 140:
            base_score += 20.0
            factors.append("Stage 2 Hypertension")
        elif systolic_bp > 130:
            base_score += 10.0
            factors.append("Stage 1 Hypertension")
            
        cholesterol = patient_data.get("cholesterol", 190)
        if cholesterol > 240:
            base_score += 15.0
            factors.append("Hypercholesterolemia")
            
        is_smoker = patient_data.get("is_smoker", False)
        if is_smoker:
            base_score += 20.0
            factors.append("Active Tobacco Use")

        score = min(base_score, 100.0)
        
        if score < 15:
            classification = "Low"
            recommendations = ["Continue healthy diet", "Maintain active lifestyle"]
        elif score < 40:
            classification = "Medium"
            recommendations = ["Monitor blood pressure regularly", "Reduce dietary sodium intake"]
        else:
            classification = "High"
            recommendations = ["Schedule clinical assessment", "Initiate pharmacotherapy review for cardiovascular risk reduction"]

        return {
            "risk_score": score,
            "risk_classification": classification,
            "key_risk_factors": factors,
            "protective_factors": ["Regular follow-up" if not is_smoker else "N/A"],
            "recommendations": recommendations
        }
