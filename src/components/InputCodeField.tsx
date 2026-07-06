import { useNavigate } from '@tanstack/react-router';
import React from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { useJoinGame } from '#/hooks/usejoincodes';
import {
  JOIN_CODE_LENGTH,
  joinCodeFormSchema,
  OTP_REGEX,
} from '#/lib/schemas/joincode';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { useAppForm } from '@/components/ui/tanstack-form';
import { Spinner } from './ui/spinner';

export const WaitOverlay = () => {
  return createPortal(
    <div className="absolute inset-0 bg-feudblue/80 flex items-center justify-center">
      <Spinner className="h-[50vh] w-[50vw] object-contain" />
    </div>,
    document.body,
  );
};

export const InputCodeField = () => {
  const joinGameData = useJoinGame();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      code: '',
    },
    validators: {
      onSubmit: joinCodeFormSchema,
    },
    onSubmit: async ({ formApi, value: { code } }) => {
      const gameInstance = await joinGameData.mutateAsync({ code });
      if (!gameInstance) {
        toast('Invalid code');
        return;
      }
      formApi.reset();
      navigate({
        to: '/watch/$inviteCode',
        params: { inviteCode: gameInstance.code },
      });
    },
  });

  const handleSubmit = React.useCallback(
    (e: React.SubmitEvent) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    },
    [form.handleSubmit],
  );

  return (
    <div className="my-6">
      <div className="flex flex-col items-center">
        <h3 className="text-4xl mb-2 font-bold">Have a code?</h3>
        <h4 className="text-2xl mb-4 font-semibold">Enter it below to join!</h4>
      </div>
      <form.AppForm>
        <form onSubmit={handleSubmit} className="flex justify-center">
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.isSubmitted]}
            children={([isSubmitting, isSubmitted]) => (
              <>{isSubmitting || (isSubmitted && <WaitOverlay />)}</>
            )}
          />
          <form.AppField
            name="code"
            children={(field) => (
              <field.Field className="w-fit">
                <InputOTP
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onChange={(val) => field.handleChange(val.toUpperCase())}
                  onBlur={field.handleBlur}
                  maxLength={JOIN_CODE_LENGTH}
                  pattern={OTP_REGEX}
                  className="justify-center"
                >
                  <InputOTPGroup className="my-auto *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-13 *:data-[slot=input-otp-slot]:text-4xl *:data-[slot=input-otp-slot]:first:rounded-l-3xl *:data-[slot=input-otp-slot]:last:rounded-r-3xl">
                    {Array.from({ length: JOIN_CODE_LENGTH }, (_, idx) => (
                      <InputOTPSlot
                        index={idx}
                        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
                        key={idx}
                        className="border-feud-lightblue dark:bg-feudblue/50"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </field.Field>
            )}
          />
        </form>
      </form.AppForm>
    </div>
  );
};
