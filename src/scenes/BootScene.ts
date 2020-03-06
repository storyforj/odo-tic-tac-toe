import * as ODO from '@odogames/js-sdk';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'BootScene',
      active: true,
    });
  }

  preload() {
    this.load.multiatlas('sceneatlas', 'assets/atlas.json', 'assets');
    this.load.css('styles/styles');
    this.load.json('bodies', 'assets/atlasBodies.json');
  }

  create(): void {
    const odo = ODO.init({ useLocalStorageInDev: true });
    this.registry.set('odo', odo);
    odo.events.on(ODO.Events.start, () => {
      this.scene.start('GameScene');
      this.scene.start('IntroScene');
    });
    odo.events.on(ODO.Events.restart, () => {
      this.scene.get('GameScene').scene.restart();
    });
    odo.trigger(ODO.Triggers.ready);
  }
}
