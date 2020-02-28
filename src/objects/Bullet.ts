export type BulletOptions = {
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  bulletProperties: {
    speed: number
  },
  collisionCategory: number
};

export class Bullet extends Phaser.Physics.Matter.Image {
  public label: string = 'bullet';
  private bulletSpeed!: number;
  private collisionCategory: number;

  constructor(params: BulletOptions) {
    super(params.scene.matter.world, params.x, params.y, params.key, undefined, { isSensor: true });
    this.collisionCategory = params.collisionCategory;

    this.on('collisionstart', () => {
      this.destroy();
    });

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
    this.setCollisionGroup(this.collisionCategory);
    this.scene.matter.world.add(this);
    // @ts-ignore
    this.setVelocityY(this.bulletSpeed);
    // @ts-ignore
    this.setSize(1, 8);
  }

  update(): void {
    if (this.y < 0 || this.y > this.scene.sys.canvas.height) {
      this.destroy();
    }
  }
}
