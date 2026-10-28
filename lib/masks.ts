/**
 * Utilitários de máscaras brasileiras (CNPJ, CPF, CEP, Telefone, etc.)
 * Implementação pura em TypeScript, sem bibliotecas externas pesadas.
 */

export function onlyDigits(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/\D/g, "");
}

/**
 * Remove qualquer pontuação de documento mantendo caracteres alfanuméricos em maiúsculo.
 * Compatível com CPF (11 dígitos) e novo CNPJ alfanumérico (14 caracteres alfanuméricos).
 */
export function cleanDocument(value: string | null | undefined): string {
  if (!value) return "";
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

/**
 * Aplica máscara de CNPJ (14 caracteres alfanuméricos): XX.XXX.XXX/XXXX-XX
 * Conforme norma da Receita Federal para suporte a CNPJs alfanuméricos.
 */
export function maskCNPJ(value: string): string {
  const chars = cleanDocument(value).slice(0, 14);
  return chars
    .replace(/^([A-Za-z0-9]{2})([A-Za-z0-9])/, "$1.$2")
    .replace(/^([A-Za-z0-9]{2})\.([A-Za-z0-9]{3})([A-Za-z0-9])/, "$1.$2.$3")
    .replace(/\.([A-Za-z0-9]{3})([A-Za-z0-9])/, ".$1/$2")
    .replace(/([A-Za-z0-9]{4})([A-Za-z0-9])/, "$1-$2");
}

/**
 * Aplica máscara de CPF (11 dígitos): 000.000.000-00
 */
export function maskCPF(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

/**
 * Aplica máscara dinâmica para documento (CPF até 11 dígitos, CNPJ até 14 caracteres alfanuméricos).
 */
export function maskDocument(value: string): string {
  const clean = cleanDocument(value);
  // Se contiver letras, trata imediatamente como CNPJ alfanumérico
  if (/[A-Z]/i.test(clean)) {
    return maskCNPJ(clean);
  }
  if (clean.length <= 11) {
    return maskCPF(clean);
  }
  return maskCNPJ(clean);
}

/**
 * Aplica máscara de CEP (8 dígitos): 00000-000
 */
export function maskCEP(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

/**
 * Aplica máscara de telefone fixo ou celular: (00) 0000-0000 ou (00) 00000-0000
 */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

/**
 * Formata código NCM (8 dígitos): 0000.00.00
 */
export function maskNCM(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits
    .replace(/^(\d{4})(\d)/, "$1.$2")
    .replace(/^(\d{4})\.(\d{2})(\d)/, "$1.$2.$3");
}

/**
 * Aplica máscara para números decimais com vírgula como separador decimal.
 * - Permite digitar apenas números e no máximo uma vírgula.
 * - Ao digitar a vírgula (ou ponto), avança para a parte decimal.
 * - Se maxDecimals for especificado, limita a quantidade de casas decimais (ex: 4 para preços).
 */
export function maskDecimal(value: string | null | undefined, maxDecimals?: number): string {
  if (!value) return "";

  // Converte ponto em vírgula para suportar teclados numéricos
  const normalized = value.replace(/\./g, ",");

  // Remove qualquer caractere que não seja dígito ou vírgula
  const cleaned = normalized.replace(/[^\d,]/g, "");

  // Separa pela primeira vírgula encontrada
  const firstCommaIndex = cleaned.indexOf(",");

  if (firstCommaIndex === -1) {
    // Sem vírgula: apenas dígitos na parte inteira
    // Remove zeros à esquerda desnecessários se houver múltiplos dígitos, mas mantém "0"
    if (cleaned.length > 1 && cleaned.startsWith("0")) {
      return cleaned.replace(/^0+/, "") || "0";
    }
    return cleaned;
  }

  // Parte inteira é tudo antes da primeira vírgula
  let integerPart = cleaned.slice(0, firstCommaIndex);
  if (integerPart === "") {
    integerPart = "0";
  } else if (integerPart.length > 1 && integerPart.startsWith("0")) {
    integerPart = integerPart.replace(/^0+/, "") || "0";
  }

  // Parte decimal é tudo após a primeira vírgula, removendo quaisquer outras vírgulas adicionais
  let decimalPart = cleaned.slice(firstCommaIndex + 1).replace(/,/g, "");

  if (typeof maxDecimals === "number" && maxDecimals >= 0) {
    decimalPart = decimalPart.slice(0, maxDecimals);
  }

  return `${integerPart},${decimalPart}`;
}

/**
 * Máscara para preços monetários (custo e venda): apenas números e vírgula, até 4 casas decimais.
 */
export function maskPrice(value: string | null | undefined): string {
  return maskDecimal(value, 4);
}

/**
 * Máscara para quantidade de estoque: apenas números e vírgula, até 3 casas decimais.
 */
export function maskStock(value: string | null | undefined): string {
  return maskDecimal(value, 3);
}

