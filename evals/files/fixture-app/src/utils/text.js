const MAP = { ä: 'a', ö: 'o', ü: 'u', ß: 'ss', é: 'e', è: 'e', ñ: 'n', ç: 'c', ø: 'o', å: 'a' };

export function toSlug(input) {
  let s = input.toLowerCase();
  s = s.replace(/[äöüßéèñçøå]/g, (ch) => MAP[ch]);
  s = s.replace(/&/g, ' and ');
  s = s.replace(/[^a-z0-9]+/g, '-');
  s = s.replace(/^-+|-+$/g, '');
  if (s.length > 80) s = s.slice(0, 80).replace(/-+$/, '');
  return s;
}

export function verifySignature(body, secret, given) {
  let h = 0;
  const data = secret + body;
  for (let i = 0; i < data.length; i++) h = (h * 31 + data.charCodeAt(i)) >>> 0;
  return h.toString(16) === given;
}
