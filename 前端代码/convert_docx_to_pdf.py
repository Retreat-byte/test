#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Convert DOCX to PDF using LibreOffice
"""
import subprocess
import sys
import os

def convert_docx_to_pdf(docx_path, output_pdf_path=None):
    """
    Convert DOCX file to PDF using LibreOffice
    """
    if not os.path.exists(docx_path):
        print(f"Error: File not found: {docx_path}")
        return False
    
    if output_pdf_path is None:
        output_pdf_path = docx_path.replace('.docx', '.pdf')
    
    # Try using LibreOffice
    try:
        # Check if LibreOffice is installed
        result = subprocess.run(
            ['libreoffice', '--headless', '--convert-to', 'pdf', '--outdir', 
             os.path.dirname(output_pdf_path) or '.', docx_path],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print(f"Successfully converted: {docx_path} -> {output_pdf_path}")
            return True
        else:
            print(f"LibreOffice conversion failed: {result.stderr}")
            return False
    except FileNotFoundError:
        print("LibreOffice not found. Trying alternative method...")
        return convert_with_pandoc(docx_path, output_pdf_path)
    except Exception as e:
        print(f"Error: {e}")
        return False

def convert_with_pandoc(docx_path, output_pdf_path):
    """
    Fallback: Try using Pandoc
    """
    try:
        result = subprocess.run(
            ['pandoc', docx_path, '-o', output_pdf_path],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0:
            print(f"Successfully converted with Pandoc: {docx_path} -> {output_pdf_path}")
            return True
        else:
            print(f"Pandoc conversion failed: {result.stderr}")
            return False
    except FileNotFoundError:
        print("Pandoc not found either.")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert_docx_to_pdf.py <docx_file> [output_pdf_file]")
        sys.exit(1)
    
    docx_file = sys.argv[1]
    output_pdf = sys.argv[2] if len(sys.argv) > 2 else None
    
    success = convert_docx_to_pdf(docx_file, output_pdf)
    sys.exit(0 if success else 1)
