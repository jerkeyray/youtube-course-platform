# 🎯 Yudoku – Distraction-Free YouTube Learning Platform

**Yudoku** is a focused learning platform for people who learn through YouTube. With a clean, distraction-free interface, goal-based tracking, and gamified features like certificates and streaks, Yudoku helps learners stay consistent and proud of their progress.

---

## 🚀 Features

- 🎬 **Distraction-Free YouTube Player**  
  Watch YouTube videos without comments, suggestions, or autoplay distractions.

- 🎯 **Set Goals Using Playlists**  
  Add your favorite YouTube playlists as learning goals and track your completion.

- ⏱️ **Watch Time Tracking**  
  Track how long you’ve spent on each video in a playlist.

- 🗓️ **Calendar Streaks**  
  Visualize your learning consistency and build daily streaks.

- 🏆 **Certificates & Badges**  
  Earn shareable certificates and badges upon completing playlist goals.

- 👤 **User Dashboard**  
  View your active goals, progress, streaks, and achievements.

- 🔗 **Public Profile Link**  
  Showcase your completed certificates and badges via a profile link—just like Credly!

- 🔐 **Authentication**  
  Secure signup/login with email or Google via NextAuth.js.

---

## 🛠️ Tech Stack

| Layer       | Technology             |
|-------------|------------------------|
| Frontend    | Next.js, Tailwind CSS  |
| Backend     | Next.js API Routes     |
| Auth        | NextAuth.js            |
| Database    | MongoDB / PostgreSQL   |
| Video API   | YouTube IFrame API     |
| Certificates| jsPDF / PDFKit         |
| Calendar    | FullCalendar.js        |
| Deployment  | Vercel / Supabase      |

---

## 📁 Folder Structure

```
/pages
  /auth          # Login/Signup
  /dashboard     # User dashboard
  /goals         # Set and view goals
  /calendar      # Track streaks
  /certificates  # Earned certificates
  /profile       # Public profile page

/components
  VideoPlayer.js
  GoalCard.js
  CertificateCard.js
  Calendar.js

/lib
  auth.js
  db.js
  utils.js

/public
/styles
```

---

## 📸 Screenshots

> _[Add screenshots here once UI is designed or wireframes are ready]_  
> *Landing Page | Dashboard | Goal Tracker | Calendar | Certificates | Profile*

---

## ✅ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yudoku.git
   cd yudoku
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file and add:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_secret
   DATABASE_URL=your_db_connection_string
   GOOGLE_CLIENT_ID=your_google_id
   GOOGLE_CLIENT_SECRET=your_google_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

---

## ✨ Future Enhancements

- AI-based playlist recommendations
- Chrome extension to add goals directly from YouTube
- Leaderboards and XP system
- Mobile app version
- Community/group-based goals

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you would like to change.

---

## 📜 License

[MIT License](LICENSE)

---