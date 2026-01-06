import React from 'react';
import { PlantSettings, PlantType } from '../types';

interface ControlsProps {
  settings: PlantSettings;
  updateSettings: (newSettings: Partial<PlantSettings>) => void;
  applyPreset: (type: PlantType) => void;
  onClear: () => void;
  // removed onImport from props here, as it moved to main view
}

const ControlGroup: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6 last:mb-0">
    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const Slider: React.FC<{ 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number; 
  onChange: (val: number) => void 
}> = ({ label, value, min, max, step, onChange }) => (
  <div className="flex flex-col">
    <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
      <span>{label}</span>
      <span>{value.toFixed(step < 0.1 ? 2 : 1)}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600"
    />
  </div>
);

const DualColorPicker: React.FC<{ label: string; start: string; end: string; onStartChange: (v: string) => void; onEndChange: (v: string) => void }> = ({ label, start, end, onStartChange, onEndChange }) => (
    <div className="flex flex-col gap-2">
        <span className="text-xs text-slate-500 font-medium">{label} (Gradient)</span>
        <div className="flex items-center gap-2">
            <div className="relative overflow-hidden w-8 h-8 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110">
                <input 
                    type="color" 
                    value={start} 
                    onChange={(e) => onStartChange(e.target.value)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                />
            </div>
            <span className="text-slate-300">→</span>
            <div className="relative overflow-hidden w-8 h-8 rounded-full border border-slate-200 shadow-sm transition-transform hover:scale-110">
                <input 
                    type="color" 
                    value={end} 
                    onChange={(e) => onEndChange(e.target.value)}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                />
            </div>
        </div>
    </div>
);

const Controls: React.FC<ControlsProps> = ({ settings, updateSettings, applyPreset, onClear }) => {
  return (
    <div className="w-80 h-full bg-white/90 border-r border-slate-200 p-6 overflow-y-auto scrollbar-hide shadow-lg flex flex-col z-20">
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        <h2 className="text-slate-700 font-serif text-lg tracking-wide">Garden Tools</h2>
      </div>

      <div className="mb-6 bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1">
        {[PlantType.VINE, PlantType.PALM, PlantType.GEOMETRIC, PlantType.UMBRELLA, PlantType.BERRY, PlantType.CLUSTER].map((t) => (
            <button
                key={t}
                onClick={() => applyPreset(t)}
                className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all uppercase tracking-wide min-w-[30%]
                    ${settings.type === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
            >
                {t}
            </button>
        ))}
      </div>

      <ControlGroup title="Stem Genetics">
        <DualColorPicker 
            label="Stem Gradient" 
            start={settings.stemColorStart} 
            end={settings.stemColorEnd} 
            onStartChange={(c) => updateSettings({ stemColorStart: c })} 
            onEndChange={(c) => updateSettings({ stemColorEnd: c })} 
        />
        <Slider label="Straightness" value={settings.straightness} min={0} max={1} step={0.05} onChange={(v) => updateSettings({ straightness: v })} />
        <Slider label="Curviness" value={settings.curlFactor} min={0.01} max={0.2} step={0.01} onChange={(v) => updateSettings({ curlFactor: v })} />
        <Slider label="Height" value={settings.maxLife} min={50} max={500} step={10} onChange={(v) => updateSettings({ maxLife: v })} />
        <Slider label="Thickness" value={settings.baseWidth} min={1} max={15} step={0.5} onChange={(v) => updateSettings({ baseWidth: v })} />
      </ControlGroup>

      <ControlGroup title="Foliage">
        <DualColorPicker 
            label="Leaf Gradient" 
            start={settings.leafColorStart} 
            end={settings.leafColorEnd} 
            onStartChange={(c) => updateSettings({ leafColorStart: c })} 
            onEndChange={(c) => updateSettings({ leafColorEnd: c })} 
        />
        <Slider label="Density" value={settings.leafFrequency} min={0} max={0.3} step={0.01} onChange={(v) => updateSettings({ leafFrequency: v })} />
        <Slider label="Size" value={settings.leafSize} min={2} max={50} step={1} onChange={(v) => updateSettings({ leafSize: v })} />
      </ControlGroup>

      <ControlGroup title="Bloom">
        <DualColorPicker 
            label="Petal/Fruit Color" 
            start={settings.flowerColorStart} 
            end={settings.flowerColorEnd} 
            onStartChange={(c) => updateSettings({ flowerColorStart: c })} 
            onEndChange={(c) => updateSettings({ flowerColorEnd: c })} 
        />
        <Slider label="Probability" value={settings.flowerProbability} min={0} max={1} step={0.1} onChange={(v) => updateSettings({ flowerProbability: v })} />
        <Slider label="Size" value={settings.flowerSize} min={5} max={40} step={1} onChange={(v) => updateSettings({ flowerSize: v })} />
        <Slider label="Count" value={settings.petalCount} min={3} max={16} step={1} onChange={(v) => updateSettings({ petalCount: v })} />
      </ControlGroup>

      <div className="pt-4 mt-6 border-t border-slate-100">
        <button
            onClick={onClear}
            className="w-full bg-rose-50 hover:bg-rose-100 text-rose-500 py-3 rounded-xl text-sm font-medium transition-colors border border-rose-100 shadow-sm"
        >
            Start New Page
        </button>
      </div>
    </div>
  );
};

export default Controls;