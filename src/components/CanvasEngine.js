/* ==========================================================================
   Canvas Engine & Multi-Touch Particle Physics System
   ========================================================================== */

export class CanvasEngine {
  constructor(canvasElement, soundSynth) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.soundSynth = soundSynth;

    this.width = 0;
    this.height = 0;
    this.dpr = window.devicePixelRatio || 1;

    this.particles = [];
    this.ripples = [];
    this.activeMode = null;

    this.initCanvas();
    this.bindEvents();
    this.startLoop();
  }

  initCanvas() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = window.devicePixelRatio || 1;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);

    if (this.activeMode && this.activeMode.onResize) {
      this.activeMode.onResize(this.width, this.height);
    }
  }

  setMode(mode) {
    if (this.activeMode && this.activeMode.destroy) {
      this.activeMode.destroy();
    }
    this.activeMode = mode;
    if (this.activeMode && this.activeMode.init) {
      this.activeMode.init(this.width, this.height, this.soundSynth);
    }
  }

  bindEvents() {
    // iPad Multi-touch & Pointer Events
    const handleTouch = (e) => {
      e.preventDefault();
      
      // Handle touches or pointer events
      const touches = e.touches ? Array.from(e.touches) : [{ clientX: e.clientX, clientY: e.clientY }];

      touches.forEach((touch, index) => {
        const x = touch.clientX;
        const y = touch.clientY;

        // Spawn particles & ripples
        this.spawnTouchBurst(x, y);

        // Sound feedback
        const pitchIdx = Math.floor((x / this.width) * 11);
        this.soundSynth.playTouchTone(pitchIdx);

        // Notify active mode
        if (this.activeMode && this.activeMode.onTouch) {
          this.activeMode.onTouch(x, y, index);
        }
      });
    };

    this.canvas.addEventListener('pointerdown', handleTouch, { passive: false });
    this.canvas.addEventListener('touchstart', handleTouch, { passive: false });
  }

  /**
   * Burst colorful stars, hearts & sparkles on touch
   */
  spawnTouchBurst(x, y) {
    // Add expanding ripple
    this.ripples.push({
      x, y,
      radius: 5,
      maxRadius: 60 + Math.random() * 40,
      color: `hsl(${Math.floor(Math.random() * 360)}, 100%, 65%)`,
      alpha: 1
    });

    // Spawn 8-14 floating particles
    const particleCount = 10 + Math.floor(Math.random() * 5);
    const symbols = ['⭐', '💖', '✨', '🎈', '🌸', '🌟'];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + (Math.random() * 0.5);
      const speed = 3 + Math.random() * 6;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 38 + Math.random() * 40,
        alpha: 1,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.1,
        life: 1
      });
    }
  }

  startLoop() {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render Active Mode
      if (this.activeMode && this.activeMode.render) {
        this.activeMode.update(this.width, this.height);
        this.activeMode.render(this.ctx, this.width, this.height);
      }

      // Update & Render Ripples
      for (let i = this.ripples.length - 1; i >= 0; i--) {
        const r = this.ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.12;
        r.alpha -= 0.035;

        if (r.alpha <= 0) {
          this.ripples.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = r.color;
        this.ctx.lineWidth = 4;
        this.ctx.globalAlpha = Math.max(0, r.alpha);
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Update & Render Touch Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // light gravity
        p.rotation += p.vr;
        p.alpha -= 0.02;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rotation);
        this.ctx.font = `${p.size}px sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(p.symbol, 0, 0);
        this.ctx.restore();
      }

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
