import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { SimulationEngine } from './services/SimulationEngine';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const simEngine = new SimulationEngine(io);
simEngine.start();

const PORT = process.env.PORT || 3000;

app.get('/api/system/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    components: {
      backend: 'ONLINE',
      database: 'SIMULATED',
      ai_service: 'SIMULATED'
    }
  });
});

app.get('/api/dashboard/summary', (req, res) => {
  res.json({
    vehiclesDetected: simEngine.vehicles.length,
    activeAlerts: simEngine.alerts.filter(a => a.status === 'ACTIVE').length,
    barriersOnline: simEngine.barriers.filter(b => b.commStatus === 'ONLINE').length,
    totalBarriers: simEngine.barriers.length,
    monitoredZones: simEngine.zones.length,
    isSimulation: true
  });
});

app.get('/api/vehicles', (req, res) => {
  res.json(simEngine.vehicles);
});

app.get('/api/zones', (req, res) => {
  res.json(simEngine.zones);
});

app.get('/api/barriers', (req, res) => {
  res.json(simEngine.barriers);
});

app.get('/api/alerts', (req, res) => {
  res.json(simEngine.alerts);
});

// Interactive Endpoints
app.post('/api/alerts/:id/status', (req, res) => {
  const { status } = req.body;
  const success = simEngine.updateAlertStatus(req.params.id, status);
  if (success) res.json({ success: true });
  else res.status(404).json({ error: 'Alert not found' });
});

app.post('/api/barriers/:id/command', (req, res) => {
  const { command } = req.body;
  const success = simEngine.commandBarrier(req.params.id, command);
  if (success) res.json({ success: true });
  else res.status(400).json({ error: 'Barrier offline or not found' });
});

import { GeofenceService } from './services/GeofenceService';

// TELEMATICS WEBHOOK (e.g. from WheelsEye)
app.post('/api/telematics/webhook', (req, res) => {
  const { vehicle_id, vehicle_type, lat, lng, speed } = req.body;
  
  if (!vehicle_id || !lat || !lng) {
    return res.status(400).json({ error: 'Missing GPS data' });
  }

  // 1. Calculate which zone this GPS coordinate falls into
  const zoneId = GeofenceService.getZoneForCoordinate(lat, lng);

  if (zoneId) {
    // 2. The truck is inside a critical zone! Inject it into our live tracking engine.
    simEngine.processTelematicsPing(vehicle_id, vehicle_type || 'HEAVY_TRUCK', zoneId, speed || 0);
    res.json({ status: 'Processed', zone: zoneId });
  } else {
    // 3. The truck is in an unmonitored area (e.g. a parking lot or open highway)
    res.json({ status: 'Ignored', reason: 'Outside critical geofences' });
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send immediate state
  socket.emit('state.update', {
    vehicles: simEngine.vehicles,
    barriers: simEngine.barriers,
    zones: simEngine.zones,
    alerts: simEngine.alerts,
    events: simEngine.events
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
