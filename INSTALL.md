# Readmate 安装指南

[返回项目首页](README.md)

适用于 v0.1.0 指令型 Skill。以下安装方式依据官方文档整理；尚未完成各平台实机安装与端到端测试。请先用测试资料验证保存和接力流程。

安装的是整个 `readmate` 目录，不只是复制 `SKILL.md`。入口通过相对路径读取 `references/`、`templates/` 和 `evals/`；它们必须一起保留。通用结构依据 [Agent Skills 规范](https://agentskills.io/specification)。

从 GitHub 安装前先确认目标分支根目录已有 `SKILL.md`。如果看到的仍只有初始 README，请使用包含 `README.md` 和 `SKILL.md` 的完整文件包，待源码同步后再使用仓库安装命令。`main` 是开发分支，不代表已有稳定版 Release；安装前阅读来源文件并保留产品自己的安全确认。

## Codex：本地 Skill 安装

[官方文档](https://developers.openai.com/codex/skills/) 指定用户级本地技能位置为 `$HOME/.agents/skills`。以下示例需要已安装 Git、Codex 和相应文件权限，且目标目录尚不存在。

macOS / Linux 终端：

```bash
mkdir -p "$HOME/.agents/skills"
git clone --depth 1 https://github.com/autsch42/readmate.git "$HOME/.agents/skills/readmate"
```

Windows PowerShell：

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.agents\skills" | Out-Null
git clone --depth 1 https://github.com/autsch42/readmate.git "$HOME\.agents\skills\readmate"
```

不用 Git 时，可将完整包解压后，把名为 `readmate` 的目录放入上述用户技能目录，确认最终位置是 `readmate/SKILL.md`，不是多嵌套一层的 `readmate/readmate/SKILL.md`。从 GitHub Download ZIP 获得的 `readmate-main` 目录需改名为 `readmate`。

在 Codex 中通过 `/skills` 检查是否发现 Readmate，然后输入：

```text
$readmate 开始记录我的阅读。先告诉我默认保存格式和实际持久保存位置。
```

没有发现新技能时重新启动 Codex。宿主已经存在同名目录时先检查和备份自己的改动，不覆盖安装，不把私人笔记放入技能目录。此处是 Codex 的本地技能安装方式，不等同于 ChatGPT 网页/手机端插件市场发布。

## Gemini CLI：从仓库安装

[Gemini CLI 官方技能文档](https://geminicli.com/docs/cli/skills/) 支持从 Git 仓库或本地目录安装。使用提供 `gemini skills` 命令的版本，在终端执行：

```bash
gemini skills install https://github.com/autsch42/readmate.git --scope user
gemini skills list
```

从已解压的本地文件包安装时，将路径替换为真实的 Readmate 目录：

```bash
gemini skills install /absolute/path/to/readmate --scope user
```

保留安装时的安全确认，不需要添加跳过确认的 `--consent`。已开启的交互会话可使用 `/skills reload` 刷新，再自然地说“使用 readmate 开始记录我的阅读”。如果命令不存在，先核对当前 Gemini CLI 版本与其帮助，不把此命令用于 Gemini 网页或 App。

## Claude Code：个人 Skill 目录

[Claude Code 官方文档](https://code.claude.com/docs/en/skills) 指定个人技能可放在 `~/.claude/skills/`。macOS / Linux 示例：

```bash
mkdir -p "$HOME/.claude/skills"
git clone --depth 1 https://github.com/autsch42/readmate.git "$HOME/.claude/skills/readmate"
```

Windows 可将完整目录放入 `%USERPROFILE%\.claude\skills\readmate`；自定义了 Claude 配置目录时按实际配置处理。然后在 Claude Code 会话中调用：

```text
/readmate 开始记录我的阅读。先检查是否已有阅读库配置。
```

上述目录都只是技能安装位置，**不是个人阅读笔记的默认保存位置**。Readmate 首次运行仍须识别并告知宿主的持久文档位置。

## WorkBuddy：自定义技能导入准备

[WorkBuddy 开放平台文档](https://open.workbuddy.cn/docs/skill) 描述了 `SKILL.md` 目录、ZIP 提交及额外元数据要求。市场安装与开发者提交不同：Readmate 当前没有已确认的市场条目，不要以“搜索后点击安装”作为既成事实。

当前包提供 [WorkBuddy 适配说明](adapters/workbuddy.md)。有自定义技能导入入口的版本，可将符合该入口结构要求的完整目录或 ZIP 交给它安装；需要通过开放平台提交时，按适配说明在打包副本中补充中英文描述、版本、作者等字段。当前并未验证所有 WorkBuddy 版本都提供相同的本地导入入口；没有入口时不要假装安装成功。

可向具备相应安装能力的宿主提出：“请检查这个 Readmate 文件包，并按当前产品支持的自定义 Skill 安装方式安装；不要初始化我的私人阅读库。”导入完成后在新会话做实际测试。手动要求模型读一次 `SKILL.md` 只是试读规则，不等于已经安装可自动发现的技能。

## 其他 Agent 与本地模型

支持 Agent Skills 的宿主，应按其文档将完整 `readmate` 目录放进实际技能发现位置。不能把 Codex 或 Claude Code 的目录当作所有产品通用路径。只要有明确的规则加载、持久读写和授权机制，就可以按本包协议开展适配测试；不按模型的国家、品牌或名称推断兼容性。

没有原生 Skill 入口但可读文件的 Agent，可在任务中明确要求读取本包 `SKILL.md` 并按需读取相对资源；这属于手动加载，不是原生安装。只有纯聊天能力时可讨论和生成待保存文本，不能承诺私有配置、附件或阅读历史已经长期保存。

## 第一次运行的检查

用虚构书名和测试感受启动 Readmate，确认它显示了真实的持久保存位置，并能找到实际生成的配置、索引和笔记。随后说“准备接力”，在没有旧聊天内容的新会话中继续阅读，检查它是否通过文件恢复，而不是让模型复述记忆。

长期设置可直接说“以后新建笔记改用这个目录”；临时输出可说“这次导出 PDF”。详细要求见 [配置规范](references/storage-and-settings.md)。完整测试案例见 [验收清单](evals/acceptance.md)，未执行的项目不能标成通过。

## 更新与卸载

通过 Git 安装时，在确认没有需要保留的本地修改后，可以在技能目录执行 `git pull --ff-only`；冲突或失败就停止并查看差异，不使用强制重置清除用户改动。目录复制安装则先备份旧规则，再更换公开 Skill 文件。

更新不重置私有阅读设置，卸载不删除阅读库。确需迁移、转换或删除个人数据时另行明确操作。Gemini CLI 可按其官方管理命令卸载技能；其他产品按自身技能管理方式操作，不盲目删除整个工作目录。

## 官方参考

安装方式核对日期：2026-09-19。

- [Agent Skills 规范](https://agentskills.io/specification)
- [Codex Skills](https://developers.openai.com/codex/skills/)
- [Gemini CLI Skills](https://geminicli.com/docs/cli/skills/)
- [Claude Code Skills](https://code.claude.com/docs/en/skills)
- [WorkBuddy 技能文档](https://open.workbuddy.cn/docs/skill)
