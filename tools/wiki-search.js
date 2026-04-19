#!/usr/bin/env node

/**
 * Wiki Search - 搜索 wiki 页面
 * 
 * 用法:
 *   wiki-search "关键词" [options]
 * 
 * 选项:
 *   --title           只搜索标题
 *   --tag             搜索标签
 *   --content         搜索内容（默认）
 *   --regex           使用正则表达式
 *   --limit <n>       限制结果数量（默认 10）
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// 配置
// ============================================================================

const WIKI_ROOT = join(__dirname, '..');
const WIKI_DIR = join(WIKI_ROOT, 'memory/wiki');

// ============================================================================
// 工具函数
// ============================================================================

function getAllWikiPages() {
  const pages = [];
  const categories = ['entities', 'concepts', 'sources', 'queries'];

  for (const category of categories) {
    const dir = join(WIKI_DIR, category);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      pages.push({
        category,
        fileName: file,
        path: `${category}/${file}`,
        title: file.replace('.md', ''),
      });
    }
  }

  return pages;
}

function readPage(relativePath) {
  const fullPath = join(WIKI_DIR, relativePath);
  if (!existsSync(fullPath)) {
    return null;
  }
  return readFileSync(fullPath, 'utf-8');
}

function extractTags(content) {
  const match = content.match(/\*\*标签:\*\*\s*\[([^\]]+)\]/);
  if (!match) return [];
  return match[1].split(',').map(t => t.trim());
}

// ============================================================================
// 搜索功能
// ============================================================================

/**
 * 搜索标题
 */
function searchByTitle(query, pages, useRegex = false) {
  const results = [];
  const regex = useRegex ? new RegExp(query, 'i') : null;

  for (const page of pages) {
    const match = useRegex 
      ? regex.test(page.title)
      : page.title.toLowerCase().includes(query.toLowerCase());
    
    if (match) {
      results.push({
        ...page,
        matchType: 'title',
        snippet: page.title,
      });
    }
  }

  return results;
}

/**
 * 搜索标签
 */
function searchByTag(query, pages, useRegex = false) {
  const results = [];
  const regex = useRegex ? new RegExp(query, 'i') : null;

  for (const page of pages) {
    const content = readPage(page.path);
    if (!content) continue;

    const tags = extractTags(content);
    const match = tags.some(tag => {
      return useRegex ? regex.test(tag) : tag.toLowerCase().includes(query.toLowerCase());
    });

    if (match) {
      results.push({
        ...page,
        matchType: 'tag',
        snippet: `标签：${tags.join(', ')}`,
        tags,
      });
    }
  }

  return results;
}

/**
 * 搜索内容
 */
function searchByContent(query, pages, useRegex = false) {
  const results = [];
  const regex = useRegex ? new RegExp(query, 'gi') : null;

  for (const page of pages) {
    const content = readPage(page.path);
    if (!content) continue;

    const match = useRegex 
      ? regex.test(content)
      : content.toLowerCase().includes(query.toLowerCase());
    
    if (match) {
      // 提取包含关键词的上下文
      const lines = content.split('\n');
      let snippet = '';
      
      for (const line of lines) {
        const lineMatch = useRegex
          ? regex.test(line)
          : line.toLowerCase().includes(query.toLowerCase());
        
        if (lineMatch) {
          snippet = line.trim().slice(0, 100);
          if (line.length > 100) snippet += '...';
          break;
        }
      }

      results.push({
        ...page,
        matchType: 'content',
        snippet: snippet || content.slice(0, 100) + '...',
      });
    }
  }

  return results;
}

/**
 * 综合搜索
 */
function search(query, options = {}) {
  const { 
    mode = 'content',  // title | tag | content
    useRegex = false,
    limit = 10,
  } = options;

  const pages = getAllWikiPages();
  let results = [];

  switch (mode) {
    case 'title':
      results = searchByTitle(query, pages, useRegex);
      break;
    case 'tag':
      results = searchByTag(query, pages, useRegex);
      break;
    case 'content':
    default:
      results = searchByContent(query, pages, useRegex);
      break;
  }

  // 限制结果数量
  return results.slice(0, limit);
}

// ============================================================================
// 输出格式化
// ============================================================================

function formatResults(results, query) {
  if (results.length === 0) {
    return `未找到与 "${query}" 相关的页面。`;
  }

  const lines = [
    `找到 ${results.length} 个结果：\n`,
  ];

  results.forEach((r, i) => {
    lines.push(`${i + 1}. [[${r.title}]](./${r.path})`);
    lines.push(`   类型：${r.matchType}`);
    lines.push(`   摘要：${r.snippet}`);
    if (r.tags) {
      lines.push(`   标签：${r.tags.join(', ')}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}

// ============================================================================
// 主流程
// ============================================================================

async function wikiSearch(query, options = {}) {
  if (!query) {
    console.log('❌ 请提供搜索关键词\n');
    return { success: false, error: 'No query provided' };
  }

  try {
    const results = search(query, options);
    const output = formatResults(results, query);
    
    console.log(output);
    
    return { success: true, results, output };

  } catch (error) {
    console.error(`\n❌ 搜索失败：${error.message}\n`);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CLI 入口
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0 || args[0].startsWith('--')) {
  console.log(`
🔍 Wiki Search - 搜索 wiki 页面

用法:
  wiki-search "关键词" [options]

选项:
  --title           只搜索标题
  --tag             搜索标签
  --content         搜索内容（默认）
  --regex           使用正则表达式
  --limit <n>       限制结果数量（默认 10）

示例:
  wiki-search "记忆"
  wiki-search "agent" --title
  wiki-search "wiki|knowledge" --regex --limit 5
`);
  process.exit(0);
}

const query = args[0];
const options = {
  mode: args.includes('--title') ? 'title' 
         : args.includes('--tag') ? 'tag' 
         : 'content',
  useRegex: args.includes('--regex'),
  limit: parseInt(args[args.indexOf('--limit') + 1]) || 10,
};

wikiSearch(query, options);
