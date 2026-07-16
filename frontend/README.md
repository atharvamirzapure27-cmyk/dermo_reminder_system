# Dermo Reminder System - Frontend

A modern, responsive React frontend for the Dermatology Appointment Reminder System.

## 🚀 Features

- **Dashboard** - View all appointments with status tracking (Upcoming/Today/Visited/Missed)
- **Add Patient** - Beautiful form to add new patients
- **Add Appointment** - Schedule appointments with patient selection
- **Glassmorphism UI** - Modern glass-effect design
- **Smooth Animations** - Powered by Framer Motion
- **Toast Notifications** - Success/error feedback
- **Mobile Responsive** - Works on all devices
- **Real-time Status** - Automatic appointment status calculation

## 📦 Tech Stack

- **React 18** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Axios** - API calls
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## 🛠️ Installation

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies (already done):
```bash
npm install
```

## 🏃 Running the App

1. **Start the Backend** (in one terminal):
```bash
cd ..
node server.js
```

2. **Start the Frontend** (in another terminal):
```bash
cd frontend
npm run dev
```

3. Open browser and visit: `http://localhost:5173`

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation bar
│   │   ├── Card.jsx         # Reusable card component
│   │   ├── Button.jsx       # Gradient button with loading
│   │   └── Input.jsx        # Modern input with icons
│   ├── pages/
│   │   ├── Dashboard.jsx    # Main dashboard with stats
│   │   ├── AddPatient.jsx   # Patient form
│   │   └── AddAppointment.jsx # Appointment form
│   ├── services/
│   │   └── api.js           # API service layer
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles & Tailwind
├── index.html
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 UI Features

### Glassmorphism Design
- Frosted glass effect cards
- Backdrop blur effects
- Subtle borders and shadows

### Animations
- Page transitions with Framer Motion
- Hover effects on cards and buttons
- Loading spinners
- Smooth form interactions

### Components
- **Stats Cards** - Show appointment statistics
- **Appointment Table** - Sortable list with status badges
- **Forms** - Modern inputs with icons and validation
- **Status Badges** - Color-coded appointment status

## 🔌 API Integration

The frontend connects to the backend API at `http://localhost:3000`:

- `GET /patients` - Fetch all patients
- `POST /patients` - Create patient
- `GET /appointments` - Fetch all appointments
- `POST /appointments` - Create appointment
- `PUT /appointments/:id/visited` - Mark as visited
- `PUT /appointments/:id/reschedule` - Reschedule appointment

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Flexible grid layouts
- Touch-friendly buttons

## 🎯 Key Features

1. **Dashboard Statistics**
   - Total appointments
   - Upcoming appointments
   - Visited appointments
   - Missed appointments

2. **Appointment Status**
   - 🟢 Visited - Past appointment marked as visited
   - 🔴 Missed - Past appointment not visited
   - 🔵 Today - Appointment scheduled for today
   - 🟣 Upcoming - Future appointments

3. **Form Validation**
   - Required field checks
   - Date validation (no past dates)
   - Patient selection validation

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Environment Variables

To change the API URL, edit `src/services/api.js`:
```javascript
const API_URL = 'http://localhost:3000';
```

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: {
    500: '#0ea5e9',
    600: '#0284c7',
  }
}
```

### Toast Position
Edit `App.jsx` to change toast position:
```javascript
<Toaster position="top-right" />
```

## 📝 Notes

- Make sure the backend server is running before starting the frontend
- The app uses CORS, which is enabled in the backend
- All API calls include error handling with toast notifications
- The appointment status is calculated automatically based on dates

## 🐛 Troubleshooting

**Backend not connecting?**
- Ensure backend is running on port 3000
- Check CORS is enabled in backend

**Styles not loading?**
- Run `npm install` to ensure all dependencies are installed
- Restart the dev server

**API errors?**
- Check browser console for error messages
- Verify backend is responding correctly

## 📄 License

MIT License
