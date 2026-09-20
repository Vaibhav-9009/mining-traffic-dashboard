import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
});

export const socket = io(WS_URL);

export const updateAlertStatus = async (id: string, status: 'ACKNOWLEDGED' | 'RESOLVED') => {
  return api.post(`/alerts/${id}/status`, { status });
};

export const sendBarrierCommand = async (id: string, command: 'OPEN' | 'CLOSE') => {
  return api.post(`/barriers/${id}/command`, { command });
};
