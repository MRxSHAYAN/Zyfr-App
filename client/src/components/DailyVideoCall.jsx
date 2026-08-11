import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { X, Video, ShieldAlert } from 'lucide-react';

const DailyVideoCall = ({ roomUrl, onClose, callerInfo }) => {
  const containerRef = useRef(null);
  const callFrameRef = useRef(null);
  const [isJoining, setIsJoining] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!containerRef.current || !roomUrl) return;

    try {
      const callFrame = DailyIframe.createFrame(containerRef.current, {
        showLeaveButton: true,
        showFullscreenButton: true,
        iframeStyle: {
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '16px',
        },
      });

      callFrameRef.current = callFrame;

      callFrame
        .join({ url: roomUrl })
        .then(() => setIsJoining(false))
        .catch((err) => {
          console.error('[Daily Call Error]:', err);
          setErrorMsg('Unable to connect to the video room.');
          setIsJoining(false);
        });

      callFrame.on('left-meeting', () => onClose());

      return () => {
        callFrameRef.current?.destroy();
      };
    } catch (err) {
      console.error('[Daily Init Error]:', err);
      setErrorMsg('Failed to load video call component.');
      setIsJoining(false);
    }
  }, [roomUrl]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Video call"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="card w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-glass-dark animate-scale-in">

        {/* Header */}
        <header className="px-5 py-3.5 bg-surface-50 dark:bg-surface-950/80 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-500/10 text-primary-500 dark:text-primary-400 rounded-xl border border-primary-200 dark:border-primary-500/20">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900 dark:text-surface-100 text-sm">
                {callerInfo
                  ? `Video Call with ${callerInfo.fullName || callerInfo.username}`
                  : 'ZYFR Video Call'}
              </h3>
              <p className="text-xs text-surface-400">Powered by Daily.co • Encrypted</p>
            </div>
          </div>
          <button
            onClick={() => { callFrameRef.current?.leave(); onClose(); }}
            aria-label="Close video call"
            className="p-2 text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Video frame */}
        <div className="flex-1 relative bg-surface-950">
          {isJoining && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-surface-400 z-10">
              <span className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-surface-300">Connecting to video room…</p>
            </div>
          )}

          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-rose-400 z-10 bg-surface-950 p-6 text-center">
              <ShieldAlert className="w-12 h-12 text-rose-500" />
              <p className="text-base font-semibold text-surface-200">{errorMsg}</p>
              <button
                onClick={onClose}
                className="mt-2 btn-ghost border border-surface-700"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" aria-label="Video call frame" />
        </div>
      </div>
    </div>
  );
};

export default DailyVideoCall;
