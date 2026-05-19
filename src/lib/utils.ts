import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatFCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA'
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

export function getEtatColor(etat: string): string {
  switch (etat) {
    case 'Payer':    return 'bg-emerald-100 text-emerald-700'
    case 'Partiel':  return 'bg-amber-100 text-amber-700'
    case 'Converti': return 'bg-blue-100 text-blue-700'
    default:         return 'bg-red-100 text-red-700'
  }
}

export function getEtatLabel(etat: string): string {
  switch (etat) {
    case 'Payer':     return 'Payée'
    case 'Partiel':   return 'Partielle'
    case 'Non Payer': return 'Impayée'
    case 'Converti':  return 'Convertie'
    default:          return etat
  }
}
