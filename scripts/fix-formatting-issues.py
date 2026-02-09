#!/usr/bin/env python3
"""
Fix common formatting issues in University Regulations markdown files:
1. Remove '_source' suffix from titles
2. Fix disclaimer formatting (replace '---' separator with proper closing tag and blank line)
3. Reorder version list to: en, ja, vi, source
"""

import argparse
import re
from pathlib import Path

def fix_markdown_file(filepath):
    """Fix formatting issues in a single markdown file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes = []
    
    # Fix 1: Handle '_source' suffix in title
    # If filename ends with '_source.md', title MUST have '_source' suffix
    # If filename does NOT end with '_source.md', title MUST NOT have '_source' suffix
    
    is_source_file = filepath.name.endswith('_source.md')
    title_pattern = r'^(title:.*?)(_source)?$'
    
    def title_replacer(match):
        base_title = match.group(1)
        has_suffix = match.group(2) is not None
        
        if is_source_file and not has_suffix:
            return f"{base_title}_source"
        elif not is_source_file and has_suffix:
            return base_title
        return match.group(0)

    if re.search(title_pattern, content, re.MULTILINE):
        new_content = re.sub(title_pattern, title_replacer, content, flags=re.MULTILINE)
        if new_content != content:
            content = new_content
            if is_source_file:
                changes.append("Added '_source' suffix to title")
            else:
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

def parse_args():
    parser = argparse.ArgumentParser(description="Fix common formatting issues in University Regulations markdown files.")
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path("3. University Regulations"),
        help="Path to the University Regulations directory (default: '3. University Regulations').",
    )
    return parser.parse_args()


def main():
    """Process all markdown files in University Regulations directory."""
    args = parse_args()
    base_dir = args.base_dir.resolve()

    if not base_dir.exists():
        print(f"Error: Directory not found: {base_dir}")
        return
    
    files_fixed = []
    
    for md_file in base_dir.rglob('*.md'):
        # Skip index files
        if md_file.name == 'index.md':
            continue
            
        try:
            changes = fix_markdown_file(md_file)
        except Exception as e:
            print(f"\n✗ Error processing {md_file.relative_to(base_dir)}: {e}")
            continue
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
