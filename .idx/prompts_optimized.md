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
2. 运行 `git branch --show-current` 获取当前分支名。
3. 运行 `git diff --stat` 查看变动统计（避免输出过大）。
4. 如果变动文件少于5个，运行 `git diff` 查看具体差异；否则只查看统计。
5. **思考**：用一句简洁的话总结这次修改的核心价值（例如："修复了登录页面的 CSRF 漏洞"）。
6. 生成一段详细的 Issue 描述（包含修改原因、影响范围、变动文件列表）。

## Step 2: 获取授权 (Human Check)
**关键**：在执行任何写入操作前，向用户展示以下计划，并**停止**等待用户回复 "Y"：

```
📋 准备执行同步操作：

🔹 Commit Message: [Auto] <核心总结>
🔹 Branch: <当前分支>
🔹 Changed Files: <文件数量> files
🔹 Issue Title: <核心总结>
🔹 Issue Labels: auto-sync

📝 Issue 描述预览：
<详细描述前100字>...

是否继续？(Y/N)
```

## Step 3: 执行 (Execution)
只有在用户明确回复 "Y" 后，依次执行以下终端命令：

1. `git add .`
2. `git commit -m "[Auto] <核心总结>"`
3. `git push origin <当前分支>`
4. `gh issue create --title "<核心总结>" --body "<详细描述>\n\n---\n*🤖 Created via Antigravity AI*\n*📅 $(date)*" --label "auto-sync"`

**注意**：
- 如果 `git push` 失败（例如需要先 pull），停止执行并提示用户
- 如果 `gh` 命令不可用，提示用户安装 GitHub CLI

## Step 4: 报告
输出执行结果：
```
✅ 同步完成！

📦 Commit: <commit hash>
🌿 Branch: <分支名>
🔗 Issue: <Issue URL>

下一步建议：
- 在 GitHub 上查看 Issue 并添加更多细节
- 如果需要，创建 Pull Request
```

## Error Handling
如果任何步骤失败：
1. 立即停止执行后续步骤
2. 显示错误信息
3. 提供回滚建议（如果已经 commit）
