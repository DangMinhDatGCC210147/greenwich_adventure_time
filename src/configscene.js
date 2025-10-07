class ConfigScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConfigScene' });
    }

    preload() {
        this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    }

    create() {
        const { width, height } = this.scale;

        // ===== background (lưu trên this) =====
        this.bg = this.add.image(0, 0, 'background2')
            .setOrigin(0.5)
            .setDepth(0)
            .setScrollFactor(0);

        // bindable resize function for bg (so we can .off later)
        this._resizeBg = () => {
            if (!this.bg || this.bg.destroyed) return;
            const scaleX = this.scale.width / this.bg.width;
            const scaleY = this.scale.height / this.bg.height;
            const scale = Math.max(scaleX, scaleY); // "cover"
            this.bg.setScale(scale);
            this.bg.setPosition(this.scale.width / 2, this.scale.height / 2);
        };

        // initial resize + register
        this._resizeBg();
        this.scale.on('resize', this._resizeBg);

        // ===== overlay (lưu trên this) =====
        this.overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.4)
            .setOrigin(0)
            .setDepth(1)
            .setScrollFactor(0);

        // unified resize handler that is safe (checks existence)
        this._onResize = (gameSize) => {
            const w = gameSize?.width || this.scale.width;
            const h = gameSize?.height || this.scale.height;

            if (this.overlay && !this.overlay.destroyed) {
                // setSize exists on Rectangle game object
                this.overlay.setSize(w, h);
            }

            // also keep background updated
            if (this.bg && !this.bg.destroyed) {
                this._resizeBg();
            }
        };

        // register
        this.scale.on('resize', this._onResize);

        // clean up when scene shutdown/destroy
        this.events.once('shutdown', this.shutdown, this);
        this.events.once('destroy', this.shutdown, this);

        // --- Tạo form ---
        this.createConfigForm();
    }

    _resizeBackground(w, h) {
        if (!this.bg || this.bg.destroyed) return;

        const scaleX = w / this.bg.width;
        const scaleY = h / this.bg.height;
        const scale = Math.max(scaleX, scaleY);
        this.bg.setScale(scale);
        this.bg.setPosition((w - this.bg.displayWidth) / 2, (h - this.bg.displayHeight) / 2);
    }

    _handleResize(gameSize) {
        if (!this.scene.isActive() || this.scene.settings.status >= 3) return;

        const w = gameSize?.width || this.scale.width;
        const h = gameSize?.height || this.scale.height;

        if (this.bg && !this.bg.destroyed) this._resizeBackground(w, h);
        if (this.overlay && !this.overlay.destroyed) this.overlay.setSize(w, h);
    }

    createConfigForm() {
        const oldForm = document.getElementById('configContainer');
        if (oldForm) oldForm.remove();

        const container = document.createElement('div');
        container.id = 'configContainer';
        container.className = 'game-form';
        document.body.appendChild(container);

        const header = document.createElement('div');
        header.className = 'form-header d-flex justify-content-center align-items-center position-relative w-100 mb-3';
        container.appendChild(header);

        const title = document.createElement('h4');
        title.className = 'form-title text-center flex-grow-1';
        title.innerText = 'Webhook Configuration';
        header.appendChild(title);

        const backBtn = document.createElement('button');
        backBtn.innerHTML = '<i class="bi bi-arrow-left-circle-fill"></i>';
        backBtn.className = 'btn btn-sm btn-outline-secondary config-icon-btn';
        header.appendChild(backBtn);

        backBtn.addEventListener('click', () => {
            container.classList.add('fade-out');
            setTimeout(() => {
                container.remove();
                this.scene.start('FormScene');
            }, 400);
        });

        const savedSheetId = localStorage.getItem('sheetId') || '';
        const savedWebhook = localStorage.getItem('webhookUrl') || '';

        const sheetDiv = document.createElement('div');
        sheetDiv.className = 'mb-3';
        sheetDiv.innerHTML = `
      <label for="sheetLink" class="form-label fw-semibold">Google Sheet Link</label>
      <textarea id="sheetLink" rows="3" class="form-control" placeholder="Paste your Google Sheet link here">${savedSheetId ? `https://docs.google.com/spreadsheets/d/${savedSheetId}/edit` : ''}</textarea>
      <small id="sheetIdPreview" class="text-success fw-semibold"></small>
    `;
        container.appendChild(sheetDiv);

        const webhookDiv = document.createElement('div');
        webhookDiv.className = 'mb-3';
        webhookDiv.innerHTML = `
      <label for="webhookUrl" class="form-label fw-semibold">Webhook URL</label>
      <textarea id="webhookUrl" rows="2" class="form-control" placeholder="https://script.google.com/macros/s/.../exec">${savedWebhook}</textarea>
    `;
        container.appendChild(webhookDiv);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-success w-100 start-btn mb-2';
        saveBtn.innerText = 'Save Configuration';
        container.appendChild(saveBtn);

        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary w-100 start-btn';
        continueBtn.innerText = 'Continue';
        container.appendChild(continueBtn);

        const sheetLinkInput = document.getElementById('sheetLink');
        const sheetIdPreview = document.getElementById('sheetIdPreview');

        const extractSheetId = (link) => {
            const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
            return match ? match[1] : '';
        };

        sheetLinkInput.addEventListener('input', () => {
            const id = extractSheetId(sheetLinkInput.value);
            if (id) {
                sheetIdPreview.textContent = `Sheet ID: ${id}`;
                sheetIdPreview.style.color = 'green';
            } else {
                sheetIdPreview.textContent = 'Invalid Google Sheet link';
                sheetIdPreview.style.color = 'red';
            }
        });

        saveBtn.addEventListener('click', () => {
            const sheetLink = sheetLinkInput.value.trim();
            const webhookUrl = document.getElementById('webhookUrl').value.trim();
            const sheetId = extractSheetId(sheetLink);

            if (!sheetId || !webhookUrl) {
                alert('Please enter a valid Google Sheet link and Webhook URL!');
                return;
            }

            localStorage.setItem('sheetId', sheetId);
            localStorage.setItem('webhookUrl', webhookUrl);
            alert('Configuration saved successfully!');
        });

        continueBtn.addEventListener('click', () => {
            const sheetId = localStorage.getItem('sheetId');
            const webhookUrl = localStorage.getItem('webhookUrl');
            if (!sheetId || !webhookUrl) {
                alert('Please save configuration before continuing!');
                return;
            }

            container.classList.add('fade-out');
            setTimeout(() => {
                container.remove();
                this.scene.start('FormScene');
            }, 400);
        });
    }

    shutdown() {
        // Xóa DOM
        const container = document.getElementById('configContainer');
        if (container) container.remove();

        // Gỡ listener resize
        if (this._onResize) {
            this.scale.off('resize', this._onResize);
            this._onResize = null;
        }

        // Hủy background và overlay nếu còn
        if (this.overlay && !this.overlay.destroyed) {
            this.overlay.destroy();
            this.overlay = null;
        }
        if (this.bg && !this.bg.destroyed) {
            this.bg.destroy();
            this.bg = null;
        }
    }
}