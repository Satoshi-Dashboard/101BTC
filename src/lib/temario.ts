// Temario completo de Bitcoin 101 (contenido literal, no inventar texto).
// Fuente de verdad única para Temario.astro (landing) y el dashboard
// (mis-clases + páginas de clase individuales).

export interface ClaseRecurso {
  label: string;
  href: string;
}

export interface Clase {
  numero: number;
  titulo: string;
  slug: string;
  /** Opcional: se completa clase por clase cuando exista el contenido real. */
  descripcion?: string;
  recursos?: ClaseRecurso[];
}

export interface Modulo {
  numero: number;
  titulo: string;
  slug: string;
  clases: Clase[];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const RAW_MODULOS: { titulo: string; clases: string[] }[] = [
  {
    titulo: 'Nociones previas sobre el dinero',
    clases: [
      'Llegó el momento de hablar sobre el dinero',
      'Definiendo el dinero',
      'La transacción como unidad básica de la economía',
      'Origen del dinero y el caso de la Isla de Yap',
      'El oro y su función monetaria',
    ],
  },
  {
    titulo: 'Historia del dinero fiduciario',
    clases: [
      'Monedas y manipulaciones: la dilución a lo largo de la historia',
      'El patrón oro y las guerras mundiales',
      '1971: el fin del patrón dólar oro',
      'Inflación: el impuesto invisible',
    ],
  },
  {
    titulo: 'La máquina de la economía',
    clases: [
      'El crédito: la pieza más importante y menos comprendida',
      'Los ciclos de deuda',
      'El desapalancamiento y las cuatro palancas',
    ],
  },
  {
    titulo: 'Nace Bitcoin',
    clases: [
      'Crisis de 2008 y surgimiento de Bitcoin',
      'El problema del dinero digital: el doble gasto',
      'Qué es Bitcoin: una palabra, tres usos',
      'Principios fundamentales de Bitcoin',
    ],
  },
  {
    titulo: 'Cómo funciona Bitcoin por dentro',
    clases: ['Red, nodos y blockchain', 'Minería y prueba de trabajo', 'Transacciones, UTXO y mempool'],
  },
  {
    titulo: 'Wallets, claves y custodia',
    clases: [
      'Una cartera es un gestor de llaves',
      'La frase semilla: respaldo maestro',
      'Custodia vs. autocustodia',
      'Seguridad práctica: simple gana',
    ],
  },
  {
    titulo: 'Amenazas, estafas y errores frecuentes',
    clases: [
      'Formas más comunes de perder bitcoins',
      'Estafas comunes y señales rojas',
      'Reglas de oro y protocolo si algo huele mal',
    ],
  },
  {
    titulo: 'Uso práctico y responsable',
    clases: ['Comprar, recibir y enviar', 'Privacidad: seudónimo, no anónimo', 'Lightning Network: vista rápida'],
  },
  {
    titulo: 'Comparativas, filosofía y pensamiento crítico',
    clases: [
      'Bitcoin vs. Oro y Bitcoin vs. CBDC',
      'El caso moral: Bitcoin y la libertad individual',
      'Riesgos, mitos y pensamiento crítico',
    ],
  },
  {
    titulo: 'Cierre y ruta de aprendizaje',
    clases: ['Tu política personal de Bitcoin y plan de 30 días', 'Recapitulación y recursos para seguir'],
  },
];

let contador = 0;
export const TEMARIO: Modulo[] = RAW_MODULOS.map((m, i) => ({
  numero: i + 1,
  titulo: m.titulo,
  slug: `${i + 1}-${slugify(m.titulo)}`,
  clases: m.clases.map((titulo) => {
    contador += 1;
    return { numero: contador, titulo, slug: `${contador}-${slugify(titulo)}` };
  }),
}));

export const TODAS_LAS_CLASES: Clase[] = TEMARIO.flatMap((m) => m.clases);
