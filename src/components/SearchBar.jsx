import { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Paper, 
  Box, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel,
  alpha,
  useTheme,
  Zoom
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';

const SearchBar = ({ onSearch, types = [], selectedType, onTypeChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const theme = useTheme();

  // Debounce search term to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Trigger search when debounced term changes
  useEffect(() => {
    onSearch(debouncedTerm);
  }, [debouncedTerm, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <Zoom in={true} timeout={500}>
      <Paper 
        component="form" 
        onSubmit={handleSubmit} 
        elevation={4} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center', 
          gap: 2, 
          width: '100%', 
          mb: 4,
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: '70%' } }}>
          <CatchingPokemonIcon 
            color="primary" 
            sx={{ 
              fontSize: 28, 
              animation: 'pulse 2s infinite ease-in-out',
              '@keyframes pulse': {
                '0%': { opacity: 0.7, transform: 'scale(1)' },
                '50%': { opacity: 1, transform: 'scale(1.1)' },
                '100%': { opacity: 0.7, transform: 'scale(1)' }
              }
            }} 
          />
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search Pokémon by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClear} edge="end" size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                transition: 'all 0.3s',
                '&:hover': {
                  bgcolor: theme.palette.background.paper,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2
                }
              }
            }}
            size="medium"
            autoComplete="off"
          />
        </Box>

        {types.length > 0 && (
          <Box sx={{ width: { xs: '100%', sm: '30%' } }}>
            <FormControl fullWidth size="medium">
              <InputLabel id="type-select-label" sx={{ fontWeight: 500 }}>Type</InputLabel>
              <Select
                labelId="type-select-label"
                id="type-select"
                value={selectedType}
                label="Type"
                onChange={(e) => onTypeChange(e.target.value)}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  transition: 'all 0.3s',
                  '&:hover': {
                    bgcolor: theme.palette.background.paper,
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2
                  },
                  '.MuiSelect-select': {
                    display: 'flex',
                    alignItems: 'center',
                  }
                }}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selected ? (
                      <Box 
                        sx={{ 
                          width: 16, 
                          height: 16, 
                          borderRadius: '50%', 
                          bgcolor: theme.palette.pokemonTypes[selected] || theme.palette.grey[400],
                          flexShrink: 0
                        }} 
                      />
                    ) : null}
                    <Box sx={{ textTransform: 'capitalize' }}>
                      {selected || 'All Types'}
                    </Box>
                  </Box>
                )}
              >
                <MenuItem value="">All Types</MenuItem>
                {types.map((type) => (
                  <MenuItem 
                    key={type.name} 
                    value={type.name} 
                    sx={{ 
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Box 
                      sx={{ 
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: theme.palette.pokemonTypes[type.name] || theme.palette.grey[400] 
                      }} 
                    />
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Paper>
    </Zoom>
  );
};

export default SearchBar; 