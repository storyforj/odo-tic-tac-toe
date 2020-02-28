export type BulletOptions = {
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  polygonKey: string,
  bulletProperties: {
    speed: number
  },
  collisionCategory: number
};

export class Bullet extends Phaser.Physics.Matter.Image {
  private bulletSpeed!: number;
  private collisionCategory: number;

  constructor(params: BulletOptions) {
    super(params.scene.matter.world, params.x, params.y, 'sceneatlas', params.key, { isSensor: true, shape: params.scene.cache.json.get('bodies')[params.polygonKey] } as Phaser.Types.Physics.Matter.MatterBodyConfig);
    this.collisionCategory = params.collisionCategory;

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
