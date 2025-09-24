Create a short, descriptive branch from what we’re working on (kebab-case, brief).
Base off main.
Commit staged changes only (if any).
Push and open a PR with a short, straightforward title/body using gh.

Run:
git checkout -b <short-descriptive-branch>
git rebase origin/main
git commit -m "<short title from current work>" (only if staged)
git push -u origin <branch>
gh pr create --base main --head <branch> --title "<short title>" --body "Summary: <one-liner>"

Example placeholders to fill:
<short-descriptive-branch>: feature-login-rate-limit
<short title>: Add login rate limit
Summary: Add minimal rate limiting for /login; includes config and tests