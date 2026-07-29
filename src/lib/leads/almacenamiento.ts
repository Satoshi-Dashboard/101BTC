/**
 * Respaldo local. Un lead nunca se pierde: si Supabase falla, queda aquí y
 * el usuario sigue su camino a WhatsApp.
 *   lead_email    -> correo del visitante recurrente
 *   lead_perfil   -> datos completos para saltar el modal en visitas futuras
 *   leads_backup  -> historial exportable a CSV
 */

import type { DatosLead } from './validacion';

const K_EMAIL = 'lead_email';
const K_PERFIL = 'lead_perfil';
const K_BACKUP = 'leads_backup';

export interface RegistroBackup extends DatosLead {
  timestamp: string;
  sincronizado: boolean;
}

function disponible(): boolean {
  try {
    const k = '__t';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export function guardarBackup(datos: DatosLead, sincronizado: boolean): void {
  if (!disponible()) return;
  try {
    const previos = leerBackup();
    previos.push({
      ...datos,
      timestamp: new Date().toISOString(),
      sincronizado,
    });
    localStorage.setItem(K_BACKUP, JSON.stringify(previos));
  } catch {
    /* cuota llena: el flujo a WhatsApp no se interrumpe */
  }
}

export function leerBackup(): RegistroBackup[] {
  if (!disponible()) return [];
  try {
    const raw = localStorage.getItem(K_BACKUP);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function guardarPerfil(datos: DatosLead): void {
  if (!disponible()) return;
  try {
    localStorage.setItem(K_EMAIL, datos.correo);
    localStorage.setItem(
      K_PERFIL,
      JSON.stringify({
        nombre: datos.nombre,
        pais: datos.pais,
        telefono: datos.telefono,
        correo: datos.correo,
      })
    );
  } catch {
    /* ignorar */
  }
}

export interface Perfil {
  nombre: string;
  pais: string;
  telefono: string;
  correo: string;
}

export function leerEmail(): string | null {
  if (!disponible()) return null;
  try {
    return localStorage.getItem(K_EMAIL);
  } catch {
    return null;
  }
}

/** Perfil completo o null si falta algún campo (entonces se muestra el modal). */
export function leerPerfil(): Perfil | null {
  if (!disponible()) return null;
  try {
    const raw = localStorage.getItem(K_PERFIL);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Perfil>;
    if (!p?.nombre || !p?.pais || !p?.telefono || !p?.correo) return null;
    return p as Perfil;
  } catch {
    return null;
  }
}
