#!/bin/bash

# Daily Message — Script de control
# Uso: ./start.sh [start|stop|logs|status]

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$APP_DIR/daily-message.pid"
LOG_FILE="$APP_DIR/daily-message.log"

start() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Ya esta corriendo (PID: $(cat "$PID_FILE"))"
        echo "   Usa './start.sh stop' para detenerlo primero"
        exit 1
    fi

    echo "Iniciando daily-message..."
    cd "$APP_DIR"
    nohup node src/index.js >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Iniciado (PID: $(cat "$PID_FILE"))"
    echo "   Logs: ./start.sh logs"
    echo "   Detener: ./start.sh stop"
}

stop() {
    if [ ! -f "$PID_FILE" ]; then
        echo "No hay proceso corriendo (no se encontro PID file)"
        exit 1
    fi

    PID=$(cat "$PID_FILE")
    if kill -0 "$PID" 2>/dev/null; then
        kill "$PID"
        rm "$PID_FILE"
        echo "Detenido (PID: $PID)"
    else
        rm "$PID_FILE"
        echo "El proceso ya no estaba corriendo. PID file limpiado."
    fi
}

logs() {
    if [ ! -f "$LOG_FILE" ]; then
        echo "No hay logs aún."
        exit 0
    fi
    tail -f "$LOG_FILE"
}

status() {
    if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
        echo "Corriendo (PID: $(cat "$PID_FILE"))"
    else
        echo "No esta corriendo"
    fi
}

case "${1:-start}" in
    start)  start ;;
    stop)   stop ;;
    logs)   logs ;;
    status) status ;;
    *)
        echo "Uso: $0 {start|stop|logs|status}"
        exit 1
        ;;
esac
