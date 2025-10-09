class FormScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FormScene' });
    }

    preload() {
        this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    }

    create() {
        
        const { width, height } = this.scale;

        // --- Background (auto resize) ---
        this.bg = this.add.image(width / 2, height / 2, 'background2')
            .setOrigin(0.5)
            .setDepth(0);
        this.resizeBackground(width, height);
        this.scale.on('resize', this.handleResize, this);

        // --- Form UI ---
        const form = document.createElement('div');
        form.id = 'formContainer';
        form.className = 'game-form shadow-lg';
        form.innerHTML = `
      <div class="text-center mb-3">
        <div class="rounded-circle bg-primary bg-gradient d-inline-flex align-items-center justify-content-center"
             style="width:70px; height:70px;">
          <i class="bi bi-person-fill text-white" style="font-size:2rem;"></i>
        </div>
      </div>
      <h4 class="text-center text-dark fw-bold mb-4">Your Information</h4>

      <div class="form-floating mb-3">
        <input id="name" class="form-control" placeholder="Name" />
        <label for="name"><i class="bi bi-person me-2"></i>Name</label>
      </div>
      <div class="form-floating mb-3">
        <input id="phone" class="form-control" placeholder="Phone" />
        <label for="phone"><i class="bi bi-telephone me-2"></i>Phone</label>
      </div>
      <div class="form-floating mb-3">
        <input id="class" class="form-control" placeholder="Class" />
        <label for="class"><i class="bi bi-book me-2"></i>Class</label>
      </div>
      <div class="form-floating mb-4">
        <input id="school" class="form-control" placeholder="School" />
        <label for="school"><i class="bi bi-building me-2"></i>School</label>
      </div>

      <button id="goBtn" class="btn w-100 mb-2 text-white fw-bold"
              style="background: linear-gradient(45deg, #007bff, #00c6ff); border: none; box-shadow: 0 4px 10px rgba(0,123,255,0.3);">
        <i class="bi bi-play-fill me-1"></i> Start Game
      </button>
      <button id="configBtn" class="btn btn-outline-secondary w-100">
        <i class="bi bi-gear-fill me-1"></i> Configuration
      </button>
    `;
        document.body.appendChild(form);

        // --- Enter key support ---
        document.querySelectorAll('#formContainer input').forEach(input => {
            input.addEventListener('keypress', e => {
                if (e.key === 'Enter') document.getElementById('goBtn').click();
            });
        });

        // --- Buttons ---
        document.getElementById('goBtn').onclick = () => {
            form.classList.add('fade-out');
            setTimeout(() => {
                form.remove();
                this.scene.start('LoadingScene');
            }, 400);
        };

        document.getElementById('configBtn').onclick = () => {
            form.classList.add('fade-out');
            setTimeout(() => {
                form.remove();
                this.scene.start('ConfigScene');
            }, 400);
        };

        this.events.once('shutdown', () => {
            form.remove();
            this.scale.off('resize', this.handleResize, this);
        });
    }

    // === Responsive Background ===
    resizeBackground(width, height) {
        if (!this.bg) return;
        const scale = Math.max(width / this.bg.width, height / this.bg.height);
        this.bg.setScale(scale).setPosition(width / 2, height / 2);
    }

    handleResize(gameSize) {
        const { width, height } = gameSize;
        this.resizeBackground(width, height);
    }
}

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