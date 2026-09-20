import { useState, useEffect } from 'react';
import { socket } from '../services/api';

export function useSystemState() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [barriers, setBarriers] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onStateUpdate(data: any) {
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.barriers) setBarriers(data.barriers);
      if (data.zones) setZones(data.zones);
      if (data.alerts) setAlerts(data.alerts);
      if (data.events) setEvents(data.events);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('state.update', onStateUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state.update', onStateUpdate);
    };
  }, []);

  return {
    vehicles,
    barriers,
    zones,
    alerts,
    events,
    isConnected
  };
}
