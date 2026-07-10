import { Volume2, VolumeX } from 'lucide-react';
import type React from 'react';
import type { ViewerVolumePrefs, VolumeEvent } from '#/lib/schemas/sounds';
import { DEFAULT_VIEWER_PREFS, VIEWER_VOLUME_KEY } from '#/lib/schemas/sounds';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useLocalStorage } from '@/hooks/uselocalstorage';

export const useViewerVolumePrefs = () =>
  useLocalStorage(VIEWER_VOLUME_KEY, DEFAULT_VIEWER_PREFS);

export const VolumeControl = ({
  hostSetting,
  prefs,
  onPrefsChange,
  className,
}: {
  hostSetting: VolumeEvent;
  prefs: ViewerVolumePrefs;
  onPrefsChange: React.Dispatch<React.SetStateAction<ViewerVolumePrefs>>;
  className?: string;
}) => {
  const active = prefs.override ? prefs : hostSetting;
  const silent = active.muted || active.volume === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Volume settings"
          className={className}
        >
          {silent ? <VolumeX /> : <Volume2 />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-64 flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Follow host</span>
          <Switch
            checked={!prefs.override}
            onCheckedChange={(checked) =>
              onPrefsChange((current) => ({ ...current, override: !checked }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            disabled={!prefs.override}
            aria-label={active.muted ? 'Unmute' : 'Mute'}
            onClick={() =>
              onPrefsChange((current) => ({
                ...current,
                muted: !current.muted,
              }))
            }
          >
            {active.muted ? <VolumeX /> : <Volume2 />}
          </Button>
          <Slider
            value={[Math.round(active.volume * 100)]}
            min={0}
            max={100}
            step={1}
            disabled={!prefs.override}
            aria-label="Presentation volume"
            onValueChange={(values) => {
              const value = values[0];
              if (value === undefined) return;
              onPrefsChange((current) => ({ ...current, volume: value / 100 }));
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
