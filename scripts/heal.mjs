import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function runStep(name, command, fixCommand = null) {
  log(BLUE, `\n🔍 Checking: ${name}...`);
  try {
    execSync(command, { stdio: 'pipe' });
    log(GREEN, `✅ ${name} passed.`);
    return true;
  } catch (error) {
    log(RED, `❌ ${name} failed.`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    
    if (fixCommand) {
      log(YELLOW, `🛠️  Attempting fix: ${fixCommand}...`);
      try {
        execSync(fixCommand, { stdio: 'inherit' });
        log(GREEN, `✅ Fix applied successfully.`);
        // Retry check
        try {
          execSync(command, { stdio: 'pipe' });
          log(GREEN, `✅ ${name} passed after fix.`);
          return true;
        } catch (retryError) {
          log(RED, `❌ ${name} still failed after fix.`);
          return false;
        }
      } catch (fixError) {
        log(RED, `❌ Fix failed.`);
        return false;
      }
    }
    return false;
  }
}

async function heal() {
  log(BLUE, "🏥 Starting SwiftFill Self-Healing Protocol...");
  const timestamp = new Date().toISOString();
  const report = {
    timestamp,
    checks: [],
    status: 'pending'
  };

  let allPassed = true;

  // 1. Dependencies
  const depsPassed = runStep(
    "Dependencies", 
    "npm list --depth=0", 
    "npm install"
  );
  report.checks.push({ name: "Dependencies", passed: depsPassed });
  if (!depsPassed) allPassed = false;

  // 2. Type Check
  const typesPassed = runStep(
    "TypeScript Types", 
    "npm run typecheck"
  );
  report.checks.push({ name: "TypeScript Types", passed: typesPassed });
  if (!typesPassed) allPassed = false;

  // 3. Linting
  const lintPassed = runStep(
    "Linting", 
    "npm run lint", 
    "npm run lint -- --fix"
  );
  report.checks.push({ name: "Linting", passed: lintPassed });
  if (!lintPassed) allPassed = false;

  // 4. Unit Tests
  const testsPassed = runStep(
    "Unit Tests", 
    "npm run test"
  );
  report.checks.push({ name: "Unit Tests", passed: testsPassed });
  if (!testsPassed) allPassed = false;

  // 5. Build
  const buildPassed = runStep(
    "Production Build", 
    "npm run build"
  );
  report.checks.push({ name: "Production Build", passed: buildPassed });
  if (!buildPassed) allPassed = false;

  report.status = allPassed ? 'success' : 'failure';

  // Output report for Agent consumption
  const reportPath = path.join(__dirname, 'heal-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  if (allPassed) {
    log(GREEN, "\n✨ System is healthy! Ready for deployment.");
    process.exit(0);
  } else {
    log(RED, "\n⚠️ System requires manual intervention. See output above.");
    log(YELLOW, `📄 Report saved to ${reportPath}`);
    process.exit(1);
  }
}

heal();

