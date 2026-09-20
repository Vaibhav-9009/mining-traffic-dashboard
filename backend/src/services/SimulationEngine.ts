import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';

export class SimulationEngine {
  private io: Server;
  private intervalId: NodeJS.Timeout | null = null;
  
  public vehicles: any[] = [];
  public barriers: any[] = [];
  public zones: any[] = [];
  public alerts: any[] = [];
  public events: any[] = []; // New Event Log
  
  private realDataFrames: any[][] = [];
  private currentFrameIndex: number = 0;

  constructor(io: Server) {
    this.io = io;
    this.initMockData();
    this.loadRealData();
  }
  
  private loadRealData() {
    try {
      const dataPath = path.join(__dirname, '../data/fleet_telemetry.json');
      const rawData = fs.readFileSync(dataPath, 'utf-8');
      this.realDataFrames = JSON.parse(rawData);
      console.log(`Loaded ${this.realDataFrames.length} real data frames.`);
    } catch (e) {
      console.error('Failed to load real data', e);
      this.realDataFrames = [[]];
    }
  }

  private logEvent(type: string, description: string, zone: string = 'System') {
    this.events.unshift({
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      zone
    });
    // Keep only last 50 events
    if (this.events.length > 50) this.events.pop();
  }

  private initMockData() {
    this.zones = [
      { id: 'Z-01', name: 'Zone A', state: 'NORMAL', vehicleCount: 0, barrierId: 'BR-01' },
      { id: 'Z-02', name: 'Intersection', state: 'MONITORING', vehicleCount: 0, barrierId: null },
      { id: 'Z-03', name: 'Haul Road Crossing', state: 'NORMAL', vehicleCount: 0, barrierId: 'BR-02' }
    ];
    
    this.barriers = [
      { id: 'BR-01', zone: 'Zone A', state: 'CLOSED', commStatus: 'ONLINE', lastStateChange: new Date().toISOString(), lastUpdate: new Date().toISOString() },
      { id: 'BR-02', zone: 'Haul Road Crossing', state: 'OPEN', commStatus: 'ONLINE', lastStateChange: new Date().toISOString(), lastUpdate: new Date().toISOString() }
    ];

    this.logEvent('System', 'Simulation Engine Initialized');
  }
  
  public start() {
    if (this.intervalId) return;
    console.log('Simulation Engine started.');
    this.logEvent('System', 'Simulation Engine Started');
    
    // Run simulation tick every 2 seconds
    this.intervalId = setInterval(() => {
      this.tick();
    }, 2000);
  }
  
  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Simulation Engine stopped.');
      this.logEvent('System', 'Simulation Engine Stopped');
    }
  }
  
  private tick() {
    // 1. Ingest Real Data Frame
    if (this.realDataFrames.length > 0) {
      this.vehicles = this.realDataFrames[this.currentFrameIndex].map((v: any) => ({
        ...v,
        timestamp: new Date().toISOString()
      }));
      
      this.currentFrameIndex++;
      if (this.currentFrameIndex >= this.realDataFrames.length) {
        this.currentFrameIndex = 0; // Loop back for continuous playback
      }
    }
    
    // 2. Evaluate zones
    this.updateZones();
    
    // 3. Rules & Alerts
    this.checkRules();
    
    // 4. Emit State
    this.io.emit('state.update', {
      vehicles: this.vehicles,
      barriers: this.barriers,
      zones: this.zones,
      alerts: this.alerts,
      events: this.events
    });
  }
  
  private updateZones() {
    this.zones.forEach(z => {
      const zoneVehicles = this.vehicles.filter(v => v.zone === z.id);
      z.vehicleCount = zoneVehicles.length;
      z.vehicleCategories = Array.from(new Set(zoneVehicles.map(v => v.vehicleType)));
      z.activeAlerts = this.alerts.filter(a => a.zone === z.id && a.status === 'ACTIVE').length;
      z.trafficDirection = 'MULTIDIRECTIONAL';
      
      const prevState = z.state;
      if (z.vehicleCount > 3) {
        z.state = 'CONFLICT';
      } else if (z.vehicleCount > 1) {
        z.state = 'WARNING';
      } else {
        z.state = 'NORMAL';
      }

      if (prevState !== z.state && (z.state === 'CONFLICT' || z.state === 'WARNING')) {
        this.logEvent('Zone Status', `${z.name} entered ${z.state} state`, z.id);
      }
    });
  }
  
  private checkRules() {
    // Simple overspeed rule
    this.vehicles.forEach(v => {
      if (v.speed > 40) {
        const existingAlert = this.alerts.find(a => a.relatedEntity === v.trackingId && a.type === 'Overspeed' && a.status === 'ACTIVE');
        if (!existingAlert) {
          const newAlert = {
            id: `ALT-${Date.now()}`,
            type: 'Overspeed',
            severity: 'WARNING',
            zone: v.zone,
            relatedEntity: v.trackingId,
            timestamp: new Date().toISOString(),
            status: 'ACTIVE',
            source: 'RulesEngine',
            description: `Vehicle exceeded 40km/h limit (${v.speed}km/h).`
          };
          this.alerts.unshift(newAlert);
          this.logEvent('Alert Triggered', `Overspeed alert for ${v.trackingId}`, v.zone);
        }
      }
    });
    
    // Auto-resolve older alerts
    this.alerts.forEach(a => {
      if (a.status === 'ACTIVE' && Date.now() - new Date(a.timestamp).getTime() > 10000) {
        a.status = 'RESOLVED';
        this.logEvent('Alert Auto-Resolved', `Alert ${a.id} auto-resolved`, a.zone);
      }
    });
    
    // Limit alerts array size
    if (this.alerts.length > 20) {
      this.alerts = this.alerts.slice(0, 20);
    }
  }

  // --- INTERACTIVE FEATURES LOGIC ---

  public updateAlertStatus(alertId: string, status: 'ACKNOWLEDGED' | 'RESOLVED') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = status;
      this.logEvent('Alert Updated', `Alert ${alertId} manually marked as ${status}`, alert.zone);
      // Force an immediate UI update
      this.io.emit('state.update', { vehicles: this.vehicles, barriers: this.barriers, zones: this.zones, alerts: this.alerts, events: this.events });
      return true;
    }
    return false;
  }

  public commandBarrier(barrierId: string, command: 'OPEN' | 'CLOSE') {
    const barrier = this.barriers.find(b => b.id === barrierId);
    if (barrier && barrier.commStatus === 'ONLINE') {
      barrier.state = command === 'OPEN' ? 'OPENING' : 'CLOSING';
      barrier.lastStateChange = new Date().toISOString();
      
      this.logEvent('Barrier Command', `Barrier ${barrierId} commanded to ${command}`, barrier.zone);
      this.io.emit('state.update', { vehicles: this.vehicles, barriers: this.barriers, zones: this.zones, alerts: this.alerts, events: this.events });

      // Simulate the time it takes for a physical barrier to move
      setTimeout(() => {
        barrier.state = command;
        this.logEvent('Barrier Status', `Barrier ${barrierId} successfully ${command === 'OPEN' ? 'OPENED' : 'CLOSED'}`, barrier.zone);
        this.io.emit('state.update', { vehicles: this.vehicles, barriers: this.barriers, zones: this.zones, alerts: this.alerts, events: this.events });
      }, 3000);

      return true;
    }
    return false;
  }

  // --- TELEMATICS (WHEELSEYE) INTEGRATION ---
  
  public processTelematicsPing(vehicleId: string, vehicleType: string, zoneId: string, speed: number) {
    // 1. Find if we already track this vehicle
    const existingIndex = this.vehicles.findIndex(v => v.trackingId === vehicleId);
    
    const vehicleObj = {
      trackingId: vehicleId,
      vehicleType: vehicleType,
      zone: zoneId,
      direction: 'MULTIDIRECTIONAL',
      speed: speed,
      confidence: 1.0, // GPS is assumed 100% identity confidence
      source: 'Telematics-API',
      timestamp: new Date().toISOString(),
      status: 'TRACKED'
    };

    if (existingIndex >= 0) {
      this.vehicles[existingIndex] = vehicleObj; // Update existing
    } else {
      this.vehicles.push(vehicleObj); // Add new vehicle from GPS
    }

    this.logEvent('GPS Ping', `Received telematics for ${vehicleId} in ${zoneId} at ${speed}km/h`, zoneId);
    
    // Force immediate recalculation of rules and zones since a live ping arrived
    this.updateZones();
    this.checkRules();
    this.io.emit('state.update', { vehicles: this.vehicles, barriers: this.barriers, zones: this.zones, alerts: this.alerts, events: this.events });
  }
}
