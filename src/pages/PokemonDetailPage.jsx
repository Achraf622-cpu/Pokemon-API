import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Chip, 
  LinearProgress, 
  Button, 
  CircularProgress, 
  Divider, 
  Alert,
  Paper,
  Stack,
  Tabs,
  Tab,
  Container,
  IconButton,
  useTheme,
  alpha,
  Fade,
  Zoom,
  Avatar,
  Tooltip,
  Skeleton 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ScaleIcon from '@mui/icons-material/Scale';
import HeightIcon from '@mui/icons-material/Height';
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import BoltIcon from '@mui/icons-material/Bolt';
import ShieldIcon from '@mui/icons-material/Shield';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { getPokemonDetails, getPokemonSpecies, getPokemonEvolutionChain } from '../api/pokemonApi';

// Type background colors from PokemonCard
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

const PokemonDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const [evolutionDetails, setEvolutionDetails] = useState({});
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageHover, setImageHover] = useState(false);
  const imageRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // Fetch Pokemon details
  const detailsQuery = useQuery({
    queryKey: ['pokemonDetails', id],
    queryFn: () => getPokemonDetails(id),
  });
  
  // Fetch Pokemon species data
  const speciesQuery = useQuery({
    queryKey: ['pokemonSpecies', id],
    queryFn: () => getPokemonSpecies(id),
    enabled: !!detailsQuery.data,
  });
  
  // Fetch evolution chain
  const evolutionQuery = useQuery({
    queryKey: ['evolutionChain', speciesQuery.data?.evolution_chain?.url],
    queryFn: () => getPokemonEvolutionChain(speciesQuery.data?.evolution_chain?.url),
    enabled: !!speciesQuery.data?.evolution_chain?.url,
  });
  
  // Get English description
  const getEnglishDescription = () => {
    if (!speciesQuery.data?.flavor_text_entries) return '';
    
    const englishEntry = speciesQuery.data.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    
    return englishEntry ? englishEntry.flavor_text.replace(/\\f|\\n/g, ' ') : '';
  };
  
  // Format stat name
  const formatStatName = (statName) => {
    const statMap = {
      'hp': 'HP',
      'attack': 'Attack',
      'defense': 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      'speed': 'Speed'
    };
    
    return statMap[statName] || statName;
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle evolution card click
  const handleEvolutionClick = (id) => {
    navigate(`/pokemon/${id}`);
  };
  
  // Get evolution details (images, types, etc)
  useEffect(() => {
    if (evolutionQuery.data && activeTab === 2) {
      const fetchEvolutionDetails = async () => {
        const details = {};
        
        // Fetch first evolution
        try {
          const id = evolutionQuery.data.chain.species.url.split('/').filter(Boolean).pop();
          const data = await getPokemonDetails(id);
          details[id] = data;
        } catch (error) {
          console.error("Error fetching first evolution:", error);
        }
        
        // Fetch second evolutions
        if (evolutionQuery.data.chain.evolves_to) {
          for (const evo of evolutionQuery.data.chain.evolves_to) {
            try {
              const id = evo.species.url.split('/').filter(Boolean).pop();
              const data = await getPokemonDetails(id);
              details[id] = data;
              
              // Fetch third evolutions
              if (evo.evolves_to) {
                for (const finalEvo of evo.evolves_to) {
                  try {
                    const finalId = finalEvo.species.url.split('/').filter(Boolean).pop();
                    const finalData = await getPokemonDetails(finalId);
                    details[finalId] = finalData;
                  } catch (error) {
                    console.error("Error fetching third evolution:", error);
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching second evolution:", error);
            }
          }
        }
        
        setEvolutionDetails(details);
      };
      
      fetchEvolutionDetails();
    }
  }, [evolutionQuery.data, activeTab]);
  
  // 3D rotation effect for Pokemon image
  const handleMouseMove = (e) => {
    if (!imageRef.current || !isImageLoaded) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const rotateX = (y / rect.height - 0.5) * 20; // -10 to 10 degrees
    const rotateY = (x / rect.width - 0.5) * -20; // -10 to 10 degrees
    
    setRotation({ x: rotateX, y: rotateY });
  };
  
  const handleMouseLeave = () => {
    // Reset rotation when mouse leaves
    setRotation({ x: 0, y: 0 });
    setImageHover(false);
  };
  
  const handleMouseEnter = () => {
    setImageHover(true);
  };
  
  // Show loading state
  if (detailsQuery.isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh' 
      }}>
        <CircularProgress 
          size={80} 
          thickness={4}  
          sx={{ 
            color: 'primary.main',
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': { opacity: 1, transform: 'scale(0.8)' },
              '50%': { opacity: 0.8, transform: 'scale(1)' },
              '100%': { opacity: 1, transform: 'scale(0.8)' }
            }
          }}
        />
        <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
          Loading Pokémon data...
        </Typography>
      </Box>
    );
  }
  
  // Show error state
  if (detailsQuery.isError) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)' 
          }}
        >
          Error loading Pokémon: {detailsQuery.error.message}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
          size="large"
          sx={{ 
            borderRadius: 8, 
            py: 1.5, 
            px: 4,
            boxShadow: theme.shadows[4]
          }}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  const pokemon = detailsQuery.data;
  
  // Get the primary type for background styling
  const primaryType = pokemon.types[0]?.type.name || 'normal';
  const secondaryType = pokemon.types[1]?.type.name || primaryType;
  const typeColor1 = theme.palette.pokemonTypes[primaryType];
  const typeColor2 = theme.palette.pokemonTypes[secondaryType];

  return (
    <Container maxWidth="lg" sx={{ position: 'relative', py: 5 }}>
      {/* Enhanced decorative elements with animation */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: 0, 
          right: '10%',
          width: 300, 
          height: 300, 
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(typeColor1, 0.2)} 0%, rgba(255,255,255,0) 70%)`,
          filter: 'blur(60px)',
          zIndex: -1,
          animation: 'pulse 15s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': { opacity: 0.5, transform: 'scale(1)' },
            '50%': { opacity: 0.7, transform: 'scale(1.2)' },
            '100%': { opacity: 0.5, transform: 'scale(1)' }
          }
        }} 
      />
      
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: '10%', 
          left: '5%',
          width: 250, 
          height: 250, 
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(typeColor2, 0.15)} 0%, rgba(255,255,255,0) 70%)`,
          filter: 'blur(50px)',
          zIndex: -1,
          animation: 'float 20s infinite ease-in-out',
          '@keyframes float': {
            '0%': { transform: 'translateY(0) scale(1)' },
            '50%': { transform: 'translateY(-30px) scale(1.1)' },
            '100%': { transform: 'translateY(0) scale(1)' }
          }
        }} 
      />
      
      <Fade in={true} timeout={800}>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ 
              mb: 4, 
              borderRadius: 8,
              py: 1.2,
              px: 3,
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.background.paper, 0.8),
              backdropFilter: 'blur(8px)',
              color: 'text.primary',
              boxShadow: theme.shadows[2],
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[4],
                transform: 'translateY(-2px)'
              }
            }}
          >
            Back to Pokédex
          </Button>
          
          <Paper 
            elevation={6} 
            sx={{ 
              borderRadius: 6,
              overflow: 'hidden',
              backgroundImage: `linear-gradient(120deg, ${alpha(typeColor1, 0.15)} 0%, ${alpha(typeColor2, 0.15)} 100%)`,
              boxShadow: `0 20px 80px ${alpha(typeColor1, 0.25)}`,
              position: 'relative',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                boxShadow: `0 25px 100px ${alpha(typeColor1, 0.35)}`,
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.85)',
                zIndex: 0
              }
            }}
          >
            <Grid container sx={{ position: 'relative', zIndex: 1 }}>
              {/* Pokemon Header - Enhanced with animation */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    backgroundImage: `linear-gradient(140deg, ${typeColor1} 0%, ${typeColor2} 100%)`,
                    color: 'white',
                    py: 4,
                    px: { xs: 3, md: 6 },
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'radial-gradient(circle at 70% 60%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                      zIndex: 0
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: -100, 
                      right: -100, 
                      width: 300, 
                      height: 300, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      animation: 'rotate 20s linear infinite',
                      '@keyframes rotate': {
                        '0%': { transform: 'rotate(0deg)' },
                        '100%': { transform: 'rotate(360deg)' }
                      }
                    }}
                  />
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      bottom: -80, 
                      left: -80, 
                      width: 200, 
                      height: 200, 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      animation: 'rotate 15s linear infinite reverse',
                    }}
                  />
                  
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <BookmarkIcon 
                      sx={{ 
                        position: 'absolute',
                        top: -20,
                        left: { xs: 'calc(50% - 80px)', sm: 'calc(50% - 120px)' },
                        fontSize: { xs: 40, sm: 60 },
                        color: 'rgba(255,255,255,0.2)',
                        transform: 'rotate(-20deg)'
                      }}
                    />
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'inline-block',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        px: 2,
                        py: 0.5,
                        borderRadius: 4,
                        mb: 1,
                        fontWeight: 600,
                        letterSpacing: 1,
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      #{pokemon.id.toString().padStart(3, '0')}
                    </Typography>
                  
                    <Typography 
                      variant="h3" 
                      component="h1" 
                      sx={{ 
                        textTransform: 'capitalize', 
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        mb: 2,
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: '25%',
                          width: '50%',
                          height: 4,
                          backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                          borderRadius: 2
                        }
                      }}
                    >
                      {pokemon.name.replace(/-/g, ' ')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5 }}>
                      {pokemon.types.map((type) => (
                        <Chip 
                          key={type.type.name}
                          label={type.type.name}
                          sx={{ 
                            textTransform: 'capitalize',
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            border: '2px solid rgba(255,255,255,0.6)',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                            px: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.35)',
                              transform: 'translateY(-2px)'
                            },
                            '& .MuiChip-label': {
                              px: 1.5
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Grid>
              
              {/* Pokemon Content */}
              <Grid container spacing={0}>
                {/* Pokemon Image - Enhanced with 3D effect */}
                <Grid item xs={12} md={5} lg={4}>
                  <Box 
                    sx={{ 
                      p: 4,
                      pt: { xs: 0, md: 4 },
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative',
                      mt: { xs: -10, sm: -12, md: 0 },
                      zIndex: 3,
                      perspective: '1000px'
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    ref={imageRef}
                  >
                    {!isImageLoaded && (
                      <Skeleton 
                        variant="rounded" 
                        width="80%" 
                        height={280} 
                        animation="wave" 
                        sx={{ 
                          borderRadius: '50%',
                          backgroundColor: alpha(typeColor1, 0.1)
                        }} 
                      />
                    )}
                    
                    <Zoom in={true} timeout={700}>
                      <Box 
                        component="img" 
                        src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
                        alt={pokemon.name} 
                        sx={{ 
                          width: '100%', 
                          maxHeight: 400,
                          objectFit: 'contain',
                          filter: 'drop-shadow(0 20px 20px rgba(0,0,0,0.25))',
                          transition: 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
                          transform: {
                            xs: imageHover 
                              ? `scale(1.15) translateY(-10px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
                              : 'scale(1.1)',
                            md: imageHover 
                              ? `scale(1.05) translateY(-10px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
                              : 'scale(1)'
                          },
                          transformStyle: 'preserve-3d',
                          display: isImageLoaded ? 'block' : 'none'
                        }}
                        onLoad={() => setIsImageLoaded(true)}
                        loading="eager"
                      />
                    </Zoom>
                    
                    {/* Rotating circle around Pokemon image */}
                    <Box 
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '80%',
                        height: '80%',
                        borderRadius: '50%',
                        border: `2px dashed ${alpha(typeColor1, 0.3)}`,
                        pointerEvents: 'none',
                        zIndex: -1,
                        animation: 'spin 20s linear infinite',
                        opacity: imageHover ? 1 : 0.5,
                        transition: 'opacity 0.3s ease',
                        '@keyframes spin': {
                          '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                          '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                        }
                      }}
                    />
                    
                    {/* Enhanced base stats summary */}
                    <Card 
                      elevation={4} 
                      sx={{ 
                        mt: 3, 
                        width: '100%', 
                        borderRadius: 4,
                        background: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(10px)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: theme.shadows[8]
                        }
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="700" 
                          color="text.secondary"
                          sx={{ 
                            mb: 2, 
                            textAlign: 'center',
                            position: 'relative',
                            display: 'inline-block',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: -5,
                              left: 0,
                              width: '100%',
                              height: 2,
                              background: `linear-gradient(90deg, transparent, ${alpha(typeColor1, 0.7)}, transparent)`,
                              borderRadius: 1
                            }
                          }}
                        >
                          Base Stats
                        </Typography>
                        
                        <Grid container spacing={2}>
                          {pokemon.stats.slice(0, 3).map(stat => (
                            <Grid item xs={4} key={stat.stat.name}>
                              <Box 
                                sx={{ 
                                  textAlign: 'center',
                                  position: 'relative',
                                  '&:hover': {
                                    '& .stat-icon': {
                                      transform: 'translateY(-3px)',
                                      opacity: 1
                                    }
                                  }
                                }}
                              >
                                <StatIcon 
                                  statName={stat.stat.name} 
                                  typeColor={
                                    stat.base_stat > 100 ? theme.palette.success.main : 
                                    stat.base_stat > 60 ? typeColor1 : 
                                    theme.palette.warning.main
                                  } 
                                />
                                <Typography 
                                  variant="h6" 
                                  fontWeight="bold" 
                                  color={
                                    stat.base_stat > 100 ? 'success.main' : 
                                    stat.base_stat > 60 ? 'primary.main' : 
                                    'warning.main'
                                  }
                                >
                                  {stat.base_stat}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {formatStatName(stat.stat.name)}
                                </Typography>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
                
                {/* Pokemon Details */}
                <Grid item xs={12} md={7} lg={8}>
                  <Box sx={{ p: { xs: 3, md: 4 } }}>
                    <Box sx={{ 
                      borderBottom: 1, 
                      borderColor: 'divider',
                      mb: 3
                    }}>
                      <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        aria-label="pokemon information tabs"
                        variant="fullWidth"
                        sx={{
                          '& .MuiTabs-indicator': {
                            backgroundColor: typeColor1,
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                          },
                          '& .MuiTab-root': {
                            fontWeight: 700,
                            textTransform: 'none',
                            fontSize: '1rem',
                            py: 2,
                            transition: 'all 0.3s ease',
                            '&.Mui-selected': {
                              color: typeColor1
                            },
                            '&:hover': {
                              color: alpha(typeColor1, 0.8)
                            }
                          }
                        }}
                      >
                        <Tab 
                          label="About" 
                          icon={<AutoFixHighIcon sx={{ mb: { xs: 0, sm: 0.5 }, mr: { xs: 1, sm: 0 } }} />} 
                          iconPosition="start"
                          sx={{ flexDirection: { xs: 'row', sm: 'column' } }}
                        />
                        <Tab 
                          label="Stats" 
                          icon={<BoltIcon sx={{ mb: { xs: 0, sm: 0.5 }, mr: { xs: 1, sm: 0 } }} />} 
                          iconPosition="start"
                          sx={{ flexDirection: { xs: 'row', sm: 'column' } }}
                        />
                        <Tab 
                          label="Evolution" 
                          icon={<DirectionsRunIcon sx={{ mb: { xs: 0, sm: 0.5 }, mr: { xs: 1, sm: 0 } }} />} 
                          iconPosition="start"
                          sx={{ flexDirection: { xs: 'row', sm: 'column' } }}
                        />
                      </Tabs>
                    </Box>
                    
                    {/* About Tab */}
                    <Box hidden={activeTab !== 0} sx={{ pb: 3 }}>
                      {speciesQuery.isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={30} sx={{ color: typeColor1 }} />
                        </Box>
                      ) : (
                        <Fade in={activeTab === 0} timeout={500}>
                          <Box>
                            <Paper
                              elevation={3}
                              sx={{
                                p: 3,
                                mb: 4,
                                borderRadius: 4,
                                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                backdropFilter: 'blur(8px)',
                                borderLeft: `4px solid ${typeColor1}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-3px)',
                                  boxShadow: `0 8px 24px ${alpha(typeColor1, 0.2)}`,
                                }
                              }}
                            >
                              <Typography 
                                paragraph
                                variant="body1"
                                sx={{ 
                                  lineHeight: 1.7,
                                  fontStyle: 'italic',
                                  color: 'text.primary',
                                  mb: 0,
                                  position: 'relative',
                                  '&::before': {
                                    content: '""',
                                    color: alpha(typeColor1, 0.3),
                                    fontSize: '3rem',
                                    position: 'absolute',
                                    left: -10,
                                    top: -20,
                                    fontFamily: 'serif',
                                  },
                                  '&::after': {
                                    content: '""',
                                    color: alpha(typeColor1, 0.3),
                                    fontSize: '3rem',
                                    position: 'absolute',
                                    right: -10,
                                    bottom: -40,
                                    fontFamily: 'serif',
                                  }
                                }}
                              >
                                {getEnglishDescription()}
                              </Typography>
                            </Paper>
                            
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <PokemonInfoCard 
                                  icon={<HeightIcon />}
                                  title="Height"
                                  value={`${pokemon.height / 10} m`}
                                  typeColor={typeColor1}
                                  theme={theme}
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <PokemonInfoCard 
                                  icon={<ScaleIcon />}
                                  title="Weight"
                                  value={`${pokemon.weight / 10} kg`}
                                  typeColor={typeColor1}
                                  theme={theme}
                                />
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <PokemonInfoCard 
                                  icon={<CategoryIcon />}
                                  title="Abilities"
                                  value={pokemon.abilities.map(ability => 
                                    ability.ability.name.replace('-', ' ')
                                  ).join(', ')}
                                  typeColor={typeColor1}
                                  theme={theme}
                                  capitalize
                                />
                              </Grid>
                              
                              {speciesQuery.data && (
                                <Grid item xs={12} sm={6}>
                                  <PokemonInfoCard 
                                    icon={<HomeIcon />}
                                    title="Habitat"
                                    value={speciesQuery.data.habitat?.name || 'Unknown'}
                                    typeColor={typeColor1}
                                    theme={theme}
                                    capitalize
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        </Fade>
                      )}
                    </Box>
                    
                    {/* Stats Tab */}
                    <Box hidden={activeTab !== 1} sx={{ pb: 3 }}>
                      <Fade in={activeTab === 1} timeout={500}>
                        <Box>
                          <Paper
                            elevation={3}
                            sx={{
                              p: 3,
                              borderRadius: 4,
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-3px)',
                                boxShadow: `0 8px 24px ${alpha(typeColor1, 0.2)}`,
                              }
                            }}
                          >
                            {pokemon.stats.map((stat, index) => (
                              <Box key={stat.stat.name} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, alignItems: 'center' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <StatIcon 
                                      statName={stat.stat.name} 
                                      typeColor={
                                        stat.base_stat > 100 ? theme.palette.success.main : 
                                        stat.base_stat > 60 ? typeColor1 : 
                                        theme.palette.warning.main
                                      } 
                                      size="medium"
                                    />
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: typeColor1 }}>
                                      {formatStatName(stat.stat.name)}
                                    </Typography>
                                  </Box>
                                  <Typography 
                                    variant="body1" 
                                    sx={{ 
                                      fontWeight: 700,
                                      backgroundColor: stat.base_stat > 100 ? theme.palette.success.light : 
                                                     stat.base_stat > 60 ? theme.palette.primary.light : 
                                                     theme.palette.warning.light,
                                      color: 'white',
                                      py: 0.2,
                                      px: 1.2,
                                      borderRadius: 10,
                                      minWidth: 40,
                                      textAlign: 'center'
                                    }}
                                  >
                                    {stat.base_stat}
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={(stat.base_stat / 255) * 100} 
                                  sx={{ 
                                    height: 10, 
                                    borderRadius: 5,
                                    backgroundColor: alpha(theme.palette.grey[300], 0.7),
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: stat.base_stat > 100 ? theme.palette.success.main : 
                                                      stat.base_stat > 60 ? typeColor1 : 
                                                      theme.palette.warning.main,
                                      borderRadius: 5,
                                      animation: 'grow 1s ease-out',
                                      transformOrigin: 'left',
                                      '@keyframes grow': {
                                        '0%': { transform: 'scaleX(0)' },
                                        '100%': { transform: 'scaleX(1)' }
                                      }
                                    },
                                  }}
                                />
                              </Box>
                            ))}
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
                                Total
                              </Typography>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700,
                                  color: typeColor1,
                                  animation: 'fadeIn 1.5s ease-out',
                                  '@keyframes fadeIn': {
                                    '0%': { opacity: 0 },
                                    '100%': { opacity: 1 }
                                  }
                                }}
                              >
                                {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      </Fade>
                    </Box>
                    
                    {/* Evolution Tab with improved transitions and animations */}
                    <Box hidden={activeTab !== 2} sx={{ pb: 3 }}>
                      {evolutionQuery.isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={30} sx={{ color: typeColor1 }} />
                        </Box>
                      ) : evolutionQuery.data ? (
                        <Fade in={activeTab === 2} timeout={500}>
                          <Box>
                            <Typography 
                              variant="h6" 
                              fontWeight="700"
                              color={typeColor1}
                              sx={{ 
                                mb: 3, 
                                pl: 1,
                                position: 'relative',
                                display: 'inline-block',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 4,
                                  height: '70%',
                                  backgroundColor: typeColor1,
                                  borderRadius: 2
                                }
                              }}
                            >
                              Evolution Path
                            </Typography>
                            
                            {/* Advanced Evolution Path Visualization */}
                            <PokemonEvolutionPath 
                              evolutionChain={evolutionQuery.data.chain}
                              evolutionDetails={evolutionDetails}
                              handleClick={handleEvolutionClick}
                              typeColor={typeColor1}
                              secondaryColor={typeColor2}
                              theme={theme}
                            />
                          </Box>
                        </Fade>
                      ) : (
                        <Alert 
                          severity="info"
                          variant="outlined"
                          sx={{ 
                            borderRadius: 4,
                            boxShadow: theme.shadows[2]
                          }}
                        >
                          No evolution data available for this Pokémon.
                        </Alert>
                      )}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
};

// Enhanced Evolution Path Component with advanced visualizations
const PokemonEvolutionPath = ({ evolutionChain, evolutionDetails, handleClick, typeColor, secondaryColor, theme }) => {
  // Extract evolution chain data
  const firstStage = evolutionChain;
  const secondStages = firstStage?.evolves_to || [];
  const hasMultipleBranches = secondStages.length > 1;
  const hasThirdStage = secondStages.some(stage => stage.evolves_to?.length > 0);
  
  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
        mt: 2,
        pb: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Evolution Path Background with animated glow */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 0,
          left: '10%',
          width: '80%',
          height: '100%',
          opacity: 0.2,
          background: `radial-gradient(ellipse at top, ${typeColor}, transparent 70%), 
                      radial-gradient(ellipse at bottom, ${secondaryColor}, transparent 70%)`,
          filter: 'blur(60px)',
          zIndex: 0,
          animation: 'pulse-glow 8s infinite alternate ease-in-out',
          '@keyframes pulse-glow': {
            '0%': { opacity: 0.15, filter: 'blur(60px)' },
            '100%': { opacity: 0.3, filter: 'blur(40px)' }
          }
        }}
      />
      
      {/* First Evolution Stage */}
      {firstStage && (
        <Box 
          sx={{ 
            position: 'relative', 
            zIndex: 1,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: hasMultipleBranches ? 8 : 3
          }}
        >
          <EvolutionStageCard 
            species={firstStage.species}
            details={evolutionDetails}
            typeColor={typeColor}
            secondaryColor={secondaryColor}
            stageNumber={1}
            handleClick={handleClick}
            theme={theme}
            isActive={true}
          />
          
          {/* Path Connector for Multi-Branch */}
          {secondStages.length > 0 && (
            <EvolutionPathConnector 
              hasMultipleBranches={hasMultipleBranches} 
              typeColor={typeColor}
              secondaryColor={secondaryColor}
              theme={theme}
            />
          )}
        </Box>
      )}
      
      {/* Second Evolution Stages */}
      {secondStages.length > 0 && (
        <Box 
          sx={{ 
            position: 'relative',
            width: '100%',
            display: 'flex',
            flexDirection: hasMultipleBranches ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: hasMultipleBranches ? 'wrap' : 'nowrap',
            gap: 4,
            mb: hasThirdStage ? 6 : 0,
          }}
        >
          {secondStages.map((stage, index) => (
            <Box
              key={stage.species.name}
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                width: hasMultipleBranches ? { xs: '100%', sm: `${100 / secondStages.length}%` } : '100%',
                maxWidth: hasMultipleBranches ? 280 : '100%',
                mx: hasMultipleBranches ? 'auto' : 0,
              }}
            >
              <EvolutionDetail 
                evolution={stage} 
                typeColor={typeColor}
                secondaryColor={secondaryColor}
                isAnimated={true}
                theme={theme}
              />
              
              <EvolutionStageCard 
                species={stage.species}
                details={evolutionDetails}
                typeColor={typeColor}
                secondaryColor={secondaryColor}
                stageNumber={2}
                handleClick={handleClick}
                theme={theme}
                isActive={true}
              />
              
              {/* Third stage connector */}
              {stage.evolves_to?.length > 0 && (
                <Box 
                  sx={{ 
                    position: 'relative',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mt: 2
                  }}
                >
                  <EvolutionPathConnector 
                    typeColor={typeColor}
                    secondaryColor={secondaryColor}
                    hasMultipleBranches={false}
                    theme={theme}
                  />
                </Box>
              )}
              
              {/* Third Evolution Stages */}
              {stage.evolves_to?.length > 0 && (
                <Box 
                  sx={{ 
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    mt: 2
                  }}
                >
                  {stage.evolves_to.map(finalStage => (
                    <Box 
                      key={finalStage.species.name}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <EvolutionDetail 
                        evolution={finalStage} 
                        typeColor={typeColor}
                        secondaryColor={secondaryColor}
                        isAnimated={true}
                        theme={theme}
                      />
                      
                      <EvolutionStageCard 
                        species={finalStage.species}
                        details={evolutionDetails}
                        typeColor={typeColor}
                        secondaryColor={secondaryColor}
                        stageNumber={3}
                        handleClick={handleClick}
                        theme={theme}
                        isActive={true}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

// Enhanced evolution card with game-inspired design
const EvolutionStageCard = ({ species, details, typeColor, secondaryColor, stageNumber, handleClick, theme, isActive = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const id = species.url.split('/').filter(Boolean).pop();
  const pokemonDetails = details[id];
  const [showEffect, setShowEffect] = useState(false);
  
  // Trigger evolution effect
  const triggerEvolutionEffect = () => {
    if (isActive && isLoaded) {
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 1500);
    }
  };
  
  return (
    <Paper 
      elevation={isHovered ? 12 : 4}
      sx={{ 
        cursor: 'pointer', 
        width: { xs: '100%', sm: 220 },
        height: 320,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: isHovered ? 'translateY(-10px) scale(1.05)' : 'translateY(0) scale(1)',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`,
        backdropFilter: 'blur(10px)',
        '&::before': isActive ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 'inherit',
          padding: '2px',
          background: `linear-gradient(135deg, ${typeColor} 0%, ${secondaryColor} 100%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: 0,
          opacity: isHovered ? 1 : 0.7,
          transition: 'opacity 0.4s ease'
        } : {},
        boxShadow: isHovered 
          ? `0 20px 25px -5px ${alpha(typeColor, 0.5)}, 0 10px 10px -5px ${alpha(typeColor, 0.3)}`
          : `0 10px 15px -3px ${alpha(typeColor, 0.3)}, 0 4px 6px -2px ${alpha(typeColor, 0.2)}`
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        triggerEvolutionEffect();
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      onClick={() => handleClick(id)}
    >
      {/* Stage Badge */}
      <Box 
        sx={{ 
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: isHovered ? typeColor : alpha(typeColor, 0.8),
          color: '#fff',
          borderRadius: 10,
          px: 1.5,
          py: 0.5,
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: 1,
          boxShadow: `0 2px 8px ${alpha(typeColor, 0.5)}`,
          transition: 'all 0.3s ease',
          zIndex: 10
        }}
      >
        STAGE {stageNumber}
      </Box>
      
      {/* Pokemon Image with Effects */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: 200,
          position: 'relative',
          overflow: 'hidden',
          pt: 4,
          background: `radial-gradient(circle at center, ${alpha(typeColor, 0.15)} 0%, transparent 70%)`,
        }}
      >
        {/* Loading Skeleton */}
        {!isLoaded && !pokemonDetails && (
          <Skeleton 
            variant="circular" 
            width={120} 
            height={120} 
            animation="wave" 
            sx={{ backgroundColor: alpha(typeColor, 0.1) }} 
          />
        )}
        
        {/* Evolution Effect Animation */}
        {showEffect && (
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `radial-gradient(circle at center, ${alpha(typeColor, 0)} 0%, ${alpha(typeColor, 0.7)} 50%, ${alpha(typeColor, 0)} 100%)`,
              opacity: 1,
              zIndex: 5,
              animation: 'evolve-pulse 1.5s forwards',
              '@keyframes evolve-pulse': {
                '0%': { opacity: 0, transform: 'scale(0.5)' },
                '50%': { opacity: 0.8, transform: 'scale(1.2)' },
                '100%': { opacity: 0, transform: 'scale(2)' }
              }
            }}
          />
        )}
        
        {/* Particle Effects */}
        {(isHovered || showEffect) && (
          <>
            {[...Array(12)].map((_, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: i % 2 === 0 ? typeColor : secondaryColor,
                  top: '50%',
                  left: '50%',
                  boxShadow: `0 0 10px ${typeColor}`,
                  zIndex: 4,
                  opacity: 0,
                  animation: `particle-${i} 1.5s ease-out forwards`,
                  [`@keyframes particle-${i}`]: {
                    '0%': { 
                      transform: 'translate(-50%, -50%) scale(0)',
                      opacity: 1
                    },
                    '100%': { 
                      transform: `translate(${Math.cos(i * 30 * Math.PI / 180) * 120}px, ${Math.sin(i * 30 * Math.PI / 180) * 120}px) scale(0)`,
                      opacity: 0
                    }
                  }
                }}
              />
            ))}
          </>
        )}
        
        {/* Rotating Rings */}
        {isHovered && (
          <>
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 140,
                height: 140,
                borderRadius: '50%',
                border: `2px dashed ${alpha(typeColor, 0.4)}`,
                animation: 'spin 10s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
                  '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
                }
              }}
            />
            <Box 
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: `2px dashed ${alpha(secondaryColor, 0.4)}`,
                animation: 'spin 7s linear infinite reverse'
              }}
            />
          </>
        )}
        
        {/* Pokemon Image */}
        {pokemonDetails && (
          <Zoom in={true} style={{ transitionDelay: '250ms' }}>
            <Box 
              component="img"
              src={pokemonDetails.sprites.other['official-artwork'].front_default || pokemonDetails.sprites.front_default}
              alt={species.name}
              sx={{ 
                maxWidth: '80%',
                maxHeight: '80%',
                objectFit: 'contain',
                filter: `drop-shadow(0 5px 10px ${alpha(typeColor, 0.5)})`,
                transition: 'all 0.4s ease',
                transform: isHovered ? 'scale(1.1) translateY(-10px)' : 'scale(1)',
                position: 'relative',
                zIndex: 3,
                animation: showEffect ? 'evolution-shine 1.5s ease-out' : 'none',
                '@keyframes evolution-shine': {
                  '0%': { filter: `drop-shadow(0 5px 10px ${alpha(typeColor, 0.5)})` },
                  '50%': { filter: `drop-shadow(0 0 25px ${typeColor}) brightness(1.5)` },
                  '100%': { filter: `drop-shadow(0 5px 10px ${alpha(typeColor, 0.5)})` }
                }
              }}
              onLoad={() => setIsLoaded(true)}
            />
          </Zoom>
        )}
      </Box>
      
      {/* Pokemon Info */}
      <Box 
        sx={{ 
          pt: 1,
          px: 2,
          pb: 2,
          transition: 'all 0.3s ease',
          height: 120,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Pokemon Name */}
        <Typography 
          variant="h6" 
          align="center"
          sx={{ 
            textTransform: 'capitalize', 
            fontWeight: 700,
            mb: 1,
            background: isHovered 
              ? `linear-gradient(90deg, ${typeColor}, ${secondaryColor}, ${typeColor})` 
              : 'none',
            backgroundSize: '200% auto',
            color: isHovered ? 'transparent' : 'inherit',
            WebkitBackgroundClip: isHovered ? 'text' : 'none',
            backgroundClip: isHovered ? 'text' : 'none',
            animation: isHovered ? 'shine 2s linear infinite' : 'none',
            '@keyframes shine': {
              '0%': { backgroundPosition: '0% center' },
              '100%': { backgroundPosition: '200% center' }
            }
          }}
        >
          {species.name.replace(/-/g, ' ')}
        </Typography>
        
        {/* Pokemon Types */}
        {pokemonDetails && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            {pokemonDetails.types.map(type => (
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
                  height: 22,
                  transition: 'all 0.3s ease',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isHovered ? `0 2px 5px ${alpha(theme.palette.pokemonTypes[type.type.name], 0.5)}` : 'none'
                }}
              />
            ))}
          </Box>
        )}
        
        {/* Pokemon Stats */}
        {pokemonDetails && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 2,
              mt: 'auto',
              pt: 1
            }}
          >
            <Tooltip title="Attack" arrow placement="top">
              <Box sx={{ textAlign: 'center' }}>
                <BoltIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                  {pokemonDetails.stats[1].base_stat}
                </Typography>
              </Box>
            </Tooltip>
            
            <Tooltip title="Defense" arrow placement="top">
              <Box sx={{ textAlign: 'center' }}>
                <ShieldIcon sx={{ color: theme.palette.info.main, fontSize: 16 }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                  {pokemonDetails.stats[2].base_stat}
                </Typography>
              </Box>
            </Tooltip>
            
            <Tooltip title="Speed" arrow placement="top">
              <Box sx={{ textAlign: 'center' }}>
                <DirectionsRunIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>
                  {pokemonDetails.stats[5].base_stat}
                </Typography>
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Enhanced evolution detail component
const EvolutionDetail = ({ evolution, typeColor, secondaryColor, isAnimated = false, theme }) => {
  // Extract evolution details if available
  const minLevel = evolution.evolution_details?.[0]?.min_level;
  const item = evolution.evolution_details?.[0]?.item?.name;
  const trigger = evolution.evolution_details?.[0]?.trigger?.name;
  const happiness = evolution.evolution_details?.[0]?.min_happiness;
  const timeOfDay = evolution.evolution_details?.[0]?.time_of_day;
  
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        mb: 3,
        position: 'relative',
        width: '100%'
      }}
    >
      {isAnimated && (
        <Box 
          sx={{ 
            position: 'absolute',
            bottom: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 2,
            height: 40,
            background: `linear-gradient(to bottom, ${alpha(typeColor, 0.7)}, ${alpha(secondaryColor, 0.4)})`,
            zIndex: 0,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: typeColor,
              animation: 'arrow-drop 2s infinite ease-in-out',
              '@keyframes arrow-drop': {
                '0%': { opacity: 1, top: 0 },
                '100%': { opacity: 0, top: 30 }
              }
            }
          }}
        />
      )}
      
      {(minLevel || item || happiness || timeOfDay) && (
        <Paper
          elevation={3}
          sx={{ 
            p: 1.5,
            borderRadius: 3,
            minWidth: 150,
            maxWidth: 200,
            background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.8)})`,
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: `0 5px 15px ${alpha(typeColor, 0.2)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(to right, ${typeColor}, ${secondaryColor})`,
            },
            '&::after': isAnimated ? {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(90deg, transparent, ${alpha(typeColor, 0.2)}, transparent)`,
              animation: 'shimmer 2s infinite',
              '@keyframes shimmer': {
                '0%': { transform: 'translateX(-100%)' },
                '100%': { transform: 'translateX(100%)' }
              }
            } : {}
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 700, 
                color: typeColor,
                textAlign: 'center',
                mb: 0.5
              }}
            >
              Evolution Trigger
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {minLevel && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                  }}
                >
                  <Box component="span" sx={{ 
                    backgroundColor: alpha(typeColor, 0.2), 
                    px: 1, 
                    py: 0.2, 
                    borderRadius: 1,
                    color: typeColor
                  }}>
                    Level Up
                  </Box> 
                  to level {minLevel}+
                </Typography>
              )}
              
              {item && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textTransform: 'capitalize', 
                    fontWeight: 600,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5
                  }}
                >
                  <Box component="span" sx={{ 
                    backgroundColor: alpha(secondaryColor, 0.2), 
                    px: 1, 
                    py: 0.2, 
                    borderRadius: 1,
                    color: secondaryColor
                  }}>
                    Use Item
                  </Box> 
                  {item.replace(/-/g, ' ')}
                </Typography>
              )}
              
              {happiness && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5
                  }}
                >
                  <Box component="span" sx={{ 
                    backgroundColor: alpha(typeColor, 0.2), 
                    px: 1, 
                    py: 0.2, 
                    borderRadius: 1,
                    color: typeColor
                  }}>
                    Friendship
                  </Box> 
                  {happiness}+ points
                </Typography>
              )}
              
              {timeOfDay && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textTransform: 'capitalize', 
                    fontWeight: 600,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5
                  }}
                >
                  <Box component="span" sx={{ 
                    backgroundColor: alpha(secondaryColor, 0.2), 
                    px: 1, 
                    py: 0.2, 
                    borderRadius: 1,
                    color: secondaryColor
                  }}>
                    Time
                  </Box> 
                  during {timeOfDay}
                </Typography>
              )}
              
              {!minLevel && !item && !happiness && !timeOfDay && trigger && (
                <Typography 
                  variant="body2" 
                  sx={{ 
                    textTransform: 'capitalize', 
                    fontWeight: 600,
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5
                  }}
                >
                  <Box component="span" sx={{ 
                    backgroundColor: alpha(typeColor, 0.2), 
                    px: 1, 
                    py: 0.2, 
                    borderRadius: 1,
                    color: typeColor
                  }}>
                    {trigger.replace(/-/g, ' ')}
                  </Box>
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// Beautiful path connector with animations
const EvolutionPathConnector = ({ hasMultipleBranches, typeColor, secondaryColor, theme }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: hasMultipleBranches ? 80 : 40,
      }}
    >
      {hasMultipleBranches ? (
        // Multi-branch connector with animated particles
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            height: '50%',
            width: 2,
            background: `linear-gradient(to bottom, ${typeColor}, ${secondaryColor})`,
          }}
        >
          {/* Animated Particles */}
          <Box
            sx={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: 2,
              background: `linear-gradient(to right, ${secondaryColor}, ${typeColor})`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -3,
                left: 0,
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: secondaryColor,
                animation: 'particle-move 3s infinite ease-in-out',
                '@keyframes particle-move': {
                  '0%': { left: '0%', transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.5)' },
                  '100%': { left: '100%', transform: 'scale(1)' }
                }
              }
            }}
          />
        </Box>
      ) : (
        // Single branch connector with pulse animation
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            height: '100%',
            width: 2,
            background: `linear-gradient(to bottom, ${typeColor}, ${secondaryColor})`,
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: typeColor,
              boxShadow: `0 0 10px ${typeColor}`,
              animation: 'pulse-connector 2s infinite ease-in-out',
              '@keyframes pulse-connector': {
                '0%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
                '50%': { opacity: 0.5, transform: 'translate(-50%, -50%) scale(1.5)' },
                '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' }
              }
            }
          }}
        />
      )}
    </Box>
  );
};

// Helper component for stat icons
const StatIcon = ({ statName, typeColor, size = 'small' }) => {
  const iconSize = size === 'small' ? 18 : size === 'medium' ? 24 : 30;
  
  const getIcon = () => {
    switch (statName) {
      case 'hp':
        return <FavoriteIcon sx={{ fontSize: iconSize }} />;
      case 'attack':
        return <BoltIcon sx={{ fontSize: iconSize }} />;
      case 'defense':
        return <ShieldIcon sx={{ fontSize: iconSize }} />;
      case 'special-attack':
        return <AutoFixHighIcon sx={{ fontSize: iconSize }} />;
      case 'special-defense':
        return <ShieldIcon sx={{ fontSize: iconSize }} />;
      case 'speed':
        return <DirectionsRunIcon sx={{ fontSize: iconSize }} />;
      default:
        return null;
    }
  };
  
  return (
    <Box 
      className="stat-icon"
      sx={{ 
        color: typeColor,
        opacity: 0.8,
        transition: 'all 0.3s ease',
        mb: 0.5
      }}
    >
      {getIcon()}
    </Box>
  );
};

// Helper component for info cards
const PokemonInfoCard = ({ icon, title, value, typeColor, theme, capitalize = false }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 4,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: `0 8px 15px ${alpha(typeColor, 0.2)}`,
          '& .info-icon': {
            transform: 'scale(1.1) rotate(5deg)',
            color: typeColor
          }
        }
      }}
    >
      <Box 
        className="info-icon"
        sx={{ 
          color: alpha(typeColor, 0.8), 
          mr: 2, 
          fontSize: 28,
          transition: 'all 0.3s ease'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
          {title}
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            textTransform: capitalize ? 'capitalize' : 'none' 
          }}
        >
          {value}
        </Typography>
      </Box>
    </Paper>
  );
};

export default PokemonDetailPage; 