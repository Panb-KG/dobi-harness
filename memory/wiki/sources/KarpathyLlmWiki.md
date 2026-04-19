# Karpathy LLM-Wiki Gist

> Andrej Karpathy 关于 LLM 记忆模式的经典思想协议

**来源:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f  
**类型:** Gist  
**日期:** 2026-04-04  
**标签:** [memory, wiki, agent, RAG, knowledge]

---

## 核心要点

1. **RAG 的局限性**: 每次查询都从原始文档重新检索、拼凑，没有知识积累
2. **Wiki 模式**: LLM 增量构建和维护持久 wiki，知识复利增长
3. **三层架构**: Schema → Wiki → Raw Sources
4. **三个工作流**: Ingest（摄入）/ Query（查询）/ Lint（健康检查）
5. **两个关键文件**: index.md（目录）/ log.md（时间线）

---

## 详细摘要

### 问题陈述

大多数人使用 LLM 和文档的体验是 RAG：
- 上传文件集合
- LLM 在查询时检索相关片段
- 生成答案

**问题**: LLM 每次都从零开始重新发现知识。问一个需要综合五个文档的微妙问题，LLM 必须每次都找到并拼凑相关片段。**没有积累**。

### Wiki 模式的创新

**核心差异**: wiki 是持久、复利的产物。
- 交叉引用已经存在
- 矛盾已经被标记
- 综合已经反映所有内容

**人类 vs LLM 的分工**:
- **人类**: 策划源、指导分析、提出好问题、思考意义
- **LLM**: 总结、交叉引用、归档、簿记——所有维护工作

### 三层架构

1. **Raw Sources**（原始源）
   -  curated 文档集合（文章、论文、数据文件）
   - **不可变** - LLM 只读不写
   - 事实来源

2. **The Wiki**（wiki）
   - LLM 生成的 markdown 文件目录
   - 摘要、实体页、概念页、比较、综合
   - **LLM 完全拥有和维护**

3. **The Schema**（模式）
   - 告诉 LLM wiki 如何结构化
   - 约定和工作流
   - 与 LLM 共同演化

### 三个工作流

#### 1. Ingest（摄入）
```
用户添加新源 → LLM 读取 → 讨论要点 → 写入 wiki
→ 更新实体页/概念页 → 更新 index → 追加 log
```

单个源可能触及 10-15 个 wiki 页面。

#### 2. Query（查询）
```
用户提问 → LLM 读 index 定位 → 读相关页 → 综合回答
→ 好答案存回 wiki 作为新页
```

答案形式：markdown 页、比较表、幻灯片（Marp）、图表、canvas。

#### 3. Lint（健康检查）
```
定期检查 → 发现矛盾/过时/孤立页/缺失页
→ 生成修复建议 → 建议新源
```

### 两个特殊文件

#### index.md（内容目录）
- 每页的链接、一句话摘要、元数据
- 按类别组织（实体、概念、源等）
- LLM 查询时先读 index 定位

#### log.md（时间线日志）
- append-only 记录
- 格式：`## [2026-04-02] ingest | Article Title`
- 可用 unix 工具解析：`grep "^## \[" log.md | tail -5`

### 工具推荐

- **Obsidian Web Clipper**: 转换网页为 markdown
- **qmd**: markdown 本地搜索引擎（BM25 + 向量 + LLM 重排序）
- **Obsidian Graph View**: 可视化 wiki 形状
- **Marp**: markdown 幻灯片
- **Dataview**: 查询 frontmatter 生成动态表格

### 哲学根源

灵感来自 Vannevar Bush 的 **Memex (1945)**：
- 个人、 curated 知识存储
- 文档间的关联轨迹（associative trails）
- 私人、主动策划、连接与内容同等重要

**Bush 未解决的问题**: 谁来做维护？  
**答案**: LLM。

---

## 与 dobi-harness 的关联

### 现有组件对应

| Karpathy 模式 | dobi-harness |
|--------------|--------------|
| Schema | WIKI-SCHEMA.md + AGENTS.md |
| Wiki | memory/wiki/ |
| Raw Sources | memory/raw/ |
| Log | memory/wiki/log.md |
| WAL Protocol | memory/wal.js |
| Working Buffer | memory/working-buffer.js |

### 增强点

1. **WAL + Wiki**: WAL 记录操作，Wiki 存储知识
2. **Orchestrator + Wiki**: 任务执行自动沉淀知识
3. **Workflows + Wiki**: Code Review 等 workflow 自动更新 wiki

---

## 引用

> "The tedious part of maintaining a knowledge base is not the reading or the thinking — it's the bookkeeping. [...] LLMs don't get bored, don't forget to update a cross-reference, and can touch 15 files in one pass."

> "The human's job is to curate sources, direct the analysis, ask good questions, and think about what it all means. The LLM's job is everything else."

---

## 相关页面

- [[LlmWiki]] - 概念页
- [[DobiHarness]] - 集成方案
- [LLM-WIKI-DESIGN](../LLM-WIKI-DESIGN.md) - 设计文档

---

*摄入日期：2026-04-19 | 多比 🧦 整理*
