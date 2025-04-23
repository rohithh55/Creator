#!/usr/bin/env python3
"""
Script to extract RDS and DynamoDB interview questions from the attached Word document
and add them to the database.
"""

import os
import sys
import json
from typing import List, Dict

# Add project root to path to import app modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    import docx
except ImportError:
    print("python-docx not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-docx"])
    import docx

from app import create_app
from models import db, InterviewQuestion

def extract_questions_from_docx(filepath: str) -> List[Dict]:
    """
    Extract questions from the Word document
    Returns a list of dictionaries with question data
    """
    doc = docx.Document(filepath)
    questions = []
    
    current_service = None
    question_text = ""
    in_question = False
    
    for para in doc.paragraphs:
        text = para.text.strip()
        
        # Skip empty paragraphs
        if not text:
            continue
        
        # Check if this is a service header
        if text.upper() in ["RDS QUESTIONS", "DYNAMODB QUESTIONS"]:
            current_service = "RDS" if "RDS" in text.upper() else "DynamoDB"
            continue
        
        # Check if this is the start of a question
        if text.startswith("Q") and ":" in text:
            # If we were already in a question, save the previous one
            if in_question and question_text:
                questions.append({
                    "question": question_text,
                    "field": "aws_" + current_service.lower() if current_service else "aws_general",
                    "difficulty": "medium",  # Default difficulty
                    "aws_service": current_service if current_service else "General",
                })
            
            # Start a new question
            question_text = text.split(":", 1)[1].strip()
            in_question = True
        elif in_question:
            # Continue with the current question
            question_text += " " + text
    
    # Add the last question if there is one
    if in_question and question_text:
        questions.append({
            "question": question_text,
            "field": "aws_" + current_service.lower() if current_service else "aws_general",
            "difficulty": "medium",  # Default difficulty
            "aws_service": current_service if current_service else "General",
        })
    
    return questions

def add_questions_to_db(questions: List[Dict]):
    """Add extracted questions to the database"""
    app = create_app()
    with app.app_context():
        for q_data in questions:
            # Check if question already exists
            existing = InterviewQuestion.query.filter_by(question=q_data["question"]).first()
            if not existing:
                question = InterviewQuestion(
                    question=q_data["question"],
                    field=q_data["field"],
                    difficulty=q_data["difficulty"],
                    aws_service=q_data["aws_service"]
                )
                db.session.add(question)
        
        db.session.commit()
        print(f"Added {len(questions)} questions to the database.")

def main():
    docx_path = os.path.join("attached_assets", "RDS-DynamoDB_Questions.docx")
    
    if not os.path.exists(docx_path):
        print(f"Error: File not found: {docx_path}")
        sys.exit(1)
    
    print(f"Extracting questions from {docx_path}...")
    questions = extract_questions_from_docx(docx_path)
    
    print(f"Extracted {len(questions)} questions.")
    
    # Print the first few questions as a sample
    print("\nSample questions:")
    for i, q in enumerate(questions[:3]):
        print(f"{i+1}. [{q['aws_service']}] {q['question']}")
    
    # Save questions to JSON file for reference
    json_path = os.path.join("attached_assets", "extracted_questions.json")
    with open(json_path, 'w') as f:
        json.dump(questions, f, indent=2)
    print(f"\nSaved all questions to {json_path}")
    
    # Add to database
    add_questions_to_db(questions)

if __name__ == "__main__":
    main()