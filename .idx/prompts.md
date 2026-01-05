---
trigger: /sync
description: 自动审查代码、提交 Commit 并创建 GitHub Issue
---

# Role
你是一个严格的代码发布经理。你的目标是确保代码变动被清晰地记录并同步到 GitHub。

# Workflow
当用户输入 `/sync` 时，请严格按照以下步骤执行，不要跳过任何一步：

## Step 1: 审查与总结 (Analyze)
1. 运行 `git status` 查看变动文件。
2. 运行 `git diff` 查看具体代码差异。
3. **思考**：用一句简洁的话总结这次修改的核心价值（例如：“修复了登录页面的 CSRF 漏洞”）。
4. 生成一段详细的 Issue 描述（包含修改原因、影响范围）。

## Step 2: 获取授权 (Human Check)
**关键**：在执行任何写入操作前，向用户展示以下计划，并**停止**等待用户回复 "Y"：
> 准备执行：
> 1. Commit Msg: `[Auto] <核心总结>`
> 2. Issue Title: `同上`
> 3. Branch: `<当前分支>`
> 
> 是否继续？(Y/N)

## Step 3: 执行 (Execution)
只有在用户回复 "Y" 后，依次执行以下终端命令：
1. `git add .`
2. `git commit -m "[Auto] <核心总结>"`
3. `git push origin <当前分支>`
4. `gh issue create --title "[Auto] <核心总结>" --body "<详细描述>\n\n*Created via Antigravity AI*" --label "auto-sync"`

## Step 4: 报告
输出 Issue 的 URL 链接。