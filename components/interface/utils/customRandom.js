export function customRandom(random, alphabet, size) {
  const mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1;
  const step = Math.ceil((1.6 * mask * size) / alphabet.length);
  return () => {
    let id = '';
    while (true) {
      const bytes = random(step);
      for (let i = 0; i < step; i++) {
        const byte = bytes[i] & mask;
        if (alphabet[byte]) {
          id += alphabet[byte];
          if (id.length === size) return id;
        }
      }
    }
  };
}