# 配置与阅读模板

这是公开模板集合，不是已初始化的个人阅读库。按任务只创建必要文档；占位符需用已确认值替换，未知信息标“未知”。文档主格式可变，以下 Markdown 结构应被保留为语义分区而非固定排版。

## 私有入口 `.readmate-pointer.json`

将入口放在宿主允许、下次能定位的私有持久位置，不放进本 Skill 安装目录。根目录变更后核验新指向。

```json
{
  "schema_version": 1,
  "library_id": null,
  "config_uri": null
}
```

## 用户配置 `config.json`

初次创建时解析实际位置并生成稳定库 ID；云端 `uri` 可以是持久文件定位符。已存在配置时只局部修改，不用此模板重置用户选择。配置中的路径均应能被当前宿主解析；相对路径以已经确认的阅读库根目录为基准。

```json
{
  "schema_version": 1,
  "revision": 1,
  "library_id": null,
  "root_uri": null,
  "index_uri": "index.json",
  "notes_uri": "notes/",
  "sources_uri": "sources/",
  "handoffs_uri": "handoffs/",
  "reflections_uri": "reflections/",
  "defaults": {
    "note_format": "markdown",
    "archive_original_attachments": true,
    "archive_large_av": false,
    "web_snapshot": "when_available",
    "writing_analysis": "on_request"
  },
  "user_preferences": {},
  "updated_at": null
}
```

`note_format` 是可改默认值，不是所有宿主已支持任意格式的声明。`user_preferences` 只保存用户明确的长期要求；对象级例外放索引对象条目。不要写入令牌或私有对话全文。

分享无需增加配置即可使用：报告后主动询问，默认小红书与 `full-bleed-reading-v1`。用户明确要求长期覆盖时，才在 `user_preferences.sharing` 写入相应字段，例如 `{"offer_after_report": false}`；不写账号或登录信息。缺少此字段时使用 Skill 默认值，不把旧配置重置成模板。

## 对象索引 `index.json`

```json
{
  "schema_version": 1,
  "revision": 1,
  "library_id": null,
  "objects": []
}
```

新增对象条目的形状如下。占位符只供理解，不将虚构条目初始化进阅读库。`source_ids`、阅读记录等保存在主档；索引负责文件绑定和导航。

```json
{
  "object_id": "OBJECT_ID",
  "kind": "book",
  "title": "TITLE",
  "master_uri": "notes/OBJECT_ID.md",
  "master_format": "markdown",
  "settings": {},
  "handoff_uri": null,
  "derived_outputs": []
}
```

`kind` 可为 `book`、`issue`、`source`、`topic`。对象设置覆盖库默认；主档绑定不会因默认值变更自动移动。完成汇总在 `derived_outputs` 登记，不成为第二个主档。

## 单体主档：书籍、整期杂志或单篇来源

```markdown
# 阅读笔记｜〔标题〕

对象 ID：〔稳定 ID〕
类型：〔书籍 / 整期杂志 / 单篇来源〕
作者/创作者：未知
版本/平台：未知
开始日期：未知
状态：进行中
用户确认已读进度：未知
最近讨论位置：未知

## 来源与附件
| 来源 ID | 标题/文件原名 | 版本/平台 | 原 URL | 归档定位符 | 类型与状态 | 可见范围 |
| --- | --- | --- | --- | --- | --- | --- |

## 阅读前的期待
〔仅记录用户实际表达；未提供则省略。〕

## 阅读记录
### R001｜〔本次思考标题〕
记录日期：未知
来源：〔S01〕
位置：〔章节/印刷页/PDF页序/时间码，分别标识；未知可留未知〕

#### 阅读材料
〔必要背景或摘录，区分原文与转述。〕

#### 我的即时表达
〔忠实保留用户表达。〕

#### 整理后的个人观点
〔不增加用户未表达的结论。〕

#### AI 延伸思考
〔有价值时另列，不作为用户观点。〕

#### 关联与待追踪问题
〔关联的来源/记录 ID；关键词可选。〕

## 观点变化
〔新旧记录 ID、触发材料、改变及尚未解决处；有变化才写。〕

## 写作轨（可选）
〔用户需要学习写法时填写，与内容轨分开。〕

## 接力与完成产物
〔实际接力摘要、读后感定位符与其版本，未生成不伪造。〕
```

## 专题主档

```markdown
# 专题阅读｜〔问题〕

对象 ID：〔稳定 ID〕
专题范围：〔实际问题与边界〕
状态：进行中

## 来源清单
〔各来源 ID、作者、位置、归档状态；已有主档的来源只引用。〕

## 阅读记录
〔沿用 R001 格式，保留用户原表达、整理观点与 AI 延伸。〕

## 来源之间的关系
〔支持、冲突、定义或前提差异、证据覆盖范围，逐项指向实际来源。〕

## 我的判断如何变化
〔旧记录 → 触发来源 → 新记录；未形成结论就保留疑问。〕

## 未解决的问题
〔实际问题，不机械补齐。〕
```

## 会话接力摘要

```markdown
# 会话接力｜〔对象名〕

对象 ID：〔ID〕
阅读库 ID：〔ID〕
配置入口：〔真实私有位置，不含凭据〕
主档：〔真实定位符与格式〕
摘要时间：未知
最后记录 ID：〔ID〕
最后来源 ID：〔ID〕
用户确认进度：未知
最近讨论位置：未知

## 当前判断与近期变化
〔用户观点；AI 意见另行标注。〕

## 未解问题与下一步
〔待追踪问题、下次起点、是否还有未保存项。〕

## 附件与保存状态
〔真实状态及待归档项。〕
```

## 完成后的个人汇总

```markdown
# 我的阅读汇总｜〔对象名〕

对应对象与主档：〔真实定位符〕
覆盖记录：〔实际读取的 ID 范围；缺口明确标注〕
性质：基于个人阅读记录的衍生产物，不替代原始主档。

## 我的阅读过程与感受
〔根据用户记录写成连贯文字，保留变化和疑问。〕

## 我改变了哪些看法
〔原判断、触发信息、新理解，关联记录 ID。〕

## 留下的判断与问题
〔接受、存疑、反对和暂时无法判断；材料不足就少写。〕

## 记录依据与跨来源关联
〔关键归纳对应的记录及来源 ID。〕
```

## 分享包登记（私有衍生产物）

制作完成时可采用下面的结构，放在阅读对象的私有输出目录中，索引 `derived_outputs` 只登记其定位符。图片和文案是对外可交付部分，私有清单与上传回执不加入下载分享包。路径以实际输出为准；这里的文件名不是已生成声明。

```json
{
  "object_id": "OBJECT_ID",
  "report_uri": "REPORT_URI",
  "design_preset": "full-bleed-reading-v1",
  "platform": "xiaohongshu",
  "images": ["images/01.png", "images/02.png"],
  "caption": {
    "title": "TITLE",
    "body": "BODY",
    "hashtags": []
  },
  "caption_uri": "分享文案.md",
  "private_manifest_uri": "private-manifest.json",
  "checks": {"content": "pending", "visual": "pending"},
  "delivery": {
    "action": "save_draft",
    "status": "not_requested",
    "receipt_uri": null
  }
}
```

`images` 数组即上传顺序，第一张为封面；内容检查与视觉检查均实际通过后才标 `passed`。`delivery.status` 按事实改为 `pending`、`saved_unverified`、`draft_verified` 或 `failed`；本次用户指令与所批准版本记入私有回执，不写成“永久允许自动发布”。完成草稿核验不设置 `published`。平台正式发表若另有明确授权与能力，单独记录实际发表证据。
