export const BACKLIGHT_SELECTOR = '#backlights > use';

const BACKLIGHT_SEED = 0x5f3759df;
const MIN_DURATION_SECONDS = 3;
const DURATION_RANGE_SECONDS = 2;
const MIN_LOW_OPACITY = 0.25;
const LOW_OPACITY_RANGE = 0.1;

export type BacklightTiming = {
  durationSeconds: number;
  delaySeconds: number;
  lowOpacity: number;
};

const seededUnit = (index: number, salt: number) => {
  let value = (BACKLIGHT_SEED ^ Math.imul(index + 1, salt)) >>> 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 0x1_0000_0000;
};

export const getBacklightTiming = (index: number): BacklightTiming => {
  const durationSeconds =
    MIN_DURATION_SECONDS +
    seededUnit(index, 0x9e3779b1) * DURATION_RANGE_SECONDS;
  const delaySeconds = -seededUnit(index, 0x85ebca6b) * durationSeconds;
  const lowOpacity =
    MIN_LOW_OPACITY + seededUnit(index, 0xc2b2ae35) * LOW_OPACITY_RANGE;

  return { durationSeconds, delaySeconds, lowOpacity };
};

export const applyBacklightTwinkle = (root: SVGSVGElement) => {
  const lights = root.querySelectorAll<SVGUseElement>(BACKLIGHT_SELECTOR);

  lights.forEach((light, index) => {
    const timing = getBacklightTiming(index);
    light.style.setProperty(
      '--backlight-duration',
      `${timing.durationSeconds.toFixed(2)}s`,
    );
    light.style.setProperty(
      '--backlight-delay',
      `${timing.delaySeconds.toFixed(2)}s`,
    );
    light.style.setProperty(
      '--backlight-low-opacity',
      timing.lowOpacity.toFixed(3),
    );
  });

  return () => {
    lights.forEach((light) => {
      light.style.removeProperty('--backlight-duration');
      light.style.removeProperty('--backlight-delay');
      light.style.removeProperty('--backlight-low-opacity');
    });
  };
};
