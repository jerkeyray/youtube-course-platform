# Yudoku

Yudoku is a learning platform that transforms YouTube playlists into structured courses. It provides tools for progress tracking, note-taking, and habit building to enhance the self-learning experience from video content.

## Philosophy

Most learning tools are designed to keep you watching, not finishing. Yudoku is built to help you finish.

While other platforms optimize for engagement with algorithmic feeds and endless recommendations, Yudoku optimizes for completion.

- **No algorithmic feed**
- **No endless recommendations**
- **One active commitment at a time**
- **Clear progress, visible finish lines**

The goal is not to discover more content. The goal is to actually get through the content you already chose.

## Features

### Course Management

- **Playlist Conversion**: Import YouTube playlists to create structured courses.
- **Deadline Setting**: Set personal deadlines for course completion to stay on track.
- **Progress Tracking**: Monitor completion status for individual videos and overall courses.

### Learning Tools

- **Smart Bookmarks**: Save specific timestamps in videos for quick reference.
- **Notes System**: Add context-aware notes to bookmarks and courses.
- **Watch Later**: Organize content for future viewing.

### Activity & Gamification

- **Activity Heatmap**: Visualize daily learning activity and consistency.
- **Streak Tracking**: Maintain learning streaks to build consistent habits.
- **Certificates**: Earn recognition upon completing courses.

### User Experience

- **Profile Customization**: Manage user profiles with bios and learning history.
- **Responsive Design**: Optimized interface for various devices.
- **Dark Mode**: Built-in theme support.

## Tech Stack

### Core

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma

### Frontend

- **Styling**: Tailwind CSS
- **Components**: Shadcn UI, Radix UI
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Services

- **Authentication**: Auth.js (NextAuth)
- **Data Fetching**: TanStack Query (React Query)
- **External APIs**: YouTube Data API

## Project Structure

The project follows the Next.js App Router architecture:

- `app/`: Application routes and pages.
  - `api/`: Backend API endpoints for courses, users, and activity.
  - `home/`: Main dashboard views including courses and profile.
  - `auth/`: Authentication related pages.
- `components/`: Reusable UI components.
  - `ui/`: Base design system components (Shadcn UI).
- `lib/`: Utility functions, database clients, and shared logic.
- `prisma/`: Database schema and migration history.
- `types/`: TypeScript type definitions.

## Author

Yudoku is built and maintained by [Aditya Srivastava](https://jerkeyray.com).

It’s shaped by repeated frustration with half-finished playlists, fake productivity, and tools that confuse motion with progress.

If Yudoku helped you finish something you would’ve otherwise dropped, you can [support its continued development here](https://buymeacoffee.com/jerkeyray).
