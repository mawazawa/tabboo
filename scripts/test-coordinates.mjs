import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

async function testExtract(pdfPath) {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const form = pdfDoc.getForm();
  const fields = form.getFields();

  console.log(`Total fields: ${fields.length}`);
  
  // Check first 5 fields for widgets/rects
  for (let i = 0; i < 5; i++) {
    const field = fields[i];
    const name = field.getName();
    const type = field.constructor.name;
    
    // Access widgets (visual representations)
    // Note: This depends on pdf-lib version, but usually involves acroField.getWidgets()
    // For high-level fields in pdf-lib, we might need to access the low-level refs.
    
    console.log(`Field: ${name} (${type})`);
    
    // Try to get widgets via acroField (low level)
    const acroField = field.acroField;
    const widgets = acroField.getWidgets();
    
    widgets.forEach((widget, wIdx) => {
      const rect = widget.getRectangle();
      console.log(`  Widget ${wIdx}: [${rect.x}, ${rect.y}, ${rect.width}, ${rect.height}]`);
      
      // We need page info too. Widgets are referenced by pages.
      // This is the tricky part in pdf-lib: finding WHICH page a widget is on efficiently.
      // Usually need to iterate pages and check their annotations.
    });
  }
}

testExtract('./public/dv100.pdf').catch(console.error);

