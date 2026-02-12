#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys

def pick_prompt(payload: dict) -> str:
    return str(
        payload.get('prompt')
        or payload.get('userPrompt')
        or payload.get('input')
        or ''
    ).strip()

def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        print(json.dumps({'continue': True}))
        return 0

    prompt = pick_prompt(payload)
    if not prompt:
        print(json.dumps({'continue': True}))
        return 0

    cmd = ['/Users/rs/github.com/agent-memory-kit/.venv/bin/mem', 'recall', prompt, '--db', '/Users/rs/github.com/moodpulse/.memory-kit/memory.db', '--token-budget', '900']
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0:
        print(json.dumps({'continue': True}))
        return 0

    context = proc.stdout.strip()
    if not context:
        print(json.dumps({'continue': True}))
        return 0

    print(
        json.dumps(
            {
                'continue': True,
                'hookSpecificOutput': {
                    'hookEventName': 'UserPromptSubmit',
                    'additionalContext': context,
                },
            }
        )
    )
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
