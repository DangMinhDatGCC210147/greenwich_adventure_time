class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload() {
        this.load.image('background2', 'assets/groundandbackground/imagebg1.png');
    }

    create() {
        const { width, height } = this.scale;

        const bg = this.add.image(width / 2, height / 2, 'background2').setOrigin(0.5, 0.5).setDepth(0);
        const scaleBG = Math.max(width / 2796, height / 1290);
        bg.setScale(scaleBG);
        bg.setDisplaySize(width, height + 100);

        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3).setOrigin(0, 0).setDepth(1);

        const buttonWidth = 350;
        const buttonHeight = 90;
        const buttonX = width / 2;
        const buttonY = height / 2 + 400;
        const cornerRadius = buttonWidth * 0.1;

        const buttonGraphics = this.add.graphics();
        buttonGraphics.fillStyle(0x000080, 1);
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

        this.add.text(buttonX, buttonY, 'Start Game', {
            fontSize: 48,
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(3);

        buttonGraphics.on('pointerdown', () => {
            this.scene.stop('LoadingScene');
            this.scene.stop('GameOverScene'); // Ensure GameOverScene is stopped
            this.scene.stop('FormScene'); // Ensure FormScene is stopped
            this.scene.start('GameScene');
        });

        buttonGraphics.on('pointerover', () => {
            buttonGraphics.clear();
            buttonGraphics.fillStyle(0x0000b0, 1);
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
            buttonGraphics.fillStyle(0x000080, 1);
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