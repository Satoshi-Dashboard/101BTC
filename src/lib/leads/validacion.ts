/** Validación de los campos del modal. Mensajes de error en el tono de la landing. */

export const ERRORES = {
  vacio: 'Este campo es necesario para continuar',
  nombre: 'Escribe tu nombre completo, por favor',
  correoFormato: 'Revisa tu correo, algo no cuadra',
  correoDesechable: 'Usa tu correo personal o de trabajo, por favor',
  telefono: 'Verifica tu número de teléfono',
  pais: 'Selecciona tu país de la lista',
  servidor: 'Algo salió mal de nuestro lado. Intenta de nuevo en unos segundos.',
} as const;

const RE_NOMBRE = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,100}$/;
const RE_CORREO = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const RE_TELEFONO = /^\+\d{8,15}$/;

const DOMINIOS_DESECHABLES = [
  'mailinator.com',
  'tempmail.com',
  'guerrillamail.com',
  'yopmail.com',
  'throwaway.email',
  'fakeinbox.com',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'dispostable.com',
];

/** null = válido; string = mensaje de error a mostrar. */
export function validarNombre(valor: string): string | null {
  const v = valor.trim();
  if (!v) return ERRORES.vacio;
  if (!RE_NOMBRE.test(v)) return ERRORES.nombre;
  return null;
}

export function validarPais(valor: string, permitidos: string[]): string | null {
  const v = valor.trim();
  if (!v) return ERRORES.pais;
  if (!permitidos.includes(v)) return ERRORES.pais;
  return null;
}

/** Acepta espacios y guiones de tipeo; se normaliza antes de validar. */
export function validarTelefono(valor: string): string | null {
  const v = normalizarTelefono(valor);
  if (!v) return ERRORES.vacio;
  if (!RE_TELEFONO.test(v)) return ERRORES.telefono;
  return null;
}

export function normalizarTelefono(valor: string): string {
  const limpio = valor.replace(/[\s\-().]/g, '');
  // Solo un + y solo al inicio.
  const masInicial = limpio.startsWith('+') ? '+' : '';
  return masInicial + limpio.replace(/\+/g, '');
}

export function validarCorreo(valor: string): string | null {
  const v = valor.trim().toLowerCase();
  if (!v) return ERRORES.vacio;
  if (!RE_CORREO.test(v)) return ERRORES.correoFormato;
  const dominio = v.split('@')[1] ?? '';
  if (DOMINIOS_DESECHABLES.includes(dominio)) return ERRORES.correoDesechable;
  return null;
}

export interface DatosLead {
  nombre: string;
  pais: string;
  telefono: string;
  correo: string;
  cta_origen: string;
}

/** Normaliza tal como se enviará a la RPC. */
export function normalizarDatos(d: DatosLead): DatosLead {
  return {
    nombre: d.nombre.trim().replace(/\s+/g, ' '),
    pais: d.pais.trim(),
    telefono: normalizarTelefono(d.telefono),
    correo: d.correo.trim().toLowerCase(),
    cta_origen: d.cta_origen.trim() || 'cta_general',
  };
}
