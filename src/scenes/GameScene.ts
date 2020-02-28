import { Player } from '../objects/Player';
import createBoss, { BossUpdater } from '../objects/Boss';

export class GameScene extends Phaser.Scene {
  private boss!: BossUpdater;
  private player!: Player;

  constructor() {
    super({
      key: 'GameScene',
      active: true,
    });
  }

  preload() {
    this.load.pack('preload', 'assets/pack.json', 'preload');
    this.load.css('styles/styles');
    this.load.json('polygons', 'assets/polygons.json');
  }

  create(): void {
    this.matter.world.createDebugGraphic();
    this.matter.world.drawDebug = true;
    this.matter.world.debugGraphic.visible = true;

    const enemyCategory = this.matter.world.nextCategory();
    const playerCategory = this.matter.world.nextCategory();

    // create game objects
    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height - 60,
      key: 'player',
      collisionCategory: playerCategory,
    });
    this.boss = createBoss(this, enemyCategory);
  }

  update(): void {
    if (this.player.active) {
      this.player.update();
      this.boss.update();
    }
  }
}
