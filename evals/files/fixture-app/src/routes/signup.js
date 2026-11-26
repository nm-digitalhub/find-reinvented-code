import { z } from 'zod';
import { makeId, copy, formatDay, capitalize, isEmail, parseVendorCsv } from '../utils/misc.js';
import { toSlug, verifySignature } from '../utils/text.js';

const Name = z.string().min(1);

export function signup(body, raw, sig) {
  if (!verifySignature(raw, process.env.HOOK_SECRET, sig)) throw new Error('bad signature');
  if (!isEmail(body.email)) throw new Error('bad email');
  const user = copy(body);
  user.id = makeId();
  user.name = capitalize(Name.parse(body.name));
  user.slug = toSlug(body.name);
  user.joined = formatDay(new Date());
  user.rows = parseVendorCsv(body.csv ?? '');
  return user;
}
