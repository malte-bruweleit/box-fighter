import { Element } from './Element';
import {Game} from "../service/Game";
import {Bullet} from "./Bullet";
import {Position} from "./Position";
import {Equipment} from "./parts/Equipment";
import {ColoredShape} from "./ColoredShape";

export class Weapon extends Equipment {

  bulletHole: Position;

  constructor(target: Element) {
    super(target);
    this.elements.push(new ColoredShape(target.x+50, target.y+20+1, target.z, 30, 8, "#0206ee"));
    this.bulletHole = new Position(target.x+80+2, target.y+28-6);
  }

  update(game: Game) {
    super.update(game);
    if(game.gameTime % 20 == 0 && game.controls.shoot) {
      game.gameArea.addElement(new Bullet(this));
    }
  }

  move(x: number, y: number) {
    super.move(x, y);
    this.bulletHole.move(x, y);
  }

}