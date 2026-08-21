# 提交前 TODO（依据 docs/review/fable-review-2026-08-20.md §4）

时间锚点：窗口开启 2026-08-25，截止 2026-09-08 14:00。
每项标注负责人；序号即依赖顺序，前项未完成不做后项。
审查报告标记 [agent] 的前置修复（README 门面、权重漂移测试、16 合约断言、
文档纠错、死代码清理）已于 08-20 完成（commits 885b644 / fa526bd）。

## 主链（每项阻塞其后所有项）

1. [~] **资格三问**（侦察完成，待窗口开启复核）— 证据链见
   docs/review/research-eligibility-rules.md（赛事页全文已读 + 平台规则 + 往届先例）：
   (a) 窗口前构建：本赛事页**无** fresh-code 条款（DoraHacks 该条款为主办方
   自选项，本主办方未选），平台自带 "Apply with Existing BUIDL" 通道，两个
   Somnia 姊妹赛事亦无此要求 → 风险判为幻影，主链照常推进；
   (b) TTS/AI 配音：赛事页/行为准则/服务条款均无限制 → 照常；AI 生成画面同判，
   若被问及如实说明即可；
   (c) 必交物（赛事页原文）：testnet 可跑原型 + GitHub 仓库 + 2–3 分钟视频；
   deck 和 SDK 反馈报告为**可选加分项**（我们已备）。
   判分权重：Technical 25% / Innovation 20% / UX & Design 20% /
   Ecosystem Impact 20% / Presentation 15%。
   残余动作：提交开放时（页面部件示 08-24 20:00 UTC）owner 复核规则页有无
   临时新增条款；主办方邮件回复到达后同步核对。
2. [ ] **（Claude）提交批次准备** — `npm run score:all` 刷新实时市场快照
   （须紧贴推送前做，否则快照再次过期）→ 全门禁重跑 → 补两个小缺口
   （根 package.json 声明 MCP SDK 依赖；agreement.ts 加 npm script 入口）→ commit。
3. [ ] **（你）建公开 GitHub 仓库并推送全历史** — 需要 `gh auth login` 或给我仓库
   URL+推送权限。按审查建议：历史原样推（改写历史会毁掉评委要看的增量记录）。
4. [ ] **（Claude）链上溯源补全（杀掉 P0-1 死链）** — 钉住提交 SHA →
   `registry:publish --send`（钱包余 0.611 STT 足够）→ `verify:onchain` →
   commit 新 onchain.json（站点从 "awaiting republish" 翻转为 verified）→ push。
5. [ ] **部署 live URL（方案已定：Vercel CLI 本地直推，不依赖 GitHub）** —
   你只做一步：`npx vercel login`（邮箱验证，约 1 分钟）；其余（link、--prod
   部署、线上 30 页验证、URL 回填 README/submission）Claude 执行。
   依据：DoraHacks 审核看重可点击 https demo 链接；此方案不被第 3 项阻塞，
   仓库推送后可再接自动部署。备选：Netlify（同流程）/GitHub Pages（需先推仓库）。
6. [ ] **（你）上传 YouTube** — `demo-video/levelfield-demo.mp4`（v2.3, 2:55）
   + 同目录 SRT 字幕文件；链接回填给我。
7. [ ] **（Claude）提交文案定稿** — submission.md 填全部 TODO（仓库/视频 URL）、
   加"溯源已补全 + attestation 浏览器链接"一句（P2-1）、注明 ScoreRegistry
   无输入边界为已知限制（P3）、deck 刷新或从提交中移除（二选一，你拍板）。
8. [ ] **（你）终读提交文案 → 窗口开启后在 DoraHacks 提交**。

## 分支预案（第 1 项的答案触发）

- **TTS 被禁** → 用 film 工程的 FORCE_OFFLINE 通道换人声/无旁白重制
  （demo-video/film/README.md 有完整重建命令；约半天）。
- **窗口前构建不合格** → 立即 Discord 申诉/确认口径；同时把第 2、4、5、7 项
  安排为窗口开启后的真实提交（窗口内时间戳的实质性工作）。
- **两项都过** → 按主链直行。

## 交付物状态速览

| 必交物 | 状态 |
|---|---|
| 可跑原型（Shannon 测试网） | ✅ 全门禁绿（70+8 测试；agent demo PROCEED 3 / DECLINE 95） |
| 公开 GitHub 仓库 | ⬜ 第 3 项（owner） |
| 2–3 分钟 demo 视频 | ✅ 母带完成（2:55，烧录字幕）；⬜ 上传（第 6 项） |
| SDK/文档反馈报告 | ✅ docs/sdk-feedback-report.md（11 条，审查评价"超出获奖标准线"） |
| 链上可验证性 | ✅ 合约已部署+源码验证；⬜ URI 死链待第 4 项翻转 |
