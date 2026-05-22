from flask import Flask, render_template, jsonify
import psutil
from collections import deque
from datetime import datetime
import threading
import time

app = Flask(__name__)

# Storico fino a 6 minuti (360 secondi, campione ogni 2s = 180 punti)
MAX_POINTS = 180
history = {
    "timestamps": deque(maxlen=MAX_POINTS),
    "cpu": deque(maxlen=MAX_POINTS),
    "ram": deque(maxlen=MAX_POINTS),
}
history_lock = threading.Lock()


def collect_metrics():
    while True:
        cpu = psutil.cpu_percent(interval=None)
        ram = psutil.virtual_memory().percent
        ts = datetime.now().strftime("%H:%M:%S")
        with history_lock:
            history["timestamps"].append(ts)
            history["cpu"].append(cpu)
            history["ram"].append(ram)
        time.sleep(2)


# Avvia il thread di raccolta in background
collector = threading.Thread(target=collect_metrics, daemon=True)
collector.start()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/metrics")
def metrics():
    with history_lock:
        current_cpu = history["cpu"][-1] if history["cpu"] else 0.0
        current_ram = history["ram"][-1] if history["ram"] else 0.0
        data = {
            "current": {"cpu": current_cpu, "ram": current_ram},
            "history": {
                "timestamps": list(history["timestamps"]),
                "cpu": list(history["cpu"]),
                "ram": list(history["ram"]),
            },
        }
    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
