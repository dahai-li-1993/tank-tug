import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { RaceId, TugPrototypeSim } from '../sim/prototypeSim';

interface GameKeys
{
    one: Input.Keyboard.Key;
    two: Input.Keyboard.Key;
    three: Input.Keyboard.Key;
    q: Input.Keyboard.Key;
    w: Input.Keyboard.Key;
    e: Input.Keyboard.Key;
    r: Input.Keyboard.Key;
    space: Input.Keyboard.Key;
    esc: Input.Keyboard.Key;
}

const LEFT_RACES: RaceId[] = [ 'beast', 'alien', 'human' ];
const RIGHT_RACES: RaceId[] = [ 'beast', 'alien', 'human' ];

const WORLD_X = 32;
const WORLD_Y = 120;
const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 560;
const CORE_PADDING = 24;
const CORE_RADIUS = 18;

export class Game extends Scene
{
    private sim!: TugPrototypeSim;
    private graphics!: GameObjects.Graphics;
    private hudText!: GameObjects.Text;
    private helpText!: GameObjects.Text;
    private keys!: GameKeys;
    private accumulatorMs: number;
    private pausedSim: boolean;
    private seed: number;
    private leftRaceIndex: number;
    private rightRaceIndex: number;

    constructor ()
    {
        super('Game');
        this.accumulatorMs = 0;
        this.pausedSim = false;
        this.seed = 1337;
        this.leftRaceIndex = 2;
        this.rightRaceIndex = 0;
    }

    create (): void
    {
        this.cameras.main.setBackgroundColor(0x101215);

        this.sim = new TugPrototypeSim({
            maxEntities: 4500,
            arenaWidth: WORLD_WIDTH,
            arenaHeight: WORLD_HEIGHT,
            basePadding: CORE_PADDING,
            coreRadius: CORE_RADIUS,
            bucketSize: 24,
            maxTicks: 2400,
            stepMs: 50,
            coreHpStart: 5000
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
                'Q/W/E: RIGHT race Beast/Alien/Human',
                'R: restart (new seed)  SPACE: pause  ESC: main menu',
                'Prototype: deterministic ECS-style sim, true 2D movement, square/circle units'
            ].join('\n')
        );

        const mappedKeys = this.input.keyboard?.addKeys({
            one: Input.Keyboard.KeyCodes.ONE,
            two: Input.Keyboard.KeyCodes.TWO,
            three: Input.Keyboard.KeyCodes.THREE,
            q: Input.Keyboard.KeyCodes.Q,
            w: Input.Keyboard.KeyCodes.W,
            e: Input.Keyboard.KeyCodes.E,
            r: Input.Keyboard.KeyCodes.R,
            space: Input.Keyboard.KeyCodes.SPACE,
            esc: Input.Keyboard.KeyCodes.ESC
        }) as GameKeys | undefined;

        if (!mappedKeys)
        {
            throw new Error('Keyboard input is not available.');
        }

        this.keys = mappedKeys;
        this.startMatch();
    }

    update (_time: number, delta: number): void
    {
        this.handleHotkeys();

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

        if (Input.Keyboard.JustDown(this.keys.q))
        {
            this.rightRaceIndex = 0;
            this.seed += 1;
            this.startMatch();
        }
        if (Input.Keyboard.JustDown(this.keys.w))
        {
            this.rightRaceIndex = 1;
            this.seed += 1;
            this.startMatch();
        }
        if (Input.Keyboard.JustDown(this.keys.e))
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

    private drawWorld (): void
    {
        const graphics = this.graphics;
        graphics.clear();

        graphics.lineStyle(2, 0xffffff, 0.25);
        graphics.strokeRect(WORLD_X, WORLD_Y, WORLD_WIDTH, WORLD_HEIGHT);

        graphics.fillStyle(0xffffff, 0.15);
        graphics.fillCircle(WORLD_X + CORE_PADDING, WORLD_Y + WORLD_HEIGHT * 0.5, CORE_RADIUS);
        graphics.fillCircle(WORLD_X + WORLD_WIDTH - CORE_PADDING, WORLD_Y + WORLD_HEIGHT * 0.5, CORE_RADIUS);

        const coreMax = 5000;
        const leftCoreRatio = PhaserMath.Clamp(this.sim.leftCoreHp / coreMax, 0, 1);
        const rightCoreRatio = PhaserMath.Clamp(this.sim.rightCoreHp / coreMax, 0, 1);
        const barWidth = 220;
        const barHeight = 10;

        graphics.fillStyle(0xffffff, 0.2);
        graphics.fillRect(50, 72, barWidth, barHeight);
        graphics.fillRect(754, 72, barWidth, barHeight);
        graphics.fillStyle(0xffffff, 0.9);
        graphics.fillRect(50, 72, barWidth * leftCoreRatio, barHeight);
        graphics.fillRect(754, 72, barWidth * rightCoreRatio, barHeight);

        graphics.fillStyle(0xffffff, 0.88);
        for (let i = 0; i < this.sim.entityCount; i++)
        {
            if (this.sim.alive[i] === 0)
            {
                continue;
            }

            const unitX = WORLD_X + this.sim.x[i];
            const layer = this.sim.layer[i];
            const unitY = WORLD_Y + this.sim.y[i];
            const size = this.sim.renderSize[i];

            if (layer === 0)
            {
                graphics.fillRect(unitX - size / 2, unitY - size / 2, size, size);
            }
            else
            {
                graphics.fillCircle(unitX, unitY, size / 2);
            }
        }
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
}
