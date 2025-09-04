/**
 * Computa o hash de uma string.
 * @param {string} str - A string a ser hasheada.
 * @returns {number} - O valor do hash resultante.
 */
export function hash(str) {
  let hash = 0, char;

  for (let i = 0; i < str.length; i++) {
    char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Converte para inteiro de 32 bits
  }

  return hash;
}