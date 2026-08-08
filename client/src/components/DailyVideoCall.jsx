import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { X, PhoneOff, Video, Mic, ShieldAlert } from 'lucide-react';

const DailyVideoCall = ({ roomUrl, onClose, callerInfo }) => {
  const containerRef = useRef(null);
  const callFrameRef = useRef(null);
  const [isJoining, setIsJoining] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!containerRef.current || !roomUrl) return;

    try {
      // Create Daily Iframe embed inside containerRef
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
        .then(() => {
          setIsJoining(false);
        })
        .catch((err) => {
          console.error('[Daily Call Error]:', err);
          setErrorMsg('Unable to connect to Daily.co room');
          setIsJoining(false);
        });

      callFrame.on('left-meeting', () => {
        onClose();
      });

      return () => {
        if (callFrameRef.current) {
          callFrameRef.current.destroy();
        }
      };
    } catch (err) {
      console.error('[Daily Init Error]:', err);
      setErrorMsg('Failed to load video call component');
      setIsJoining(false);
    }
  }, [roomUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden relative">
        {/* Call Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm md:text-base">
                {callerInfo ? `Video Call with ${callerInfo.fullName || callerInfo.username}` : 'ZYFR Encrypted Video Call'}
              </h3>
              <p className="text-xs text-slate-400">Powered by Daily.co • End-to-End Realtime Video</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (callFrameRef.current) {
                callFrameRef.current.leave();
              }
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all"
            title="Close Call Window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Frame Container */}
        <div className="flex-1 w-full h-full relative bg-slate-950">
          {isJoining && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 z-0">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-slate-300">Connecting to secure video room...</p>
            </div>
          )}

          {errorMsg && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-rose-400 z-10 bg-slate-950 p-6 text-center">
              <ShieldAlert className="w-12 h-12 text-rose-500" />
              <p className="text-base font-semibold">{errorMsg}</p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all"
              >
                Dismiss
              </button>
            </div>
          )}

          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default DailyVideoCall;
