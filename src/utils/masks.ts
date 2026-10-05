/**
 * Utilitários de Máscaras e Formatação para Campos do SST Vistoria
 */

export const maskCNPJ = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "").slice(0, 14);
  v = v.replace(/^(\d{2})(\d)/, "$1.$2");
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
  v = v.replace(/(\d{4})(\d)/, "$1-$2");
  return v;
};

export const maskCPF = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "").slice(0, 11);
  v = v.replace(/^(\d{3})(\d)/, "$1.$2");
  v = v.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  v = v.replace(/\.(\d{3})(\d)/, "$1-$2");
  return v;
};

export const maskCEP = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "").slice(0, 8);
  v = v.replace(/^(\d{5})(\d)/, "$1-$2");
  return v;
};

export const maskPhone = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "").slice(0, 11);
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
  } else if (v.length > 0) {
    v = v.replace(/^(\d*)/, "($1");
  }
  return v;
};

export const maskCNAE = (value: string): string => {
  if (!value) return "";
  // Se já vier formatado ou com letras, limpa dígitos até 7 números: ex 2511000 -> 25.11-0-00 ou 2511-0/00
  let v = value.replace(/\D/g, "").slice(0, 7);
  if (v.length > 5) {
    v = v.replace(/^(\d{4})(\d)(\d{1,2})/, "$1-$2/$3");
  } else if (v.length > 4) {
    v = v.replace(/^(\d{4})(\d)/, "$1-$2");
  }
  return v;
};

export const maskDate = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "").slice(0, 8);
  if (v.length > 4) {
    v = v.replace(/^(\d{2})(\d{2})(\d{1,4})/, "$1/$2/$3");
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{1,2})/, "$1/$2");
  }
  return v;
};

export const maskCAS = (value: string): string => {
  if (!value) return "";
  // Formato CAS Registry Number: ex 108-88-3 (até 7 dígitos - 2 dígitos - 1 dígito)
  let v = value.replace(/[^\d-]/g, "");
  const digits = v.replace(/\D/g, "").slice(0, 10);
  if (digits.length > 3) {
    const last1 = digits.slice(-1);
    const mid2 = digits.slice(-3, -1);
    const first = digits.slice(0, -3);
    return `${first}-${mid2}-${last1}`;
  }
  return digits;
};

export const maskONU = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "").slice(0, 4);
  return v ? `ONU ${v}` : "";
};

export const maskCA = (value: string): string => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 6);
};

export const maskInteger = (value: string, maxDigits = 8): string => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, maxDigits);
};

export const maskArea = (value: string): string => {
  if (!value) return "";
  // Permite números e vírgula/ponto para decimais
  let v = value.replace(/[^\d,.]/g, "");
  return v;
};

export const maskHour = (value: string): string => {
  if (!value) return "";
  let v = value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d{1,2})/, "$1:$2");
  }
  return v;
};
