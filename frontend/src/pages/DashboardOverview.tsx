import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material';
import { 
  DirectionsCar, 
  WarningAmber, 
  Security, 
  Map, 
  MonitorHeart,
  Sensors
} from '@mui/icons-material';
import { useSystemState } from '../hooks/useSystemState';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface KPIProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  isSimulated?: boolean;
}

const KPICard = ({ title, value, icon, color, isSimulated = true }: KPIProps) => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h3" component="div">
            {value}
          </Typography>
        </Box>
        <Box sx={{ color }}>
          {icon}
        </Box>
      </Box>
      {isSimulated && (
        <Chip 
          label="SIMULATED" 
          size="small" 
          color="warning" 
          variant="outlined" 
          sx={{ mt: 2, fontSize: '0.65rem' }} 
        />
      )}
    </CardContent>
  </Card>
);

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

export default function DashboardOverview() {
  const { vehicles, alerts, barriers, zones, isConnected } = useSystemState();
  const [trafficHistory, setTrafficHistory] = useState<any[]>([]);

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE').length;
  const onlineBarriers = barriers.filter(b => b.commStatus === 'ONLINE').length;

  useEffect(() => {
    setTrafficHistory(prev => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second:'2-digit' });
      const newData = [...prev, { time: now, count: vehicles.length }];
      if (newData.length > 20) return newData.slice(newData.length - 20);
      return newData;
    });
  }, [vehicles]);

  // Group vehicle types for pie chart
  const vehicleTypeCounts = vehicles.reduce((acc: any, v: any) => {
    acc[v.vehicleType] = (acc[v.vehicleType] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(vehicleTypeCounts).map(key => ({
    name: key.replace('_', ' '),
    value: vehicleTypeCounts[key]
  }));

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          System Overview
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {isConnected && (
            <Chip 
              icon={<Sensors className="pulse-icon" />} 
              label="LIVE" 
              color="success" 
              sx={{ '& .MuiChip-icon': { color: '#fff' } }}
            />
          )}
          <Chip label="SIMULATION MODE" color="warning" />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Vehicles Detected" 
            value={vehicles.length} 
            icon={<DirectionsCar fontSize="large" />} 
            color="#3b82f6" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Active Alerts" 
            value={activeAlerts} 
            icon={<WarningAmber fontSize="large" />} 
            color="#f59e0b" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Barriers (Online)" 
            value={`${onlineBarriers} / ${barriers.length}`} 
            icon={<Security fontSize="large" />} 
            color="#10b981" 
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard 
            title="Monitored Zones" 
            value={zones.length} 
            icon={<Map fontSize="large" />} 
            color="#8b5cf6" 
          />
        </Grid>

        {/* Charts Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Live Traffic Flow (Last 60 Seconds)
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis stroke="#6b7280" tick={{fill: '#9ca3af', fontSize: 12}} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '400px' }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Active Vehicle Types
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="text.secondary">No active vehicles</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
