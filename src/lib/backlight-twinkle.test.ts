// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  applyBacklightTwinkle,
  BACKLIGHT_SELECTOR,
  getBacklightTiming,
} from './backlight-twinkle';

describe('backlight artwork contract', () => {
  it('contains the semantic master, clip, bed, and independent clones', () => {
    const source = readFileSync(
      join(process.cwd(), 'assets/gameboard.svg'),
      'utf8',
    );
    const document = new DOMParser().parseFromString(source, 'image/svg+xml');

    expect(document.querySelectorAll('#backlight-bed')).toHaveLength(1);
    expect(document.querySelectorAll('#backlight-master')).toHaveLength(1);
    expect(document.querySelectorAll('#backlights-clip')).toHaveLength(1);
    expect(document.querySelectorAll('#backlights')).toHaveLength(1);
    expect(
      document.querySelectorAll(BACKLIGHT_SELECTOR).length,
    ).toBeGreaterThan(100);
  });
});

describe('backlight timing', () => {
  it('is deterministic, varied, and inside the configured ranges', () => {
    const first = getBacklightTiming(0);
    const repeated = getBacklightTiming(0);
    const second = getBacklightTiming(1);

    expect(repeated).toEqual(first);
    expect(second).not.toEqual(first);

    for (let index = 0; index < 200; index += 1) {
      const timing = getBacklightTiming(index);
      expect(timing.durationSeconds).toBeGreaterThanOrEqual(8);
      expect(timing.durationSeconds).toBeLessThan(16);
      expect(timing.delaySeconds).toBeLessThanOrEqual(0);
      expect(timing.delaySeconds).toBeGreaterThan(-16);
      expect(timing.lowOpacity).toBeGreaterThanOrEqual(0.55);
      expect(timing.lowOpacity).toBeLessThan(0.75);
    }
  });

  it('assigns and cleans up per-light CSS variables', () => {
    const root = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.id = 'backlights';
    root.append(group);

    for (let index = 0; index < 2; index += 1) {
      group.append(
        document.createElementNS('http://www.w3.org/2000/svg', 'use'),
      );
    }

    const cleanup = applyBacklightTwinkle(root);
    const lights = root.querySelectorAll<SVGUseElement>(BACKLIGHT_SELECTOR);

    expect(lights[0]?.style.getPropertyValue('--backlight-duration')).toMatch(
      /s$/,
    );
    expect(lights[0]?.style.getPropertyValue('--backlight-duration')).not.toBe(
      lights[1]?.style.getPropertyValue('--backlight-duration'),
    );

    cleanup();
    expect(lights[0]?.style.getPropertyValue('--backlight-duration')).toBe('');
  });
});
