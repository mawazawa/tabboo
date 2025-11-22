import fs from 'fs';

const content = fs.readFileSync('src/types/FormData.ts', 'utf8');

function extractFields(interfaceName) {
  const startRegex = new RegExp(`export interface ${interfaceName} \{`, 'g');
  const startMatch = startRegex.exec(content);
  if (!startMatch) return [];

  const startIndex = startMatch.index;
  let braceCount = 1;
  let endIndex = startIndex + startMatch[0].length;

  while (braceCount > 0 && endIndex < content.length) {
    if (content[endIndex] === '{') braceCount++;
    if (content[endIndex] === '}') braceCount--;
    endIndex++;
  }

  const block = content.substring(startIndex, endIndex);
  const lines = block.split('\n');
  const fields = [];
  
  let lastComment = '';

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Match comment
    const commentMatch = trimmed.match(/\/\*\* (.*?) \*\//);
    if (commentMatch) {
      lastComment = commentMatch[1];
    }

    // Match field definition: name?: type;
    const fieldMatch = trimmed.match(/^(\w+)\?: (string|boolean);/);
    if (fieldMatch) {
      const [_, name, type] = fieldMatch;
      
      // Heuristics for type
      let fieldType = 'input';
      if (type === 'boolean') fieldType = 'checkbox';
      
      const context = (lastComment + name).toLowerCase();
      if (context.includes('date')) fieldType = 'date';
      if (context.includes('signature') || context.includes('sign')) fieldType = 'signature';
      if (context.includes('describe') || context.includes('facts') || context.includes('explain') || context.includes('orders')) fieldType = 'textarea';
      
      // Special case: "yes"/"no" checkboxes often come in pairs, user might want to know
      
      fields.push({
        name,
        label: lastComment || name, // Fallback to name if no comment (e.g. table rows)
        type: fieldType
      });
    }
  }

  return fields;
}

const dv100Fields = extractFields('DV100FormData');
const dv105Fields = extractFields('DV105FormData');

const output = {
  'DV-100': dv100Fields,
  'DV-105': dv105Fields
};

fs.writeFileSync('src/lib/field-manifest.json', JSON.stringify(output, null, 2));
console.log(`Generated manifest with ${dv100Fields.length} DV-100 fields and ${dv105Fields.length} DV-105 fields.`);
