import { useState } from 'react';
import { 
  Typography, 
  Box, 
  Pagination, 
  CircularProgress, 
  Alert, 
  Container, 
  Paper, 
  Fade
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import PokemonCard from '../components/PokemonCard';
import SearchBar from '../components/SearchBar';
import { getPokemonList, getPokemonTypes, searchPokemon, getPokemonByType } from '../api/pokemonApi';

const HomePage = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const limit = 20;
  const offset = (page - 1) * limit;
  
  // Fetch Pokemon types
  const typesQuery = useQuery({
    queryKey: ['pokemonTypes'],
    queryFn: () => getPokemonTypes(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  // Fetch Pokemon list based on search, type filter, or paginated list
  const pokemonQuery = useQuery({
    queryKey: ['pokemonList', offset, limit, searchQuery, selectedType],
    queryFn: async () => {
      if (searchQuery) {
        return searchPokemon(searchQuery);
      }
      
      if (selectedType) {
        return getPokemonByType(selectedType);
      }
      
      return getPokemonList(limit, offset);
    },
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
  
  const handleSearch = (query) => {
    setSearchQuery(query);
    setPage(1);
    setSelectedType('');
  };
  
  const handleTypeChange = (type) => {
    setSelectedType(type);
    setSearchQuery('');
    setPage(1);
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Calculate total pages for pagination
  const totalPages = Math.ceil((pokemonQuery.data?.count || 0) / limit);
  
  // Format the Pokemon data based on query type
  const pokemonData = pokemonQuery.data?.results || [];
  
  return (
    <Container maxWidth="xl" sx={{ position: 'relative' }}>
      {/* Decorative elements */}
      <Box 
        sx={{ 
          position: 'absolute', 
          top: -60, 
          right: '5%',
          width: 200, 
          height: 200, 
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(40px)',
          zIndex: -1
        }} 
      />
      <Box 
        sx={{ 
          position: 'absolute', 
          bottom: '15%', 
          left: '-5%',
          width: 300, 
          height: 300, 
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,76,202,0.15) 0%, rgba(59,76,202,0) 70%)',
          filter: 'blur(50px)',
          zIndex: -1
        }} 
      />
      
      <Fade in={true} timeout={800}>
        <Box sx={{ py: 5 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 800, 
              textAlign: 'center',
              mb: 1,
              background: 'linear-gradient(45deg, #E53935 30%, #3B4CCA 90%)',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              textShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          >
            Pokédex
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            paragraph 
            align="center"
            sx={{ 
              maxWidth: 600, 
              mx: 'auto', 
              mb: 4,
              fontWeight: 400
            }}
          >
            Search for Pokémon by name or filter by type using the options below.
          </Typography>
          
          <SearchBar 
            onSearch={handleSearch} 
            types={typesQuery.data?.results || []}
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
          />
          
          {pokemonQuery.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress 
                size={60} 
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
            </Box>
          ) : pokemonQuery.isError ? (
            <Alert 
              severity="error" 
              variant="filled"
              sx={{ 
                mt: 2,
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
              }}
            >
              Error loading Pokémon: {pokemonQuery.error.message}
            </Alert>
          ) : (
            <>
              {pokemonData.length === 0 ? (
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    mt: 2,
                    textAlign: 'center',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                    No Pokémon Found
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Try a different search term or filter.
                  </Typography>
                </Paper>
              ) : (
                <Box className="pokemon-grid">
                  {pokemonData.map((pokemon) => (
                    <PokemonCard key={pokemon.name} pokemon={pokemon} />
                  ))}
                </Box>
              )}
              
              {!searchQuery && !selectedType && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 3 }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handleChangePage} 
                    color="primary" 
                    size="large"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        borderRadius: 2,
                        fontWeight: 600,
                        mx: 0.5
                      },
                      '& .Mui-selected': {
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                      }
                    }}
                  />
                </Box>
              )}
              
              {/* Show count of search results when searching */}
              {searchQuery && pokemonData.length > 0 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Paper
                    sx={{
                      display: 'inline-block',
                      px: 3,
                      py: 1.5,
                      borderRadius: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      background: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Found <strong>{pokemonData.length}</strong> Pokémon matching "<span style={{ fontStyle: 'italic' }}>{searchQuery}</span>"
                    </Typography>
                  </Paper>
                </Box>
              )}
              
              {/* Show count of type filtered results */}
              {selectedType && pokemonData.length > 0 && (
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Paper
                    sx={{
                      display: 'inline-block',
                      px: 3,
                      py: 1.5,
                      borderRadius: 6,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      background: 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Found <strong>{pokemonData.length}</strong> Pokémon of type "<span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{selectedType}</span>"
                    </Typography>
                  </Paper>
                </Box>
              )}
            </>
          )}
        </Box>
      </Fade>
    </Container>
  );
};

export default HomePage; 