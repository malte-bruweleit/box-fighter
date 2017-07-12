import {Shape} from "./Shape";
import {Camera} from "./Camera";
import {Game} from "../service/Game";
import {Weapon} from "./Weapon";
import {ColoredShape} from "./ColoredShape";

export class Bullet extends ColoredShape {

  maxRange: number = 800;
  speed: number = 5;
  travelled: number = 0;

  constructor(weapon: Weapon) {
    super(weapon.bulletHole.x, weapon.bulletHole.y, weapon.z, 5, 5, "#000");
  }

  render(camera: Camera) {
    super.render(camera);
  }

  update(game: Game) {
    let self = this;
    game.gameArea.elements.forEach((value) => {
      if(value instanceof Shape) {
        if(this.collision(value) && value != self) {
          value.hit(game);
          game.gameArea.removeElement(self);
        }
      }
    });
    if(this.maxRange <= this.travelled) {
      game.gameArea.removeElement(this);
    }
    this.move(this.speed, 0);
    this.travelled += this.speed;
  }

}
