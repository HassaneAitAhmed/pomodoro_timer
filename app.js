const LS = {
  get: (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
  set: (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

const KEY_USER  = 'pb_current_user';
const KEY_USERS = 'pb_users';
const KEY_SESS  = 'pb_sessions';
const KEY_GOAL  = 'pb_daily_goal';
const KEY_THEME = 'pb_theme';
const KEY_ALARM = 'pb_alarm';
const KEY_TASKS = 'pb_tasks';

const TRACKS = [
  { title: 'Sentimental Jazzy Love', artist: 'Pixabay', color: '#c084fc', url: 'https://cdn.pixabay.com/audio/2026/01/25/audio_1dd7f3126d.mp3' },
  { title: 'Lofi Chill Girl',        artist: 'Pixabay', color: '#818cf8', url: 'https://cdn.pixabay.com/audio/2026/02/20/audio_91db1f3017.mp3' },
  { title: 'Lounge Jazz Elevator',   artist: 'Pixabay', color: '#34d399', url: 'https://cdn.pixabay.com/audio/2026/02/19/audio_2931f5544d.mp3' },
  { title: 'Lofi Study Chill Hop',   artist: 'Pixabay', color: '#fb923c', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { title: 'Good Night Lofi',        artist: 'Pixabay', color: '#f472b6', url: 'https://cdn.pixabay.com/audio/2023/07/30/audio_e0908e8569.mp3' },
  { title: 'Lofi Ambient Study',     artist: 'Pixabay', color: '#60a5fa', url: 'https://cdn.pixabay.com/audio/2025/12/22/audio_8944e9e504.mp3' },
];

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Small steps every day lead to big results.", author: "Unknown" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  { text: "Concentrate all your thoughts on the work at hand.", author: "Alexander Graham Bell" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
];

function fmtTime(s)  { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }
function fmtSec(s)   { return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`; }
function fmtDate(iso){ return new Date(iso).toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }); }
function todayStr()  { return new Date().toDateString(); }
function randQuote() { return QUOTES[Math.floor(Math.random() * QUOTES.length)]; }
function $(id)       { return document.getElementById(id); }
function clamp(v,mn,mx){ return Math.min(mx, Math.max(mn, v)); }

let currentUser  = null;
let timerMode    = 'focus';   
let isRunning    = false;
let timeLeft     = 25 * 60;
let focusSel     = 25;
let breakSel     = 5;
let timerInterval = null;
let currentView  = 'timer';
let chartPeriod  = 'week';

let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playAlarm(type) {
  try {
    const ctx = getAudioCtx();
    if (type === 'chime') {
      [[523.25,0],[659.25,0.13],[783.99,0.26],[1046.5,0.4]].forEach(([f,t]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine'; o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.18, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.5);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.55);
      });
    } else if (type === 'bell') {
      [[880,0],[660,0.05],[440,0.15],[880,0.5],[660,0.55]].forEach(([f,t]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'triangle'; o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.22, ctx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.4);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.45);
      });
    } else if (type === 'digital') {
      [[880,0,0.08],[880,0.1,0.08],[1320,0.22,0.08],[1320,0.32,0.08],[1760,0.44,0.12]].forEach(([f,t,d]) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'square'; o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f;
        g.gain.setValueAtTime(0.1, ctx.currentTime + t);
        g.gain.setValueAtTime(0.1, ctx.currentTime + t + d - 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + d);
        o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + d + 0.01);
      });
    }
  } catch(e) {}
}

function updateFavicon() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const col = timerMode === 'focus' ? '#c084fc' : '#34d399';
  if (isRunning) {
    x.fillStyle = '#111115'; x.beginPath(); x.arc(32,32,32,0,Math.PI*2); x.fill();
    x.fillStyle = col; x.font = 'bold 22px monospace';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(`${Math.floor(timeLeft/60)}m`, 32, 33);
  } else {
    x.fillStyle = '#c084fc'; x.beginPath(); x.arc(32,32,28,0,Math.PI*2); x.fill();
    x.fillStyle = '#fff'; x.font = 'bold 20px sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🍅', 32, 35);
  }
  let lnk = document.querySelector("link[rel~='icon']");
  if (!lnk) { lnk = document.createElement('link'); lnk.rel = 'icon'; document.head.appendChild(lnk); }
  lnk.href = c.toDataURL();
}

function updateTitle() {
  document.title = isRunning
    ? `${fmtTime(timeLeft)} ${timerMode === 'focus' ? '● Focus' : '● Break'} · Pomodoro Buddy`
    : 'Pomodoro Buddy';
}

function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
function sendNotif(title, body) {
  if (Notification.permission === 'granted') {
    try { new Notification(title, { body }); } catch(e) {}
  }
}

function launchConfetti() {
  const canvas = $('confettiCanvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const colors = ['#c084fc','#818cf8','#34d399','#fb923c','#f472b6','#fbbf24','#60a5fa'];
  const pieces = Array.from({ length: 130 }, () => ({
    x: Math.random() * canvas.width, y: -10,
    w: 5 + Math.random() * 9, h: 9 + Math.random() * 14,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * 360, rv: (Math.random() - 0.5) * 6,
    vx: (Math.random() - 0.5) * 5, vy: 2 + Math.random() * 4, a: 1
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    let alive = false;
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.rot += p.rv;
      if (frame > 80) p.a = Math.max(0, p.a - 0.014);
      if (p.a > 0) alive = true;
      ctx.save(); ctx.globalAlpha = p.a;
      ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    if (alive) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(draw);
}

function showQuote() {
  const q = randQuote();
  $('quoteText').textContent = `"${q.text}"`;
  $('quoteAuthor').textContent = `— ${q.author}`;
  $('quoteModal').classList.remove('hidden');
}
$('quoteCloseBtn').addEventListener('click', () => $('quoteModal').classList.add('hidden'));
$('quoteModal').addEventListener('click', e => { if (e.target === $('quoteModal')) $('quoteModal').classList.add('hidden'); });

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  LS.set(KEY_THEME, theme);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}
document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});
setTheme(LS.get(KEY_THEME, 'dark'));

function showView(viewId) {
  currentView = viewId;
  document.querySelectorAll('.view').forEach(v => {
    v.classList.add('hidden');
    v.classList.remove('active');
  });
  const target = $(`view-${viewId}`);
  target.classList.remove('hidden');
  setTimeout(() => target.classList.add('active'), 10);

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  if (viewId === 'history') renderHistory();
}
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

function doLogin() {
  const name = $('loginInput').value.trim();
  if (!name) return;
  currentUser = name;
  LS.set(KEY_USER, name);
  $('loginScreen').classList.add('hidden');
  $('app').classList.remove('hidden');
  initApp();
}
$('loginBtn').addEventListener('click', doLogin);
$('loginInput').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogout() {
  stopTimer();
  LS.set(KEY_USER, null);
  currentUser = null;
  $('app').classList.add('hidden');
  $('loginScreen').classList.remove('hidden');
  $('loginInput').value = '';
}
$('logoutBtn').addEventListener('click', doLogout);

const RING_C = 2 * Math.PI * 84; 

function updateRing() {
  const total = timerMode === 'focus' ? focusSel * 60 : breakSel * 60;
  const pct   = total > 0 ? timeLeft / total : 1;
  const ring  = $('ringProgress');
  ring.setAttribute('stroke-dashoffset', RING_C * pct);
  ring.setAttribute('stroke', `url(#g${timerMode[0]})`);
  ring.style.filter = isRunning ? 'url(#glow)' : 'none';
  $('ringTime').textContent = fmtTime(timeLeft);
  $('ringLabel').textContent = timerMode === 'focus' ? '● FOCUS' : '● BREAK';

  const pulse = $('ringPulse');
  pulse.className = `ring-pulse ${isRunning ? 'active ' + timerMode : ''}`;
}

function startTimer() {
  isRunning = true;
  $('playIcon').classList.add('hidden');
  $('pauseIcon').classList.remove('hidden');
  $('playPauseBtn').classList.add('running');
  timerInterval = setInterval(tick, 1000);
  updateRing();
  updateFavicon();
  updateTitle();
}

function stopTimer() {
  isRunning = false;
  $('playIcon').classList.remove('hidden');
  $('pauseIcon').classList.add('hidden');
  $('playPauseBtn').classList.remove('running');
  clearInterval(timerInterval);
  timerInterval = null;
  updateRing();
  updateFavicon();
  updateTitle();
}

function resetTimer() {
  stopTimer();
  timeLeft = timerMode === 'focus' ? focusSel * 60 : breakSel * 60;
  updateRing();
  updateFavicon();
  updateTitle();
}

function switchMode(mode) {
  timerMode = mode;
  stopTimer();
  timeLeft  = mode === 'focus' ? focusSel * 60 : breakSel * 60;

  $('focusModeBtn').className = `mode-btn ${mode === 'focus' ? 'active-focus' : ''}`;
  $('breakModeBtn').className = `mode-btn ${mode === 'break' ? 'active-break' : ''}`;
  $('playPauseBtn').className = `ctrl-btn ctrl-main${mode === 'break' ? ' break' : ''}`;

  $('bgBlobs').className = `bg-blobs mode-${mode}`;
  updateRing();
  updateFavicon();
  updateTitle();
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateRing();
    updateFavicon();
    updateTitle();
  } else {
    stopTimer();
    const alarm = LS.get(KEY_ALARM, 'chime');
    playAlarm(alarm);
    if (timerMode === 'focus') {
      saveSession(focusSel);
      launchConfetti();
      showQuote();
      sendNotif('🍅 Focus complete!', `Time for a ${breakSel} min break.`);
      switchMode('break');
    } else {
      sendNotif('☕ Break over!', 'Ready for another session?');
      switchMode('focus');
    }
    updateQuickStats();
    updateGoalWidget();
    updateStreakBadge();
  }
}

$('playPauseBtn').addEventListener('click', () => { isRunning ? stopTimer() : startTimer(); });
$('resetBtn').addEventListener('click', resetTimer);
$('focusModeBtn').addEventListener('click', () => switchMode('focus'));
$('breakModeBtn').addEventListener('click', () => switchMode('break'));

document.querySelectorAll('#focusPickers .picker-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    focusSel = parseInt(btn.dataset.mins);
    document.querySelectorAll('#focusPickers .picker-btn').forEach(b => b.className = 'picker-btn');
    btn.classList.add('active-focus');
    if (timerMode === 'focus') { stopTimer(); timeLeft = focusSel * 60; updateRing(); }
  });
});
document.querySelectorAll('#breakPickers .picker-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    breakSel = parseInt(btn.dataset.mins);
    document.querySelectorAll('#breakPickers .picker-btn').forEach(b => b.className = 'picker-btn');
    btn.classList.add('active-break');
    if (timerMode === 'break') { stopTimer(); timeLeft = breakSel * 60; updateRing(); }
  });
});

document.querySelectorAll('.alarm-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    LS.set(KEY_ALARM, btn.dataset.alarm);
    document.querySelectorAll('.alarm-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    playAlarm(btn.dataset.alarm);
  });
});
const savedAlarm = LS.get(KEY_ALARM, 'chime');
document.querySelectorAll('.alarm-btn').forEach(b => {
  b.classList.toggle('active', b.dataset.alarm === savedAlarm);
});

function saveSession(duration) {
  if (!currentUser) return;
  const now = new Date().toISOString();
  const sessions = LS.get(KEY_SESS, []);
  sessions.push({ username: currentUser, duration, date: fmtDate(now), completedAt: now });
  LS.set(KEY_SESS, sessions);
  const users = LS.get(KEY_USERS, {});
  if (!users[currentUser]) users[currentUser] = { totalMinutes: 0, sessions: 0 };
  users[currentUser].totalMinutes += duration;
  users[currentUser].sessions += 1;
  LS.set(KEY_USERS, users);
}

function getMySessions() {
  return LS.get(KEY_SESS, []).filter(s => s.username === currentUser);
}
function getMyStats() {
  return (LS.get(KEY_USERS, {})[currentUser]) || { totalMinutes: 0, sessions: 0 };
}

function updateQuickStats() {
  const stats = getMyStats();
  $('qsSessions').textContent = stats.sessions;
  $('qsHours').textContent    = (stats.totalMinutes / 60).toFixed(1);
  $('qsMinutes').textContent  = stats.totalMinutes;
  $('navbarName').textContent = currentUser;
  $('navbarStat').textContent = `${stats.totalMinutes} min`;
}

function getStreak(sessions) {
  if (!sessions.length) return 0;
  const days  = [...new Set(sessions.map(s => new Date(s.completedAt).toDateString()))];
  const today = new Date();
  let streak  = 0;
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    if (days.includes(d.toDateString())) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function getLongestStreak(sessions) {
  if (!sessions.length) return 0;
  const days = [...new Set(sessions.map(s => new Date(s.completedAt).toDateString()))].sort();
  let max = 1, cur = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i]) - new Date(days[i-1])) / (1000*60*60*24);
    if (diff === 1) { cur++; if (cur > max) max = cur; } else cur = 1;
  }
  return max;
}

function getBestDay(sessions) {
  if (!sessions.length) return { date: '—', mins: 0 };
  const map = {};
  sessions.forEach(s => {
    const d = new Date(s.completedAt).toDateString();
    map[d] = (map[d] || 0) + s.duration;
  });
  const best = Object.entries(map).sort((a,b) => b[1] - a[1])[0];
  return { date: new Date(best[0]).toLocaleDateString(undefined, { month:'short', day:'numeric' }), mins: best[1] };
}

function getTodayMins(sessions) {
  return sessions.filter(s => new Date(s.completedAt).toDateString() === todayStr()).reduce((a, s) => a + s.duration, 0);
}

function updateStreakBadge() {
  const sessions = getMySessions();
  const streak   = getStreak(sessions);
  $('streakCount').textContent = streak;
  $('streakBadge').classList.toggle('active', streak > 0);
}

function updateGoalWidget() {
  const sessions = getMySessions();
  const goal     = LS.get(KEY_GOAL + currentUser, 60);
  const today    = getTodayMins(sessions);
  const pct      = Math.min(100, (today / goal) * 100);
  const done     = pct >= 100;
  $('goalBarFill').style.width = `${pct}%`;
  $('goalPct').textContent     = `${Math.round(pct)}%`;
  $('goalWidget').classList.toggle('done', done);
  $('goalFooter').textContent  = done ? '🎉 Goal reached!' : `${today} / ${goal} min today`;
  $('goalInput').value         = goal;
}

$('goalEditBtn').addEventListener('click', () => {
  $('goalEditRow').classList.remove('hidden');
  $('goalEditBtn').classList.add('hidden');
  $('goalInput').focus();
});
function saveGoal() {
  const val = clamp(parseInt($('goalInput').value) || 60, 5, 480);
  LS.set(KEY_GOAL + currentUser, val);
  $('goalEditRow').classList.add('hidden');
  $('goalEditBtn').classList.remove('hidden');
  updateGoalWidget();
}
$('goalSaveBtn').addEventListener('click', saveGoal);
$('goalInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveGoal(); });

function loadTasks() {
  return LS.get(KEY_TASKS + currentUser, []);
}
function saveTasks(tasks) {
  LS.set(KEY_TASKS + currentUser, tasks);
}

function renderTasks() {
  const tasks    = loadTasks();
  const container = $('taskItems');
  const footer   = $('taskFooter');
  const clearBtn = $('taskClearBtn');
  const progress = $('taskProgress');
  container.innerHTML = '';

  if (tasks.length === 0) {
    footer.classList.add('hidden');
    return;
  }

  footer.classList.remove('hidden');
  const done = tasks.filter(t => t.done).length;
  progress.textContent = `${done}/${tasks.length} done`;
  clearBtn.classList.toggle('hidden', done === 0);

  tasks.forEach(task => {
    const item = document.createElement('div');
    item.className = `task-item${task.done ? ' done' : ''}`;
    item.innerHTML = `
      <button class="task-check${task.done ? ' checked' : ''}" data-id="${task.id}">
        ${task.done ? '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
      </button>
      <span class="task-text">${task.text}</span>
      <button class="task-del" data-id="${task.id}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>`;
    container.appendChild(item);
  });

  container.querySelectorAll('.task-check').forEach(btn => {
    btn.addEventListener('click', () => {
      const tasks = loadTasks();
      const t = tasks.find(t => t.id === parseInt(btn.dataset.id));
      if (t) t.done = !t.done;
      saveTasks(tasks);
      renderTasks();
    });
  });
  container.querySelectorAll('.task-del').forEach(btn => {
    btn.addEventListener('click', () => {
      saveTasks(loadTasks().filter(t => t.id !== parseInt(btn.dataset.id)));
      renderTasks();
    });
  });
}

function addTask() {
  const text = $('taskInput').value.trim();
  if (!text) return;
  const tasks = loadTasks();
  tasks.push({ id: Date.now(), text, done: false });
  saveTasks(tasks);
  $('taskInput').value = '';
  renderTasks();
}

$('taskAddBtn').addEventListener('click', addTask);
$('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
$('taskClearBtn').addEventListener('click', () => {
  saveTasks(loadTasks().filter(t => !t.done));
  renderTasks();
});

let trackIdx   = 0;
let mpPlaying  = false;
let mpMuted    = false;

const audio = $('audioPlayer');

function setTrack(idx, autoplay) {
  trackIdx = (idx + TRACKS.length) % TRACKS.length;
  const t  = TRACKS[trackIdx];
  audio.src = t.url;
  $('mpTitle').textContent   = t.title;
  $('mpArtist').textContent  = `${t.artist} · Pixabay`;
  $('mpCounter').textContent = `${trackIdx + 1}/${TRACKS.length}`;
  $('mpProgressFill').style.width = '0%';
  $('mpProgressDot').style.left   = '0%';
  $('mpCurrent').textContent = '0:00';
  $('mpDuration').textContent = '--:--';
  $('mpError').classList.add('hidden');
  $('mpDisc').style.setProperty('--c', t.color);
  $('mpPlay').style.setProperty('--c', t.color);
  $('mpProgressFill').style.background = t.color;
  $('mpProgressDot').style.background  = t.color;

  // Dots
  const dotsEl = $('mpDots');
  dotsEl.innerHTML = '';
  TRACKS.forEach((tr, i) => {
    const dot = document.createElement('button');
    dot.className = `mp-dot${i === trackIdx ? ' active' : ''}`;
    if (i === trackIdx) dot.style.background = tr.color;
    dot.addEventListener('click', () => setTrack(i, mpPlaying));
    dotsEl.appendChild(dot);
  });

  if (autoplay) mpPlay();
}

function mpPlay() {
  $('mpSpinner').classList.remove('hidden');
  $('mpPlayIcon').classList.add('hidden');
  $('mpPauseIcon').classList.add('hidden');
  audio.play()
    .then(() => {
      mpPlaying = true;
      $('mpSpinner').classList.add('hidden');
      $('mpPlayIcon').classList.add('hidden');
      $('mpPauseIcon').classList.remove('hidden');
      $('mpDiscInner').classList.add('spinning');
    })
    .catch(() => {
      mpPlaying = false;
      $('mpSpinner').classList.add('hidden');
      $('mpPlayIcon').classList.remove('hidden');
      $('mpError').classList.remove('hidden');
    });
}

function mpPause() {
  audio.pause();
  mpPlaying = false;
  $('mpPauseIcon').classList.add('hidden');
  $('mpPlayIcon').classList.remove('hidden');
  $('mpDiscInner').classList.remove('spinning');
}

$('mpPlay').addEventListener('click', () => { mpPlaying ? mpPause() : mpPlay(); });
$('mpPrev').addEventListener('click', () => setTrack(trackIdx - 1, mpPlaying));
$('mpNext').addEventListener('click', () => setTrack(trackIdx + 1, mpPlaying));

audio.addEventListener('ended', () => setTrack(trackIdx + 1, true));
audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  $('mpProgressFill').style.width = `${pct}%`;
  $('mpProgressDot').style.left   = `${pct}%`;
  $('mpCurrent').textContent  = fmtSec(audio.currentTime);
  $('mpDuration').textContent = fmtSec(audio.duration);
});
audio.addEventListener('canplay',  () => { $('mpSpinner').classList.add('hidden'); });
audio.addEventListener('error',    () => { $('mpError').classList.remove('hidden'); $('mpSpinner').classList.add('hidden'); mpPlaying = false; });

$('mpProgressWrap').addEventListener('click', e => {
  if (!audio.duration) return;
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
});

$('mpMuteBtn').addEventListener('click', () => {
  mpMuted = !mpMuted;
  audio.volume = mpMuted ? 0 : parseFloat($('mpVolSlider').value);
  $('mpVolIcon').classList.toggle('hidden', mpMuted);
  $('mpMuteIcon').classList.toggle('hidden', !mpMuted);
});
$('mpVolSlider').addEventListener('input', e => {
  audio.volume = parseFloat(e.target.value);
  mpMuted = false;
  $('mpVolIcon').classList.remove('hidden');
  $('mpMuteIcon').classList.add('hidden');
});

function getChartData(sessions, period) {
  const today = new Date();
  const len   = period === 'week' ? 7 : 30;
  return Array.from({ length: len }, (_, i) => {
    const d   = new Date(today); d.setDate(today.getDate() - (len - 1 - i));
    const key = d.toDateString();
    const mins = sessions.filter(s => new Date(s.completedAt).toDateString() === key).reduce((a,s) => a + s.duration, 0);
    let label = '';
    if (period === 'week') label = d.toLocaleDateString(undefined, { weekday: 'short' });
    else if (i === 0 || i === len-1 || d.getDate() === 1) label = d.toLocaleDateString(undefined, { month:'short', day:'numeric' });
    else if (i % 5 === 0) label = String(d.getDate());
    return { label, mins };
  });
}

function renderHistory() {
  const sessions    = getMySessions();
  const stats       = getMyStats();
  const streak      = getStreak(sessions);
  const longest     = getLongestStreak(sessions);
  const best        = getBestDay(sessions);
  const todayMins   = getTodayMins(sessions);

  $('hTotalMins').textContent = stats.totalMinutes;
  $('hSessions').textContent  = stats.sessions;
  $('hHours').textContent     = (stats.totalMinutes / 60).toFixed(1);
  $('hTodayMins').textContent = todayMins;
  $('pbStreak').textContent   = `${streak} days`;
  $('pbLongest').textContent  = `${longest} days`;
  $('pbBestDay').textContent  = `${best.mins} min · ${best.date}`;

  // Chart
  const data    = getChartData(sessions, chartPeriod);
  const maxMins = Math.max(...data.map(d => d.mins), 1);
  const chart   = $('barChart');
  chart.className = `bar-chart${chartPeriod === 'month' ? ' monthly' : ''}`;
  chart.innerHTML = '';
  data.forEach(d => {
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.title = `${d.mins} min`;
    col.innerHTML = `
      <div class="bar-val">${chartPeriod === 'week' && d.mins > 0 ? d.mins : ''}</div>
      <div class="bar-outer"><div class="bar-fill" style="height:${(d.mins/maxMins)*100}%"></div></div>
      <div class="bar-day">${d.label}</div>`;
    chart.appendChild(col);
  });

  const list = $('sessionList');
  const reversed = [...sessions].reverse();
  if (reversed.length === 0) {
    list.innerHTML = `<div class="empty-state"><span class="empty-state-icon">🚀</span><p>No sessions yet. Start your first!</p></div>`;
  } else {
    list.innerHTML = reversed.map(s => `
      <div class="session-item">
        <div class="session-dot">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </div>
        <div class="session-info">
          <div class="session-duration">${s.duration} min focus session</div>
          <div class="session-date">${s.date}</div>
        </div>
        <div class="session-check">✓</div>
      </div>`).join('');
  }
}

document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    chartPeriod = btn.dataset.period;
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderHistory();
  });
});

$('shortcutBtn').addEventListener('click', () => {
  $('shortcutPopover').classList.toggle('hidden');
});
document.addEventListener('click', e => {
  if (!e.target.closest('.shortcut-hint-wrap')) {
    $('shortcutPopover').classList.add('hidden');
  }
});

document.addEventListener('keydown', e => {
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.code  === 'Space') { e.preventDefault(); isRunning ? stopTimer() : startTimer(); }
  if (e.key   === 'r' || e.key === 'R') resetTimer();
  if (e.key   === 'f' || e.key === 'F') switchMode('focus');
  if (e.key   === 'b' || e.key === 'B') switchMode('break');
  if (e.key   === 'h' || e.key === 'H') showView('history');
  if (e.key   === 't' || e.key === 'T') showView('timer');
  if (e.key   === 'a' || e.key === 'A') showView('about');
});

function initApp() {
  requestNotifPermission();
  $('navbarName').textContent = currentUser;
  updateQuickStats();
  updateStreakBadge();
  updateGoalWidget();
  updateRing();
  updateFavicon();
  updateTitle();
  renderTasks();
  setTrack(0, false);
  switchMode('focus');
  showView('timer');
}

(function boot() {
  const saved = LS.get(KEY_USER, null);
  if (saved) {
    currentUser = saved;
    $('loginScreen').classList.add('hidden');
    $('app').classList.remove('hidden');
    initApp();
  }
})();
