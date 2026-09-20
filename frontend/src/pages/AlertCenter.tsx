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
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import { CheckCircle, Info, Warning, Error } from '@mui/icons-material';
import { format } from 'date-fns';
import { useSystemState } from '../hooks/useSystemState';
import { updateAlertStatus } from '../services/api';

const getSeverityIcon = (severity: string) => {
  switch(severity) {
    case 'INFO': return <Info color="info" fontSize="small" />;
    case 'WARNING': return <Warning color="warning" fontSize="small" />;
    case 'CRITICAL': return <Error color="error" fontSize="small" />;
  }
};

const getStatusColor = (status: string) => {
  switch(status) {
    case 'ACTIVE': return 'error';
    case 'ACKNOWLEDGED': return 'warning';
    case 'RESOLVED': return 'success';
    default: return 'default';
  }
};

export default function AlertCenter() {
  const { alerts } = useSystemState();
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Alert Center
        </Typography>
        <Chip label="SIMULATED DATA" color="warning" variant="outlined" />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Alert ID</TableCell>
              <TableCell>Type & Description</TableCell>
              <TableCell>Zone & Entity</TableCell>
              <TableCell>Timestamp</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert: any) => (
              <TableRow key={alert.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getSeverityIcon(alert.severity)}
                    {alert.severity}
                  </Box>
                </TableCell>
                <TableCell>{alert.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{alert.type}</Typography>
                  <Typography variant="caption" color="text.secondary">{alert.description}</Typography>
                  <Typography variant="caption" display="block" color="text.secondary">Source: {alert.source}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{alert.zone}</Typography>
                  <Typography variant="caption" color="text.secondary">{alert.relatedEntity}</Typography>
                </TableCell>
                <TableCell>{format(new Date(alert.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                <TableCell>
                  <Chip size="small" label={alert.status} color={getStatusColor(alert.status) as any} />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      disabled={alert.status !== 'ACTIVE'}
                      onClick={() => updateAlertStatus(alert.id, 'ACKNOWLEDGED')}
                    >
                      ACK
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="success"
                      disabled={alert.status === 'RESOLVED'}
                      onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                    >
                      RESOLVE
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
