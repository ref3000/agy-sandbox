/* ==========================================================================
   あそびモード 3: ふしぎなガラガラ (Magical Rattle & High Contrast Shapes) - Optimized
   ========================================================================== */

export class RattleMode {
  constructor() {
    this.rattles = [];
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;
    this.setupRattles();
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.setupRattles();
  }

  setupRattles() {
    const count = 4;
    this.rattles = [];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i;
      const radius = Math.min(this.width, this.height) * 0.28;
      const x = this.width / 2 + Math.cos(angle) * radius;
      const y = this.height / 2 + Math.sin(angle) * radius + 20;

      this.rattles.push({
        x, y,
        baseX: x,
        baseY: y,
        radius: 60 + Math.random() * 15,
        rotation: 0,
        rotSpeed: 0.02 * (i % 2 === 0 ? 1 : -1),
        wobble: 0,
        colorType: i % 4,
        type: i
      });
    }
  }

  onTouch(x, y) {
    let hit = false;
    this.rattles.forEach(r => {
      const dist = Math.hypot(x - r.x, y - r.y);
      if (dist < r.radius * 1.4) {
        r.wobble = 0.8;
        r.rotSpeed = (Math.random() - 0.5) * 0.35;
        this.soundSynth.playRattle();
        hit = true;
      }
    });

    if (!hit) {
      this.soundSynth.playRattle();
    }
  }

  update() {
    this.rattles.forEach(r => {
      r.rotation += r.rotSpeed;
      r.rotSpeed += (0.02 * (r.type % 2 === 0 ? 1 : -1) - r.rotSpeed) * 0.05;

      if (r.wobble > 0) {
        r.wobble *= 0.92;
      }
    });
  }

  render(ctx) {
    const now = Date.now();
    for (let i = 0; i < this.rattles.length; i++) {
      const r = this.rattles[i];
      const wobbleX = r.x + Math.sin(now * 0.01) * r.wobble * 15;
      const rad = r.radius * (1 + Math.sin(now * 0.008) * r.wobble * 0.15);

      ctx.save();
      ctx.translate(wobbleX, r.y);
      ctx.rotate(r.rotation);

      if (r.colorType === 0) {
        // High Contrast Black & Red Bullseye
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#E63946';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.68, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, rad * 0.38, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        ctx.font = `${rad * 0.4}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👶', 0, 0);

      } else if (r.colorType === 1) {
        // Spiral Rattle Ring
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#FFC72C';
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#1E293B';
        ctx.stroke();

        ctx.font = `${rad * 0.85}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔔', 0, 0);

      } else if (r.colorType === 2) {
        // High Contrast Blue Rattle
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.fill();

        ctx.font = `${rad * 0.85}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌀', 0, 0);

      } else {
        // Star Rattle Ring
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#FF6584';
        ctx.fill();

        ctx.font = `${rad * 0.85}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🌟', 0, 0);
      }

      ctx.restore();
    }
  }

  destroy() {
    this.rattles = [];
  }
}
