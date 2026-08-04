---
name: programme-metadata
description: Extract cast, crew, band, musical numbers and society officials from a show programme PDF (scanned image PDFs supported via OCR) and save the result as `programme.json` alongside the source PDF. Use whenever a new programme.pdf lands in a show folder under MTS/ or MYTS/ and needs its structured metadata generated.
---

# Programme Metadata Extractor

## Purpose

Every show folder in the MTS archive follows the convention `MTS/<show-slug>/`
or `MYTS/<show-slug>/`. When a `programme.pdf` is present, it should be
accompanied by a `programme.json` metafile that captures the show's
cast, crew, band, musical numbers and society officials in a machine-readable
form.

Your job is to produce that JSON from the PDF, following the schema in
`references/schema.md` and the working example in `references/example.json`.

## When to invoke

- A folder `MTS/<slug>/` or `MYTS/<slug>/` contains `programme.pdf` but
  no `programme.json`.
- An existing `programme.json` needs re-generation (the PDF was replaced).
- The user asks to "extract programme metadata" for a specific show.

## Preconditions

Check that these tools are on the machine before proceeding — install any
missing ones. On macOS with Homebrew:

```bash
brew install poppler tesseract          # pdftoppm, tesseract binaries
python3 -m pip install pypdf --break-system-packages  # or in a venv
```

On Debian/Ubuntu:

```bash
sudo apt-get install poppler-utils tesseract-ocr tesseract-ocr-eng
python3 -m pip install pypdf --break-system-packages
```

## Workflow

### 1. Locate the source

Confirm the target folder and PDF path:

```bash
SHOW_DIR="MTS/<slug>"    # or MYTS/<slug>
test -f "$SHOW_DIR/programme.pdf" || { echo "no programme.pdf"; exit 1; }
```

Refuse to overwrite an existing `programme.json` unless the user has
explicitly asked to regenerate it — compare the JSON's `source.pdf_bytes`
field to the current PDF size to detect a stale metafile.

### 2. Try direct text extraction first

Many programmes have embedded text. This is cheap and much more accurate
than OCR when it works:

```python
from pypdf import PdfReader
r = PdfReader(f"{SHOW_DIR}/programme.pdf")
first_page_chars = len((r.pages[0].extract_text() or "").strip())
```

**Decision rule:** if `first_page_chars > 200`, extract every page with
`pypdf` and skip OCR. Otherwise the PDF is image-only — proceed to OCR.

### 3. OCR fallback (image-only PDFs)

Rasterise each page to a JPEG at 150–200 DPI, then run Tesseract with
auto page-segmentation (`--psm 1`) so it handles rotated pages
correctly — several MTS programmes have vertically-set pages that
Tesseract's default mode gets wrong.

```bash
mkdir -p /tmp/prog-ocr && cd /tmp/prog-ocr
pdftoppm -r 180 "$SHOW_DIR/programme.pdf" p -jpeg -jpegopt quality=80
: > ocr.txt
for img in p-*.jpg; do
  pg=$(basename "$img" .jpg | sed 's/p-//' | sed 's/^0*//')
  printf '\n===== PAGE %s =====\n' "$pg" >> ocr.txt
  tesseract "$img" - -l eng --psm 1 2>/dev/null >> ocr.txt
done
```

For a typical 12–16 page programme this takes 30–90 seconds. The
`references/extract-text.sh` script wraps these steps.

### 4. Read and interpret the text

Read `ocr.txt` end-to-end (or the pypdf output). Programmes usually follow
a predictable structure:

1. Cover / title page (title, dates, venue, credits)
2. Chairman's / director's welcome
3. Character list ↔ cast page
4. Musical numbers (Act I / Act II)
5. Production team ("Appointments")
6. Cast bios (individual performer pages)
7. Band / orchestra list
8. Society officers
9. In memoriam / farewells / sponsors

OCR reliably captures the text, but:
- Names occasionally get corrupted (e.g. `KING AR THUR` → `KING ARTHUR`
  because of tracked letter-spacing). Silently normalise obvious
  spacing artefacts.
- Where a name is genuinely ambiguous from the OCR, keep your best
  guess and mark it with `(?)` suffix. Preserve the raw OCR string in
  a sibling `ocr_raw` field on that cast entry.
- Where a page's content spans two columns and the OCR interleaves them,
  reconstruct the columns manually.

### 5. Cross-reference other programmes

The archive has other `programme.json` files — spot-check names against
them. A performer named "Alex Young" in one show is almost certainly the
same "Alex Young" in a neighbouring year, so if OCR renders it "Alx Yowmg"
in one place, use the other spelling.

Bios often reference past shows and roles — use these to disambiguate
cast entries you weren't sure about.

### 6. Determine show dates

Look on the cover, in the chairman's welcome ("Wednesday 5th to
Saturday 8th July 2017"), and in ticket-office info at the back. If
absent from the programme itself, check other years' programmes — they
frequently advertise the current year's shows (e.g. Spamalot 2017's
programme advertised Legally Blonde's July run).

If you genuinely cannot determine the dates, set `show.dates: null` and
add a `show.dates_note` explaining what evidence you have.

### 7. Assemble the JSON

Use the schema in `references/schema.md` and the fully-worked example in
`references/example.json`. Every field is optional except:
- `$schema_version` (always `1` for this schema)
- `show.title`, `show.year`, `show.organisation` (`"MTS"` or `"MYTS"`)
- `source.pdf` (should be `"programme.pdf"` per convention)

### 8. Write, validate, done

```bash
python3 -c "import json,sys; json.load(open(sys.argv[1]))" \
  "$SHOW_DIR/programme.json"
```

Confirm the JSON parses cleanly, then report to the user what you extracted
and what fields you left uncertain.

## Naming conventions

- **PDF filename:** `programme.pdf` (lowercase). On case-insensitive
  filesystems (APFS, exFAT) renaming e.g. `Programme.pdf` to lowercase
  needs a two-step rename via a temp name.
- **JSON filename:** `programme.json` (same folder as the PDF).
- **Show folder:** kebab-case slug of the title plus year — for shows
  with multiple productions of the same title, the year disambiguates
  (`the-mikado-1924`, `the-mikado-1995`, `the-mikado-2005`).
- **Organisation:** `MTS` for Musical Theatre Stafford (adult company),
  `MYTS` for Musical Youth Theatre Stafford. When in doubt, check whose
  chairman signs the welcome letter, or look for MYTS-specific youth
  shows (Bugsy Malone, Legally Blonde, High School Musical, Wizard of
  Oz, etc. tend to be MYTS).

## Quality bar

- Prefer partial-with-caveats over complete-but-invented. Mark
  uncertain names with `(?)`. Never fabricate a performer's surname.
- Include a top-level `source.extraction_method` field noting whether
  data came from embedded text or OCR — future readers need to know
  what confidence to place in the extraction.
- Retain interesting historical context (in-memoriam entries, farewells,
  awards mentions) — this archive is a heritage record for the Society.

## Deliverable

- `<show-folder>/programme.json` written and validated.
- A short summary to the user listing: show title, cast size, any fields
  that couldn't be recovered from the source, and any cross-referenceable
  ambiguities they may want to fix manually.
