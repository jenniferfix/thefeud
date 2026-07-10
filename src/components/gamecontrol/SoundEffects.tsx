import React from 'react';
import type { GameSound } from '#/lib/schemas/sounds';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useSupabase } from '@/hooks/useSupabase';
import {
  useHostVolume,
  useSendRemoteVolume,
  VolumeControl,
} from './VolumeControls';

export const SoundEffects = ({
  gameInstanceId,
}: {
  gameInstanceId: string;
}) => {
  const supabaseClient = useSupabase();
  const [settings, setSettings] = useHostVolume();
  const sendRemoteVolume = useSendRemoteVolume(gameInstanceId);

  const handleSendSound = React.useCallback(
    async (sound: GameSound) => {
      // channel() reuses the GameControl provider's subscribed channel for
      // this topic, so don't remove it here — that would tear down the host
      // page's live subscription.
      const channel = supabaseClient.channel(gameInstanceId, {
        config: { private: true },
      });
      await channel.httpSend('sound', { sound });
    },
    [gameInstanceId, supabaseClient],
  );
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="w-full">Sound Effects</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Play Sound Effects</DrawerTitle>
          <DrawerDescription hidden>
            Play sound effects using buttons from here
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">
          <div className="border p-3 my-2 rounded-2xl">
            <div className="text-base font-semibold">Volume Controls</div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-6">
              <VolumeControl
                label="This device"
                setting={settings.local}
                onChange={(local) =>
                  setSettings((current) => ({ ...current, local }))
                }
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
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => handleSendSound('ding')}>Ding</Button>
            <Button onClick={() => handleSendSound('strike')}>Strike</Button>
            <Button onClick={() => handleSendSound('faceOffMusic')}>
              Face-off Music
            </Button>
            <Button onClick={() => handleSendSound('faceOffBuzzer')}>
              Face-off Buzzer
            </Button>
            <Button onClick={() => handleSendSound('themeMusic')}>
              Theme Music
            </Button>
            <Button onClick={() => handleSendSound('clap')}>Clap</Button>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
