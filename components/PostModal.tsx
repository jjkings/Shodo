import React from 'react';
import { PostMetadata, AppSettings } from '../types';
import { X as XIcon, Share2, Twitter, Loader2 } from 'lucide-react';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onPost: (metadata: PostMetadata) => Promise<void>;
  previewImage: string | null;
}

export const PostModal: React.FC<PostModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings,
  onPost,
  previewImage
}) => {
  const [title, setTitle] = React.useState('');
  const [artist, setArtist] = React.useState(settings.artistName);
  const [isPosting, setIsPosting] = React.useState(false);
  const [step, setStep] = React.useState<'auth' | 'compose' | 'success'>('auth');

  React.useEffect(() => {
    if (isOpen) {
      if (settings.isAuthenticated) {
        setStep('compose');
      } else {
        setStep('auth');
      }
      setArtist(settings.artistName);
      setTitle('');
    }
  }, [isOpen, settings.isAuthenticated, settings.artistName]);

  if (!isOpen) return null;

  const handleLogin = () => {
    setIsPosting(true);
    // Simulate OAuth delay
    setTimeout(() => {
      onUpdateSettings({ isAuthenticated: true });
      setStep('compose');
      setIsPosting(false);
    }, 1500);
  };

  const handleSubmit = async () => {
    if (!title || !artist) return;
    
    setIsPosting(true);
    // Save the artist name for future
    onUpdateSettings({ artistName: artist });
    
    await onPost({ title, artist });
    
    setIsPosting(false);
    setStep('success');
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="text-blue-500" />
            <span>作品を投稿 (Share)</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">
            <XIcon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* Step 1: Auth */}
          {step === 'auth' && (
            <div className="text-center space-y-6 py-8">
              <h3 className="text-lg font-medium">Connect Account</h3>
              <p className="text-gray-500">Please connect your X account to post your calligraphy.</p>
              <button 
                onClick={handleLogin}
                disabled={isPosting}
                className="w-full bg-black text-white py-3 rounded-full font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-3"
              >
                {isPosting ? <Loader2 className="animate-spin" /> : <Twitter fill="currentColor" />}
                Connect with X
              </button>
              <p className="text-xs text-gray-400">This mimics an OAuth 2.0 flow.</p>
            </div>
          )}

          {/* Step 2: Compose */}
          {step === 'compose' && (
            <div className="space-y-6">
               {previewImage && (
                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  <img src={previewImage} alt="Preview" className="h-full object-contain" />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">作品名 (Title)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="無心 (Mushin)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">作家名 (Artist Name)</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <button 
                onClick={handleSubmit}
                disabled={isPosting || !title || !artist}
                className={`w-full py-3 rounded-full font-bold flex items-center justify-center gap-2 text-white transition-all
                  ${!title || !artist 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-[#1da1f2] hover:bg-[#1a91da] shadow-lg hover:shadow-xl'
                  }`}
              >
                 {isPosting ? <Loader2 className="animate-spin" /> : <Twitter fill="currentColor" />}
                 Post to X
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">投稿完了！</h3>
              <p className="text-gray-600">Your masterpiece has been shared.</p>
              <button 
                onClick={onClose}
                className="mt-6 px-8 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                閉じる (Close)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};