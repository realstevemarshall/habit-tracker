import { useId, useState } from 'react';

interface TooltipProps {
  content: string;
}

export function Tooltip({ content }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="More info"
        aria-describedby={open ? tooltipId : undefined}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-xs text-muted transition-colors hover:border-accent/40 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        onClick={() => setOpen((value) => !value)}
        onBlur={() => setOpen(false)}
      >
        ?
      </button>
      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute bottom-full left-1/2 z-20 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-surface-raised px-3 py-2 text-xs leading-relaxed text-muted shadow-lg"
        >
          {content}
        </span>
      )}
    </span>
  );
}
