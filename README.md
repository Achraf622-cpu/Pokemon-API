# Pokédex Application

A modern Pokédex application built with React, React Query, and Material UI that consumes the PokéAPI to display information about Pokémon.

## Features

- **Browse Pokémon**: View a paginated list of all Pokémon
- **Search**: Search for Pokémon by name
- **Filter by Type**: Filter Pokémon by their type
- **Detailed Information**: View detailed information for each Pokémon including:
  - Stats
  - Types
  - Abilities
  - Physical characteristics
  - Evolution chain
- **Responsive Design**: Works on desktop, tablet, and mobile

## Technologies Used

- **React**: Frontend library for building user interfaces
- **React Query**: Data fetching, caching, and state management
- **React Router**: Navigation and routing
- **Material UI**: Component library for a modern UI
- **Axios**: HTTP client for API requests
- **Vite**: Build tool for fast development

## API

This application uses the [PokéAPI](https://pokeapi.co/) - a RESTful API for Pokémon data.

## Getting Started

### Prerequisites

- Node.js (version 14.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pokemon-api.git
   cd pokemon-api
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and visit `http://localhost:5173`

## Project Structure

```
pokemon-api/
├── public/               # Static assets
├── src/
│   ├── api/              # API service functions
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Project dependencies and scripts
└── vite.config.js        # Vite configuration
```

## Usage

- **Home Page**: Browse all Pokémon with pagination
- **Search**: Use the search bar to find Pokémon by name
- **Type Filter**: Filter Pokémon by selecting a type from the dropdown
- **Pokémon Details**: Click on a Pokémon card to view detailed information
- **Navigation**: Use the navbar to navigate between pages

## License

This project is for educational purposes only. Pokémon and Pokémon character names are trademarks of Nintendo.

## Acknowledgements

- [PokéAPI](https://pokeapi.co/) for providing the data
- [Material UI](https://mui.com/) for the UI components
- [React Query](https://tanstack.com/query/latest) for data fetching and state management