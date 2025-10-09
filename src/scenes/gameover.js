class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  preload() {
    this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
  }

  create(data) {
    const { width, height } = this.scale;
    const finalScore = data.score || 0;

    // 🟩 Responsive background
    this.bg = makeResponsiveBackground(this, 'background2');

    // 🖤 Dark overlay
    this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35)
      .setOrigin(0.5)
      .setDepth(1);

    // 🧩 DOM UI Container
    const container = document.createElement('div');
    container.id = 'gameOverUI';
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'center';
    container.style.width = 'clamp(280px, 70vw, 420px)';
    container.style.gap = '16px';
    container.style.zIndex = '20';
    container.style.textAlign = 'center';
    container.style.animation = 'fadeIn 0.6s ease';

    // === Title ===
    const title = document.createElement('h1');
    title.textContent = 'DO YOU WANT TO TRY AGAIN?';
    title.style.fontSize = 'clamp(2rem, 6vw, 3.5rem)';
    title.style.fontWeight = '900';
    title.style.color = '#ffffff';
    title.style.textShadow = '0 3px 10px rgba(0,0,0,0.5)';
    title.style.letterSpacing = '2px';

    // === Score ===
    const scoreText = document.createElement('p');
    scoreText.textContent = `Your Score: ${finalScore}`;
    scoreText.style.fontSize = 'clamp(1.2rem, 4vw, 2rem)';
    scoreText.style.color = '#ffffff';
    scoreText.style.fontWeight = '600';
    scoreText.style.textShadow = '0 2px 8px rgba(0,0,0,0.4)';
    scoreText.style.marginBottom = '12px';

    // === Restart button ===
    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn w-100 text-white fw-bold py-2';
    restartBtn.style.background = 'linear-gradient(45deg, #28a745, #85e085)';
    restartBtn.style.border = 'none';
    restartBtn.style.boxShadow = '0 4px 10px rgba(40,167,69,0.3)';
    restartBtn.style.fontSize = 'clamp(1rem, 2vw, 1.3rem)';
    restartBtn.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i> Restart';

    // === Back to Home button ===
    const homeBtn = document.createElement('button');
    homeBtn.className = 'btn w-100 text-white fw-bold py-2';
    homeBtn.style.background = 'linear-gradient(45deg, #007bff, #00c6ff)';
    homeBtn.style.border = 'none';
    homeBtn.style.boxShadow = '0 4px 10px rgba(0,123,255,0.3)';
    homeBtn.style.fontSize = 'clamp(1rem, 2vw, 1.3rem)';
    homeBtn.innerHTML = '<i class="bi bi-house-door-fill me-1"></i> Back to Home';

    // Add elements to container
    container.appendChild(title);
    container.appendChild(scoreText);
    container.appendChild(restartBtn);
    container.appendChild(homeBtn);
    document.body.appendChild(container);

    // === Button handlers ===
    restartBtn.onclick = () => {
      container.classList.add('fade-out');
      setTimeout(() => {
        container.remove();
        this.scene.start('LoadingScene');
      }, 400);
    };

    homeBtn.onclick = () => {
      container.classList.add('fade-out');
      setTimeout(() => {
        container.remove();
        this.scene.start('FormScene');
      }, 400);
    };

    // Clean up on shutdown
    this.events.once('shutdown', () => container.remove());

    // 🟢 Responsive resize SAFE
    const handleResize = (gameSize) => {
      if (!this.scene.isActive()) return; // Scene đã tắt → bỏ qua
      if (!this.bg || !this.overlay) return; // Đối tượng đã bị xoá → bỏ qua

      const { width, height } = gameSize;
      const scale = Math.max(width / this.bg.width, height / this.bg.height);
      this.bg.setScale(scale).setPosition(width / 2, height / 2);
      this.overlay.setSize(width, height).setPosition(width / 2, height / 2);
    };

    this.scale.on('resize', handleResize, this);

    // Khi scene bị tắt, gỡ sự kiện để tránh rò rỉ
    this.events.once('shutdown', () => {
      this.scale.off('resize', handleResize, this);
    });
  }
}

// === Background Helper ===
function makeResponsiveBackground(scene, key, depth = 0) {
  const { width, height } = scene.scale;
  const bg = scene.add.image(width / 2, height / 2, key)
    .setOrigin(0.5)
    .setDepth(depth);

  const resize = (gameSize) => {
    const w = gameSize ? gameSize.width : width;
    const h = gameSize ? gameSize.height : height;
    const scale = Math.max(w / bg.width, h / bg.height);
    bg.setScale(scale).setPosition(w / 2, h / 2);
  };

  resize({ width, height });
  scene.scale.on('resize', resize);
  scene.events.once('shutdown', () => scene.scale.off('resize', resize));

  return bg;
}
