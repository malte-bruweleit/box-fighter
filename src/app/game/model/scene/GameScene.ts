import {Scene} from "../Scene";
import {Game} from "../../service/Game";
import {Engine} from "../parts/engine/Engine";
import {Weapon} from "../Weapon";
import {Player} from "../Player";
import {Camera} from "../Camera";
import {ColoredShape} from "../ColoredShape";
import {HitBox} from "../HitBox";
import {Sprite} from "../Sprite";
import {ShapeMachine} from "../ShapeMachine";

export class GameScene extends Scene {

  gameState: string = 'RUNNING';

  init(game: Game) {
    let player = new Player();
    player.setWeapon(new Weapon(player));
    player.setEngine(new Engine(player));
    game.gameArea.addElement(player);

    let camera = new Camera(player, game.gameArea);
    game.gameArea.setCamera(camera);

    let shape = new ColoredShape(50, 50, 1, 50, 50, "#00ff16");
    shape.addBehaviour("little-forward", (game, shape) => {
      if(game.gameTime > 300) {
        shape.move(3,0);
      }
    });
    shape.addBehaviour("fast-backward", (game, shape) => {
      if(game.gameTime > 1000) {
        shape.removeBehaviour("little-forward");
        shape.move(-10,0);
      }
    });
    game.gameArea.addElement(shape);

    let shape2 = new ColoredShape(300, 100, 1, 50, 50, "#0002ff");
    shape2.addBehaviour("sinus-freak", (game, shape) => {
      if(game.gameTime > 100) {
        shape.move(2, 6 * Math.sin(shape.x/10));
      }
    });
    game.gameArea.addElement(shape2);
    game.gameArea.addElement(new ColoredShape(800, 100, 1, 50, 50, "#ff000f"));
    let coloredShape = new ColoredShape(2000, 100, 1, 50, 50, "#fff300");
    game.gameArea.addElement(coloredShape);
    game.gameArea.addElement(new ColoredShape(3000, 0, 3, 2, 500, "#000000"));

    game.gameArea.addElement(new HitBox(100, 100, 3, 100, 100, "#98ffb7"));

    game.gameArea.addElement(new Sprite(500, 200, 1, 30, 30, true, 200, "assets/sprite.png"));
    let sprite = new Sprite(500, 300, 1, 30, 30, true, 6, "assets/sprite.png");
    sprite.addBehaviour("sinus-freak", (game, shape) => {
      if(shape.x < 1000) {
        shape.move(.4, 2 * Math.sin(shape.x/5));
      }
    });
    sprite.addBehaviour("sinus-freak-backwards", (game, shape) => {
      if(shape.x > 700) {
        shape.removeBehaviour("sinus-freak");
      }
      if(shape.x > 500 && !shape.behaviours.has("sinus-freak")) {
        shape.move(-2, 2 * Math.sin(shape.x/5));
      } else {
        shape.addBehaviour("sinus-freak", (game, shape) => {
          if(shape.x < 700) {
            shape.move(.4, 2 * Math.sin(shape.x/5));
          }
        });
      }
    });
    game.gameArea.addElement(sprite);

    let sprite2 = new Sprite(500, 250, 1, 30, 30, true, 200, "assets/sprite.png");
    let angle = Math.PI / 180;
    let radius = 200;
    sprite2.addBehaviour("circle", (game, shape) => {
      angle += Math.PI / 180;
      let x = 500 + radius * (Math.cos(angle));
      let y = 250 + radius * (Math.sin(angle));
      shape.setPosition(x, y);
    });
    game.gameArea.addElement(sprite2);
    game.gameArea.addElement(new ColoredShape(500, 250, 2, 2, 2, "#000000"));
    game.gameArea.addElement(new ShapeMachine());
  }

  cleanUp(game: Game) {
    game.gameArea.clear();
  }
}
