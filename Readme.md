# SlotSaarthi - OPD Token Allocation Engine

A production-grade prototype for managing hospital OPD patient queues with priority-based scheduling, elastic capacity for emergencies, and dynamic re-prioritization.

## Tech Stack

- **Backend:** Node.js, Express.js, MongoDB (Mongoose)
- **Frontend:** React (Vite), Tailwind CSS
- **Architecture:** MVC Pattern (Models, Controllers, Services, Routes)

## Features

- **Priority-Based Queue Management:** Patients are prioritized based on type (Emergency > Paid > Online > Walk-in > Follow-up)
- **Elastic Capacity:** Emergency patients can always book, even when slots are full
- **Auto-Refresh Dashboard:** Live queue updates every 30 seconds
- **Token Generation:** Unique token IDs in format `DOC-XXX-YYY`
- **Estimated Wait Time:** Calculated based on queue position and consultation time

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local or cloud)

## Project Structure

```
SlotSaarthi/
├── backend/
│   ├── config/
│   │   └── settings.js          # Global configuration
│   ├── src/
│   │   ├── models/              # Mongoose schemas
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API routes
│   │   └── utils/               # Error handling
│   ├── server.js                # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Axios API client
│   │   ├── components/
│   │   │   ├── BookingForm.jsx  # Token booking form
│   │   │   └── DoctorQueue.jsx  # Live queue display
│   │   └── App.jsx              # Main component
│   └── package.json
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SlotSaarthi
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.example .env

# Start the server
npm start
```

The backend will run on `http://localhost:5000`

### 3. Setup Frontend

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will run on `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doctors` | Create a new doctor |
| GET | `/api/doctors` | Get all doctors |
| POST | `/api/slots/initialize` | Generate daily slots for a doctor |
| GET | `/api/slots/:doctorId` | Get today's slots for a doctor |
| POST | `/api/tokens/book` | Book a token for a patient |
| GET | `/api/queue/:doctorId` | Get the live queue for a doctor |

## Configuration

All business logic constants are in `backend/config/settings.js`:

```javascript
SLOT_DURATION_MINUTES: 60        // Duration of each slot
DEFAULT_MAX_CAPACITY: 10         // Max patients per slot
PRIORITY_WEIGHTS: {
  Emergency: 0,                  // Highest priority
  Paid: 10,
  Online: 20,
  Walk_in: 30,
  Follow_up: 40                  // Lowest priority
}
```

## Usage

1. **Add a Doctor:** Click "+ Add Doctor" in the header
2. **Initialize Slots:** Click "Initialize Slots" to create today's time slots
3. **Book Tokens:** Use the booking form to register patients
4. **View Queue:** See the live queue with auto-refresh

## Priority Logic

- Lower priority score = Higher priority in queue
- `finalPriorityScore = PRIORITY_WEIGHTS[patientType] + (arrivalSequence * 0.01)`
- Emergency patients bypass capacity limits (elastic overflow)

## License

ISC