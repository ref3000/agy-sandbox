/* ==========================================================================
   Canvas Engine & Multi-Touch Particle Physics System (Optimized for iPad)
   ========================================================================== */

export class CanvasEngine {
  constructor(canvasElement, soundSynth) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext('2d');
    this.soundSynth = soundSynth;

    this.width = 0;
    this.height = 0;
    // Cap DPR at 1.25 to prevent 4K/5K canvas resolution performance drops on iPad Retina
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    this.particles = [];
    this.ripples = [];
    this.activeMode = null;

    this.colors = ['#FF6584', '#FF9F1C', '#FFD166', '#06D6A0', '#118AB2', '#A855F7', '#38BDF8'];

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
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.25);

    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

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
    let isTouchDevice = false;

    // Handle touch start exclusively via changedTouches (prevents double-firing on iOS)
    const handleTouchStart = (e) => {
      isTouchDevice = true;
      e.preventDefault();
      
      const rect = this.canvas.getBoundingClientRect();
      const changed = e.changedTouches ? Array.from(e.changedTouches) : [];

      for (let i = 0; i < changed.length; i++) {
        const touch = changed[i];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.handleSingleTouch(x, y, i);
      }
    };

    // Fallback for desktop mouse clicking
    const handleMouseDown = (e) => {
      if (isTouchDevice) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleSingleTouch(x, y, 0);
    };

    this.canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    this.canvas.addEventListener('mousedown', handleMouseDown);
  }

  handleSingleTouch(x, y, index) {
    // Spawn touch burst
    this.spawnTouchBurst(x, y);

    // Sound feedback
    const pitchIdx = Math.floor((x / Math.max(1, this.width)) * 11);
    this.soundSynth.playTouchTone(pitchIdx);

    // Notify active mode
    if (this.activeMode && this.activeMode.onTouch) {
      this.activeMode.onTouch(x, y, index);
    }
  }

  spawnTouchBurst(x, y) {
    // Limit ripples to max 8
    if (this.ripples.length > 8) {
      this.ripples.shift();
    }

    this.ripples.push({
      x, y,
      radius: 6,
      maxRadius: 40 + Math.random() * 30,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      alpha: 1
    });

    // Limit active particles on screen to max 25 total
    if (this.particles.length > 25) {
      this.particles.splice(0, this.particles.length - 20);
    }

    const particleCount = 6 + Math.floor(Math.random() * 4); // 6-9 particles per touch
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.4;
      const speed = 2.5 + Math.random() * 4.5;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color,
        size: 8 + Math.random() * 10,
        alpha: 1
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
        r.radius += (r.maxRadius - r.radius) * 0.15;
        r.alpha -= 0.04;

        if (r.alpha <= 0) {
          this.ripples.splice(i, 1);
          continue;
        }

        this.ctx.beginPath();
        this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = r.color;
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = Math.max(0, r.alpha);
        this.ctx.stroke();
      }

      // Update & Render Touch Particles (Fast vector circles)
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.025;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fill();
      }

      this.ctx.globalAlpha = 1.0;

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }
}
