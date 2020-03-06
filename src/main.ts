import 'phaser';

import { GameScene } from './scenes/GameScene';
import { IntroScene } from './scenes/IntroScene';
import { BootScene } from './scenes/BootScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  scene: [BootScene, GameScene, IntroScene],
  input: {
    touch: true,
    mouse: true,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  backgroundColor: '#000',
  scale: {
    parent: 'game',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 420,
    height: 700,
  },
  render: { pixelArt: true, antialias: true },
};

export class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.addEventListener('load', () => {
  new Game(config);
});
