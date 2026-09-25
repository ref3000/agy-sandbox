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

    // Japanese Nursery Rhyme "Tulip" (さいた さいた チューリップのはなが...)
    this.tulipMelody = [
      261.63, 293.66, 329.63, // さ い た
      261.63, 293.66, 329.63, // さ い た
      392.00, 329.63, 293.66, 261.63, // ちゅー りっ ぷ の
      293.66, 329.63, 293.66, // は な が
      261.63, 293.66, 329.63, // な ら ん だ
      261.63, 293.66, 329.63, // な ら ん だ
      392.00, 329.63, 293.66, 261.63, // あ か し ろ
      293.66, 329.63, 261.63, // き い ろ
      392.00, 392.00, 329.63, 392.00, // ど の は な
      440.00, 440.00, 392.00, // み て も
      329.63, 329.63, 293.66, 293.66, // き れ い
      261.63 // だ な
    ];

    // Japanese Nursery Rhyme "Twinkle Twinkle Little Star" (きらきらひかる おそらのほしよ...)
    this.starMelody = [
      261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, // き ら き ら ひ か る
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, // お そ ら の ほ し よ
      392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, // ま ば た き し て は
      392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, // み ん な を み て る
      261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, // き ら き ら ひ か る
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63  // お そ ら の ほ し よ
    ];

    // Japanese Nursery Rhyme "Umi" (うみ)
    // シ～ラ～ソ ミラソ～ミ～ レレソ～ソ～ラ～ / シ～シ～レ～ シシラ～ソ～ ミミレ～ラ～ソ～
    this.umiMelody = [
      493.88, 440.00, 392.00, 329.63, 440.00, 392.00, 329.63, // シ～ラ～ソ ミラソ～ミ～
      293.66, 293.66, 392.00, 392.00, 440.00,                 // レレソ～ソ～ラ～
      493.88, 493.88, 587.33, 493.88, 493.88, 440.00, 392.00, // シ～シ～レ～ シシラ～ソ～
      329.63, 329.63, 293.66, 440.00, 392.00                  // ミミレ～ラ～ソ～
    ];

    // ABC Song (Alphabet Song)
    this.abcMelody = [
      261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, // A B C D E F G
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, // H I J K L M N O P
      392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, // Q R S, T U V
      392.00, 392.00, 349.23, 349.23, 329.63, 329.63, 293.66, // W X, Y and Z
      261.63, 261.63, 392.00, 392.00, 440.00, 440.00, 392.00, // Now I know my ABCs
      349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63  // Next time won't you sing with me
    ];

    this.currentMelody = this.tulipMelody;
    this.currentMelodyIdx = 0;

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
      // Unlock Web Speech API on iOS / Mobile Safari
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const dummy = new SpeechSynthesisUtterance('');
          dummy.lang = 'ja-JP';
          window.speechSynthesis.speak(dummy);
        } catch (e) {}
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
   * Set active nursery rhyme song ('tulip' or 'star')
   */
  setNurserySong(songKey) {
    if (songKey === 'star') {
      this.currentMelody = this.starMelody;
    } else if (songKey === 'umi') {
      this.currentMelody = this.umiMelody;
    } else if (songKey === 'abc') {
      this.currentMelody = this.abcMelody;
    } else {
      this.currentMelody = this.tulipMelody;
    }
    this.currentMelodyIdx = 0;
  }

  /**
   * Play next note of active Japanese Nursery Rhyme ("チューリップ" or "きらきらぼし") on tap
   */
  playNurseryMelodyNote() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;
    if (now - this.lastTouchTime < 0.04) return;
    this.lastTouchTime = now;

    const melody = this.currentMelody || this.tulipMelody;
    const freq = melody[this.currentMelodyIdx % melody.length];
    this.currentMelodyIdx = (this.currentMelodyIdx + 1) % melody.length;

    // Glockenspiel / Marimba dual oscillator for rich, warm musical sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now);

    const gain1 = this.ctx.createGain();
    const gain2 = this.ctx.createGain();

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.35, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.ctx.destination);
    gain2.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.70);
    osc2.stop(now + 0.35);
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
   * Play realistic paper page flip sound ("ペラっ！")
   */
  playPageFlip() {
    if (this.isMuted || !this.ctx) return;

    const now = this.ctx.currentTime;

    // Create white noise buffer for paper swish
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    // Sweeping bandpass filter to simulate paper movement
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.15);

    // Add a soft pleasant chime note at the end of page flip
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

    oscGain.gain.setValueAtTime(0.001, now + 0.05);
    oscGain.gain.linearRampToValueAtTime(0.15, now + 0.08);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    osc.start(now + 0.05);
    osc.stop(now + 0.25);
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

  /**
   * Play stroke success chime ("ぴんぽん！")
   */
  playStrokeSuccess() {
    if (this.isMuted || !this.ctx) return;

    const notes = [523.25, 659.25]; // C5 -> E5
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    });
  }

  /**
   * Play letter completed fanfare ("できたー！")
   */
  playCompleteFanfare() {
    if (this.isMuted || !this.ctx) return;

    const fanfare = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    fanfare.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.12;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    });
  }

  /**
   * Speak Hiragana and Example Word using Web Speech API ("い！ いちご！")
   */
  speakWord(char, word) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel(); // cancel any active speech

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const text = `${char}！ ${word}！`;
      const uttr = new SpeechSynthesisUtterance(text);
      uttr.lang = 'ja-JP';
      uttr.rate = 0.80; // slightly slower for toddlers
      uttr.pitch = 1.25; // cute, friendly higher pitch

      // CRITICAL FOR iOS SAFARI: Keep a reference on instance so GC doesn't destroy utterance
      this.currentUtterance = uttr;

      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang && (v.lang.includes('ja') || v.lang.includes('JP')));
      if (jaVoice) {
        uttr.voice = jaVoice;
      }

      uttr.onend = () => {
        this.currentUtterance = null;
      };
      uttr.onerror = (e) => {
        console.warn('Utterance error:', e);
        this.currentUtterance = null;
      };

      window.speechSynthesis.speak(uttr);
    } catch (err) {
      console.warn('Web Speech API failed:', err);
    }
  }

  stopLullaby() {
    if (this.lullabyTimer) {
      clearTimeout(this.lullabyTimer);
      this.lullabyTimer = null;
    }
  }
}

export const soundSynth = new SoundSynthesizer();
