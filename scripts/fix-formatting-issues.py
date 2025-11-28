#!/usr/bin/env python3
"""
Fix common formatting issues in University Regulations markdown files:
1. Remove '_source' suffix from titles
2. Fix disclaimer formatting (replace '---' separator with proper closing tag and blank line)
3. Reorder version list to: en, ja, vi, source
"""

import re
import os
from pathlib import Path

def fix_markdown_file(filepath):
    """Fix formatting issues in a single markdown file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Fix 1: Remove '_source' suffix from title
    title_pattern = r'^(title:.*?)_source$'
    if re.search(title_pattern, content, re.MULTILINE):
        content = re.sub(title_pattern, r'\1', content, flags=re.MULTILINE)
        changes.append("Removed '_source' suffix from title")
    
    # Fix 2: Fix disclaimer formatting - replace '---' after disclaimer with '</div>\n\n'
    # Pattern: disclaimer text followed by '---' instead of proper closing
    disclaimer_pattern = r'(Cơ quan ban hành có thể công bố chính thức các phiên bản ngôn ngữ khác\.|Other language versions may be officially published by the issuing authority\.|発行元が公式に公開している他言語版が存在する場合があります。)\n---'
    if re.search(disclaimer_pattern, content):
        content = re.sub(disclaimer_pattern, r'\1</div>\n', content)
        changes.append("Fixed disclaimer formatting")
    
    # Fix 3: Reorder version list to: en, ja, vi, source
    # Find the version block in frontmatter
    version_pattern = r'(version:\n)((?:- (?:en|ja|vi|source)\n)+)'
    match = re.search(version_pattern, content)
    if match:
        version_block = match.group(2)
        versions = [line.strip()[2:] for line in version_block.strip().split('\n')]
        
        # Desired order
        desired_order = ['en', 'ja', 'vi', 'source']
        ordered_versions = [v for v in desired_order if v in versions]
        
        # Check if reordering is needed
        if versions != ordered_versions:
            new_version_block = '\n'.join([f'- {v}' for v in ordered_versions]) + '\n'
            content = re.sub(version_pattern, r'\1' + new_version_block, content)
            changes.append(f"Reordered version list from {versions} to {ordered_versions}")
    
    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes
    return None

def main():
    """Process all markdown files in University Regulations directory."""
    base_dir = Path('/Users/home/GitHub/VJU-Project/3. University Regulations')
    
    files_fixed = []
    
    for md_file in base_dir.rglob('*.md'):
        # Skip index files
        if md_file.name == 'index.md':
            continue
            
        changes = fix_markdown_file(md_file)
        if changes:
            files_fixed.append((md_file, changes))
            print(f"\n✓ Fixed: {md_file.relative_to(base_dir)}")
            for change in changes:
                print(f"  - {change}")
    
    print(f"\n{'='*60}")
    print(f"Total files fixed: {len(files_fixed)}")
    
    if files_fixed:
        print("\nSummary of changes:")
        for filepath, changes in files_fixed:
            print(f"\n{filepath.relative_to(base_dir)}:")
            for change in changes:
                print(f"  • {change}")

if __name__ == '__main__':
    main()
