#!/usr/bin/env node
/**
 * Install canonical MCP configuration into package.json for Claude Code CLI
 * Claude Code CLI reads MCP config from package.json.claudeCode.mcpServers
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CANONICAL_CONFIG_PATH = '/Users/mathieuwauters/Desktop/code/mcp-config/canonical-config.json';
const PACKAGE_JSON_PATH = '/Users/mathieuwauters/Desktop/code/tabboo/package.json';
const ENV_LOCAL_PATH = '/Users/mathieuwauters/Desktop/code/v0-justice-os-ai/.env.local';

// Read environment variables from .env.local
function loadEnvVars() {
  const envVars = {};
  if (existsSync(ENV_LOCAL_PATH)) {
    const envContent = readFileSync(ENV_LOCAL_PATH, 'utf-8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match) {
        const [, key, value] = match;
        // Remove quotes if present
        envVars[key] = value.replace(/^["']|["']$/g, '');
      }
    });
  }
  return envVars;
}

// Transform canonical config to Claude Code CLI format (npx commands)
function transformToClaudeCodeFormat(canonicalConfig, envVars) {
  const claudeCodeConfig = {
    mcpServers: {}
  };
  
  const servers = canonicalConfig.mcpServers;
  
  // Transform each server
  Object.entries(servers).forEach(([name, server]) => {
    // Skip servers marked as needing testing or not working
    if (server.status && server.status.includes('⚠️')) {
      console.log(`⚠️  Skipping ${name} (needs testing)`);
      return;
    }
    
    // Handle special cases
    if (name === 'neo4j') {
      // Neo4j uses special format with --env flags, convert to env object
      claudeCodeConfig.mcpServers[name] = {
        command: 'npx',
        args: ['-y', '@alanse/mcp-neo4j-server@latest'],
        env: {
          NEO4J_URI: 'neo4j+s://3884f0bc.databases.neo4j.io',
          NEO4J_USERNAME: 'neo4j',
          NEO4J_PASSWORD: envVars.NEO4J_PASSWORD || 'cSYHw9FBEXzaa4PcFZgF',
          NEO4J_DATABASE: 'neo4j'
        },
        enabled: true
      };
    } else if (name === 'linear') {
      // Linear uses SSE transport
      claudeCodeConfig.mcpServers[name] = {
        command: 'npx',
        args: ['-y', 'mcp-remote', 'https://mcp.linear.app/sse'],
        enabled: true
      };
    } else if (name === 'supabase') {
      // Supabase - use npx format
      claudeCodeConfig.mcpServers[name] = {
        command: 'npx',
        args: ['-y', '@supabase/mcp-server-supabase@latest'],
        env: {
          SUPABASE_ACCESS_TOKEN: envVars.SUPABASE_ACCESS_TOKEN || '',
          SUPABASE_PROJECT_REF: server.env?.SUPABASE_PROJECT_REF || 'rgrgfcesahcgxpuobbqq',
          SUPABASE_URL: server.env?.SUPABASE_URL || 'https://rgrgfcesahcgxpuobbqq.supabase.co',
          SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY || ''
        },
        enabled: true
      };
    } else if (name === 'stripe') {
      // Stripe - use npx format
      claudeCodeConfig.mcpServers[name] = {
        command: 'npx',
        args: ['-y', '@stripe/mcp', '--tools=all'],
        env: {
          STRIPE_API_KEY: envVars.STRIPE_SECRET_KEY || envVars.STRIPE_API_KEY || ''
        },
        enabled: true
      };
    } else if (name === 'vercel') {
      // Vercel - use npx format
      claudeCodeConfig.mcpServers[name] = {
        command: 'npx',
        args: ['-y', '@vercel/mcp-adapter@latest'],
        env: {
          VERCEL_TOKEN: envVars.VERCEL_TOKEN || ''
        },
        enabled: true
      };
    } else if (name === 'langgraph-orchestrator') {
      // Skip custom server that requires local server
      console.log(`⚠️  Skipping ${name} (requires local server)`);
      return;
    } else {
      // Standard transformation - keep npx format
      const claudeServer = {
        command: 'npx',
        args: server.args.filter(arg => arg !== 'npx'),
        enabled: true
      };
      
      // Add environment variables if present
      if (server.env) {
        const env = {};
        Object.entries(server.env).forEach(([key, value]) => {
          // Replace placeholders
          let envValue = value;
          if (typeof envValue === 'string' && envValue.includes('{{')) {
            // Handle placeholder replacement
            if (key === 'MEMORY_FILE_PATH') {
              envValue = '/Users/mathieuwauters/Desktop/code/memory/canonical/knowledge-graph.db';
            } else if (key === 'EXA_API_KEY') {
              envValue = envVars.EXA_API_KEY || 'c3206133-e55a-4859-8510-c5884dbe900d';
            } else if (key === 'PERPLEXITY_API_KEY') {
              envValue = envVars.PERPLEXITY_API_KEY || '';
            } else if (key === 'GITHUB_PERSONAL_ACCESS_TOKEN') {
              envValue = envVars.GITHUB_PERSONAL_ACCESS_TOKEN || '';
            } else if (key === 'NOTION_API_KEY') {
              envValue = envVars.NOTION_API_KEY || '';
            } else if (key === 'GOOGLE_MAPS_API_KEY') {
              envValue = envVars.GOOGLE_MAPS_API_KEY || '';
            } else if (key === 'REDIS_URL') {
              envValue = envVars.REDIS_URL || '';
            } else if (key === 'API_KEY' && name === '@21st-dev/magic') {
              envValue = envVars['21ST_DEV_API_KEY'] || '';
            } else {
              // Use environment variable reference format
              envValue = `\${${key}}`;
            }
          }
          env[key] = envValue;
        });
        if (Object.keys(env).length > 0) {
          claudeServer.env = env;
        }
      }
      
      claudeCodeConfig.mcpServers[name] = claudeServer;
    }
  });
  
  return claudeCodeConfig;
}

// Main execution
try {
  console.log('📖 Reading canonical MCP configuration...');
  const canonicalConfig = JSON.parse(readFileSync(CANONICAL_CONFIG_PATH, 'utf-8'));
  
  console.log('🔑 Loading environment variables...');
  const envVars = loadEnvVars();
  
  console.log('✨ Transforming to Claude Code CLI format...');
  const claudeCodeConfig = transformToClaudeCodeFormat(canonicalConfig, envVars);
  
  console.log('📦 Reading package.json...');
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf-8'));
  
  // Update or create claudeCode section
  if (!packageJson.claudeCode) {
    packageJson.claudeCode = {};
  }
  
  packageJson.claudeCode.mcpServers = claudeCodeConfig.mcpServers;
  
  console.log(`💾 Writing to ${PACKAGE_JSON_PATH}...`);
  writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  
  console.log('✅ Successfully installed canonical MCP configuration into package.json!');
  console.log(`📊 Installed ${Object.keys(claudeCodeConfig.mcpServers).length} MCP servers`);
  console.log('\n⚠️  Note: Claude Code CLI will read this configuration from package.json');
  
} catch (error) {
  console.error('❌ Error installing MCP configuration:', error.message);
  console.error(error.stack);
  process.exit(1);
}

