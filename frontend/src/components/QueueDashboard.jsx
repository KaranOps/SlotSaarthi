import { useState, useEffect, useCallback } from 'react';
import { Card, Button } from './ui';
import { queueAPI, tokenAPI } from '../api/client';

const REFRESH_INTERVAL = 15000; // 15 seconds

/**
 * Get badge styles based on patient type (Teal theme)
 */
const getPatientTypeBadge = (type) => {
    switch (type) {
        case 'Emergency':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'Paid':
            return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'Online':
            return 'bg-teal-100 text-teal-800 border-teal-200';
        case 'Walk_in':
            return 'bg-slate-100 text-slate-800 border-slate-200';
        case 'Follow_up':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
            return 'bg-slate-100 text-slate-800 border-slate-200';
    }
};

/**
 * QueueDashboard Component
 * Medoc-inspired Live Status board with Cancel/No-Show actions
 */
export default function QueueDashboard({ doctorId }) {
    const [queueData, setQueueData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastRefresh, setLastRefresh] = useState(null);
    const [calling, setCalling] = useState(false);
    const [actionLoading, setActionLoading] = useState(null); // Track which token action is loading

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
            setError(err.response?.data?.message || 'Failed to load queue');
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    // Initial fetch and auto-refresh
    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchQueue]);

    const handleCallNext = async () => {
        setCalling(true);
        try {
            await tokenAPI.callNext(doctorId);
            await fetchQueue();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to call next patient');
        } finally {
            setCalling(false);
        }
    };

    /**
     * Cancel a token with confirmation
     */
    const handleCancel = async (tokenId, patientName) => {
        if (!confirm(`Are you sure you want to cancel ${patientName}'s appointment?`)) {
            return;
        }

        setActionLoading(tokenId);
        // Optimistic UI - remove from local state immediately
        setQueueData(prev => ({
            ...prev,
            waitingList: prev.waitingList.filter(t => t._id !== tokenId)
        }));

        try {
            await tokenAPI.cancel(tokenId);
            await fetchQueue(); // Sync with server
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel token');
            await fetchQueue(); // Revert optimistic update
        } finally {
            setActionLoading(null);
        }
    };

    /**
     * Mark a token as No-Show with confirmation
     */
    const handleNoShow = async (tokenId, patientName) => {
        if (!confirm(`Mark ${patientName} as No-Show?`)) {
            return;
        }

        setActionLoading(tokenId);
        // Optimistic UI - remove from local state immediately
        setQueueData(prev => ({
            ...prev,
            waitingList: prev.waitingList.filter(t => t._id !== tokenId)
        }));

        try {
            await tokenAPI.markNoShow(tokenId);
            await fetchQueue(); // Sync with server
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark as no-show');
            await fetchQueue(); // Revert optimistic update
        } finally {
            setActionLoading(null);
        }
    };

    if (!doctorId) {
        return (
            <Card className="text-center py-12">
                <p className="text-slate-500">Select a doctor to view the queue</p>
            </Card>
        );
    }

    if (loading && !queueData) {
        return (
            <Card className="text-center py-12">
                <div className="animate-pulse">
                    <div className="h-4 w-32 bg-slate-200 rounded mx-auto" />
                </div>
            </Card>
        );
    }

    const { doctor, currentToken, nextToken, waitingList = [] } = queueData || {};

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800">Live Queue Status</h2>
                    {doctor && (
                        <p className="text-sm text-slate-500 mt-0.5">
                            {doctor.name} - {doctor.specialty}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {lastRefresh && (
                        <span className="text-xs text-slate-400">
                            Updated {lastRefresh.toLocaleTimeString()}
                        </span>
                    )}
                    <Button variant="outline" size="sm" onClick={fetchQueue}>
                        Refresh
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                    <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
                </div>
            )}

            {/* Current Token Display */}
            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
                <div className="text-center">
                    <p className="text-sm font-medium text-teal-600 uppercase tracking-wide">Now Serving</p>
                    {currentToken ? (
                        <>
                            <p className="text-3xl md:text-4xl font-bold text-slate-800 mt-2">{currentToken.tokenID}</p>
                            <p className="text-base md:text-lg text-slate-700 mt-2">{currentToken.patientName}</p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mt-2 ${getPatientTypeBadge(currentToken.patientType)}`}>
                                {currentToken.patientType}
                            </span>
                        </>
                    ) : (
                        <p className="text-xl md:text-2xl text-slate-400 mt-4">No Active Patient</p>
                    )}
                </div>
            </Card>

            {/* Call Next Button */}
            <Button
                onClick={handleCallNext}
                loading={calling}
                className="w-full"
                size="lg"
                disabled={waitingList.length === 0}
            >
                Call Next Patient
            </Button>

            {/* Next Token Preview */}
            {nextToken && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Up Next</p>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <p className="font-semibold text-slate-900">{nextToken.tokenID}</p>
                            <p className="text-sm text-slate-600">{nextToken.patientName}</p>
                        </div>
                        <div className="sm:text-right">
                            <p className="text-sm font-medium text-slate-700">{nextToken.scheduledStartTime}</p>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getPatientTypeBadge(nextToken.patientType)}`}>
                                {nextToken.patientType}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Waiting List */}
            <Card title="Waiting List" subtitle={`${waitingList.length} patients waiting`}>
                {waitingList.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        No patients in queue
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                        {waitingList.map((token, index) => (
                            <div
                                key={token._id}
                                className="py-3 flex items-center justify-between gap-2"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-teal-100 flex-shrink-0 flex items-center justify-center text-sm font-medium text-teal-700">
                                        {index + 1}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900 text-sm md:text-base truncate">{token.patientName}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="truncate">{token.tokenID}</span>
                                            {token.waitTimeMinutes !== undefined && (
                                                <span className="text-amber-600 flex-shrink-0">• {token.waitTimeMinutes}m</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-slate-700">{token.scheduledStartTime}</p>
                                        <div className="flex items-center justify-end gap-1.5 mt-1">
                                            {token.effectivePriorityScore !== undefined && (
                                                <span className="text-xs text-teal-600 font-medium">
                                                    P:{token.effectivePriorityScore.toFixed(1)}
                                                </span>
                                            )}
                                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${getPatientTypeBadge(token.patientType)}`}>
                                                {token.patientType.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1">
                                        {/* No-Show Button */}
                                        <button
                                            onClick={() => handleNoShow(token._id, token.patientName)}
                                            disabled={actionLoading === token._id}
                                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Mark as No-Show"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>

                                        {/* Cancel Button */}
                                        <button
                                            onClick={() => handleCancel(token._id, token.patientName)}
                                            disabled={actionLoading === token._id}
                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                            title="Cancel Appointment"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
