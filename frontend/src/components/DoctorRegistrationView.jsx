import { useState } from 'react';
import { Card, Button, Input, Select } from './ui';
import { doctorAPI } from '../api/client';

const DAYS_OF_WEEK = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
];

const DURATION_OPTIONS = [
    { value: '10', label: '10 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '20', label: '20 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '60 minutes' }
];

/**
 * DoctorRegistrationView Component
 * Form for registering doctors with schedule builder (Teal theme)
 */
export default function DoctorRegistrationView({ onDoctorCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        consultationDuration: '15',
        startTime: '09:00',
        endTime: '17:00',
        workingDays: [1, 2, 3, 4, 5]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDayToggle = (day) => {
        setFormData(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day].sort()
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await doctorAPI.create({
                name: formData.name,
                specialty: formData.specialty,
                consultationDuration: parseInt(formData.consultationDuration),
                availability: {
                    startTime: formData.startTime,
                    endTime: formData.endTime
                },
                workingDays: formData.workingDays
            });

            setSuccess(`Dr. ${response.data.data.name} registered successfully`);
            setFormData({
                name: '',
                specialty: '',
                consultationDuration: '15',
                startTime: '09:00',
                endTime: '17:00',
                workingDays: [1, 2, 3, 4, 5]
            });

            if (onDoctorCreated) {
                onDoctorCreated(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to register doctor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Register New Doctor" subtitle="Configure doctor profile and schedule">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Doctor Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Dr. John Smith"
                        required
                    />
                    <Input
                        label="Specialty"
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        placeholder="General Medicine"
                        required
                    />
                </div>

                {/* Schedule Builder */}
                <div className="border-t border-slate-200 pt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-4">Schedule Builder</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Start Time
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                End Time
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <Select
                            label="Consultation Duration"
                            name="consultationDuration"
                            value={formData.consultationDuration}
                            onChange={handleInputChange}
                            options={DURATION_OPTIONS}
                        />
                    </div>

                    {/* Working Days */}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Working Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DAYS_OF_WEEK.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => handleDayToggle(day.value)}
                                    className={`
                    px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${formData.workingDays.includes(day.value)
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }
                  `}
                                >
                                    {day.label.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-teal-700 text-sm">
                        {success}
                    </div>
                )}

                {/* Submit */}
                <div className="flex justify-end">
                    <Button type="submit" loading={loading}>
                        Register Doctor
                    </Button>
                </div>
            </form>
        </Card>
    );
}
