import {
  QUARTERLY_FASTS,
  type AppData,
  type QuarterlyFastRecord,
} from '../data/constants';

interface QuarterlyFastsProps {
  quarterlyFasts: AppData['quarterlyFasts'];
  onUpdate: (id: string, record: QuarterlyFastRecord) => void;
}

export function QuarterlyFasts({
  quarterlyFasts,
  onUpdate,
}: QuarterlyFastsProps) {
  const completedCount = QUARTERLY_FASTS.filter(
    (window) => quarterlyFasts[window.id]?.completed,
  ).length;

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Quarterly 96-Hour Fasts
        </h2>
        <p className="text-sm text-muted">
          {completedCount} of {QUARTERLY_FASTS.length} completed by your birthday
        </p>
      </div>

      <ul className="grid gap-4">
        {QUARTERLY_FASTS.map((window) => {
          const record = quarterlyFasts[window.id] ?? { completed: false };

          return (
            <li
              key={window.id}
              className="rounded-xl border border-border bg-surface-raised p-4"
            >
              <label className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={record.completed}
                  onChange={(event) =>
                    onUpdate(window.id, {
                      ...record,
                      completed: event.target.checked,
                    })
                  }
                  className="h-5 w-5 shrink-0 rounded border-border bg-background accent-accent"
                />
                <span className="font-medium">{window.label}</span>
              </label>

              {record.completed && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-muted">Start date (optional)</span>
                    <input
                      type="date"
                      value={record.startDate ?? ''}
                      onChange={(event) =>
                        onUpdate(window.id, {
                          ...record,
                          startDate: event.target.value || undefined,
                        })
                      }
                      className="min-h-11 rounded-xl border border-border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm">
                    <span className="text-muted">End date (optional)</span>
                    <input
                      type="date"
                      value={record.endDate ?? ''}
                      onChange={(event) =>
                        onUpdate(window.id, {
                          ...record,
                          endDate: event.target.value || undefined,
                        })
                      }
                      className="min-h-11 rounded-xl border border-border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                    />
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
