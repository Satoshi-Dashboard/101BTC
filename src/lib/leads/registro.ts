/**
 * Orquestación del registro: RPC -> respaldo local -> WhatsApp.
 * El lead nunca se pierde y el usuario nunca queda atascado.
 */

import { WHATSAPP_NUMERO, componerMensaje } from './config';
import { guardarBackup, guardarPerfil } from './almacenamiento';
import type { DatosLead } from './validacion';
import { normalizarDatos } from './validacion';
import { supabase, supabaseConfigurado } from './supabase';

export interface ResultadoRegistro {
  /** true si Supabase confirmó el guardado. */
  sincronizado: boolean;
  /** true si el correo ya existía: se registró una interacción más. */
  registradoPreviamente: boolean;
  /** Mensaje de error de validación devuelto por la RPC, si aplica. */
  errorValidacion: string | null;
  /**
   * Por qué no se sincronizó. 'sin_config' es un hueco de despliegue (faltan
   * credenciales), no una caída: no se le muestra un error al visitante.
   */
  motivo: 'sin_config' | 'fallo_red' | null;
  /** Datos normalizados tal como se guardaron / enviaron. */
  datos: DatosLead;
}

const ERRORES_VALIDACION_RPC: Record<string, string> = {
  nombre_invalido: 'Escribe tu nombre completo, por favor',
  pais_invalido: 'Selecciona tu país de la lista',
  telefono_invalido: 'Verifica tu número de teléfono',
  correo_invalido: 'Revisa tu correo, algo no cuadra',
  correo_desechable: 'Usa tu correo personal o de trabajo, por favor',
};

/** Detecta si el error de la RPC es de validación de negocio (no de red). */
function errorValidacionDe(mensaje: string): string | null {
  for (const [clave, texto] of Object.entries(ERRORES_VALIDACION_RPC)) {
    if (mensaje.includes(clave)) return texto;
  }
  return null;
}

export async function registrarLead(entrada: DatosLead): Promise<ResultadoRegistro> {
  const datos = normalizarDatos(entrada);
  const sb = supabase();

  if (!sb) {
    // Sin credenciales configuradas: respaldo local y seguir.
    guardarBackup(datos, false);
    guardarPerfil(datos);
    console.warn(
      '[leads] Supabase sin configurar: el lead quedó solo en localStorage. Revisa .env'
    );
    return {
      sincronizado: false,
      registradoPreviamente: false,
      errorValidacion: null,
      motivo: 'sin_config',
      datos,
    };
  }

  try {
    const { data, error } = await sb.rpc('registrar_lead', {
      p_nombre: datos.nombre,
      p_pais: datos.pais,
      p_telefono: datos.telefono,
      p_correo: datos.correo,
      p_cta_origen: datos.cta_origen,
      p_user_agent: navigator.userAgent,
    });

    if (error) {
      const validacion = errorValidacionDe(
        `${error.message ?? ''} ${error.hint ?? ''} ${error.details ?? ''}`
      );
      if (validacion) {
        return {
          sincronizado: false,
          registradoPreviamente: false,
          errorValidacion: validacion,
          motivo: null,
          datos,
        };
      }
      throw error;
    }

    const previo = Boolean(
      (data as { registrado_previamente?: boolean } | null)?.registrado_previamente
    );

    guardarBackup(datos, true);
    guardarPerfil(datos);
    return {
      sincronizado: true,
      registradoPreviamente: previo,
      errorValidacion: null,
      motivo: null,
      datos,
    };
  } catch (error) {
    // Supabase caído o red fallando: el lead queda en localStorage y sigue a WhatsApp.
    guardarBackup(datos, false);
    guardarPerfil(datos);
    console.error('[leads] Fallo al sincronizar con Supabase, guardado local:', error);
    return {
      sincronizado: false,
      registradoPreviamente: false,
      errorValidacion: null,
      motivo: 'fallo_red',
      datos,
    };
  }
}

/** Abre WhatsApp con el mensaje del CTA. Fallback si el navegador bloquea el popup. */
export function irAWhatsapp(datos: DatosLead): void {
  const mensaje = componerMensaje(datos.cta_origen, datos.nombre, datos.pais);
  const url = WHATSAPP_NUMERO
    ? `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMERO}&text=${encodeURIComponent(mensaje)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;

  const ventana = window.open(url, '_blank', 'noopener');
  if (!ventana || ventana.closed || typeof ventana.closed === 'undefined') {
    window.location.href = url;
  }
}
