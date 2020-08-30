/// <reference path="../../typings/phaser.d.ts" />
import Phaser from 'phaser';
import Hero from '../entities/Hero';
class Game extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) { }

  preload() {
    this.load.tilemapTiledJSON('level-1', 'assets/levels/dinoworld32.json');
    this.load.spritesheet('world-dino-sheet', 'assets/dino-world-32.png', {
      frameWidth: 32,
      frameHeight: 32,
      margin: 1,
      spacing: 2,
    });
  }

  create(data) {
    // this.add.image(400 , 300, 'logo');
    this.scoreText = this.add.text(16, 16, 'Meats eaten: ', { fontSize: '32px', fill: '#000' })
    this.w_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.d_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    this.a_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    this.space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.meatsEaten = 0;

    this.addMap();

    this.prepareArena();

    this.addMeat();

  }

  prepareArena() {
    // init camera
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    // init score
    this.scoreText.text = "Meats eaten: " +this.meatsEaten;
    
    //console.log('init');
    

    this.map.getObjectLayer('Objects').objects.forEach(object => {
      if (object.name === 'Start') {
        this.spawnPos = { x: object.x, y: object.y };
      }
      if (object.type === 'waves') {
        const spike = this.spikeGroup.create(object.x, object.y, 'world-dino-sheet', object.gid - 1);
        spike.setOrigin(0, 1.2);
      }
    });
    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);
    // camera will follow hero
    this.cameras.main.startFollow(this.hero);
    /*
    Collider : simulates real world rigid body, using physics engine
    create different colliders to simulate different actions on collision with different objects
    example of collision :
    - hero can stand on ground
    - hero will sink in water
    - hero will eat meat if it touches meat
     */
    const groundCollider = this.physics.add.collider(this.hero, this.map.getLayer('Ground').tilemapLayer);

    const spikesCollider = this.physics.add.overlap(this.hero, this.spikeGroup, () => {
      this.hero.kill();
    });

    this.hero.on('died', () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      // colliderWorldbounds == true causes hero to stop at boundary of arena,
      // set it to false so that hero will fall off screen
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();
    });

  }


  addMap() {
    this.map = this.make.tilemap({ key: 'level-1' });

    // name must match name in .json
    const groundTiles = this.map.addTilesetImage('dino-world-32', 'world-dino-sheet');
    const groundLayer = this.map.createStaticLayer('Ground', groundTiles);
    groundLayer.setCollision([1, 2, 3, 4, 5], true);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBoundsCollision(true, true, false, true);

    this.meatGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.spikeGroup = this.physics.add.group({ immovable: true, allowGravity: false });
  }

  addMeat() {
    this.map.getObjectLayer('Objects').objects.forEach(object => {

      if (object.type === 'meat') {
        const meat = this.meatGroup.create(object.x, object.y, 'world-dino-sheet', object.gid - 1);
        meat.id = Phaser.Math.Between(1, 100);
        meat.show = true;
        meat.setOrigin(0, 1);
        this.generateMeats(meat);
      }
    });
  }

  generateMeats(meat) {
    meat.visible = true;
    this.physics.add.overlap(this.hero, meat, (hero, meat) => {

      if (meat.visible == true) {
        meat.show = false;
        meat.visible = false;
        //this.score = this.score+ 10;
        this.meatsEaten = this.meatsEaten + 1;
        this.scoreText.text = 'Meats eaten: ' + this.meatsEaten;
      //  console.log('eaten');
       // console.log(this.scoreText.text);
        /*if(meat.rotten == 0) {
          this.hero.speedUpDino();
        } else {
          this.hero.slowDownDino();
        }*/
        //  console.log("meatsEaten "+this.meatsEaten);
      }
    });
  }

  update(time, delta) {    
    if (this.meatsEaten % 14 === 0) {
      this.meatGroup.children.iterate(meat => {
        this.generateMeats(meat);
      });
    }
    const cameraBottom = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;
    //this.scoreText.setPosition(this.cameras.main.centerX-200,0);

    this.spawn(cameraBottom);
  }

  spawn(cameraBottom) {
    if (this.hero.isDead() && this.hero.getBounds().top > cameraBottom + 100) {
      this.hero.destroy();
      this.meatsEaten = 0;
      this.prepareArena();
      this.meatGroup.children.iterate(meat => {
        this.generateMeats(meat);
      });
    }
  }
}

export default Game;