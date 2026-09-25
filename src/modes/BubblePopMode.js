/* ==========================================================================
   あそびモード 1: ぽんぽんポップ (Bubble & Balloon Pop) - Optimized for iPad
   ========================================================================== */

export class BubblePopMode {
  constructor() {
    this.bubbles = [];
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;
    this.popEffects = [];
    this.colors = [
      '#FF6584', '#FF9F1C', '#FFD166', '#06D6A0', 
      '#118AB2', '#A855F7', '#FF85A2', '#38BDF8'
    ];
    this.isBubbleMode = true;

    // Nursery Rhyme Songs & Emojis
    this.songs = {
      tulip: {
        name: 'チューリップ 🌷',
        symbols: ['🌷', '🌸', '🌹', '🌺', '🌼']
      },
      star: {
        name: 'きらきらぼし ⭐',
        symbols: ['⭐', '🌟', '✨', '💫', '🌙']
      }
    };
    this.currentSongKey = 'tulip';
    this.symbols = this.songs.tulip.symbols;
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;

    // Randomly select between Tulip (Flower) and Star song
    const songKeys = ['tulip', 'star'];
    this.currentSongKey = songKeys[Math.floor(Math.random() * songKeys.length)];
    this.symbols = this.songs[this.currentSongKey].symbols;

    if (this.soundSynth && this.soundSynth.setNurserySong) {
      this.soundSynth.setNurserySong(this.currentSongKey);
    }

    this.bubbles = [];
    this.popEffects = [];

    // Pre-spawn 8-9 balloons
    for (let i = 0; i < 9; i++) {
      this.spawnBubble(true);
    }
  }

  spawnBubble(randomY = false) {
    const radius = 50 + Math.random() * 45;
    const x = radius + Math.random() * (Math.max(100, this.width - radius * 2));
    const y = randomY ? Math.random() * (this.height - 100) + 50 : this.height + radius + Math.random() * 80;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const face = this.symbols[Math.floor(Math.random() * this.symbols.length)];

    this.bubbles.push({
      x, y,
      radius,
      color,
      face,
      vy: -(1.0 + Math.random() * 1.4),
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.02
    });
  }

  onTouch(x, y) {
    // Check if clicked song switch pill at top center
    const pill = { x: this.width / 2, y: 70, w: 210, h: 38 };
    if (Math.abs(x - pill.x) < pill.w / 2 && Math.abs(y - pill.y) < pill.h / 2) {
      this.switchSong();
      return;
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      const dist = Math.hypot(x - b.x, y - b.y);

      if (dist < b.radius + 20) {
        this.soundSynth.playPop();
        this.spawnPopEffect(b.x, b.y, b.color, b.face);
        this.bubbles.splice(i, 1);
        this.spawnBubble(false);
        break;
      }
    }
  }

  switchSong() {
    this.currentSongKey = this.currentSongKey === 'tulip' ? 'star' : 'tulip';
    this.symbols = this.songs[this.currentSongKey].symbols;
    if (this.soundSynth && this.soundSynth.setNurserySong) {
      this.soundSynth.setNurserySong(this.currentSongKey);
    }
    // Refresh balloon faces
    this.bubbles.forEach(b => {
      b.face = this.symbols[Math.floor(Math.random() * this.symbols.length)];
    });
  }

  spawnPopEffect(x, y, color, face) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 4 + Math.random() * 5;
      this.popEffects.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 7 + Math.random() * 8,
        alpha: 1
      });
    }
    this.popEffects.push({
      x, y,
      vx: 0,
      vy: -2.5,
      face,
      isFace: true,
      size: 55,
      alpha: 1
    });
  }

  update(width, height) {
    this.width = width;
    this.height = height;

    this.bubbles.forEach(b => {
      b.y += b.vy;
      b.wobbleOffset += b.wobbleSpeed;
      b.x += Math.sin(b.wobbleOffset) * 1.0;

      if (b.y < -b.radius - 30) {
        b.y = this.height + b.radius + 30;
        b.x = b.radius + Math.random() * Math.max(10, this.width - b.radius * 2);
      }
    });

    while (this.bubbles.length < 8) {
      this.spawnBubble(false);
    }

    for (let i = this.popEffects.length - 1; i >= 0; i--) {
      const p = this.popEffects[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;

      if (p.alpha <= 0) {
        this.popEffects.splice(i, 1);
      }
    }
  }

  render(ctx) {
    // 1. Song Title Pill Badge at top
    const songInfo = this.songs[this.currentSongKey];
    ctx.save();
    const pillW = 210;
    const pillH = 38;
    const pillX = this.width / 2 - pillW / 2;
    const pillY = 65;

    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFE0E9';
    ctx.stroke();

    ctx.font = '700 15px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FF6584';
    ctx.fillText(`🎵 きょく: ${songInfo.name}`, this.width / 2, pillY + pillH / 2);
    ctx.restore();

    // 2. Render Bubbles & Balloons
    for (let i = 0; i < this.bubbles.length; i++) {
      const b = this.bubbles[i];

      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = b.color;
      ctx.fill();

      // Specular Highlight
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.fill();

      // Balloon string
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.radius);
      ctx.lineTo(b.x, b.y + b.radius + 18);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Flower or Star Emoji inside
      ctx.font = `${b.radius * 1.1}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.face, b.x, b.y + 3);
    }

    // Render Pop Effects
    for (let i = 0; i < this.popEffects.length; i++) {
      const p = this.popEffects[i];
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.isFace) {
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.face, p.x, p.y);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;
  }

  destroy() {
    this.bubbles = [];
    this.popEffects = [];
  }
}
