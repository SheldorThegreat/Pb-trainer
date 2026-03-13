'use client';

import { AppSettings } from '../lib/storage';

interface Props {
  settings: AppSettings;
  onChange: (s: AppSettings) => void;
  onReset: () => void;
  onClose: () => void;
}

function Toggle({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 px-1 border-b border-pb-border"
    >
      <span className="text-white">{label}</span>
      <div className={`w-12 h-7 rounded-full flex items-center px-1 transition-colors ${value ? 'bg-pb-green' : 'bg-white/10'}`}>
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : ''}`} />
      </div>
    </button>
  );
}

export default function SettingsPanel({ settings, onChange, onReset, onClose }: Props) {
  const update = (partial: Partial<AppSettings>) => onChange({ ...settings, ...partial });

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-pb-dark w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[85vh] overflow-y-auto border border-pb-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">⚙️ Settings</h2>
          <button onClick={onClose} className="text-pb-muted text-2xl hover:text-white">✕</button>
        </div>

        <Toggle label="🔊 Sound Effects" value={settings.soundEnabled} onToggle={() => update({ soundEnabled: !settings.soundEnabled })} />
        <Toggle label="📳 Vibration" value={settings.vibrationEnabled} onToggle={() => update({ vibrationEnabled: !settings.vibrationEnabled })} />
        <Toggle label="📏 Use Meters" value={settings.useMeters} onToggle={() => update({ useMeters: !settings.useMeters })} />

        <div className="py-3 px-1 border-b border-pb-border">
          <label className="text-white block mb-2">📅 Current Week</label>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((w) => (
              <button
                key={w}
                onClick={() => update({ currentWeek: w })}
                className={`py-2 rounded-xl font-bold transition-all ${
                  settings.currentWeek === w
                    ? 'bg-pb-green text-black'
                    : 'bg-white/5 text-pb-muted hover:bg-white/10'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset all progress? This cannot be undone.')) onReset();
          }}
          className="w-full mt-6 py-3 rounded-xl bg-pb-red/20 text-pb-red font-bold text-lg hover:bg-pb-red/30 active:scale-95 transition-all"
        >
          🗑 Reset All Progress
        </button>
      </div>
    </div>
  );
}
