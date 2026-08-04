#!/usr/bin/env bash
#
# Extract text from a show programme PDF.
#
# Usage:
#   scripts/extract-text.sh <path/to/programme.pdf>
#
# Writes:
#   <same-folder>/.programme-text.txt   — the extracted text
#
# Strategy: try embedded-text extraction with pypdf; if the first page yields
# less than 200 characters (image-only PDF), fall back to OCR via
# pdftoppm + tesseract with automatic orientation detection (--psm 1).

set -euo pipefail

PDF="${1:?usage: extract-text.sh <path/to/programme.pdf>}"
[ -f "$PDF" ] || { echo "not a file: $PDF" >&2; exit 1; }

OUT_DIR="$(dirname "$PDF")"
OUT="$OUT_DIR/.programme-text.txt"

# --- Try pypdf first ---
first_chars=$(python3 - "$PDF" <<'PY'
import sys
try:
    from pypdf import PdfReader
except ImportError:
    print(-1); sys.exit(0)
r = PdfReader(sys.argv[1])
print(len((r.pages[0].extract_text() or '').strip()))
PY
)

if [ "$first_chars" = "-1" ]; then
  echo "pypdf not installed; skipping embedded-text pass" >&2
  first_chars=0
fi

if [ "$first_chars" -gt 200 ]; then
  echo "==> Embedded text detected ($first_chars chars on page 1); extracting with pypdf"
  python3 - "$PDF" "$OUT" <<'PY'
import sys
from pypdf import PdfReader
r = PdfReader(sys.argv[1])
with open(sys.argv[2], 'w') as f:
    for i, page in enumerate(r.pages, 1):
        f.write(f'\n===== PAGE {i} =====\n\n')
        f.write(page.extract_text() or '(no text)')
        f.write('\n')
print(f'wrote {sys.argv[2]}')
PY
  exit 0
fi

# --- OCR fallback ---
echo "==> No embedded text; OCRing with tesseract"
for cmd in pdftoppm tesseract; do
  command -v "$cmd" >/dev/null || {
    echo "missing tool: $cmd — install poppler-utils / tesseract-ocr" >&2
    exit 2
  }
done

WORK="$(mktemp -d)"
trap "rm -rf '$WORK'" EXIT

pdftoppm -r 180 "$PDF" "$WORK/p" -jpeg -jpegopt quality=80

: > "$OUT"
for img in "$WORK"/p-*.jpg; do
  pg=$(basename "$img" .jpg | sed 's/p-//' | sed 's/^0*//')
  printf '\n===== PAGE %s =====\n\n' "$pg" >> "$OUT"
  tesseract "$img" - -l eng --psm 1 2>/dev/null >> "$OUT" || true
done

pages=$(grep -c '^===== PAGE' "$OUT" || echo 0)
bytes=$(wc -c < "$OUT")
echo "wrote $OUT ($pages pages, $bytes bytes)"
