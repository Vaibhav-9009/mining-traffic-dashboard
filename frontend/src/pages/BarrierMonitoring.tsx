import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Button,
  Divider
} from '@mui/material';
import { 
  Security, 
  Warning, 
  CheckCircle,
  Error,
  Sync
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useSystemState } from '../hooks/useSystemState';
import { sendBarrierCommand } from '../services/api';

const getStateColor = (state: string) => {
  switch(state) {
    case 'OPEN': return 'success';
    case 'CLOSED': return 'primary';
    case 'OPENING':
    case 'CLOSING': return 'warning';
    case 'FAULT': return 'error';
    case 'OFFLINE': 
    case 'UNKNOWN': return 'default';
    default: return 'default';
  }
};

const getCommColor = (status: string) => {
  switch(status) {
    case 'ONLINE': return 'success';
    case 'DEGRADED': return 'warning';
    case 'OFFLINE': return 'error';
    default: return 'default';
  }
};

export default function BarrierMonitoring() {
  const { barriers } = useSystemState();
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Barrier Monitoring
        </Typography>
        <Chip label="SIMULATED DATA" color="warning" variant="outlined" />
      </Box>

      <Grid container spacing={3}>
        {barriers.map((barrier: any) => (
          <Grid item xs={12} md={6} lg={4} key={barrier.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Security color="primary" />
                    <Typography variant="h6">{barrier.id}</Typography>
                  </Box>
                  <Chip 
                    label={barrier.state} 
                    color={getStateColor(barrier.state) as any}
                    icon={barrier.state === 'FAULT' ? <Warning /> : undefined}
                  />
                </Box>
                
                <Typography color="text.secondary" gutterBottom>
                  Zone: {barrier.zone}
                </Typography>
                
                <Divider sx={{ my: 1.5 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Comm Status:</Typography>
                  <Chip size="small" label={barrier.commStatus} color={getCommColor(barrier.commStatus) as any} />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Last Change:</Typography>
                  <Typography variant="body2">{format(new Date(barrier.lastStateChange), 'HH:mm:ss')}</Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">Last Heartbeat:</Typography>
                  <Typography variant="body2">{format(new Date(barrier.lastUpdate), 'HH:mm:ss')}</Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    size="small"
                    disabled={barrier.commStatus === 'OFFLINE'}
                    onClick={() => sendBarrierCommand(barrier.id, 'OPEN')}
                  >
                    COMMAND OPEN
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    fullWidth 
                    size="small"
                    disabled={barrier.commStatus === 'OFFLINE'}
                    onClick={() => sendBarrierCommand(barrier.id, 'CLOSE')}
                  >
                    COMMAND CLOSE
                  </Button>
                </Box>
                {barrier.commStatus === 'OFFLINE' && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
                    Hardware control unavailable
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
