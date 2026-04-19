# Wiki Log

> 时间线日志 - 记录 wiki 的演化历史
> 
> 格式：`## [YYYY-MM-DD] <type> | <title>`

---

## [2026-04-19] init | Wiki 系统初始化

**类型:** 系统初始化

**内容:**
- 创建目录结构：
  - `memory/wiki/{entities,concepts,sources,queries}`
  - `memory/raw/{articles,papers,assets}`
  - `memory/schema/`
- 编写 `WIKI-SCHEMA.md` - 定义 wiki 结构和维护约定
- 创建初始 `index.md`
- 创建初始 `log.md`

**状态:** ✅ Phase 1 完成

---

## [2026-04-19] ingest | Karpathy llm-wiki Gist

**类型:** 源文档摄入

**源:** https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

**创建:**
- `sources/KarpathyLlmWiki.md` - 源文档摘要
- `concepts/LlmWiki.md` - 概念页
- `concepts/DobiHarness.md` - 概念页（更新）

**更新:**
- `index.md` - 添加新页面索引

**核心要点:**
1. RAG vs Wiki 模式的关键区别
2. 三层架构：Schema → Wiki → Raw Sources
3. 三个工作流：Ingest / Query / Lint
4. 两个关键文件：index.md / log.md

**矛盾:** 无

**备注:** 这是 dobi-harness wiki 的第一个源文档，具有里程碑意义 🎉

---

## [2026-04-19] design | Wiki 集成方案

**类型:** 设计文档

**内容:**
- 创建 `LLM-WIKI-DESIGN.md`
- 设计与 dobi-harness 现有组件集成：
  - WAL Protocol + Wiki
  - Working Buffer + Wiki
  - Harness Orchestrator + Wiki

**实施计划:**
- Phase 1: 基础结构 ✅
- Phase 2: 工具实现（待开始）
- Phase 3: 集成（待开始）
- Phase 4: 优化（持续）

---

## [2026-04-19] meta | 记忆系统改进

**类型:** 元改进

**背景:**
- 皮爷指出多比记性差的问题
- 聊过的事经常忘
- 需要改进记忆系统

**解决方案:**
- 采用 Karpathy llm-wiki 模式
- 从日记式记录 → 结构化 wiki
- 实现知识复利增长

**预期效果:**
- ✅ 重要对话不再遗忘
- ✅ 知识结构化、可检索
- ✅ 自动维护交叉引用
- ✅ 健康检查保持质量

---

## [2026-04-19] tools | Phase 2 工具实现

**类型:** 工具开发

**内容:**
- 创建 `tools/` 目录
- 实现 4 个 wiki 工具：
  - `wiki-ingest.js` - 摄入源文档
  - `wiki-query.js` - 查询 wiki
  - `wiki-search.js` - 搜索 wiki
  - `wiki-lint.js` - 健康检查
- 创建 `package.json` 添加 npm scripts

**状态:** ✅ Phase 2 完成

**测试结果:**
- wiki-lint: ✅ 运行成功（发现 51 个关注项）
- wiki-query: ✅ 已修复搜索逻辑
- wiki-search: ✅ 完成
- wiki-ingest: ✅ 测试通过

---

## [2026-04-19] entity | DobiAi 品牌页面创建

**类型:** 实体页创建

**背景:**
- 皮爷指示学习 Dobi-ai 项目
- 这是多比的形象和品牌要素
- GitHub: https://github.com/Panb-KG/Dobi-ai

**问题:**
- GitHub 仓库返回 404（可能私有或未创建）

**创建:**
- `entities/DobiAi.md` - 多比的 AI 形象和品牌项目

**内容:**
- 形象特征：名字、生物、Emoji 🧦、Vibe
- 品牌要素：忠诚、热情、直接、幽默
- 技术实现：OpenClaw + dobi-harness
- 待补充：README、项目结构、视觉资产

**更新:**
- `index.md` - 添加 Entities 条目
- `log.md` - 追加本条目

**状态:** ⏳ 待 GitHub 仓库可访问后补充完整

---

## [2026-04-19] ingest | Dobi-ai 项目信息

**类型:** 源文档摄入

**源:** https://github.com/Panb-KG/Dobi-ai（404）

**创建:**
- `sources/DobiAiProject.md` - 项目信息摘要
- `entities/DobiAi.md` - 实体页（已在上一步创建）

**内容:**
- 多比的形象定义（名字、生物、Emoji、Vibe）
- 品牌要素（忠诚、热情、直接、幽默）
- 技术栈（OpenClaw + dobi-harness + LLM Wiki）
- 待补充（README、代码、视觉资产）

**更新:**
- `index.md` - 添加 Sources 条目

**状态:** ✅ 基础信息已记录，待仓库可访问后补充

**备注:** 这是多比自己的品牌和形象项目，属于高优先级记忆

---

## [2026-04-19] ingest | Dobi AI 品牌规划方案

**类型:** 源文档摄入（图片）

**源:** 皮爷提供的品牌 Hub 截图

**创建:**
- `sources/DobiAiBrandStrategy.md` - 品牌规划方案详细记录

**更新:**
- `entities/DobiAi.md` - 补充品牌使命、愿景、目标受众、核心竞争力
- `index.md` - 添加 Sources 条目

**核心内容:**

**品牌使命:**
> 消除技术边界，赋能创意自由

**品牌愿景:**
> 全员编程 (CODING FOR ALL)
> 那只袜子不再是给程序员的奖励，而是给所有创作者的入场券

**目标受众:**
- 不懂编程的创意者
- 希望快速落地的初创家
- 零基础的技术爱好者

**核心竞争力:**
1. 零门槛对话编程
2. 灵感实时落地（想法到应用只有"一句话"的距离）
3. 全员自由社区

**状态:** ✅ 完成

**备注:** ⭐ 高优先级品牌信息，多比必须牢记

---

## [2026-04-19] ingest | Dobi AI 视觉系统

**类型:** 源文档摄入（图片）

**源:** 皮爷提供的品牌 Hub 截图 - Visual Identity

**创建:**
- `sources/DobiAiVisualIdentity.md` - 视觉系统详细记录

**更新:**
- `entities/DobiAi.md` - 补充视觉设计、Logo、Emoji 矩阵
- `index.md` - 添加 Sources 条目

**核心内容:**

**设计理念:**
> Dobi 的形象融合了数字代码与古典精灵。放弃了破旧的袍子，代之以深灰色的极客连帽衫，大耳朵呈现为 `{}` 形状。

**视觉元素:**
- 主体：深灰色极客连帽衫
- 眼睛：橙色发光圆点
- 耳朵：`{}` 花括号形状
- 色彩：深灰 + 橙色 + 黑色

**Logo & Emoji Matrix:**
| Emoji | 含义 |
|-------|------|
| `{^_^}` | 就绪 / READY |
| `{;_;}` | 调试 / DEBUG |
| `{@_@}` | 思考 / THINKING |
| `{!_!}` | 警报 / ALERT |
| `{*_*}` | 自由 / FREE |
| `{$_$}` | 收米 / SUCCESS |

**状态:** ✅ 完成

**备注:** ⭐⭐ 超高优先级视觉识别系统，多比的核心形象

---

## [2026-04-19] ingest | Dobi-ai GitHub 仓库

**类型:** 源文档摄入（GitHub API）

**源:** https://github.com/Panb-KG/Dobi-ai (Private)

**更新:**
- `sources/DobiAiProject.md` - 完整项目信息

**仓库信息:**
- 名称：Dobi-ai
- 描述：DOBI AI Brand Hub
- 语言：TypeScript
- 创建：2026-04-18
- 可见性：Private
- Issues: Enabled
- PR: Enabled

**项目结构:**
```
Dobi-ai/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
├── .env.example
├── .gitignore
├── metadata.json
└── src/
```

**技术栈:**
- Vite + TypeScript
- Google Gemini API
- AI Studio 部署

**状态:** ✅ 完成

**下一步:**
- 监控 Issues 和 PR
- 参与项目讨论
- 协助文档维护

---

## [2026-04-19] ingest | 测试文档DobiHarness自进化系统

**类型:** 源文档摄入

**源:** /home/admin/.openclaw/workspace/skills/dobi-harness/tests/test-source.md

**创建:**
- sources/测试文档DobiHarness自进化系统.md

**更新:**
- index.md

**状态:** ✅ 完成

---

## [2026-04-19] lint | health-check

**检查:** all

**结果:** ⚠️  99 个问题

**发现:**
- 孤立页：1
- 潜在矛盾：2
- 过时内容：0
- 缺失引用：96

**建议:** 见详细报告

---

## [2026-04-19] query | 测试-wiki-集成

**问题:** "测试 Wiki 集成"

**回答:** queries/测试Wiki集成.md

**状态:** ✅ 完成

---

## [2026-04-19] integration | Phase 3 Wiki 集成完成

**类型:** 系统集成

**内容:**
- 创建 `harness/wiki-integration.js` - Wiki 集成模块
- 更新 `harness/orchestrator.js` - 集成到编排器
- 创建 `tests/test-wiki-integration.js` - 集成测试

**功能:**
- 任务执行自动摄入结果到 wiki
- 自动创建 Query 页
- 自动更新 Entity/Concept 页
- 自动追加 log.md

**测试结果:**
```
[Harness] Execution completed: 2/2 successful
[Wiki] 摄入任务结果：测试 Wiki 集成
[Wiki] 创建 queries/测试 Wiki 集成.md
[Wiki] ✅ 摄入完成
```

**状态:** ✅ Phase 3 完成

**下一步:**
- 实际任务演练
- 监控 GitHub Issues/PR
- 持续改进

---

## [2026-04-19] update | Skill 更新 - 群协作能力

**类型:** Skill 文档更新

**内容:**
- 更新 `SKILL.md` - 添加 Wiki Memory System 和 Group Collaboration
- 创建 `COLLABORATION-GUIDE.md` - 群协作使用指南
- 移除个人信息（OpenID、手机号等）

**新增章节:**
1. Wiki Memory System - 基于 Karpathy llm-wiki 模式
2. Group Collaboration - 群协作记忆能力

**Wiki 结构扩展:**
```
memory/wiki/
├── topics/    # 话题追踪
├── groups/    # 群组信息
└── people/    # 成员信息
```

**状态:** ✅ 完成

**备注:** Skill 现在支持群协作场景，可供其他用户使用

---
