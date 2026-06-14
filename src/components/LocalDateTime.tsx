import React from 'react';

export const LocalDateTime = React.memo(({ value }: { value: string }) => {
  return (
    <time dateTime={value}>
      {new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))}
    </time>
  );
});
