const average = (values) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;

const deriveWallWidth = (wall, wallHeight) => wallHeight * (wall.widthPx / wall.heightPx);

const withDerivedWidth = (wall, wallHeight) => ({
  ...wall,
  worldWidth: deriveWallWidth(wall, wallHeight),
});

export const mapWallsByShape = (walls, wallHeight) => {
  const derivedWalls = walls.map((wall) => withDerivedWidth(wall, wallHeight));
  const sortedByWidth = [...derivedWalls].sort(
    (left, right) => right.worldWidth - left.worldWidth || left.order - right.order,
  );

  return {
    longWalls: sortedByWidth.slice(0, 2).sort((left, right) => left.order - right.order),
    shortWalls: sortedByWidth.slice(2).sort((left, right) => left.order - right.order),
  };
};

export const inferRoomDimensions = (roomConfig) => {
  const wallsByShape = mapWallsByShape(roomConfig.walls, roomConfig.wallHeight);
  const longWallWidth = average(wallsByShape.longWalls.map((wall) => wall.worldWidth));
  const shortWallWidth = average(wallsByShape.shortWalls.map((wall) => wall.worldWidth));

  return {
    ...roomConfig,
    height: roomConfig.wallHeight,
    longWallWidth,
    shortWallWidth,
    width: longWallWidth,
    depth: shortWallWidth,
    footprintRatio: longWallWidth / shortWallWidth,
    wallsByShape,
    placements: {
      north: wallsByShape.longWalls[0],
      south: wallsByShape.longWalls[1],
      west: wallsByShape.shortWalls[0],
      east: wallsByShape.shortWalls[1],
    },
  };
};

export const createSurfaceSpecs = (room) => [
  {
    id: 'north-wall',
    label: room.placements.north.label,
    textureUrl: room.placements.north.textureUrl,
    size: {
      width: room.width,
      height: room.height,
    },
    position: {
      x: 0,
      y: room.height / 2,
      z: -room.depth / 2,
    },
    rotation: {
      x: 0,
      y: 0,
      z: 0,
    },
  },
  {
    id: 'south-wall',
    label: room.placements.south.label,
    textureUrl: room.placements.south.textureUrl,
    size: {
      width: room.width,
      height: room.height,
    },
    position: {
      x: 0,
      y: room.height / 2,
      z: room.depth / 2,
    },
    rotation: {
      x: 0,
      y: Math.PI,
      z: 0,
    },
  },
  {
    id: 'west-wall',
    label: room.placements.west.label,
    textureUrl: room.placements.west.textureUrl,
    size: {
      width: room.depth,
      height: room.height,
    },
    position: {
      x: -room.width / 2,
      y: room.height / 2,
      z: 0,
    },
    rotation: {
      x: 0,
      y: Math.PI / 2,
      z: 0,
    },
  },
  {
    id: 'east-wall',
    label: room.placements.east.label,
    textureUrl: room.placements.east.textureUrl,
    size: {
      width: room.depth,
      height: room.height,
    },
    position: {
      x: room.width / 2,
      y: room.height / 2,
      z: 0,
    },
    rotation: {
      x: 0,
      y: -Math.PI / 2,
      z: 0,
    },
  },
  {
    id: 'ceiling',
    label: room.ceiling.label,
    textureUrl: room.ceiling.textureUrl,
    size: {
      width: room.width,
      height: room.depth,
    },
    position: {
      x: 0,
      y: room.height,
      z: 0,
    },
    rotation: {
      x: -Math.PI / 2,
      y: 0,
      z: 0,
    },
  },
];
