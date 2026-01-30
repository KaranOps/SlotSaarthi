import { useState, useEffect } from 'react';
import { Card, Button, Select, TimeSlotGrid, Input } from './ui';
import { doctorAPI, slotAPI, tokenAPI } from '../api/client';

const PATIENT_TYPES = [
    { value: 'Emergency', label: 'Emergency' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Online', label: 'Online' },
    { value: 'Walk_in', label: 'Walk-in' },
    { value: 'Follow_up', label: 'Follow-up' }
];

/**
 * PatientBookingView Component
 * Two-step booking process with Teal theme
 */
export default function PatientBookingView({ onBookingComplete }) {
    const [step, setStep] = useState(1);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [slotsData, setSlotsData] = useState(null);
    const [selectedTime, setSelectedTime] = useState('');
    const [patientName, setPatientName] = useState('');
    const [patientType, setPatientType] = useState('Walk_in');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [bookingResult, setBookingResult] = useState(null);

    // Fetch doctors on mount
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await doctorAPI.getAll();
                setDoctors(response.data.data);
            } catch (err) {
                setError('Failed to load doctors');
            }
        };
        fetchDoctors();
    }, []);

    // Fetch available slots when doctor and date are selected
    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            fetchSlots();
        }
    }, [selectedDoctor, selectedDate]);

    const fetchSlots = async () => {
        setLoading(true);
        setError(null);
        setSlotsData(null);
        setSelectedTime('');

        try {
            const response = await slotAPI.getAvailable(selectedDoctor, selectedDate);
            setSlotsData(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load time slots');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedToStep2 = () => {
        if (!selectedDoctor || !selectedDate) {
            setError('Please select a doctor and date');
            return;
        }
        setStep(2);
    };

    const handleBookAppointment = async () => {
        if (!selectedTime || !patientName.trim()) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await tokenAPI.book({
                doctorId: selectedDoctor,
                patientType,
                patientName: patientName.trim(),
                appointmentDate: selectedDate,
                scheduledStartTime: selectedTime
            });

            setBookingResult(response.data.data);

            if (onBookingComplete) {
                onBookingComplete(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    const resetBooking = () => {
        setStep(1);
        setSelectedDoctor('');
        setSelectedDate('');
        setSlotsData(null);
        setSelectedTime('');
        setPatientName('');
        setPatientType('Walk_in');
        setBookingResult(null);
        setError(null);
    };

    // Get slots with emergency override - Emergency patients can select booked (but not past) slots
    const getDisplaySlots = () => {
        if (!slotsData?.slots) return [];

        if (patientType === 'Emergency') {
            // For Emergency: past slots stay unavailable, but booked slots become available
            return slotsData.slots.map(slot => ({
                ...slot,
                available: !slot.isPast // Only allow if not past
            }));
        }
        return slotsData.slots;
    };

    // Show booking confirmation
    if (bookingResult) {
        return (
            <Card title="Booking Confirmed" className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                <div className="text-center py-4">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 mb-2">Appointment Booked</h3>

                    <div className="bg-white rounded-lg p-4 md:p-6 mt-4 text-left border border-slate-200">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <p className="text-xs md:text-sm text-slate-500">Token ID</p>
                                <p className="text-base md:text-lg font-bold text-teal-600">{bookingResult.tokenID}</p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-slate-500">Time</p>
                                <p className="text-base md:text-lg font-semibold text-slate-900">{bookingResult.scheduledStartTime}</p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-slate-500">Patient</p>
                                <p className="text-base md:text-lg font-semibold text-slate-900">{bookingResult.patientName}</p>
                            </div>
                            <div>
                                <p className="text-xs md:text-sm text-slate-500">Type</p>
                                <p className="text-base md:text-lg font-semibold text-slate-900">{bookingResult.patientType}</p>
                            </div>
                        </div>
                    </div>

                    <Button onClick={resetBooking} variant="outline" className="mt-6">
                        Book Another Appointment
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <Card
            title="Book Appointment"
            subtitle={step === 1 ? 'Step 1: Select Doctor and Date' : 'Step 2: Choose Time Slot'}
        >
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          ${step >= 1 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    1
                </div>
                <div className={`h-0.5 w-8 md:w-12 ${step >= 2 ? 'bg-teal-500' : 'bg-slate-200'}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
          ${step >= 2 ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                    2
                </div>
            </div>

            {/* Step 1: Select Doctor and Date */}
            {step === 1 && (
                <div className="space-y-4">
                    <Select
                        label="Select Doctor"
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        options={doctors.map(d => ({
                            value: d._id,
                            label: `${d.name} - ${d.specialty}`
                        }))}
                        placeholder="Choose a doctor"
                    />

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Appointment Date
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleProceedToStep2} disabled={!selectedDoctor || !selectedDate}>
                            Continue
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 2: Select Time Slot */}
            {step === 2 && (
                <div className="space-y-4 md:space-y-6">
                    {/* Doctor Info */}
                    {slotsData && (
                        <div className="p-3 md:p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600">
                                <span className="font-medium">{slotsData.doctor.name}</span>
                                {' - '}
                                {slotsData.doctor.specialty}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">
                                {new Date(slotsData.date).toLocaleDateString('en-IN', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                            {!slotsData.isWorkingDay && (
                                <p className="text-sm text-amber-600 mt-2">
                                    {slotsData.message}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Patient Info - ABOVE TIME SLOTS */}
                    {slotsData?.isWorkingDay && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
                            <Input
                                label="Patient Name"
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                placeholder="Enter patient name"
                                required
                            />
                            <Select
                                label="Patient Type"
                                value={patientType}
                                onChange={(e) => {
                                    setPatientType(e.target.value);
                                    setSelectedTime(''); // Reset selected time when type changes
                                }}
                                options={PATIENT_TYPES}
                            />
                        </div>
                    )}

                    {/* Emergency Notice */}
                    {patientType === 'Emergency' && slotsData?.isWorkingDay && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            <strong>Emergency:</strong> You can select any time slot, including booked ones (except past slots).
                        </div>
                    )}

                    {/* Time Slots Grid */}
                    {loading ? (
                        <div className="text-center py-8 text-slate-500">Loading available slots...</div>
                    ) : slotsData?.isWorkingDay ? (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {patientType === 'Emergency'
                                    ? `Select Time Slot (Emergency can access booked slots)`
                                    : `Available Time Slots (${slotsData.availableCount} of ${slotsData.totalSlots} available)`
                                }
                            </label>
                            <TimeSlotGrid
                                slots={getDisplaySlots()}
                                selectedTime={selectedTime}
                                onSelectTime={setSelectedTime}
                            />
                        </div>
                    ) : null}

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setStep(1)}>
                            Back
                        </Button>
                        <Button
                            onClick={handleBookAppointment}
                            loading={loading}
                            disabled={!selectedTime || !patientName.trim()}
                        >
                            Book Appointment
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
