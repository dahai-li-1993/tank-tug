import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { ThreeBattleRenderer } from '../render/ThreeBattleRenderer';
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
const CAMERA_PAN_SPEED = 420;
const CAMERA_KEY_ZOOM_SPEED = 520;
const CAMERA_WHEEL_ZOOM_SCALE = 0.42;
const CAMERA_WHEEL_MAX_DELTA = 120;

export class Game extends Scene
{
    private sim!: TugPrototypeSim;
    private battleRenderer?: ThreeBattleRenderer;
    private graphics!: GameObjects.Graphics;
    private hudText!: GameObjects.Text;
    private helpText!: GameObjects.Text;
    private keys!: GameKeys;
    private accumulatorMs: number;
    private pausedSim: boolean;
    private seed: number;
    private leftRaceIndex: number;
    private rightRaceIndex: number;
    private pendingWheelZoomDelta: number;

    constructor ()
    {
        super('Game');
        this.accumulatorMs = 0;
        this.pausedSim = false;
        this.seed = 1337;
        this.leftRaceIndex = 2;
        this.rightRaceIndex = 0;
        this.pendingWheelZoomDelta = 0;
    }

    create (): void
    {
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0)');

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

        this.graphics = this.add.graphics();
        this.hudText = this.add.text(20, 18, '', {
            fontFamily: 'monospace',
            fontSize: '16px',
            color: '#ffffff'
        });
        this.helpText = this.add.text(20, 92, '', {
            fontFamily: 'monospace',
            fontSize: '13px',
            color: '#ffffff'
        });

        this.helpText.setText(
            [
                '1/2/3: LEFT race Beast/Alien/Human',
                'U/I/O: RIGHT race Beast/Alien/Human',
                'R: restart (new seed)  SPACE: pause  ESC: main menu',
                'W/A/S/D: pan camera (horizontal plane)  Q/E or mouse wheel: zoom',
                '3D view: spheres, fixed flying altitude, LEFT green / RIGHT red'
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
        this.ensureBattleRenderer();
        this.input.on('wheel', this.handleMouseWheel, this);
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
        const renderer = this.battleRenderer;
        if (!renderer)
        {
            this.pendingWheelZoomDelta = 0;
            return;
        }

        const panDelta = CAMERA_PAN_SPEED * (delta / 1000);
        let panX = 0;
        let panZ = 0;

        if (this.keys.a.isDown)
        {
            panX -= panDelta;
        }
        if (this.keys.d.isDown)
        {
            panX += panDelta;
        }
        if (this.keys.w.isDown)
        {
            panZ -= panDelta;
        }
        if (this.keys.s.isDown)
        {
            panZ += panDelta;
        }
        if (panX !== 0 || panZ !== 0)
        {
            renderer.panHorizontal(panX, panZ);
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
            renderer.zoomBy(zoomDelta);
        }
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

    private drawWorld (): void
    {
        this.battleRenderer?.render(this.sim);

        const graphics = this.graphics;
        graphics.clear();

        const leftCoreRatio = PhaserMath.Clamp(this.sim.leftCoreHp / CORE_HP_MAX, 0, 1);
        const rightCoreRatio = PhaserMath.Clamp(this.sim.rightCoreHp / CORE_HP_MAX, 0, 1);
        const barWidth = 220;
        const barHeight = 10;

        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillRect(50, 72, barWidth, barHeight);
        graphics.fillRect(754, 72, barWidth, barHeight);
        graphics.fillStyle(0x1fad4f, 0.92);
        graphics.fillRect(50, 72, barWidth * leftCoreRatio, barHeight);
        graphics.fillStyle(0xd12b2b, 0.92);
        graphics.fillRect(754, 72, barWidth * rightCoreRatio, barHeight);
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

    private ensureBattleRenderer (): void
    {
        const parentElement = this.game.canvas.parentElement;
        if (!parentElement)
        {
            throw new Error('Game canvas parent element is not available.');
        }

        const gameCanvas = this.game.canvas as HTMLCanvasElement;
        gameCanvas.style.position = 'relative';
        gameCanvas.style.zIndex = '2';

        this.battleRenderer = new ThreeBattleRenderer({
            parentElement,
            width: this.scale.width,
            height: this.scale.height,
            arenaWidth: WORLD_WIDTH,
            arenaHeight: WORLD_HEIGHT,
            corePadding: CORE_PADDING,
            coreRadius: CORE_RADIUS,
            coreHpMax: CORE_HP_MAX,
            maxEntities: 4500
        });
    }

    private handleSceneShutdown (): void
    {
        this.input.off('wheel', this.handleMouseWheel, this);
        this.battleRenderer?.destroy();
        this.battleRenderer = undefined;
    }
}
