import { Cameras, GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { RaceId, TugPrototypeSim } from '../sim/prototypeSim';

interface GameKeys
{
    one: Input.Keyboard.Key;
    two: Input.Keyboard.Key;
    three: Input.Keyboard.Key;
    u: Input.Keyboard.Key;
    i: Input.Keyboard.Key;
    o: Input.Keyboard.Key;
    q: Input.Keyboard.Key;
    w: Input.Keyboard.Key;
    e: Input.Keyboard.Key;
    a: Input.Keyboard.Key;
    s: Input.Keyboard.Key;
    d: Input.Keyboard.Key;
    r: Input.Keyboard.Key;
    space: Input.Keyboard.Key;
    esc: Input.Keyboard.Key;
}

const LEFT_RACES: RaceId[] = [ 'beast', 'alien', 'human' ];
const RIGHT_RACES: RaceId[] = [ 'beast', 'alien', 'human' ];

const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 560;
const CORE_PADDING = 24;
const CORE_RADIUS = 18;
const CORE_HP_MAX = 5000;
const TEAM_LEFT = 0;
const LAYER_FLYING = 1;
const WORLD_BG_COLOR = 0x10161f;
const WORLD_BORDER_COLOR = 0xffffff;
const LEFT_TEAM_COLOR = 0x1fad4f;
const RIGHT_TEAM_COLOR = 0xd12b2b;
const CORE_COLOR = 0x4a90e2;
const LEFT_PROJECTILE_COLOR = 0x99f58a;
const RIGHT_PROJECTILE_COLOR = 0xff8c8c;
const CAMERA_PAN_SPEED = 420;
const CAMERA_KEY_ZOOM_SPEED = 520;
const CAMERA_WHEEL_ZOOM_SCALE = 0.42;
const CAMERA_WHEEL_MAX_DELTA = 120;
const CAMERA_ZOOM_DELTA_SCALE = 0.0012;
const CAMERA_ZOOM_MIN = 0.65;
const CAMERA_ZOOM_MAX = 2.2;
const CAMERA_PAN_MARGIN = 96;

export class Game extends Scene
{
    private sim!: TugPrototypeSim;
    private worldGraphics!: GameObjects.Graphics;
    private uiGraphics!: GameObjects.Graphics;
    private hudText!: GameObjects.Text;
    private helpText!: GameObjects.Text;
    private uiCamera?: Cameras.Scene2D.Camera;
    private keys!: GameKeys;
    private accumulatorMs: number;
    private pausedSim: boolean;
    private seed: number;
    private leftRaceIndex: number;
    private rightRaceIndex: number;
    private pendingWheelZoomDelta: number;
    private cameraCenterX: number;
    private cameraCenterY: number;
    private cameraZoom: number;

    constructor ()
    {
        super('Game');
        this.accumulatorMs = 0;
        this.pausedSim = false;
        this.seed = 1337;
        this.leftRaceIndex = 2;
        this.rightRaceIndex = 0;
        this.pendingWheelZoomDelta = 0;
        this.cameraCenterX = WORLD_WIDTH * 0.5;
        this.cameraCenterY = WORLD_HEIGHT * 0.5;
        this.cameraZoom = 1;
    }

    create (): void
    {
        this.cameras.main.setBackgroundColor('#0d1014');

        this.sim = new TugPrototypeSim({
            maxEntities: 4500,
            arenaWidth: WORLD_WIDTH,
            arenaHeight: WORLD_HEIGHT,
            basePadding: CORE_PADDING,
            coreRadius: CORE_RADIUS,
            bucketSize: 24,
            maxTicks: 2400,
            stepMs: 50,
            coreHpStart: CORE_HP_MAX
        });

        this.worldGraphics = this.add.graphics();
        this.uiGraphics = this.add.graphics();
        this.uiGraphics.setScrollFactor(0);
        this.uiGraphics.setDepth(10);

        this.hudText = this.add.text(20, 18, '', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff'
        });
        this.hudText.setScrollFactor(0);
        this.hudText.setDepth(11);

        this.helpText = this.add.text(20, 92, '', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#ffffff'
        });
        this.helpText.setScrollFactor(0);
        this.helpText.setDepth(11);

        this.helpText.setText(
            [
                '1/2/3: LEFT race Beast/Alien/Human',
                'U/I/O: RIGHT race Beast/Alien/Human',
                'R: restart (new seed)  SPACE: pause  ESC: main menu',
                'W/A/S/D: pan camera  Q/E or mouse wheel: zoom',
                'Ranged prototype: projectile only (sphere + trail)'
            ].join('\n')
        );

        const mappedKeys = this.input.keyboard?.addKeys({
            one: Input.Keyboard.KeyCodes.ONE,
            two: Input.Keyboard.KeyCodes.TWO,
            three: Input.Keyboard.KeyCodes.THREE,
            u: Input.Keyboard.KeyCodes.U,
            i: Input.Keyboard.KeyCodes.I,
            o: Input.Keyboard.KeyCodes.O,
            q: Input.Keyboard.KeyCodes.Q,
            w: Input.Keyboard.KeyCodes.W,
            e: Input.Keyboard.KeyCodes.E,
            a: Input.Keyboard.KeyCodes.A,
            s: Input.Keyboard.KeyCodes.S,
            d: Input.Keyboard.KeyCodes.D,
            r: Input.Keyboard.KeyCodes.R,
            space: Input.Keyboard.KeyCodes.SPACE,
            esc: Input.Keyboard.KeyCodes.ESC
        }) as GameKeys | undefined;

        if (!mappedKeys)
        {
            throw new Error('Keyboard input is not available.');
        }

        this.keys = mappedKeys;
        this.setupCameras();
        this.applyCameraTransform();

        this.input.on('wheel', this.handleMouseWheel, this);
        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', this.handleSceneShutdown, this);
        this.events.once('destroy', this.handleSceneShutdown, this);
        this.startMatch();
    }

    update (_time: number, delta: number): void
    {
        this.handleHotkeys();
        this.handleCameraControls(delta);

        if (!this.pausedSim && !this.sim.isFinished)
        {
            this.accumulatorMs += delta;
            let steps = 0;
            while (this.accumulatorMs >= this.sim.stepMs && steps < 8)
            {
                this.sim.step();
                this.accumulatorMs -= this.sim.stepMs;
                steps += 1;
            }
        }

        this.drawWorld();
        this.drawUiOverlay();
        this.updateHud();
    }

    private startMatch (): void
    {
        this.accumulatorMs = 0;
        this.pausedSim = false;
        this.sim.reset({
            seed: this.seed,
            leftRace: LEFT_RACES[this.leftRaceIndex],
            rightRace: RIGHT_RACES[this.rightRaceIndex]
        });
    }

    private handleHotkeys (): void
    {
        if (Input.Keyboard.JustDown(this.keys.one))
        {
            this.leftRaceIndex = 0;
            this.seed += 1;
            this.startMatch();
        }
        if (Input.Keyboard.JustDown(this.keys.two))
        {
            this.leftRaceIndex = 1;
            this.seed += 1;
            this.startMatch();
        }
        if (Input.Keyboard.JustDown(this.keys.three))
        {
            this.leftRaceIndex = 2;
            this.seed += 1;
            this.startMatch();
        }

        if (Input.Keyboard.JustDown(this.keys.u))
        {
            this.rightRaceIndex = 0;
            this.seed += 1;
            this.startMatch();
        }
        if (Input.Keyboard.JustDown(this.keys.i))
        {
            this.rightRaceIndex = 1;
            this.seed += 1;
            this.startMatch();
        }
        if (Input.Keyboard.JustDown(this.keys.o))
        {
            this.rightRaceIndex = 2;
            this.seed += 1;
            this.startMatch();
        }

        if (Input.Keyboard.JustDown(this.keys.r))
        {
            this.seed += 1;
            this.startMatch();
        }
        if (Input.Keyboard.JustDown(this.keys.space))
        {
            this.pausedSim = !this.pausedSim;
        }
        if (Input.Keyboard.JustDown(this.keys.esc))
        {
            this.scene.start('MainMenu');
        }
    }

    private handleCameraControls (delta: number): void
    {
        const panDelta = CAMERA_PAN_SPEED * (delta / 1000);
        if (this.keys.a.isDown)
        {
            this.cameraCenterX -= panDelta;
        }
        if (this.keys.d.isDown)
        {
            this.cameraCenterX += panDelta;
        }
        if (this.keys.w.isDown)
        {
            this.cameraCenterY -= panDelta;
        }
        if (this.keys.s.isDown)
        {
            this.cameraCenterY += panDelta;
        }

        let zoomDelta = this.pendingWheelZoomDelta;
        this.pendingWheelZoomDelta = 0;

        const keyZoomDelta = CAMERA_KEY_ZOOM_SPEED * (delta / 1000);
        if (this.keys.q.isDown)
        {
            zoomDelta -= keyZoomDelta;
        }
        if (this.keys.e.isDown)
        {
            zoomDelta += keyZoomDelta;
        }
        if (zoomDelta !== 0)
        {
            this.cameraZoom = PhaserMath.Clamp(
                this.cameraZoom - zoomDelta * CAMERA_ZOOM_DELTA_SCALE,
                CAMERA_ZOOM_MIN,
                CAMERA_ZOOM_MAX
            );
        }

        this.applyCameraTransform();
    }

    private handleMouseWheel (
        _pointer: Input.Pointer,
        _gameObjects: GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number
    ): void
    {
        const clamped = PhaserMath.Clamp(deltaY, -CAMERA_WHEEL_MAX_DELTA, CAMERA_WHEEL_MAX_DELTA);
        this.pendingWheelZoomDelta += clamped * CAMERA_WHEEL_ZOOM_SCALE;
    }

    private handleResize (): void
    {
        this.uiCamera?.setSize(this.scale.width, this.scale.height);
        this.applyCameraTransform();
    }

    private setupCameras (): void
    {
        const worldCamera = this.cameras.main;

        if (this.uiCamera)
        {
            this.cameras.remove(this.uiCamera);
            this.uiCamera = undefined;
        }

        this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height, false, 'ui');
        if (!this.uiCamera)
        {
            throw new Error('Unable to create UI camera.');
        }

        this.uiCamera.setZoom(1);
        this.uiCamera.setScroll(0, 0);

        worldCamera.ignore([ this.uiGraphics, this.hudText, this.helpText ]);
        this.uiCamera.ignore(this.worldGraphics);
    }

    private applyCameraTransform (): void
    {
        const camera = this.cameras.main;
        camera.setZoom(this.cameraZoom);

        const halfViewWidth = camera.width / (2 * this.cameraZoom);
        const halfViewHeight = camera.height / (2 * this.cameraZoom);
        const minX = halfViewWidth - CAMERA_PAN_MARGIN;
        const maxX = WORLD_WIDTH - halfViewWidth + CAMERA_PAN_MARGIN;
        const minY = halfViewHeight - CAMERA_PAN_MARGIN;
        const maxY = WORLD_HEIGHT - halfViewHeight + CAMERA_PAN_MARGIN;

        if (minX <= maxX)
        {
            this.cameraCenterX = PhaserMath.Clamp(this.cameraCenterX, minX, maxX);
        }
        else
        {
            this.cameraCenterX = PhaserMath.Clamp(
                this.cameraCenterX,
                WORLD_WIDTH * 0.5 - CAMERA_PAN_MARGIN,
                WORLD_WIDTH * 0.5 + CAMERA_PAN_MARGIN
            );
        }

        if (minY <= maxY)
        {
            this.cameraCenterY = PhaserMath.Clamp(this.cameraCenterY, minY, maxY);
        }
        else
        {
            this.cameraCenterY = PhaserMath.Clamp(
                this.cameraCenterY,
                WORLD_HEIGHT * 0.5 - CAMERA_PAN_MARGIN,
                WORLD_HEIGHT * 0.5 + CAMERA_PAN_MARGIN
            );
        }

        camera.centerOn(this.cameraCenterX, this.cameraCenterY);
    }

    private drawWorld (): void
    {
        const graphics = this.worldGraphics;
        graphics.clear();

        graphics.fillStyle(WORLD_BG_COLOR, 1);
        graphics.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
        graphics.lineStyle(2, WORLD_BORDER_COLOR, 0.25);
        graphics.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

        const leftCoreRatio = PhaserMath.Clamp(this.sim.leftCoreHp / CORE_HP_MAX, 0, 1);
        const rightCoreRatio = PhaserMath.Clamp(this.sim.rightCoreHp / CORE_HP_MAX, 0, 1);
        const coreY = WORLD_HEIGHT * 0.5;

        graphics.fillStyle(CORE_COLOR, 0.2 + leftCoreRatio * 0.75);
        graphics.fillCircle(CORE_PADDING, coreY, CORE_RADIUS);
        graphics.fillStyle(CORE_COLOR, 0.2 + rightCoreRatio * 0.75);
        graphics.fillCircle(WORLD_WIDTH - CORE_PADDING, coreY, CORE_RADIUS);

        for (let i = 0; i < this.sim.entityCount; i++)
        {
            if (this.sim.alive[i] === 0)
            {
                continue;
            }

            const teamColor = this.sim.team[i] === TEAM_LEFT ? LEFT_TEAM_COLOR : RIGHT_TEAM_COLOR;
            const alpha = this.sim.layer[i] === LAYER_FLYING ? 0.95 : 0.82;
            const radius = Math.max(1.4, this.sim.renderSize[i] * 0.72);

            graphics.fillStyle(teamColor, alpha);
            graphics.fillCircle(this.sim.x[i], this.sim.y[i], radius);
        }

        this.drawProjectileEffects(graphics);
    }

    private drawProjectileEffects (graphics: GameObjects.Graphics): void
    {
        for (let i = 0; i < this.sim.maxProjectiles; i++)
        {
            if (this.sim.projectileActive[i] === 0)
            {
                continue;
            }

            const isLeftTeam = this.sim.projectileTeam[i] === TEAM_LEFT;
            const color = isLeftTeam ? LEFT_PROJECTILE_COLOR : RIGHT_PROJECTILE_COLOR;
            const explosive = this.sim.projectileExplosive[i] !== 0;
            const radius = explosive ? 3.0 : 2.2;

            graphics.lineStyle(explosive ? 2 : 1.5, color, explosive ? 0.46 : 0.35);
            graphics.lineBetween(
                this.sim.projectilePrevX[i],
                this.sim.projectilePrevY[i],
                this.sim.projectileX[i],
                this.sim.projectileY[i]
            );
            graphics.fillStyle(color, explosive ? 0.92 : 0.84);
            graphics.fillCircle(this.sim.projectileX[i], this.sim.projectileY[i], radius);
        }
    }

    private drawUiOverlay (): void
    {
        const graphics = this.uiGraphics;
        graphics.clear();

        const leftCoreRatio = PhaserMath.Clamp(this.sim.leftCoreHp / CORE_HP_MAX, 0, 1);
        const rightCoreRatio = PhaserMath.Clamp(this.sim.rightCoreHp / CORE_HP_MAX, 0, 1);
        const barWidth = 220;
        const barHeight = 10;
        const leftBarX = 50;
        const rightBarX = this.scale.width - 50 - barWidth;
        const barY = 72;

        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillRect(leftBarX, barY, barWidth, barHeight);
        graphics.fillRect(rightBarX, barY, barWidth, barHeight);
        graphics.fillStyle(LEFT_TEAM_COLOR, 0.92);
        graphics.fillRect(leftBarX, barY, barWidth * leftCoreRatio, barHeight);
        graphics.fillStyle(RIGHT_TEAM_COLOR, 0.92);
        graphics.fillRect(rightBarX, barY, barWidth * rightCoreRatio, barHeight);
    }

    private updateHud (): void
    {
        const leftRace = LEFT_RACES[this.leftRaceIndex];
        const rightRace = RIGHT_RACES[this.rightRaceIndex];
        const winnerText = this.sim.isFinished
            ? (this.sim.winner === 0 ? 'LEFT WINS' : 'RIGHT WINS')
            : 'IN PROGRESS';
        const pausedText = this.pausedSim ? 'PAUSED' : 'RUNNING';

        this.hudText.setText(
            [
                `Seed ${this.seed}  Tick ${this.sim.tick}  ${pausedText}  ${winnerText}`,
                `Matchup LEFT:${leftRace.toUpperCase()}  RIGHT:${rightRace.toUpperCase()}`,
                `Alive LEFT ${this.sim.leftAliveCount}  RIGHT ${this.sim.rightAliveCount}  Entities ${this.sim.entityCount}`,
                `Capacity LEFT ${Math.floor(this.sim.leftRemainingCapacity)}  RIGHT ${Math.floor(this.sim.rightRemainingCapacity)}`,
                `CoreHP LEFT ${Math.floor(this.sim.leftCoreHp)}  RIGHT ${Math.floor(this.sim.rightCoreHp)}`
            ].join('\n')
        );
    }

    private handleSceneShutdown (): void
    {
        this.input.off('wheel', this.handleMouseWheel, this);
        this.scale.off('resize', this.handleResize, this);
        if (this.uiCamera)
        {
            this.cameras.remove(this.uiCamera);
            this.uiCamera = undefined;
        }
    }
}
