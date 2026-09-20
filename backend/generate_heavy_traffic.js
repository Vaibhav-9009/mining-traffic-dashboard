const fs = require('fs');

const frames = [];
const zones = ['Z-01', 'Z-02', 'Z-03'];
const types = ['HEAVY_TRUCK', 'LIGHT_VEHICLE', 'SERVICE_VEHICLE'];

// We will generate 10 frames of data, each representing a 2-second tick in our simulation
for (let frameIdx = 0; frameIdx < 10; frameIdx++) {
  const frameVehicles = [];
  
  // Generate a fluctuating number of vehicles (between 15 and 35) to make the chart move up and down
  const vehicleCount = 15 + Math.floor(Math.random() * 20);
  
  for (let v = 1; v <= vehicleCount; v++) {
    const type = types[v % 3];
    const zone = zones[v % 3]; // Evenly distribute across 3 zones (guarantees >3 per zone -> CONFLICT state)
    
    // Make speeds fluctuate realistically across frames. Every 4th vehicle speeds!
    const isSpeeder = (v % 4 === 0);
    const baseSpeed = isSpeeder ? 38 : 15;
    const speed = baseSpeed + Math.floor(Math.random() * 10);
    
    frameVehicles.push({
      trackingId: `TRK-90${v.toString().padStart(2, '0')}`,
      vehicleType: type,
      zone: zone,
      direction: v % 2 === 0 ? 'NORTHBOUND' : 'SOUTHBOUND',
      speed: speed,
      confidence: (0.88 + (Math.random() * 0.11)).toFixed(2),
      source: v % 2 === 0 ? 'Camera-01' : 'Lidar-01',
      status: 'TRACKED'
    });
  }
  frames.push(frameVehicles);
}

fs.writeFileSync('./src/data/fleet_telemetry.json', JSON.stringify(frames, null, 2));
console.log('Successfully generated heavy traffic dataset!');
