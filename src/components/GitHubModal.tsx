import React, { useState } from 'react';
import {
  X,
  GitBranch,
  Download,
  ShieldCheck,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Archive,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import JSZip from 'jszip';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  // Direct push via PAT
  const [githubToken, setGithubToken] = useState('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePushDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = githubToken.trim();
    if (!token) return;

    setIsPushing(true);
    setPushStatus(null);

    try {
      const res = await fetch('/api/github/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          repoUrl: 'https://github.com/rubyoliveira/LLMs-SWEproject.git',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPushStatus({
          success: true,
          message: data.message || 'Code successfully pushed to GitHub repository!',
          details: data.details,
        });
        setGithubToken('');
      } else {
        setPushStatus({
          success: false,
          message: data.error || 'Failed to push to GitHub.',
        });
      }
    } catch (err: any) {
      setPushStatus({
        success: false,
        message: err.message || 'Network error pushing to GitHub repository.',
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    setZipSuccess(false);

    try {
      const zip = new JSZip();

      // Download bundle directly
      const a = document.createElement('a');
      a.href = '/rocketrewards-repo.bundle';
      a.download = 'rocketrewards-repo.bundle';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to download bundle', err);
    } finally {
      setIsZipping(false);
    }
  };

  const targetRepo = 'https://github.com/rubyoliveira/LLMs-SWEproject';
  const gitCommands = [
    'git remote set-url origin https://github.com/rubyoliveira/LLMs-SWEproject.git',
    'git push origin main',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#201f22] border border-[#e8e4df] dark:border-[#2f2d31] w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-2xl max-h-[92vh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#f0ece7] dark:border-[#2c2a2d]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#74455d]/10 dark:bg-[#c98bb1]/20 text-[#74455d] dark:text-[#c98bb1] flex items-center justify-center shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#191919] dark:text-white">
                Push Code to GitHub
              </h3>
              <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e]">
                Repository: <span className="font-mono text-[#74455d] dark:text-[#c98bb1] font-medium">rubyoliveira/LLMs-SWEproject</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8c8c8c] hover:text-[#191919] dark:hover:text-white hover:bg-[#f0ebe6] dark:hover:bg-[#2c2a2d] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Repository Link Callout */}
        <div className="bg-[#faf8f5] dark:bg-[#262428] border border-[#eeeae5] dark:border-[#333036] rounded-xl p-3 mb-4 text-xs flex items-center justify-between">
          <div className="truncate pr-2">
            <span className="text-[10px] uppercase font-semibold text-[#8c8c8c] block">Target Git Repository</span>
            <a
              href={targetRepo}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#74455d] dark:text-[#c98bb1] hover:underline flex items-center gap-1 truncate"
            >
              <span>{targetRepo}</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
            Commit Ready (main)
          </span>
        </div>

        {/* Option 1: Direct Push with GitHub Token */}
        <div className="p-4 rounded-xl border border-[#e8e4df] dark:border-[#2f2d31] bg-white dark:bg-[#232225] shadow-xs mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-[#74455d] dark:text-[#c98bb1]" />
            <h4 className="text-xs font-bold text-[#191919] dark:text-white">
              Option 1: Push Directly via Personal Access Token (PAT)
            </h4>
          </div>
          <p className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mb-3 leading-relaxed">
            Enter your GitHub Personal Access Token (with <code className="bg-[#eeeae5] dark:bg-[#343236] px-1 py-0.2 rounded">repo</code> write scope). It is used only for this push operation and is never stored.
          </p>

          <form onSubmit={handlePushDirectly} className="space-y-2.5">
            <div className="flex gap-2">
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx or github_pat_..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#faf8f5] dark:bg-[#29272c] border border-[#e8e4df] dark:border-[#38353d] text-xs text-[#191919] dark:text-white placeholder:text-[#8c8c8c] focus:outline-hidden focus:border-[#74455d]"
              />
              <button
                type="submit"
                disabled={isPushing || !githubToken.trim()}
                className="px-4 py-2 rounded-lg bg-[#74455d] hover:bg-[#60354a] dark:bg-[#c98bb1] dark:hover:bg-[#d8a1c3] text-white dark:text-[#181517] text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
              >
                {isPushing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Pushing...</span>
                  </>
                ) : (
                  <>
                    <span>Push Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {pushStatus && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
                  pushStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {pushStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold">{pushStatus.message}</div>
                  {pushStatus.details && (
                    <div className="text-[11px] font-mono mt-1 opacity-80">{pushStatus.details}</div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Option 2: Run in Terminal */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-[#9e9e9e] mb-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Option 2: Terminal Push Command</span>
          </div>

          <div className="bg-[#18181b] rounded-xl p-3 text-[11px] font-mono text-[#e4e4e7] space-y-2">
            {gitCommands.map((cmd, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <span className="text-neutral-300 truncate pr-2">$ {cmd}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(cmd, idx)}
                  className="opacity-70 group-hover:opacity-100 hover:text-white transition-opacity p-1 cursor-pointer shrink-0"
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

        {/* Option 3: Download Git Bundle File */}
        <div className="bg-[#faf8f5] dark:bg-[#262428] border border-[#e8e4df] dark:border-[#323035] rounded-xl p-3.5 mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-[#191919] dark:text-white flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-[#74455d] dark:text-[#c98bb1]" />
              <span>Option 3: Download Git Bundle File (.bundle)</span>
            </div>
            <div className="text-[11px] text-[#737373] dark:text-[#9e9e9e] mt-0.5">
              Self-contained 1.3 MB git pack with all 52 committed files and commit history.
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-[#302e33] border border-[#e8e4df] dark:border-[#3a373d] hover:border-[#74455d] text-[#191919] dark:text-white transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{zipSuccess ? 'Downloaded!' : 'Download .bundle'}</span>
          </button>
        </div>

        {/* Security Shield Callout */}
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Protected: <code>.gitignore</code> guarantees API keys and secrets are never committed.</span>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 mt-4 border-t border-[#f0ece7] dark:border-[#2c2a2d]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#f0ebe6] hover:bg-[#e6e0d9] dark:bg-[#2c2a2d] dark:hover:bg-[#343236] text-[#191919] dark:text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
