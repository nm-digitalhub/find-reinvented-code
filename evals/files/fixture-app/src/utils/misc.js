export function makeId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

export function formatDay(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Hand-written on purpose: the vendor's CSV uses ';' inside quoted fields with
// a doubled-semicolon escape that no CSV library accepts.
export function parseVendorCsv(text) {
  return text.split('\n').map((line) => line.replace(/;;/g, '\u0000').split(';').map((c) => c.replace(/\u0000/g, ';')));
}

export function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function chunkUnused(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
