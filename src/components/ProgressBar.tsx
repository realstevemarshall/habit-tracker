interface ProgressBarProps {
  percent: number;
  onTrack?: boolean;
}

export function ProgressBar({ percent, onTrack = false }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          onTrack ? 'bg-accent' : 'bg-muted/60'
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
