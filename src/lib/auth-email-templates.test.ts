import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const readTemplate = (name: string) =>
  readFileSync(
    new URL(`../../public/email-templates/${name}`, import.meta.url),
    {
      encoding: 'utf8',
    },
  );

describe('auth email templates', () => {
  for (const filename of ['confirmation.html', 'recovery.html']) {
    it(`${filename} contains a Supabase action link without tracking`, () => {
      const template = readTemplate(filename);

      expect(template).toContain('{{ .ConfirmationURL }}');
      expect(template).toContain('{{ if .Data.name }}');
      expect(template).not.toMatch(/<script|tracking|pixel/i);
      expect(template).not.toMatch(/src=["']https?:/i);
    });
  }
});
