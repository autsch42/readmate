# WorkBuddy 导入准备说明

核对日期：2026-09-19。依据：[WorkBuddy 开放平台 Skill 文档](https://open.workbuddy.cn/docs/skill)。本文仅记录适配包的准备方式，未在 WorkBuddy 客户端或开放平台完成实际导入测试，也不表示 Readmate 已在其市场上架。

根目录 `SKILL.md` 保持 Agent Skills 的通用元数据格式。WorkBuddy 开放平台文档另外列出 `description_zh`、`description_en`、`version`、`author` 等字段，不能简单把“通用格式有效”当作市场提交已符合全部要求。

要准备提交包，复制整个 Readmate 目录到临时打包区，在复制件 `SKILL.md` 的 YAML 元数据中补充如下字段；正文、references、templates、evals 和 LICENSE 保持不变。不要修改安装后的私人阅读配置，也不要把整个私人阅读工作区压缩进去。

```yaml
display_name: 阅读伴侣
display_name_en: Readmate
description_zh: 长期对话阅读，保留个人观点与思维变化，支持来源归档、用户配置和会话接力。
description_en: A reading companion preserving your own reflections, evolving views, sources, settings, and session handoffs.
category: writing
version: "0.1.0"
author: autsch42
```

保持原有 `name: readmate` 和 `description`。提交包根目录含 `readmate/SKILL.md` 及所有相对引用文件；若特定导入入口明确要求 `SKILL.md` 直接位于 ZIP 根层，则按该入口规范调整一层目录，不更改资源相对路径。

开放平台的 ZIP 提交与普通用户市场安装是两条路径，不能混为一谈。未上架时，不提示用户“去市场搜索 Readmate 即可安装”。可向当前产品提供完整目录/ZIP，请其使用实际可用的自定义技能安装入口；若该版本没有导入入口，就说明限制，或仅显式加载规则试读，不把后者算作安装完成。

导入后需在新会话执行验收案例，尤其检查默认路径是否持久、配置能否重新定位、附件字节能否保存，以及“成功”回报是否有实际文件。未完成这些测试前标记为“准备适配，未实测”。
