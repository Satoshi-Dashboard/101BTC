/**
 * Cliente Supabase. La anon key solo puede INSERT y ejecutar la RPC
 * `registrar_lead`; el RLS bloquea SELECT/UPDATE/DELETE (ver
 * supabase/migrations/0001_sistema_leads.sql).
 *
 * Si faltan credenciales el cliente queda en null y el flujo cae al respaldo
 * en localStorage sin romper la experiencia.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

let cliente: SupabaseClient | null = null;

export function supabase(): SupabaseClient | null {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  if (!cliente) {
    cliente = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cliente;
}

export const supabaseConfigurado = (): boolean =>
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
