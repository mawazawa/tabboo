export type FieldIndexMap = Record<string, number>;

export const mergeFieldNameToIndex = (
  legacyMap: FieldIndexMap,
  dbFieldNames?: string[] | null
): FieldIndexMap => {
  const merged: FieldIndexMap = { ...legacyMap };

  if (!dbFieldNames || dbFieldNames.length === 0) {
    return merged;
  }

  const legacyIndexes = Object.values(merged);
  let nextIndex = legacyIndexes.length > 0 ? Math.max(...legacyIndexes) + 1 : 0;

  dbFieldNames.forEach((fieldName) => {
    if (!(fieldName in merged)) {
      merged[fieldName] = nextIndex;
      nextIndex += 1;
    }
  });

  return merged;
};

