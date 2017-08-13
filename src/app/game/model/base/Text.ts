import { Element } from './Element';
import {Camera} from "./Camera";
import {Game} from "../../service/Game";
import {Shape} from "./Shape";
import {Position} from "./Position";

export class Text extends Element {

  text: string;
  textWidth: number;
  textHeight: number;
  color: string;
  style: string;

  constructor(x: number, y: number, z: number, color: string, style: string) {
    super(x, y, z);
    this.color = color;
    this.style = style;
  }

  isOnScreen(camera: Camera): boolean {
    let cameraShape: Shape = camera.shape();
    return cameraShape.containsPosition(new Position(this.x + 50, this.y)) ||
      cameraShape.containsPosition(new Position(this.x + 50, this.y - this.textHeight)) ||
      cameraShape.containsPosition(new Position(this.x + 50 + this.textWidth, this.y)) ||
      cameraShape.containsPosition(new Position(this.x + + 50 + this.textWidth, this.y - this.textHeight));
  }

  render(camera: Camera) {
    super.render(camera);
    let context = camera.gameArea.getContext();
    context.font = this.style;
    context.fillStyle = this.color;
    context.fillText(this.text, this.xOffset, this.yOffset);
    let textMetrics = context.measureText(this.text);
    this.textWidth = textMetrics.width;
    this.textHeight = textMetrics.height;
  }

  update(game: Game) {

  }

  type: string = "Text";
}
