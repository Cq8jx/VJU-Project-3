#!/usr/bin/env python3
"""
Fix: Add '_source' suffix back to titles in Vietnamese markdown files.
The user confirmed that Vietnamese version files MUST have the '_source' suffix.
"""

import re
import os
from pathlib import Path

def fix_vietnamese_title(filepath):
    """Add '_source' suffix to title if missing in Vietnamese files."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Pattern to find the title line
    # We look for title: ... and ensure it doesn't already end with _source
    # We capture the whole line to replace it
    title_pattern = r'^(title:.*?)(?<!_source)$'
    
    # Check if we find a title line that doesn't end in _source
    # We need to be careful not to match 'title: ' with nothing else if that exists, 
    # but usually it has content.
    
    def replace_title(match):
        line = match.group(1)
        # Double check it doesn't end with _source (redundant due to lookbehind but safe)
        if not line.strip().endswith('_source'):
            return f"{line}_source"
        return line

    # Apply substitution only to the title line in the frontmatter (usually at the top)
    # We assume standard frontmatter format
    if content.startswith('---'):
        # Find the end of frontmatter
        end_fm = content.find('\n---', 3)
        if end_fm != -1:
            frontmatter = content[:end_fm]
            body = content[end_fm:]
            
            new_frontmatter = re.sub(r'^title:.*$', lambda m: m.group(0) + '_source' if not m.group(0).strip().endswith('_source') else m.group(0), frontmatter, flags=re.MULTILINE)
            
            if new_frontmatter != frontmatter:
                content = new_frontmatter + body
                changes.append("Added '_source' suffix to title")

    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return changes
    return None

def main():
    """Process all markdown files in University Regulations/Vietnamese directory."""
    base_dir = Path('/Users/home/GitHub/VJU-Project/3. University Regulations/Vietnamese')
    
    files_fixed = []
    
    if not base_dir.exists():
        print(f"Directory not found: {base_dir}")
        return

    for md_file in base_dir.rglob('*.md'):
        # Skip index files if any (though usually index.md might not need source suffix, 
        # but based on user rule "Vietnamese version files", likely all regulation files.
        # Let's check if it looks like a regulation file.)
        if md_file.name == 'index.md':
            continue
            
        changes = fix_vietnamese_title(md_file)
        if changes:
            files_fixed.append((md_file, changes))
            print(f"Fixed: {md_file.name}")
    
    print(f"\n{'='*60}")
    print(f"Total Vietnamese files fixed: {len(files_fixed)}")

if __name__ == '__main__':
    main()
