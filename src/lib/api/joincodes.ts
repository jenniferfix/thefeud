import crypto from 'node:crypto';
import { JOIN_CODE_ALPHABET, JOIN_CODE_LENGTH } from '../schemas/joincode';

export function normalizeJoinCode(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, '');
}

export function generateJoinCode() {
  let code = '';
  for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
    const idx = crypto.randomInt(0, JOIN_CODE_ALPHABET.length);
    code += JOIN_CODE_ALPHABET[idx];
  }
  return code;
}
