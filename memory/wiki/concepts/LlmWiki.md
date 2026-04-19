# LLM Wiki

> 基于 Karpathy 的个人知识库模式

**相关:** [[DobiHarness]], [[KarpathyLlmWiki]]

---

## 定义

**LLM Wiki 模式**: 一种让 LLM 增量构建和维护持久结构化知识库的方法，使知识能够复利增长而非每次查询都重新发现。

---

## 核心思想

### RAG vs Wiki

| 维度 | RAG | Wiki 模式 |
|------|-----|----------|
| 知识存储 | 原始文档 + 向量索引 | 结构化 wiki + 原始文档 |
| 查询方式 | 检索片段 → 临时拼凑 | 读取已有综合 → 更新 |
| 积累性 | ❌ 每次重新发现 | ✅ 知识复利增长 |
| 维护者 | 人工 | LLM 自动维护 |
| 交叉引用 | 无 | 自动维护 |
| 矛盾检测 | 无 | 自动标记 |

### 关键洞见

1. **持久性**: wiki 是持久产物，不是临时检索
2. **复利**: 每次摄入都增强现有知识网络
3. **自动化**: LLM 处理所有维护工作（总结、归档、交叉引用）
4. **人机分工**: 人类策划源和提问，LLM 处理簿记

---

## 架构

```
┌─────────────────────────────────────────┐
│  Schema (AGENTS.md / WIKI-SCHEMA.md)    │
│  → 告诉 LLM 如何维护 wiki                │
├─────────────────────────────────────────┤
│  The Wiki                               │
│  → LLM 生成和维护的 markdown             │
│  → entities/, concepts/, sources/...    │
├─────────────────────────────────────────┤
│  Raw Sources                            │
│  → 原始文档（不可变）                    │
│  → LLM 只读不写                          │
└─────────────────────────────────────────┘
```

---

## 工作流

### 1. Ingest（摄入）

```
用户：添加新源
  ↓
LLM: 读取源 → 提取要点 → 讨论（可选）
  ↓
LLM: 创建/更新 Source 页
  ↓
LLM: 更新相关 Entity 页（10-15 页）
  ↓
LLM: 更新相关 Concept 页
  ↓
LLM: 更新 index.md → 追加 log.md
  ↓
LLM: 标记矛盾/过时信息
```

### 2. Query（查询）

```
用户：提问
  ↓
LLM: 读 index.md 定位相关页
  ↓
LLM: 读相关 wiki 页
  ↓
LLM: 综合回答（带引用）
  ↓
LLM: 如有价值 → 存为 Query 页
```

### 3. Lint（健康检查）

```
LLM: 扫描所有页面
  ↓
检测：
- 矛盾（不同页面说法冲突）
- 过时（被新源推翻）
- 孤立页（无入链）
- 缺失页（概念被提及但无专页）
- 缺失交叉引用
  ↓
生成修复建议
```

---

## 关键文件

### index.md（内容目录）

- 每页的链接、一句话摘要、元数据
- 按类别组织（entities/concepts/sources/queries）
- LLM 查询时先读 index 定位

### log.md（时间线日志）

- append-only 记录
- 格式：`## [YYYY-MM-DD] <type> | <title>`
- 可用 unix 工具解析

---

## 在 dobi-harness 中的实现

### 目录结构

```
memory/
├── wiki/
│   ├── index.md
│   ├── log.md
│   ├── entities/
│   ├── concepts/
│   ├── sources/
│   └── queries/
├── raw/
│   ├── articles/
│   ├── papers/
│   └── assets/
└── schema/
    └── WIKI-SCHEMA.md
```

### 与现有组件集成

#### WAL Protocol + Wiki
- WAL 记录**操作**（事务日志）
- Wiki 存储**知识**（持久内容）
- 任务执行时同时更新两者

#### Working Buffer + Wiki
- Buffer 存**临时状态**（任务进度）
- Wiki 存**持久知识**（学习成果）
- 任务完成后提取知识到 wiki

#### Orchestrator + Wiki
```javascript
const result = await orchestrator.execute({
  task: '研究竞品分析',
  wiki: {
    ingest: true,
    updateEntities: ['CompetitorA', 'CompetitorB'],
    updateConcepts: ['competitive-analysis']
  }
});
```

---

## 工具生态

| 工具 | 用途 |
|------|------|
| Obsidian | wiki 编辑器 + Graph View |
| qmd | markdown 搜索引擎 |
| Dataview | 查询 frontmatter |
| Marp | markdown 幻灯片 |

---

## 健康指标

| 指标 | 目标 | 说明 |
|------|------|------|
| 页面增长率 | >5 页/周 | 知识积累 |
| 交叉引用密度 | >3 链/页 | 关联度 |
| 孤立页比例 | <5% | 整合度 |
| 矛盾解决率 | >90% | 一致性 |

---

## 哲学根源

**Vannevar Bush Memex (1945)**:
- 个人 curated 知识存储
- 文档间的"关联轨迹"（associative trails）
- 私人、主动策划、连接与内容同等重要

**Bush 未解决的问题**: 谁来做维护？  
**答案**: LLM。

---

## 参考

- [[KarpathyLlmWiki]] - 源文档
- [Karpathy Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [Bush Memex](https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/)

---

*创建：2026-04-19 | 多比 🧦 整理*
