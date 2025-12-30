import React, { useState, useEffect } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { SettingsModal } from './components/SettingsModal';
import { PostModal } from './components/PostModal';
import { ToolType, AppSettings, PostMetadata } from './types';

function App() {
  const [currentTool, setCurrentTool] = useState<ToolType>(ToolType.FUTO_FUDE);
  const [triggerClear, setTriggerClear] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [currentPreview, setCurrentPreview] = useState<string | null>(null);
  
  // Load settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('zenShodoSettings');
    return saved ? JSON.parse(saved) : {
      stampText: '雅',
      artistName: '',
      isAuthenticated: false
    };
  });

  useEffect(() => {
    localStorage.setItem('zenShodoSettings', JSON.stringify(settings));
  }, [settings]);

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handlePost = async (metadata: PostMetadata) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Posting to X:', {
          ...metadata,
          image: currentPreview ? 'Blob data present' : 'No image'
        });
        // In a real app, we would send `currentPreview` (dataUrl) to a backend
        // which would then upload to X via API.
        resolve();
      }, 2000);
    });
  };

  return (
    <div className="w-full h-screen bg-[#2a2a2a] flex items-center justify-center overflow-hidden relative">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[#2a2a2a] bg-gradient-to-br from-[#333] to-[#1a1a1a] -z-10" />

      {/* Main Canvas Area */}
      {/* We center the paper and give it a max-width for desktop, full width for mobile */}
      <div className="w-full h-full md:w-[800px] md:h-[95vh] relative shadow-2xl">
        <Canvas 
          tool={currentTool} 
          stampText={settings.stampText}
          triggerClear={triggerClear}
          onPreviewUpdate={setCurrentPreview}
        />
      </div>

      {/* Controls */}
      <Toolbar 
        currentTool={currentTool}
        onSelectTool={setCurrentTool}
        onClear={() => setTriggerClear(prev => prev + 1)}
        onPost={() => setIsPostModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleUpdateSettings}
      />

      <PostModal 
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onPost={handlePost}
        previewImage={currentPreview}
      />
    </div>
  );
}

export default App;