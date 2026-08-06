// Marcas del ecosistema SatoshiDashboard (mismas del footer). Para agregar
// una nueva, solo se suma un objeto con este shape.
export interface EcosistemaItem {
  nombre: string;
  descripcion: string;
  href: string;
  imagen: string;
}

export const ECOSISTEMA: EcosistemaItem[] = [
  {
    nombre: 'SatoshiDashboard',
    descripcion: 'La marca detrás de Bitcoin 101',
    href: 'https://www.satoshidashboard.com/',
    imagen: '/img/coin.png',
  },
  {
    nombre: 'AssetRock',
    descripcion: 'Otro proyecto de la familia SatoshiDashboard',
    href: 'https://www.assetrock.io/',
    imagen: '/img/mountain.png',
  },
  {
    nombre: 'Zatobox',
    descripcion: 'Otro proyecto de la familia SatoshiDashboard',
    href: 'https://www.zatobox.io/',
    imagen: '/img/fondo.jpg',
  },
];
