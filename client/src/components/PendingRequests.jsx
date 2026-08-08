import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Inbox, Send } from 'lucide-react';
import api from '../services/api';

const PendingRequests = ({ onRequestHandled }) => {
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const fetchRequests = async () => {
    try {
      const res = await api.get('/friends/requests');
      setIncoming(res.data.incoming || []);
      setOutgoing(res.data.outgoing || []);
    } catch (err) {
      console.error('[PendingRequests Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await api.post('/friends/accept', { requestId });
      fetchRequests();
      if (onRequestHandled) onRequestHandled();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleDecline = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [requestId]: true }));
    try {
      await api.post('/friends/decline', { requestId });
      fetchRequests();
      if (onRequestHandled) onRequestHandled();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setActionLoading((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 text-xs gap-2">
        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        Loading friend requests...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900/50 overflow-y-auto p-4 space-y-6">
      {/* Incoming Requests Section */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Inbox className="w-4 h-4 text-emerald-400" />
          Incoming Requests ({incoming.length})
        </div>

        {incoming.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            No incoming friend requests.
          </p>
        ) : (
          <div className="space-y-2.5">
            {incoming.map((req) => (
              <div
                key={req.requestId}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.user.avatar}
                    alt={req.user.username}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-slate-200 truncate">
                      {req.user.fullName || req.user.username}
                    </h5>
                    <p className="text-xs text-slate-400 truncate">@{req.user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAccept(req.requestId)}
                    disabled={actionLoading[req.requestId]}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-all flex items-center gap-1 shadow"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    [ Accept ]
                  </button>
                  <button
                    onClick={() => handleDecline(req.requestId)}
                    disabled={actionLoading[req.requestId]}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-all flex items-center gap-1 border border-slate-700"
                  >
                    <UserX className="w-3.5 h-3.5 text-rose-400" />
                    [ Decline ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Outgoing Requests Section */}
      <div>
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Send className="w-4 h-4 text-amber-400" />
          Sent Pending Requests ({outgoing.length})
        </div>

        {outgoing.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-xl border border-slate-800/60">
            No outgoing pending requests.
          </p>
        ) : (
          <div className="space-y-2.5">
            {outgoing.map((req) => (
              <div
                key={req.requestId}
                className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.user.avatar}
                    alt={req.user.username}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-800 bg-slate-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-slate-200 truncate">
                      {req.user.fullName || req.user.username}
                    </h5>
                    <p className="text-xs text-slate-400 truncate">@{req.user.username}</p>
                  </div>
                </div>

                <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium rounded-xl flex items-center gap-1.5 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  [ Pending ]
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;
