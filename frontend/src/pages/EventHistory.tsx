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
  Chip
} from '@mui/material';
import { format } from 'date-fns';
import { useSystemState } from '../hooks/useSystemState';

export default function EventHistory() {
  const { events } = useSystemState();
  
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Event History
        </Typography>
        <Chip label="SIMULATED DATA" color="warning" variant="outlined" />
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Zone/Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No events recorded yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              events.map((evt: any) => (
                <TableRow key={evt.id} hover>
                  <TableCell>{format(new Date(evt.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                  <TableCell>{evt.id}</TableCell>
                  <TableCell>
                    <Chip size="small" label={evt.type} variant="outlined" />
                  </TableCell>
                  <TableCell>{evt.description}</TableCell>
                  <TableCell>{evt.zone}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
