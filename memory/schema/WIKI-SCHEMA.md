# Wiki Schema

> dobi-harness 知识记忆系统的结构和维护约定
> 
> 基于 Karpathy llm-wiki 模式设计

## 📁 目录结构

```
memory/
├── wiki/
│   ├── index.md              # 总目录（分类 + 链接 + 摘要）
│   ├── log.md                # 时间线日志（append-only）
│   ├── entities/             # 实体页（人、组织、项目）
│   ├── concepts/             # 概念页（抽象想法、模式）
│   ├── sources/              # 源文档摘要
│   └── queries/              # 查询结果（可复用综合）
├── raw/                      # 原始文档（不可变）
│   ├── articles/
│   ├── papers/
│   └── assets/
└── schema/
    └── WIKI-SCHEMA.md        # 本文件
```

---

## 🏷️ 命名约定

### 文件名
- **PascalCase**: `DobiHarness.md`, `AndrejKarpathy.md`
- **小写 + 连字符**: 源文档可用 `karpathy-llm-wiki.md`

### 标题
- 一级标题 = 页面名称
- 示例：`# Dobi Harness`

### 标签（YAML frontmatter）
```yaml
---
tags: [agent, memory, orchestration]
created: 2026-04-19
updated: 2026-04-19
sources: 3
---
```

### 内部链接
- 使用 `[[页面名]]` 格式（Obsidian 风格）
- 示例：`[[DobiHarness]]`, `[[LlmWiki]]`

---

## 📄 页面模板

### Entity 页（人/组织/项目）

```markdown
# 实体名

**类型:** 人 | 组织 | 项目
**相关:** [[相关页面 1]], [[相关页面 2]]

## 关键事实
- 事实 1
- 事实 2
- 事实 3

## 时间线
- YYYY-MM-DD: 重要事件
- YYYY-MM-DD: 重要事件

## 参考
- [[概念页]] - 相关概念
- [[来源页]] - 相关信息源
```

### Concept 页（抽象概念/模式）

```markdown
# 概念名

**相关:** [[相关概念 1]], [[相关概念 2]]

## 定义
一句话核心定义

## 详细说明
详细解释、背景、动机

## 关键特性
- 特性 1
- 特性 2

## 示例
```javascript
// 代码示例或使用场景
```

## 参考
- [[相关页面]]
- 外部链接
```

### Source 页（源文档摘要）

```markdown
# 源文档标题

**来源:** URL 或文件名
**类型:** 文章 | 论文 | 视频 | 播客
**日期:** YYYY-MM-DD
**标签:** [标签 1, 标签 2]

## 核心要点
- 要点 1
- 要点 2
- 要点 3

## 详细摘要
分段摘要内容

## 与 wiki 的关联
- 更新：[[概念 1]] - 新信息
- 更新：[[实体 1]] - 补充事实
- 矛盾：[[概念 2]] - 需要解决

## 引用
> 重要原文引用
```

### Query 页（查询结果/综合）

```markdown
# 查询主题

**问题:** 原始问题
**日期:** YYYY-MM-DD
**相关:** [[相关页面]]

## 综合回答
综合多个来源的回答

## 来源
- [[页面 1]] - 要点
- [[页面 2]] - 要点

## 后续问题
- 待探索的问题 1
- 待探索的问题 2
```

---

## 🔄 工作流约定

### Ingest（摄入）流程

1. **读取源文档**
2. **提取关键信息**
3. **创建/更新 Source 页**
4. **更新相关 Entity 页**（10-15 页）
5. **更新相关 Concept 页**
6. **更新 index.md**
7. **追加 log.md**
8. **标记矛盾/过时信息**

**log.md 格式：**
```markdown
## [YYYY-MM-DD] ingest | 源文档标题
- 源：URL 或路径
- 创建：sources/xxx.md
- 更新：entities/xxx.md, concepts/xxx.md
- 矛盾：无 | 见 [[xxx]]
```

### Query（查询）流程

1. **读取 index.md** 定位相关页
2. **读取相关 wiki 页**
3. **综合回答**（带引用）
4. **如有价值** → 创建 Query 页
5. **追加 log.md**

**log.md 格式：**
```markdown
## [YYYY-MM-DD] query | 查询主题
- 问题："原始问题"
- 回答：queries/xxx.md
- 引用：concepts/xxx.md, entities/xxx.md
```

### Lint（健康检查）流程

1. **扫描所有页面**
2. **检测问题：**
   - 矛盾（不同页面说法冲突）
   - 过时（被新源推翻）
   - 孤立页（无入链）
   - 缺失页（概念被提及但无专页）
   - 缺失交叉引用
3. **生成修复建议**
4. **追加 log.md**

**log.md 格式：**
```markdown
## [YYYY-MM-DD] lint | 类型（weekly/monthly）
- 检查：contradictions, orphans, stale
- 发现：X 个矛盾，Y 个孤立页
- 建议：待办事项
```

---

## 📊 index.md 维护规则

### 结构
```markdown
# Wiki Index

最后更新：YYYY-MM-DD

## Entities

| 页面 | 摘要 | 来源数 | 最后更新 |
|------|------|--------|----------|
| [[页面名]](./entities/页面名.md) | 一句话摘要 | N | YYYY-MM-DD |

## Concepts

| 页面 | 摘要 | 引用数 | 最后更新 |
|------|------|--------|----------|
| [[页面名]](./concepts/页面名.md) | 一句话摘要 | N | YYYY-MM-DD |

## Sources

| 页面 | 类型 | 摄入日期 |
|------|------|----------|
| [[页面名]](./sources/页面名.md) | 文章 | YYYY-MM-DD |

## Queries

| 页面 | 问题 | 日期 |
|------|------|------|
| [[页面名]](./queries/页面名.md) | 原始问题 | YYYY-MM-DD |
```

### 更新规则
- 每次 ingest 后自动更新
- 新页面创建后添加到对应分类
- 页面更新后更新"最后更新"列

---

## 🔍 搜索约定

### 简单搜索（grep）
```bash
# 搜索关键词
grep -r "关键词" memory/wiki/

# 搜索标题
grep "^# " memory/wiki/**/*.md

# 搜索标签
grep "tags:" memory/wiki/**/*.md
```

### 日志查询
```bash
# 最近 5 次摄入
grep "^## \[" memory/log.md | grep ingest | tail -5

# 所有查询
grep "^## \[" memory/log.md | grep query

# 特定主题
grep -i "dobi-harness" memory/log.md
```

---

## 🧩 与 dobi-harness 集成

### WAL 集成
```javascript
// 任务执行时记录 WAL
await wal.begin('task-123');
await wal.log('ingest', { source: 'article.md' });
await wiki.ingest('article.md');
await wal.commit('task-123');
```

### Orchestrator 集成
```javascript
const result = await orchestrator.execute({
  task: '研究竞品',
  wiki: {
    ingest: true,
    updateEntities: ['CompetitorA'],
    updateConcepts: ['competitive-analysis']
  }
});
```

---

## 📈 健康指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 页面增长率 | >5 页/周 | 知识积累速度 |
| 交叉引用密度 | >3 链/页 | 知识关联度 |
| 孤立页比例 | <5% | 知识整合度 |
| 矛盾解决率 | >90% | 知识一致性 |
| 查询响应时间 | <2s | 检索效率 |

---

## 🛠️ 工具命令（待实现）

```bash
# 摄入源文档
wiki-ingest <file|url>

# 查询 wiki
wiki-query "问题" [--format=markdown|table|marp]

# 健康检查
wiki-lint [--orphans] [--contradictions] [--stale]

# 搜索
wiki-search "关键词" [--title] [--tag]

# 图可视化
wiki-graph [--hubs] [--orphans]

# 统计
wiki-stats
```

---

*Schema 版本：1.0 | 2026-04-19 | 基于 Karpathy llm-wiki*
