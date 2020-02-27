export type BulletOptions = {
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  bulletProperties: {
    speed: number
  },
};

export class Bullet extends Phaser.GameObjects.Image {
  private bulletSpeed!: number;

  constructor(params: BulletOptions) {
    super(params.scene, params.x, params.y, params.key);

    this.initVariables(params);
    this.initImage();
    this.initPhysics();

    this.scene.add.existing(this);
  }

  private initVariables(params: BulletOptions): void {
    this.bulletSpeed = params.bulletProperties.speed;
  }

  private initImage(): void {
    this.setOrigin(0.5, 0.5);
  }

  private initPhysics(): void {
    this.scene.physics.world.enable(this);
    // @ts-ignore
    this.body.setVelocityY(this.bulletSpeed);
    // @ts-ignore
    this.body.setSize(1, 8);
  }

  update(): void {
    if (this.y < 0 || this.y > this.scene.sys.canvas.height) {
      this.destroy();
    }
  }
}
