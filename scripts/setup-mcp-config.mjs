#!/usr/bin/env node
/**
 * MCP Configuration Setup Script
 * 
 * Generates .claude/mcp.json from environment variables
 * 
 * Usage:
 *   node scripts/setup-mcp-config.mjs
 * 
 * Required Environment Variables:
 *   - NEO4J_URI
 *   - NEO4J_USERNAME
 *   - NEO4J_PASSWORD
 *   - NEO4J_DATABASE
 *   - REDIS_URL
 *   - EXA_API_KEY
 *   - MEMORY_FILE_PATH
 *   - PROJECT_ROOT
 *   - CODE_ROOT
 *   - CLAUDE_ROOT
 *   - SUPABASE_PROJECT_REF
 *
 * Optional Environment Variables:
 *   - KNOWLEDGE_GRAPH_URL (defaults to local SSE URL)
 *   - GOOGLE_APPLICATION_CREDENTIALS (only required for BigQuery MCP)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Read template
const templatePath = join(projectRoot, '.claude/mcp.json.example');
const template = JSON.parse(readFileSync(templatePath, 'utf-8'));

// Required environment variables
const requiredVars = {
  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USERNAME: process.env.NEO4J_USERNAME || 'neo4j',
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
  NEO4J_DATABASE: process.env.NEO4J_DATABASE || 'neo4j',
  REDIS_URL: process.env.REDIS_URL,
  EXA_API_KEY: process.env.EXA_API_KEY,
  MEMORY_FILE_PATH: process.env.MEMORY_FILE_PATH,
  PROJECT_ROOT: process.env.PROJECT_ROOT || projectRoot,
  CODE_ROOT: process.env.CODE_ROOT || join(projectRoot, '..'),
  CLAUDE_ROOT: process.env.CLAUDE_ROOT || join(process.env.HOME || process.env.USERPROFILE || '', '.claude'),
  SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF,
  KNOWLEDGE_GRAPH_URL: process.env.KNOWLEDGE_GRAPH_URL || 'http://localhost:27495/mcp/sse',
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

const optionalEnvVars = new Set([
  'NEO4J_USERNAME',
  'NEO4J_DATABASE',
  'KNOWLEDGE_GRAPH_URL',
  'GOOGLE_APPLICATION_CREDENTIALS',
]);

// Check for missing required variables
const missingVars = Object.entries(requiredVars)
  .filter(([key, value]) => !value && !optionalEnvVars.has(key))
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  console.error('\nPlease set these variables in your environment or .env file');
  process.exit(1);
}

// Recursively substitute environment variables in the config
function substituteEnvVars(obj) {
  if (typeof obj === 'string') {
    // Replace ${VAR} or ${VAR:-default} patterns
    return obj.replace(/\$\{([^:}]+)(?::-([^}]+))?\}/g, (match, varName, defaultValue) => {
      const value = process.env[varName] || requiredVars[varName] || defaultValue || '';
      return value;
    });
  } else if (Array.isArray(obj)) {
    return obj.map(item => substituteEnvVars(item));
  } else if (obj !== null && typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = substituteEnvVars(value);
    }
    return result;
  }
  return obj;
}

// Generate config
const config = substituteEnvVars(template);

// Write config file
const configPath = join(projectRoot, '.claude/mcp.json');
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');

console.log('✅ MCP configuration generated successfully!');
console.log(`   Config file: ${configPath}`);
console.log('\n⚠️  Note: This file contains sensitive credentials and is excluded from git.');
console.log('   Make sure to set environment variables before running this script.');

