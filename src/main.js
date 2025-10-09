const config = {
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 900 }, debug: false }
  },
  scene: [FormScene, ConfigScene, LoadingScene, GameScene, GameOverScene]
};

window.game = new Phaser.Game(config);

// 🔹 Start the first scene automatically
window.addEventListener('load', () => {
  const sceneKey = window.targetScene || "FormScene";
  game.scene.start(sceneKey);
});