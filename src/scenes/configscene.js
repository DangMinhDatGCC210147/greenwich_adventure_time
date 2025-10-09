class ConfigScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConfigScene' });
    }

    preload() {
        this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    }

    create() {
        // 🟩 Background tự canh giữa, auto scale
        makeResponsiveBackground(this, 'background2');

        const form = document.createElement('div');
        form.id = 'configContainer';
        form.className = 'game-form';
        form.innerHTML = `
      <h4 class="text-center text-primary fw-bold mb-3">Configuration Setup</h4>
      <textarea id="sheetLink" class="form-control mb-2" placeholder="Google Sheet Link"></textarea>
      <textarea id="webhookUrl" class="form-control mb-3" placeholder="Webhook URL"></textarea>
      <button id="saveBtn" class="btn btn-success w-100 mb-2">Save</button>
      <button id="backBtn" class="btn btn-outline-secondary w-100">Back</button>
    `;
        document.body.appendChild(form);

        document.getElementById('saveBtn').onclick = () => {
            const sheet = document.getElementById('sheetLink').value.trim();
            const webhook = document.getElementById('webhookUrl').value.trim();
            if (!sheet || !webhook) return alert('Please fill in both fields!');
            localStorage.setItem('sheetId', sheet);
            localStorage.setItem('webhookUrl', webhook);
            alert('Configuration saved!');
        };

        document.getElementById('backBtn').onclick = () => {
            form.classList.add('fade-out');
            setTimeout(() => {
                form.remove();
                this.scene.start('FormScene');
            }, 400);
        };

        this.events.once('shutdown', () => form.remove());
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