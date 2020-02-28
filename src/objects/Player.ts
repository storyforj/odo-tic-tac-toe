import { Bullet } from './Bullet';

export class Player extends Phaser.Physics.Matter.Image {
  public label: string = 'player';

  private bullets!: Phaser.GameObjects.Group;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private flyingSpeed!: number;
  private lastShoot!: number;
  private shootingKey!: Phaser.Input.Keyboard.Key;
  private collsionCategory: number;
  public getBullets(): Phaser.GameObjects.Group {
    return this.bullets;
  }

  constructor(params) {
    super(params.scene.matter.world, params.x, params.y, params.key);

    this.collsionCategory = params.collsionCategory;

    this.initVariables();
    this.initImage();

    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.shootingKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.initPhysics();

    this.scene.add.existing(this);
  }

  private initVariables(): void {
    this.bullets = this.scene.add.group({
      runChildUpdate: true
    });
    this.lastShoot = 0;
    this.flyingSpeed = 5;
  }

  private initImage(): void {
    this.setOrigin(0.5, 0.5);
  }

  private initPhysics(): void {
    // @ts-ignore
    this.setSize(80, 73);
    this.setScale(0.8, 0.8);
    this.scene.matter.world.add(this);
  }

  update(): void {
    this.handleFlying();
    this.handleShooting();
  }

  private handleFlying(): void {
    if (
      (this.cursors?.right?.isDown ?? false) &&
      this.x < this.scene.sys.canvas.width
    ) {
      // @ts-ignore
      this.setVelocityX(this.flyingSpeed);
    } else if ((this.cursors?.left?.isDown ?? false) && this.x > 0) {
      // @ts-ignore
      this.setVelocityX(-this.flyingSpeed);
    } else {
      // @ts-ignore
      this.setVelocityX(0);
    }
  }

  private handleShooting(): void {
    // 16ms * 3 = 48, 48ms is our magic number. We want this because at 60 fps (16ms per frame) we'd get 120 shots, divide by 3 and we got 40 shots per second.
    // shooting too fast means missing collisions between frames
    if (this.shootingKey.isDown && this.scene.time.now - this.lastShoot >= 48) {
      if (this.bullets.getLength() < 80) {
        this.bullets.add(
          new Bullet({
            scene: this.scene,
            x: this.x - 13,
            y: this.y - this.height + 20,
            key: 'player-bullet',
            bulletProperties: {
              speed: -10,
            },
            collisionCategory: this.collsionCategory,
          })
        );
        this.bullets.add(
          new Bullet({
            scene: this.scene,
            x: this.x + 12,
            y: this.y - this.height + 20,
            key: 'player-bullet',
            bulletProperties: {
              speed: -10,
            },
            collisionCategory: this.collsionCategory,
          })
        );

        this.lastShoot = this.scene.time.now;
      }
    }
  }

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
