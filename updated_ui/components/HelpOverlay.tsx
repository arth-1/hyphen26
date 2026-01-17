import { X, Video, Headphones, FileText, MessageCircle, PlayCircle, Volume2 } from 'lucide-react';

interface HelpOverlayProps {
  onClose: () => void;
  viewMode: 'simple' | 'smart';
}

export function HelpOverlay({ onClose, viewMode }: HelpOverlayProps) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-900">Help & Support</p>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Help Options */}
        <div className="space-y-4">
          {/* Video Tutorials */}
          <button className="w-full bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Video className="w-8 h-8 text-rose-500" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white mb-1">Video Tutorials</p>
              <p className="text-white/90 text-sm">Watch step-by-step guides</p>
              <div className="flex items-center gap-2 mt-2">
                <PlayCircle className="w-4 h-4 text-white" />
                <span className="text-white text-xs">12 videos available</span>
              </div>
            </div>
          </button>

          {/* Audio Guide */}
          <button className="w-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Headphones className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white mb-1">Audio Guide</p>
              <p className="text-white/90 text-sm">Listen to instructions</p>
              <div className="flex items-center gap-2 mt-2">
                <Volume2 className="w-4 h-4 text-white" />
                <span className="text-white text-xs">Available in 5 languages</span>
              </div>
            </div>
          </button>

          {/* Text Instructions */}
          <button className="w-full bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-left flex-1">
              <p className="text-white mb-1">Text Instructions</p>
              <p className="text-white/90 text-sm">Read detailed guides</p>
              <div className="flex items-center gap-2 mt-2">
                <FileText className="w-4 h-4 text-white" />
                <span className="text-white text-xs">Easy to follow steps</span>
              </div>
            </div>
          </button>

          {/* Live Chat */}
          <button className="w-full bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl p-6 flex items-start gap-4 hover:shadow-lg transition-all active:scale-95">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 relative">
              <MessageCircle className="w-8 h-8 text-teal-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="text-left flex-1">
              <p className="text-white mb-1">Live Chat Support</p>
              <p className="text-white/90 text-sm">Chat with our support team</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-white text-xs">Available 24/7</span>
              </div>
            </div>
          </button>
        </div>

        {/* Quick Tips */}
        <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
          <p className="text-amber-900 mb-3 text-sm">Quick Tips</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-amber-800 text-xs">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Tap the toggle button to switch between Simple and Smart view</span>
            </li>
            <li className="flex items-start gap-2 text-amber-800 text-xs">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Use voice commands for hands-free banking</span>
            </li>
            <li className="flex items-start gap-2 text-amber-800 text-xs">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Change language from the globe icon</span>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="mt-4 text-center">
          <p className="text-gray-600 text-xs">Need more help?</p>
          <p className="text-teal-600 text-sm">Call: 1800-123-4567</p>
        </div>
      </div>
    </div>
  );
}
