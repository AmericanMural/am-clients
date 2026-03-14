import { describe, expect, it } from 'vitest';

import { grohFde1Room } from '../config/grohFde1.js';
import { createHomeView } from '../lib/cameraPresets.js';
import {
  createSurfaceSpecs,
  inferRoomDimensions,
  mapWallsByShape,
} from '../lib/roomGeometry.js';

describe('inferRoomDimensions', () => {
  it('derives long and short wall widths from the mural image ratios', () => {
    const room = inferRoomDimensions(grohFde1Room);

    expect(room.height).toBe(10);
    expect(room.longWallWidth).toBeCloseTo(30.44, 2);
    expect(room.shortWallWidth).toBeCloseTo(17.67, 2);
  });

  it('matches the ceiling footprint ratio within a tight tolerance', () => {
    const room = inferRoomDimensions(grohFde1Room);

    expect(room.longWallWidth / room.shortWallWidth).toBeCloseTo(
      room.ceiling.widthPx / room.ceiling.heightPx,
      3,
    );
  });
});

describe('mapWallsByShape', () => {
  it('classifies the mural elevations into long and short wall pairs', () => {
    const mapped = mapWallsByShape(grohFde1Room.walls, grohFde1Room.wallHeight);

    expect(mapped.longWalls.map((wall) => wall.id)).toEqual(['wall-2', 'wall-4']);
    expect(mapped.shortWalls.map((wall) => wall.id)).toEqual(['wall-1', 'wall-3']);
  });
});

describe('createHomeView', () => {
  it('returns a wide home camera view aimed at the room center', () => {
    const room = inferRoomDimensions(grohFde1Room);
    const homeView = createHomeView(room);

    expect(homeView.label).toBe('Home');
    expect(homeView.position.z).toBeGreaterThan(room.depth * 0.5);
    expect(homeView.position.y).toBeGreaterThan(room.height * 0.5);
    expect(homeView.lookAt).toEqual({
      x: 0,
      y: room.height * 0.48,
      z: 0,
    });
  });
});

describe('createSurfaceSpecs', () => {
  it('creates five mural surfaces with the inferred room footprint', () => {
    const room = inferRoomDimensions(grohFde1Room);
    const surfaces = createSurfaceSpecs(room);
    const northWall = surfaces.find((surface) => surface.id === 'north-wall');
    const westWall = surfaces.find((surface) => surface.id === 'west-wall');
    const ceiling = surfaces.find((surface) => surface.id === 'ceiling');

    expect(surfaces).toHaveLength(5);
    expect(northWall.size.width).toBeCloseTo(room.width, 3);
    expect(westWall.size.width).toBeCloseTo(room.depth, 3);
    expect(ceiling.size.width).toBeCloseTo(room.width, 3);
    expect(ceiling.size.height).toBeCloseTo(room.depth, 3);
    expect(ceiling.position.y).toBe(room.height);
  });
});
