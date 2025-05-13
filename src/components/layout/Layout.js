// src/components/layout/Layout.js
import React from 'react';
import { 
  AppBar, 
  Box, 
  Container, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  Typography,
  Divider
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EvStationIcon from '@mui/icons-material/EvStation';
import BoltIcon from '@mui/icons-material/Bolt';
import PowerIcon from '@mui/icons-material/Power';

// Width of the permanent drawer
const drawerWidth = 240;

const Layout = ({ children }) => {
  const location = useLocation();

  // Function to check if the current route matches the navigation item
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: `calc(100% - ${drawerWidth}px)`, 
          ml: `${drawerWidth}px`
        }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            OCPP Management System
          </Typography>
        </Toolbar>
      </AppBar>
      
      {/* Permanent Drawer */}
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar /> {/* This creates space equal to the app bar height */}
        <Divider />
        <List>
          <ListItem 
            component={Link} 
            to="/"
            sx={{ 
              bgcolor: isActive('/') && !isActive('/companies') && !isActive('/sites') && 
                      !isActive('/chargers') && !isActive('/sessions') && !isActive('/charge-points') 
                      ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <HomeIcon color={isActive('/') && !isActive('/companies') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Dashboard" 
              primaryTypographyProps={{ 
                color: isActive('/') && !isActive('/companies') ? 'primary' : 'inherit',
                fontWeight: isActive('/') && !isActive('/companies') ? 'bold' : 'normal'
              }}
            />
          </ListItem>
          <ListItem 
            component={Link} 
            to="/companies"
            sx={{ 
              bgcolor: isActive('/companies') ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <BusinessIcon color={isActive('/companies') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Companies" 
              primaryTypographyProps={{ 
                color: isActive('/companies') ? 'primary' : 'inherit',
                fontWeight: isActive('/companies') ? 'bold' : 'normal'
              }}
            />
          </ListItem>
          <ListItem 
            component={Link} 
            to="/sites"
            sx={{ 
              bgcolor: isActive('/sites') ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <LocationOnIcon color={isActive('/sites') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Sites" 
              primaryTypographyProps={{ 
                color: isActive('/sites') ? 'primary' : 'inherit',
                fontWeight: isActive('/sites') ? 'bold' : 'normal'
              }}
            />
          </ListItem>
          <ListItem 
            component={Link} 
            to="/chargers"
            sx={{ 
              bgcolor: isActive('/chargers') ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <EvStationIcon color={isActive('/chargers') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Chargers" 
              primaryTypographyProps={{ 
                color: isActive('/chargers') ? 'primary' : 'inherit',
                fontWeight: isActive('/chargers') ? 'bold' : 'normal'
              }}
            />
          </ListItem>
          <ListItem 
            component={Link} 
            to="/sessions"
            sx={{ 
              bgcolor: isActive('/sessions') ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <BoltIcon color={isActive('/sessions') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Sessions" 
              primaryTypographyProps={{ 
                color: isActive('/sessions') ? 'primary' : 'inherit',
                fontWeight: isActive('/sessions') ? 'bold' : 'normal'
              }}
            />
          </ListItem>
          <ListItem 
            component={Link} 
            to="/charge-points"
            sx={{ 
              bgcolor: isActive('/charge-points') ? 'rgba(0, 0, 0, 0.08)' : 'transparent',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
            }}
          >
            <ListItemIcon>
              <PowerIcon color={isActive('/charge-points') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText 
              primary="Charge Points" 
              primaryTypographyProps={{ 
                color: isActive('/charge-points') ? 'primary' : 'inherit',
                fontWeight: isActive('/charge-points') ? 'bold' : 'normal'
              }}
            />
          </ListItem>
        </List>
      </Drawer>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: `${drawerWidth}px`,
          width: `calc(100% - ${drawerWidth}px)`,
          mt: 8 // To account for the AppBar height
        }}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;