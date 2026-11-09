#!/usr/bin/env bash
# Installs the tool stack into YOUR machine's Claude Code (user scope).
# Idempotent. Run it on your own computer, not in the cloud session.
#   bash install-claude-stack.sh            # core + plugins + CLIs
#   WITH_GATEWAY=1 bash install-claude-stack.sh   # also OmniRoute + FreeLLMAPI (see notes)
# Needs: claude, node 22+, npm, python3, uv (https://docs.astral.sh/uv/).
# No keys or tokens are written by this script. Set keys yourself, in your shell profile.
set -u
ok(){ printf '\033[32m✓\033[0m %s\n' "$*"; }; bad(){ printf '\033[31m✗\033[0m %s\n' "$*"; FAILED+=("$*"); }
FAILED=()
for t in claude node npm python3 uv; do command -v $t >/dev/null || { echo "missing: $t"; exit 1; }; done
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1) Plugins (marketplace/name pairs verified against each repo's marketplace.json)
while read -r repo plugin; do
  claude plugin marketplace add "$repo" >/dev/null 2>&1; 
  claude plugin install "$plugin" >/dev/null 2>&1 && ok "plugin $plugin" || bad "plugin $plugin"
done <<'L'
DietrichGebert/ponytail          ponytail@ponytail
thedotmack/claude-mem            claude-mem@thedotmack
google/elephant-goldfish-model   egm@egm
lemomo-ai/lemo-opuscar           lemo-opuscar@lemolab
pbakaus/impeccable               impeccable@impeccable
nutlope/hallmark                 hallmark@hallmark
Leonxlnx/taste-skill             taste-skill@taste-skill
L

# 2) Scanner first, so you can vet anything else before installing it
uv tool install --force 'git+https://github.com/NVIDIA/skillspector.git' >/dev/null 2>&1 && ok "skillspector" || bad "skillspector"

# 3) Skills that are not plugins
npx -y skills add Bomx/distribb-skill -g --agent claude-code -y >/dev/null 2>&1 && ok "distribb-skill (needs DISTRIBB_API_KEY)" || bad "distribb-skill"
TMP="$(mktemp -d)"; git clone -q --depth 1 https://github.com/google-research/timesfm "$TMP/t" \
  && mkdir -p ~/.claude/skills && rm -rf ~/.claude/skills/timesfm-forecasting \
  && cp -R "$TMP/t/timesfm-forecasting" ~/.claude/skills/ && ok "timesfm-forecasting skill (model weights download on first use)" || bad "timesfm skill"
rm -rf "$TMP"

# 4) Your own skill: image folder/zip -> one spreadsheet
mkdir -p ~/.claude/skills && rm -rf ~/.claude/skills/records-digitizer && cp -R "$HERE/../skills/records-digitizer" ~/.claude/skills/ \
  && python3 -m pip install --user -q pillow openpyxl && ok "records-digitizer skill" || bad "records-digitizer skill"

# 5) CLIs
uv tool install headroom-ai >/dev/null 2>&1 && ok "headroom (run: headroom wrap claude)" || bad "headroom"
npm i -g @opencode/cli@latest >/dev/null 2>&1 && ok "opencode (@opencode/cli, NOT opencode-ai)" || bad "opencode"

if [ "${WITH_GATEWAY:-0}" = 1 ]; then
  npm i -g omniroute@latest >/dev/null 2>&1 && ok "omniroute" || bad "omniroute"
  npm i -g freellmapi@latest >/dev/null 2>&1 && ok "freellmapi" || bad "freellmapi"
fi

echo; echo "Not auto-installed on purpose: Agent-Reach (can reuse your browser logins; install it deliberately,"
echo "from GitHub only, the PyPI package of that name is a different project)."
[ ${#FAILED[@]} -gt 0 ] && { echo "Failed: ${FAILED[*]}"; exit 1; }
echo "Done. Restart Claude Code, then run /plugin to confirm."
