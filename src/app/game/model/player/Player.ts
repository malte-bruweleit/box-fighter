import {Element} from '../base/Element';
import {Camera} from "../base/camera/Camera";
import {Game} from "../../service/Game";
import {Engine} from "./parts/Engine";
import {Weapon} from "./parts/Weapon";
import {ColoredShape} from "../base/shapes/ColoredShape";
import {Shape} from "../base/shapes/Shape";
import {Valuable} from "./currency/Valuable";
import {ValuableConsumer} from "./currency/ValuableConsumer";
import {Buyable} from "./currency/Buyable";
import {Vector} from "../base/Vector";
import {ElementCatalogue} from "../catalogues/ElementCatalogue";
import {SceneCatalogue} from "../catalogues/SceneCatalogue";

export class Player extends Element implements ValuableConsumer {

  elements: Element[] = [];
  hitboxes: Shape[] = [];
  engine: Engine;
  weapon: Weapon;
  height: number;

  currency: number = 0;
  dead: boolean = false;
  lifes: number = 3;

  lastScene: SceneCatalogue;

  constructor() {
    super(100, 500/2 - 25, 5);
    this.elements.push(new ColoredShape(this.position.x, this.position.y, this.z, 25, 25, "#234242"));
    this.elements.push(new ColoredShape(this.position.x+25, this.position.y, this.z, 25, 25, "#29ee4c"));
    this.elements.push(new ColoredShape(this.position.x+25, this.position.y+25, this.z, 25, 25, "#234242"));
    this.elements.push(new ColoredShape(this.position.x, this.position.y+25, this.z, 25, 25, "#29ee4c"));
    let hitbox = new Shape(this.position.x, this.position.y, this.z, 50, 50);
    this.hitboxes.push(hitbox);
    this.elements.push(hitbox);
    this.height = this.calculateHeight();
    this.setWeapon(new Weapon(0,0,0));
    this.setEngine(new Engine(0,0,0));
  }

  resetPosition(x: number, y: number, z: number) {
    this.setPosition(x, y);
    this.dead = false;
    let weapon = this.weapon;
    let engine = this.engine;
    this.weapon = undefined;
    this.engine = undefined;
    this.elements = [];
    this.hitboxes = [];
    this.elements.push(new ColoredShape(x, y, z, 25, 25, "#234242"));
    this.elements.push(new ColoredShape(x+25, y, z, 25, 25, "#29ee4c"));
    this.elements.push(new ColoredShape(x+25, y+25, z, 25, 25, "#234242"));
    this.elements.push(new ColoredShape(x, y+25, z, 25, 25, "#29ee4c"));
    let hitbox = new Shape(x, y, z, 50, 50);
    this.hitboxes.push(hitbox);
    this.elements.push(hitbox);
    this.height = this.calculateHeight();
    this.setWeapon(weapon);
    this.setEngine(engine);
    this.weapon.reset();
    this.engine.reset();
  }

  isOnScreen(): boolean {
    return true;
  }

  render(camera: Camera, canvas: string = "game") {
    this.elements.forEach(value => value.render(camera, canvas));
  }

  setEngine(engine: Engine) {
    if(this.engine) {
      let enginePosition = this.elements.indexOf(this.engine);
      this.elements.splice(enginePosition, 1);
    }
    engine.attach(this);
    this.elements.push(engine);
    this.engine = engine;
  }
  setWeapon(weapon: Weapon) {
    if(this.weapon) {
      let weaponPosition = this.elements.indexOf(this.weapon);
      this.weapon.detach();
      this.elements.splice(weaponPosition, 1);
    }
    weapon.attach(this);
    this.elements.push(weapon);
    weapon.elements.forEach(element => {
      if(element instanceof ColoredShape) {
        this.hitboxes.push(element);
      }
    });
    this.weapon = weapon;
  }

  calculateHeight(): number {
    let minX = this.position.x;
    let maxX = this.position.x;
    this.elements.forEach(value => value instanceof Shape && minX >= value.position.x ? minX = value.position.x : minX);
    this.elements.forEach(value => value instanceof Shape && maxX <= value.position.x + value.h ? maxX = value.position.x + value.h : maxX);
    return maxX - minX;
  }

  update(game: Game) {
    if(this.destination) {
      this.moveTo(this.engine.acceleration);
      console.log(this.distanceToTarget(this.destination));
      if(this.distanceToTarget(this.destination) < 5) {
        this.destination = undefined;
      }
    } else {
      this.doMovementAccelerated(game);
    }

    this.checkForHits(game);
  }

  checkForHits(game: Game) {
    if(!this.dead) {
      game.gameArea.elementsOnCamera().forEach((value) => {
        if(value instanceof ColoredShape && value.dangerous) {
          this.hitboxes.forEach(hitbox => {
            if(hitbox.collision(value)) {
              value.onHit(game);
              this.dying(game);
            }
          })
        }
      });
    }
  }

  dying(game: Game) {
    if(!this.dead) {
      this.dead = true;
      this.velocity = new Vector(0, 0);
      game.gameArea.removeElement(this);
      this.lifes -= 1;
      game.changeGameState(this.lifes == 0 ? SceneCatalogue.DEAD : SceneCatalogue.TRY_AGAIN, 1500);
      this.elements.forEach(colored => {
        if(colored instanceof ColoredShape) {
          colored.explode(game);
        }
      });
    }
  }

  consume(valuable: Valuable) {
    this.currency += valuable.value;
  }
  buy(buyable: Buyable) {
    this.currency -= buyable.value;
  }

  doMovement(game: Game) {
    this.elements.forEach(value => value.update(game));
    this.velocity = new Vector(0, 0);
    if(this.engine.level > 0 && !this.dead) {
      let acceleration = this.engine ? this.engine.maxSpeed : 0;
      let levelBorders = game.getActiveScene().levelBorders;
      let xAcceleration = 0;
      let yAcceleration = 0;
      if(game.controls.down) {
        yAcceleration = this.position.y <= levelBorders.h - this.height ? acceleration : 0;
      }
      if(game.controls.up) {
        yAcceleration = this.position.y >= levelBorders.position.y ? -acceleration : 0;
      }
      if(game.controls.right) {
        xAcceleration = this.position.x <= levelBorders.w ? acceleration : 0;
      }
      if(game.controls.left) {
        xAcceleration = this.position.x >= levelBorders.position.x ? -acceleration : 0;
      }
      if(game.controls.isMoving()) {
        this.velocity = new Vector(xAcceleration, yAcceleration);
        this.move(this.velocity);
        this.elements.forEach(value => value.move(this.velocity));
        this.engine.consumeFuel(Math.abs(acceleration));
      }
    }
  }

  accAcceleration: number = 0;
  yAcceleration: number = 0;
  xAcceleration: number = 0;
  doMovementAccelerated(game: Game) {
    this.elements.forEach(value => value.update(game));
    if(this.engine.level > 0 && !this.dead) {
      let acceleration = this.engine ? this.engine.acceleration : 0;
      let levelBorders = game.getActiveScene().levelBorders;
      if(game.controls.down) {
        if(Math.abs(this.yAcceleration) <= this.engine.maxSpeed) {
          this.yAcceleration += this.engine.acceleration;
        }
      }
      if(game.controls.up) {
        if(Math.abs(this.yAcceleration) <= this.engine.maxSpeed) {
          this.yAcceleration -= this.engine.acceleration;
        }
      }
      if(game.controls.right) {
        if(Math.abs(this.xAcceleration) <= this.engine.maxSpeed) {
          this.xAcceleration += this.engine.acceleration;
        }
      }
      if(game.controls.left) {
        if(Math.abs(this.xAcceleration) <= this.engine.maxSpeed) {
          this.xAcceleration -= this.engine.acceleration;
        }
      }
      if(game.controls.isMoving()) {
        this.engine.consumeFuel(Math.abs(acceleration));
      }
      if(!game.controls.isMovingX()) {
        if(Math.abs(this.xAcceleration) <= this.engine.acceleration) {
          this.xAcceleration = 0;
        }
        if(this.xAcceleration > 0) {
          this.xAcceleration -= acceleration;
        } else if(this.xAcceleration < 0) {
          this.xAcceleration += acceleration;
        }
      }
      if(!game.controls.isMovingY()) {
        if(Math.abs(this.yAcceleration) <= this.engine.acceleration) {
          this.yAcceleration = 0;
        }
        if(this.yAcceleration > 0) {
          this.yAcceleration -= acceleration;
        } else if(this.yAcceleration < 0) {
          this.yAcceleration += acceleration;
        }
      }

      this.velocity = new Vector(this.xAcceleration, this.yAcceleration);
      console.log(this.xAcceleration + " " + this.yAcceleration);
      this.move(this.velocity);
      this.elements.forEach(value => value.move(this.velocity));
    }
  }

  moveTo(speed: number): any {
    super.moveTo(speed);
    this.elements.forEach(value => value.move(this.velocity));
  }

  type: ElementCatalogue = ElementCatalogue.PLAYER;
}
