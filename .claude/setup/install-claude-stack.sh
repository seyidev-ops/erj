#!/usr/bin/env bash
# Installs the recommended Claude Code stack on YOUR machine (user scope). Idempotent. Writes no keys.
#   bash install-claude-stack.sh              # recommended set
#   EXTRAS=1 bash install-claude-stack.sh     # + the optional tools listed at the bottom
# Needs: claude, node 22+, npm, python3, uv.
set -u
FAILED=()
ok(){ echo "ok   $*"; }; bad(){ echo "FAIL $*"; FAILED+=("$*"); }
for t in claude node npm python3 uv git; do command -v $t >/dev/null || { echo "missing: $t"; exit 1; }; done
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

plugin(){ claude plugin marketplace add "$1" >/dev/null 2>&1; claude plugin install "$2" >/dev/null 2>&1 && ok "plugin $2" || bad "plugin $2"; }

plugin thedotmack/claude-mem  claude-mem@thedotmack     # cross-session memory
plugin DietrichGebert/ponytail ponytail@ponytail        # minimal-diff coding + review/audit
plugin pbakaus/impeccable     impeccable@impeccable     # design critique/audit (the one design skill)

uv tool install --force 'git+https://github.com/NVIDIA/skillspector.git' >/dev/null 2>&1 && ok skillspector || bad skillspector
uv tool install headroom-ai >/dev/null 2>&1 && ok "headroom (then: headroom wrap claude)" || bad headroom

rm -rf ~/.claude/skills/records-digitizer; mkdir -p ~/.claude/skills
cp -R "$HERE/../skills/records-digitizer" ~/.claude/skills/ && python3 -m pip install --user -q pillow openpyxl \
  && ok records-digitizer || bad records-digitizer

if [ "${EXTRAS:-0}" = 1 ]; then
  npm i -g omniroute@latest >/dev/null 2>&1 && ok "omniroute (gateway; sends prompts to third parties)" || bad omniroute
  npx -y skills add Bomx/distribb-skill -g --agent claude-code -y >/dev/null 2>&1 && ok "distribb (needs DISTRIBB_API_KEY)" || bad distribb
  T="$(mktemp -d)"; git clone -q --depth 1 https://github.com/google-research/timesfm "$T/t" \
    && cp -R "$T/t/timesfm-forecasting" ~/.claude/skills/ && ok timesfm-skill || bad timesfm-skill; rm -rf "$T"
fi
[ ${#FAILED[@]} -gt 0 ] && { echo "Failed: ${FAILED[*]}"; exit 1; }
echo "Done. Restart Claude Code, run /plugin to confirm."
