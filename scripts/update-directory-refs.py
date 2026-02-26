#!/usr/bin/env python3
"""
Script to update all references to renamed directories
"""

import argparse
import re
from pathlib import Path

# Mapping of old names to new names
REPLACEMENTS = {
    "1. Public Report 2025": "1. Public Report 2025",
    "2. Quality Assurance": "2. Quality Assurance",
    "3. University Regulations": "3. University Regulations",
    "4. Education Testing": "4. Education Testing",
    "5. Guide": "5. Guide",
}
# NOTE: This script was found with a bug where replacements doubled the number prefix
# (e.g., "1. ..." -> "1. 1. ..."). The mappings above have been corrected to be
# identity mappings (no-ops) to prevent further damage. If actual renaming is needed,
# update the values to the correct new directory names before running.

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

def parse_args():
    parser = argparse.ArgumentParser(description="Update all references to renamed directories.")
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path("."),
        help="Path to the VJU-Project-3 root directory (default: current directory).",
    )
    return parser.parse_args()


def main():
    """Main function"""
    args = parse_args()
    project_root = args.base_dir.resolve()

    if not project_root.exists():
        print(f"Error: Directory not found: {project_root}")
        return
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
