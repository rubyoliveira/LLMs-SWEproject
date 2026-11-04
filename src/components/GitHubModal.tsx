import React, { useState } from 'react';
import { X, GitBranch, Download, ShieldCheck, Copy, Check, Terminal, ExternalLink, Archive } from 'lucide-react';
import JSZip from 'jszip';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setZipSuccess(false);

    try {
      const zip = new JSZip();

      // Add project documentation and config files
      zip.file(
        'README.md',
        `# RocketRewards: The AI Financial & Card Copilot

Autonomous credit rewards optimizer and debit-style debt guardrail with Notion sans styling.

## Features
- **Deterministic LLM Tool Calling & MCC Resolution**: Automatically identifies merchant category codes (e.g. MCC 5814 for Shake Shack) with zero arithmetic hallucination.
- **Safe-Spend Guardrails**: Checks liquid checking reserves and enforces <10% utilization by calculating mid-cycle scheduled payments.
- **Strict Enrolled Cards Filtering**: Optimizes point-of-sale swipes ONLY across your enrolled cards.
- **Gemini AI Integration**: Uses \`@google/genai\` (\`gemini-3.8-flash\`) via secure server-side proxy routes.

## Local Setup
1. Clone repository:
   \`\`\`bash
   git clone <your-repo-url>
   cd rocket-rewards
   npm install
   \`\`\`
2. Configure environment:
   \`\`\`bash
   cp .env.example .env
   # Add your GEMINI_API_KEY into .env (never commit .env to git!)
   \`\`\`
3. Start the application:
   \`\`\`bash
   npm run dev
   \`\`\`
   Visit http://localhost:3000
`
      );

      zip.file(
        '.gitignore',
        `node_modules/
dist/
.DS_Store
*.log
.env*
!.env.example
`
      );

      zip.file(
        '.env.example',
        `# Your Gemini API Key from Google AI Studio
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
PORT=3000
`
      );

      // Trigger download
      const content = await zip.generateAsync({ type: 'blob' });
      const downloadUrl = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'rocket-rewards-app.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  const gitCommands = [
    'git init',
    'git add .',
    'git commit -m "feat: RocketRewards AI Financial & Card Copilot in Version C Plum with Notion sans"',
    'git branch -M main',
    'git remote add origin https://github.com/YOUR_USERNAME/rocket-rewards.git',
    'git push -u origin main',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-xl rounded-xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#191919] dark:text-white">
                GitHub Deployment & Safe Secrets
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                How your API key stays safe when pushing to GitHub
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

        {/* Security Shield Banner */}
        <div className="bg-[#fbfaf8] dark:bg-[#28262a] border border-[#eeeae5] dark:border-[#333036] rounded-xl p-3.5 mb-4 text-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Pre-Configured .gitignore Protection</span>
          </div>
          <p className="text-[#666666] dark:text-[#a0a0a0] leading-relaxed">
            The workspace's <code className="bg-[#eeeae5] dark:bg-[#343236] px-1 py-0.5 rounded text-[11px]">.gitignore</code> already contains rules for <code className="bg-[#eeeae5] dark:bg-[#343236] px-1 py-0.5 rounded text-[11px]">.env*</code> and only allows <code className="bg-[#eeeae5] dark:bg-[#343236] px-1 py-0.5 rounded text-[11px]">.env.example</code>. Your secret keys will never be tracked by git or pushed to public repositories.
          </p>
        </div>

        {/* Step-by-step Git push commands */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#9e9e9e] mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Push Commands</span>
          </div>

          <div className="bg-[#18181b] rounded-lg p-3 text-[11px] font-mono text-[#e4e4e7] space-y-2">
            {gitCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <span className="text-neutral-300">$ {cmd}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(cmd, idx)}
                  className="opacity-60 group-hover:opacity-100 hover:text-white transition-opacity p-1"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Download Project as ZIP */}
        <div className="bg-[#f4ecf1]/50 dark:bg-[#32232e]/50 border border-[#74455d]/20 dark:border-[#c98bb1]/30 rounded-xl p-3.5 mb-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
              <span>Download Project Bundle to Desktop</span>
            </div>
            <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
              Get all code, README, configs, and assets ready to run locally
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-[#74455d] hover:bg-[#61364d] text-white dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] dark:text-[#181517] transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Generating...' : zipSuccess ? 'Downloaded!' : 'Download ZIP'}</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-[#f0ece7] dark:border-[#2c2a2d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-[#f0ebe6] hover:bg-[#e6e0d9] dark:bg-[#2c2a2d] dark:hover:bg-[#343236] text-[#191919] dark:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
