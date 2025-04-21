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
  Tab
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  
  // Show loading state
  if (detailsQuery.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (detailsQuery.isError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading Pokémon: {detailsQuery.error.message}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Box>
    );
  }
  
  const pokemon = detailsQuery.data;
  
  return (
    <Box sx={{ py: 4 }}>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back to List
      </Button>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Pokemon Image */}
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%' 
            }}>
              <img 
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
                alt={pokemon.name} 
                style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
              />
              
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mt: 2 }}
              >
                #{pokemon.id.toString().padStart(3, '0')}
              </Typography>
              
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ textTransform: 'capitalize', fontWeight: 700, textAlign: 'center' }}
              >
                {pokemon.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                {pokemon.types.map((type) => (
                  <Chip 
                    key={type.type.name}
                    label={type.type.name}
                    sx={{ 
                      textTransform: 'capitalize',
                      backgroundColor: typeColors[type.type.name] || '#A8A77A',
                      color: 'white'
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Grid>
          
          {/* Pokemon Details */}
          <Grid item xs={12} md={8}>
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={activeTab} onChange={handleTabChange} aria-label="pokemon information tabs">
                  <Tab label="About" />
                  <Tab label="Stats" />
                  <Tab label="Evolution" />
                </Tabs>
              </Box>
              
              {/* About Tab */}
              <Box hidden={activeTab !== 0} sx={{ py: 3 }}>
                {speciesQuery.isLoading ? (
                  <CircularProgress size={20} />
                ) : (
                  <>
                    <Typography paragraph>
                      {getEnglishDescription()}
                    </Typography>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Height:
                        </Typography>
                        <Typography>
                          {pokemon.height / 10} m
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Weight:
                        </Typography>
                        <Typography>
                          {pokemon.weight / 10} kg
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Abilities:
                        </Typography>
                        <Typography sx={{ textTransform: 'capitalize' }}>
                          {pokemon.abilities.map(ability => 
                            ability.ability.name.replace('-', ' ')
                          ).join(', ')}
                        </Typography>
                      </Grid>
                      
                      {speciesQuery.data && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Habitat:
                          </Typography>
                          <Typography sx={{ textTransform: 'capitalize' }}>
                            {speciesQuery.data.habitat?.name || 'Unknown'}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </>
                )}
              </Box>
              
              {/* Stats Tab */}
              <Box hidden={activeTab !== 1} sx={{ py: 3 }}>
                <Box sx={{ width: '100%' }}>
                  {pokemon.stats.map((stat) => (
                    <Box key={stat.stat.name} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatStatName(stat.stat.name)}
                        </Typography>
                        <Typography variant="body2">
                          {stat.base_stat}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stat.base_stat / 255) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 5,
                          backgroundColor: 'grey.300',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: stat.base_stat > 100 ? '#4caf50' : stat.base_stat > 50 ? '#ff9800' : '#f44336',
                          },
                        }}
                      />
                    </Box>
                  ))}
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      Total:
                    </Typography>
                    <Typography>
                      {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Evolution Tab */}
              <Box hidden={activeTab !== 2} sx={{ py: 3 }}>
                {evolutionQuery.isLoading ? (
                  <CircularProgress size={20} />
                ) : evolutionQuery.data ? (
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Evolution Chain
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      {/* This is a simplified evolution display, a more complex one would parse the full chain */}
                      {evolutionQuery.data.chain && (
                        <Card 
                          sx={{ cursor: 'pointer', minWidth: 150 }}
                          onClick={() => {
                            const id = evolutionQuery.data.chain.species.url.split('/').filter(Boolean).pop();
                            handleEvolutionClick(id);
                          }}
                        >
                          <CardContent>
                            <Typography variant="body2" textAlign="center" sx={{ textTransform: 'capitalize' }}>
                              {evolutionQuery.data.chain.species.name}
                            </Typography>
                          </CardContent>
                        </Card>
                      )}
                      
                      {evolutionQuery.data.chain?.evolves_to?.map(evo => (
                        <Box key={evo.species.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography>→</Typography>
                          <Card 
                            sx={{ cursor: 'pointer', minWidth: 150 }}
                            onClick={() => {
                              const id = evo.species.url.split('/').filter(Boolean).pop();
                              handleEvolutionClick(id);
                            }}
                          >
                            <CardContent>
                              <Typography variant="body2" textAlign="center" sx={{ textTransform: 'capitalize' }}>
                                {evo.species.name}
                              </Typography>
                            </CardContent>
                          </Card>
                          
                          {evo.evolves_to?.map(finalEvo => (
                            <Box key={finalEvo.species.name} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography>→</Typography>
                              <Card 
                                sx={{ cursor: 'pointer', minWidth: 150 }}
                                onClick={() => {
                                  const id = finalEvo.species.url.split('/').filter(Boolean).pop();
                                  handleEvolutionClick(id);
                                }}
                              >
                                <CardContent>
                                  <Typography variant="body2" textAlign="center" sx={{ textTransform: 'capitalize' }}>
                                    {finalEvo.species.name}
                                  </Typography>
                                </CardContent>
                              </Card>
                            </Box>
                          ))}
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                ) : (
                  <Alert severity="info">
                    No evolution data available for this Pokémon.
                  </Alert>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default PokemonDetailPage; 