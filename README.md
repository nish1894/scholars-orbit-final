# 🎓 ScholarsOrbit

> **Empowering JEE & NEET aspirants with AI-powered learning, peer collaboration, and comprehensive study resources**

A modern, full-stack educational platform designed specifically for competitive exam preparation, featuring intelligent study tools, real-time collaboration, and personalized learning experiences.

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://scholarsorbit.netlify.app)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

---

## ✨ Features

### 🤖 AI-Powered Learning
- **Smart Study Assistant** - Get instant doubt resolution 24/7
- **Personalized Quizzes** - AI-generated practice questions based on your weak areas
- **Intelligent Flashcards** - Spaced repetition for effective memorization
- **Content Summarization** - Quick summaries of lengthy study materials

### 📚 Resource Management
- **Digital Library** - Organized collection of notes, PDFs, and video lectures
- **Smart Notes** - Create, edit, and share notes with rich formatting
- **Topic-wise Organization** - Physics, Chemistry, Biology, Mathematics
- **Bookmark & Favorites** - Quick access to important resources

### 👥 Social Learning
- **Peer Collaboration** - Connect with students nationwide
- **Study Groups** - Form and join subject-specific discussion groups
- **Teacher Connect** - Direct access to expert educators from IIT/AIIMS
- **Real-time Chat** - Instant messaging for quick doubt clearing

### 📊 Progress Tracking
- **Performance Analytics** - Detailed insights into your preparation
- **Study Streaks** - Gamified learning to maintain consistency
- **Topic-wise Progress** - Track mastery across subjects
- **Practice Test History** - Review past performance and improvements

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### AI Integration
- **Anthropic Claude API** - Advanced AI for study assistance
- **Natural Language Processing** - Intelligent doubt solving

### Deployment
- **Frontend:** Netlify
- **Backend:** Render.com
- **Database:** MongoDB Atlas
- **CDN:** Cloudinary (for media storage)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas account)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/scholarsorbit.git
cd scholarsorbit
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
npm install
```

4. **Environment Setup**

Create `.env` in backend folder:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/scholarsorbit
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
NODE_ENV=development
CLAUDE_API_KEY=your-anthropic-api-key
```

Create `.env` in frontend folder:
```env
VITE_API_URL=http://localhost:5000
VITE_CLAUDE_API_KEY=your-anthropic-api-key
```

5. **Run Backend**
```bash
cd backend
npm run dev
```

6. **Run Frontend**
```bash
cd frontend
npm run dev
```

7. **Open Browser**
Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
scholarsorbit/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── notes/
│   │   │   └── chat/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Note.js
│   │   │   └── StudyGroup.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── notes.js
│   │   │   ├── users.js
│   │   │   └── ai.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 🎯 API Endpoints

### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

### Notes
```
GET    /api/notes            - Get all user notes
POST   /api/notes            - Create new note
PUT    /api/notes/:id        - Update note
DELETE /api/notes/:id        - Delete note
```

### AI Assistant
```
POST   /api/ai/chat          - Chat with AI assistant
POST   /api/ai/generate-quiz - Generate practice quiz
POST   /api/ai/summarize     - Summarize content
```

### Users
```
GET    /api/users/profile    - Get user profile
PUT    /api/users/profile    - Update profile
GET    /api/users/stats      - Get study statistics
```

---

## 📱 Features in Development

- [ ] Mobile app (React Native)
- [ ] Live video classes
- [ ] Mock test series
- [ ] Doubt marketplace
- [ ] Achievement badges
- [ ] Leaderboards
- [ ] Parent dashboard
- [ ] Offline mode
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📸 Screenshots

### Landing Page
![Landing Page](screenshots/landing.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### AI Assistant
![AI Chat](screenshots/ai-chat.png)

### Notes System
![Notes](screenshots/notes.png)

---

## 🔐 Security

- Passwords hashed with bcrypt
- JWT-based authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- Environment variables for sensitive data
- Rate limiting on API endpoints

---

## 🌟 Roadmap

### Phase 1 (Completed ✅)
- Landing page with responsive design
- User authentication system
- Basic dashboard

### Phase 2 (In Progress 🚧)
- Notes management system
- AI integration
- Chat functionality

### Phase 3 (Planned 📋)
- Study groups
- Resource library
- Progress analytics

### Phase 4 (Future 🔮)
- Mobile app
- Live classes
- Payment integration

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- Built for [Teachmint](https://teachmint.com) job application
- Inspired by the need for quality JEE/NEET preparation tools
- Special thanks to all educators who reviewed the platform

---

## 📞 Support

For support, email support@scholarsorbit.com or join our Discord server.

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ for students aspiring to achieve their dreams

[Report Bug](https://github.com/yourusername/scholarsorbit/issues) · [Request Feature](https://github.com/yourusername/scholarsorbit/issues)

</div>
