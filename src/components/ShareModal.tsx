import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Users,
  Globe,
  Sparkles,
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  // Compute the current live app URL (or fallback to production cloud run URL)
  const appUrl =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://ais-pre-3uvqzy6aci4aqgpg3eexzk-536298125508.us-west1.run.app';

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      onShowToast('Public link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Could not copy link automatically.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RocketRewards — AI Financial & Card Copilot',
          text: 'Optimize your credit card rewards and safe spend in real-time with RocketRewards powered by Gemini 3.8 Flash.',
          url: appUrl,
        });
        onShowToast('Shared successfully!');
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    appUrl
  )}&margin=8`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#191919] dark:text-white">
                Share RocketRewards
              </h3>
              <p className="text-xs text-[#737373] dark:text-[#9e9e9e]">
                Invite friends, test on mobile, or share with your team
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#737373] hover:text-[#191919] dark:hover:text-white hover:bg-[#f0ece7] dark:hover:bg-[#2d2b2f] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Public Link Box */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#525252] dark:text-[#b3b3b3] mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
              Direct Live App URL
            </label>
            <div className="flex items-center gap-2 bg-[#f6f4f0] dark:bg-[#181719] border border-[#e4ded6] dark:border-[#2c2a2e] rounded-xl p-1.5 pl-3">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full text-xs font-mono text-[#191919] dark:text-[#e5e5e5] bg-transparent outline-none truncate select-all"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#74455d] hover:bg-[#60394d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#ba79a1] dark:text-[#181517] rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#e4ded6] dark:border-[#2c2a2e] bg-[#fdfcfb] dark:bg-[#242327] hover:bg-[#f5f2ed] dark:hover:bg-[#2c2a2e] text-[#191919] dark:text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
              <span>Share via OS / App</span>
            </button>
            <button
              type="button"
              onClick={() => setShowQR(!showQR)}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#e4ded6] dark:border-[#2c2a2e] bg-[#fdfcfb] dark:bg-[#242327] hover:bg-[#f5f2ed] dark:hover:bg-[#2c2a2e] text-[#191919] dark:text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              <QrCode className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
              <span>{showQR ? 'Hide QR Code' : 'Scan Phone QR'}</span>
            </button>
          </div>

          {/* QR Code Expansion */}
          {showQR && (
            <div className="p-4 rounded-xl bg-[#f6f4f0] dark:bg-[#181719] border border-[#e4ded6] dark:border-[#2c2a2e] flex flex-col items-center text-center animate-in fade-in duration-200">
              <div className="bg-white p-2 rounded-xl shadow-xs border border-gray-200">
                <img
                  src={qrImageUrl}
                  alt="QR Code for RocketRewards"
                  className="w-44 h-44 object-contain rounded-lg"
                  loading="lazy"
                />
              </div>
              <p className="text-xs font-medium text-[#191919] dark:text-white mt-2.5">
                Scan with your phone camera
              </p>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Opens instantly in mobile Safari or Chrome with full touch support.
              </p>
            </div>
          )}

          {/* Two Ways to Share Section */}
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-[#8e8e8e]">
              Ways to Share & Collaborate
            </h4>

            {/* Option 1 */}
            <div className="p-3 rounded-xl bg-[#faf9f7] dark:bg-[#1c1b1e] border border-[#ece7e1] dark:border-[#29272b]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    Share the Live Web App (Direct)
                    <ExternalLink className="w-3 h-3 text-[#737373]" />
                  </h5>
                  <p className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-1 leading-relaxed">
                    Send your direct link to anyone. Anyone can open it on iOS, Android, or PC, upload their credit cards, and query Gemini 3.8 Flash without needing a Google Cloud login.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2 */}
            <div className="p-3 rounded-xl bg-[#faf9f7] dark:bg-[#1c1b1e] border border-[#ece7e1] dark:border-[#29272b]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    Google AI Studio Workspace Sharing
                    <Users className="w-3 h-3 text-[#74455d] dark:text-[#c98bb1]" />
                  </h5>
                  <p className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-1 leading-relaxed">
                    To collaborate on prompts, code, or settings: click the <span className="font-semibold text-[#191919] dark:text-white">Share</span> button in the top-right header of Google AI Studio. You can enter collaborator emails or set link access to Viewer or Editor.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 3 */}
            <div className="p-3 rounded-xl bg-[#faf9f7] dark:bg-[#1c1b1e] border border-[#ece7e1] dark:border-[#29272b]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
                    Export Code to GitHub or ZIP
                    <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </h5>
                  <p className="text-[11px] text-[#737373] dark:text-[#a0a0a0] mt-1 leading-relaxed">
                    Click the <span className="font-semibold text-[#191919] dark:text-white">GitHub / ZIP</span> button in the navigation header to download the complete standalone source repository or push it to your private/public GitHub account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#f0ece7] dark:border-[#2c2a2d] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-[#eae6e1] hover:bg-[#ded9d2] dark:bg-[#2c2a2e] dark:hover:bg-[#38353b] text-[#191919] dark:text-white rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
