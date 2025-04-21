import { Box, Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import StorageIcon from '@mui/icons-material/Storage';
import WebIcon from '@mui/icons-material/Web';

const AboutPage = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        About This App
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
          Pokédex Application
        </Typography>
        
        <Typography paragraph>
          This Pokédex application was built to demonstrate the consumption of the PokéAPI
          and the implementation of modern React patterns and libraries.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Technologies Used
        </Typography>
        
        <List>
          <ListItem>
            <ListItemIcon>
              <CodeIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="React" 
              secondary="A JavaScript library for building user interfaces"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <DataObjectIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="React Query" 
              secondary="Data fetching, caching, and state management for React applications"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <WebIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Material UI" 
              secondary="A comprehensive React UI component library"
            />
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <StorageIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="PokéAPI" 
              secondary="The RESTful Pokémon API used for all Pokémon data"
            />
          </ListItem>
        </List>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Features
        </Typography>
        
        <List sx={{ listStyleType: 'disc', pl: 4 }}>
          <ListItem sx={{ display: 'list-item', p: 0.5 }}>
            <Typography>Browse all Pokémon with pagination</Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', p: 0.5 }}>
            <Typography>Search Pokémon by name</Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', p: 0.5 }}>
            <Typography>Filter Pokémon by type</Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', p: 0.5 }}>
            <Typography>View detailed information about each Pokémon</Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', p: 0.5 }}>
            <Typography>Explore Pokémon evolution chains</Typography>
          </ListItem>
        </List>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="body2" color="text.secondary" align="center">
          This application is for educational purposes only.
          Pokémon and Pokémon character names are trademarks of Nintendo.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AboutPage; 