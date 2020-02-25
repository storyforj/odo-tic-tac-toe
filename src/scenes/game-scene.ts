import { Enemy } from '../objects/enemy';
import { Player } from '../objects/player';

export class GameScene extends Phaser.Scene {
  private enemies!: Phaser.GameObjects.Group;
  private player!: Player;

  constructor() {
    super({
      key: 'GameScene'
    });
  }

  preload() {
    this.load.pack('preload', 'assets/pack.json', 'preload');
    this.load.css('styles/styles');
  }

  init(): void {
    this.enemies = this.add.group({ runChildUpdate: true });
  }

  create(): void {
    // create game objects
    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height - 40,
      key: 'player'
    });

    // if you want to make it random:
    // let enemyTypes = ['octopus', 'crab', 'squid'];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 10; x++) {
        let type;
        if (y === 0) {
          type = 'squid';
        } else if (y === 1 || y === 2) {
          type = 'crab';
        } else {
          type = 'octopus';
        }
        // if you want to make it random:
        // let type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        this.enemies.add(
          new Enemy({
            scene: this,
            x: 20 + x * 15,
            y: 50 + y * 15,
            key: type
          })
        );
      }
    }
  }

  update(): void {
    if (this.player.active) {
      this.player.update();

      // @ts-ignore
      this.enemies.children.each((enemy: Enemy): void => {
        enemy.update();
        if (enemy.getBullets().getLength() > 0) {
          this.physics.overlap(
            enemy.getBullets(),
            this.player,
            this.bulletHitPlayer,
            undefined,
            this
          );
        }
      }, this);

      this.checkCollisions();
    }
  }

  private checkCollisions(): void {
    this.physics.overlap(
      this.player.getBullets(),
      this.enemies,
      this.bulletHitEnemy,
      undefined,
      this
    );
  }

  private bulletHitEnemy(bullet, enemy): void {
    bullet.destroy();
    enemy.gotHurt();
  }

  private bulletHitPlayer(bullet, player): void {
    bullet.destroy();
    player.gotHurt();
  }
}