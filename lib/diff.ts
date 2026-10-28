/**
 * Utilitário para calcular diferenças (diff) entre os dados originais e alterados.
 * Garante que requisições PATCH enviem estritamente o que foi modificado pelo usuário.
 */

export function calculateDiff<T extends object>(
  original: T,
  current: T
): Partial<T> {
  const diff: Partial<T> = {};

  const origRecord = (original || {}) as Record<string, unknown>;
  const currRecord = (current || {}) as Record<string, unknown>;

  const allKeys = new Set([
    ...Object.keys(origRecord),
    ...Object.keys(currRecord),
  ]);

  for (const key of allKeys) {
    const origVal = origRecord[key];
    const currVal = currRecord[key];

    // Normaliza undefined e null se ambos representarem ausência
    if (origVal === undefined && currVal === undefined) {
      continue;
    }

    // Se ambos forem arrays
    if (Array.isArray(origVal) && Array.isArray(currVal)) {
      if (JSON.stringify(origVal) !== JSON.stringify(currVal)) {
        (diff as Record<string, unknown>)[key] = currVal;
      }
      continue;
    }

    // Se ambos forem objetos normais (não null)
    if (
      typeof origVal === "object" &&
      origVal !== null &&
      typeof currVal === "object" &&
      currVal !== null
    ) {
      if (JSON.stringify(origVal) !== JSON.stringify(currVal)) {
        (diff as Record<string, unknown>)[key] = currVal;
      }
      continue;
    }

    // Comparação de tipos primitivos
    if (origVal !== currVal) {
      (diff as Record<string, unknown>)[key] = currVal;
    }
  }

  return diff;
}
