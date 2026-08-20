# LevelField AI demo production plan

## 1. 成片策略

- **目标长度**：2:35–2:55，绝不超过 3:00；当前脚本 371 个口播词，离线预览实测 2:53.57，最终 ElevenLabs 以实际 MP3 时长为准。
- **语言**：英文主版；成片同时交付英文字幕 `.srt`。中文版本在英文锁片后再做。
- **证据比例**：所有产品数字与状态都来自真实 UI、CLI、DreamDEX、Somnia 或仓库产物；设计动画只负责解释结构，AI 图像只负责无数据含义的氛围画面。
- **真实性红线**：AI 不生成产品界面、市场数字、测试输出、链上交易或浏览器证据。
- **画面系统**：沿用 LevelField 的 forensic field notebook / premium cartographic instrument 视觉，不切换为通用 Web3 霓虹风。

### 2:54 预览时间轴

| 时间 | 章节 | 主要证据 |
|---|---|---|
| 00:00–00:23 | 价格没有告诉你的事 | AI 风险地形片头 → DreamDEX snapshot / LevelField 入口 |
| 00:23–01:04 | 3 vs 95 | 快照低风险 price binary → curated 高风险 reference case → CB-1 |
| 01:04–01:37 | 模型分类，代码裁决 | Methodology → Assess quote verification → conservative default |
| 01:37–02:17 | Agent 与链上记录 | MCP `PROCEED / DECLINE` → provenance release workflow → verifier |
| 02:17–02:54 | 证据、生态与终帧 | 16 cases / rho 0.93 → 69 + 8 tests → SDK cross-check / 11 findings → tagline |

## 2. ElevenLabs 旁白方案

### 推荐配置

- **模型**：`eleven_multilingual_v2`。官方将它定位为长内容中最稳定的多语模型；本片需要跨片段一致、数字清楚和专业语气，而不是戏剧化表演。见 [ElevenLabs models](https://elevenlabs.io/docs/overview/models)。
- **音色方向**：中性国际英语；30–45 岁感；冷静、可信、略带好奇；避免预告片低音、销售腔和过度兴奋。
- **初始参数**：stability `0.58`、similarity `0.75`、style `0`、speed `1.0`；speaker boost 先关闭，只有 A/B 试听确认咬字更好时才打开。若总时长接近 3:00，再 A/B 测试 speed `1.03–1.05`。官方常见起点约为 stability `0.5`、similarity `0.75`、style `0`，且 speed `1.0` 为默认值，见 [Voice settings](https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech)。
- **生成颗粒度**：严格按 `script.md` 的 `---` 分段。单段只承担一个画面 step；只重生成失败段，不整片重烧。
- **导出**：剪辑母版用 WAV 48 kHz；网页自动预览用 MP3。API key 只放 `ELEVENLABS_API_KEY` 环境变量，不进入仓库。

### 发音表

优先直接把口播写成可读形式；仍建立 alias pronunciation dictionary，锁定以下词：

| 屏幕写法 | 旁白读法 |
|---|---|
| LevelField | Level Field |
| DreamDEX | Dream Dex |
| Somnia | SOM-nee-uh |
| Shannon | SHAN-un |
| MCP | M C P |
| CB-1 | circuit breaker one |
| Spearman rho | SPEER-man row |
| stdio | standard input and output |
| 0.93 | point nine three |

`eleven_multilingual_v2` 使用 alias，而不是依赖 phoneme tag。数字、斜杠和缩写在送入 TTS 前全部写成自然语言。兼容性说明见 [Pronunciation dictionaries](https://elevenlabs.io/docs/eleven-api/guides/how-to/text-to-speech/pronunciation-dictionaries)。

### 接入 web-video-presentation

Phase 2 脚手架完成后增加 `presentation/scripts/tts-providers/elevenlabs.sh`，遵循：

```text
tts_check
tts_synthesize <text> <out_path> [voice]
tts_install_help
```

执行顺序：

```bash
cd demo-video/presentation
npm run extract-narrations
# 人工检查 audio-segments.json 后再生成
export ELEVENLABS_API_KEY="<your-key>"
export ELEVENLABS_VOICE_ID="<your-voice-id>"
PRESENTATION_TTS=elevenlabs npm run synthesize-audio
```

可选增强：调用 ElevenLabs [`with-timestamps`](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps) endpoint 保存字符级 alignment，再转换为逐词字幕时间；否则用最终音频跑一次转写生成 SRT。

## 3. AI 画面与真实录屏

### AI 只负责

1. 现有 Garden 风险地形主视觉的 16:9 延展与轻微视差版本。
2. 章节间 1–2 秒的等高线 / 标尺 / 铅垂线桥接画面。
3. 无数据含义的背景纹理和终帧氛围。

### 真实录屏负责

1. 首页 3 vs 95 对比。
2. 两个市场详情、D1/D3 evidence 与 circuit breaker。
3. Assess workspace 的 quote verification / injection rejection。
4. `npm run demo:agent` 的真实 MCP 输出。
5. Somnia explorer 与 provenance-complete attestation。
6. 测试、验证与 SDK cross-check 输出。

## 4. 录制规格

- 浏览器与网页演示：1920×1080，优先采集 60 fps、最终导出 30 fps，100% 缩放，隐藏书签栏、扩展图标、通知和个人账号。
- 终端：固定 18–22 px 字号；只保留演示命令与关键输出；提前清空历史。
- 鼠标：慢速、无乱晃；关键点击停顿约半秒，让评委看懂结果。
- 录制前固定数据：刷新 score cache，仅选仍 active 的 DreamDEX market；以公开仓库的 immutable commit republish / verify provenance；确认公开 GitHub 与部署 URL。
- 网页演示工程完成后使用 `?auto=1`，由逐 step 音频结束自动推进。

## 5. 后期与声音

- 旁白对白目标约 `-16 LUFS`，true peak 不高于 `-1 dBTP`。
- 配乐只用无歌词、低密度、可商用授权素材；旁白出现时压到约 `-28` 至 `-24 LUFS`。
- UI 点击声只用于章节关键节点；避免每次切换都加音效。
- 每个事实数字在画面上保持至少一个完整旁白句；字幕最多两行。
- 导出：H.264 MP4、1080p、30 fps、12–20 Mbps；另交一份英文 SRT。

## 6. 三轮 QA

1. **事实 QA**：所有数字、状态、市场和链上字段与录制当天仓库一致。
2. **音频 QA**：DreamDEX / Somnia / Spearman 等发音正确；无剪切、喘音、速度突变或跨段音色漂移。
3. **评委 QA**：静音观看仍能在 30 秒内理解问题与产品；只听音频也能复述 3 vs 95、Model → Code → Chain、Agent 决策和生态价值。

## 7. 录制前硬门槛

以下四项未全绿时，不锁旁白中的完成态，也不录最终事实镜头：

1. `npm run score:all` 后确认用于录屏的 DreamDEX market 在拍摄时仍 active，并在画面保留 snapshot 时间。
2. 设置真实 `GITHUB_REPO` 与 `GITHUB_REF="$(git rev-parse HEAD)"`，完成 Score Registry republish。
3. `npm run verify:onchain` 全量通过，页面不再显示 `Legacy provenance` / `awaiting republish`。
4. 公开部署 URL、公开 GitHub URL、`npm run demo:agent`、SDK cross-check、69 + 8 测试输出全部重新拍摄并与最终 commit 对齐。
