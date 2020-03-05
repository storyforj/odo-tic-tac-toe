import { Player } from '../objects/Player';
import createBoss, { BossUpdater } from '../objects/Boss';
import { Enemy } from '../objects/Enemy';

export class GameScene extends Phaser.Scene {
  private boss!: BossUpdater;
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private enemiesWillBeCreatedTimer!: NodeJS.Timeout | null;

  constructor() {
    super({
      key: 'GameScene',
      active: true,
    });
  }

  preload() {
    this.load.multiatlas('sceneatlas', 'assets/atlas.json', 'assets');
    this.load.css('styles/styles');
    this.load.json('bodies', 'assets/atlasBodies.json');
  }

  init(): void {
    this.enemies = this.add.group({ runChildUpdate: true });
  }

  create(): void {
    // this.matter.world.createDebugGraphic();
    // this.matter.world.drawDebug = true;
    // this.matter.world.debugGraphic.visible = true;

    // create game objects
    this.player = new Player({
      scene: this,
      x: this.sys.canvas.width / 2,
      y: this.sys.canvas.height - 60,
      key: 'player-ship.png',
    });
    this.boss = createBoss(this);
    this.enemiesWillBeCreatedTimer = setTimeout(() => this.createEnemies(), 0);

    function handleCollision(_event: Phaser.Physics.Matter.Events.CollisionStartEvent, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) {
      let bulletBody;
      let enemyBody;

      if (bodyA.parent.label === 'playerBullet' && ['enemy1', 'enemy2'].includes(bodyB.parent.label)) {
        bulletBody = bodyA;
        enemyBody = bodyB;
      }
      if (['enemy1', 'enemy2'].includes(bodyA.parent.label) && bodyB.parent.label === 'playerBullet') {
        bulletBody = bodyB;
        enemyBody = bodyA;
      }

      if (bulletBody && enemyBody) {
        (enemyBody.gameObject as Enemy).gotHurt(bulletBody.gameObject);
      }
    }

    this.matter.world.on('collisionstart', function (event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
      event.pairs.forEach((pair) => {
        handleCollision(event, pair.bodyA, pair.bodyB);
      });
    });

    const bulletExplosionFrameNames = this.anims.generateFrameNames('sceneatlas', {
      start: 0, end: 5, zeroPad: 4,
      prefix: 'playerBulletExplosion/explo_', suffix: '.png'
    });
    this.anims.create({
      key: 'bulletExplosion',
      frames: bulletExplosionFrameNames,
      frameRate: 30,
      repeat: 0,
      hideOnComplete: true,
    });

    const shipExplosion = this.anims.generateFrameNames('sceneatlas', {
      start: 0, end: 10, zeroPad: 3,
      prefix: 'bossShipExplosion/Explo__', suffix: '.png'
    });
    this.anims.create({
      key: 'shipExplosion',
      frames: shipExplosion,
      frameRate: 30,
      repeat: 0,
      hideOnComplete: true,
    });
  }

  createEnemies() {
    this.enemies.add(
      new Enemy({
        scene: this,
        x: 100,
        y: -200,
        key: 'enemy1.png',
        polygonKey: 'enemy1',
        pattern: 1,
      }),
    );
    this.enemies.add(
      new Enemy({
        scene: this,
        x: 200,
        y: -200,
        key: 'enemy1.png',
        pattern: 2,
        polygonKey: 'enemy1',
      }),
    );
    this.enemies.add(
      new Enemy({
        scene: this,
        x: 300,
        y: -200,
        key: 'enemy1.png',
        polygonKey: 'enemy1',
        pattern: 1,
      }),
    );
    this.enemiesWillBeCreatedTimer = null;
  }

  update(): void {
    if (this.player.active) {
      this.player.update();
      this.boss.update();
    }

    if (this.enemies && this.enemies.children.size === 0 && !this.enemiesWillBeCreatedTimer) {
      this.enemiesWillBeCreatedTimer = setTimeout(() => this.createEnemies(), 5000);
    }
  }
}
