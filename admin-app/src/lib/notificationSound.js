// Web Audio API Synthesizer & Browser Notification Helper for Admin Portal

export async function playAdminChime(type = 'new_order') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    if (type === 'new_order') {
      // 3 crisp, attention-grabbing chime notes for incoming orders
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, start: 0.0, dur: 0.15 },  // C5
        { freq: 659.25, start: 0.14, dur: 0.18 }, // E5
        { freq: 783.99, start: 0.30, dur: 0.22 }, // G5
        { freq: 1046.50, start: 0.50, dur: 0.40 } // C6
      ];

      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(0.35, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } else if (type === 'test') {
      // Test chime
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    console.warn('[Admin Audio Error]:', e);
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export function sendAdminNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'campusbites-admin-order'
      });
    } catch (e) {}
  }
}
