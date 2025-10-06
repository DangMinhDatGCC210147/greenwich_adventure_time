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

        // Background
        const bg = this.add.image(width / 2, height / 2, 'background2').setOrigin(0.5, 0.5).setDepth(0);
        const scaleBG = Math.max(width / 2796, height / 1290);
        bg.setScale(scaleBG);
        bg.setDisplaySize(width, height + 100);

        // Overlay
        const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.3).setOrigin(0, 0).setDepth(1);

        // Game Over text
        this.add.text(width / 2, height / 2 - 150, 'Game Over', {
            fontSize: 64,
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2);

        // Display final score
        this.add.text(width / 2, height / 2 - 50, `Score: ${Math.floor(finalScore)}`, {
            fontSize: 48,
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(2);

        // Restart button
        const buttonWidth = 350;
        const buttonHeight = 90;
        const buttonX = width / 2 - 200;
        const buttonY = height / 2 + 400;
        const cornerRadius = buttonWidth * 0.1;

        const restartButton = this.add.graphics();
        restartButton.fillStyle(0x000080, 1);
        restartButton.fillRoundedRect(
            buttonX - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        restartButton.setInteractive(
            new Phaser.Geom.Rectangle(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight
            ),
            Phaser.Geom.Rectangle.Contains
        ).setDepth(2);

        this.add.text(buttonX, buttonY, 'Restart', {
            fontSize: 48,
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(3);

        // Back to Home button
        const backButtonX = width / 2 + 200;
        const backButton = this.add.graphics();
        backButton.fillStyle(0x000080, 1);
        backButton.fillRoundedRect(
            backButtonX - buttonWidth / 2,
            buttonY - buttonHeight / 2,
            buttonWidth,
            buttonHeight,
            cornerRadius
        );
        backButton.setInteractive(
            new Phaser.Geom.Rectangle(
                backButtonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight
            ),
            Phaser.Geom.Rectangle.Contains
        ).setDepth(2);

        this.add.text(backButtonX, buttonY, 'Back to Home', {
            fontSize: 48,
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(3);

        // Button events
        restartButton.on('pointerdown', () => {
            this.scene.stop('GameOverScene');
            this.scene.stop('GameScene');
            this.scene.start('LoadingScene');
        });

        backButton.on('pointerdown', () => {
            this.scene.stop('GameOverScene');
            this.scene.stop('GameScene');
            this.scene.start('FormScene');
        });

        // Hover effects for Restart button
        restartButton.on('pointerover', () => {
            restartButton.clear();
            restartButton.fillStyle(0x0000b0, 1);
            restartButton.fillRoundedRect(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });
        restartButton.on('pointerout', () => {
            restartButton.clear();
            restartButton.fillStyle(0x000080, 1);
            restartButton.fillRoundedRect(
                buttonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });

        // Hover effects for Back to Home button
        backButton.on('pointerover', () => {
            backButton.clear();
            backButton.fillStyle(0x0000b0, 1);
            backButton.fillRoundedRect(
                backButtonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });
        backButton.on('pointerout', () => {
            backButton.clear();
            backButton.fillStyle(0x000080, 1);
            backButton.fillRoundedRect(
                backButtonX - buttonWidth / 2,
                buttonY - buttonHeight / 2,
                buttonWidth,
                buttonHeight,
                cornerRadius
            );
        });
    }
}