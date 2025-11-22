import https from 'https';

const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = 'XnZQy3f4qiSW4jynM6Vx6j';
const NODE_IDS = [
  '70-180', '70-176', '70-175', '70-174', '70-216', '70-213', 
  '70-186', '70-165', '70-164', '70-162', '70-158', '70-157', 
  '70-155', '70-149', '70-146', '70-134', '70-127'
];

if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_ACCESS_TOKEN environment variable is required.');
  process.exit(1);
}

async function fetchFigmaFile(fileKey) {
  return new Promise((resolve, reject) => {
    // Fetch file with depth 2 to see Pages and Frames
    const options = {
      hostname: 'api.figma.com',
      path: `/v1/files/${fileKey}?depth=3`,
      method: 'GET',
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Figma API Error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function fetchFigmaNodes(fileKey, nodeIds) {
    return new Promise((resolve, reject) => {
      const formattedIds = nodeIds.map(id => id.replace('-', ':')).join(',');
      const options = {
        hostname: 'api.figma.com',
        path: `/v1/files/${fileKey}/nodes?ids=${formattedIds}`,
        method: 'GET',
        headers: { 'X-Figma-Token': FIGMA_TOKEN }
      };
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Figma API Error: ${res.statusCode} - ${data}`));
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

async function main() {
  console.log(`Fetching File Structure to find Parent Frame...`);
  
  try {
    const fileData = await fetchFigmaFile(FILE_KEY);
    const pages = fileData.document.children;
    
    console.log(`Found ${pages.length} pages.`);
    
    // Find a frame that likely contains our nodes.
    // We know our nodes have x ~ 700, y ~ 0.
    // Let's look for a Frame that contains these coordinates.
    // Also look for standard page size (612x792).
    
    let targetFrame = null;
    
    // First, get the nodes to verify their absolute position again
    const formattedIds = NODE_IDS.map(id => id.replace('-', ':'));
    const nodeResponse = await fetchFigmaNodes(FILE_KEY, formattedIds);
    const nodes = nodeResponse.nodes;
    const firstNode = nodes[formattedIds[0]].document;
    const sampleX = firstNode.absoluteBoundingBox.x;
    const sampleY = firstNode.absoluteBoundingBox.y;
    
    console.log(`Sample Field Position: (${sampleX}, ${sampleY})`);

    outerLoop:
    for (const page of pages) {
        console.log(`Checking Page: ${page.name}`);
        for (const child of page.children) {
            if (child.type === 'FRAME' || child.type === 'GROUP') {
                const bbox = child.absoluteBoundingBox;
                if (bbox) {
                    // Check if sample point is inside
                    if (sampleX >= bbox.x && sampleX <= bbox.x + bbox.width &&
                        sampleY >= bbox.y && sampleY <= bbox.y + bbox.height) {
                        
                        console.log(`Found Candidate Frame: ${child.name} (${bbox.x},${bbox.y}) ${bbox.width}x${bbox.height}`);
                        
                        // Relaxed check: Just need to contain the point and be substantial in size
                        if (bbox.width > 100) {
                             targetFrame = child;
                             break outerLoop;
                        }
                    }
                }
            }
        }
    }
    
    if (!targetFrame) {
        console.log("Could not automatically identify frame. Using first frame on first page as fallback if reasonable.");
        // Fallback logic...
        const firstFrame = pages[0].children.find(c => c.type === 'FRAME');
        if (firstFrame) targetFrame = firstFrame;
    }

    if (!targetFrame) {
        throw new Error("No suitable parent frame found.");
    }
    
    console.log(`Using Parent Frame: ${targetFrame.name} [${targetFrame.id}]`);
    
    const parentBox = targetFrame.absoluteBoundingBox;
    const PAGE_WIDTH = parentBox.width;
    const PAGE_HEIGHT = parentBox.height;
    const OFFSET_X = parentBox.x;
    const OFFSET_Y = parentBox.y;
    const STANDARD_HEIGHT_PX = 24; 

    const mappings = [];

    for (const id of formattedIds) {
      const node = nodes[id];
      if (!node) continue;

      const doc = node.document;
      const bbox = doc.absoluteBoundingBox;
      if (!bbox) continue;

      const x_local = bbox.x - OFFSET_X;
      const y_line_local = bbox.y - OFFSET_Y;
      
      // Debug first item
      if (mappings.length === 0) {
          console.log(`DEBUG MATH for ${id}:`);
          console.log(`Node X: ${bbox.x}`);
          console.log(`Frame X: ${OFFSET_X}`);
          console.log(`Local X: ${x_local}`);
          console.log(`Page Width: ${PAGE_WIDTH}`);
          console.log(`Result %: ${(x_local / PAGE_WIDTH) * 100}`);
      }
      
      // Shift up by standard height so the box sits on top of the line
      const y_top_local = y_line_local - STANDARD_HEIGHT_PX;
      
      const mapping = {
        field: `field_${id.replace(':', '_')}`, 
        type: 'input',
        rect: {
          left: parseFloat(((x_local / PAGE_WIDTH) * 100).toFixed(4)),
          top: parseFloat(((y_top_local / PAGE_HEIGHT) * 100).toFixed(4)),
          width: parseFloat(((bbox.width / PAGE_WIDTH) * 100).toFixed(4)),
          height: parseFloat(((STANDARD_HEIGHT_PX / PAGE_HEIGHT) * 100).toFixed(4))
        },
        meta: {
          figma_id: id,
          name: doc.name
        }
      };
      
      mappings.push(mapping);
    }

    console.log('\nGenerated Field Mappings (JSON):');
    console.log(JSON.stringify(mappings, null, 2));
    
    // Generate SQL
    console.log('\nGenerating SQL...');
    let sql = `
DO $$
DECLARE
  v_form_id uuid;
  v_field_id uuid;
BEGIN
  -- Get DV-100 Form ID
  SELECT id INTO v_form_id FROM judicial_council_forms WHERE form_number = 'DV-100' LIMIT 1;

  IF v_form_id IS NULL THEN
    RAISE EXCEPTION 'Form DV-100 not found in judicial_council_forms';
  END IF;
`;

    for (const m of mappings) {
        // Use the Figma ID as the key, sanitizing colon to underscore
        const key = `figma_${m.meta.figma_id.replace(':', '_')}`;
        const label = `Imported Field ${m.meta.figma_id}`;
        
        sql += `
  -- Field: ${key}
  INSERT INTO canonical_fields (field_key, field_label, field_type)
  VALUES ('${key}', '${label}', 'text')
  ON CONFLICT (field_key) DO UPDATE SET field_type = 'text'
  RETURNING id INTO v_field_id;

  INSERT INTO form_field_mappings (
    form_id, field_id, form_field_name, page_number, 
    position_top, position_left, field_width, field_height
  )
  VALUES (
    v_form_id, v_field_id, '${key}', 1, 
    ${m.rect.top}, ${m.rect.left}, ${m.rect.width}, ${m.rect.height}
  )
  ON CONFLICT (form_id, form_field_name) DO UPDATE SET
    position_top = EXCLUDED.position_top,
    position_left = EXCLUDED.position_left,
    field_width = EXCLUDED.field_width,
    field_height = EXCLUDED.field_height;
`;
    }

    sql += `
END $$;
`;
    
    const fs = await import('fs');
    fs.writeFileSync('supabase/migrations/20251122_import_dv100_figma_fields.sql', sql);
    console.log('SQL migration file written to supabase/migrations/20251122_import_dv100_figma_fields.sql');

  } catch (error) {
    console.error('Failed:', error.message);
  }
}

main();
