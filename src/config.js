/// <reference path="../typings/phaser.d.ts" />
import Phaser from 'phaser';

export default {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#40157d',
  scale: {
    width: 700,
    height: 500,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt : true,
  },
  physics :{
    default:'arcade',
    arcade :{ 
      gravity:{y:250},
      
      /*debug: true,
      debugShowVelocity: true,
      debugShowBody: true,
      debugShowStaticBody: true*/
    }
  },
};
