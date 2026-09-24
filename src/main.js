/* ==========================================================================
   あかちゃん だいすき！ぽんぽんワールド - Main Entrypoint & Controller
   ========================================================================== */

import { soundSynth } from './audio/soundSynth.js';
import { CanvasEngine } from './components/CanvasEngine.js';
import { BubblePopMode } from './modes/BubblePopMode.js';
import { PeekABooMode } from './modes/PeekABooMode.js';
import { RattleMode } from './modes/RattleMode.js';
import { LullabyMode } from './modes/LullabyMode.js';

class BabyJoyApp {
  constructor() {
    this.canvasEngine = null;
    this.modes = {};
    this.currentModeKey = 'bubble';
    this.isLocked = false;
    this.lockTimer = null;

    this.init();
  }

  init() {
    const canvas = document.getElementById('game-canvas');
    this.canvasEngine = new CanvasEngine(canvas, soundSynth);

    // Initialize Modes
    this.modes = {
      bubble: new BubblePopMode(),
      peekaboo: new PeekABooMode(),
      rattle: new RattleMode(),
      lullaby: new LullabyMode()
    };

    this.bindDOMEvents();
    this.preventiPadGestures();
  }

  preventiPadGestures() {
    // Prevent double-tap zoom & elastic scroll on iPad Mobile Safari
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    document.addEventListener('gestureend', (e) => e.preventDefault());

    // Prevent default bounce drag
    document.body.addEventListener('touchmove', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        e.preventDefault();
      }
    }, { passive: false });
  }

  bindDOMEvents() {
    // Start Overlay Unlock for iOS Web Audio
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');

    const handleStart = async (e) => {
      e.preventDefault();
      await soundSynth.unlock();
      startOverlay.classList.add('hidden');
      this.switchMode('bubble');
    };

    startBtn.addEventListener('click', handleStart);
    startOverlay.addEventListener('pointerdown', handleStart);

    // Mode Switcher Tabs
    const tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        if (this.isLocked) {
          this.showToast('🔒 パパ・ママロック中です (3秒長押しで解除)');
          return;
        }
        const modeKey = tab.dataset.mode;
        this.switchMode(modeKey);
      });
    });

    // Sound Mute Toggle Button
    const soundBtn = document.getElementById('sound-toggle-btn');
    const soundIcon = document.getElementById('sound-icon');
    soundBtn.addEventListener('click', () => {
      const isMuted = soundSynth.toggleMute();
      soundIcon.textContent = isMuted ? '🔇' : '🔊';
      this.showToast(isMuted ? 'ミュート中 🔇' : 'おとをオンにしました 🔊');
    });

    // Parental Lock Button (3 second long press)
    const lockBtn = document.getElementById('parent-lock-btn');
    const lockIcon = document.getElementById('lock-icon');

    const startLockHold = () => {
      this.lockTimer = setTimeout(() => {
        this.toggleLock();
      }, 2500); // 2.5 seconds hold
    };

    const cancelLockHold = () => {
      if (this.lockTimer) {
        clearTimeout(this.lockTimer);
        this.lockTimer = null;
      }
    };

    lockBtn.addEventListener('pointerdown', startLockHold);
    lockBtn.addEventListener('pointerup', cancelLockHold);
    lockBtn.addEventListener('pointerleave', cancelLockHold);
    lockBtn.addEventListener('click', () => {
      if (!this.isLocked) {
        this.showToast('💡 ロックするには 3秒間長押し してください');
      } else {
        this.toggleLock();
      }
    });

    // Modal unlock button
    const unlockModalBtn = document.getElementById('unlock-btn');
    const lockOverlayModal = document.getElementById('lock-overlay');
    unlockModalBtn.addEventListener('click', () => {
      this.toggleLock(false);
      lockOverlayModal.classList.add('hidden');
    });
  }

  toggleLock(forceState = null) {
    this.isLocked = forceState !== null ? forceState : !this.isLocked;
    const lockBtn = document.getElementById('parent-lock-btn');
    const lockIcon = document.getElementById('lock-icon');

    if (this.isLocked) {
      lockBtn.classList.add('locked');
      lockIcon.textContent = '🔒';
      this.showToast('🔒 保護者ロックをオンにしました');
    } else {
      lockBtn.classList.remove('locked');
      lockIcon.textContent = '🔓';
      this.showToast('🔓 保護者ロックを解除しました');
    }
  }

  switchMode(modeKey) {
    if (!this.modes[modeKey]) return;

    this.currentModeKey = modeKey;

    // Update active tab UI
    const tabs = document.querySelectorAll('.mode-tab');
    tabs.forEach(t => {
      if (t.dataset.mode === modeKey) {
        t.classList.add('active');
      } else {
        t.classList.remove('active');
      }
    });

    // Set background theme
    const container = document.getElementById('game-container');
    container.style.background = `var(--bg-${modeKey})`;

    // Delegate mode to Canvas Engine
    this.canvasEngine.setMode(this.modes[modeKey]);
  }

  showToast(message) {
    const toast = document.getElementById('toast-msg');
    toast.textContent = message;
    toast.classList.remove('hidden');

    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2500);
  }
}

// Initialize Application on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  new BabyJoyApp();
});
