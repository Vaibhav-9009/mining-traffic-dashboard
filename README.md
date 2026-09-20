# AI-Enabled Smart Barrier System Dashboard

A professional, production-style monitoring dashboard for mining traffic management, featuring real-time tracking of vehicles, active barrier monitoring, and AI detection alerts.

## Project Structure
- `frontend/`: React + Vite + Material UI (Dark Theme) + WebSockets
- `backend/`: Node.js + Express + Socket.io + Built-in Simulation Engine

## Features
- **Real-Time Simulation**: A backend Simulation Engine generates dynamic traffic flows and scenarios for testing.
- **WebSocket Integration**: Instant dashboard updates via socket.io.
- **Safety First**: Clearly defines states as SIMULATED, ONLINE, DEGRADED, or OFFLINE.
- **Dashboard Views**: Overview, Vehicles, Zones, Barriers, and Alerts.

## Getting Started

1. **Start Backend**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Development Phases
Refer to the original implementation plan for detailed breakdown. Currently, Phases 1-6, 7, 9, 12 are completed in the prototype.
