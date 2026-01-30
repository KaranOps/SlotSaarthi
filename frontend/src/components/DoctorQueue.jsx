import { useState, useEffect, useCallback } from 'react';
import { queueAPI } from '../api/client';

const REFRESH_INTERVAL = 30000; // 30 seconds

/**
 * Get background color class based on patient type
 */
const getPatientTypeStyles = (patientType) => {
    switch (patientType) {
        case 'Emergency':
            return {
                bg: 'bg-gradient-to-r from-red-500/20 to-red-600/10',
                border: 'border-red-500/50',
                badge: 'bg-red-500 text-white',
                text: 'text-red-400'
            };
        case 'Paid':
            return {
                bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-600/10',
                border: 'border-amber-500/50',
                badge: 'bg-amber-500 text-black',
                text: 'text-amber-400'
            };
        default:
            return {
                bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-600/10',
                border: 'border-blue-500/50',
                badge: 'bg-blue-500 text-white',
                text: 'text-blue-400'
            };
    }
};

/**
 * DoctorQueue Component
 * Displays the live queue for a doctor with auto-refresh
 */
export default function DoctorQueue({ doctorId }) {
    const [queueData, setQueueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);

    const fetchQueue = useCallback(async () => {
        if (!doctorId) {
            setLoading(false);
            return;
        }

        try {
            const response = await queueAPI.get(doctorId);
            setQueueData(response.data.data);
            setError(null);
            setLastRefresh(new Date());
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch queue');
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    // Initial fetch and auto-refresh setup
    useEffect(() => {
        fetchQueue();

        const interval = setInterval(fetchQueue, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchQueue]);

    // Manual refresh
    const handleRefresh = () => {
        setLoading(true);
        fetchQueue();
    };

    if (!doctorId) {
        return (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 text-center">
                <p className="text-slate-400">Select a doctor to view the queue</p>
            </div>
        );
    }

    if (loading && !queueData) {
        return (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8">
                <div className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-cyan-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-slate-400">Loading queue...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
                <p className="text-red-400">{error}</p>
                <button
                    onClick={handleRefresh}
                    className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const { slot, tokens, isUpcoming, message } = queueData || {};

    return (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </span>
                        Live Queue
                    </h2>

                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg text-slate-300 transition-all duration-300"
                    >
                        <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>

                {/* Slot Info */}
                {slot && (
                    <div className="mt-4 flex items-center gap-4 text-sm">
                        <div className={`px-3 py-1 rounded-full ${isUpcoming ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'}`}>
                            {isUpcoming ? 'Upcoming Slot' : 'Active Slot'}
                        </div>
                        <span className="text-slate-400">
                            {new Date(slot.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            {' - '}
                            {new Date(slot.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        <span className="text-slate-500">|</span>
                        <span className="text-slate-400">
                            {slot.currentCount || 0} / {slot.maxCapacity} patients
                        </span>
                    </div>
                )}

                {/* Last refresh time */}
                {lastRefresh && (
                    <p className="mt-2 text-xs text-slate-500">
                        Last updated: {lastRefresh.toLocaleTimeString()} (Auto-refresh every 30s)
                    </p>
                )}
            </div>

            {/* Queue List */}
            <div className="p-6">
                {message ? (
                    <div className="text-center py-8">
                        <p className="text-slate-400">{message}</p>
                    </div>
                ) : tokens && tokens.length > 0 ? (
                    <div className="space-y-3">
                        {tokens.map((token, index) => {
                            const styles = getPatientTypeStyles(token.patientType);
                            return (
                                <div
                                    key={token._id}
                                    className={`${styles.bg} ${styles.border} border rounded-xl p-4 transition-all duration-300 hover:scale-[1.01]`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Queue Position */}
                                            <div className="w-10 h-10 bg-slate-800/50 rounded-lg flex items-center justify-center">
                                                <span className="text-lg font-bold text-white">#{index + 1}</span>
                                            </div>

                                            {/* Token Info */}
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-white">{token.patientName}</span>
                                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles.badge}`}>
                                                        {token.patientType.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-400 mt-1">
                                                    Token: <span className={styles.text}>{token.tokenID}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="text-right">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${token.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                                                    token.status === 'Pending' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                {token.status}
                                            </span>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Priority: {token.finalPriorityScore.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <p className="text-slate-400">No patients in queue</p>
                        <p className="text-sm text-slate-500 mt-1">Book a token to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
}
