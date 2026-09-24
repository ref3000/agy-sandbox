/* ==========================================================================
   あそびモード 1: ぽんぽんポップ (Bubble & Balloon Pop)
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
    this.faceIcons = ['😊', '🐻', '🐰', '🐥', '🐱', '⭐', '🎈'];
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;
    this.bubbles = [];
    this.popEffects = [];

    // Pre-spawn 10-14 bubbles/balloons
    for (let i = 0; i < 12; i++) {
      this.spawnBubble(true);
    }
  }

  spawnBubble(randomY = false) {
    const radius = 55 + Math.random() * 50; // Much larger balloons (up to 210px diameter)
    const x = radius + Math.random() * (this.width - radius * 2);
    const y = randomY ? Math.random() * (this.height - 100) + 50 : this.height + radius + Math.random() * 80;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const face = this.faceIcons[Math.floor(Math.random() * this.faceIcons.length)];

    this.bubbles.push({
      x, y,
      radius,
      color,
      face,
      vy: -(1.0 + Math.random() * 1.5),
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.02 + Math.random() * 0.03
    });
  }

  onTouch(x, y) {
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      const dist = Math.hypot(x - b.x, y - b.y);

      if (dist < b.radius + 25) {
        // Pop balloon!
        this.soundSynth.playPop();

        // Add explosion particles
        this.spawnPopEffect(b.x, b.y, b.color, b.face);

        // Remove bubble and spawn a new one
        this.bubbles.splice(i, 1);
        this.spawnBubble(false);
        break;
      }
    }
  }

  spawnPopEffect(x, y, color, face) {
    for (let i = 0; i < 16; i++) {
      const angle = (Math.PI * 2 / 16) * i;
      const speed = 5 + Math.random() * 6;
      this.popEffects.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 8 + Math.random() * 10,
        alpha: 1
      });
    }
    // Floating face symbol (Large Emoji)
    this.popEffects.push({
      x, y,
      vx: 0,
      vy: -3,
      face,
      isFace: true,
      size: 72,
      alpha: 1
    });
  }

  update(width, height) {
    this.width = width;
    this.height = height;

    // Update bubbles
    this.bubbles.forEach(b => {
      b.y += b.vy;
      b.wobbleOffset += b.wobbleSpeed;
      b.x += Math.sin(b.wobbleOffset) * 1.2;

      // Wrap around top
      if (b.y < -b.radius - 30) {
        b.y = this.height + b.radius + 30;
        b.x = b.radius + Math.random() * (this.width - b.radius * 2);
      }
    });

    // Keep bubble count consistent
    while (this.bubbles.length < 10) {
      this.spawnBubble(false);
    }

    // Update pop particles
    for (let i = this.popEffects.length - 1; i >= 0; i--) {
      const p = this.popEffects[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.025;

      if (p.alpha <= 0) {
        this.popEffects.splice(i, 1);
      }
    }
  }

  render(ctx, width, height) {
    // Render Bubbles & Balloons
    this.bubbles.forEach(b => {
      ctx.save();
      ctx.translate(b.x, b.y);

      // Shiny gradient bubble / balloon fill
      const grad = ctx.createRadialGradient(-b.radius * 0.3, -b.radius * 0.3, b.radius * 0.1, 0, 0, b.radius);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.3, b.color);
      grad.addColorStop(1, b.color);

      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 15;
      ctx.fill();

      // Bubble specular highlight
      ctx.beginPath();
      ctx.arc(-b.radius * 0.35, -b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.fill();

      // Balloon string
      ctx.beginPath();
      ctx.moveTo(0, b.radius);
      ctx.lineTo(0, b.radius + 20);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Large Cute face inside
      ctx.font = `${b.radius * 1.15}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.face, 0, 3);

      ctx.restore();
    });

    // Render Pop Effects
    this.popEffects.forEach(p => {
      ctx.save();
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
      ctx.restore();
    });
  }

  destroy() {
    this.bubbles = [];
    this.popEffects = [];
  }
}
