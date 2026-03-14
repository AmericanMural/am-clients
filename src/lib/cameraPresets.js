const point = (x, y, z) => ({ x, y, z });

export const createHomeView = (room) => ({
  label: 'Home',
  position: point(0, room.height * 0.62, room.depth * 1.18),
  lookAt: point(0, room.height * 0.48, 0),
  up: point(0, 1, 0),
});
