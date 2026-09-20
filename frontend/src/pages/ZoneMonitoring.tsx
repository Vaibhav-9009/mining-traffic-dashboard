import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  Map, 
  DirectionsCar,
  WarningAmber,
  Security
} from '@mui/icons-material';
import { useSystemState } from '../hooks/useSystemState';

const getStateColor = (state: string) => {
  switch(state) {
    case 'NORMAL': return 'success';
    case 'MONITORING': return 'info';
    case 'WARNING': return 'warning';
    case 'CONFLICT': return 'error';
    case 'OFFLINE': 
    case 'UNKNOWN': return 'default';
    default: return 'default';
  }
};

export default function ZoneMonitoring() {
  const { zones } = useSystemState();
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Zone Monitoring
        </Typography>
        <Chip label="SIMULATED DATA" color="warning" variant="outlined" />
      </Box>

      <Grid container spacing={3}>
        {zones.map((zone: any) => (
          <Grid item xs={12} md={6} key={zone.id}>
            <Card sx={{ borderLeft: `4px solid`, borderColor: `${getStateColor(zone.state)}.main` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Map color="primary" />
                    <Typography variant="h6">{zone.name}</Typography>
                  </Box>
                  <Chip 
                    label={zone.state} 
                    color={getStateColor(zone.state) as any}
                  />
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <List dense>
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 36 }}><DirectionsCar fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Vehicles" secondary={zone.vehicleCount} />
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 36 }}><WarningAmber fontSize="small" color={zone.activeAlerts > 0 ? "error" : "inherit"} /></ListItemIcon>
                        <ListItemText primary="Alerts" secondary={zone.activeAlerts} />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={6}>
                    <List dense>
                      <ListItem disablePadding>
                        <ListItemIcon sx={{ minWidth: 36 }}><Security fontSize="small" /></ListItemIcon>
                        <ListItemText primary="Barrier" secondary={zone.barrierId || 'None'} />
                      </ListItem>
                      <ListItem disablePadding>
                        <ListItemText primary="Direction" secondary={zone.trafficDirection} />
                      </ListItem>
                    </List>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {zone.vehicleCategories.length > 0 ? zone.vehicleCategories.map(cat => (
                    <Chip key={cat} size="small" label={cat.replace('_', ' ')} variant="outlined" />
                  )) : <Typography variant="body2" color="text.secondary">No active categories</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
