/* ==========================================================================
   Web Audio API Sound Synthesizer for Baby Joy World (Optimized for iPad)
   ========================================================================== */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isUnlocked = false;

    this.lastTouchTime = 0;
    this.lastPopTime = 0;
    this.lastRattleTime = 0;

    // C Major Pentatonic Scale frequencies (Hz) for harmonious tapping
    this.pentatonicNotes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50 // C6
    ];

    // Lullaby Melody notes & durations
    this.lullabyNotes = [
      { note: 261.63, dur: 0.8 }, { note: 261.63, dur: 0.8 },
      { note: 392.00, dur: 0.8 }, { note: 392.00, dur: 0.8 },
      { note: 440.00, dur: 0.8 }, { note: 440.00, dur: 0.8 },
      { note: 392.00, dur: 1.6 },
      { note: 349.23, dur: 0.8 }, { note: 349.23, dur: 0.8 },
      { note: 329.63, dur: 0.8 }, { note: 329.63, dur: 0.8 },
      { note: 293.66, dur: 0.8 }, { note: 293.66, dur: 0.8 },
      { note: 261.63, dur: 1.6 }
    ];
    this.lullabyTimer = null;
    this.lullabyIndex = 0;
  }

  /**
   * Unlock AudioContext on iOS Safari / iPad touch gesture
   */
  async unlock() {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return true;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      // Play brief silent tone to unlock iOS audio engine
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      gain.gain.value = 0.001;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(0);
      osc.stop(this.ctx.currentTime + 0.05);

      this.isUnlocked = true;
      return true;
    } catch (err) {
      console.warn('AudioContext unlock failed:', err);
      return false;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopLullaby();
    }
    return this.isMuted;
  }

  /**
   * Play a pleasant Pentatonic Marimba note based on touch location
   */
  playTouchTone(pitchIndex = -1) {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastTouchTime < 0.04) return; // 40ms audio throttle
    this.lastTouchTime = now;

    const freq = pitchIndex >= 0 
      ? this.pentatonicNotes[pitchIndex % this.pentatonicNotes.length]
      : this.pentatonicNotes[Math.floor(Math.random() * this.pentatonicNotes.length)];

    // Single Sine Oscillator for maximum efficiency
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  }

  /**
   * Play Pop Sound for bubbles / balloons ("ぽんっ！")
   */
  playPop() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastPopTime < 0.03) return; // 30ms throttle
    this.lastPopTime = now;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Play Peek-a-Boo Arpeggio Chime ("いないいない・・・ばあ！")
   */
  playPeekABoo() {
    if (this.isMuted || !this.ctx) return;

    const chords = [392.00, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
    chords.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);
    });
  }

  /**
   * Play Rattle Shaker Sound ("ガラガラ")
   */
  playRattle() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastRattleTime < 0.06) return; // 60ms throttle
    this.lastRattleTime = now;

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.04); // 40ms noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000 + Math.random() * 500, now);
    filter.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  /**
   * Synthesize cute animal sound effects
   */
  playAnimalSound(animalType) {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (animalType === 'chick') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(2800, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (animalType === 'cat') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.15);
      osc.frequency.linearRampToValueAtTime(700, now + 0.3);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (animalType === 'dog') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.12);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      this.playTouchTone(6);
    }
  }

  startLullaby() {
    this.stopLullaby();
    if (this.isMuted || !this.ctx) return;

    this.lullabyIndex = 0;
    const playNextNote = () => {
      if (this.isMuted || !this.ctx) return;
      const item = this.lullabyNotes[this.lullabyIndex];
      this.playOrgelNote(item.note);

      this.lullabyIndex = (this.lullabyIndex + 1) % this.lullabyNotes.length;
      this.lullabyTimer = setTimeout(playNextNote, item.dur * 1000);
    };

    playNextNote();
  }

  playOrgelNote(freq) {
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 1.25);
  }

  stopLullaby() {
    if (this.lullabyTimer) {
      clearTimeout(this.lullabyTimer);
      this.lullabyTimer = null;
    }
  }
}

export const soundSynth = new SoundSynthesizer();
