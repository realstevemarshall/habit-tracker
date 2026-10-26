import { useRef, useState } from 'react';
import type { AppData } from '../data/constants';
import {
  BackupFormatError,
  buildBackupJson,
  parseBackup,
} from '../hooks/useAppData';
import { todayKey } from '../utils/dates';

interface BackupControlsProps {
  data: AppData;
  onImport: (data: AppData) => void;
}

function countEntries(data: AppData): number {
  return Object.values(data.exercises).reduce(
    (sum, list) => sum + list.length,
    0,
  );
}

export function BackupControls({ data, onImport }: BackupControlsProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  function handleExport() {
    const blob = new Blob([buildBackupJson(data)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habit-tracker-backup-${todayKey()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage({ ok: true, text: 'Backup downloaded.' });
  }

  async function handleFile(file: File) {
    try {
      const imported = parseBackup(await file.text());
      const summary = `${countEntries(imported)} exercise entries and ${
        Object.keys(imported.habits).length
      } days of habits`;
      const confirmed = window.confirm(
        `Replace everything currently in the tracker with "${file.name}" (${summary})?\n\nThis can't be undone — export a backup first if you're not sure.`,
      );
      if (!confirmed) {
        setMessage({ ok: true, text: 'Import cancelled. Nothing changed.' });
        return;
      }
      onImport(imported);
      setMessage({ ok: true, text: `Restored from ${file.name}.` });
    } catch (error) {
      setMessage({
        ok: false,
        text:
          error instanceof BackupFormatError
            ? error.message
            : 'Couldn’t read that file.',
      });
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Backup</h2>
      <p className="mb-4 text-sm text-muted">
        Your data lives only in this browser. Export a backup now and then, and
        use Import to restore it here or move it to another device.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={handleExport}
          className="min-h-12 rounded-xl bg-accent px-4 font-semibold text-background transition-transform active:scale-[0.98] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Export backup
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="min-h-12 rounded-xl border border-border bg-surface-raised px-4 font-semibold text-text transition-transform active:scale-[0.98] hover:border-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Import backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = '';
            if (file) void handleFile(file);
          }}
        />
      </div>
      {message && (
        <p
          role="status"
          className={`mt-3 text-sm ${message.ok ? 'text-accent' : 'text-warning'}`}
        >
          {message.text}
        </p>
      )}
    </section>
  );
}
