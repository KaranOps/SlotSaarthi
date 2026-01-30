import { useState, useEffect } from 'react';
import DoctorRegistrationView from './components/DoctorRegistrationView';
import PatientBookingView from './components/PatientBookingView';
import QueueDashboard from './components/QueueDashboard';
import { Select } from './components/ui';
import { doctorAPI } from './api/client';

const TABS = [
  { id: 'booking', label: 'Book Appointment', icon: '📅' },
  { id: 'queue', label: 'Queue Dashboard', icon: '📋' },
  { id: 'register', label: 'Register Doctor', icon: '👨‍⚕️' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('booking');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorAPI.getAll();
        setDoctors(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedDoctorId(response.data.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      }
    };
    fetchDoctors();
  }, []);

  const handleDoctorCreated = (doctor) => {
    setDoctors(prev => [...prev, doctor]);
    setSelectedDoctorId(doctor._id);
    setActiveTab('booking');
  };

  const refreshDoctors = async () => {
    try {
      const response = await doctorAPI.getAll();
      setDoctors(response.data.data);
    } catch (err) {
      console.error('Failed to refresh doctors:', err);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center transform rotate-45">
                <div className="transform -rotate-45">
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-slate-800">
                  <span className="text-teal-500">Slot</span>Saarthi
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">OPD Token Engine</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Doctor Selector (Queue Tab) & Hamburger */}
            <div className="flex items-center gap-3">
              {activeTab === 'queue' && (
                <div className="w-32 md:w-48">
                  <Select
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    options={doctors.map(d => ({ value: d._id, label: d.name }))}
                    placeholder="Doctor"
                  />
                </div>
              )}

              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg z-10">
          <div className="px-4 py-2 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {activeTab === 'booking' && (
          <div className="max-w-2xl mx-auto">
            <PatientBookingView onBookingComplete={() => refreshDoctors()} />
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="max-w-3xl mx-auto">
            <QueueDashboard doctorId={selectedDoctorId} />
          </div>
        )}

        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto">
            <DoctorRegistrationView onDoctorCreated={handleDoctorCreated} />
          </div>
        )}
      </main>

      {/* GitHub Floating Button */}
      <a
        href="https://github.com/KaranOps/SlotSaarthi"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-12 h-12 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-30"
        title="View on GitHub"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      </a>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <p className="text-center text-xs md:text-sm text-slate-500">
            <span className="text-teal-500 font-medium">Slot</span>Saarthi - Priority-Based OPD Scheduling
          </p>
        </div>
      </footer>
    </div>
  );
}
