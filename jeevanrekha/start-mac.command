#!/bin/bash
# ============================================================
# Jeevanrekha - local launcher for macOS / Linux
# Double-click this file (macOS) to start the app on http://localhost:8080
# ============================================================
cd "$(dirname "$0")"

echo
echo "============================================================"
echo "  Jeevanrekha - First Responder App"
echo "============================================================"
echo

if command -v python3 >/dev/null 2>&1; then
  echo "Found Python 3. Starting server at http://localhost:8080"
  echo "Press Ctrl+C to stop."
  echo
  open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null || true
  python3 -m http.server 8080
elif command -v python >/dev/null 2>&1; then
  echo "Found Python. Starting server at http://localhost:8080"
  open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null || true
  python -m http.server 8080
elif command -v npx >/dev/null 2>&1; then
  echo "Found Node.js. Starting server at http://localhost:8080"
  open "http://localhost:8080" 2>/dev/null || xdg-open "http://localhost:8080" 2>/dev/null || true
  npx --yes http-server -p 8080 -c-1 .
else
  echo "ERROR: Neither Python nor Node.js is installed."
  echo
  echo "Install one and try again:"
  echo "  - Python: https://www.python.org/downloads/  (recommended)"
  echo "  - Node.js: https://nodejs.org/"
  echo
  read -p "Press Enter to close..."
  exit 1
fi
