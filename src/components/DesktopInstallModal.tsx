import React, { useState, useEffect } from 'react';
import { X, Monitor, Download, CheckCircle2, ArrowRight, Laptop } from 'lucide-react';

interface DesktopInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopInstallModal: React.FC<DesktopInstallModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on Desktop:\n\n• Chrome / Edge: Click the Install icon in the right side of the address bar, or Menu (⋮) → "Install RocketRewards".\n• Safari (macOS Sonoma+): File → "Add to Dock".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-md rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#191919] dark:text-white">
                Download Desktop App
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Install RocketRewards as a standalone desktop window
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-3 bg-[#fbfaf8] dark:bg-[#28262a] rounded-xl border border-[#eeeae5] dark:border-[#333036]">
            <div className="font-semibold text-[#191919] dark:text-white mb-1">
              Zero Distraction Desktop Mode
            </div>
            <p className="text-[#666666] dark:text-[#a0a0a0] leading-relaxed text-[11px]">
              Launches instantly from your macOS Dock or Windows Taskbar in its own dedicated, high-speed window with offline support and keyboard shortcuts.
            </p>
          </div>

          <div className="space-y-2 text-[11px] text-[#525252] dark:text-[#a3a3a3]">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#f4ecf1] dark:bg-[#32232e] text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0 font-bold text-[10px]">
                1
              </span>
              <span>Click the <strong>Install Desktop App</strong> button below.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#f4ecf1] dark:bg-[#32232e] text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0 font-bold text-[10px]">
                2
              </span>
              <span>Confirm "Install" in your browser prompt.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-[#f4ecf1] dark:bg-[#32232e] text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0 font-bold text-[10px]">
                3
              </span>
              <span>RocketRewards will appear in your Applications folder and desktop!</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#666666] dark:text-[#a0a0a0] hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install Desktop App</span>
          </button>
        </div>
      </div>
    </div>
  );
};
