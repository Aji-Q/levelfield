# LevelField Demo Video Outline

> **主题**：待 Checkpoint Plan 确认；首选 `midnight-press`，定制为 LevelField 暖黑 / 骨白 / 黄铜视觉
> **总时长**：371 个英文词；当前离线预览实测 2 分 53.57 秒，最终 ElevenLabs 版必须保持在 3:00 内
> **章节数**：5 章 / 21 steps
> **画幅**：16:9，1920×1080，最终导出 30 fps

---

## 1. price-does-not-tell — 价格没有告诉你的事（3 steps · ~23s）

**信息池**：
- 反差：价格不揭示谁可能提前知道结果 —— 来源 article §Product thesis
- 定位：LevelField 是 DreamDEX 的交易前结构性信息不对称评估层 —— 来源 article §Product thesis
- 真实入口：录制当天快照中的 DreamDEX Shannon testnet 价格二元合约与 LevelField 3/100 结果 —— 来源 article §Demonstration path
- 产品边界：衡量信息结构，不预测事件结果 —— 来源 article §Product thesis

**开发计划**：

- step 1 (~6s) — LevelField 主标识、风险地形与 “Who could know first?” 占据全屏
- step 2 (~8s) — 产品定位与 trader / agent 两类使用者进入画面
- step 3 (~8s) — 录制当天快照中的 DreamDEX 价格二元合约及其 3/100 低风险结果并置

口播节选：
> Every event contract gives you a price. It does not tell you who could know first.

---

## 2. three-vs-ninety-five — 同一引擎，不同信息场（6 steps · ~41s）

**信息池**：
- 低风险原因：全球参考价格不受单一参与者控制，结果公开且披露近乎同步 —— 来源 article §Demonstration path
- 高风险对照：个体私下决定型 reference contract 为 95/100 —— 来源 article §Demonstration path
- 机制：结果由一人控制且缺少明确交易限制时触发 CB-1 —— 来源 article §Demonstration path
- 解释边界：不预测哪一方获胜，不指控不当行为，也不检测实时内幕交易 —— 来源 article §Product thesis

**开发计划**：

- step 1 (~6s) — 真实低风险市场详情展示公开 outcome source 与同时披露特征
- step 2 (~5s) — 画面从当前价格事件切换到个体私下决定型 reference case
- step 3 (~4s) — reference case 的 95/100 高风险结果成为主视觉
- step 4 (~8s) — 结果控制、交易限制与 CB-1 证据同时可读
- step 5 (~7s) — 3 ↔ 95 对比与 “risk, not prediction” 边界并列
- step 6 (~4s) — 不指控、不做实时内幕检测的 caveat 占据画面

口播节选：
> That three-to-ninety-five contrast is the product. LevelField explains who can know first, not which side will win.

---

## 3. model-classifies-code-decides — 模型分类，代码裁决（4 steps · ~33s）

**信息池**：
- 结构：公开的五维 anchor library —— 来源 article §Trust model and technical proof
- 证据：非空 evidence quote 必须是合同原文中的连续子串 —— 来源 article §Trust model and technical proof
- 防御：代码独立拒绝面向自动评估器的 instruction-like 内容 —— 来源 article §Trust model and technical proof
- 保守策略：信息不足默认 level 4，而不是猜低风险 —— 来源 article §Trust model and technical proof
- 数值边界：固定权重、跨维规则与 circuit breaker 都由确定性代码执行 —— 来源 article §Trust model and technical proof

**开发计划**：

- step 1 (~7s) — Methodology 的五维 anchor library 与模型分类边界同屏
- step 2 (~7s) — Assess workspace 中原文与逐字 evidence quote 的真实对应关系
- step 3 (~5s) — instruction-like evidence 拒绝提示与 insufficient-information 保守默认值
- step 4 (~7s) — 固定权重、跨维规则、circuit breaker 与最终数字的代码路径

口播节选：
> Every evidence quote must match the contract's exact words. The model never generates the numeric score.

---

## 4. agent-to-chain — 决策发生处的 Agent 与链上记录（5 steps · ~40s）

**信息池**：
- Agent：真实 MCP stdio 连接；low / moderate 为 PROCEED，elevated / high 为 DECLINE —— 来源 article §Trust model and technical proof
- 决策：录制当天快照的 DreamDEX binary 为 3 / PROCEED；个体决定案例为 95 / DECLINE —— 来源 article §Trust model and technical proof
- 链上字段：score、band、五维 levels、method hash、timestamp 与 immutable source —— 来源 article §Trust model and technical proof
- 验证策略：任何缺失或不一致都 fail closed —— 来源 article §Trust model and technical proof

**开发计划**：

- step 1 (~7s) — 可复现 transcript 还原 LevelField MCP server 的真实 stdio 连接与 pre-action 调用位置
- step 2 (~6s) — 可见策略把 low / moderate 映射为 PROCEED，把 elevated / high 映射为 DECLINE
- step 3 (~7s) — MCP response transcript 依次展示 3 / PROCEED 与 95 / DECLINE 及解释
- step 4 (~10s) — provenance-complete 的 Somnia Shannon Score Registry 字段与 immutable source 同屏
- step 5 (~5s) — 读回 verifier 的完整字段比较与 fail-closed 结论

口播节选：
> Here, an agent calls the real LevelField MCP server over standard input and output before it acts.

---

## 5. proof-and-growth — 证据、生态与收束（3 steps · ~37s）

**信息池**：
- 验证集：16 个 curated contracts 覆盖 3–95，类别风险排序符合预期，Spearman rho 为 0.93 —— 来源 article §Evidence and ecosystem value
- 工程质量：69 个软件测试与 8 个 Forge 测试通过 —— 来源 article §Evidence and ecosystem value
- SDK：官方 DreamDEX SDK 作为 active-market discovery 的独立只读 cross-check —— 来源 article §Evidence and ecosystem value
- 反馈：11 条有证据的 SDK / documentation findings —— 来源 article §Evidence and ecosystem value
- 愿景：成为 agent、venue 与 trader 可调用的交易前结构风险层 —— 来源 article §Evidence and ecosystem value

**开发计划**：

- step 1 (~9s) — 16 个案例、3–95 范围、rho 0.93 的验证结果成为主证据
- step 2 (~9s) — 69 + 8 测试、官方 SDK cross-check 与只读属性集中展示
- step 3 (~9s) — 11 条反馈、三类生态使用者与 “Know who can know before they do” 终帧

口播节选：
> As DreamDEX grows, LevelField helps agents, venues, and traders know who can know before they do.

---

## 素材清单

### 1. price-does-not-tell
- ✓ Garden 主视觉：`apps/web/public/brand/levelfield-risk-field.webp`
- ✓ LevelField glyph：`apps/web/public/brand/level-glyph.svg`
- ✓ 首页录屏基准：`output/playwright/home-desktop.png`
- ⚠️ 录制当天的公开部署 URL 与当前 DreamDEX market ID

### 2. three-vs-ninety-five
- ✓ 首页 3 ↔ 95 对比与真实市场详情 UI
- ✓ `curated-celebrity-breakup` 95/100 reference case
- ⚠️ 录制前刷新 score cache，确保低风险镜头对应仍活跃的市场

### 3. model-classifies-code-decides
- ✓ Methodology、Assess workspace 与成功结果 UI
- ✓ Assess 的 instruction-like evidence 专用错误状态
- ⚠️ 最终录制使用真实模型 JSON，不制作伪造模型返回

### 4. agent-to-chain
- ✓ `npm run demo:agent` 终端流程
- ✓ ScoreRegistry 合约与 Shannon explorer 地址
- ⚠️ 使用真实 `GITHUB_REPO` + immutable `GITHUB_REF` republish / verify 后，再录 provenance-complete 画面
- ⚠️ Explorer 与终端录制时隐藏钱包、密钥和个人信息

### 5. proof-and-growth
- ✓ 测试、Forge、SDK cross-check 与验证集输出
- ✓ `docs/sdk-feedback-report.md`
- ⚠️ 最终公开 GitHub URL、部署 URL 与提交页 CTA

---

## 自检

- [x] 21 个 outline steps 与 `script.md` 的 21 个口播节拍一一对应。
- [x] 每个 step 都是单句屏幕内容描述，没有规定动画或 CSS 实现。
- [x] 每个口播 step 约为 4–13 秒；实测含 200 ms step 间隔合计 173.57 秒，低于 3:00。
- [x] 每章 3–6 steps；每章信息池至少 4 条且均可回到 `article.md`。
- [x] 素材按章节列出，并区分已就位素材与录制前置条件。
- [x] 链上完整证明与当前 DreamDEX 数据都设为录制 gate，不把旧快照称为实时或 provenance-complete。
