#!/usr/bin/env node

/**
 * Wiki Ingest - 摄入源文档到 wiki
 * 
 * 用法:
 *   wiki-ingest <file|url> [options]
 * 
 * 选项:
 *   --batch <pattern>  批量摄入（glob 模式）
 *   --skip-discuss     跳过讨论环节
 *   --dry-run          预览不写入
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// 配置
// ============================================================================

const WIKI_ROOT = join(__dirname, '..');
const WIKI_DIR = join(WIKI_ROOT, 'memory/wiki');
const RAW_DIR = join(WIKI_ROOT, 'memory/raw');
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
    mkdirSync(dir, { recursive: true });
  }
}

// ============================================================================
// 核心功能
// ============================================================================

/**
 * 读取源文档
 */
function readSource(source) {
  if (source.startsWith('http://') || source.startsWith('https://')) {
    // TODO: 实现 URL 抓取
    console.log(`[Ingest] 抓取 URL: ${source}`);
    throw new Error('URL 抓取功能待实现');
  } else {
    // 本地文件
    const filePath = source.startsWith('/') ? source : join(process.cwd(), source);
    if (!existsSync(filePath)) {
      throw new Error(`文件不存在：${filePath}`);
    }
    console.log(`[Ingest] 读取文件：${filePath}`);
    return readFileSync(filePath, 'utf-8');
  }
}

/**
 * 提取源文档元数据
 */
function extractMetadata(content, source) {
  // 简单实现：提取标题和关键句
  const lines = content.split('\n').filter(l => l.trim());
  const title = lines[0]?.replace(/^#+\s*/, '') || basename(source, extname(source));
  const firstParagraph = lines.slice(1, 5).join(' ');
  
  return {
    title,
    summary: firstParagraph.slice(0, 200) + '...',
    wordCount: content.length,
  };
}

/**
 * 创建 Source 页
 */
function createSourcePage(metadata, source) {
  const slug = slugify(metadata.title);
  const fileName = `${pascalCase(slug)}.md`;
  
  const content = `# ${metadata.title}

**来源:** ${source}
**类型:** 文章 | 论文 | 视频 | 播客
**日期:** ${today()}
**标签:** [待分类]

## 核心要点
- 要点 1
- 要点 2
- 要点 3

## 详细摘要
${metadata.summary}

## 与 wiki 的关联
- 待更新：相关概念和实体页

## 引用
> 待提取重要原文

---

*摄入日期：${today()} | 多比 🧦 整理*
`;

  return { fileName, content };
}

/**
 * 更新 index.md
 */
function updateIndex(sourcePage, type = 'sources') {
  if (!existsSync(INDEX_FILE)) {
    console.log('[Index] 创建 index.md');
    return;
  }

  const index = readFileSync(INDEX_FILE, 'utf-8');
  
  // 简单实现：追加到表格末尾
  // TODO: 实现智能插入（按字母顺序）
  const newLine = `| [[${sourcePage.fileName.replace('.md', '')}]](./${type}/${sourcePage.fileName}) | 待补充 | 1 | ${today()} |`;
  
  // 找到对应表格并插入
  const updated = index.replace(
    /(## 📚 Sources\n\n\| 页面 \| 类型 \| 摄入日期 \|\n\|------\|------\|----------\|)/,
    `$1\n${newLine}`
  );

  writeFileSync(INDEX_FILE, updated);
  console.log('[Index] 已更新 index.md');
}

/**
 * 追加 log.md
 */
function appendLog(source, sourcePage) {
  const logEntry = `
## [${today()}] ingest | ${sourcePage.fileName.replace('.md', '')}

**类型:** 源文档摄入

**源:** ${source}

**创建:**
- sources/${sourcePage.fileName}

**更新:**
- index.md

**状态:** ✅ 完成

---
`;

  if (existsSync(LOG_FILE)) {
    const log = readFileSync(LOG_FILE, 'utf-8');
    writeFileSync(LOG_FILE, log + logEntry);
  } else {
    writeFileSync(LOG_FILE, `# Wiki Log\n\n> 时间线日志\n\n---\n${logEntry}`);
  }
  
  console.log('[Log] 已追加 log.md');
}

/**
 * 保存源文档到 raw/
 */
function saveRawSource(content, source) {
  const fileName = basename(source);
  const rawPath = join(RAW_DIR, 'articles', fileName);
  
  ensureDir(join(RAW_DIR, 'articles'));
  writeFileSync(rawPath, content);
  
  console.log(`[Raw] 已保存到 ${rawPath}`);
  return rawPath;
}

// ============================================================================
// 主流程
// ============================================================================

async function ingest(source, options = {}) {
  const { dryRun = false, skipDiscuss = true } = options;

  console.log(`\n📥 开始摄入：${source}\n`);

  try {
    // 1. 读取源文档
    const content = readSource(source);
    console.log(`[Read] 读取 ${content.length} 字符\n`);

    if (dryRun) {
      console.log('[Dry Run] 预览模式，不写入文件');
      return;
    }

    // 2. 提取元数据
    const metadata = extractMetadata(content, source);
    console.log(`[Meta] 标题：${metadata.title}`);
    console.log(`[Meta] 摘要：${metadata.summary}\n`);

    // 3. 保存原始文档
    saveRawSource(content, source);

    // 4. 创建 Source 页
    const sourcePage = createSourcePage(metadata, source);
    const sourcePath = join(WIKI_DIR, 'sources', sourcePage.fileName);
    
    ensureDir(join(WIKI_DIR, 'sources'));
    writeFileSync(sourcePath, sourcePage.content);
    console.log(`[Wiki] 创建 sources/${sourcePage.fileName}\n`);

    // 5. 更新 index.md
    updateIndex(sourcePage, 'sources');

    // 6. 追加 log.md
    appendLog(source, sourcePage);

    console.log(`\n✅ 摄入完成！`);
    console.log(`   源文件：${source}`);
    console.log(`   Wiki 页：sources/${sourcePage.fileName}`);
    console.log(`   原始档：raw/articles/${basename(source)}\n`);

  } catch (error) {
    console.error(`\n❌ 摄入失败：${error.message}\n`);
    process.exit(1);
  }
}

// ============================================================================
// CLI 入口
// ============================================================================

const args = process.argv.slice(2);
const source = args[0];

if (!source) {
  console.log(`
📚 Wiki Ingest - 摄入源文档到 wiki

用法:
  wiki-ingest <file|url> [options]

选项:
  --dry-run    预览不写入
  --batch      批量摄入（待实现）

示例:
  wiki-ingest article.md
  wiki-ingest https://example.com/post.md
  wiki-ingest report.pdf --dry-run
`);
  process.exit(0);
}

const options = {
  dryRun: args.includes('--dry-run'),
};

ingest(source, options);
