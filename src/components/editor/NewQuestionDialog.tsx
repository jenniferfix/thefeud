import React from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useInsertAnswer } from '@/hooks/useanswerqueries';
import { useGetQuestion, useInsertQuestion } from '@/hooks/usequestionqueries';
import {
  type AnswerType,
  answerSchema,
  questionSchema,
} from '@/lib/schemas/questions';
import { cn } from '@/utils/utils';
import { ScrollArea } from '../ui/scroll-area';
import { useAppForm } from '../ui/tanstack-form';

export interface AnswersProps extends AnswerType {
  id: string;
}

export type NewQuestionDialogProps = {
  children: React.ReactNode;
  questionId?: string;
  question?: string;
  answers?: AnswersProps[];
};

export const NewQuestionDialog = ({
  children,
  question,
  questionId,
  answers,
}: NewQuestionDialogProps) => {
  const insertQuestion = useInsertQuestion();
  const insertAnswer = useInsertAnswer();
  const [open, setOpen] = React.useState(false);

  const form = useAppForm({
    defaultValues: {
      question: question ?? '',
      answers: [] as AnswerType[],
    },
    validators: {
      onSubmit: questionSchema,
    },
    onSubmit: async ({ formApi, value: { question, answers } }) => {
      const [newQ] = await insertQuestion.mutateAsync({ question });
      const { id: question_id } = newQ;
      const newAs = await insertAnswer.mutateAsync(
        answers.map(({ answer, score }) => ({ question_id, answer, score })),
      );
      formApi.reset();
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="top-20 translate-y-0 flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add/Edit Question</DialogTitle>
          <DialogDescription>
            Add a question and answers to keep in your quesion bank
          </DialogDescription>
        </DialogHeader>
        <form.AppForm>
          <form onSubmit={handleSubmit}>
            <form.AppField
              name="question"
              children={(field) => (
                <field.Field>
                  <field.FieldLabel>Question</field.FieldLabel>
                  <field.Textarea
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </field.Field>
              )}
            />
            <form.AppField name="answers" mode="array">
              {(field) => {
                const remaining = 8 - field.state.value.length;
                return (
                  <form.FieldSet>
                    <div className="flex">
                      <div className="grow">
                        <form.FieldLegend>Answers</form.FieldLegend>
                        <field.FieldDescription>
                          Keep answers to 4 words max
                        </field.FieldDescription>
                      </div>
                      <div className="flex items-center justify-center">
                        <form.Button
                          type="button"
                          disabled={remaining <= 0}
                          variant="outline"
                          onClick={() =>
                            field.pushValue({ answer: '', score: 0 })
                          }
                        >
                          {remaining ? (
                            <>
                              Add Answer
                              <span className="ml-2 text-xs text-muted-foreground">
                                {remaining} left
                              </span>
                            </>
                          ) : (
                            'Full'
                          )}
                        </form.Button>
                      </div>
                    </div>
                    <form.FieldSet className="mb-4 gap-4">
                      {field.state.value.map((_, i) => {
                        return (
                          <form.FieldGroup key={i} className="flex flex-row">
                            <form.AppField
                              name={`answers[${i}].answer`}
                              children={(field) => (
                                <field.Field className="flex-6">
                                  <field.InputGroup>
                                    <field.InputGroupInput
                                      value={field.state.value}
                                      onChange={(e) =>
                                        field.handleChange(e.target.value)
                                      }
                                      onBlur={field.handleBlur}
                                    />
                                  </field.InputGroup>
                                </field.Field>
                              )}
                            />
                            <form.AppField
                              name={`answers[${i}].score`}
                              children={(field) => (
                                <field.Field className="flex-1">
                                  <field.Input
                                    className="min-w-8"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    autoComplete="off"
                                    value={field.state.value}
                                    onChange={(e) =>
                                      field.handleChange(
                                        Number(
                                          e.target.value.replace(/\D/g, ''),
                                        ),
                                      )
                                    }
                                  />
                                </field.Field>
                              )}
                            />
                          </form.FieldGroup>
                        );
                      })}
                    </form.FieldSet>
                  </form.FieldSet>
                );
              }}
            </form.AppField>
            <DialogFooter>
              <DialogClose asChild>
                <form.Button
                  type="button"
                  className="grow"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                  }}
                >
                  Cancel
                </form.Button>
              </DialogClose>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                  <form.WaitButton
                    variant="default"
                    className="grow"
                    disabled={!canSubmit && !isSubmitting}
                    loading={isSubmitting}
                  >
                    Add
                  </form.WaitButton>
                )}
              />
            </DialogFooter>
          </form>
        </form.AppForm>
      </DialogContent>
    </Dialog>
  );
};
