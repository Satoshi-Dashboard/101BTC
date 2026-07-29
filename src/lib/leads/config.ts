/**
 * Configuración del sistema de captura de leads.
 * Las credenciales viven en .env (prefijo PUBLIC_ para que Astro las exponga
 * al bundle del navegador). Nada de credenciales escritas en el HTML.
 */

export const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Solo dígitos: código de país + número. Ver .env */
export const WHATSAPP_NUMERO = (import.meta.env.PUBLIC_WHATSAPP_NUMERO ?? '').replace(/\D/g, '');

export interface Pais {
  nombre: string;
  /** Prefijo telefónico con +. Vacío para "Otro". */
  codigo: string;
}

export const PAISES: Pais[] = [
  { nombre: 'Ecuador', codigo: '+593' },
  { nombre: 'Colombia', codigo: '+57' },
  { nombre: 'Perú', codigo: '+51' },
  { nombre: 'México', codigo: '+52' },
  { nombre: 'Chile', codigo: '+56' },
  { nombre: 'Argentina', codigo: '+54' },
  { nombre: 'Bolivia', codigo: '+591' },
  { nombre: 'Venezuela', codigo: '+58' },
  { nombre: 'Panamá', codigo: '+507' },
  { nombre: 'Costa Rica', codigo: '+506' },
  { nombre: 'República Dominicana', codigo: '+1' },
  { nombre: 'Guatemala', codigo: '+502' },
  { nombre: 'Honduras', codigo: '+504' },
  { nombre: 'El Salvador', codigo: '+503' },
  { nombre: 'Paraguay', codigo: '+595' },
  { nombre: 'Uruguay', codigo: '+598' },
  { nombre: 'España', codigo: '+34' },
  { nombre: 'Estados Unidos', codigo: '+1' },
  { nombre: 'Otro', codigo: '' },
];

/**
 * Mensaje de WhatsApp por CTA. {nombre} y {pais} se sustituyen con los datos
 * del formulario. Tono de la landing: tú, directo, sin promesas de rentabilidad.
 */
export const MENSAJES_CTA: Record<string, string> = {
  quiero_aprender:
    'Hola, soy {nombre} y escribo desde {pais}. Vi la página de 101 BTC y quiero aprender Bitcoin desde cero. ¿Por dónde empiezo?',
  empezar_entender:
    'Hola, soy {nombre} y escribo desde {pais}. Nunca me explicaron cómo funciona el dinero de verdad y quiero empezar a entenderlo. ¿Me orientas con 101 BTC?',
  plan_basico:
    'Hola, soy {nombre} desde {pais}. Me interesa el plan BÁSICO de 101 BTC ($47, pago único). ¿Cómo hago para acceder?',
  plan_completo:
    'Hola, soy {nombre} desde {pais}. Me interesa el plan COMPLETO de 101 BTC ($77, pago único), el que incluye la asesoría mensual. ¿Cuál es el siguiente paso?',
  plan_mentor:
    'Hola, soy {nombre} desde {pais}. Quiero información del plan MENTOR 1 a 1 de 101 BTC ($500). ¿Cómo funciona el acompañamiento durante el año?',
  escribenos:
    'Hola, soy {nombre} desde {pais}. Leí las preguntas frecuentes de 101 BTC y me quedó una duda que quiero resolver antes de empezar.',
  cta_general:
    'Hola, soy {nombre} y escribo desde {pais}. Llegué desde la página de 101 BTC y quiero más información sobre el curso.',
};

export const CTA_FALLBACK = 'cta_general';

export function mensajePara(ctaId: string): string {
  return MENSAJES_CTA[ctaId] ?? MENSAJES_CTA[CTA_FALLBACK];
}

/** Sustituye {nombre} y {pais} en la plantilla del CTA. */
export function componerMensaje(ctaId: string, nombre: string, pais: string): string {
  return mensajePara(ctaId)
    .replaceAll('{nombre}', nombre)
    .replaceAll('{pais}', pais);
}

/** Copy del modal, alineado al tono de la landing. */
export const COPY = {
  titulo: 'Estás a un paso de empezar',
  subtitulo:
    'Déjanos tus datos y seguimos por WhatsApp. Sin compromiso y sin spam.',
  labelNombre: '¿Cómo te llamas?',
  labelPais: '¿Desde dónde nos escribes?',
  labelTelefono: 'Tu número de WhatsApp',
  labelCorreo: 'Tu mejor correo electrónico',
  phNombre: 'Ej: María García',
  phPais: 'Selecciona tu país',
  phTelefono: 'Ej: +593 99 123 4567',
  phCorreo: 'Ej: maria@correo.com',
  boton: 'Continuar por WhatsApp',
  confianza:
    'Tus datos solo se usan para contactarte. Nunca pedimos claves privadas ni frases semilla.',
  exito: 'Listo. Te llevamos a WhatsApp…',
  recurrente: 'Ya te conocemos. Te llevamos directo a WhatsApp.',
} as const;
