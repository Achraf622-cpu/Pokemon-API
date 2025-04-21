import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';

const NotFoundPage = () => {
  return (
    <Box 
      sx={{ 
        py: 6, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        textAlign: 'center' 
      }}
    >
      <Paper elevation={2} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}>
          404
        </Typography>
        
        <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
          Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Oops! Looks like this page doesn't exist or might have been moved.
        </Typography>
        
        <img 
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png" 
          alt="Psyduck confused" 
          style={{ width: '50%', maxWidth: 200, margin: '20px auto' }}
        />
        
        <Button 
          variant="contained" 
          component={Link} 
          to="/"
          startIcon={<HomeIcon />}
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFoundPage; 