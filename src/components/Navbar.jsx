import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <AppBar position="static" color="primary">
      <Container>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={RouterLink} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700, 
              color: 'white', 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box 
              component="img" 
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
              alt="Pokeball"
              sx={{ height: 30, mr: 1 }}
            />
            Pokédex
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
            >
              Home
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/about"
            >
              About
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 