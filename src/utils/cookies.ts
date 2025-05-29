/**
 * Définit un cookie
 * @param name Nom du cookie
 * @param value Valeur du cookie
 * @param days Durée de validité en jours (si négatif, supprime le cookie)
 */
export function setCookie(name: string, value: string, days?: number): void {
  // Don't try to set cookies during SSR
  if (typeof window === "undefined") return;

  let expires = "";

  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Strict`;
}

/**
 * Récupère la valeur d'un cookie
 * @param name Nom du cookie
 * @returns La valeur du cookie ou null s'il n'existe pas
 */
export function getCookie(name: string): string | null {
  // Don't try to get cookies during SSR
  if (typeof window === "undefined") return null;

  const nameEQ = `${name}=`;
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }

  return null;
}

/**
 * Supprime un cookie
 * @param name Nom du cookie
 */
export function deleteCookie(name: string): void {
  setCookie(name, "", -1);
}
