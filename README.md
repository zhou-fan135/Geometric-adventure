# 2D Platformer Game

## Overview
This project is a 2D platformer game built using object-oriented programming principles. The game features multiple levels, each defined in separate files, and includes various game entities such as platforms, enemies, and the player character.

## Project Structure
```
2d-platformer-game
├── src
│   ├── css
│   │   └── styles.css
│   ├── js
│   │   ├── gameObjects.js
│   │   ├── main.js
│   │   └── phases
│   │       ├── phase1.js
│   │       └── phase2.js
├── index.html
└── README.md
```

## File Descriptions

- **src/css/styles.css**: Contains styles for the game, including layout, colors, and animations for UI elements.

- **src/js/gameObjects.js**: Defines classes and methods for game entities such as `Platform`, `Enemy`, and `Player`. Each class includes properties and methods relevant to their behavior and interactions.

- **src/js/main.js**: Manages the main menu and level selection functionality. It creates the initial screen with a play button and handles transitions to the level selection menu, dynamically generating buttons for each available level.

- **src/js/phases/phase1.js**: Defines the first level of the game, importing necessary classes from `gameObjects.js` and setting up specific entities and layout for phase 1.

- **src/js/phases/phase2.js**: Similar to `phase1.js`, this file defines the second level of the game with its own unique setup and entities.

- **index.html**: The entry point for the game, including references to the CSS and JavaScript files and setting up the initial HTML structure for the game interface.

## Setup Instructions
1. Clone the repository to your local machine.
2. Open `index.html` in a web browser to start the game.
3. Use the play button to access the level selection menu.

## Game Mechanics
- Players can navigate through different levels by selecting them from the level selection menu.
- Each level features unique challenges and enemies, providing a varied gameplay experience.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.