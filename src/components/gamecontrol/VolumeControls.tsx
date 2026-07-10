import { Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import type { HostVolumeSettings, VolumeEvent } from '#/lib/schemas/sounds';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Toggle } from '@/components/ui/toggle';
import { useLocalStorage } from '@/hooks/uselocalstorage';
import { useSupabase } from '@/hooks/useSupabase';

const HOST_VOLUME_KEY = 'feud-host-volume';

const DEFAULT_HOST_VOLUME: HostVolumeSettings = {
  local: { volume: 1, muted: false },
  remote: { volume: 1, muted: false },
};

export const useHostVolume = () =>
  useLocalStorage(HOST_VOLUME_KEY, DEFAULT_HOST_VOLUME);

export const useSendRemoteVolume = (gameInstanceId: string) => {
  const supabase = useSupabase();

  return React.useCallback(
    async (setting: VolumeEvent) => {
      // channel() reuses the GameControl provider's subscribed channel for
      // this topic, so don't remove it here — that would tear down the host
      // page's live subscription.
      const channel = supabase.channel(gameInstanceId, {
        config: { private: true },
      });
      await channel.httpSend('volume', setting);
    },
    [gameInstanceId, supabase],
  );
};

// Broadcasts are ephemeral, so a presentation only hears settings sent while
// it is subscribed. Re-sending the stored remote setting when the host page
// mounts covers presentations opened before the host page.
export const useBroadcastRemoteVolumeOnMount = (gameInstanceId: string) => {
  const sendRemoteVolume = useSendRemoteVolume(gameInstanceId);
  const [settings] = useHostVolume();
  const remoteRef = React.useRef(settings.remote);

  React.useEffect(() => {
    remoteRef.current = settings.remote;
  }, [settings.remote]);

  React.useEffect(() => {
    void sendRemoteVolume(remoteRef.current);
  }, [sendRemoteVolume]);
};

export const VolumeControl = ({
  label,
  setting,
  onChange,
  onCommit,
}: {
  label: string;
  setting: VolumeEvent;
  onChange: (setting: VolumeEvent) => void;
  onCommit?: (setting: VolumeEvent) => void;
}) => {
  const handleMuteToggle = () => {
    const next = { ...setting, muted: !setting.muted };
    onChange(next);
    onCommit?.(next);
  };

  const toSetting = (values: number[]): VolumeEvent | null => {
    const value = values[0];
    return value === undefined ? null : { ...setting, volume: value / 100 };
  };

  return (
    <div className="flex items-center gap-2 grow">
      <span className="w-24 shrink-0 text-sm">{label}</span>
      <Toggle
        pressed={setting.muted}
        variant="default"
        size="default"
        aria-label={setting.muted ? `Unmute ${label}` : `Mute ${label}`}
        onPressedChange={handleMuteToggle}
      >
        {setting.muted ? <VolumeX /> : <Volume2 />}
      </Toggle>
      <Slider
        value={[Math.round(setting.volume * 100)]}
        min={0}
        max={100}
        step={1}
        aria-label={`${label} volume`}
        onValueChange={(values) => {
          const next = toSetting(values);
          if (next) onChange(next);
        }}
        onValueCommit={(values) => {
          const next = toSetting(values);
          if (next) onCommit?.(next);
        }}
      />
    </div>
  );
};

export const VolumeControls = ({
  gameInstanceId,
}: {
  gameInstanceId: string;
}) => {
  const [settings, setSettings] = useHostVolume();
  const sendRemoteVolume = useSendRemoteVolume(gameInstanceId);

  return (
    <div className="flex flex-col gap-2 mx-4 pb-2">
      <VolumeControl
        label="This device"
        setting={settings.local}
        onChange={(local) => setSettings((current) => ({ ...current, local }))}
      />
      <VolumeControl
        label="Presentation"
        setting={settings.remote}
        onChange={(remote) =>
          setSettings((current) => ({ ...current, remote }))
        }
        onCommit={(remote) => void sendRemoteVolume(remote)}
      />
    </div>
  );
};
