# Dobi Harness

> 多 Agent 编排系统

**相关:** [[LlmWiki]], [[KarpathyLlmWiki]]

---

## 定义

**Dobi Harness**: 为 OpenClaw Agent 提供多 Agent 编排、任务分解、并行执行、自进化能力的生产级工作流系统。

---

## 核心能力

### 1. Harness 编排

| 模式 | 说明 | 适用场景 |
|------|------|----------|
| `parallel` | 完全并行 | 独立子任务 |
| `sequential` | 顺序执行 | 有依赖关系 |
| `map-reduce` | 映射归约 | 批量处理 + 聚合 |
| `pipeline` | 流水线 | 多阶段处理 |
| `fan-out` | 扇出探索 | 多方案对比 |

### 2. 生产工作流

- **Code Review** - 自动代码审查
- **Test Gen** - 测试用例生成
- **Doc Gen** - 文档自动生成
- **CI/CD** - 持续集成配置

### 3. 自进化系统

- **WAL Protocol** - 预写日志协议
- **Working Buffer** - 工作缓冲区
- **Pattern Recognition** - 模式识别

---

## 架构

```
┌─────────────────────────────────────────┐
│  Orchestrator (编排器)                  │
│  → 任务分解、调度、聚合                  │
├─────────────────────────────────────────┤
│  Patterns (模式库)                      │
│  → parallel, sequential, pipeline...    │
├─────────────────────────────────────────┤
│  Workflows (工作流)                     │
│  → CodeReview, TestGen, DocGen...       │
├─────────────────────────────────────────┤
│  Memory (记忆)                          │
│  → WAL, Working Buffer, Wiki            │
└─────────────────────────────────────────┘
```

---

## 性能指标

| 组件 | 平均耗时 | 说明 |
|------|---------|------|
| Orchestrator | ~274ms | 5 任务并行 |
| WAL | ~0.11ms | 单次事务 |
| Buffer | ~0ms | 单次读写 |

**测试通过率**: 100% (23 测试用例)

---

## 文件结构

```
dobi-harness/
├── harness/
│   ├── orchestrator.js
│   ├── patterns/
│   └── utils/
├── workflows/
│   ├── code-review.js
│   ├── test-gen.js
│   ├── doc-gen.js
│   └── cicd.js
├── memory/
│   ├── wal.js
│   ├── working-buffer.js
│   └── wiki/          ← 新增
├── tests/
└── examples/
```

---

## 使用示例

### 并行任务

```javascript
const orchestrator = new HarnessOrchestrator();

const result = await orchestrator.execute({
  task: '分析项目代码质量',
  pattern: 'parallel',
  subTasks: [
    { task: '检查代码风格', agent: 'linter' },
    { task: '检查安全漏洞', agent: 'security' },
    { task: '检查性能问题', agent: 'performance' },
  ]
});

console.log(`完成：${result.completed}/${result.total}`);
```

### 集成 Wiki

```javascript
const result = await orchestrator.execute({
  task: '研究竞品分析',
  pattern: 'fan-out',
  subTasks: [
    { task: '分析产品 A', agent: 'researcher' },
    { task: '分析产品 B', agent: 'researcher' },
  ],
  wiki: {
    ingest: true,
    updateEntities: ['ProductA', 'ProductB'],
    updateConcepts: ['competitive-analysis']
  }
});
```

---

## 与 LLM Wiki 集成

### WAL + Wiki
- WAL 记录**操作**（事务日志）
- Wiki 存储**知识**（持久内容）

### Working Buffer + Wiki
- Buffer 存**临时状态**
- Wiki 存**持久知识**

### Orchestrator + Wiki
- 任务执行自动沉淀知识到 wiki
- 自动更新 entities/concepts/sources

---

## 测试状态

```bash
$ node tests/test-suite.js

============================================================
测试完成：23 个测试，23 通过，0 失败，耗时 3608ms
============================================================
```

---

## 参考

- [HARNESS-ARCHITECTURE.md](../HARNESS-ARCHITECTURE.md)
- [WORKFLOWS.md](../WORKFLOWS.md)
- [SELF-IMPROVEMENT.md](../SELF-IMPROVEMENT.md)
- [[LlmWiki]] - 记忆模式

---

*创建：2026-04-19 | 多比 🧦 整理*
