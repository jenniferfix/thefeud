import React from 'react';
import { useAppForm } from '../ui/tanstack-form';

export const Config = ({ gameInstanceId }: { gameInstanceId: string }) => {
  const form = useAppForm({
    defaultValues: {
      localSound: false,
      remoteSound: true,
    },
  });
  return (
    <div>
      <form.AppForm>
        <form.AppField
          name="localSound"
          children={(field) => (
            <field.Field>
              <field.FieldLabel>Local Sound</field.FieldLabel>
            </field.Field>
          )}
        />
      </form.AppForm>
    </div>
  );
};
