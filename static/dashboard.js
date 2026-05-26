// ── Chart setup ──────────────────────────────────────────────
const ctx = document.getElementById('historyChart').getContext('2d');

const makeGradient = (color) => {
    const g = ctx.createLinearGradient(0, 0, 0, 240);
    g.addColorStop(0, color + '33');
    g.addColorStop(1, color + '00');
    return g;
};

const chart = new Chart(ctx, {
    type: 'line',
    data: {
    labels: [],
    datasets: [
        {
        label: 'CPU %',
        data: [],
        borderColor: '#00e5ff',
        backgroundColor: makeGradient('#00e5ff'),
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        },
        {
        label: 'RAM %',
        data: [],
        borderColor: '#ff4081',
        backgroundColor: makeGradient('#ff4081'),
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
        },
    ],
    },
    options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    animation: { duration: 400 },
    scales: {
        x: {
        ticks: {
            color: '#4a5568',
            font: { family: "'Share Tech Mono', monospace", size: 10 },
            maxTicksLimit: 8,
            maxRotation: 0,
        },
        grid: { color: '#1e2530' },
        },
        y: {
        min: 0,
        max: 100,
        ticks: {
            color: '#4a5568',
            font: { family: "'Share Tech Mono', monospace", size: 10 },
            callback: v => v + '%',
            stepSize: 25,
        },
        grid: { color: '#1e2530' },
        },
    },
    plugins: {
        legend: { display: false },
        tooltip: {
        backgroundColor: '#111418',
        borderColor: '#1e2530',
        borderWidth: 1,
        titleColor: '#8899aa',
        bodyColor: '#c8d6e5',
        titleFont: { family: "'Share Tech Mono', monospace", size: 10 },
        bodyFont:  { family: "'Share Tech Mono', monospace", size: 11 },
        callbacks: {
            label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`,
        },
        },
    },
    },
});

// ── Polling ──────────────────────────────────────────────────
async function fetchMetrics() {
    try {
    const res  = await fetch('/api/metrics');
    const data = await res.json();

    // Gauge cards
    const cpu = data.current.cpu.toFixed(1);
    const ram = data.current.ram.toFixed(1);

    document.getElementById('cpu-val').innerHTML =
        cpu + '<span class="gauge-unit">%</span>';
    document.getElementById('ram-val').innerHTML =
        ram + '<span class="gauge-unit">%</span>';

    document.getElementById('cpu-bar').style.width = cpu + '%';
    document.getElementById('ram-bar').style.width = ram + '%';

    // Chart
    chart.data.labels                = data.history.timestamps;
    chart.data.datasets[0].data      = data.history.cpu;
    chart.data.datasets[1].data      = data.history.ram;
    chart.update('none');   // skip animation on data-only update

    } catch (e) {
    console.error('Errore fetch metriche:', e);
    }
}

fetchMetrics();
setInterval(fetchMetrics, 2000);