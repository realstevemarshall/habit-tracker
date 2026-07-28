interface StatusBadgeProps {
  onTrack: boolean;
}

export function StatusBadge({ onTrack }: StatusBadgeProps) {
  return (
    <span
      className={`shrink-0 text-xs font-medium ${
        onTrack ? 'text-accent' : 'text-muted'
      }`}
    >
      {onTrack ? 'On track' : 'Off track'}
    </span>
  );
}
