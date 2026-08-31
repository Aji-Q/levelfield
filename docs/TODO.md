# 提交 Timeline（2026-08-31 定稿；截止 2026-09-08 18:00 UTC = 北京时间 09-09 02:00）

三路核查依据：docs/review/（fable 审查、资格侦察）+ 08-31 workflow 三重审计
（GitHub / 赛事页 / 本地资产）。规则与判分权重零变化；表单新增 4 必答项；
竞品 12 个 BUIDL 已可见，MCP 角度无人占据。

## D0 · 08-31（今天）

- [x] Claude：Codex 复活遗留处理（NEEDS_REPLY 按 owner 后续指令关闭；
      capture-led 候选分支保留并推送）；LICENSE（MIT）；README 补 live URL；
      本时间线入库；main + 两条 codex 分支推送。
- [ ] Owner（10 分钟）：
  1. DoraHacks 账号自查：将用于提交的账号是否注册满 7 天（新账号首周最多建
     3 个 BUIDL 的平台限制，Q&A 有实例）；顺手点 Register as Hacker；
  2. 备好表单 4 答案：Telegram handle（必填）/ 所在地（必填）/
     **领奖钱包地址（必填）** / Discord 或 X（选填）；
  3. （可选）加入赛事 Telegram t.me/+XHq0F0JXMyhmMzM0。

## D1 · 09-01（执行日）

- [ ] Claude（链式，一次跑完）：`score:all` 刷新（08-31 已验 indexer 有当日
      Trading 行）→ 全门禁 → commit/push → 钉 SHA →
      `GITHUB_REPO=Aji-Q/levelfield GITHUB_REF=<SHA> registry:publish --send`
      （余额 0.611 STT，够一次；杀掉 28 条 PLACEHOLDER URI）→ `verify:onchain`
      → commit onchain.json → push → 静态导出重建。
- [ ] Owner（5 分钟）：Vercel dashboard → 项目 → **Connect Git Repository**
      选 Aji-Q/levelfield，Root Directory 填 `apps/web`，顺手把项目 rename 成
      `levelfield`（URL 变体面且自动 production；此后每次 push 自动部署）。
      备选：Claude 重发 --temporary 部署 + 认领链接。
- [ ] Owner：**YouTube 上传** demo-video/levelfield-demo.mp4（+同名 SRT）——
      表单 video link 为硬必填；回传 URL。

## D2 · 09-02（打包日，Claude）

- [ ] submission.md 终稿：video URL、"provenance 已补全 + attestation 浏览器
      链接"句、ScoreRegistry 无输入边界=已知限制句、**差异化段落**
      （对 Dreamdesk/Vitamin M：他们是 LLM 评审团/红绿灯打分——我们
      "没有任何模型写出数字"+ 全场唯一 MCP-native 预交易钩子）。
- [ ] README：重写 122 行（placeholder 句 → 已完成句）、127 行（YouTube 链接）、
      live URL 换正式域名；deck 幻灯 1/10 换 URL 重导 PDF；全部 push。

## D3 · 09-03（提交日）

- [ ] Owner：终读 submission.md → DoraHacks 登录提交（repo link + video link +
      4 答案）→ 告知 Claude。
- [ ] Claude：核验 BUIDL 页公开渲染（文案/链接/封面）。

## D5 · 09-05（复查，Claude）

- [ ] 赛事页复查（规则/公告/竞品增量；今日 showAnnouncements=false）；
      live 站与链上链接抽查；有变动时向 owner 提修改建议。

## 缓冲 · 09-06 → 09-08 18:00 UTC

预留应急（republish 失败需 faucet 补 STT、YouTube 处理慢、表单被平台卡）。

## 已消解的风险（存档）

- 窗口前构建 / TTS / AI 画面：赛事页 08-31 全文比对零变化，无任何限制条款。
- "testnet 原型"疑云（Q&A 竞品提问）：我们的 ScoreRegistry 部署与 28+ 条
  attestation 交易本身就是 Shannon 测试网链上活动，SDK 只读交叉核验 8/8；
  submission 文案 D2 显式写明。
- Codex 8-23/24 复活争议：owner 后续指令（动效升级 + v2.1–v2.3 验收）覆盖
  其引用的旧指令；v2.3 为最终母带，candidate 分支保留存档。

## 竞品速记（08-31，12 BUIDLs）

最近邻：Dreamdesk（LLM 评审团 + 风险闸门 + 哈希链上链、有 Shannon 实盘 tx、
08-30 更新）、Vitamin M（AI 打分红绿灯）。次邻：Rivo / rampart / SLUICE / Sigma。
无人做 MCP。我们的护城河句：deterministic scoring（零模型出数）+ 机器核验
verbatim 证据 + 注入防御 + 公开可复算验证（ρ=0.930）+ MCP-native。
