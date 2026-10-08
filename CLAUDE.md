Before opening or updating a PR: fetch the latest main, rebase this branch onto it, resolve any conflicts, and confirm the project still builds and runs. Only push once the branch is conflict-free. In the PR description, list any conflicts you resolved and which side you kept. If a conflict involves two features changing the same behaviour, stop and ask me instead of choosing.

Shortcuts:

"sync": fetch latest main, rebase this branch onto it, resolve conflicts, check the build, push.
"ship": sync first, then open a PR with a summary of the changes and any conflicts resolved.
"status": list my open PRs and say which ones have conflicts or failing checks.
