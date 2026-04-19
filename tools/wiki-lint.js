#!/usr/bin/env node

/**
 * Wiki Lint - 健康检查工具
 * 
 * 用法:
 *   wiki-lint [options]
 * 
 * 选项:
 *   --orphans         只检查孤立页
 *   --contradictions  只检查矛盾
 *   --stale           只检查过时内容
 *   --all             检查所有（默认）
 *   --fix             自动修复（待实现）
 *   --verbose         详细输出
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

function extractLinks(content) {
  // 提取 [[页面名]] 格式的链接
  const links = [];
  const regex = /\[\[([^\]]+)\]\]/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

// ============================================================================
// 检查器
// ============================================================================

/**
 * 检查孤立页（无入链）
 */
function checkOrphans(verbose = false) {
  console.log('\n🔍 检查孤立页...\n');
  
  const pages = getAllWikiPages();
  const allLinks = new Set();

  // 收集所有页面中的链接
  for (const page of pages) {
    const content = readPage(page.path);
    if (!content) continue;
    
    const links = extractLinks(content);
    links.forEach(link => allLinks.add(link));
  }

  // 找出没有被引用的页面
  const orphans = pages.filter(page => {
    // index.md 和 log.md 不算孤立
    if (page.fileName === 'index.md' || page.fileName === 'log.md') {
      return false;
    }
    return !allLinks.has(page.title);
  });

  if (verbose) {
    console.log(`检查了 ${pages.length} 个页面`);
    console.log(`发现 ${orphans.length} 个孤立页\n`);
  }

  if (orphans.length === 0) {
    console.log('✅ 没有孤立页\n');
  } else {
    console.log('⚠️  孤立页：');
    orphans.forEach(p => {
      console.log(`   - ${p.path}`);
    });
    console.log();
  }

  return { orphans: orphans.map(p => p.path) };
}

/**
 * 检查矛盾（简单实现：检测特定关键词）
 */
function checkContradictions(verbose = false) {
  console.log('\n🔍 检查矛盾...\n');
  
  const pages = getAllWikiPages();
  const contradictions = [];

  // 简单实现：查找可能表示矛盾的关键词
  const contradictionKeywords = [
    '但是',
    '然而',
    '相反',
    '矛盾',
    '不一致',
    '待确认',
    'TODO',
    'FIXME',
  ];

  for (const page of pages) {
    const content = readPage(page.path);
    if (!content) continue;

    for (const keyword of contradictionKeywords) {
      if (content.includes(keyword)) {
        const lines = content.split('\n');
        const lineNum = lines.findIndex(l => l.includes(keyword)) + 1;
        
        contradictions.push({
          page: page.path,
          keyword,
          line: lineNum,
          context: lines[lineNum - 1]?.trim() || '',
        });
      }
    }
  }

  if (verbose) {
    console.log(`检查了 ${pages.length} 个页面`);
    console.log(`发现 ${contradictions.length} 个潜在矛盾点\n`);
  }

  if (contradictions.length === 0) {
    console.log('✅ 没有发现明显矛盾\n');
  } else {
    console.log('⚠️  潜在矛盾点：');
    contradictions.forEach(c => {
      console.log(`   - ${c.page}:${c.line} "${c.keyword}"`);
      console.log(`     ${c.context}`);
    });
    console.log();
  }

  return { contradictions };
}

/**
 * 检查过时内容（基于最后更新时间）
 */
function checkStale(verbose = false) {
  console.log('\n🔍 检查过时内容...\n');
  
  const pages = getAllWikiPages();
  const stale = [];
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  for (const page of pages) {
    const content = readPage(page.path);
    if (!content) continue;

    // 查找更新日期
    const dateMatch = content.match(/(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) continue;

    const lastUpdated = new Date(dateMatch[1]);
    if (lastUpdated < thirtyDaysAgo) {
      stale.push({
        page: page.path,
        lastUpdated: dateMatch[1],
        daysOld: Math.floor((Date.now() - lastUpdated) / (1000 * 60 * 60 * 24)),
      });
    }
  }

  if (verbose) {
    console.log(`检查了 ${pages.length} 个页面`);
    console.log(`发现 ${stale.length} 个超过 30 天未更新的页面\n`);
  }

  if (stale.length === 0) {
    console.log('✅ 没有过时内容\n');
  } else {
    console.log('⚠️  可能过时的页面：');
    stale.forEach(s => {
      console.log(`   - ${s.page} (更新于 ${s.lastUpdated}, ${s.daysOld}天前)`);
    });
    console.log();
  }

  return { stale };
}

/**
 * 检查缺失交叉引用
 */
function checkMissingReferences(verbose = false) {
  console.log('\n🔍 检查缺失交叉引用...\n');
  
  const pages = getAllWikiPages();
  const pageTitles = new Set(pages.map(p => p.title));
  const missing = [];

  for (const page of pages) {
    const content = readPage(page.path);
    if (!content) continue;

    // 查找加粗的潜在概念（**概念名**）
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(content)) !== null) {
      const concept = match[1];
      // 如果是页面标题格式，检查是否存在对应页面
      if (concept.length > 2 && !pageTitles.has(concept)) {
        missing.push({
          page: page.path,
          concept,
          suggestion: `考虑创建 concepts/${concept}.md`,
        });
      }
    }
  }

  if (verbose) {
    console.log(`检查了 ${pages.length} 个页面`);
    console.log(`发现 ${missing.length} 个缺失的交叉引用\n`);
  }

  if (missing.length === 0) {
    console.log('✅ 交叉引用完整\n');
  } else {
    console.log('💡 建议创建的页面：');
    missing.forEach(m => {
      console.log(`   - ${m.concept} (在 ${m.page} 中被提及)`);
      console.log(`     建议：${m.suggestion}`);
    });
    console.log();
  }

  return { missing };
}

// ============================================================================
// 日志记录
// ============================================================================

function appendLog(results) {
  const { orphans, contradictions, stale, missing } = results;
  
  const issues = orphans.length + contradictions.length + stale.length + missing.length;
  const status = issues === 0 ? '✅ 健康' : `⚠️  ${issues} 个问题`;

  const logEntry = `
## [${today()}] lint | health-check

**检查:** all

**结果:** ${status}

**发现:**
- 孤立页：${orphans.length}
- 潜在矛盾：${contradictions.length}
- 过时内容：${stale.length}
- 缺失引用：${missing.length}

**建议:** ${issues === 0 ? '无需操作' : '见详细报告'}

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

async function lint(options = {}) {
  const { 
    orphans: checkOrphansOnly, 
    contradictions: checkContradictionsOnly, 
    stale: checkStaleOnly,
    all = true,
    verbose = false,
  } = options;

  console.log(`\n🩺 Wiki 健康检查\n${'='.repeat(50)}`);

  const results = {
    orphans: [],
    contradictions: [],
    stale: [],
    missing: [],
  };

  try {
    if (checkOrphansOnly || all) {
      const r = checkOrphans(verbose);
      results.orphans = r.orphans;
    }

    if (checkContradictionsOnly || all) {
      const r = checkContradictions(verbose);
      results.contradictions = r.contradictions;
    }

    if (checkStaleOnly || all) {
      const r = checkStale(verbose);
      results.stale = r.stale;
    }

    if (all) {
      const r = checkMissingReferences(verbose);
      results.missing = r.missing;
    }

    // 总结
    console.log('📊 总结');
    console.log('='.repeat(50));
    console.log(`孤立页：${results.orphans.length}`);
    console.log(`潜在矛盾：${results.contradictions.length}`);
    console.log(`过时内容：${results.stale.length}`);
    console.log(`缺失引用：${results.missing.length}`);
    
    const total = results.orphans.length + results.contradictions.length + 
                  results.stale.length + results.missing.length;
    
    if (total === 0) {
      console.log('\n✅ Wiki 健康状态良好！\n');
    } else {
      console.log(`\n⚠️  发现 ${total} 个需要关注的问题\n`);
    }

    // 记录日志
    appendLog(results);

    return { success: true, results };

  } catch (error) {
    console.error(`\n❌ 检查失败：${error.message}\n`);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// CLI 入口
// ============================================================================

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🩺 Wiki Lint - 健康检查工具

用法:
  wiki-lint [options]

选项:
  --orphans         只检查孤立页
  --contradictions  只检查矛盾
  --stale           只检查过时内容
  --all             检查所有（默认）
  --verbose         详细输出
  --help            显示帮助

示例:
  wiki-lint                    # 检查所有
  wiki-lint --orphans          # 只检查孤立页
  wiki-lint --verbose          # 详细输出
`);
  process.exit(0);
}

const options = {
  orphans: args.includes('--orphans'),
  contradictions: args.includes('--contradictions'),
  stale: args.includes('--stale'),
  all: !args.includes('--orphans') && 
       !args.includes('--contradictions') && 
       !args.includes('--stale'),
  verbose: args.includes('--verbose'),
};

lint(options);
