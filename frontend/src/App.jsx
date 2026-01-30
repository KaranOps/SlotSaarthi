import { useState, useEffect } from 'react';
import BookingForm from './components/BookingForm';
import DoctorQueue from './components/DoctorQueue';
import { doctorAPI, slotAPI } from './api/client';

function App() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDoctor, setShowCreateDoctor] = useState(false);

  // Fetch doctors on mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      setDoctors(response.data.data);
      if (response.data.data.length > 0 && !selectedDoctor) {
        setSelectedDoctor(response.data.data[0]);
      }
    } catch (err) {
      setError('Failed to fetch doctors. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const response = await doctorAPI.create({
        name: formData.get('name'),
        specialty: formData.get('specialty'),
        averageConsultationTime: parseInt(formData.get('consultationTime')) || 10
      });

      // Initialize slots for the new doctor
      await slotAPI.initialize(response.data.data._id);

      setDoctors([...doctors, response.data.data]);
      setSelectedDoctor(response.data.data);
      setShowCreateDoctor(false);
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create doctor');
    }
  };

  const handleInitializeSlots = async () => {
    if (!selectedDoctor) return;

    try {
      await slotAPI.initialize(selectedDoctor._id);
      alert('Slots initialized successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize slots');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SlotSaarthi</h1>
                  <p className="text-sm text-slate-400">OPD Token Allocation Engine</p>
                </div>
              </div>

              {/* Doctor Selector */}
              <div className="flex items-center gap-4">
                {doctors.length > 0 && (
                  <select
                    value={selectedDoctor?._id || ''}
                    onChange={(e) => setSelectedDoctor(doctors.find(d => d._id === e.target.value))}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    {doctors.map((doctor) => (
                      <option key={doctor._id} value={doctor._id} className="bg-slate-800">
                        {doctor.name} - {doctor.specialty}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={() => setShowCreateDoctor(!showCreateDoctor)}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  + Add Doctor
                </button>

                {selectedDoctor && (
                  <button
                    onClick={handleInitializeSlots}
                    className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    Initialize Slots
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Create Doctor Form (Collapsible) */}
        {showCreateDoctor && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Add New Doctor</h3>
              <form onSubmit={handleCreateDoctor} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input
                    name="name"
                    required
                    placeholder="Dr. John Smith"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Specialty</label>
                  <input
                    name="specialty"
                    required
                    placeholder="General Medicine"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div className="w-40">
                  <label className="block text-sm text-slate-400 mb-1">Avg. Time (min)</label>
                  <input
                    name="consultationTime"
                    type="number"
                    defaultValue={10}
                    min={1}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
                >
                  Create & Initialize
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <svg className="animate-spin h-8 w-8 text-cyan-400" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-slate-400">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
              <p className="text-red-400">{error}</p>
              <p className="text-sm text-slate-500 mt-2">
                Make sure MongoDB is running and the backend server is started.
              </p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left Column - Booking Form */}
              <div>
                <BookingForm
                  doctorId={selectedDoctor?._id}
                  onBookingComplete={() => {
                    // Queue will auto-refresh, but we can trigger immediate refresh
                  }}
                />
              </div>

              {/* Right Column - Queue Display */}
              <div>
                <DoctorQueue doctorId={selectedDoctor?._id} />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700/50 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-4 text-center text-slate-500 text-sm">
            SlotSaarthi - OPD Token Allocation Engine
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
