# Mineadventure
## Project Description
Mineadventure is an web-based multiplayer adventure game implemented using Javascript, HTML, CSS, Node.js, Express, And Three.js. The game have multiple levels all randomly generated via Perlin noise, the player can explore the diverse level features freely while combating other players and monsters. The concept of Mineadventure is similar to Risk Of Rain 2, where players can collect combinations of equipment to strength character power. All playable features has already been implement while the project is undergoing alpha testing.

## Author Description
### Mark Qi
- Third year computer engineering student at University Of Toronto
- Responsible for backend development including game features, item features, and etc
- Responsible for frontend development including waiting room UI design, game UI, UX and etc

### Erik Zeng
- Third year computer engineering student at McMaster Univeristy
- Responsible for backend development including game features, map features, and etc
- Responsible for frontend development including game UI, UX and etc

## Tools Used
- Javascript: Implement main game features, designed special data structure for optimization, player controller, generation protocols and etc
- HTML, CSS: Design layout and framework of website combined with CSS for details
- Socket.io: Enable multiple clients and server communication following WebSocket protocol
- Three.js: Enable three dimensional object rendering on our website

## Game Map
- There are theoretically an infinite number of levels for players to explore.
- All maps are generated via a Perlin Noise algorithm that is fully randomized. (No Two Levels Are The Same)
- Three dimensional object are imported via GLTFLoader and rendered via Three.js.
- Some objects were purchased and used with author's authorization for educational purposes.

## Game Features (Item)
- Item framework were implemented using classes in Javascript.
- Each individual item have multiple properties that can either boost or hinder the character's ability.
- Player can have differenet combination of items that will overlap to make character much stronger.
- Item label and three dimensional model were purchased and used with author's authorization for educational purposes.

## Game Features (Projectile)
- Player can freely shoot projectile (Sphere) to harm other players or to kill monsters.
- Projectile can have various properties based on player's equipment.
- Projectile can have different shape and speed based on player's item inventory.

## Game Features (Monster)
- All monster are generated randomly and monster controller will automatically navigate monster to the nearest player with the highest aggro.
- When monster die, it will randomly generate an item for the player to pick.

## Final Conclusion
All players have the freedom to explore the randomly generated three dimensional map and interact with other players either aggressively or friendly. Players can experience different play style by collecting different set of equipment to dominate the game. Overall, it was a great experience programming and designed various features and frameworks for this game together. It was a lot of fun!