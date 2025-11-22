# 🤖 Web Agent Protocol: Glass Layer Field Mapping

**Objective**: Map 1,303 fields for DV-100 and DV-105 forms using the new "Glass Layer" tool.
**Priority**: Critical (Unblocks DVRO Packet Release).

## 1. Setup
1.  Navigate to the staging environment or run `npm run dev`.
2.  Open the **Form Viewer**.
3.  Select the target form (e.g., `DV-100` or `DV-105`).
4.  Press `E` to toggle **Edit Mode** (Verify "Glass Layer" UI activates).

## 2. The "Glass Layer" Protocol
**Guidelines**:
-   **Neon Orange** means ACTIVE.
-   **Precision matters**: Align fields exactly with the PDF baselines.
-   **Naming Convention**: Use the exact `itemXa_description` format from `DV100_COMPLETE_FIELD_GUIDE.md`.

**Procedure**:
1.  **Draw**: Click and drag to draw a box around a PDF form field.
    *   *Visual Feedback*: You will see a scanning neon orange reticle.
2.  **Tag**: In the dialog that appears:
    *   **Name**: Paste the exact field name (e.g., `item1a_yourName`).
    *   **Type**: Select `Input`, `Checkbox`, `Textarea`, or `Date`.
3.  **Export**:
    *   Open Browser Console (`Cmd+Opt+J`).
    *   Look for `JSON for Field Mapping`.
    *   Copy the JSON object.
4.  **Persist**:
    *   Paste the JSON into the `form_fields` database table (or collect for bulk insert).

## 3. Assignments (Parallel Execution)

### Agent A (DV-100 Part 1)
-   **Scope**: Pages 1-5 (Items 1-8).
-   **Focus**: Personal info, Relationship, History of Abuse.
-   **Reference**: `docs/DV100_COMPLETE_FIELD_GUIDE.md`.

### Agent B (DV-100 Part 2)
-   **Scope**: Pages 6-13 (Items 9-34).
-   **Focus**: Orders requested, Guns, Animals, Signature.
-   **Reference**: `docs/DV100_COMPLETE_FIELD_GUIDE.md`.

### Agent C (DV-105)
-   **Scope**: All 6 Pages.
-   **Focus**: Child Custody and Visitation.
-   **Reference**: `docs/DV105_COMPLETE_FIELD_GUIDE.md`.

## 4. Quality Assurance
-   **Overlap Check**: Ensure no fields overlap.
-   **Alignment**: Inputs should align with PDF lines.
-   **Validation**: Verify Zod schema matches field names.

---
**Status**: Tooling is LIVE. Ready for execution.

