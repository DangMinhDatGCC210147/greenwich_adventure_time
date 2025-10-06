class ConfigScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ConfigScene' });
    }

    preload() {
        this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    }

    create() {
        const { width, height } = this.scale;

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background2')
            .setOrigin(0.5)
            .setDepth(0);
        const scaleBG = Math.max(width / 2796, height / 1290);
        bg.setScale(scaleBG);
        bg.setDisplaySize(width, height + 100);

        // Overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.4)
            .setOrigin(0, 0)
            .setDepth(1);

        // Xóa form cũ nếu có
        const oldForm = document.getElementById('configContainer');
        if (oldForm) oldForm.remove();

        // Container
        const container = document.createElement('div');
        container.id = 'configContainer';
        container.className = 'game-form';
        document.body.appendChild(container);

        // Tiêu đề + nút quay lại
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

        // Dữ liệu cũ (nếu có)
        const savedSheetId = localStorage.getItem('sheetId') || '';
        const savedWebhook = localStorage.getItem('webhookUrl') || '';

        // Field: Google Sheet link (textarea)
        const sheetDiv = document.createElement('div');
        sheetDiv.className = 'mb-3';
        sheetDiv.innerHTML = `
      <label for="sheetLink" class="form-label fw-semibold">Google Sheet Link</label>
      <textarea id="sheetLink" rows="3" class="form-control" placeholder="Paste your Google Sheet link here">${savedSheetId ? `https://docs.google.com/spreadsheets/d/${savedSheetId}/edit` : ''}</textarea>
      <small id="sheetIdPreview" class="text-success fw-semibold"></small>
    `;
        container.appendChild(sheetDiv);

        // Field: Webhook URL
        const webhookDiv = document.createElement('div');
        webhookDiv.className = 'mb-3';
        webhookDiv.innerHTML = `
      <label for="webhookUrl" class="form-label fw-semibold">Webhook URL</label>
      <textarea id="webhookUrl" rows="2" class="form-control" placeholder="https://script.google.com/macros/s/.../exec">${savedWebhook}</textarea>
    `;
        container.appendChild(webhookDiv);

        // Buttons
        const saveBtn = document.createElement('button');
        saveBtn.className = 'btn btn-success w-100 start-btn mb-2';
        saveBtn.innerText = 'Save Configuration';
        container.appendChild(saveBtn);

        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-primary w-100 start-btn';
        continueBtn.innerText = 'Continue';
        container.appendChild(continueBtn);

        // --- Xử lý tự động lấy Sheet ID ---
        const sheetLinkInput = document.getElementById('sheetLink');
        const sheetIdPreview = document.getElementById('sheetIdPreview');

        function extractSheetId(link) {
            const match = link.match(/\/d\/([a-zA-Z0-9-_]+)/);
            return match ? match[1] : '';
        }

        // Khi người dùng rời khỏi ô nhập (blur) hoặc dán link
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

        // Event: Save config
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

        // Event: Continue
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
        const container = document.getElementById('configContainer');
        if (container) container.remove();
    }
}
