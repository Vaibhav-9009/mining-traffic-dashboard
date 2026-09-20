import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { format } from 'date-fns';
import { useSystemState } from '../hooks/useSystemState';

export default function VehicleMonitoring() {
  const { vehicles } = useSystemState();

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'HEAVY_TRUCK': return 'error';
      case 'LIGHT_VEHICLE': return 'primary';
      case 'EMERGENCY_VEHICLE': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'TRACKED': return 'success';
      case 'LOST': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Vehicle Monitoring
        </Typography>
        <Chip label="SIMULATED DATA" color="warning" variant="outlined" />
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="vehicle table">
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
            <TableRow>
              <TableCell>Tracking ID</TableCell>
              <TableCell>Vehicle ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Zone</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell>Speed</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vehicles.map((row) => (
              <TableRow
                key={row.trackingId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                  {row.trackingId}
                </TableCell>
                <TableCell>{row.vehicleId || <Typography color="text.secondary" variant="body2">UNKNOWN</Typography>}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.vehicleType.replace('_', ' ')} color={getTypeColor(row.vehicleType) as any} variant="outlined" />
                </TableCell>
                <TableCell>{row.zone}</TableCell>
                <TableCell>{row.direction}</TableCell>
                <TableCell>
                  {row.speed !== null ? `${row.speed} km/h` : <Typography color="text.secondary" variant="body2">UNAVAILABLE</Typography>}
                </TableCell>
                <TableCell>{(row.confidence * 100).toFixed(0)}%</TableCell>
                <TableCell>{row.source}</TableCell>
                <TableCell>{format(new Date(row.timestamp), 'HH:mm:ss')}</TableCell>
                <TableCell>
                  <Chip size="small" label={row.status} color={getStatusColor(row.status) as any} />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                  <Typography color="text.secondary">No vehicles currently tracked</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
