# 🚀 Space Shooter

A classic arcade-style space shooter game built with p5.js and integrated with Puter for cloud-based high score tracking.

## Features

- **Classic Gameplay**: Navigate your spaceship using arrow keys and shoot enemies with the spacebar
- **Progressive Difficulty**: Enemy spawn rate increases as you advance through levels
- **Visual Effects**: Particle explosions, engine glow, and animated background stars
- **Cloud Integration**: Login with Puter to save and track high scores across sessions
- **Responsive Design**: Clean, retro-styled interface with game state management

## How to Play

1. **Movement**: Use the arrow keys to move your spaceship
2. **Shooting**: Press the spacebar to fire bullets at enemies
3. **Objective**: Destroy enemies to earn points and advance levels
4. **Lives**: You start with 3 lives - avoid colliding with enemies!
5. **Scoring**: Earn points based on enemy size, level up every 1000 points

## Getting Started

### Prerequisites

- A modern web browser with JavaScript enabled
- Internet connection (for Puter integration and p5.js library)

### Running the Game

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Click "Start Game" to begin playing
4. Optionally, click "Login to Save High Scores" to track your progress

### Files

- `index.html` - Main game page with UI and styling
- `game.js` - Core game logic, classes, and Puter integration
- `README.md` - This file
- `LICENSE` - MIT license

## Technical Details

### Built With

- **p5.js** - Creative coding library for graphics and game loop
- **Puter** - Cloud platform for user authentication and data storage
- **Vanilla HTML/CSS/JS** - Clean, dependency-minimal approach

### Game Architecture

- **Object-Oriented Design**: Separate classes for Player, Enemy, Bullet, Particle, and Star
- **Game State Management**: Handles start screen, gameplay, and game over states
- **Collision Detection**: Efficient distance-based collision system
- **Particle System**: Dynamic explosion effects with lifecycle management

### Cloud Features

- User authentication via Puter
- Persistent high score storage using Puter's key-value store
- Leaderboard with top 5 scores

## Development

The game follows modern JavaScript practices with:
- ES6 class syntax
- Async/await for cloud operations
- Modular code organization
- Error handling for network operations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Andrew Wooldridge - 2025
