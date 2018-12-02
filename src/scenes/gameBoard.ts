import Phaser = require('phaser');
import { Map, MapObject } from "../map";
import { EntityManager, Entity } from "../entity";
import Vector2 = Phaser.Math.Vector2;

export class GameBoardScene extends Phaser.Scene {
    private inputState: any;
    private player: any;
    private objective: any;
    private pursuer: any;
    private redshirts: Array<any>;
    private map: Map;
    private entityManager: EntityManager;
    private entityList: Array<Entity>;

    constructor() {
        super({
            key: "GameBoardScene",
            active: false
        });
        this.map = null;
        this.redshirts = [];
        this.entityManager = new EntityManager(this);
        this.entityList = [];
    }

    preload(): void {
        this.entityManager.loadAssets();

        this.load.image("tiles", "assets/2dtop-full-set.png");
        this.load.tilemapTiledJSON("pathtest", "assets/pathtest.json");
        this.load.tilemapTiledJSON("board01", "assets/board01.json");
    }

    init(input): void {
        console.log(input);
        this.inputState = input;
    }

    loadMap(name: string): void {
        if (this.map) {
            this.map.release();
        }
        this.map = new Map(this, name);
    }

    makeSprite(mapObject: MapObject, spriteName: string): any {
        let screenCoords = Map.tileToSpriteCoords(mapObject.coords);
        return this.physics.add.sprite(screenCoords.x, screenCoords.y, spriteName);
    }

    makeEntity(mapObject: MapObject): any {
        let entity = this.entityManager.makeEntity(mapObject);
        this.entityList.push(entity);
        return entity;
    }

    loadSprites(): void {
        this.player = this.makeEntity(this.map.getPlayerObject());
        this.objective = this.makeSprite(this.map.getObjectiveObject(), 'star');
        let redshirts = this.map.getRedshirtObjects()
        redshirts.forEach((redshirtObject) => {
            console.log('++', redshirtObject)
            let redshirt = this.makeEntity(redshirtObject);
            this.redshirts.push(redshirt);
        });

        console.log('!!', this.redshirts)
        this.pursuer = this.makeSprite(this.map.getPursuerObject(), 'monster');

    }

    create(): void {
        this.loadMap("pathtest");
        this.loadSprites();

        if (!this.inputState.playerLocation) {
        }

        const parentActor: any = this.scene.get(this.inputState.parentActor);
        parentActor.sendMessage('It works!');
    }

	update(): void {
	}

    sendMessage(message: any): void {
        if (message.action === 'update-redshirt-positions') {
            message.redshirts.forEach(redshirt => {
                const redshirtSprite = this.redshirts.filter(obj => obj.x === redshirt.oldX && obj.y === redshirt.oldY)[0];
                const newCoords = Map.tileToScreenCoords(new Vector2(redshirt.newX, redshirt.newY));
                redshirtSprite.graphics.setX(newCoords.x).setY(newCoords.y);
            });
        }
    }
}
