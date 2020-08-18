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
    this.w_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.d_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.a_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.meatsEaten =0;
    this.score = 0;

    this.scoreText = this.add.text(16, 16, 'Meats eaten: 0', { fontSize: '32px', fill: '#000' })
    this.addMap();

    this.addDino();

    this.addMeat();

    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
 
  }

  addDino() {
    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);
    this.cameras.main.startFollow(this.hero);

    const groundCollider = this.physics.add.collider(this.hero, this.map.getLayer('Ground').tilemapLayer);


    const spikesCollider = this.physics.add.overlap(this.hero, this.spikeGroup, () => {
      this.hero.kill();
    });
    this.hero.on('died', () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();
    }); 
    
  }


  addMap() {
    this.map = this.make.tilemap({ key: 'level-1' });
    this.meats = this.add.group({

    });
    // name must match name in .json
    const groundTiles = this.map.addTilesetImage('dino-world-32', 'world-dino-sheet');

    const groundLayer = this.map.createStaticLayer('Ground', groundTiles);
   
    groundLayer.setCollision([1,2,3,4,5], true);

    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    this.physics.world.setBoundsCollision(true, true, false, true);
    
    this.meatGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.spikeGroup = this.physics.add.group({ immovable: true, allowGravity: false });
    this.map.getObjectLayer('Objects').objects.forEach(object => {
      if (object.name === 'Start') {
        this.spawnPos = { x: object.x, y: object.y };
      }     
      if (object.type === 'waves') {
        const spike = this.spikeGroup.create(object.x, object.y, 'world-dino-sheet', object.gid - 1);
        spike.setOrigin(0, 1.2);
        //spike.setOrigin()
        // spike.setSize(object.width - 10, object.height - 10);
        // spike.setOffset(5, 10);
      }
    });
    //   const debugGraphics = this.add.graphics();
    // groundLayer.renderDebug(debugGraphics);
  }

  addMeat() {
    this.map.getObjectLayer('Objects').objects.forEach(object => {

      if (object.type === 'meat') {
        const meat = this.meatGroup.create(object.x, object.y, 'world-dino-sheet', object.gid - 1);
        meat.id = Phaser.Math.Between(1, 100);
        meat.rotten = Phaser.Math.Between(0,1);
        meat.show = true;
        meat.setOrigin(0, 1);
        this.reCreatemeats(meat);
        this.meats.add(meat);
        
        //spike.setOrigin()
        // spike.setSize(object.width - 10, object.height - 10);
        // spike.setOffset(5, 10);
      }
    });
  }

  reCreatemeats(meat) {
    meat.visible = true;
    this.physics.add.overlap(this.hero, meat, (hero, meat) => {
    
      if(meat.visible == true){
        meat.show = false;
        meat.visible = false;
        this.score += 10;
        this.scoreText.text = 'Meats eaten: ' +this.score;
        this.meatsEaten +=1;
        if(meat.rotten == 0) {
          this.hero.speedUpDino();
        } else {
          this.hero.slowDownDino();
        }
        console.log("meatsEaten "+this.meatsEaten);
      }
       
     /* const id = Phaser.Math.Between(1, 10);
      this.meatGroup.getChildren().forEach(object => {
        if (object.id === id) {         
          meat.show = true;          
        }
      });*/
    });
  }

  update(time, delta) {
    const cameraBottom = this.cameras.main.getWorldPoint(0, this.cameras.main.height).y;
if(this.meatsEaten %10 ===1){
  this.meatGroup.children.iterate(meat => {
    this.reCreatemeats(meat);
  });
  //this.meatsEaten = 0;
}
    if (this.hero.isDead() && this.hero.getBounds().top > cameraBottom + 100) {
      this.hero.destroy();
      this.score = 0;
      this.meatsEaten = 0;
      this.scoreText.text = 'Meats eaten: ' +this.score;
      this.addDino();
      this.meatGroup.children.iterate(meat => {
        this.reCreatemeats(meat);
      });
    }
  }
}

export default Game;