# programme.json schema (v1)

This is the schema every `programme.json` in the MTS archive should follow.
Fields marked **required** must always be present; every other field is
optional and should be omitted (rather than set to null) when there's
nothing meaningful to record — except where a `null` sentinel is
explicitly called out (e.g. `show.dates: null` when the run dates could
not be determined and you want to signal that intentionally).

## Top-level

```jsonc
{
  "$schema_version": 1,          // required — always 1 for this schema
  "show": { ... },               // required
  "source": { ... },             // required
  "cast": [ ... ],
  "ensemble": { ... } | [ ... ], // shape varies by show
  "band": { ... },
  "production_team": [ ... ],
  "society_officers": { ... },
  "musical_numbers": { ... },
  "gatehouse_theatre_officials": [ ... ],
  "page_sponsors": [ ... ],
  "in_memoriam": [ ... ],
  "farewells": [ ... ],
  "context_notes": [ ... ]
}
```

## `show` (required)

```jsonc
{
  "title": "Monty Python's Spamalot",     // required — full official title
  "short_title": "Spamalot",              // colloquial short form
  "year": 2017,                           // required — the production year
  "organisation": "MTS",                  // required — "MTS" or "MYTS"
  "organisation_name_at_time": "...",     // e.g. old society name for pre-2016 shows
  "venue": "Stafford Gatehouse Theatre",  // usually this; set if different
  "venue_note": "...",                    // e.g. "Borough Hall (now the Gatehouse)"
  "dates": "5-8 July 2017",               // free-text run dates; null if unknown
  "dates_note": "...",                    // supporting evidence when dates are guessed
  "book": ["..."],                        // book credits (array of names)
  "book_lyrics": ["..."],                 // if book and lyrics are combined
  "music": ["..."],
  "lyrics": ["..."],
  "music_and_lyrics": ["..."],            // if combined
  "based_on": "...",                      // e.g. "Monty Python and the Holy Grail (1975 film)"
  "licensor": "Josef Weinberger Ltd on behalf of MTI, New York",
  "programme_type": "Souvenir Programme", // if unusual, e.g. "Musical revue (in-house original)"
  "notable": "...",                       // one-liner: awards, first performance, etc.
  "awards_context": "..."                 // e.g. "Won NODA Best Youth Musical."
}
```

## `source` (required)

```jsonc
{
  "pdf": "programme.pdf",                 // required — should always be this
  "pdf_bytes": 51873326,                  // file size at extraction time
  "pdf_created": "2017-05-16",            // from PDF /CreationDate if present
  "extracted_from_pages": 16,             // page count of the source PDF
  "extraction_method": "OCR (scanned PDF, no embedded text)",  // or "pypdf text extraction"
  "note": "..."                           // any provenance quirk worth recording
}
```

## `cast`

Array of `{character, performer}` objects. Prefer one entry per role
(not per performer) so double-cast performers appear twice.

```jsonc
[
  { "character": "King Arthur of Briton", "performer": "Tom Gosling" },
  { "character": "Patsy", "performer": "Tracey Brough-Chesters" },
  { "character": "Sir Galahad / Dennis", "performer": "Will Wood" }, // combined role
  { "character": "The Historian & French Taunter 2", "performer": "Helene Sandy" },
  { "character": "Sharpay Evans", "performer": "Tabby Carr(?)", "ocr_raw": "Tabby Car",
    "note": "OCR uncertainty" }
]
```

When a role has multiple performers (e.g. two Kangaroos), emit two rows
with the same `character` value and a `note` explaining the share.

## `ensemble`

For shows where the ensemble is one flat list, use an array:

```jsonc
["Rob Mincher", "Jon Wilson", "Dave Phizacklea", ...]
```

For shows with named ensemble subgroups (Laker Girls, Bird Girls,
Wickersham Brothers, etc.), use an object keyed by subgroup:

```jsonc
{
  "knights_and_maidens": [...],
  "laker_girls": [...],
  "notes": { "Stewart Bishop": "billed as Sir Bors" }
}
```

## `band`

```jsonc
{
  "conductor": { "instrument": "Conductor", "player": "Calum Robarts" },
  "musicians": [
    { "instrument": "Reed I", "player": "Peter Godfrey" },
    { "instrument": "Reed II", "player": "Anna Bourne" },
    ...
  ],
  "note": "Musicians were given mock-Arthurian titles in the programme; real names shown here."
}
```

## `production_team`

Array of `{role, person}` (single person) or `{role, people: [...]}`
(multiple) entries. Preserve the programme's order rather than sorting.

```jsonc
[
  { "role": "Director", "person": "Rachel Millar" },
  { "role": "Musical Director", "person": "Calum Robarts" },
  { "role": "Backstage Crew", "people": ["Mike Hartley", "Neil Norman", "Rebecca Steed"] },
  { "role": "Make-up", "people": ["Ruby Ashton"], "note": "and team" }
]
```

## `society_officers`

Flat object of role → person (or array). For programmes that list both
MTS and MYTS officials, nest by organisation:

```jsonc
{
  "President": "Sue Zurawiel",
  "Chairman": "Roger Foxcroft",
  "Committee Members": ["...", "..."]
}
```

or

```jsonc
{
  "MYTS": { "Chairman": "...", ... },
  "MTS":  { "Chairman": "...", ... }
}
```

## `musical_numbers`

Split by act, with per-song performer credits when the programme provides
them:

```jsonc
{
  "act_1": [
    { "title": "Overture", "performers": ["Orchestra"] },
    { "title": "Fisch Schlapping Dance", "performers": ["Mayor", "Chorus"] }
  ],
  "act_2": [ ... ],
  "note": "..."   // e.g. "Programme did not split into acts; presented as single running order."
}
```

For revues, add a `from` field per song naming the source musical, and
optionally a `section` field for programme-designed sub-headings.

## Optional sections

- **`page_sponsors`** — array of strings; the "Page Sponsor" credits
  that programmes print in the margins.
- **`in_memoriam`** — array of `{name, note}` objects.
- **`farewells`** — array of `{name, role, note}` objects for members
  leaving the group.
- **`context_notes`** — array of strings; any historical or contextual
  observations worth preserving that don't fit elsewhere (e.g. "MYTS's
  15th anniversary; delayed 2 years by COVID.").
- **`sponsors_and_thanks`** — array of strings for the acknowledgements
  section.
- **`gatehouse_theatre_officials`** — array of `{role, person}` for the
  venue's staff credits when the programme prints them.
