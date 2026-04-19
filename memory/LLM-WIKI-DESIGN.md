# LLM-Wiki 记忆模式

> 基于 Andrej Karpathy 的 [llm-wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) 设计
> 
> 2026-04-04 发布 | 5 天 5000+ stars | 思想协议

## 🎯 核心思想

**RAG vs Wiki 模式：**

| 维度 | RAG | Wiki 模式 |
|------|-----|----------|
| 知识存储 | 原始文档 + 向量索引 | 结构化 wiki + 原始文档 |
| 查询方式 | 检索片段 → 临时拼凑 | 读取已有综合 → 更新 |
| 积累性 | ❌ 每次重新发现 | ✅ 知识复利增长 |
| 维护者 | 人工 | LLM 自动维护 |

**关键洞见：** wiki 是持久、复利的产物。交叉引用已存在、矛盾已标记、综合已反映所有内容。

---

## 🏗️ 三层架构

```
┌─────────────────────────────────────────┐
│  Schema (AGENTS.md / CLAUDE.md)         │
│  → 告诉 LLM wiki 结构、约定、工作流       │
├─────────────────────────────────────────┤
│  The Wiki                               │
│  → LLM 生成和维护的 markdown 文件          │
│  → 摘要、实体页、概念页、比较、综合        │
├─────────────────────────────────────────┤
│  Raw Sources                            │
│  → 原始文档（文章、论文、数据文件）        │
│  → 不可变，LLM 只读不写                   │
└─────────────────────────────────────────┘
```

---

## 📁 dobi-harness Wiki 结构

```
memory/
├── wiki/
│   ├── index.md              # 内容目录（分类 + 链接 + 摘要）
│   ├── log.md                # 时间线日志（append-only）
│   ├── entities/             # 实体页（人、组织、项目）
│   │   ├── Panb-KG.md
│   │   └── OpenClaw.md
│   ├── concepts/             # 概念页（抽象想法、模式）
│   │   ├── dobi-harness.md
│   │   ├── llm-wiki.md
│   │   └── task-decomposition.md
│   ├── sources/              # 源文档摘要
│   │   ├── karpathy-llm-wiki.md
│   │   └── ...
│   └── queries/              # 查询结果（可复用的综合）
│       └── ...
├── raw/                      # 原始文档（不可变）
│   ├── articles/
│   ├── papers/
│   └── assets/               # 图片等附件
└── schema/
    └── WIKI-SCHEMA.md        # wiki 维护约定
```

---

## 🔄 三个核心工作流

### 1. Ingest（摄入）

```
用户：添加新源 → "把这个文章加到 wiki"
      ↓
LLM:  读取源文档
      ↓
LLM:  与用户讨论关键要点（可选）
      ↓
LLM:  写入 wiki：
      - 创建/更新 source 摘要页
      - 更新相关 entity 页
      - 更新相关 concept 页
      - 更新 index.md
      - 追加 log.md
      ↓
LLM:  标记矛盾/过时信息（如有）
```

**示例命令：**
```bash
# 摄入文章
ingest https://example.com/article.md

# 批量摄入
ingest --batch ./raw/articles/*.md
```

### 2. Query（查询）

```
用户：提问 → "dobi-harness 的核心思想是什么？"
      ↓
LLM:  读取 index.md 找相关页
      ↓
LLM:  读取相关 wiki 页
      ↓
LLM:  综合回答（带引用）
      ↓
LLM:  如答案有价值 → 存为 query/ 新页
```

**示例命令：**
```bash
# 查询
wiki-query "dobi-harness 的任务分解模式有哪些？"

# 生成比较表
wiki-query --format=table "比较 parallel 和 pipeline 模式"

# 生成幻灯片
wiki-query --format=marp "介绍 dobi-harness 架构"
```

### 3. Lint（健康检查）

```
用户：触发 lint → "检查 wiki 健康状态"
      ↓
LLM:  扫描所有页面
      ↓
LLM:  检测问题：
      - 页面间矛盾
      - 过时声明（被新源推翻）
      - 孤立页（无入链）
      - 缺失页（概念被提及但无专页）
      - 缺失交叉引用
      ↓
LLM:  生成修复建议
      - 标记待更新页
      - 建议新源（可 web 搜索填补空白）
      - 建议新建页面
```

**示例命令：**
```bash
# 健康检查
wiki-lint

# 查找孤立页
wiki-lint --orphans

# 查找矛盾
wiki-lint --contradictions
```

---

## 📄 两个关键文件

### index.md（内容目录）

```markdown
# Wiki Index

最后更新：2026-04-19

## Entities

| 页面 | 摘要 | 来源数 | 最后更新 |
|------|------|--------|----------|
| [Panb-KG](./entities/Panb-KG.md) | dobi-harness 作者 | 3 | 2026-04-19 |
| [OpenClaw](./entities/OpenClaw.md) | Agent 平台 | 5 | 2026-04-18 |

## Concepts

| 页面 | 摘要 | 引用数 | 最后更新 |
|------|------|--------|----------|
| [dobi-harness](./concepts/dobi-harness.md) | 多 Agent 编排系统 | 12 | 2026-04-19 |
| [llm-wiki](./concepts/llm-wiki.md) | Karpathy 记忆模式 | 2 | 2026-04-19 |

## Sources

| 页面 | 类型 | 摄入日期 |
|------|------|----------|
| [karpathy-llm-wiki](./sources/karpathy-llm-wiki.md) | Gist | 2026-04-19 |
```

**更新规则：**
- 每次 ingest 自动更新
- LLM 查询时先读 index 定位

### log.md（时间线日志）

```markdown
## [2026-04-19] ingest | karpathy/llm-wiki
- 源：https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- 创建：sources/karpathy-llm-wiki.md
- 更新：concepts/llm-wiki.md, concepts/memory-patterns.md
- 更新：index.md

## [2026-04-19] query | dobi-harness 核心思想
- 问题："dobi-harness 的核心思想是什么？"
- 回答：queries/dobi-harness-core.md
- 引用：concepts/dobi-harness.md, HARNESS-ARCHITECTURE.md

## [2026-04-19] lint | weekly
- 检查：contradictions, orphans, stale
- 发现：2 个潜在矛盾（见 entities/OpenClaw.md）
- 建议：搜索最新 OpenClaw 文档
```

**格式约定：**
```
## [YYYY-MM-DD] <type> | <title>
```

**可 grep 查询：**
```bash
# 最近 5 次摄入
grep "^## \[" log.md | grep ingest | tail -5

# 所有查询
grep "^## \[" log.md | grep query

# 查找特定主题
grep -i "dobi-harness" log.md
```

---

## 🔧 工具设计

### 1. Wiki Search（搜索）

小 wiki 用 index.md 足够，大 wiki 需要搜索工具。

**推荐：[qmd](https://github.com/tobi/qmd)**
- 本地 markdown 搜索引擎
- 混合搜索：BM25 + 向量 + LLM 重排序
- CLI + MCP Server

**简化版（多比可以先实现）：**
```bash
# 简单 grep 搜索
wiki-search "关键词"

# 搜索标题
wiki-search --title "记忆"

# 搜索标签
wiki-search --tag "agent"
```

### 2. Wiki Graph（可视化）

用 Obsidian Graph View 或自己生成：

```bash
# 生成图数据
wiki-graph --output graph.json

# 查找枢纽页（高入度）
wiki-graph --hubs

# 查找孤立页（无入链）
wiki-graph --orphans
```

---

## 🧠 与 dobi-harness 集成

### WAL + Wiki

WAL 记录**操作**，Wiki 存储**知识**：

```
用户请求 → WAL 开始事务 → 执行任务 → 更新 Wiki → WAL 提交
                                    ↓
                            知识沉淀到 wiki/
```

### Working Buffer + Wiki

Buffer 存**临时状态**，Wiki 存**持久知识**：

```
任务执行中 → Buffer 存进度 → 任务完成 → 提取知识 → Wiki
```

### Harness Orchestrator + Wiki

编排器执行任务时自动维护 wiki：

```javascript
const result = await orchestrator.execute({
  task: '研究竞品分析',
  pattern: 'parallel',
  subTasks: [
    { task: '分析产品 A', agent: 'researcher' },
    { task: '分析产品 B', agent: 'researcher' },
  ],
  wiki: {
    ingest: true,           // 自动摄入结果
    updateEntities: ['CompetitorA', 'CompetitorB'],
    updateConcepts: ['competitive-analysis']
  }
});
```

---

## 📋 Schema 示例（WIKI-SCHEMA.md）

```markdown
# Wiki Schema

## 目录结构
- entities/ - 人、组织、项目
- concepts/ - 抽象概念、模式
- sources/ - 源文档摘要
- queries/ - 查询结果
- index.md - 总目录
- log.md - 时间线

## 命名约定
- 文件名：PascalCase.md（如 `DobiHarness.md`）
- 标题：# 名称
- 标签：`tags: [agent, memory]`

## 页面模板

### Entity 页
# 名称

**类型:** 人/组织/项目
**相关:** [[相关页面]]

## 关键事实
- 事实 1
- 事实 2

## 时间线
- 2026-04-19: 事件

### Concept 页
# 概念名

**相关:** [[相关概念]]

## 定义
一句话定义

## 详细说明

## 示例

## 参考
- [[相关页面]]
```

---

## 🚀 实施计划

### Phase 1: 基础结构（1 天）
- [ ] 创建目录结构
- [ ] 编写 WIKI-SCHEMA.md
- [ ] 创建初始 index.md 和 log.md
- [ ] 迁移现有 memory/ 内容

### Phase 2: 工具实现（2 天）
- [ ] `wiki-ingest` 命令
- [ ] `wiki-query` 命令
- [ ] `wiki-lint` 命令
- [ ] `wiki-search` 命令

### Phase 3: 集成（1 天）
- [ ] 集成到 Harness Orchestrator
- [ ] 集成到 Workflows
- [ ] 集成到自进化系统

### Phase 4: 优化（持续）
- [ ] 集成 qmd 搜索
- [ ] 图可视化
- [ ] Dataview 查询
- [ ] Marp 幻灯片生成

---

## 📖 参考

- [Karpathy llm-wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Vannevar Bush Memex (1945)](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/)
- [Obsidian](https://obsidian.md)
- [qmd](https://github.com/tobi/qmd)
- [Marp](https://marp.app)
- [Dataview](https://blacksmithgu.github.io/obsidian-dataview/)

---

*文档版本：1.0 | 2026-04-19 | 多比 🧦 学习笔记*
