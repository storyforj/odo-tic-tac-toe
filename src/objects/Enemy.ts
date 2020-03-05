import * as Phaser from 'phaser';
import { Bullet } from './Bullet';

export type EnemyOptions = {
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  polygonKey: string,
  pattern: number,
};

type EnemyPath = {
  t: number,
  vec: Phaser.Math.Vector2,
};

export class Enemy extends Phaser.Physics.Matter.Image {
  private lastShotTime: number = 0;
  private reloadTime: number = 5000;
  private bullets!: Phaser.GameObjects.Group;
  private hp: number = 120; // 2.5 seconds of direct fire
  // private collisionCategory: number;
  private path: EnemyPath;
  private curve!: Phaser.Curves.Curve;
  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }
  private activeTweens: Phaser.Tweens.Tween[] = [];

  constructor(params: EnemyOptions) {
    super(
      params.scene.matter.world,
      params.x, params.y,
      'sceneatlas', params.key,
      { shape: params.scene.cache.json.get('bodies')[params.polygonKey] } as Phaser.Types.Physics.Matter.MatterBodyConfig,
    );
    this.setOrigin(0.5, 0.4);
    this.setActive(true);

    this.path = { t: 0, vec: new Phaser.Math.Vector2() };

    this.bullets = this.scene.add.group({
      maxSize: 10,
      runChildUpdate: true
    });
    this.initAnimations(params.pattern);
    this.scene.matter.world.add(this);
    this.scene.add.existing(this);

    this.on('destroy', this.onDestroy);
  }

  initAnimations(pattern: number): void {
    this.activeTweens.push(this.scene.tweens.add({
      targets: this,
      y: this.y + 500,
      ease: 'Power0',
      delay: 3000,
      duration: 2000,
      repeat: 0,
      onComplete: () => {
        const settings: Phaser.Types.Tweens.TweenBuilderConfig = {
          targets: this.path,
          // @ts-ignore
          t: 1,
          ease: 'Linear',
          duration: 3000,
          repeat: -1,
        };
        if (pattern === 1) {
          this.curve = new Phaser.Curves.Ellipse(this.x, this.y, 20, 20, 360, 0);
        } else {
          this.curve = new Phaser.Curves.CubicBezier(
            new Phaser.Math.Vector2({ x: this.x, y: this.y }),
            new Phaser.Math.Vector2({ x: this.x + 100, y: this.y + 20 }),
            new Phaser.Math.Vector2({ x: this.x - 100, y: this.y + 80 }),
            new Phaser.Math.Vector2({ x: this.x, y: this.y + 100 }),
          );
          settings.yoyo = true;
        }
        this.activeTweens = [this.scene.tweens.add(settings)];
      },
    }));
  }

  createShipExplosion() {
    if (!this.active) { return; }
    const shipExplosion = this.scene.add.sprite(this.x, this.y, 'sceneatlas', 'bossShipExplosion/Explo__000.png');
    shipExplosion.setScale(0.65, 0.65);
    shipExplosion.setAlpha(1.0);
    shipExplosion.anims.play('shipExplosion');
    shipExplosion.on('animationcomplete', () => {
      shipExplosion.destroy();
    });
  }

  gotHurt(bullet: Bullet): void {
    bullet.createBulletExplosion();
    bullet.destroy();

    if (this.hp <= 0) {
      this.destroy();
    } else {
      this.hp -= 1;
    }
  }

  update(): void {
    if (this.curve) {
      this.curve.getPointAt(this.path.t, this.path.vec);
      this.setPosition(this.path.vec.x, this.path.vec.y);
    }
    if (this.active && Date.now() - this.lastShotTime > this.reloadTime) {
      this.bullets.add(
        new Bullet({
          scene: this.scene,
          x: this.x - 10,
          y: this.y - this.height + 20,
          key: 'enemy-bullet.png',
          polygonKey: 'enemyBullet',
          bulletProperties: {
            speed: 10,
          },
        })
      );
      this.lastShotTime = Date.now();
    }
  }

  onDestroy() {
    this.createShipExplosion();
    this.activeTweens.forEach((tween: Phaser.Tweens.Tween) => {
      tween.stop();
      this.scene.tweens.remove(tween);
    })
  }
}
