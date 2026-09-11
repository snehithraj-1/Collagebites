// Web Audio API Synthesizer & Native Desktop Push Notification Engine for CampusBites Admin

let sharedAudioCtx = null;

export function getAudioContext() {
  if (!sharedAudioCtx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

// User click / touch listener to unlock browser audio policy immediately
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
  });
}

/**
 * Play a high-decibel, attention-grabbing restaurant order alert chime.
 * Uses high-penetration harmonic frequencies with a repeating 3-cycle chime
 * so it can be heard clearly across the room outside Chrome.
 */
export async function playAdminChime(type = 'new_order') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'new_order') {
      // 3 Rapid Repeating Order Bell Bursts (DING-DONG ... DING-DONG ... DING-DONG)
      // High volume gain (0.85) and dual triangle oscillators for crisp acoustic bite
      const burstOffsets = [0.0, 0.42, 0.84];

      burstOffsets.forEach((bStart) => {
        // High note 1: A5 (880 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(880.0, now + bStart);
        gain1.gain.setValueAtTime(0.85, now + bStart);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + bStart + 0.22);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now + bStart);
        osc1.stop(now + bStart + 0.22);

        // High note 2: E6 (1318.5 Hz) for penetrating overtone
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1318.5, now + bStart + 0.10);
        gain2.gain.setValueAtTime(0.90, now + bStart + 0.10);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + bStart + 0.38);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + bStart + 0.10);
        osc2.stop(now + bStart + 0.38);
      });
    } else if (type === 'delivered') {
      // Pleasant high success chime
      const notes = [
        { freq: 659.25, start: 0.0, dur: 0.18, gain: 0.65 },
        { freq: 880.0, start: 0.15, dur: 0.25, gain: 0.75 },
        { freq: 1318.51, start: 0.32, dur: 0.45, gain: 0.85 }
      ];
      notes.forEach(({ freq, start, dur, gain: gVal }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + start);
        gain.gain.setValueAtTime(gVal, now + start);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + start);
        osc.stop(now + start + dur);
      });
    } else {
      // Loud test beep (two sharp chirps)
      [0.0, 0.18].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1046.50, now + offset);
        gain.gain.setValueAtTime(0.85, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.15);
      });
    }
  } catch (e) {
    console.warn('[Admin Audio Alert Error]:', e);
  }
}

/**
 * Request native Desktop / Windows notification permission from Chrome
 */
export async function requestNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      playAdminChime('test');
      sendAdminNotification(
        '🔔 Desktop Push Alerts Active!',
        'You will now receive loud order alerts and desktop notifications outside Chrome for all new orders.'
      );
    }
    return permission;
  } catch (e) {
    return Notification.permission;
  }
}

/**
 * Send persistent native OS / Windows push notification that pops up OUTSIDE Chrome
 * Uses requireInteraction: true so it stays visible on the Windows desktop until handled!
 */
export function sendAdminNotification(title, body, options = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const iconSvg = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔔</text></svg>';

    const notification = new Notification(title, {
      body,
      icon: iconSvg,
      badge: iconSvg,
      tag: options.tag || `campusbites-order-${Date.now()}`,
      requireInteraction: true, // Crucial: forces Windows banner to remain visible outside Chrome until user interacts!
      silent: false, // Ensures Windows/OS plays its native alert chime
      ...options
    });

    // Clicking the notification outside Chrome focuses the Admin window and dismisses toast
    notification.onclick = function () {
      window.focus();
      this.close();
    };
  } catch (e) {
    console.warn('[Push Notification Error]:', e);
  }
}
