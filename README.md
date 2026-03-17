# 🍅 Pomodoro Buddy

A beautifully designed, feature-rich Pomodoro timer built with pure **HTML, CSS, and Vanilla JavaScript** — no frameworks, no dependencies, no build tools required. Just open `index.html` in your browser and start focusing.

---

## ✨ Features

### ⏱ Timer
- Focus and Break modes with a smooth animated SVG ring
- 4 focus durations: 25 min, 50 min, 52 min, 90 min
- 4 break durations: 5 min, 10 min, 15 min, 17 min
- Live countdown shown in the **browser tab title** and **favicon**
- Animated pulse glow while the timer is running

### 🎵 Lofi Radio
- 6 built-in royalty-free lofi tracks from Pixabay
- Full music player with play/pause, skip, seekable progress bar, volume control
- Spinning vinyl disc animation while playing
- Track dot indicators for quick switching

### 🔔 Notifications & Alarm
- Browser notifications when a session ends (focus or break)
- 3 selectable alarm sounds: **Chime**, **Bell**, **Digital** (built with WebAudio API)
- Preview any alarm sound by clicking it

### 🌙 Streak & Daily Goal
- **Daily streak tracker** — counts consecutive days with at least one session
- **Daily focus goal** — set a custom target in minutes, with a live progress bar
- 🎉 Goal completion celebration

### 📝 Session Tasks
- Add tasks to focus on during your current session
- Check off tasks as you complete them
- Delete individual tasks or clear all completed ones at once

### ✨ Session Completion
- **Confetti burst** on every completed focus session
- **Motivational quote** modal with 10 curated productivity quotes

### 📊 History & Personal Bests
- **7-day and 30-day bar charts** showing your study minutes per day
- Stats strip: total minutes, sessions, hours, today's minutes
- Personal bests: current streak 🔥, longest streak ⭐, best day 🏆
- Full scrollable session log with timestamps

### ⌨️ Keyboard Shortcuts

| Key     | Action          |
|---------|-----------------|
| `Space` | Play / Pause    |
| `R`     | Reset timer     |
| `F`     | Focus mode      |
| `B`     | Break mode      |
| `T`     | Go to Timer     |
| `H`     | Go to History   |
| `A`     | Go to About     |

### 🎨 Themes
Three built-in themes, persisted across sessions:
- 🌑 **Dark** — deep dark editorial
- ☀️ **Light** — clean light mode
- 📜 **Sepia** — warm amber tones

### 👤 About Page
Personal portfolio section with profile, bio cards, tech stack, and social links.

---

## 🚀 Getting Started

No installation needed.

```
pomodoro-buddy/
├── index.html   ← All HTML structure
├── style.css    ← All styles & themes
├── app.js       ← All JavaScript logic
└── README.md
```

1. Download or clone the project
2. Open `index.html` in any modern browser
3. Enter your name and start focusing

> **Note:** The lofi music player requires an internet connection to stream tracks from the Pixabay CDN. All other features work fully offline.

---

## 💾 Data Storage

All user data is stored locally in your browser's `localStorage` — nothing is sent to any server. Each user account is identified by the name entered at login.

Stored data includes:
- Session history (date, duration, timestamps)
- User stats (total minutes, session count)
- Daily goal setting
- Task list
- Preferred theme and alarm sound
- Active user session

To reset your data, log out and clear your browser's localStorage for the page.

---

## 🛠 Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Structure  | HTML5 (semantic markup)           |
| Styling    | CSS3 (custom properties, grid, animations) |
| Logic      | Vanilla JavaScript (ES6+)         |
| Audio      | Web Audio API + HTML5 `<audio>`   |
| Fonts      | Google Fonts (DM Mono, Instrument Serif, DM Sans) |
| Music      | Pixabay CDN (royalty-free lofi)   |
| Storage    | localStorage                      |

---

## 📁 File Overview

### `index.html`
Contains the complete HTML structure of the app — login screen, navbar, timer view, history view, and about page. No logic or styling is written here.

### `style.css`
Contains all visual styling including:
- CSS custom property themes (dark / light / sepia)
- Layout (CSS Grid, Flexbox)
- Component styles (timer ring, music player, task list, charts, modals)
- Animations and transitions
- Responsive breakpoints for mobile

### `app.js`
Contains all application logic including:
- State management (timer, mode, user)
- Timer engine (countdown, mode switching, session saving)
- DOM manipulation (rendering tasks, charts, session list)
- Music player controls
- WebAudio alarm system
- Confetti animation
- Streak and goal calculations
- localStorage read/write
- Keyboard shortcut handling
- Theme and view switching

---

## 🙏 Credits

- Lofi music tracks by [FASSounds](https://pixabay.com/users/fassounds-3433550/) on [Pixabay](https://pixabay.com/music/) — royalty-free
- Fonts by [Google Fonts](https://fonts.google.com/)
- Built by **Hassane Ait Ahmed Lamara** — [GitHub](https://github.com/HassaneAitAhmed) · [LinkedIn](https://www.linkedin.com/in/hassane-ait-ahmed-lamara/)
