import React, { useState, useEffect, useRef } from 'react';
import GardenCanvas from './components/GardenCanvas';
import Controls from './components/Controls';
import { PlantSettings, PlantType, GardenCanvasRef } from './types';

// Vine: Soft, Curvy, Pastel
const PRESET_VINE: PlantSettings = {
  type: PlantType.VINE,
  stemColorStart: '#86efac', 
  stemColorEnd: '#2dd4bf',   
  baseWidth: 6,
  growthSpeed: 3,
  maxLife: 280,
  curlFactor: 0.08,
  straightness: 0.4, 
  
  leafColorStart: '#bef264', 
  leafColorEnd: '#10b981',   
  leafFrequency: 0.1,
  leafSize: 12,

  flowerColorStart: '#fca5a5', 
  flowerColorEnd: '#c4b5fd',   
  flowerProbability: 0.7,
  flowerSize: 20,
  petalCount: 7,
};

// Palm: Big leaves, Thick stem, Earthy Greens
const PRESET_PALM: PlantSettings = {
  type: PlantType.PALM,
  stemColorStart: '#78716c', // Stone grey/brown
  stemColorEnd: '#65a30d',   // Olive
  baseWidth: 10,
  growthSpeed: 2.5,
  maxLife: 350,
  curlFactor: 0.05,
  straightness: 0.7, 
  
  leafColorStart: '#d9f99d', // Light moss
  leafColorEnd: '#14532d',   // Dark green
  leafFrequency: 0.05, // Rarer
  leafSize: 35, // Huge

  flowerColorStart: '#fdba74', // Orange
  flowerColorEnd: '#fcd34d',   // Yellow
  flowerProbability: 0.4,
  flowerSize: 25,
  petalCount: 5,
};

// Geometric: Sharp, Linear, Cool Blues/Greys
const PRESET_GEOMETRIC: PlantSettings = {
  type: PlantType.GEOMETRIC,
  stemColorStart: '#475569', // Slate
  stemColorEnd: '#94a3b8',   // Light slate
  baseWidth: 4,
  growthSpeed: 4,
  maxLife: 300,
  curlFactor: 0, // Unused in geometric
  straightness: 0.9, 
  
  leafColorStart: '#e2e8f0', 
  leafColorEnd: '#64748b',   
  leafFrequency: 0.15,
  leafSize: 10,

  flowerColorStart: '#e0f2fe', 
  flowerColorEnd: '#0ea5e9',   
  flowerProbability: 0.6,
  flowerSize: 15,
  petalCount: 9,
};

// Umbrella: Tall, Solitary, Huge top leaf/bloom
const PRESET_UMBRELLA: PlantSettings = {
  type: PlantType.UMBRELLA,
  stemColorStart: '#064e3b', // Dark Emerald
  stemColorEnd: '#34d399',   // Light Green
  baseWidth: 8,
  growthSpeed: 3,
  maxLife: 400,
  curlFactor: 0.03, // Very straight
  straightness: 0.8, 
  
  leafColorStart: '#047857', 
  leafColorEnd: '#6ee7b7',   
  leafFrequency: 0.01, // Very Rare side leaves
  leafSize: 45, // Massive

  flowerColorStart: '#fef3c7', // Cream
  flowerColorEnd: '#fffbeb',   // White
  flowerProbability: 0.9, // Almost always blooms at top
  flowerSize: 40,
  petalCount: 1, // Special rendering for 1 petal (spathe)
};

// Berry: Twiggy, Woody, Red Fruits
const PRESET_BERRY: PlantSettings = {
  type: PlantType.BERRY,
  stemColorStart: '#422006', // Dark wood
  stemColorEnd: '#a8a29e',   // Grey wood
  baseWidth: 3,
  growthSpeed: 3.5,
  maxLife: 250,
  curlFactor: 0.15, // Erratic
  straightness: 0.3, 
  
  leafColorStart: '#3f6212', // Olive
  leafColorEnd: '#166534',   // Green
  leafFrequency: 0.05, // Sparse leaves
  leafSize: 8, // Small

  flowerColorStart: '#dc2626', // Red
  flowerColorEnd: '#f97316',   // Orange
  flowerProbability: 0.8,
  flowerSize: 12,
  petalCount: 5, // Used as berry count
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<PlantSettings>(PRESET_VINE);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importString, setImportString] = useState('');
  
  const canvasRef = useRef<GardenCanvasRef>(null);
  const bottleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (toastMessage) {
          const timer = setTimeout(() => setToastMessage(null), 3000);
          return () => clearTimeout(timer);
      }
  }, [toastMessage]);

  // Update canvas with bottle bounds on mount/resize
  useEffect(() => {
      const updateBounds = () => {
          if (bottleRef.current && canvasRef.current) {
              const rect = bottleRef.current.getBoundingClientRect();
              canvasRef.current.updateBottleRect(rect);
          }
      };
      
      updateBounds();
      window.addEventListener('resize', updateBounds);
      return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const updateSettings = (newSettings: Partial<PlantSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const applyPreset = (type: PlantType) => {
      switch (type) {
          case PlantType.PALM:
              setSettings(PRESET_PALM);
              break;
          case PlantType.GEOMETRIC:
              setSettings(PRESET_GEOMETRIC);
              break;
          case PlantType.UMBRELLA:
              setSettings(PRESET_UMBRELLA);
              break;
          case PlantType.BERRY:
              setSettings(PRESET_BERRY);
              break;
          case PlantType.VINE:
          default:
              setSettings(PRESET_VINE);
              break;
      }
  };

  const handleClear = () => {
    // Only clears "Outside" layer
    setClearTrigger(prev => prev + 1);
  };

  const handleUndo = () => {
      if (canvasRef.current) {
          canvasRef.current.undo();
          setToastMessage("Retracted last bottle plant.");
      }
  };

  const handleSettingsCopied = (copiedSettings: PlantSettings) => {
      try {
          const id = btoa(JSON.stringify(copiedSettings));
          navigator.clipboard.writeText(id);
          setToastMessage("Seed DNA copied to clipboard!");
      } catch (e) {
          console.error("Failed to serialize settings", e);
      }
  };

  const handleImport = (value: string) => {
      setImportString(value);
      if (!value) return;

      try {
          const decoded = atob(value);
          const parsed = JSON.parse(decoded) as PlantSettings;
          // Validate minimally
          if (parsed.stemColorStart && parsed.type) {
              setSettings(parsed);
              setToastMessage("Seed DNA planted!");
              
              // Trigger spawn at bottle bottom
              if (bottleRef.current && canvasRef.current) {
                  const x = bottleRef.current.offsetLeft + bottleRef.current.offsetWidth / 2;
                  const y = bottleRef.current.offsetTop + bottleRef.current.offsetHeight - 10; // 10px padding from bottom

                  // Spawn INSIDE bottle
                  canvasRef.current.spawn(x, y, parsed, true);
                  setImportString(''); // Clear input on success
              }

          } else {
              // Silent fail or minimal feedback for invalid while typing? 
          }
      } catch (e) {
          // invalid format
      }
  };

  return (
    <div className="flex w-full h-screen bg-[#fdfbf7] overflow-hidden font-sans select-none text-slate-800">
      
      {/* Sidebar Controls */}
      <Controls 
        settings={settings} 
        updateSettings={updateSettings} 
        applyPreset={applyPreset}
        onClear={handleClear} 
      />

      {/* Main Right Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center bg-[#fdfbf7]">
         
         {/* Paper Grain Texture (Subtle) - applied to right pane */}
        <div className="absolute inset-0 opacity-[0.4] pointer-events-none z-10 mix-blend-multiply" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Canvas Layer (Now manages dual layers) */}
        <GardenCanvas 
            ref={canvasRef}
            settings={settings} 
            clearTrigger={clearTrigger} 
            onSettingsCopied={handleSettingsCopied}
        />

        {/* UI Overlay: Title */}
        <div className="absolute top-8 w-full text-center pointer-events-none z-30">
            <h1 className="text-3xl md:text-5xl font-serif text-slate-800 tracking-tight drop-shadow-sm opacity-90">
            The Sketch Garden
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-sm">
            Paste DNA below to grow inside the bottle. Drag plants to rearrange.
            </p>
        </div>

        {/* Glass Bottle Visual (Square/Rectangular) */}
        <div 
            ref={bottleRef}
            className="relative z-20 w-80 h-[280px] border-x-2 border-b-2 border-slate-300/60 bg-white/10 backdrop-blur-[2px] rounded-none shadow-xl pointer-events-none"
        >
             {/* Rim */}
             <div className="absolute top-0 w-full h-1 bg-slate-300/40"></div>
             {/* Glass Reflections */}
             <div className="absolute top-4 right-8 w-px h-32 bg-white/30 blur-[1px]"></div>
             <div className="absolute top-8 right-6 w-2 h-16 bg-white/10 rounded-full blur-sm"></div>
             {/* Water level hint? Optional, leaving clean for now */}
        </div>

        {/* DNA Input Area & Undo Button */}
        <div className="relative z-30 mt-8 w-80 flex gap-2">
            <input 
                type="text"
                value={importString}
                onChange={(e) => handleImport(e.target.value)}
                placeholder="Paste DNA..."
                className="flex-1 px-4 py-3 bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg shadow-sm text-center font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all placeholder:text-slate-400"
            />
            <button
                onClick={handleUndo}
                className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg px-3 text-slate-500 hover:text-slate-800 hover:bg-white transition-colors"
                title="Undo last bottle plant"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
            </button>
        </div>

      </div>

      {/* Toast Notification */}
      {toastMessage && (
          <div className="fixed top-8 right-8 z-50 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-medium animate-bounce-in">
              {toastMessage}
          </div>
      )}
    </div>
  );
};

export default App;