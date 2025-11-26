#!/usr/bin/env python3
"""
Script to update all references to renamed directories
"""

import os
import re
from pathlib import Path

# Mapping of old names to new names
REPLACEMENTS = {
    "1. Public Report 2025": "1. 1. Public Report 2025",
    "2. Quality Assurance": "2. 2. Quality Assurance",
    "3. University Regulations": "3. 3. University Regulations",
    "4. Education Testing": "4. 4. Education Testing",
    "5. Guide": "5. 5. Guide",
}

# File extensions to process
EXTENSIONS = [".yml", ".yaml", ".py", ".md", ".json"]

def should_process_file(filepath):
    """Check if file should be processed"""
    return any(filepath.suffix == ext for ext in EXTENSIONS)

def update_file_content(filepath):
    """Update file content with new directory names"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace all occurrences
        for old_name, new_name in REPLACEMENTS.items():
            content = content.replace(old_name, new_name)
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Main function"""
    project_root = Path("/Users/home/GitHub/VJU-Project")
    updated_files = []
    
    # Process all files in project
    for filepath in project_root.rglob("*"):
        if filepath.is_file() and should_process_file(filepath):
            # Skip .git directory
            if ".git" in filepath.parts:
                continue
            
            if update_file_content(filepath):
                updated_files.append(str(filepath.relative_to(project_root)))
    
    print(f"Updated {len(updated_files)} files:")
    for f in sorted(updated_files):
        print(f"  - {f}")

if __name__ == "__main__":
    main()
