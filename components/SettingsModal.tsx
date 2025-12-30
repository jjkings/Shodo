import React from 'react';
import { AppSettings } from '../types';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localStamp, setLocalStamp] = React.useState(settings.stampText);

  React.useEffect(() => {
    setLocalStamp(settings.stampText);
  }, [settings.stampText, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ stampText: localStamp });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">設定 (Settings)</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stamp Preview */}
          <div className="flex flex-col items-center space-y-3">
            <label className="text-sm font-medium text-gray-600">篆刻印 (Stamp Text)</label>
            <div className="relative">
              <div className="w-24 h-24 bg-[#bd2c2c] rounded-md flex items-center justify-center shadow-md">
                <span className="text-white text-4xl font-serif font-bold leading-tight select-none">
                  {localStamp || "印"}
                </span>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                Preview
              </div>
            </div>
          </div>

          <div className="space-y-2">
             <label className="block text-sm font-medium text-gray-700">
                印の文字 (1-4 Characters recommended)
              </label>
              <input
                type="text"
                maxLength={4}
                value={localStamp}
                onChange={(e) => setLocalStamp(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="Ex: 雅号"
              />
          </div>
        </div>

        <div className="p-4 bg-gray-50 flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-md transition-colors shadow-lg"
          >
            <Save size={18} />
            <span>保存 (Save)</span>
          </button>
        </div>
      </div>
    </div>
  );
};