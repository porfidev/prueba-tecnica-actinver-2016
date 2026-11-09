#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

if [[ ! -x .venv/bin/python ]]; then
  if ! command -v python3 >/dev/null 2>&1; then
    echo "Se requiere Python 3.11 o posterior (python3)." >&2
    exit 1
  fi
  python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else "Se requiere Python 3.11 o posterior.")'
  python3 -m venv .venv
fi

.venv/bin/python -c 'import sys; sys.exit(0 if sys.version_info >= (3, 11) else "El entorno .venv requiere Python 3.11 o posterior.")'

# Instala dependencias en el primer inicio y cuando cambia requirements.txt.
if [[ ! -f .venv/.requirements-installed ]] || ! cmp -s requirements.txt .venv/.requirements-installed; then
  .venv/bin/python -m pip install -r requirements.txt
  cp requirements.txt .venv/.requirements-installed
fi

echo "Iniciando backend en http://localhost:${PORT:-1337} (Ctrl+C para detener)."
exec .venv/bin/python -m uvicorn app.main:app --reload --host "${HOST:-127.0.0.1}" --port "${PORT:-1337}" "$@"
