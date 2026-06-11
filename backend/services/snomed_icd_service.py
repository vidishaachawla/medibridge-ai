from typing import Dict, List, Any, Optional

class SnomedIcdService:
    # A curated, realistic mapping catalog of common conditions to ICD-10 and SNOMED-CT codes
    DIAGNOSIS_CATALOG = {
        "essential hypertension": {
            "condition": "Essential (Primary) Hypertension",
            "icd10_code": "I10",
            "icd10_description": "Essential (primary) hypertension",
            "snomed_code": "38341003",
            "snomed_description": "Hypertensive disorder, systemic arterial (disorder)"
        },
        "type 2 diabetes": {
            "condition": "Type 2 Diabetes Mellitus",
            "icd10_code": "E11.9",
            "icd10_description": "Type 2 diabetes mellitus without complications",
            "snomed_code": "44054006",
            "snomed_description": "Type 2 diabetes mellitus (disorder)"
        },
        "common cold": {
            "condition": "Acute Nasopharyngitis (Common Cold)",
            "icd10_code": "J00",
            "icd10_description": "Acute nasopharyngitis [common cold]",
            "snomed_code": "82272006",
            "snomed_description": "Common cold (disorder)"
        },
        "acute bronchitis": {
            "condition": "Acute Bronchitis",
            "icd10_code": "J20.9",
            "icd10_description": "Acute bronchitis, unspecified",
            "snomed_code": "10509002",
            "snomed_description": "Acute bronchitis (disorder)"
        },
        "asthma": {
            "condition": "Asthma",
            "icd10_code": "J45.909",
            "icd10_description": "Unspecified asthma, uncomplicated",
            "snomed_code": "195967001",
            "snomed_description": "Asthma (disorder)"
        },
        "hyperlipidemia": {
            "condition": "Hyperlipidemia",
            "icd10_code": "E78.5",
            "icd10_description": "Hyperlipidemia, unspecified",
            "snomed_code": "55822004",
            "snomed_description": "Hyperlipidemia (disorder)"
        },
        "angina pectoris": {
            "condition": "Angina Pectoris",
            "icd10_code": "I20.9",
            "icd10_description": "Angina pectoris, unspecified",
            "snomed_code": "426396005",
            "snomed_description": "Cardiac chest pain (finding)"
        },
        "urinary tract infection": {
            "condition": "Urinary Tract Infection",
            "icd10_code": "N39.0",
            "icd10_description": "Urinary tract infection, site not specified",
            "snomed_code": "68566005",
            "snomed_description": "Urinary tract infectious disease (disorder)"
        },
        "migraine": {
            "condition": "Migraine",
            "icd10_code": "G43.909",
            "icd10_description": "Migraine, unspecified, not intractable, without status migrainosus",
            "snomed_code": "386806002",
            "snomed_description": "Migraine (disorder)"
        },
        "gastroenteritis": {
            "condition": "Infectious Gastroenteritis",
            "icd10_code": "A09",
            "icd10_description": "Infectious gastroenteritis and colitis, unspecified",
            "snomed_code": "95214007",
            "snomed_description": "Infectious gastroenteritis (disorder)"
        },
        "generalized anxiety": {
            "condition": "Generalized Anxiety Disorder (GAD)",
            "icd10_code": "F41.1",
            "icd10_description": "Generalized anxiety disorder",
            "snomed_code": "21897009",
            "snomed_description": "Generalized anxiety disorder (disorder)"
        },
        "osteoarthritis": {
            "condition": "Osteoarthritis",
            "icd10_code": "M19.90",
            "icd10_description": "Unspecified osteoarthritis, unspecified site",
            "snomed_code": "396275006",
            "snomed_description": "Osteoarthritis (disorder)"
        }
    }

    def lookup_by_term(self, query: str) -> List[Dict[str, Any]]:
        """
        Searches the local medical catalog by query term (case-insensitive).
        Returns a list of matching diagnostic records.
        """
        if not query:
            return []
            
        query_clean = query.strip().lower()
        matches = []
        
        for key, details in self.DIAGNOSIS_CATALOG.items():
            if (query_clean in key or 
                query_clean in details["condition"].lower() or
                query_clean in details["icd10_code"].lower() or 
                query_clean in details["snomed_code"].lower()):
                matches.append(details)
                
        return matches

    def get_mapping(self, condition_key: str) -> Optional[Dict[str, Any]]:
        """
        Direct lookup using a clean catalog key.
        """
        key_clean = condition_key.strip().lower()
        return self.DIAGNOSIS_CATALOG.get(key_clean)

    def map_clinical_text(self, text: str) -> Dict[str, Any]:
        """
        Attempts to map a free-text clinical description or diagnosis to codes.
        If no direct match is found in the local catalog, it returns a generic unspecified mapping.
        """
        text_lower = text.lower()
        
        # Check for matches in our catalog
        for key, details in self.DIAGNOSIS_CATALOG.items():
            if key in text_lower or details["condition"].lower() in text_lower:
                return details
                
        # Default fallback for unmapped conditions
        return {
            "condition": text,
            "icd10_code": "R69",
            "icd10_description": "Illness, unspecified (symptoms / signs)",
            "snomed_code": "271636001",
            "snomed_description": "Unspecified disease (disorder)"
        }
