import { random } from './random';
import { customRandom } from './customRandom';

/**
 * Low-level function to change alphabet and ID size.
 *
 * Alphabet must contain 256 symbols or less. Otherwise, the generator
 * will not be secure.
 *
 * @param {string} alphabet The alphabet that will be used to generate IDs.
 * @param {number} size The size(length) of the IDs that will be generated.
 *
 * @returns A unique ID based on the alphabet provided.
 */
export function customAlphabet(alphabet, size) {
  return customRandom(random, alphabet, size);
}
