/* ==========================================================================
   あそびモード: ずかん (Picture Encyclopedia & Card Zoom Pop-up)
   ========================================================================== */

export class ZukanMode {
  constructor() {
    this.soundSynth = null;
    this.width = 0;
    this.height = 0;

    this.activeCard = null; // Card currently zoomed in center
    this.zoomProgress = 0;   // 0 to 1 smooth zoom animation scale
    this.effects = [];
    this.currentCategoryIndex = 0;

    // Categories of Cards (8 items per category, visible on 1 screen)
    this.categories = [
      {
        id: 'animals',
        title: 'どうぶつ',
        icon: '🐶',
        bgColor: '#FFF5F7',
        cards: [
          { id: 'dog', name: 'いぬ', emoji: '🐶', color: '#FF9F1C', imageSrc: '/zukan/dog.png' },
          { id: 'cat', name: 'ねこ', emoji: '🐱', color: '#FF6584', imageSrc: '/zukan/cat.png' },
          { id: 'rabbit', name: 'うさぎ', emoji: '🐰', color: '#A855F7', imageSrc: '/zukan/rabbit.png' },
          { id: 'bear', name: 'くま', emoji: '🐻', color: '#FFD166', imageSrc: '/zukan/bear.png' },
          { id: 'panda', name: 'パンダ', emoji: '🐼', color: '#1A1E36', imageSrc: '/zukan/panda.png' },
          { id: 'chick', name: 'ひよこ', emoji: '🐥', color: '#FFC72C', imageSrc: '/zukan/chick.png' },
          { id: 'lion', name: 'らいおん', emoji: '🦁', color: '#FF85A2', imageSrc: '/zukan/lion.png' },
          { id: 'elephant', name: 'ぞう', emoji: '🐘', color: '#38BDF8', imageSrc: '/zukan/elephant.png' }
        ]
      },
      {
        id: 'vehicles',
        title: 'のりもの',
        icon: '🚗',
        bgColor: '#E0F2FE',
        cards: [
          { id: 'car', name: 'くるま', emoji: '🚗', color: '#FF4757', imageSrc: '/zukan/car.png' },
          { id: 'train', name: 'でんしゃ', emoji: '🚃', color: '#2ED573', imageSrc: '/zukan/train.png' },
          { id: 'shinkansen', name: 'しんかんせん', emoji: '🚅', color: '#38BDF8', imageSrc: '/zukan/shinkansen.png' },
          { id: 'bus', name: 'ばす', emoji: '🚌', color: '#FFD166', imageSrc: '/zukan/bus.png' },
          { id: 'airplane', name: 'ひこうき', emoji: '✈️', color: '#A855F7', imageSrc: '/zukan/airplane.png' },
          { id: 'ship', name: 'ふね', emoji: '🚢', color: '#118AB2', imageSrc: '/zukan/ship.png' },
          { id: 'fire_engine', name: 'しょうぼうしゃ', emoji: '🚒', color: '#FF477E', imageSrc: '/zukan/fire_engine.png' },
          { id: 'police_car', name: 'パトカー', emoji: '🚓', color: '#1A1E36', imageSrc: '/zukan/police_car.png' }
        ]
      },
      {
        id: 'foods',
        title: 'たべもの',
        icon: '🍎',
        bgColor: '#FFFBEB',
        cards: [
          { id: 'apple', name: 'りんご', emoji: '🍎', color: '#FF4757', imageSrc: '/zukan/apple.png' },
          { id: 'banana', name: 'ばなな', emoji: '🍌', color: '#FFD166', imageSrc: '/zukan/banana.png' },
          { id: 'strawberry', name: 'いちご', emoji: '🍓', color: '#FF6584', imageSrc: '/zukan/strawberry.png' },
          { id: 'onigiri', name: 'おにぎり', emoji: '🍙', color: '#1A1E36', imageSrc: '/zukan/onigiri.png' },
          { id: 'bread', name: 'ぱん', emoji: '🍞', color: '#FF9F1C', imageSrc: '/zukan/bread.png' },
          { id: 'cake', name: 'ケーキ', emoji: '🍰', color: '#FF85A2', imageSrc: '/zukan/cake.png' },
          { id: 'icecream', name: 'あいす', emoji: '🍦', color: '#38BDF8', imageSrc: '/zukan/icecream.png' },
          { id: 'juice', name: 'じゅーす', emoji: '🧃', color: '#2ED573', imageSrc: '/zukan/juice.png' }
        ]
      }
    ];

    // Cache image objects for user-provided images
    this.imageMap = {};
    this.preloadImages();
  }

  preloadImages() {
    this.categories.forEach(cat => {
      cat.cards.forEach(card => {
        if (card.imageSrc) {
          const img = new Image();
          img.src = card.imageSrc;
          this.imageMap[card.id] = img;
        }
      });
    });
  }

  init(width, height, soundSynth) {
    this.width = width;
    this.height = height;
    this.soundSynth = soundSynth;

    this.activeCard = null;
    this.zoomProgress = 0;
    this.effects = [];
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;
  }

  onTouch(x, y) {
    // If a card is currently zoomed in, tapping anywhere closes it
    if (this.activeCard) {
      if (this.soundSynth) this.soundSynth.playPop();
      this.closeZoom();
      return;
    }

    // Check Category Switcher Pill at Top Center
    const pill = { x: this.width / 2, y: 70, w: 220, h: 40 };
    if (Math.abs(x - pill.x) < pill.w / 2 && Math.abs(y - pill.y) < pill.h / 2) {
      this.switchCategory();
      return;
    }

    // Check Grid Card Click
    const gridCards = this.getGridPositions();
    for (let i = 0; i < gridCards.length; i++) {
      const c = gridCards[i];
      if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h) {
        this.zoomCard(c.card);
        break;
      }
    }
  }

  switchCategory() {
    this.currentCategoryIndex = (this.currentCategoryIndex + 1) % this.categories.length;
    if (this.soundSynth) this.soundSynth.playPop();
  }

  zoomCard(card) {
    this.activeCard = card;
    this.zoomProgress = 0;

    if (this.soundSynth) this.soundSynth.playPeekABoo();
    this.speakName(card.name);
    this.spawnSparkles(this.width / 2, this.height / 2, [card.emoji, '✨', '⭐', '💖', '🎉']);
  }

  closeZoom() {
    this.activeCard = null;
    this.zoomProgress = 0;
  }

  speakName(text) {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.lang = 'ja-JP';
        msg.rate = 1.0;
        msg.pitch = 1.3;
        window.speechSynthesis.speak(msg);
      } catch (e) {}
    }
  }

  spawnSparkles(x, y, symbols) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      this.effects.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        size: 24 + Math.random() * 16,
        alpha: 1
      });
    }
  }

  getGridPositions() {
    const category = this.categories[this.currentCategoryIndex];
    const cards = category.cards; // 8 items

    const topOffset = 110;
    const bottomOffset = 20;
    const sideMargin = 30;

    const availableW = this.width - sideMargin * 2;
    const availableH = this.height - topOffset - bottomOffset;

    // 4 columns x 2 rows (or 2 columns x 4 rows on narrow screen)
    const isPortrait = this.width < this.height;
    const cols = isPortrait ? 2 : 4;
    const rows = isPortrait ? 4 : 2;

    const gapX = 16;
    const gapY = 16;

    const cardW = (availableW - (cols - 1) * gapX) / cols;
    const cardH = (availableH - (rows - 1) * gapY) / rows;

    const grid = [];
    cards.forEach((card, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const x = sideMargin + col * (cardW + gapX);
      const y = topOffset + row * (cardH + gapY);

      grid.push({ card, x, y, w: cardW, h: cardH });
    });

    return grid;
  }

  update(width, height) {
    this.width = width;
    this.height = height;

    // Smooth spring zoom animation for active card
    if (this.activeCard && this.zoomProgress < 1) {
      this.zoomProgress += (1 - this.zoomProgress) * 0.22;
      if (this.zoomProgress > 0.99) this.zoomProgress = 1;
    }

    // Sparkle Particle Update
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.x += e.vx;
      e.y += e.vy;
      e.vy += 0.12;
      e.alpha -= 0.025;
      if (e.alpha <= 0) {
        this.effects.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    const category = this.categories[this.currentCategoryIndex];

    // Background Color
    ctx.fillStyle = category.bgColor;
    ctx.fillRect(0, 0, this.width, this.height);

    // Render Grid Cards (8 items on screen)
    const grid = this.getGridPositions();
    grid.forEach(item => {
      this.renderCard(ctx, item.card, item.x, item.y, item.w, item.h, false);
    });

    // Top Category Pill Badge
    this.renderTopPill(ctx, category);

    // Zoomed Pop-up Modal Overlay
    if (this.activeCard) {
      this.renderZoomedPopup(ctx, this.activeCard);
    }

    // Sparkle Burst Particles
    for (let i = 0; i < this.effects.length; i++) {
      const e = this.effects[i];
      ctx.globalAlpha = Math.max(0, e.alpha);
      ctx.font = `${e.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.symbol, e.x, e.y);
    }

    ctx.restore();
  }

  renderCard(ctx, card, x, y, w, h, isZoomed = false) {
    ctx.save();

    // Card Background Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Card Container Box
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 20);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = isZoomed ? 4 : 2.5;
    ctx.strokeStyle = card.color;
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Top Banner Color Bar on Card
    const headerH = Math.min(28, h * 0.22);
    ctx.beginPath();
    ctx.roundRect(x, y, w, headerH, [20, 20, 0, 0]);
    ctx.fillStyle = card.color;
    ctx.fill();

    // Check if user image is loaded, otherwise draw vector emoji
    const img = this.imageMap[card.id];
    const hasUserImage = img && img.complete && img.naturalWidth > 0;

    const iconY = y + headerH + (h - headerH) * 0.42;

    if (hasUserImage) {
      const imgSize = Math.min(w * 0.65, (h - headerH) * 0.6);
      ctx.drawImage(img, x + w / 2 - imgSize / 2, iconY - imgSize / 2, imgSize, imgSize);
    } else {
      // High-contrast Cute Emoji Icon
      const emojiSize = Math.min(w * 0.42, (h - headerH) * 0.48);
      ctx.font = `${emojiSize}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(card.emoji, x + w / 2, iconY);
    }

    // Card Name Text at Bottom
    const textY = y + h - Math.max(16, h * 0.16);
    ctx.font = `700 ${Math.max(14, Math.floor(h * 0.14))}px "Zen Maru Gothic", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(card.name, x + w / 2, textY);

    ctx.restore();
  }

  renderTopPill(ctx, category) {
    const pillW = 230;
    const pillH = 40;
    const pillX = this.width / 2 - pillW / 2;
    const pillY = 65;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#FF6584';
    ctx.stroke();

    ctx.font = '700 16px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#1E293B';
    ctx.fillText(`🖼️ ${category.title} (${this.currentCategoryIndex + 1}/${this.categories.length}) 🔄`, this.width / 2, pillY + pillH / 2);
    ctx.restore();
  }

  renderZoomedPopup(ctx, card) {
    // Backdrop Dim Overlay
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, this.width, this.height);

    // Zoomed Center Modal Box Size
    const maxModalW = Math.min(this.width * 0.8, 420);
    const maxModalH = Math.min(this.height * 0.7, 450);

    const scale = 0.4 + this.zoomProgress * 0.6;
    const modalW = maxModalW * scale;
    const modalH = maxModalH * scale;

    const modalX = this.width / 2 - modalW / 2;
    const modalY = this.height / 2 - modalH / 2;

    // Render Expanded Card
    this.renderCard(ctx, card, modalX, modalY, modalW, modalH, true);

    // Hint text at bottom of modal
    ctx.font = '700 16px "Zen Maru Gothic", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('💡 タップして とじる', this.width / 2, modalY + modalH + 30);

    ctx.restore();
  }

  destroy() {
    this.activeCard = null;
    this.effects = [];
  }
}
