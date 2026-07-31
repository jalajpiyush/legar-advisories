import pdfplumber
import docx
import pytesseract
from PIL import Image
import io
import os

def extract_text_from_file(file_path: str, ext: str) -> str:
    text = ""
    if ext == ".pdf":
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
                else:
                    # Fallback to OCR if no text found
                    im = page.to_image()
                    text += pytesseract.image_to_string(im.original) + "\n"
    elif ext == ".docx":
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    elif ext in [".png", ".jpg", ".jpeg"]:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
    return text

def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks
