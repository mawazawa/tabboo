#!/usr/bin/env node
/**
 * Install canonical MCP configuration into Cursor
 * Transforms canonical-config.json to Cursor's format
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const CANONICAL_CONFIG_PATH = '/Users/mathieuwauters/Desktop/code/mcp-config/canonical-config.json';
const CURSOR_CONFIG_PATH = join(homedir(), '.cursor', 'mcp.json');
const ENV_LOCAL_PATH = '/Users/mathieuwauters/Desktop/code/v0-justice-os-ai/.env.local';
const PNPM_PATH = '/opt/homebrew/bin/pnpm';

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

// Replace placeholders in config
function replacePlaceholders(config, envVars) {
  const configStr = JSON.stringify(config, null, 2);
  let replaced = configStr;
  
  // Replace common placeholders
  const replacements = {
    '{{MEMORY_FILE_PATH}}': '/Users/mathieuwauters/Desktop/code/memory/canonical/knowledge-graph.db',
    '{{NEO4J_URI}}': 'neo4j+s://3884f0bc.databases.neo4j.io',
    '{{NEO4J_USERNAME}}': 'neo4j',
    '{{NEO4J_PASSWORD}}': envVars.NEO4J_PASSWORD || 'cSYHw9FBEXzaa4PcFZgF',
    '{{NEO4J_DATABASE}}': 'neo4j',
    '{{PERPLEXITY_API_KEY}}': envVars.PERPLEXITY_API_KEY || '',
    '{{EXA_API_KEY}}': envVars.EXA_API_KEY || 'c3206133-e55a-4859-8510-c5884dbe900d',
    '{{GITHUB_PERSONAL_ACCESS_TOKEN}}': envVars.GITHUB_PERSONAL_ACCESS_TOKEN || '',
    '{{SUPABASE_ACCESS_TOKEN}}': envVars.SUPABASE_ACCESS_TOKEN || 'sbp_d117902556394d2d2085222e4f69546895aaea4f',
    '{{SUPABASE_SERVICE_ROLE_KEY}}': envVars.SUPABASE_SERVICE_ROLE_KEY || '',
    '{{STRIPE_API_KEY}}': envVars.STRIPE_SECRET_KEY || '',
    '{{NOTION_API_KEY}}': envVars.NOTION_API_KEY || '',
    '{{GOOGLE_MAPS_API_KEY}}': envVars.GOOGLE_MAPS_API_KEY || '',
    '{{REDIS_URL}}': envVars.REDIS_URL || '',
    '{{21ST_DEV_API_KEY}}': envVars['21ST_DEV_API_KEY'] || '',
  };
  
  Object.entries(replacements).forEach(([placeholder, value]) => {
    replaced = replaced.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  return JSON.parse(replaced);
}

// Transform canonical config to Cursor format
function transformToCursorFormat(canonicalConfig, envVars) {
  const cursorConfig = {
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
    
    // Handle URL-based servers (Linear, Supabase, Stripe, Vercel)
    if (name === 'linear') {
      cursorConfig.mcpServers[name] = {
        command: PNPM_PATH,
        args: ['dlx', 'mcp-remote', 'https://mcp.linear.app/sse']
      };
    } else if (name === 'supabase') {
      cursorConfig.mcpServers[name] = {
        url: `https://mcp.supabase.com/mcp?project_ref=${server.env?.SUPABASE_PROJECT_REF || 'rgrgfcesahcgxpuobbqq'}`
      };
    } else if (name === 'stripe') {
      cursorConfig.mcpServers[name] = {
        url: 'https://mcp.stripe.com'
      };
    } else if (name === 'vercel') {
      cursorConfig.mcpServers[name] = {
        url: 'https://mcp.vercel.com'
      };
    } else if (name === 'neo4j') {
      // Neo4j uses special format with --env flags
      cursorConfig.mcpServers['neo4j-alanse'] = {
        command: PNPM_PATH,
        args: ['dlx', '@alanse/mcp-neo4j-server@latest'],
        env: {
          NEO4J_URI: server.args?.find(arg => arg.includes('NEO4J_URI'))?.split('=')[1] || 'neo4j+s://3884f0bc.databases.neo4j.io',
          NEO4J_USERNAME: server.args?.find(arg => arg.includes('NEO4J_USERNAME'))?.split('=')[1] || 'neo4j',
          NEO4J_PASSWORD: server.args?.find(arg => arg.includes('NEO4J_PASSWORD'))?.split('=')[1] || envVars.NEO4J_PASSWORD || 'cSYHw9FBEXzaa4PcFZgF',
          NEO4J_DATABASE: server.args?.find(arg => arg.includes('NEO4J_DATABASE'))?.split('=')[1] || 'neo4j'
        }
      };
    } else if (name === 'filesystem') {
      // Update filesystem paths to include current workspace
      cursorConfig.mcpServers[name] = {
        command: PNPM_PATH,
        args: [
          'dlx',
          '-y',
          '@modelcontextprotocol/server-filesystem',
          '/Users/mathieuwauters/Desktop/code/tabboo',
          '/Users/mathieuwauters/Desktop/code',
          '/Users/mathieuwauters/.claude'
        ]
      };
    } else if (name === 'git-official') {
      // Update git repository path to current workspace
      cursorConfig.mcpServers['git-official'] = {
        command: PNPM_PATH,
        args: [
          'dlx',
          '-y',
          '@modelcontextprotocol/server-git',
          '--repository',
          '/Users/mathieuwauters/Desktop/code/tabboo'
        ]
      };
    } else if (name === 'langgraph-orchestrator') {
      // Keep custom server as-is
      cursorConfig.mcpServers[name] = {
        command: server.command,
        args: server.args,
        env: server.env
      };
    } else {
      // Standard npx -> pnpm dlx transformation
      const cursorServer = {
        command: PNPM_PATH,
        args: ['dlx', ...server.args.filter(arg => arg !== '-y' && arg !== 'npx')]
      };
      
      // Add environment variables if present
      if (server.env) {
        const env = {};
        Object.entries(server.env).forEach(([key, value]) => {
          // Replace placeholders in env values
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
            }
          }
          env[key] = envValue;
        });
        if (Object.keys(env).length > 0) {
          cursorServer.env = env;
        }
      }
      
      cursorConfig.mcpServers[name] = cursorServer;
    }
  });
  
  return cursorConfig;
}

// Main execution
try {
  console.log('📖 Reading canonical MCP configuration...');
  const canonicalConfig = JSON.parse(readFileSync(CANONICAL_CONFIG_PATH, 'utf-8'));
  
  console.log('🔑 Loading environment variables...');
  const envVars = loadEnvVars();
  
  console.log('🔄 Replacing placeholders...');
  const configWithValues = replacePlaceholders(canonicalConfig, envVars);
  
  console.log('✨ Transforming to Cursor format...');
  const cursorConfig = transformToCursorFormat(configWithValues, envVars);
  
  console.log(`💾 Writing to ${CURSOR_CONFIG_PATH}...`);
  writeFileSync(CURSOR_CONFIG_PATH, JSON.stringify(cursorConfig, null, 2), 'utf-8');
  
  console.log('✅ Successfully installed canonical MCP configuration!');
  console.log(`📊 Installed ${Object.keys(cursorConfig.mcpServers).length} MCP servers`);
  console.log('\n⚠️  Note: You may need to restart Cursor for changes to take effect.');
  
} catch (error) {
  console.error('❌ Error installing MCP configuration:', error.message);
  process.exit(1);
}

