import {Scene} from "../base/Scene";
import {Game} from "../../service/Game";
import {Text} from "../base/Text";

export class EndScene extends Scene {
  name: string = "End";
  gameState: string = 'DEAD';

  init(game: Game) {
    let text = new Text(140, 200, 1, "red", "80pt Calibri").isFixed(true);
    text.text = "YOU DIED!";
    game.gameArea.addElement(text);
    game.gameArea.camera.setPosition(0, 0);
  }
}
