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
3. [x] **GitHub 仓库已上线** — https://github.com/Aji-Q/levelfield（全历史 45 commits，
   main + codex 分支与本地核验一致；旧不合规仓库已删；homepage/topics 已设）。
   原文（已完成）：**GitHub 通路已半通** — owner 已给 fine-grained PAT（Aji-Q，已验证，存
   gitignored .env）：可读写仓库内容，但无 Administration 权限（API 建仓库 403）。
   剩一步（owner 二选一）：github.com/new 手建空 Public 仓库 `levelfield`（推荐，
   30 秒）；或重签 PAT 加 Administration write。之后推送/republish 全部 Claude 执行，
   按审查建议排在 08-25 窗口开启后（窗口内 commit 证据）。历史原样推。
4. [ ] **（Claude）链上溯源补全（杀掉 P0-1 死链）** — 钉住提交 SHA →
   `registry:publish --send`（钱包余 0.611 STT 足够）→ `verify:onchain` →
   commit 新 onchain.json（站点从 "awaiting republish" 翻转为 verified）→ push。
5. [~] **live URL 已上线，收尾两件** — https://temporary-express-dune-jjgodnq.vercel.app
   （静态导出 STATIC_EXPORT=1；全页 200 验证 + 移动端抽查通过；构建产物零密钥）。
   (a) 认领确认 ✓（dashboard 截图，Hobby 账号）；连接器仍看不到项目 —— 安装时
   scope 未含新项目，可选修复：Vercel Settings → Integrations → Claude → All Projects；
   (b) dashboard 显示 No Production Deployment，URL 仍 200 —— 可点 Promote to
   Production 兜底；最终方案是 08-25 仓库推送后建 git 连接的正式 levelfield 项目，
   临时项目届时删除。
   快照刷新 + republish 完成后 Claude 重部署一次，让线上站显示
   provenance-complete 状态；最终 URL 回填 README/submission。
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
| 公开 GitHub 仓库 | ✅ github.com/Aji-Q/levelfield（45 commits 全历史） |
| 2–3 分钟 demo 视频 | ✅ 母带完成（2:55，烧录字幕）；⬜ 上传（第 6 项） |
| SDK/文档反馈报告 | ✅ docs/sdk-feedback-report.md（11 条，审查评价"超出获奖标准线"） |
| 链上可验证性 | ✅ 合约已部署+源码验证；⬜ URI 死链待第 4 项翻转 |
