const assetUrl = (fileName) =>
  new URL(`../../Groh-FDE1/${fileName}`, import.meta.url).href;

export const grohFde1Room = {
  id: 'groh-fde1',
  name: 'Groh-FDE1',
  wallHeight: 10,
  walls: [
    {
      id: 'wall-1',
      label: 'Stairs Entrance',
      order: 1,
      fileName: 'Groh-FDE1-1.jpg',
      textureUrl: assetUrl('Groh-FDE1-1.jpg'),
      widthPx: 1534,
      heightPx: 868,
    },
    {
      id: 'wall-2',
      label: 'Forest Portal',
      order: 2,
      fileName: 'Groh-FDE1-2.jpg',
      textureUrl: assetUrl('Groh-FDE1-2.jpg'),
      widthPx: 2560,
      heightPx: 841,
    },
    {
      id: 'wall-3',
      label: 'Cubby Wall',
      order: 3,
      fileName: 'Groh-FDE1-3.jpg',
      textureUrl: assetUrl('Groh-FDE1-3.jpg'),
      widthPx: 1534,
      heightPx: 868,
    },
    {
      id: 'wall-4',
      label: 'Lake Panorama',
      order: 4,
      fileName: 'Groh-FDE1-4.jpg',
      textureUrl: assetUrl('Groh-FDE1-4.jpg'),
      widthPx: 2560,
      heightPx: 841,
    },
  ],
  ceiling: {
    id: 'ceiling',
    label: 'Ceiling',
    fileName: 'Groh-FDE1-ceiling.jpg',
    textureUrl: assetUrl('Groh-FDE1-ceiling.jpg'),
    widthPx: 2560,
    heightPx: 1486,
  },
};
