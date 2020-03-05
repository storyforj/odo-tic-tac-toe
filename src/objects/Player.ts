import * as throttle from 'lodash.throttle';

import { Bullet } from './Bullet';

// 16ms * 3 = 48, 48ms is our magic number. We want this because at 60 fps (16ms per frame) we'd get 120 shots, divide by 3 and we got 40 shots per second.
const shotRate = 48;

export class Player extends Phaser.Physics.Matter.Image {
  private bullets!: Phaser.GameObjects.Group;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private flyingSpeed!: number;
  private shootingKey!: Phaser.Input.Keyboard.Key;
  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  constructor(params) {
    super(params.scene.matter.world, params.x, params.y, 'sceneatlas', params.key, { shape: params.scene.cache.json.get('bodies').player } as Phaser.Types.Physics.Matter.MatterBodyConfig);

    this.initVariables();
    this.initImage();

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.shootingKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.scene.input.on('pointermove', this.handleDragFlying, this);

    this.scene.matter.world.add(this);
    this.scene.add.existing(this);
  }

  private initVariables(): void {
    this.bullets = this.scene.add.group({
      runChildUpdate: true
    });
    this.flyingSpeed = 5;
  }

  private initImage(): void {
    this.setOrigin(0.5, 0.5);
  }

  update(): void {
    this.handleFlying();
    if (this.shootingKey.isDown || this.scene.input.activePointer.isDown) {
      this.handleShooting();
    }
  }

  private handleFlying(): void {
    if (
      (this.cursors?.right?.isDown ?? false) &&
      this.x < this.scene.sys.canvas.width
    ) {
      this.setVelocityX(this.flyingSpeed);
    } else if ((this.cursors?.left?.isDown ?? false) && this.x > 0) {
      this.setVelocityX(-this.flyingSpeed);
    } else {
      this.setVelocityX(0);
    }
  }

  private handleDragFlying(pointer: { x: number }): void {
    if (!this.scene.input.activePointer.isDown) { return; }
    this.setX(pointer.x);
  }

  private handleShooting = throttle((): void => {
    if (this.bullets.getLength() < 80) { // just a safeguard, this should never happen
      this.bullets.add(
        new Bullet({
          scene: this.scene,
          x: this.x - 10,
          y: this.y - this.height + 20,
          key: 'player-bullet.png',
          polygonKey: 'playerBullet',
          bulletProperties: {
            speed: -10,
          },
        })
      );
      this.bullets.add(
        new Bullet({
          scene: this.scene,
          x: this.x + 10,
          y: this.y - this.height + 20,
          key: 'player-bullet.png',
          polygonKey: 'playerBullet',
          bulletProperties: {
            speed: -10,
          },
        })
      );
    }
  }, shotRate);

  public gotHurt() {
    // update lives
    let currentLives = this.scene.registry.get('lives');
    this.scene.registry.set('lives', currentLives - 1);
    this.scene.events.emit('livesChanged');

    // reset position
    this.x = this.scene.sys.canvas.width / 2;
    this.y = this.scene.sys.canvas.height - 40;
  }
}
