/**
 * Field Position Validator
 * Analyzes field positions for overlaps and alignment issues
 */

const FIELD_POSITIONS = {
  // Attorney/Party Information
  partyName: { top: 15.8, left: 5, width: 40, height: 2.4 },
  streetAddress: { top: 19, left: 5, width: 40, height: 2.4 },
  city: { top: 22.5, left: 5, width: 23, height: 2.4 },
  state: { top: 22.5, left: 29.5, width: 7, height: 2.4 },
  zipCode: { top: 22.5, left: 38, width: 7, height: 2.4 },
  telephoneNo: { top: 25.8, left: 5, width: 16, height: 2.4 },
  faxNo: { top: 25.8, left: 23, width: 22, height: 2.4 },
  email: { top: 29.2, left: 5, width: 40, height: 2.4 },
  attorneyFor: { top: 32.5, left: 5, width: 35, height: 2.4 },
  attorneyBarNumber: { top: 32.5, left: 42, width: 8, height: 2.4 },

  // Case Information
  county: { top: 15.8, left: 55, width: 40, height: 2.4 },
  petitioner: { top: 22.5, left: 55, width: 40, height: 2.4 },
  respondent: { top: 26.5, left: 55, width: 40, height: 2.4 },
  caseNumber: { top: 32.5, left: 55, width: 40, height: 2.4 },

  // Hearing Information
  hearingDate: { top: 38, left: 20, width: 15, height: 2.4 },
  hearingTime: { top: 38, left: 37, width: 12, height: 2.4 },
  hearingDepartment: { top: 38, left: 51, width: 10, height: 2.4 },
  hearingRoom: { top: 38, left: 63, width: 10, height: 2.4 },

  // Child Information
  child1Name: { top: 41.5, left: 20, width: 35, height: 2.4 },
  child1BirthDate: { top: 41.5, left: 57, width: 15, height: 2.4 },
  child2Name: { top: 44.5, left: 20, width: 35, height: 2.4 },
  child2BirthDate: { top: 44.5, left: 57, width: 15, height: 2.4 },
  child3Name: { top: 47.5, left: 20, width: 35, height: 2.4 },
  child3BirthDate: { top: 47.5, left: 57, width: 15, height: 2.4 },

  // Order Types (checkboxes - smaller height)
  orderChildCustody: { top: 51, left: 5, width: 2, height: 2 },
  orderVisitation: { top: 54, left: 5, width: 2, height: 2 },
  orderChildSupport: { top: 57, left: 5, width: 2, height: 2 },
  orderSpousalSupport: { top: 60, left: 5, width: 2, height: 2 },
  orderAttorneyFees: { top: 63, left: 5, width: 2, height: 2 },
  orderPropertyControl: { top: 66, left: 5, width: 2, height: 2 },
  orderOther: { top: 69, left: 5, width: 2, height: 2 },
  orderOtherText: { top: 69, left: 25, width: 70, height: 2.4 },

  // Response Type
  noOrders: { top: 72.5, left: 5, width: 2, height: 2 },
  agreeOrders: { top: 75.5, left: 5, width: 2, height: 2 },
  consentCustody: { top: 78.5, left: 5, width: 2, height: 2 },
  consentVisitation: { top: 81.5, left: 5, width: 2, height: 2 },

  // Facts and Declaration
  facts: { top: 85, left: 5, width: 90, height: 8 },
  declarationUnderPenalty: { top: 93.5, left: 5, width: 2, height: 2 },

  // Signature
  signatureDate: { top: 96, left: 5, width: 15, height: 2.4 },
  signatureName: { top: 96, left: 30, width: 30, height: 2.4 },
  printName: { top: 96, left: 65, width: 30, height: 2.4 },
};

function checkOverlap(field1, field2, pos1, pos2) {
  const right1 = pos1.left + pos1.width;
  const bottom1 = pos1.top + pos1.height;
  const right2 = pos2.left + pos2.width;
  const bottom2 = pos2.top + pos2.height;

  const overlapX = !(right1 < pos2.left || pos1.left > right2);
  const overlapY = !(bottom1 < pos2.top || pos1.top > bottom2);

  return overlapX && overlapY;
}

function analyzePositions() {
  console.log('🔍 FIELD POSITION ANALYSIS');
  console.log('=' .repeat(80));

  const fields = Object.entries(FIELD_POSITIONS);
  const overlaps = [];
  const outOfBounds = [];
  const tooClose = [];

  // Check for overlaps and out-of-bounds
  for (let i = 0; i < fields.length; i++) {
    const [name1, pos1] = fields[i];

    // Check if out of bounds
    if (pos1.left < 0 || pos1.top < 0 || pos1.left + pos1.width > 100 || pos1.top + pos1.height > 100) {
      outOfBounds.push({
        field: name1,
        issue: `Extends beyond PDF (${pos1.left + pos1.width > 100 ? 'right' : 'left'}/${pos1.top + pos1.height > 100 ? 'bottom' : 'top'})`
      });
    }

    // Check for overlaps with other fields
    for (let j = i + 1; j < fields.length; j++) {
      const [name2, pos2] = fields[j];

      if (checkOverlap(name1, name2, pos1, pos2)) {
        overlaps.push({
          field1: name1,
          field2: name2,
          pos1,
          pos2
        });
      } else {
        // Check if fields are too close (less than 1% margin)
        const distanceX = Math.min(
          Math.abs(pos2.left - (pos1.left + pos1.width)),
          Math.abs(pos1.left - (pos2.left + pos2.width))
        );
        const distanceY = Math.min(
          Math.abs(pos2.top - (pos1.top + pos1.height)),
          Math.abs(pos1.top - (pos2.top + pos2.height))
        );

        if (distanceX < 1 && distanceY < 1 && distanceX > 0 && distanceY > 0) {
          tooClose.push({
            field1: name1,
            field2: name2,
            distance: Math.min(distanceX, distanceY).toFixed(2)
          });
        }
      }
    }
  }

  // Report results
  console.log('\n📊 SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total fields: ${fields.length}`);
  console.log(`Overlaps found: ${overlaps.length}`);
  console.log(`Out of bounds: ${outOfBounds.length}`);
  console.log(`Too close (< 1%): ${tooClose.length}`);

  if (overlaps.length > 0) {
    console.log('\n❌ OVERLAPPING FIELDS');
    console.log('-'.repeat(80));
    overlaps.forEach(({ field1, field2, pos1, pos2 }) => {
      console.log(`  ${field1} (${pos1.left},${pos1.top}) ⚠️  OVERLAPS ⚠️  ${field2} (${pos2.left},${pos2.top})`);
    });
  } else {
    console.log('\n✅ No overlapping fields detected!');
  }

  if (outOfBounds.length > 0) {
    console.log('\n❌ OUT OF BOUNDS FIELDS');
    console.log('-'.repeat(80));
    outOfBounds.forEach(({ field, issue }) => {
      console.log(`  ${field}: ${issue}`);
    });
  } else {
    console.log('✅ All fields within PDF bounds!');
  }

  if (tooClose.length > 0) {
    console.log('\n⚠️  FIELDS TOO CLOSE (May overlap visually)');
    console.log('-'.repeat(80));
    tooClose.forEach(({ field1, field2, distance }) => {
      console.log(`  ${field1} <-> ${field2}: ${distance}% apart`);
    });
  }

  // Check alignment
  console.log('\n📐 ALIGNMENT ANALYSIS');
  console.log('-'.repeat(80));

  const leftAligned = {};
  const topAligned = {};

  fields.forEach(([name, pos]) => {
    // Group by left position (within 0.5%)
    const leftKey = Math.round(pos.left * 2) / 2;
    if (!leftAligned[leftKey]) leftAligned[leftKey] = [];
    leftAligned[leftKey].push(name);

    // Group by top position (within 0.5%)
    const topKey = Math.round(pos.top * 2) / 2;
    if (!topAligned[topKey]) topAligned[topKey] = [];
    topAligned[topKey].push(name);
  });

  console.log('\nVertically aligned columns:');
  Object.entries(leftAligned)
    .filter(([, fields]) => fields.length > 1)
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
    .forEach(([left, fields]) => {
      console.log(`  ${left}%: ${fields.join(', ')}`);
    });

  console.log('\nHorizontally aligned rows:');
  Object.entries(topAligned)
    .filter(([, fields]) => fields.length > 1)
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
    .forEach(([top, fields]) => {
      console.log(`  ${top}%: ${fields.join(', ')}`);
    });

  // Generate test data
  console.log('\n📝 TEST DATA FOR VISUAL VERIFICATION');
  console.log('-'.repeat(80));
  const testData = {
    partyName: 'Jane Smith',
    streetAddress: '123 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    telephoneNo: '(555) 123-4567',
    faxNo: '(555) 123-4568',
    email: 'jane.smith@example.com',
    attorneyFor: 'Self-Represented',
    attorneyBarNumber: 'N/A',
    county: 'Los Angeles',
    petitioner: 'John Doe',
    respondent: 'Jane Smith',
    caseNumber: 'FL12345678',
    hearingDate: '12/15/2025',
    hearingTime: '9:00 AM',
    hearingDepartment: 'Dept 3',
    hearingRoom: '301',
    child1Name: 'Emily Jane Smith',
    child1BirthDate: '03/15/2015',
    child2Name: 'Michael John Smith',
    child2BirthDate: '07/22/2018',
    child3Name: 'Sarah Ann Smith',
    child3BirthDate: '11/08/2020',
    facts: 'Respondent requests modification of custody arrangement due to change in work schedule. New schedule allows for increased parenting time during weekdays.',
    signatureDate: new Date().toLocaleDateString('en-US'),
    signatureName: 'Jane Smith',
    printName: 'JANE SMITH'
  };

  console.log(JSON.stringify(testData, null, 2));

  // Final score
  console.log('\n🎯 OVERALL QUALITY SCORE');
  console.log('='.repeat(80));

  const maxScore = 100;
  let score = maxScore;

  // Deduct points for issues
  score -= overlaps.length * 10; // -10 points per overlap
  score -= outOfBounds.length * 15; // -15 points per out-of-bounds
  score -= Math.min(tooClose.length * 2, 20); // -2 points per too-close, max -20

  console.log(`Score: ${score}/100`);

  if (score >= 90) {
    console.log('Grade: A - Excellent positioning!');
  } else if (score >= 80) {
    console.log('Grade: B - Good positioning with minor issues');
  } else if (score >= 70) {
    console.log('Grade: C - Acceptable but needs refinement');
  } else if (score >= 60) {
    console.log('Grade: D - Significant issues, requires fixes');
  } else {
    console.log('Grade: F - Critical issues, major revision needed');
  }

  console.log('\n' + '='.repeat(80));
}

analyzePositions();
