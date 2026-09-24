/* ==========================================================================
   あそびモード 2: いないいないばぁ！ (Peek-a-Boo Animals)
   ========================================================================== */

export class PeekABooMode {
  constructor() {
    this.animals = [];
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;
    this.setupAnimals();
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
    this.setupAnimals();
  }

  setupAnimals() {
    const list = [
      { name: 'くまさん', emoji: '🐻', cover: '☁️', sound: 'bear', color: '#FFB703' },
      { name: 'うさぎさん', emoji: '🐰', cover: '🌸', sound: 'chick', color: '#FF85A2' },
      { name: 'ひよこさん', emoji: '🐥', cover: '🥚', sound: 'chick', color: '#FFD166' },
      { name: 'ねこさん', emoji: '🐱', cover: '🎀', sound: 'cat', color: '#38BDF8' },
      { name: 'いぬさん', emoji: '🐶', cover: '🎁', sound: 'dog', color: '#A855F7' },
      { name: 'らいおんさん', emoji: '🦁', cover: '🌻', sound: 'bear', color: '#FB8500' }
    ];

    const cols = this.width > 700 ? 3 : 2;
    const rows = Math.ceil(list.length / cols);
    const cellW = this.width / cols;
    const cellH = (this.height - 100) / rows;

    this.animals = list.map((item, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      const x = cellW * c + cellW / 2;
      const y = cellH * r + cellH / 2 + 50;

      return {
        ...item,
        x, y,
        size: Math.min(cellW, cellH) * 0.4,
        isRevealed: false,
        animOffset: 0,
        timer: null
      };
    });
  }

  onTouch(x, y) {
    this.animals.forEach(a => {
      const dist = Math.hypot(x - a.x, y - a.y);
      if (dist < a.size * 1.3) {
        this.revealAnimal(a);
      }
    });
  }

  revealAnimal(a) {
    if (a.isRevealed) return;

    a.isRevealed = true;
    a.animOffset = -25; // bounce up animation

    // Play Peek-a-Boo chime + animal voice
    this.soundSynth.playPeekABoo();
    setTimeout(() => {
      this.soundSynth.playAnimalSound(a.sound);
    }, 250);

    // Auto cover back after 3.2 seconds
    if (a.timer) clearTimeout(a.timer);
    a.timer = setTimeout(() => {
      a.isRevealed = false;
      a.animOffset = 0;
    }, 3200);
  }

  update() {
    this.animals.forEach(a => {
      if (a.isRevealed) {
        a.animOffset += (0 - a.animOffset) * 0.1;
      }
    });
  }

  render(ctx) {
    this.animals.forEach(a => {
      ctx.save();
      ctx.translate(a.x, a.y + a.animOffset);

      // Background glowing pod
      ctx.beginPath();
      ctx.arc(0, 0, a.size * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = a.color + '22';
      ctx.fill();

      if (a.isRevealed) {
        // Revealed Face ("ばあー！")
        ctx.font = `${a.size * 1.3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.emoji, 0, 0);

        // "ばぁ！" Text Pill
        ctx.font = 'bold 24px "Zen Maru Gothic", sans-serif';
        ctx.fillStyle = '#FF6584';
        ctx.fillText('ばぁ！✨', 0, -a.size * 0.95);
      } else {
        // Hiding Cover ("いないいない...")
        ctx.font = `${a.size * 1.1}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(a.cover, 0, 0);

        // Peek hands overlay
        ctx.font = `${a.size * 0.7}px sans-serif`;
        ctx.fillText('🙈', 0, 5);

        // "いないいない..." Text
        ctx.font = 'bold 20px "Zen Maru Gothic", sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('タップしてね♪', 0, a.size * 0.95);
      }

      ctx.restore();
    });
  }

  destroy() {
    this.animals.forEach(a => {
      if (a.timer) clearTimeout(a.timer);
    });
    this.animals = [];
  }
}
