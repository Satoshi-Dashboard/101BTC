/**
 * Runtime del sistema de leads: intercepta los CTAs, gobierna el modal,
 * llama a la RPC y redirige a WhatsApp.
 */

import { CTA_FALLBACK, COPY, PAISES } from './config';
import { leerPerfil } from './almacenamiento';
import { registrarExportador } from './exportar';
import { irAWhatsapp, registrarLead } from './registro';
import type { DatosLead } from './validacion';
import {
  ERRORES,
  normalizarTelefono,
  validarCorreo,
  validarNombre,
  validarPais,
  validarTelefono,
} from './validacion';

const NOMBRES_PAIS = PAISES.map((p) => p.nombre);
const CODIGOS_PAIS = new Map(PAISES.map((p) => [p.nombre, p.codigo]));

const modal = document.getElementById('lead-modal');
const panel = modal?.querySelector<HTMLElement>('.lead-modal__panel') ?? null;
const form = document.getElementById('lead-form') as HTMLFormElement | null;

const vistaFormulario = modal?.querySelector<HTMLElement>('[data-lead-vista="formulario"]') ?? null;
const vistaSalida = modal?.querySelector<HTMLElement>('[data-lead-vista="salida"]') ?? null;
const salidaTexto = modal?.querySelector<HTMLElement>('[data-lead-salida-texto]') ?? null;

const inputCta = modal?.querySelector<HTMLInputElement>('[data-lead-cta]') ?? null;
const botonEnviar = modal?.querySelector<HTMLButtonElement>('[data-lead-submit]') ?? null;
const spinner = modal?.querySelector<HTMLElement>('[data-lead-spinner]') ?? null;
const etiquetaEnviar = modal?.querySelector<HTMLElement>('[data-lead-submit-label]') ?? null;

registrarExportador();

if (modal && panel && form && inputCta && botonEnviar) {
  const campos = {
    nombre: form.querySelector<HTMLInputElement>('#lead-nombre')!,
    pais: form.querySelector<HTMLSelectElement>('#lead-pais')!,
    telefono: form.querySelector<HTMLInputElement>('#lead-telefono')!,
    correo: form.querySelector<HTMLInputElement>('#lead-correo')!,
  };

  let ultimoFoco: HTMLElement | null = null;
  let enviando = false;
  let cierreProgramado: number | undefined;
  /** Hasta el primer envío, un campo vacío no se marca como error. */
  let intentoEnvio = false;

  // ── Errores ──────────────────────────────────────────────────────────
  const cajaError = (nombre: string) =>
    modal.querySelector<HTMLElement>(`[data-lead-error="${nombre}"]`);

  function mostrarError(nombre: string, mensaje: string | null): void {
    const caja = cajaError(nombre);
    if (caja) {
      caja.textContent = mensaje ?? '';
      caja.classList.toggle('hidden', !mensaje);
    }
    const campo = campos[nombre as keyof typeof campos];
    if (campo) {
      if (mensaje) campo.setAttribute('aria-invalid', 'true');
      else campo.removeAttribute('aria-invalid');
    }
  }

  function limpiarErrores(): void {
    ['nombre', 'pais', 'telefono', 'correo', 'general'].forEach((n) => mostrarError(n, null));
  }

  // ── Bloqueo de scroll sin salto de layout ────────────────────────────
  let overflowPrevio = '';
  let paddingPrevio = '';

  function bloquearScroll(activo: boolean): void {
    const body = document.body;
    if (activo) {
      overflowPrevio = body.style.overflow;
      paddingPrevio = body.style.paddingRight;
      const ancho = window.innerWidth - document.documentElement.clientWidth;
      body.style.overflow = 'hidden';
      if (ancho > 0) body.style.paddingRight = `${ancho}px`;
    } else {
      body.style.overflow = overflowPrevio;
      body.style.paddingRight = paddingPrevio;
    }
  }

  // ── Apertura / cierre ────────────────────────────────────────────────
  function abrir(ctaId: string, modo: 'formulario' | 'salida'): void {
    window.clearTimeout(cierreProgramado);
    ultimoFoco = document.activeElement as HTMLElement | null;
    inputCta.value = ctaId;
    limpiarErrores();
    verSeccion(modo);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    bloquearScroll(true);

    if (modo === 'formulario') {
      // Prellenar con lo que ya se sepa del visitante.
      const perfil = leerPerfil();
      if (perfil) {
        campos.nombre.value ||= perfil.nombre;
        campos.pais.value ||= perfil.pais;
        campos.telefono.value ||= perfil.telefono;
        campos.correo.value ||= perfil.correo;
      }
      window.setTimeout(() => campos.nombre.focus(), 60);
    }
  }

  function cerrar(): void {
    if (enviando) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    bloquearScroll(false);
    ultimoFoco?.focus?.();
  }

  function verSeccion(modo: 'formulario' | 'salida'): void {
    vistaFormulario?.classList.toggle('hidden', modo !== 'formulario');
    vistaSalida?.classList.toggle('hidden', modo !== 'salida');
  }

  function cargando(activo: boolean): void {
    enviando = activo;
    botonEnviar.disabled = activo;
    spinner?.classList.toggle('hidden', !activo);
    if (etiquetaEnviar) etiquetaEnviar.textContent = activo ? 'Guardando…' : COPY.boton;
  }

  // ── Interceptación de CTAs ───────────────────────────────────────────
  // Captura: se adelanta a cualquier handler propio del CTA.
  document.addEventListener(
    'click',
    (evento) => {
      const objetivo = (evento.target as HTMLElement | null)?.closest<HTMLElement>('[data-cta-id]');
      if (!objetivo) return;
      evento.preventDefault();
      evento.stopPropagation();
      manejarCta(objetivo.dataset.ctaId || CTA_FALLBACK);
    },
    true
  );

  async function manejarCta(ctaId: string): Promise<void> {
    const perfil = leerPerfil();

    // Visitante recurrente: sin formulario. Se registra la interacción y se sigue.
    if (perfil) {
      abrir(ctaId, 'salida');
      if (salidaTexto) salidaTexto.textContent = COPY.recurrente;
      const datos: DatosLead = { ...perfil, cta_origen: ctaId };
      await registrarLead(datos);
      irAWhatsapp(datos);
      cierreProgramado = window.setTimeout(cerrar, 900);
      return;
    }

    abrir(ctaId, 'formulario');
  }

  // ── Validación en vivo ───────────────────────────────────────────────
  campos.nombre.addEventListener('blur', () =>
    mostrarError('nombre', validarNombre(campos.nombre.value))
  );
  campos.correo.addEventListener('blur', () =>
    mostrarError('correo', validarCorreo(campos.correo.value))
  );
  campos.telefono.addEventListener('blur', () =>
    mostrarError('telefono', validarTelefono(campos.telefono.value))
  );

  campos.pais.addEventListener('change', () => {
    mostrarError('pais', validarPais(campos.pais.value, NOMBRES_PAIS));
    // Prefijo telefónico del país elegido, si el campo aún está vacío.
    const codigo = CODIGOS_PAIS.get(campos.pais.value) ?? '';
    const actual = campos.telefono.value.trim();
    if (codigo && (actual === '' || /^\+\d{1,4}$/.test(actual))) {
      campos.telefono.value = `${codigo} `;
    }
  });

  campos.telefono.addEventListener('input', () => {
    // Solo dígitos, espacios y un + inicial.
    const v = campos.telefono.value;
    const limpio = (v.startsWith('+') ? '+' : '') + v.replace(/[^\d\s]/g, '');
    if (limpio !== v) campos.telefono.value = limpio;
  });

  // ── Envío ────────────────────────────────────────────────────────────
  form.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (enviando) return;

    const errores: Array<[string, string | null]> = [
      ['nombre', validarNombre(campos.nombre.value)],
      ['pais', validarPais(campos.pais.value, NOMBRES_PAIS)],
      ['telefono', validarTelefono(campos.telefono.value)],
      ['correo', validarCorreo(campos.correo.value)],
    ];
    errores.forEach(([campo, error]) => mostrarError(campo, error));

    const primerFallo = errores.find(([, error]) => error);
    if (primerFallo) {
      campos[primerFallo[0] as keyof typeof campos]?.focus();
      return;
    }

    const datos: DatosLead = {
      nombre: campos.nombre.value.trim().replace(/\s+/g, ' '),
      pais: campos.pais.value,
      telefono: normalizarTelefono(campos.telefono.value),
      correo: campos.correo.value.trim().toLowerCase(),
      cta_origen: inputCta.value || CTA_FALLBACK,
    };

    cargando(true);
    const resultado = await registrarLead(datos);
    cargando(false);

    // Rechazo de validación del backend: el modal sigue abierto para corregir.
    if (resultado.errorValidacion) {
      mostrarError('general', resultado.errorValidacion);
      return;
    }

    if (!resultado.sincronizado) {
      // Supabase no respondió: el lead ya está en localStorage. Se avisa y se sigue.
      mostrarError('general', ERRORES.servidor);
      window.setTimeout(() => {
        verSeccion('salida');
        if (salidaTexto) salidaTexto.textContent = COPY.exito;
        irAWhatsapp(datos);
        cierreProgramado = window.setTimeout(cerrar, 3000);
      }, 1400);
      return;
    }

    verSeccion('salida');
    if (salidaTexto) {
      salidaTexto.textContent = resultado.registradoPreviamente ? COPY.recurrente : COPY.exito;
    }
    irAWhatsapp(datos);
    form.reset();
    cierreProgramado = window.setTimeout(cerrar, 1600);
  });

  // ── Cierre: backdrop, botón X, Escape ────────────────────────────────
  modal.querySelectorAll('[data-lead-close]').forEach((el) =>
    el.addEventListener('click', cerrar)
  );

  document.addEventListener('keydown', (evento) => {
    if (!modal.classList.contains('is-open')) return;

    if (evento.key === 'Escape') {
      evento.stopPropagation();
      cerrar();
      return;
    }

    // Foco atrapado dentro del panel mientras el modal está abierto.
    if (evento.key !== 'Tab') return;
    const focoables = panel.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]'
    );
    const visibles = Array.from(focoables).filter((el) => el.offsetParent !== null);
    if (visibles.length === 0) return;
    const primero = visibles[0];
    const ultimo = visibles[visibles.length - 1];
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });
}
