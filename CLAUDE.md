Before opening or updating a PR: fetch the latest main and merge it into this branch (`git merge origin/main`); never rebase. Resolve any conflicts by keeping both sides, as AGENTS.md says. If a conflict involves two features changing the same behaviour, stop and ask me instead of choosing. Then run `npm test` and `npm run build`, and push only once the branch is conflict-free and both pass. Never force-push or otherwise rewrite a branch's pushed history. In the PR description, list any conflicts you resolved and which side you kept.

Shortcuts:

"sync": fetch latest main, merge it into this branch, resolve conflicts, run `npm test` and `npm run build`, push (no force-push).
"ship": sync first, then open a PR with a summary of the changes and any conflicts resolved.
"status": list my open PRs and say which ones have conflicts or failing checks.
