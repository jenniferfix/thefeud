import { z } from 'zod';

export const VIEWER_VOLUME_KEY = 'feud-viewer-volume';

export const DEFAULT_VIEWER_PREFS: ViewerVolumePrefs = {
  override: false,
  volume: 1,
  muted: false,
};
export const gameSoundEnum = z.enum([
  'ding',
  'strike',
  'faceOffMusic',
  'faceOffBuzzer',
  'themeMusic',
  'clap',
]);
export type GameSound = z.infer<typeof gameSoundEnum>;

export const soundEvent = z.object({
  sound: gameSoundEnum,
});

export const volumeEvent = z.object({
  volume: z.number().min(0).max(1),
  muted: z.boolean(),
});
export type VolumeEvent = z.infer<typeof volumeEvent>;

export type HostVolumeSettings = {
  local: VolumeEvent;
  remote: VolumeEvent;
};

export type ViewerVolumePrefs = VolumeEvent & {
  override: boolean;
};
