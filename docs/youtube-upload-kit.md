# YouTube 上传包（复制粘贴即用）

文件：`demo-video/levelfield-demo.mp4`（v2.3 终检通过：sha 5d91fb13…，2:55.0，
1080p25，BT.709，−16.2 LUFS，51 条烧录字幕）
字幕侧挂：`demo-video/levelfield-demo.en.srt`（上传页 Video elements → Add subtitles
→ Upload file → With timing，选该 SRT）

可见性：**Public**（DoraHacks 表单 video link 为硬必填，公开利于评委与生态曝光；
如想低调可选 Unlisted，链接照样可用）。上传后把 URL 发给 Claude 回填全部文档。

## Title

LevelField — Know Who Can Know, Before You Do | Somnia × DreamDEX Hackathon

## Description

LevelField is a pre-trade structural information-asymmetry risk layer for
event contracts, built for the Somnia × DreamDEX Event Contracts Hackathon.

It scores any event contract from its text alone — who controls the outcome,
who knows early, and whether anything stops them from trading on it. No model
ever writes the number: classification is matched against a public anchor
library with machine-verified verbatim evidence, and deterministic code
computes the score. Agents call it over MCP before they act; every score is
attested on Somnia Shannon with an immutable source record.

Everything in this video is the real product: live deployed UI, a real MCP
stdio transcript, real on-chain transactions.

Links
- GitHub: https://github.com/Aji-Q/levelfield
- ScoreRegistry (source-verified, Somnia Shannon):
  https://shannon-explorer.somnia.network/address/0xb8e11dea346f2c961880879606a269db3165bbc7
- Live site: (最终 URL，上传时如已生成则填 levelfield-*.vercel.app)

Chapters
0:00 The problem — a price doesn't tell you who can know
0:24 A real DreamDEX market scores 3/100
0:46 Change nothing but the event: 95/100
1:15 How it works — anchors, verbatim evidence, injection defense
1:44 Deterministic engine: the model never writes the number
1:53 Agents ask first — the MCP server, PROCEED / DECLINE
2:23 On-chain attestations on Somnia Shannon
2:33 Validation: 16 contracts, Spearman ρ = 0.93
2:53 Know who can know — before you do

Tags（可选）: prediction markets, event contracts, Somnia, DreamDEX, MCP,
risk assessment, blockchain, hackathon
