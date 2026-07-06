import { Settings } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { useAppForm } from '../ui/tanstack-form';
import { ShowJoinCode } from './ShowJoinCode';

export const Config = ({ gameInstanceId }: { gameInstanceId: string }) => {
  const form = useAppForm({
    defaultValues: {
      localSound: false,
      remoteSound: true,
    },
  });
  return (
    <Sheet>
      <SheetTrigger>
        <Button size="icon" variant="ghost">
          <Settings />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Update your preferred configuration
          </SheetDescription>
        </SheetHeader>
        <div>
          <ShowJoinCode />
        </div>
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
      </SheetContent>
    </Sheet>
  );
};
