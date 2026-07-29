/** window.exportarLeads() — descarga el respaldo local en CSV desde la consola. */

import { leerBackup } from './almacenamiento';

function celda(valor: unknown): string {
  const s = String(valor ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function exportarLeads(): void {
  const leads = leerBackup();
  if (leads.length === 0) {
    console.log('No hay leads guardados localmente');
    return;
  }
  const headers = Object.keys(leads[0]);
  const filas = leads.map((l) =>
    headers.map((h) => celda((l as unknown as Record<string, unknown>)[h])).join(',')
  );
  const csv = [headers.join(','), ...filas].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_backup_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  console.log(`Exportados ${leads.length} leads`);
}

declare global {
  interface Window {
    exportarLeads: () => void;
  }
}

export function registrarExportador(): void {
  window.exportarLeads = exportarLeads;
}
