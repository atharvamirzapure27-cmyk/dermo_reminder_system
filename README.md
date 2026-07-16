# 🏥 Dermo Reminder System

A complete appointment reminder system for dermatology departments with automated SMS notifications via Twilio.

---

## ✨ Features

- ✅ **Patient Management** - Add, view, and manage patients
- ✅ **Appointment Scheduling** - Schedule and track appointments
- ✅ **Automated SMS Reminders** - Daily cron job sends reminders via Twilio
- ✅ **Multi-Language Support** - English, Hindi, and Marathi
- ✅ **Missed Appointment Alerts** - Automatic notifications for missed visits
- ✅ **Beautiful UI** - Modern React frontend with Tailwind CSS
- ✅ **Real-time Dashboard** - View appointment statistics and charts

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MySQL Server
- Twilio Account (for SMS)

### 1. Install Dependencies

```bash
npm install
cd frontend
npm install
cd ..
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dermo_reminder_system

# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Cron Schedule (default: daily at 9 AM)
CRON_SCHEDULE=0 9 * * *
```

### 3. Setup Database

```sql
CREATE DATABASE dermo_reminder_system;
```

The system will automatically create tables on first run.

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

---

## 📱 Testing SMS

### Test SMS Sending:
```bash
node test-sms.js +91YOUR_VERIFIED_NUMBER
```

### Run Full Diagnostics:
```bash
node diagnostic.js
```

---

## 🏗️ Project Structure

```
dermo-reminder-system/
├── controllers/          # Request handlers
│   ├── appointmentController.js
│   └── patientController.js
├── routes/              # API routes
│   ├── appointmentRoutes.js
│   └── patientRoutes.js
├── services/            # Business logic
│   └── twilioService.js  # SMS service
├── frontend/            # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
├── server.js            # Express server + cron job
├── db.js                # Database connection
├── .env                 # Environment variables
├── test-sms.js          # SMS test script
└── diagnostic.js        # System diagnostics
```

---

## 🔧 API Endpoints

### Patients
- `GET /patients` - Get all patients
- `POST /patients` - Create new patient
- `GET /patients/:id/history` - Get patient appointment history

### Appointments
- `GET /appointments` - Get all appointments
- `POST /appointments` - Create new appointment
- `PUT /appointments/:id/visited` - Mark as visited
- `PUT /appointments/:id/reschedule` - Reschedule appointment

---

## 📋 How It Works

1. **Add Patient** - Enter patient details (name, phone, language)
2. **Schedule Appointment** - Create appointment for a specific date
3. **Automated Reminders** - Cron job runs at 9 AM daily:
   - Sends SMS reminders for today's appointments
   - Sends missed appointment notifications
4. **Track Status** - Mark appointments as visited or missed

---

## 🌐 Multi-Language SMS

The system sends reminders in the patient's preferred language:

**English:**
> Hello {name}, reminder for your appointment on {date}

**Hindi:**
> नमस्ते {name}, {date} को आपकी अपॉइंटमेंट के लिए अनुस्मारक

**Marathi:**
> नमस्कार {name}, {date} रोजीच्या आपल्या भेटीसाठी स्मरण

---

## ⚙️ Configuration

### Cron Schedule

Default: `0 9 * * *` (daily at 9:00 AM)

Customize in `.env`:
```env
CRON_SCHEDULE=0 8 * * *  # 8:00 AM
CRON_SCHEDULE=0 */6 * * *  # Every 6 hours
```

### Phone Number Format

- Indian numbers: Auto-adds +91 prefix
- International: Must include country code (e.g., +1, +44)

---

## 🛠️ Troubleshooting

### Server won't start
```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Kill process if needed
taskkill /F /PID <PID>
```

### Database connection error
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### SMS not sending
- Verify Twilio credentials in `.env`
- Check Twilio console for errors
- Trial accounts require verified phone numbers

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check CORS is enabled
- Verify API URL in `frontend/src/services/api.js`

---

## 📊 System Diagnostics

Run comprehensive tests:
```bash
node diagnostic.js
```

**Expected Output:**
```
✅ Backend Server is Running
✅ Database Connection
✅ Fetch Appointments
✅ Create Test Patient
✅ Create Test Appointment
✅ Mark Appointment as Visited
✅ Twilio SMS Service
✅ Environment Variables
✅ Phone Number Formatting
✅ Cron Job Configuration

🎉 ALL TESTS PASSED!
```

---

## 🎯 Demo Flow

1. **Start Backend & Frontend**
2. **Add a Patient** via UI
3. **Create Appointment** for today
4. **Test SMS** manually or wait for 9 AM cron job
5. **Mark as Visited** or check missed notifications

---

## 📝 Technology Stack

- **Backend:** Node.js, Express.js
- **Frontend:** React, Vite, Tailwind CSS
- **Database:** MySQL
- **SMS:** Twilio API
- **Scheduler:** node-cron

---

## 📄 License

This project is for educational and demonstration purposes.

---

## 👨‍💻 Support

For issues or questions:
1. Run `node diagnostic.js` to check system health
2. Check server logs for errors
3. Verify `.env` configuration
4. Review Twilio console for SMS delivery status

---

**Status:** ✅ Fully Operational & Production Ready
