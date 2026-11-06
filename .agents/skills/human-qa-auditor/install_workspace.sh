#!/usr/bin/env bash
set -euo pipefail

SKILL_NAME="human-qa-auditor"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${PWD}/.agents/skills/${SKILL_NAME}"

if [[ ! -f "${SOURCE_DIR}/SKILL.md" ]]; then
  echo "ERROR: SKILL.md not found beside this installer."
  exit 1
fi

mkdir -p "${TARGET_DIR}"
cp "${SOURCE_DIR}/SKILL.md" "${TARGET_DIR}/SKILL.md"
echo "Installed workspace skill:"
echo "${TARGET_DIR}/SKILL.md"
echo
echo "Next:"
echo "1. Reload Antigravity / refresh Customizations > Skills."
echo "2. Open RUN_THIS_IN_ANTIGRAVITY.md and paste its instructions into Antigravity."
echo "3. Run only against a staging/test tenant with synthetic data."
