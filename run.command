#!/bin/zsh
cd "$(dirname "$0")"
PORT=8080
echo "Starting ParkPoint Enterprise Parking prototype..."
echo "Open: http://localhost:${PORT}"
(open "http://localhost:${PORT}" >/dev/null 2>&1 &) 
python3 -m http.server ${PORT}
