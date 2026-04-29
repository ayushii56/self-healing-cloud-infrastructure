const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let isHealthy = true;
let requestCount = 0;

app.use(express.json());

// Main endpoint
app.get('/', (req, res) => {
  requestCount++;
  res.json({
    message: 'Self-Healing Cloud Infrastructure App',
    requestCount,
    timestamp: new Date().toISOString(),
    pod: process.env.HOSTNAME
  });
});

// Liveness probe — if this fails, Kubernetes RESTARTS the pod
app.get('/health/live', (req, res) => {
  if (!isHealthy) {
    return res.status(500).json({ status: 'UNHEALTHY', reason: 'App marked unhealthy' });
  }
  res.json({ status: 'ALIVE', uptime: process.uptime() });
});

// Readiness probe — if this fails, Kubernetes STOPS sending traffic
app.get('/health/ready', (req, res) => {
  res.json({ status: 'READY', timestamp: new Date().toISOString() });
});

// Simulate failure — to test self-healing
app.post('/break', (req, res) => {
  isHealthy = false;
  res.json({ message: 'App marked unhealthy! Kubernetes will restart this pod shortly.' });
});

// Metrics endpoint
app.get('/metrics/basic', (req, res) => {
  res.json({
    requestCount,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pod: process.env.HOSTNAME
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Pod: ${process.env.HOSTNAME}`);
});