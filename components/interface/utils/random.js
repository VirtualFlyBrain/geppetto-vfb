// Implement a basic random function that can be used for generating random values
export function random (size) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
}