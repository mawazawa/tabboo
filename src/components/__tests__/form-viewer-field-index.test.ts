import { describe, expect, it } from "vitest";
import { mergeFieldNameToIndex } from "@/lib/field-name-index-utils";

const mockLegacyMap = {
  partyName: 0,
  caseNumber: 20,
} as const;

describe("mergeFieldNameToIndex", () => {
  it("falls back to legacy indexes when database data is missing", () => {
    const map = mergeFieldNameToIndex(mockLegacyMap, ["partyName"]);
    expect(map.caseNumber).toBe(20);
  });

  it("assigns deterministic indexes for fields only available in the database", () => {
    const map = mergeFieldNameToIndex(mockLegacyMap, ["field_not_in_legacy"]);
    const maxIndex = Math.max(...Object.values(map));
    expect(map.field_not_in_legacy).toBe(maxIndex);
  });
});

