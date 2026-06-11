import re
import random
import string

class AbhaService:
    @staticmethod
    def generate_abha_number() -> str:
        """
        Generates a synthetic 14-digit ABHA (Ayushman Bharat Health Account) number.
        Format: XX-XXXX-XXXX-XXXX
        Often starts with "91" (or similar codes) in synthetic datasets to look realistic.
        """
        # Prefix with '91' to represent a standard Indian health ID range, followed by 12 random digits
        digits = "91" + "".join(random.choices(string.digits, k=12))
        
        # Format as XX-XXXX-XXXX-XXXX
        return f"{digits[0:2]}-{digits[2:6]}-{digits[6:10]}-{digits[10:14]}"

    @staticmethod
    def validate_abha(abha_number: str) -> bool:
        """
        Validates if an ABHA number meets the required formats.
        Expected format: 14 digits split into XX-XXXX-XXXX-XXXX
        """
        if not abha_number:
            return False
            
        # Pattern matching: 2 digits, dash, 4 digits, dash, 4 digits, dash, 4 digits
        pattern = r"^\d{2}-\d{4}-\d{4}-\d{4}$"
        return bool(re.match(pattern, abha_number))
        
    @staticmethod
    def clean_abha(abha_number: str) -> str:
        """
        Removes formatting dashes if needed for database queries, or standardizes spaces.
        """
        return re.sub(r"[^\d]", "", abha_number)
