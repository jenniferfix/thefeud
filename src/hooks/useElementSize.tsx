import React from 'react';

export function useElementSize<T extends HTMLElement>() {
  const [element, setElement] = React.useState<T | null>(null);

  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    if (!element) return;

    const updateSize = () => {
      const bounds = element.getBoundingClientRect();
      const nextSize = {
        width: Math.round(bounds.width),
        height: Math.round(bounds.height),
      };

      setSize((current) =>
        current.width === nextSize.width && current.height === nextSize.height
          ? current
          : nextSize,
      );
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [element]);

  return {
    ref: setElement,
    width: size.width,
    height: size.height,
  };
}
