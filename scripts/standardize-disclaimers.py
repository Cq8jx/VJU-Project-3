#!/usr/bin/env python3
"""
Script to standardize disclaimer text across all markdown files.
Replaces various disclaimer formats with a unified standard format.
"""

import os
import re
from pathlib import Path

# Standard disclaimer text for each language
STANDARD_DISCLAIMERS = {
    'ja': """このファイルは公開された内容を転写したものです。表の認識が技術的に困難なため、レイアウトや内容が正確でない可能性があります。

【留意】このファイルは参考用であり法的効力を持ちません。正確な情報は原本をご確認ください。なお、発行元が公式に公開している他言語版が存在する場合があります。""",
    
    'en': """This file is a transcription of publicly available content. Due to technical difficulties in table recognition, the layout and content may not be accurate.

【Note】This file is for reference only and has no legal value. For accurate information, please refer to the original document. Additionally, other language versions may be officially published by the issuing authority.""",
    
    'vi': """Tệp này là bản chuyển văn bản từ nội dung được công bố công khai. Do khó khăn kỹ thuật trong việc nhận dạng bảng, bố cục và nội dung có thể không chính xác.

【Lưu ý】Tệp này chỉ mang tính chất tham khảo và không có giá trị pháp lý. Để có thông tin chính xác, vui lòng tham khảo văn bản gốc. Ngoài ra, có thể có các phiên bản ngôn ngữ khác được cơ quan ban hành công bố chính thức."""
}

def detect_language(filepath):
    """Detect language based on directory structure."""
    if '/Japanese/' in str(filepath):
        return 'ja'
    elif '/English/' in str(filepath):
        return 'en'
    elif '/Vietnamese/' in str(filepath):
        return 'vi'
    return None

def find_disclaimer_section(content, lang):
    """Find and extract the disclaimer section from the content."""
    # Split by --- to find the section after frontmatter
    parts = content.split('---')
    if len(parts) < 3:
        return None, None, None
    
    # The disclaimer should be between the second --- and third ---
    # or between second --- and first heading
    after_frontmatter = '---'.join(parts[2:])
    
    # Find the end of disclaimer (usually before the first heading or next ---)
    patterns = {
        'ja': r'(このファイルは.*?(?=\n---|\n##|\n\*\*|$))',
        'en': r'(This file is.*?(?=\n---|\n##|\n\*\*|$))',
        'vi': r'(Tệp này.*?(?=\n---|\n##|\n\*\*|$))'
    }
    
    # Also match HTML paragraph patterns
    html_patterns = {
        'ja': r'(\s*<p><strong>出典メモ。</strong>.*?</p>.*?(?=\n---|\n##|\n\*\*|<p>|$))',
        'en': r'(\s*<p><strong>Source note\.</strong>.*?</p>.*?(?=\n---|\n##|\n\*\*|<p>|$))',
        'vi': r'(\s*<p><strong>Ghi chú nguồn\.</strong>.*?</p>.*?(?=\n---|\n##|\n\*\*|<p>|$))'
    }
    
    # Try HTML pattern first
    if lang in html_patterns:
        match = re.search(html_patterns[lang], after_frontmatter, re.DOTALL)
        if match:
            start_pos = content.find(match.group(1))
            end_pos = start_pos + len(match.group(1))
            return match.group(1), start_pos, end_pos
    
    # Try plain text pattern
    if lang in patterns:
        match = re.search(patterns[lang], after_frontmatter, re.DOTALL)
        if match:
            start_pos = content.find(match.group(1))
            end_pos = start_pos + len(match.group(1))
            return match.group(1), start_pos, end_pos
    
    return None, None, None

def standardize_disclaimer(filepath):
    """Standardize disclaimer in a single file."""
    lang = detect_language(filepath)
    if not lang:
        return False, "Language not detected"
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        old_disclaimer, start_pos, end_pos = find_disclaimer_section(content, lang)
        
        if old_disclaimer is None:
            return False, "No disclaimer found"
        
        # Check if already standardized
        if STANDARD_DISCLAIMERS[lang] in content:
            return False, "Already standardized"
        
        # Replace the old disclaimer with the standard one
        new_content = content[:start_pos] + STANDARD_DISCLAIMERS[lang] + content[end_pos:]
        
        # Write back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        return True, "Updated"
    
    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    """Main function to process all files."""
    base_dir = Path('/Users/home/GitHub/VJU-Project/3. University Regulations')
    
    stats = {'updated': 0, 'skipped': 0, 'errors': 0}
    
    for lang_dir in ['English', 'Japanese', 'Vietnamese']:
        dir_path = base_dir / lang_dir
        if not dir_path.exists():
            continue
        
        print(f"\nProcessing {lang_dir} files...")
        
        for md_file in dir_path.glob('*.md'):
            # Skip index files
            if md_file.name == 'index.md':
                continue
            
            success, message = standardize_disclaimer(md_file)
            
            if success:
                stats['updated'] += 1
                print(f"  ✓ {md_file.name}: {message}")
            elif 'Already standardized' in message:
                stats['skipped'] += 1
                print(f"  - {md_file.name}: {message}")
            else:
                stats['errors'] += 1
                print(f"  ✗ {md_file.name}: {message}")
    
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Updated: {stats['updated']}")
    print(f"  Skipped: {stats['skipped']}")
    print(f"  Errors: {stats['errors']}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
