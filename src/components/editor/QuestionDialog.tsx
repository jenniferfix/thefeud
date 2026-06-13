import { TrashIcon } from 'lucide-react';
import React from 'react';
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
import {
  useDeleteAnswer,
  useInsertAnswer,
  useUpdateAnswer,
} from '@/hooks/useanswerqueries';
import {
  useInsertQuestion,
  useUpdateQuestion,
} from '@/hooks/usequestionqueries';
import {
  type AnswerFormType,
  questionFormSchema,
} from '@/lib/schemas/questions';
import { useAppForm } from '../ui/tanstack-form';

export interface ExistingAnswersType extends AnswerFormType {}

export type NewQuestionDialogProps = {
  editing?: boolean;
  children: React.ReactNode;
  questionId?: string;
  question?: string;
  answers?: ExistingAnswersType[];
  gameId?: string;
};

export const QuestionDialog = ({
  editing = false,
  children,
  question,
  questionId,
  answers,
  gameId, // if provided we can add this question to the game
}: NewQuestionDialogProps) => {
  const deleteAnswer = useDeleteAnswer();
  const updateAnswer = useUpdateAnswer();
  const insertQuestion = useInsertQuestion();
  const insertAnswer = useInsertAnswer();
  const updateQuestion = useUpdateQuestion();
  const [open, setOpen] = React.useState(false);

  const form = useAppForm({
    defaultValues: {
      question: question ?? '',
      answers: answers ?? ([] as ExistingAnswersType[]),
    },
    validators: {
      onSubmit: questionFormSchema,
    },
    onSubmit: async ({ formApi, value }) => {
      if (!editing) {
        const [newQ] = await insertQuestion.mutateAsync({
          question: value.question,
        });
        const { id: question_id } = newQ;
        const newAs = await insertAnswer.mutateAsync(
          value.answers.map(({ answer, score }) => ({
            question_id,
            answer,
            score,
          })),
        );
        formApi.reset();
        setOpen(false);
      } else {
        if (!questionId) throw Error('questionId must be provided');
        const question_id = questionId;
        const questionDirty = question !== value.question;
        const newAnswers = value.answers.filter((a) => !a.id);
        const existingAnswers = value.answers?.filter((a) => a.id);
        const toDelete = answers
          ?.filter((orig) => !value.answers.find((a) => a.id === orig.id))
          .map((a) => a.id!);
        const updatedAnswers = existingAnswers?.filter((current) => {
          const original = answers?.find((old) => old.id === current.id); // get original row from current row id
          if (!original) return;
          /** return true if either field has changed */
          return (
            original.answer !== current.answer ||
            original.score !== current.score
          );
        });

        await Promise.all([
          questionDirty
            ? updateQuestion.mutateAsync({
                questionId,
                question: value.question,
              })
            : undefined,
          toDelete?.length
            ? deleteAnswer.mutateAsync({ id: toDelete })
            : undefined,
          ...(updatedAnswers?.length
            ? updatedAnswers.map((a) =>
                updateAnswer.mutateAsync({
                  id: a.id!,
                  data: { score: a.score, answer: a.answer },
                }),
              )
            : []),
          ...(newAnswers?.length
            ? newAnswers.map(({ answer, score }) =>
                insertAnswer.mutateAsync({
                  question_id,
                  score,
                  answer,
                }),
              )
            : []),
        ]);
        form.reset();
        setOpen(false);
      }
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
              {(answersField) => {
                const remaining = 8 - answersField.state.value.length;
                return (
                  <form.FieldSet>
                    <div className="flex">
                      <div className="grow">
                        <form.FieldLegend>Answers</form.FieldLegend>
                        <answersField.FieldDescription>
                          Keep answers to 4 words max
                        </answersField.FieldDescription>
                      </div>
                      <div className="flex items-center justify-center">
                        <form.Button
                          type="button"
                          disabled={remaining <= 0}
                          variant="outline"
                          onClick={() =>
                            answersField.pushValue({ answer: '', score: 0 })
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
                      {answersField.state.value.map((_, idx) => {
                        return (
                          <form.FieldGroup key={idx} className="flex flex-row">
                            <form.AppField
                              name={`answers[${idx}].answer`}
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
                              name={`answers[${idx}].score`}
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
                            <form.Button
                              className="self-center"
                              variant="ghost"
                              size="icon-sm"
                              type="button"
                              onClick={() => {
                                answersField.handleChange([
                                  ...answersField.state.value.slice(0, idx),
                                  ...answersField.state.value.slice(idx + 1),
                                ]);
                              }}
                            >
                              <TrashIcon />
                            </form.Button>
                          </form.FieldGroup>
                        );
                      })}
                    </form.FieldSet>
                  </form.FieldSet>
                );
              }}
            </form.AppField>
            <DialogFooter className="gap-3">
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
                    {editing ? 'Update' : 'Add'}
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
