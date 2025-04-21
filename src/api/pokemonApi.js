import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

// Create an axios instance
const api = axios.create({
  baseURL: BASE_URL,
});

// Get a list of Pokemon with pagination
export const getPokemonList = async (limit = 20, offset = 0) => {
  const response = await api.get(`/pokemon?limit=${limit}&offset=${offset}`);
  return response.data;
};

// Get details for a specific Pokemon
export const getPokemonDetails = async (nameOrId) => {
  const response = await api.get(`/pokemon/${nameOrId}`);
  return response.data;
};

// Get Pokemon species information
export const getPokemonSpecies = async (nameOrId) => {
  const response = await api.get(`/pokemon-species/${nameOrId}`);
  return response.data;
};

// Get Pokemon evolution chain
export const getPokemonEvolutionChain = async (url) => {
  // The URL is a full URL, so we need to use axios directly
  const response = await axios.get(url);
  return response.data;
};

// Get Pokemon types
export const getPokemonTypes = async () => {
  const response = await api.get('/type');
  return response.data;
};

// Improved search function with caching
let allPokemonCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes cache

export const searchPokemon = async (query) => {
  const now = Date.now();
  
  // Check if we need to refresh the cache
  if (!allPokemonCache || now - lastFetchTime > CACHE_DURATION) {
    const response = await api.get('/pokemon?limit=2000');
    allPokemonCache = response.data.results;
    lastFetchTime = now;
  }
  
  // If query is empty, return first page of results
  if (!query.trim()) {
    return {
      count: allPokemonCache.length,
      results: allPokemonCache.slice(0, 20),
      next: null,
      previous: null
    };
  }
  
  // Normalize the query
  const normalizedQuery = query.toLowerCase().trim();
  
  // Score-based filtering - exact matches first, then starting with, then contains
  const scoredResults = allPokemonCache
    .map(pokemon => {
      const name = pokemon.name.toLowerCase();
      let score = 0;
      
      // Exact match gets highest score
      if (name === normalizedQuery) {
        score = 100;
      }
      // Starting with query gets medium score
      else if (name.startsWith(normalizedQuery)) {
        score = 50;
      }
      // Contains query gets lowest positive score
      else if (name.includes(normalizedQuery)) {
        score = 25;
      }
      
      return { ...pokemon, score };
    })
    .filter(pokemon => pokemon.score > 0)
    .sort((a, b) => b.score - a.score);
  
  return {
    count: scoredResults.length,
    results: scoredResults,
    next: null,
    previous: null
  };
};

// Get Pokemon by type
export const getPokemonByType = async (type) => {
  const response = await api.get(`/type/${type}`);
  
  // Transform the response to match the same format as other Pokemon list responses
  const results = response.data.pokemon.map(entry => entry.pokemon);
  
  return {
    count: results.length,
    results: results,
    next: null,
    previous: null
  };
};

export default {
  getPokemonList,
  getPokemonDetails,
  getPokemonSpecies,
  getPokemonEvolutionChain,
  getPokemonTypes,
  searchPokemon,
  getPokemonByType,
}; 