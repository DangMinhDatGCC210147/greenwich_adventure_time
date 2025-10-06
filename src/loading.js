class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    }

    create() {
        const { width, height } = this.scale;

        // Hình ảnh nền không lặp lại
        const bg = this.add.image(width / 2, height / 2, 'background2').setOrigin(0.5, 0.5).setDepth(0);
        const scaleBG = Math.max(width / 2796, height / 1290);
        bg.setScale(scaleBG);
        bg.setDisplaySize(width, height + 100);

        // Lớp phủ màu đen với độ mờ 30%
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3).setOrigin(0, 0).setDepth(1);

        // Tạo nút với Graphics để có bo góc
        const buttonWidth = 350;
        const buttonHeight = 90;
        const buttonX = width / 2;
        const buttonY = height / 2 + 400;
        const cornerRadius = buttonWidth * 0.05;

        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0x000080, 1); // Màu xanh navy
        buttonGraphics.fillRoundedRect(
            buttonX - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        buttonGraphics.setInteractive(
            new Phaser.Geom.Rectangle(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight
            ),
            Phaser.Geom.Rectangle.Contains
        ).setDepth(2);

        // Văn bản trên nút
        this.add.text(buttonX, buttonY, 'Start Game', {
            fontSize: 48,
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(3);

        // Sự kiện nhấn nút
        buttonGraphics.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Hiệu ứng con trỏ (tùy chọn)
        buttonGraphics.on('pointerover', () => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(0x0000b0, 1); // Màu xanh navy sáng hơn khi hover
            buttonGraphics.fillRoundedRect(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });
        buttonGraphics.on('pointerout', () => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(0x000080, 1); // Trở lại màu gốc
            buttonGraphics.fillRoundedRect(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });
    }
}