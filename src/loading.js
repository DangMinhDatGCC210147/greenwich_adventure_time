class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        // Tải hình ảnh nền cho màn hình loading
        this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    }

    create() {
        const { width, height } = this.scale;

        // Hình ảnh nền không lặp lại
        const bg = this.add.image(width / 2, height / 2, 'background2').setOrigin(0.5, 0.5).setDepth(0);
        // Scale hình ảnh để vừa với màn hình
        const scaleBG = Math.max(width / 2796, height / 1290);
        bg.setScale(scaleBG);
        bg.setDisplaySize(width, height + 100);

        // Lớp phủ màu đen với độ mờ 30%
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3).setOrigin(0, 0).setDepth(1);

        // Nút bắt đầu với nền xanh navy, chữ trắng
        const button = this.add.rectangle(width / 2, height / 2 + 400, 350, 90, 0x000080)
            .setInteractive({ useHandCursor: true }).setDepth(2);

        // Văn bản trên nút
        this.add.text(width / 2, height / 2 + 400, 'Start Game', {
            fontSize: 48,
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        // Bo góc (gần đúng 10% border radius)
        button.setDisplaySize(350, 90);
        button.setOrigin(0.5);
        button.setAlpha(1);

        // Sự kiện nhấn nút
        button.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
    }
}