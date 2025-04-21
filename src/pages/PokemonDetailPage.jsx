import { useState, useEffect } from 'react';
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
  Avatar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ScaleIcon from '@mui/icons-material/Scale';
import HeightIcon from '@mui/icons-material/Height';
import CategoryIcon from '@mui/icons-material/Category';
import HomeIcon from '@mui/icons-material/Home';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
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
      {/* Decorative elements */}
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
          zIndex: -1
        }} 
      />
      
      <Fade in={true} timeout={600}>
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
              '&:hover': {
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[4],
              }
            }}
          >
            Back to Pokédex
          </Button>
          
          <Paper 
            elevation={4} 
            sx={{ 
              borderRadius: 6,
              overflow: 'hidden',
              backgroundImage: `linear-gradient(120deg, ${alpha(typeColor1, 0.15)} 0%, ${alpha(typeColor2, 0.15)} 100%)`,
              boxShadow: `0 20px 60px ${alpha(typeColor1, 0.2)}`,
              position: 'relative',
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
              {/* Pokemon Header */}
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
                      backgroundColor: 'rgba(255,255,255,0.1)'
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
                      backgroundColor: 'rgba(255,255,255,0.1)'
                    }}
                  />
                  
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
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
                        letterSpacing: 1
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
                        textShadow: '0 2px 10px rgba(0,0,0,0.2)'
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
                {/* Pokemon Image */}
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
                      zIndex: 3
                    }}
                  >
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
                          transition: 'all 0.3s ease',
                          transform: { xs: 'scale(1.1)', md: 'scale(1)' }
                        }}
                      />
                    </Zoom>
                    
                    {/* Base stats summary */}
                    <Card 
                      elevation={4} 
                      sx={{ 
                        mt: 3, 
                        width: '100%', 
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="700" 
                          color="text.secondary"
                          sx={{ mb: 2, textAlign: 'center' }}
                        >
                          Base Stats
                        </Typography>
                        
                        <Grid container spacing={2}>
                          {pokemon.stats.slice(0, 3).map(stat => (
                            <Grid item xs={4} key={stat.stat.name}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h6" fontWeight="bold" color={
                                  stat.base_stat > 100 ? 'success.main' : 
                                  stat.base_stat > 60 ? 'primary.main' : 
                                  'warning.main'
                                }>
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
                            '&.Mui-selected': {
                              color: typeColor1
                            }
                          }
                        }}
                      >
                        <Tab label="About" />
                        <Tab label="Stats" />
                        <Tab label="Evolution" />
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
                              elevation={2}
                              sx={{
                                p: 3,
                                mb: 4,
                                borderRadius: 4,
                                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                backdropFilter: 'blur(8px)',
                                borderLeft: `4px solid ${typeColor1}`
                              }}
                            >
                              <Typography 
                                paragraph
                                variant="body1"
                                sx={{ 
                                  lineHeight: 1.7,
                                  fontStyle: 'italic',
                                  color: 'text.primary',
                                  mb: 0
                                }}
                              >
                                "{getEnglishDescription()}"
                              </Typography>
                            </Paper>
                            
                            <Grid container spacing={3} sx={{ mt: 1 }}>
                              <Grid item xs={12} sm={6}>
                                <Paper
                                  elevation={2}
                                  sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                  }}
                                >
                                  <HeightIcon sx={{ color: typeColor1, mr: 2, fontSize: 28 }} />
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                      Height
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {pokemon.height / 10} m
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Paper
                                  elevation={2}
                                  sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                  }}
                                >
                                  <ScaleIcon sx={{ color: typeColor1, mr: 2, fontSize: 28 }} />
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                      Weight
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                      {pokemon.weight / 10} kg
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                              
                              <Grid item xs={12} sm={6}>
                                <Paper
                                  elevation={2}
                                  sx={{
                                    p: 2,
                                    borderRadius: 4,
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                  }}
                                >
                                  <CategoryIcon sx={{ color: typeColor1, mr: 2, fontSize: 28 }} />
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                      Abilities
                                    </Typography>
                                    <Typography sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                      {pokemon.abilities.map(ability => 
                                        ability.ability.name.replace('-', ' ')
                                      ).join(', ')}
                                    </Typography>
                                  </Box>
                                </Paper>
                              </Grid>
                              
                              {speciesQuery.data && (
                                <Grid item xs={12} sm={6}>
                                  <Paper
                                    elevation={2}
                                    sx={{
                                      p: 2,
                                      borderRadius: 4,
                                      height: '100%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                    }}
                                  >
                                    <HomeIcon sx={{ color: typeColor1, mr: 2, fontSize: 28 }} />
                                    <Box>
                                      <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                                        Habitat
                                      </Typography>
                                      <Typography sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                        {speciesQuery.data.habitat?.name || 'Unknown'}
                                      </Typography>
                                    </Box>
                                  </Paper>
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
                            elevation={2}
                            sx={{
                              p: 3,
                              borderRadius: 4,
                              backgroundColor: alpha(theme.palette.background.paper, 0.9),
                            }}
                          >
                            {pokemon.stats.map((stat) => (
                              <Box key={stat.stat.name} sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8, alignItems: 'center' }}>
                                  <Typography variant="body1" sx={{ fontWeight: 700, color: typeColor1 }}>
                                    {formatStatName(stat.stat.name)}
                                  </Typography>
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
                                  color: typeColor1
                                }}
                              >
                                {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      </Fade>
                    </Box>
                    
                    {/* Evolution Tab */}
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
                              sx={{ mb: 3, pl: 1 }}
                            >
                              Evolution Chain
                            </Typography>
                            
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: 'center', 
                                flexWrap: 'wrap', 
                                gap: { xs: 2, sm: 3 },
                                justifyContent: { xs: 'center', sm: 'flex-start' }
                              }}
                            >
                              {evolutionQuery.data.chain && (
                                <EvolutionCard 
                                  species={evolutionQuery.data.chain.species}
                                  details={evolutionDetails}
                                  typeColor={typeColor1}
                                  handleClick={handleEvolutionClick}
                                  stage={1}
                                  theme={theme}
                                />
                              )}
                              
                              {evolutionQuery.data.chain?.evolves_to?.map((evo, index) => (
                                <Box 
                                  key={evo.species.name} 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 2,
                                    flexDirection: { xs: 'column', sm: 'row' },
                                    width: { xs: '100%', sm: 'auto' }
                                  }}
                                >
                                  <EvolutionDetail 
                                    evolution={evo} 
                                    typeColor={typeColor1} 
                                  />
                                  
                                  <EvolutionCard 
                                    species={evo.species}
                                    details={evolutionDetails}
                                    typeColor={typeColor1}
                                    handleClick={handleEvolutionClick}
                                    stage={2}
                                    theme={theme}
                                  />
                                  
                                  {evo.evolves_to?.map(finalEvo => (
                                    <Box 
                                      key={finalEvo.species.name} 
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 2,
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        width: { xs: '100%', sm: 'auto' } 
                                      }}
                                    >
                                      <EvolutionDetail 
                                        evolution={finalEvo} 
                                        typeColor={typeColor1} 
                                      />
                                      
                                      <EvolutionCard 
                                        species={finalEvo.species}
                                        details={evolutionDetails}
                                        typeColor={typeColor1}
                                        handleClick={handleEvolutionClick}
                                        stage={3}
                                        theme={theme}
                                      />
                                    </Box>
                                  ))}
                                </Box>
                              ))}
                            </Box>
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

// Helper component for showing evolution cards
const EvolutionCard = ({ species, details, typeColor, handleClick, stage, theme }) => {
  const id = species.url.split('/').filter(Boolean).pop();
  const pokemonDetails = details[id];
  
  return (
    <Paper 
      elevation={4}
      sx={{ 
        cursor: 'pointer', 
        width: { xs: '100%', sm: 180 },
        borderRadius: 4,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: alpha(theme.palette.background.paper, 0.9),
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[8]
        }
      }}
      onClick={() => handleClick(id)}
    >
      <Box sx={{ 
        bgcolor: alpha(typeColor, 0.9),
        color: 'white',
        p: 1,
        textAlign: 'center',
        fontWeight: 600
      }}>
        Stage {stage}
      </Box>
      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        {/* Pokemon Image */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: 120,
            mb: 1.5
          }}
        >
          {pokemonDetails ? (
            <Box 
              component="img"
              src={pokemonDetails.sprites.other['official-artwork'].front_default || pokemonDetails.sprites.front_default}
              alt={species.name}
              sx={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))',
              }}
            />
          ) : (
            <CircularProgress size={30} sx={{ color: alpha(typeColor, 0.6) }} />
          )}
        </Box>
        
        {/* Pokemon Name */}
        <Typography 
          variant="body1" 
          sx={{ 
            textTransform: 'capitalize', 
            fontWeight: 700,
            mb: 1
          }}
        >
          {species.name.replace(/-/g, ' ')}
        </Typography>
        
        {/* Pokemon Types */}
        {pokemonDetails && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.8 }}>
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
                  height: 22
                }}
              />
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

// Helper component for evolution details
const EvolutionDetail = ({ evolution, typeColor }) => {
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
        flexDirection: { xs: 'row', sm: 'column' },
        alignItems: 'center',
        gap: 1.5
      }}
    >
      <ArrowRightAltIcon 
        sx={{ 
          color: typeColor, 
          fontSize: { xs: '2rem', sm: '2.5rem' },
          transform: { xs: 'none', sm: 'rotate(90deg)' },
          mb: { xs: 0, sm: 1 }
        }} 
      />
      
      {(minLevel || item || happiness || timeOfDay) && (
        <Box 
          sx={{ 
            backgroundColor: alpha(typeColor, 0.1),
            borderRadius: 2,
            p: 1,
            textAlign: 'center',
            minWidth: { xs: 'auto', sm: 120 }
          }}
        >
          {minLevel && (
            <Typography variant="caption" display="block" fontWeight={600}>
              Level {minLevel}+
            </Typography>
          )}
          
          {item && (
            <Typography variant="caption" display="block" sx={{ textTransform: 'capitalize' }}>
              Use {item.replace(/-/g, ' ')}
            </Typography>
          )}
          
          {happiness && (
            <Typography variant="caption" display="block">
              Happiness {happiness}+
            </Typography>
          )}
          
          {timeOfDay && (
            <Typography variant="caption" display="block" sx={{ textTransform: 'capitalize' }}>
              During {timeOfDay}
            </Typography>
          )}
          
          {!minLevel && !item && !happiness && !timeOfDay && trigger && (
            <Typography variant="caption" display="block" sx={{ textTransform: 'capitalize' }}>
              {trigger.replace(/-/g, ' ')}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default PokemonDetailPage; 