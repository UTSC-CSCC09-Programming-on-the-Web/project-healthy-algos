# Pathfinding System Documentation

The Pathfinding System provides intelligent navigation capabilities for AI agents in the game world. It can locate objects, calculate paths, and generate movement sequences.

## Features

- **Object Detection**: Find the nearest object of any type (trees, rocks, houses, plants)
- **Coordinate Calculation**: Returns target coordinates with slight horizontal offset for natural movement
- **Path Planning**: Generates simple movement directions to reach targets
- **Radius Search**: Find all objects within a specified distance
- **Subtype Filtering**: Filter objects by specific subtypes (e.g., "oak" trees, "rock_1" rocks)
- **Statistics**: Get counts and types of all world objects

## Usage

### Basic Object Finding

```javascript
// Import the pathfinding system
import { pathfindingSystem } from '../systems/PathfindingSystem';

// Find the nearest tree
const currentPosition = { x: 1000, y: 1000 };
const result = pathfindingSystem.findNearestObject('tree', currentPosition);

if (result) {
  console.log('Found tree at:', result.coordinates);
  console.log('Distance:', result.distance);
  console.log('Tree type:', result.subType);
}
```

### AI Agent Integration

The `AIAgent` class includes built-in pathfinding methods:

```javascript
// In an AI Agent
const pathResult = this.findNearestObject('rock', 'rock_1');
if (pathResult) {
  console.log(`Found ${pathResult.subType} at distance ${pathResult.distance}`);
  console.log(`Directions: ${pathResult.directions.join(' -> ')}`);
}

// Create movement sequence to reach an object
const sequence = this.createMovementSequenceToObject('house', null, 15);
if (sequence) {
  this.currentSequence = sequence; // Start moving towards house
}
```

### Supported Object Types

| Object Type | Subtypes | Description |
|-------------|----------|-------------|
| `tree` | `oak`, `pine` | Trees in the world |
| `rock` | `rock_1`, `rock_2`, `rock_3`, `rock_4` | Rock formations |
| `house` | `house_1`, `house_2` | Buildings |
| `plant` | `radish_04`, `pumpkin_04`, `sunflower_04`, `cauliflower_04` | Crops and plants |

### Advanced Usage

#### Finding Objects in Radius
```javascript
// Find all trees within 200 units
const nearbyTrees = this.findObjectsNearby('tree', 200);
console.log(`Found ${nearbyTrees.length} trees nearby`);

// Find only oak trees within 300 units
const oakTrees = this.findObjectsNearby('tree', 300, 'oak');
```

#### World Statistics
```javascript
const stats = pathfindingSystem.getWorldObjectStats();
console.log('World contains:');
console.log(`  ${stats.trees.total} trees (${stats.trees.oak} oak, ${stats.trees.pine} pine)`);
console.log(`  ${stats.rocks.total} rocks`);
console.log(`  ${stats.houses.total} houses`);
console.log(`  ${stats.plants.total} plants`);
```

#### Custom Path Calculation
```javascript
// Calculate directions between two points
const from = { x: 1000, y: 1000 };
const to = { x: 1200, y: 800 };
const directions = this.calculatePathToTarget(from, to);
console.log('Path:', directions.join(' -> ')); // e.g., "right right up up"
```

## API Reference

### PathfindingSystem Class

#### `findNearestObject(objectType, fromPosition, subType = null)`
Finds the nearest object of the specified type.

**Parameters:**
- `objectType` (string): Type of object ('tree', 'rock', 'house', 'plant')
- `fromPosition` (Object): Starting position `{x, y}`
- `subType` (string, optional): Specific subtype to filter by

**Returns:**
- Object with `coordinates`, `distance`, `objectType`, `subType`, and `object` properties
- `null` if no object found

#### `findObjectsInRadius(objectType, fromPosition, radius, subType = null)`
Finds all objects of the specified type within a radius.

**Parameters:**
- `objectType` (string): Type of object to find
- `fromPosition` (Object): Center position `{x, y}`
- `radius` (number): Search radius in pixels
- `subType` (string, optional): Specific subtype to filter by

**Returns:**
- Array of objects sorted by distance

#### `getWorldObjectStats()`
Returns statistics about all objects in the world.

**Returns:**
- Object containing counts and types for all object categories

### AIAgent Pathfinding Methods

#### `findNearestObject(objectType, subType = null)`
Finds the nearest object from the agent's current position.

**Returns:**
- Object with target info, directions array, and estimated travel time

#### `createMovementSequenceToObject(objectType, subType = null, duration = 10)`
Creates a movement sequence to reach a specific object type.

**Parameters:**
- `objectType` (string): Type of object to navigate to
- `subType` (string, optional): Specific subtype
- `duration` (number): Movement duration in seconds

**Returns:**
- Array containing movement action, or `null` if no object found

#### `testPathfinding()`
Runs a comprehensive test of pathfinding capabilities and logs results to console.

## Integration with AI Worker

The pathfinding system can be used by the AI worker to make intelligent movement decisions:

```javascript
// Example AI decision that uses pathfinding
{
  "action": "navigate_to_object",
  "objectType": "tree",
  "subType": "oak",
  "duration": 12
}
```

When the AI agent receives this decision, it will automatically:
1. Find the nearest oak tree
2. Calculate a path to reach it
3. Create a movement sequence
4. Execute the movement

## Coordinate System

- **Target Coordinates**: The system returns coordinates slightly offset from the object center
- **Horizontal Offset**: Random offset of 40-60 pixels to avoid exact center positioning
- **Vertical Alignment**: Y-coordinate matches the object center for natural interaction
- **Scale Aware**: All calculations respect the game's scale settings

## Testing

To test the pathfinding system:

1. **Console Testing**: The system is available globally as `window.pathfindingSystem`
2. **Agent Testing**: Any AI agent can call `testPathfinding()` to run diagnostics
3. **Automatic Testing**: The first agent runs pathfinding tests 2 seconds after world load

### Example Console Commands

Open browser console and try:
```javascript
// Get world stats
window.pathfindingSystem.getWorldObjectStats()

// Find nearest tree from center of map
window.pathfindingSystem.findNearestObject('tree', {x: 1000, y: 1000})

// Find all rocks within 500 units of player
window.pathfindingSystem.findObjectsInRadius('rock', {x: 1000, y: 1000}, 500)
```

## Performance Considerations

- **Object Caching**: World objects are cached for fast lookups
- **Simple Pathfinding**: Uses basic direction calculation for performance
- **Distance Optimization**: Uses squared distance where possible
- **Memory Efficient**: Stores only references to game objects

## Future Enhancements

Potential improvements to consider:
- **A* Pathfinding**: More sophisticated pathfinding around obstacles
- **Dynamic Objects**: Support for moving or destructible objects
- **Path Smoothing**: Curved paths instead of cardinal directions
- **Collision Avoidance**: Path planning that avoids other agents
- **Waypoint System**: Complex multi-step navigation routes
