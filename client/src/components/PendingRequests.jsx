import React, { useState, useEffect } from 'react';
import { UserCheck, UserX, Clock, Inbox, Send } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
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

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (requestId) => {
    setActionLoading((p) => ({ ...p, [requestId]: true }));
    try {
      await api.post('/friends/accept', { requestId });
      fetchRequests();
      onRequestHandled?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setActionLoading((p) => ({ ...p, [requestId]: false }));
    }
  };

  const handleDecline = async (requestId) => {
    setActionLoading((p) => ({ ...p, [requestId]: true }));
    try {
      await api.post('/friends/decline', { requestId });
      fetchRequests();
      onRequestHandled?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setActionLoading((p) => ({ ...p, [requestId]: false }));
    }
  };

  if (loading) return <SkeletonLoader variant="friendRow" count={4} />;

  const hasAny = incoming.length > 0 || outgoing.length > 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-6">

      {/* ── Incoming ─────────────────────────────── */}
      <section aria-label="Incoming friend requests">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
          <Inbox className="w-4 h-4 text-primary-400" />
          Incoming ({incoming.length})
        </div>

        {incoming.length === 0 ? (
          <p className="text-xs text-surface-400 dark:text-surface-500 italic px-3 py-2.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800">
            No incoming requests.
          </p>
        ) : (
          <div className="space-y-2.5">
            {incoming.map((req) => (
              <div key={req.requestId} className="card p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.user.avatar}
                    alt={req.user.username}
                    className="w-10 h-10 rounded-xl object-cover border border-surface-200 dark:border-surface-700 bg-surface-200 dark:bg-surface-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
                      {req.user.fullName || req.user.username}
                    </h5>
                    <p className="text-xs text-surface-400 truncate">@{req.user.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleAccept(req.requestId)}
                    disabled={actionLoading[req.requestId]}
                    className="btn-primary text-xs px-3 py-2"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={() => handleDecline(req.requestId)}
                    disabled={actionLoading[req.requestId]}
                    className="btn-danger text-xs px-3 py-2"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Outgoing ─────────────────────────────── */}
      <section aria-label="Outgoing friend requests">
        <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-surface-400">
          <Send className="w-4 h-4 text-amber-400" />
          Sent ({outgoing.length})
        </div>

        {outgoing.length === 0 ? (
          <p className="text-xs text-surface-400 dark:text-surface-500 italic px-3 py-2.5 bg-surface-50 dark:bg-surface-900/50 rounded-xl border border-surface-200 dark:border-surface-800">
            No pending sent requests.
          </p>
        ) : (
          <div className="space-y-2.5">
            {outgoing.map((req) => (
              <div key={req.requestId} className="card p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.user.avatar}
                    alt={req.user.username}
                    className="w-10 h-10 rounded-xl object-cover border border-surface-200 dark:border-surface-700 bg-surface-200 dark:bg-surface-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-sm font-semibold text-surface-800 dark:text-surface-100 truncate">
                      {req.user.fullName || req.user.username}
                    </h5>
                    <p className="text-xs text-surface-400 truncate">@{req.user.username}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 text-xs font-medium rounded-xl shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {!hasAny && (
        <div className="text-center py-8 text-surface-400 dark:text-surface-500 text-xs">
          No active friend requests.
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
