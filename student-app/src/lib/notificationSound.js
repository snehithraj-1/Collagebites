// Web Audio API Synthesizer & Browser Notification Helper for Student Portal

export async function playStudentChime(stage = 'status_update') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const now = ctx.currentTime;

    if (stage === 'DELIVERED') {
      // Celebratory cheerful chords
      [
        { freq: 523.25, start: 0.0, dur: 0.2 },  // C5
        { freq: 659.25, start: 0.15, dur: 0.2 }, // E5
        { freq: 783.99, start: 0.30, dur: 0.2 }, // G5
        { freq: 1046.50, start: 0.45, dur: 0.5 } // C6
      ].forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.3, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } else {
      // Pleasant double-bell chime
      [
        { freq: 659.25, start: 0.0, dur: 0.18 }, // E5
        { freq: 880.00, start: 0.15, dur: 0.35 }  // A5
      ].forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.3, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    }
  } catch (e) {
    console.warn('[Student Audio Warning]:', e);
  }
}

export function requestStudentNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendStudentNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'campusbites-student-status'
      });
    } catch (e) {}
  }
}
