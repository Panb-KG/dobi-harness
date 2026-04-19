#!/usr/bin/env node

/**
 * Wiki Integration - Harness Orchestrator 集成模块
 * 
 * 用法:
 * import { WikiIntegration } from './wiki-integration.js';
 * 
 * const wiki = new WikiIntegration();
 * await wiki.ingestTaskResult(task, result);
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const __dirname = import.meta.dirname;
const WIKI_ROOT = join(__dirname, '..');
const WIKI_DIR = join(WIKI_ROOT, 'memory/wiki');
const LOG_FILE = join(WIKI_DIR, 'log.md');

// ============================================================================
// Wiki Integration 类
// ============================================================================

export class WikiIntegration {
  constructor(config = {}) {
    this.config = {
      autoIngest: true,
      autoUpdateEntities: true,
      autoUpdateConcepts: true,
      ...config,
    };
  }

  /**
   * 获取今天的日期
   */
  today() {
    return new Date().toISOString().slice(0, 10);
  }

  /**
   * 将任务结果摄入 wiki
   */
  async ingestTaskResult(task, result, options = {}) {
    const { 
      updateEntities = [], 
      updateConcepts = [],
      category = 'queries'
    } = options;

    console.log(`[Wiki] 摄入任务结果：${task}`);

    try {
      // 1. 创建 Query 页
      const queryPage = this.createQueryPage(task, result);
      const queryDir = join(WIKI_DIR, category);
      
      if (!existsSync(queryDir)) {
        mkdirSync(queryDir, { recursive: true });
      }

      const queryPath = join(queryDir, queryPage.fileName);
      writeFileSync(queryPath, queryPage.content);
      console.log(`[Wiki] 创建 ${category}/${queryPage.fileName}`);

      // 2. 更新 Entity 页（如果指定）
      for (const entity of updateEntities) {
        await this.updateEntity(entity, result);
      }

      // 3. 更新 Concept 页（如果指定）
      for (const concept of updateConcepts) {
        await this.updateConcept(concept, result);
      }

      // 4. 追加 log.md
      this.appendLog(task, queryPage);

      console.log(`[Wiki] ✅ 摄入完成`);
      return { success: true, page: queryPage.fileName };

    } catch (error) {
      console.error(`[Wiki] ❌ 摄入失败：${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 创建 Query 页面
   */
  createQueryPage(task, result) {
    const slug = this.slugify(task);
    const fileName = `${this.pascalCase(slug)}.md`;
    
    const content = `# ${task}

**问题:** ${task}
**日期:** ${this.today()}
**相关:** [[待补充]]

## 综合回答

${result.summary || result.output || JSON.stringify(result, null, 2)}

## 来源

- 任务执行结果

## 后续问题

- 待探索的问题

---

*创建日期：${this.today()} | 多比 🧦 综合*
`;

    return { fileName, content };
  }

  /**
   * 更新 Entity 页
   */
  async updateEntity(entityName, result) {
    console.log(`[Wiki] 更新 Entity: ${entityName}`);
    
    const entityPath = join(WIKI_DIR, 'entities', `${this.pascalCase(entityName)}.md`);
    
    if (!existsSync(entityPath)) {
      // 创建新 Entity 页
      const content = `# ${entityName}

**类型:** 待分类
**相关:** [[待补充]]

## 关键事实
- ${result.summary || '待补充'}

## 时间线
- ${this.today()}: 更新

---
*更新：${this.today()} | 多比 🧦*
`;
      writeFileSync(entityPath, content);
      console.log(`[Wiki] 创建 entities/${this.pascalCase(entityName)}.md`);
    } else {
      // 追加到现有页
      const content = readFileSync(entityPath, 'utf-8');
      const updated = content.replace(
        /---\n\*更新：.*\| 多比 🧦\*\n$/, 
        `## 时间线\n- ${this.today()}: ${result.summary || '更新'}\n\n---\n*更新：${this.today()} | 多比 🧦*\n`
      );
      writeFileSync(entityPath, updated);
    }
  }

  /**
   * 更新 Concept 页
   */
  async updateConcept(conceptName, result) {
    console.log(`[Wiki] 更新 Concept: ${conceptName}`);
    
    const conceptPath = join(WIKI_DIR, 'concepts', `${this.pascalCase(conceptName)}.md`);
    
    if (!existsSync(conceptPath)) {
      // 创建新 Concept 页
      const content = `# ${conceptName}

**相关:** [[待补充]]

## 定义
${result.summary || '待补充'}

## 详细说明

## 示例

---
*创建：${this.today()} | 多比 🧦*
`;
      writeFileSync(conceptPath, content);
      console.log(`[Wiki] 创建 concepts/${this.pascalCase(conceptName)}.md`);
    } else {
      // 追加到现有页
      const content = readFileSync(conceptPath, 'utf-8');
      const updated = content + `\n\n## 更新 (${this.today()})\n\n${result.summary || '新信息'}\n`;
      writeFileSync(conceptPath, updated);
    }
  }

  /**
   * 追加 log.md
   */
  appendLog(task, queryPage) {
    const logEntry = `
## [${this.today()}] query | ${this.slugify(task)}

**问题:** "${task}"

**回答:** queries/${queryPage.fileName}

**状态:** ✅ 完成

---
`;

    if (existsSync(LOG_FILE)) {
      const log = readFileSync(LOG_FILE, 'utf-8');
      writeFileSync(LOG_FILE, log + logEntry);
    } else {
      writeFileSync(LOG_FILE, `# Wiki Log\n\n${logEntry}`);
    }
  }

  /**
   * Slugify 文本
   */
  slugify(text) {
    return text
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  /**
   * PascalCase 文本
   */
  pascalCase(text) {
    return text
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }
}

// ============================================================================
// 导出
// ============================================================================

export default WikiIntegration;
