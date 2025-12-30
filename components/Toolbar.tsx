import React from 'react';
import { ToolType } from '../types';
import { PenTool, Feather, Stamp, RotateCcw, Send, Settings, Trash2 } from 'lucide-react';

interface ToolbarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  onClear: () => void;
  onPost: () => void;
  onOpenSettings: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  currentTool, 
  onSelectTool, 
  onClear, 
  onPost,
  onOpenSettings 
}) => {
  
  const tools = [
    { id: ToolType.FUTO_FUDE, icon: PenTool, label: '太筆' },
    { id: ToolType.HOSO_FUDE, icon: Feather, label: '細筆' },
    { id: ToolType.STAMP, icon: Stamp, label: '篆刻' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-3 flex items-center space-x-2 border border-gray-200 z-40 max-w-[95vw] overflow-x-auto">
      
      <div className="flex space-x-2 pr-4 border-r border-gray-300">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelectTool(t.id)}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
              currentTool === t.id 
                ? 'bg-gray-800 text-white shadow-lg scale-105' 
                : 'bg-transparent text-gray-500 hover:bg-gray-100'
            }`}
          >
            <t.icon size={24} strokeWidth={currentTool === t.id ? 2.5 : 2} />
            <span className="text-xs mt-1 font-serif">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="flex space-x-2 pl-2">
        <button
            onClick={onClear}
            className="flex flex-col items-center justify-center w-12 h-16 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
            title="全部消す"
        >
            <Trash2 size={20} />
            <span className="text-[10px] mt-1">消去</span>
        </button>

         <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center w-12 h-16 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
            title="設定"
        >
            <Settings size={20} />
            <span className="text-[10px] mt-1">設定</span>
        </button>

        <button
          onClick={onPost}
          className="flex flex-col items-center justify-center w-20 h-16 rounded-xl bg-[#1da1f2] text-white hover:bg-[#1a91da] shadow-md transition-transform active:scale-95 ml-2"
        >
          <Send size={24} />
          <span className="text-xs mt-1 font-bold">投稿</span>
        </button>
      </div>
    </div>
  );
};