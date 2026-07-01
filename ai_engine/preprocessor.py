"""
NLP Preprocessor — reusable for training AND prediction.
"""

import re
import string


# Common English stop words (no NLTK dependency)
STOP_WORDS = {
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "is", "was", "are", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need", "dare",
    "ought", "used", "not", "no", "nor", "so", "yet", "both", "either",
    "neither", "each", "few", "more", "most", "other", "some", "such",
    "than", "too", "very", "just", "that", "this", "these", "those",
    "it", "its", "my", "your", "his", "her", "our", "their", "we",
    "you", "he", "she", "they", "i", "me", "him", "us", "them",
    "what", "which", "who", "whom", "how", "when", "where", "why",
    "all", "any", "both", "each", "every", "if", "then", "as", "up",
    "out", "about", "after", "before", "between", "into", "through",
    "during", "also", "back", "now", "only", "even", "still", "here",
    "there", "well", "get", "got", "also", "much", "many",
}


def preprocess_text(text: str) -> str:
    """
    Apply full NLP preprocessing pipeline:
    1. Lowercase
    2. Remove URLs
    3. Remove email addresses
    4. Remove phone numbers
    5. Remove special characters / punctuation
    6. Remove digits
    7. Tokenize and remove stop words
    8. Collapse whitespace
    """
    if not isinstance(text, str):
        text = str(text)

    # Lowercase
    text = text.lower()

    # Remove URLs
    text = re.sub(r"http\S+|www\.\S+|https\S+", " url ", text)

    # Remove email addresses
    text = re.sub(r"\S+@\S+", " email ", text)

    # Remove phone numbers (various formats)
    text = re.sub(r"[\+\(]?\d[\d\-\.\s\(\)]{7,}\d", " phone ", text)

    # Mark dollar / money amounts
    text = re.sub(r"\$[\d,]+(\.\d+)?", " money ", text)

    # Remove punctuation
    text = text.translate(str.maketrans(string.punctuation, " " * len(string.punctuation)))

    # Remove standalone digits
    text = re.sub(r"\b\d+\b", " ", text)

    # Tokenize
    tokens = text.split()

    # Remove stop words and short tokens
    tokens = [t for t in tokens if t not in STOP_WORDS and len(t) > 2]

    return " ".join(tokens)
