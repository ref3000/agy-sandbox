/* ==========================================================================
   あそびモード 4: おやすみオルゴール (Lullaby Music Box & Calm Night Sky) - Optimized
   ========================================================================== */

export class LullabyMode {
  constructor() {
    this.stars = [];
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;
    this.shootingStars = [];
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;
    this.setupStars();

    this.soundSynth.startLullaby();
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.setupStars();
  }

  setupStars() {
    this.stars = [];
    const count = 30; // 30 twinkling stars
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 2 + Math.random() * 3,
        alpha: Math.random(),
        speed: 0.01 + Math.random() * 0.02
      });
    }
  }

  onTouch(x, y) {
    // Limit shooting stars to max 10
    if (this.shootingStars.length > 10) {
      this.shootingStars.shift();
    }

    this.shootingStars.push({
      x, y,
      vx: (Math.random() - 0.5) * 8,
      vy: -4 - Math.random() * 4,
      alpha: 1,
      size: 24
    });

    this.soundSynth.playOrgelNote(523.25 + Math.random() * 300);
  }

  update() {
    this.stars.forEach(s => {
      s.alpha += s.speed;
      if (s.alpha > 1 || s.alpha < 0.2) {
        s.speed = -s.speed;
      }
    });

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const s = this.shootingStars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.025;
      if (s.alpha <= 0) {
        this.shootingStars.splice(i, 1);
      }
    }
  }

  render(ctx, width, height) {
    // Background Night Sky Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#0F172A');
    grad.addColorStop(0.5, '#1E1B4B');
    grad.addColorStop(1, '#311042');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Glowing Crescent Moon Halo (Without heavy shadowBlur)
    const moonX = width * 0.8;
    const moonY = height * 0.25;
    const moonRadius = Math.min(width, height) * 0.12;

    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 224, 102, 0.15)';
    ctx.fill();

    ctx.font = `${Math.min(width, height) * 0.22}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🌙', moonX, moonY);

    // Render Twinkling Stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fill();
    }

    // Render Shooting Stars
    for (let i = 0; i < this.shootingStars.length; i++) {
      const s = this.shootingStars[i];
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.font = `${s.size}px sans-serif`;
      ctx.fillText('✨', s.x, s.y);
    }

    ctx.globalAlpha = 1.0;
  }

  destroy() {
    if (this.soundSynth) {
      this.soundSynth.stopLullaby();
    }
    this.stars = [];
    this.shootingStars = [];
  }
}
