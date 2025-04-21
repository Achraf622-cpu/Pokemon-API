import { useState, useEffect } from 'react';
import { Card, CardContent, CardMedia, Typography, CardActionArea, Chip, Box, Skeleton, Grow, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { getPokemonDetails } from '../api/pokemonApi';

// Type background colors
const typeColors = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const PokemonCard = ({ pokemon }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // Extract ID from URL or use the provided ID
        const id = pokemon.url 
          ? pokemon.url.split('/').filter(Boolean).pop() 
          : pokemon.id || pokemon.name;
        
        const data = await getPokemonDetails(id);
        setDetails(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Pokemon details:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchDetails();
  }, [pokemon]);
  
  if (loading) {
    return (
      <Card 
        elevation={4}
        sx={{
          height: 280,
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Skeleton variant="circular" width={100} height={100} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={30} width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="rounded" height={30} />
        </Box>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card 
        elevation={4}
        sx={{
          height: 280,
          borderRadius: '24px',
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(8px)',
          overflow: 'hidden'
        }}
      >
        <CardContent>
          <Typography color="error">Error: {error}</Typography>
        </CardContent>
      </Card>
    );
  }
  
  // Get the primary type for background gradient
  const primaryType = details.types[0]?.type.name || 'normal';
  const secondaryType = details.types[1]?.type.name || primaryType;
  const typeColor1 = theme.palette.pokemonTypes[primaryType];
  const typeColor2 = theme.palette.pokemonTypes[secondaryType];
  
  return (
    <Grow in={true} timeout={500}>
      <Card 
        sx={{ 
          height: 280,
          borderRadius: '24px',
          background: `linear-gradient(135deg, ${typeColor1}40 0%, ${typeColor2}40 100%)`,
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 'inherit',
            zIndex: 0
          }
        }}
      >
        <CardActionArea 
          component={Link} 
          to={`/pokemon/${details.id}`}
          sx={{ 
            height: '100%',
            zIndex: 1,
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'relative', height: '100%' }}>
            {/* Pokemon Number Badge */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                bgcolor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                borderRadius: '12px',
                px: 1.5,
                py: 0.5,
                fontWeight: 'bold',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
                zIndex: 2
              }}
            >
              #{details.id.toString().padStart(3, '0')}
            </Box>
            
            {/* Pokemon Image */}
            <Box 
              sx={{ 
                display: 'flex',
                justifyContent: 'center',
                pt: 4,
                pb: 1,
                position: 'relative'
              }}
            >
              <Box
                component="img"
                src={details.sprites.other['official-artwork'].front_default || details.sprites.front_default}
                alt={details.name}
                sx={{ 
                  width: 120,
                  height: 120,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 8px rgba(0,0,0,0.2))',
                  transition: 'transform 0.3s ease',
                  '.MuiCardActionArea-root:hover &': {
                    transform: 'scale(1.1) translateY(-5px)'
                  }
                }}
              />
            </Box>
            
            {/* Pokemon Info */}
            <CardContent 
              sx={{ 
                textAlign: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px 20px 0 0',
                pb: 2,
                boxShadow: '0 -4px 16px rgba(0,0,0,0.05)'
              }}
            >
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  textTransform: 'capitalize', 
                  mb: 0.5,
                  fontWeight: 700,
                  fontSize: '1.1rem'
                }}
              >
                {details.name.replace(/-/g, ' ')}
              </Typography>
              
              <Box sx={{ mt: 1, display: 'flex', gap: 0.8, justifyContent: 'center' }}>
                {details.types.map((type) => (
                  <Chip 
                    key={type.type.name}
                    label={type.type.name}
                    size="small"
                    sx={{ 
                      textTransform: 'capitalize',
                      backgroundColor: theme.palette.pokemonTypes[type.type.name],
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 24
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Box>
        </CardActionArea>
      </Card>
    </Grow>
  );
};

export default PokemonCard; 