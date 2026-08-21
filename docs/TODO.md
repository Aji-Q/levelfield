# 提交前 TODO（依据 docs/review/fable-review-2026-08-20.md §4）

时间锚点：窗口开启 2026-08-25，截止 2026-09-08 14:00。
每项标注负责人；序号即依赖顺序，前项未完成不做后项。
审查报告标记 [agent] 的前置修复（README 门面、权重漂移测试、16 合约断言、
文档纠错、死代码清理）已于 08-20 完成（commits 885b644 / fa526bd）。

## 主链（每项阻塞其后所有项）

1. [ ] **（你，08-24 之后）资格三问** — 打开 DoraHacks BUIDL 赛事页，确认：
   (a) 窗口前完成的构建是否有资格；(b) demo 视频是否允许 TTS/AI 配音；
   (c) 必交物清单原文。页面含糊就去赛事 Discord 直接问——沉默≠允许。
   → 答案决定 2-8 是否照常执行（分支预案见文末）。
2. [ ] **（Claude）提交批次准备** — `npm run score:all` 刷新实时市场快照
   （须紧贴推送前做，否则快照再次过期）→ 全门禁重跑 → 补两个小缺口
   （根 package.json 声明 MCP SDK 依赖；agreement.ts 加 npm script 入口）→ commit。
3. [ ] **（你）建公开 GitHub 仓库并推送全历史** — 需要 `gh auth login` 或给我仓库
   URL+推送权限。按审查建议：历史原样推（改写历史会毁掉评委要看的增量记录）。
4. [ ] **（Claude）链上溯源补全（杀掉 P0-1 死链）** — 钉住提交 SHA →
   `registry:publish --send`（钱包余 0.611 STT 足够）→ `verify:onchain` →
   commit 新 onchain.json（站点从 "awaiting republish" 翻转为 verified）→ push。
5. [ ] **（你，可选但杠杆最大）部署 live URL** — 30 页纯静态站，Vercel/Netlify/
   GitHub Pages 任一，需你的账号授权；URL 进 README 与提交表。
   审查依据：DoraHacks 审核明确看重可点击的 https demo 链接。
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
