#!/usr/bin/env node

/**
 * Wiki Query - 查询 wiki 并综合回答
 * 
 * 用法:
 *   wiki-query "问题" [options]
 * 
 * 选项:
 *   --format <type>   输出格式 (markdown|table|marp|json)
 *   --save            保存结果为 query 页
 *   --verbose         显示详细过程
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
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
const INDEX_FILE = join(WIKI_DIR, 'index.md');
const LOG_FILE = join(WIKI_DIR, 'log.md');

// ============================================================================
// 工具函数
// ============================================================================

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(text) {
  return text
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function pascalCase(text) {
  return text
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    import('fs').then(({ mkdirSync }) => mkdirSync(dir, { recursive: true }));
  }
}

// ============================================================================
// 搜索功能
// ============================================================================

/**
 * 从 index.md 搜索相关页面
 */
function searchIndex(query) {
  if (!existsSync(INDEX_FILE)) {
    console.log('[Search] index.md 不存在');
    return [];
  }

  const index = readFileSync(INDEX_FILE, 'utf-8');
  const lines = index.split('\n');
  const results = [];
  const queryLower = query.toLowerCase();

  // 匹配表格行中的 wiki 链接
  // 格式：| [[页面名]](./路径/文件.md) | 摘要 | ...
  for (const line of lines) {
    if (!line.includes('[[')) continue;
    
    // 检查行是否包含查询关键词（在标题或摘要中）
    // 支持中英文搜索
    if (!line.toLowerCase().includes(queryLower)) continue;
    
    // 提取所有 [[页面名]](./路径) 格式的链接
    const linkRegex = /\[\[([^\]]+)\]\]\(\.\/([^\)]+)\)/g;
    let match;
    
    while ((match = linkRegex.exec(line)) !== null) {
      results.push({
        title: match[1],
        path: match[2],
        line: line.trim(),
      });
    }
  }

  // 如果 index 搜索无结果，尝试直接搜索 wiki 页面内容
  if (results.length === 0) {
    return searchWikiContent(query);
  }

  return results;
}

/**
 * 搜索 wiki 页面内容
 */
function searchWikiContent(query) {
  const results = [];
  const categories = ['entities', 'concepts', 'sources', 'queries'];
  const queryLower = query.toLowerCase();

  for (const category of categories) {
    const dir = join(WIKI_DIR, category);
    if (!existsSync(dir)) continue;

    const files = readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const content = readFileSync(join(dir, file), 'utf-8');
      if (content.toLowerCase().includes(queryLower)) {
        results.push({
          title: file.replace('.md', ''),
          path: `${category}/${file}`,
          line: 'content match',
        });
      }
    }
  }

  return results;
}

/**
 * 读取 wiki 页面
 */
function readPage(relativePath) {
  const fullPath = join(WIKI_DIR, relativePath);
  if (!existsSync(fullPath)) {
    return null;
  }
  return readFileSync(fullPath, 'utf-8');
}

/**
 * 全文搜索 wiki
 */
function searchWiki(query) {
  const { readdirSync } = import('fs');
  const { join } = import('path');
  
  // TODO: 实现递归搜索所有 markdown 文件
  console.log('[Search] 全文搜索功能待实现');
  return searchIndex(query);
}

// ============================================================================
// 综合回答
// ============================================================================

/**
 * 综合多个页面生成回答
 */
function synthesize(query, pages) {
  if (pages.length === 0) {
    return {
      answer: `未找到与 "${query}" 相关的页面。`,
      sources: [],
    };
  }

  const sources = pages.map(p => `- [[${p.title}]](./${p.path})`);
  
  const answer = `# 关于 "${query}"

## 综合回答

基于以下 wiki 页面：

${sources.join('\n')}

## 相关内容

${pages.map(p => {
  const content = readPage(p.path);
  if (!content) return '';
  
  // 提取第一段内容
  const firstSection = content.split('\n\n')[1] || '';
  return `### ${p.title}\n\n${firstSection.slice(0, 300)}...`;
}).join('\n\n')}

---

*查询日期：${today()} | 多比 🧦 综合*
`;

  return { answer, sources: pages.map(p => p.title) };
}

/**
 * 格式化为表格
 */
function formatAsTable(query, pages) {
  if (pages.length === 0) {
    return '| 页面 | 摘要 |\n|------|------|\n| 无 | 未找到相关内容 |';
  }

  const rows = pages.map(p => {
    const content = readPage(p.path);
    const summary = content ? content.split('\n')[2] || '无摘要' : '页面不存在';
    return `| ${p.title} | ${summary} |`;
  });

  return `# ${query}\n\n| 页面 | 摘要 |\n|------|------|\n${rows.join('\n')}`;
}

/**
 * 格式化为 Marp 幻灯片
 */
function formatAsMarp(query, pages) {
  return `---
marp: true
theme: gaia
paginate: true
---

# ${query}

查询日期：${today()}

---

## 相关页面

${pages.map(p => `- [[${p.title}]]`).join('\n')}

---

## 详细内容

${pages.map((p, i) => {
  const content = readPage(p.path);
  return `### ${p.title}\n\n${content ? content.slice(0, 500) : '页面不存在'}...`;
}).join('\n\n---\n\n')}

---

*多比 🧦 生成*
`;
}

// ============================================================================
// 日志记录
// ============================================================================

function appendLog(query, result, saved = false) {
  const logEntry = `
## [${today()}] query | ${slugify(query)}

**问题:** "${query}"

**回答:** ${saved ? `queries/${pascalCase(slugify(query))}.md` : '未保存'}

**引用:** ${result.sources.join(', ') || '无'}

**状态:** ${result.sources.length > 0 ? '✅ 找到' : '⚠️ 未找到'}

---
`;

  if (existsSync(LOG_FILE)) {
    const log = readFileSync(LOG_FILE, 'utf-8');
    writeFileSync(LOG_FILE, log + logEntry);
  }
}

// ============================================================================
// 主流程
// ============================================================================

async function queryWiki(question, options = {}) {
  const { format = 'markdown', save = false, verbose = false } = options;

  if (verbose) {
    console.log(`\n🔍 查询：${question}\n`);
  }

  try {
    // 1. 搜索 index
    if (verbose) console.log('[Search] 搜索 index.md...');
    const pages = searchIndex(question);
    
    if (verbose) {
      console.log(`[Search] 找到 ${pages.length} 个相关页面`);
      pages.forEach(p => console.log(`  - ${p.title}`));
      console.log();
    }

    // 2. 综合回答
    let output;
    switch (format) {
      case 'table':
        output = formatAsTable(question, pages);
        break;
      case 'marp':
        output = formatAsMarp(question, pages);
        break;
      case 'json':
        output = JSON.stringify({
          question,
          pages: pages.map(p => ({ title: p.title, path: p.path })),
          answer: synthesize(question, pages).answer,
        }, null, 2);
        break;
      default:
        output = synthesize(question, pages).answer;
    }

    // 3. 输出结果
    console.log(output);

    // 4. 保存为 query 页（可选）
    if (save && pages.length > 0) {
      const queryDir = join(WIKI_DIR, 'queries');
      ensureDir(queryDir);
      
      const fileName = `${pascalCase(slugify(question))}.md`;
      const queryPath = join(queryDir, fileName);
      
      writeFileSync(queryPath, output);
      console.log(`\n💾 已保存到 queries/${fileName}`);
      
      // 更新 index.md（TODO）
      // appendLog(question, synthesize(question, pages), true);
    }

    return { success: true, pages, output };

  } catch (error) {
    console.error(`\n❌ 查询失败：${error.message}\n`);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CLI 入口
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0 || args[0].startsWith('--')) {
  console.log(`
🔍 Wiki Query - 查询 wiki 并综合回答

用法:
  wiki-query "问题" [options]

选项:
  --format <type>   输出格式：markdown (默认) | table | marp | json
  --save            保存结果为 query 页
  --verbose         显示详细过程

示例:
  wiki-query "dobi-harness 的核心思想"
  wiki-query "wiki 模式" --format table
  wiki-query "记忆系统" --save --verbose
`);
  process.exit(0);
}

const question = args[0];
const options = {
  format: args.includes('--format') ? args[args.indexOf('--format') + 1] : 'markdown',
  save: args.includes('--save'),
  verbose: args.includes('--verbose'),
};

queryWiki(question, options);
