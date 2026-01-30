import { useState } from 'react';
import { tokenAPI } from '../api/client';

const PATIENT_TYPES = ['Emergency', 'Paid', 'Online', 'Walk_in', 'Follow_up'];

/**
 * BookingForm Component
 * Allows patients to book a token by selecting patient type
 */
export default function BookingForm({ doctorId, onBookingComplete }) {
    const [patientName, setPatientName] = useState('');
    const [patientType, setPatientType] = useState('Walk_in');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bookedToken, setBookedToken] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!patientName.trim()) {
            setError('Please enter patient name');
            return;
        }

        if (!doctorId) {
            setError('Please select a doctor first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await tokenAPI.book({
                doctorId,
                patientType,
                patientName: patientName.trim()
            });

            setBookedToken(response.data.data);
            setPatientName('');
            setPatientType('Walk_in');

            if (onBookingComplete) {
                onBookingComplete(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book token');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setBookedToken(null);
        setError(null);
    };

    // Show success state after booking
    if (bookedToken) {
        return (
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-2xl p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Token Booked Successfully!</h3>

                    <div className="bg-slate-800/50 rounded-xl p-6 mt-6 text-left">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-slate-400 text-sm">Token ID</p>
                                <p className="text-2xl font-bold text-amber-400">{bookedToken.tokenID}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Patient Type</p>
                                <p className="text-lg font-semibold text-white">{bookedToken.patientType}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Patient Name</p>
                                <p className="text-lg font-semibold text-white">{bookedToken.patientName}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Estimated Time</p>
                                <p className="text-lg font-semibold text-cyan-400">{bookedToken.estimatedTime}</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={resetForm}
                        className="mt-6 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300"
                    >
                        Book Another Token
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </span>
                Book New Token
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Patient Name */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Patient Name
                    </label>
                    <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Enter patient name"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                    />
                </div>

                {/* Patient Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Patient Type
                    </label>
                    <select
                        value={patientType}
                        onChange={(e) => setPatientType(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 cursor-pointer"
                    >
                        {PATIENT_TYPES.map((type) => (
                            <option key={type} value={type} className="bg-slate-800">
                                {type.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                    <p className="mt-2 text-sm text-slate-500">
                        Priority: Emergency (Highest) &gt; Paid &gt; Online &gt; Walk-in &gt; Follow-up (Lowest)
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading || !doctorId}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Booking...
                        </span>
                    ) : (
                        'Book Token'
                    )}
                </button>
            </form>
        </div>
    );
}
