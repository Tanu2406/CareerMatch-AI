# CareerMatch AI

An AI-powered Resume & Job Matcher SaaS application built with the MERN stack. Upload your resume, paste a job description, and get instant AI-powered analysis with match scores, skill gaps, and job recommendations.

## Features

- **User Authentication** - Secure JWT-based registration and login
- **Resume Upload** - Support for PDF and DOCX formats
- **AI Analysis** - Powered by Google Gemini for intelligent resume analysis
- **Match Scoring** - Get a percentage match score against job descriptions
- **Skill Analysis** - Identify matched skills and skill gaps
- **Keyword Suggestions** - AI-generated keywords to improve your resume
- **Improvement Tips** - Actionable advice to boost your ATS score
- **Job Matching** - Find relevant jobs based on your skills
- **Analysis History** - Track all your previous analyses

## Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- Framer Motion
- Recharts
- React Router DOM
- Axios
- React Toastify
- React Dropzone

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (file uploads)
- pdf-parse & mammoth (document parsing)
- Google Gemini AI
- JSearch API (RapidAPI) - modular job provider system

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (free tier available)
- Careerjet Affiliate ID (optional, for real job listings)

### Installation

1. **Clone the repository**
   ```bash
   cd "CareerMatch AI"
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/careermatch
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   GEMINI_API_KEY=your-gemini-api-key
   CAREERJET_AFFID=your-careerjet-affiliate-id
   NODE_ENV=development
   ```

   Create `client/.env`:
   ```env
   VITE_API_URL=/api
   ```

5. **Start MongoDB**
   ```bash
   mongod
   ```

6. **Start the development servers**

   In the server directory:
   ```bash
   npm run dev
   ```

   In the client directory:
   ```bash
   npm run dev
   ```

7. **Open the application**
   
   Navigate to `http://localhost:5173`

## Project Structure

```
CareerMatch AI/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context (Auth)
│   │   ├── utils/            # API utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                    # Express Backend
│   ├── controllers/          # Route handlers
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── middleware/           # Auth middleware
│   ├── utils/                # Utilities (parser, matcher, AI)
│   ├── uploads/              # Resume storage
│   ├── server.js
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user (409 if email already registered) |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Generate a 6‑digit OTP, email it to user, and (in dev) return success message |
| POST | `/api/auth/verify-otp` | Verify previously issued OTP |
| POST | `/api/auth/reset-password` | Reset password after OTP verification (requires email, otp, newPassword) |
| GET | `/api/auth/me` | Get current user |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload resume file |
| POST | `/api/resume/analyze` | Analyze resume |
| GET | `/api/resume/history` | Get analysis history |
| GET | `/api/resume/stats` | Get user statistics |
| GET | `/api/resume/latest` | Get latest analysis |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/search` | Search matching jobs |
| GET | `/api/jobs/recommendations` | Get job recommendations |

## Environment Variables

### Server
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRES_IN` | JWT expiration time |
| `GEMINI_API_KEY` | Google Gemini API key |
| `JOB_PROVIDER` | Job provider: jsearch or mock |
| `RAPIDAPI_KEY` | RapidAPI key for JSearch |
| `NODE_ENV` | Environment (development/production) |
| `EMAIL_SERVICE` | Optional nodemailer service name (e.g. 'Gmail') |
| `EMAIL_HOST` | SMTP host (if not using service) |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_SECURE` | 'true' for TLS, 'false' for STARTTLS |
| `EMAIL_USER` | SMTP username/email for sending OTPs |
| `EMAIL_PASS` | SMTP password |
| `EMAIL_FROM` | (optional) From address for OTP emails |

### Client
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## Getting API Keys

### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Free tier includes 15 requests/minute and 1M tokens/day

### JSearch API (RapidAPI)
1. Create account at [RapidAPI](https://rapidapi.com/)
2. Subscribe to [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (free tier: 100 requests/month)
3. Copy your RapidAPI key to `.env`
4. Without this key, the app automatically falls back to mock job data

## Screenshots

The application features:
- Modern SaaS dashboard design
- Circular score charts
- Skill tag visualization
- Responsive job cards
- Smooth animations
- Clean, professional UI

## License

MIT License

## Support

For issues or questions, please open an issue on the repository.
