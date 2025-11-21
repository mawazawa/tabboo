# PDF→DOM Architecture Research

> **Status**: Research & Planning
> **Date**: November 2025
> **Goal**: Build canonical internal representation (PDF→structured DOM) with polished viewer/editor on top

## Executive Summary

Building a PDF→React DOM pipeline that renders with near pixel-level fidelity, is editable, and round-trips to visually identical PDFs is **feasible** but **nontrivial**. Commercial SDKs implement partial solutions; open tools can get most of the way but edge cases (fonts, ligatures, vector art, complex forms) require bespoke work.

---

## 1. PDF Parsing Technologies

### Open Source

| Tool | Capabilities | Limitations |
|------|-------------|-------------|
| **pdf.js** (Mozilla) | Robust renderer, text extraction, exposes text positions | Per-glyph bounding boxes require workarounds |
| **PDFium** | Low-level access to paths, clipping, bounding boxes | Requires implementing CTM/drawing state handling |
| **Poppler/pdftotext** | Reliable text extraction with bbox options | Character-level bboxes tricky, varies by PDF internals |
| **pdf2htmlEX** | Fixed-position HTML preserving layout/fonts | Output hard to parse programmatically |

### Commercial

| SDK | Features | Notes |
|-----|----------|-------|
| **PSPDFKit** | Fixed-position HTML export, text/path extraction, PDF generation | Production-grade, paid |
| **PDFTron/Apryse** | Comprehensive conversion utilities, programmatic extraction | Paid, well-documented |

---

## 2. Layout Reconstruction Methods

**Pattern**: low-level extraction → logical grouping → semantic labeling → component mapping

### Core Steps

1. **Extract raw ops**: Drawing ops, text runs, glyph positions, images, vector paths (PDFium/Poppler/pdf.js)
2. **Normalize coordinates**: Canonical page coordinate system (account CTM, rotation, DPI)
3. **Group into layout blocks**:
   - Line clustering → paragraph detection → block segmentation
   - Table detection (Camelot/Tabula)
   - Semantic grouping (LayoutLM/GROBID/custom ML)
4. **Emit typed DOM/JSON schema**:
   ```
   Page → Layer → Block → TextRun → InlineStyles
                       → Table → Row → Cell
                       → Image
                       → Path
   ```

---

## 3. React Rendering with Print Fidelity

### Positioning Strategy

- **Absolute positioning** for pixel fidelity
- Each Page is fixed-size container with children via left/top/width/height
- CSS `transform` for CTM when useful
- pdf2htmlEX demonstrates this technique

### Font Handling

- Embed original fonts via `@font-face` with base64 subsets
- Fallback to mapped font with fidelity warning if not embedded
- Control kerning via subsetting and matching font metrics

### Vector Rendering

- PDF vector paths → SVG `<path>` elements or canvas
- Use SVG for editability and CSS control

### Text Rendering

- Keep `TextRun` as discrete spans for agent editability
- Store original glyph metrics (advance widths) for reflowless edits

### Print CSS

- Dedicated print stylesheet matching page size, margins, bleed
- Embed fonts for browser print/PDF output matching

---

## 4. DOM→PDF Export (Round-Trip)

### Option A: Headless Browser

- **Tools**: Chromium/Puppeteer or WKWebView
- **Pros**: Simple, fast previews
- **Cons**: Kerning/text shaping differences, browser PDF renderer variations

### Option B: Direct PDF Generation

- **Tools**: Apache PDFBox, PDFTron, low-level PDF libraries
- **Pros**: Higher control, better determinism
- **Cons**: Requires re-implementing PDF drawing semantics

### Recommended Hybrid

- Server-side deterministic PDF generation for legal final output
- Headless browser for fast previews
- Pixel-diff regression tests for quality assurance

---

## 5. Performance & Scaling

### Caching Strategy

- Precompute canonical JSON DOM per PDF
- Viewer loads DOM, not raw PDF
- Pre-render tiles/page images for fast display

### Progressive Loading

- Stream pages and lazy-hydrate React components
- Use virtualization for large documents

### Incremental Updates

- Store edits as JSON patches
- Re-generate only affected pages
- Support page-level incremental PDFs

### Scale Considerations

- Heavy CPU work (font subsetting, vector rasterization) on server workers
- Job queue for processing pipeline

---

## 6. Risks & Failure Modes

| Risk | Description | Mitigation |
|------|-------------|------------|
| **Fonts & shaping** | Non-embedded fonts, ligatures cause spacing differences | Font subsetting, fidelity warnings |
| **Vector complexity** | High-fidelity art may not map to SVG/HTML | Fallback to raster |
| **Form fields** | Interactive fields, digital signatures need special handling | Dedicated form field pipeline |
| **Tables** | Detection is heuristic, edge cases in legal forms | ML-assisted with manual override |
| **Non-determinism** | Browser engines differ | Use server-side PDF generation for final output |

---

## 7. Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INGEST LAYER (Server)                   │
│  PDF → PDFium + Poppler pipeline → fallback OCR (Tesseract) │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              LAYOUT RECONSTRUCTION & SEMANTICIZER           │
│  Heuristics + ML (LayoutLM, GROBID) → Canonical JSON DOM    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    STORAGE & CACHE                          │
│  JSON DOM + assets (fonts, images) + JSON patch history     │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              INTERACTIVE VIEWER/EDITOR (React)              │
│  Renders from JSON, edits mutate JSON via controlled API    │
│  SVG for paths, absolute spans for text, form components    │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                       AGENT API                             │
│  Read/write JSON model, submit patches, verification checks │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    EXPORT PIPELINE                          │
│  (a) Deterministic server PDF renderer (legal output)       │
│  (b) Headless Chromium (quick exports + fidelity checks)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. MVP Experiments

1. **Select test corpus**: 50 representative court PDFs (forms, pleadings, exhibits, scans)

2. **Run extractors**: pdf2htmlEX and pdf.js
   - Compare HTML and text positions
   - Measure pixel diff on roundtrip

3. **Build minimal renderer**:
   - JSON schema for one page type
   - React renderer
   - Edit text and re-export with Puppeteer
   - Evaluate kerning issues

4. **Integrate semantic models**:
   - LayoutLM/GROBID for labeling
   - Test on forms for auto-field detection

---

## 9. Team Composition

| Role | Responsibilities |
|------|------------------|
| **PDF Systems Engineer** | Low-level PDF parsing, glyph extraction |
| **Frontend React Engineer** | Pixel layout, SVG rendering |
| **Backend Engineer** | Render pipeline, job queue |
| **ML/DocAI Engineer** | Layout/semantic models |
| **QA Engineer** | Pixel diff, legal compliance testing |

---

## 10. Strategic Tradeoffs

### Fast MVP (Path A)
- High-quality fixed-position viewer using pdf2htmlEX/pdf.js or commercial SDK
- Simple edit layers
- Quick to market

### High Agent Leverage (Path B)
- Invest in canonical DOM first
- Higher automation potential
- Longer initial development

### Recommended: Hybrid (B core + A UI)
- Build canonical DOM as foundation
- Put polished viewer on top
- **Highest leverage for JusticeOS/SwiftFill**

---

## 11. Key References

- [pdf2htmlEX](https://pdf2htmlex.github.io/pdf2htmlEX/) - Fixed-position HTML conversion
- [PDFium API](https://pdfium.patagames.com/help/html/T_Patagames_Pdf_Pdfium.htm) - Paths, clip boxes
- [pdf.js glyph bboxes](https://github.com/mozilla/pdf.js/issues/12884) - API limits discussion
- [wkhtmltopdf kerning](https://github.com/wkhtmltopdf/wkhtmltopdf/issues/45) - Export pitfalls
- [LayoutLM](https://arxiv.org/pdf/1912.13318) - Document layout pre-training
- [GROBID](https://grobid.readthedocs.io/en/latest/Introduction/) - Scientific document extraction
- [Camelot](https://github.com/camelot-dev/camelot) - Table extraction

---

## Next Steps

### Deliverable Options

1. **Concrete JSON Schema**: Page, Block, TextRun, Table, Path definitions as canonical format

2. **Engineer Handoff Doc**: Specific API signatures for:
   - Extraction from PDFium/pdf.js
   - Generation via PDFTron or headless Chromium

---

*This research informs the long-term architecture for SwiftFill's PDF handling capabilities, enabling AI agent automation and high-fidelity legal document processing.*
