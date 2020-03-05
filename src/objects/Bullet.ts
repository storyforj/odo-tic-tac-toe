export type BulletOptions = {
  scene: Phaser.Scene,
  x: number,
  y: number,
  key: string,
  polygonKey: string,
  bulletProperties: {
    speed: number
  },
};

export class Bullet extends Phaser.Physics.Matter.Image {
  private bulletSpeed!: number;

  constructor(params: BulletOptions) {
    super(params.scene.matter.world, params.x, params.y, 'sceneatlas', params.key, { isSensor: true, shape: params.scene.cache.json.get('bodies')[params.polygonKey] } as Phaser.Types.Physics.Matter.MatterBodyConfig);

    this.scene = params.scene;
    this.bulletSpeed = params.bulletProperties.speed;

    this.setOrigin(0.5, 0.5);

    this.setVelocityY(this.bulletSpeed);
    this.setSize(1, 8);

    this.scene.matter.world.add(this);
    this.scene.add.existing(this);
  }

  update(): void {
    if (this.y < 0 || this.y > this.scene.sys.canvas.height) {
      this.destroy();
    }
  }

  createBulletExplosion() {
    if (!this.active) { return; }
    const bulletExplosion = this.scene.add.sprite(this.x, this.y, 'sceneatlas', 'playerBulletExplosion/explo_0000.png');
    bulletExplosion.setScale(0.65, 0.65);
    bulletExplosion.setAlpha(0.2);
    bulletExplosion.anims.play('bulletExplosion');
    bulletExplosion.on('animationcomplete', () => {
      bulletExplosion.destroy();
    });
  }
}
