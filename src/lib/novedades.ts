// Historial de novedades del dashboard. Placeholder frontend — se conecta a
// datos reales (CMS o tabla) después. Nuevas entradas van al inicio del array.
//
// Cada novedad es un mini-artículo: bloques de texto, hipervínculos y video
// opcional. Para agregar una nueva, solo se suma un objeto con este mismo
// shape — la tarjeta y la página de artículo se generan solas.

export type NovedadBlock =
  | { type: 'p'; text: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'video'; src: string; caption?: string };

export interface Novedad {
  slug: string;
  badge: string;
  imagen: string;
  titulo: string;
  subtitulo: string;
  fecha: string;
  cuerpo: NovedadBlock[];
}

export const NOVEDADES: Novedad[] = [
  {
    slug: 'conoce-a-luis-leon',
    badge: 'Instructor',
    imagen: '/img/instructor.png',
    titulo: 'Conoce a Luis Leon',
    subtitulo: 'La historia detrás de Bitcoin 101',
    fecha: '2026-08-06',
    cuerpo: [
      {
        type: 'p',
        text: 'Hace más de 5 años no entendía nada de Bitcoin. Ni siquiera sabía qué era una wallet. Me tomó años de estudio, errores y horas leyendo cosas que nadie me explicaba de forma simple, para finalmente entender cómo funciona el dinero de verdad.',
      },
      {
        type: 'p',
        text: 'Bitcoin 101 es el curso que yo hubiera necesitado cuando empecé. Cada módulo existe porque en algún momento yo mismo me hice esa pregunta y no encontré una respuesta clara.',
      },
      {
        type: 'link',
        text: 'Ver la sección completa del instructor',
        href: '/#instructor',
      },
    ],
  },
  {
    slug: 'comunidad-privada',
    badge: 'Comunidad',
    imagen: '/img/coin.png',
    titulo: 'Únete a la comunidad privada',
    subtitulo: 'Resuelve dudas con otros alumnos',
    fecha: '2026-08-06',
    cuerpo: [
      {
        type: 'p',
        text: 'Todos los planes de Bitcoin 101 incluyen acceso a una comunidad privada de alumnos, pensada para resolver dudas puntuales sobre el contenido sin sentirte solo en el proceso.',
      },
      {
        type: 'p',
        text: 'Ahí compartimos actualizaciones de los módulos, respondemos preguntas frecuentes y avisamos primero cuando sale contenido nuevo.',
      },
      {
        type: 'link',
        text: 'Ver preguntas frecuentes sobre la comunidad',
        href: '/#faq',
      },
    ],
  },
  {
    slug: 'linkedin-luis-leon',
    badge: 'Sígueme',
    imagen: '/img/fondo.jpg',
    titulo: 'LinkedIn de Luis Leon',
    subtitulo: 'Contenido nuevo sobre Bitcoin',
    fecha: '2026-08-06',
    cuerpo: [
      {
        type: 'p',
        text: 'Publico contenido regularmente sobre Bitcoin, dinero y economía — pensado para gente que parte de cero, igual que Bitcoin 101.',
      },
      {
        type: 'link',
        text: 'Seguir a Luis Leon en LinkedIn',
        href: 'https://www.linkedin.com/in/ikhunsa/',
      },
    ],
  },
];
