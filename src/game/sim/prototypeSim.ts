export type RaceId = 'beast' | 'alien' | 'human';

const TEAM_LEFT = 0;
const TEAM_RIGHT = 1;

const LAYER_GROUNDED = 0;
const LAYER_FLYING = 1;

const ATTACK_GROUNDED = 1;
const ATTACK_FLYING = 2;
const ATTACK_BOTH = ATTACK_GROUNDED | ATTACK_FLYING;
const UNIFORM_UNIT_SPEED = 2.2;

type TeamId = 0 | 1;

interface UnitArchetype
{
    layer: 0 | 1;
    hp: number;
    shield: number;
    armor: number;
    damage: number;
    cooldownTicks: number;
    range: number;
    speed: number;
    attackMask: number;
    renderSize: number;
    capacity: number;
    count: number;
}

interface SimConfig
{
    maxEntities: number;
    arenaWidth: number;
    arenaHeight: number;
    basePadding: number;
    coreRadius: number;
    bucketSize: number;
    maxTicks: number;
    stepMs: number;
    coreHpStart: number;
}

interface ResetConfig
{
    seed: number;
    leftRace: RaceId;
    rightRace: RaceId;
}

const DEFAULT_CONFIG: SimConfig = {
    maxEntities: 4500,
    arenaWidth: 960,
    arenaHeight: 560,
    basePadding: 24,
    coreRadius: 18,
    bucketSize: 24,
    maxTicks: 2400,
    stepMs: 50,
    coreHpStart: 5000
};

const RACE_PRESETS: Record<RaceId, UnitArchetype[]> = {
    beast: [
        { layer: LAYER_GROUNDED, hp: 55, shield: 0, armor: 0, damage: 8, cooldownTicks: 11, range: 14, speed: 2.5, attackMask: ATTACK_GROUNDED, renderSize: 4, capacity: 2, count: 320 },
        { layer: LAYER_GROUNDED, hp: 90, shield: 0, armor: 0, damage: 10, cooldownTicks: 13, range: 42, speed: 2.2, attackMask: ATTACK_BOTH, renderSize: 4, capacity: 3, count: 140 },
        { layer: LAYER_GROUNDED, hp: 260, shield: 0, armor: 2, damage: 22, cooldownTicks: 20, range: 18, speed: 1.6, attackMask: ATTACK_GROUNDED, renderSize: 6, capacity: 8, count: 80 },
        { layer: LAYER_FLYING, hp: 180, shield: 0, armor: 1, damage: 26, cooldownTicks: 19, range: 46, speed: 2.9, attackMask: ATTACK_BOTH, renderSize: 5, capacity: 10, count: 40 },
        { layer: LAYER_GROUNDED, hp: 3600, shield: 0, armor: 6, damage: 170, cooldownTicks: 45, range: 22, speed: 1.0, attackMask: ATTACK_GROUNDED, renderSize: 12, capacity: 125, count: 12 },
        { layer: LAYER_FLYING, hp: 4400, shield: 0, armor: 6, damage: 190, cooldownTicks: 48, range: 60, speed: 1.3, attackMask: ATTACK_BOTH, renderSize: 12, capacity: 145, count: 8 }
    ],
    alien: [
        { layer: LAYER_GROUNDED, hp: 80, shield: 40, armor: 0, damage: 13, cooldownTicks: 14, range: 44, speed: 2.1, attackMask: ATTACK_GROUNDED, renderSize: 4, capacity: 3, count: 200 },
        { layer: LAYER_GROUNDED, hp: 220, shield: 120, armor: 1, damage: 36, cooldownTicks: 20, range: 52, speed: 2.2, attackMask: ATTACK_BOTH, renderSize: 5, capacity: 14, count: 130 },
        { layer: LAYER_GROUNDED, hp: 95, shield: 70, armor: 0, damage: 16, cooldownTicks: 16, range: 54, speed: 2.0, attackMask: ATTACK_BOTH, renderSize: 4, capacity: 5, count: 90 },
        { layer: LAYER_FLYING, hp: 150, shield: 90, armor: 1, damage: 28, cooldownTicks: 15, range: 56, speed: 3.0, attackMask: ATTACK_BOTH, renderSize: 5, capacity: 9, count: 70 },
        { layer: LAYER_GROUNDED, hp: 2600, shield: 1800, armor: 6, damage: 160, cooldownTicks: 40, range: 38, speed: 1.1, attackMask: ATTACK_BOTH, renderSize: 12, capacity: 135, count: 12 },
        { layer: LAYER_FLYING, hp: 3000, shield: 2200, armor: 6, damage: 210, cooldownTicks: 50, range: 68, speed: 1.3, attackMask: ATTACK_BOTH, renderSize: 12, capacity: 155, count: 8 }
    ],
    human: [
        { layer: LAYER_GROUNDED, hp: 80, shield: 0, armor: 0, damage: 12, cooldownTicks: 13, range: 42, speed: 2.2, attackMask: ATTACK_BOTH, renderSize: 4, capacity: 3, count: 240 },
        { layer: LAYER_GROUNDED, hp: 300, shield: 0, armor: 3, damage: 21, cooldownTicks: 22, range: 18, speed: 1.6, attackMask: ATTACK_GROUNDED, renderSize: 6, capacity: 9, count: 110 },
        { layer: LAYER_GROUNDED, hp: 240, shield: 0, armor: 1, damage: 62, cooldownTicks: 34, range: 60, speed: 1.7, attackMask: ATTACK_BOTH, renderSize: 5, capacity: 15, count: 90 },
        { layer: LAYER_FLYING, hp: 220, shield: 0, armor: 1, damage: 30, cooldownTicks: 16, range: 56, speed: 3.2, attackMask: ATTACK_BOTH, renderSize: 5, capacity: 10, count: 70 },
        { layer: LAYER_GROUNDED, hp: 4300, shield: 0, armor: 7, damage: 180, cooldownTicks: 46, range: 26, speed: 1.0, attackMask: ATTACK_GROUNDED, renderSize: 12, capacity: 130, count: 14 },
        { layer: LAYER_FLYING, hp: 5200, shield: 0, armor: 7, damage: 220, cooldownTicks: 52, range: 66, speed: 1.2, attackMask: ATTACK_BOTH, renderSize: 12, capacity: 160, count: 8 }
    ]
};

class XorShift32
{
    private state: number;

    constructor (seed: number)
    {
        this.state = seed >>> 0;
    }

    setSeed (seed: number): void
    {
        this.state = seed >>> 0;
    }

    nextUint (): number
    {
        let x = this.state;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.state = x >>> 0;
        return this.state;
    }

    nextFloat (): number
    {
        return this.nextUint() / 4294967296;
    }
}

export class TugPrototypeSim
{
    readonly stepMs: number;
    readonly arenaWidth: number;
    readonly arenaHeight: number;
    readonly basePadding: number;
    readonly coreRadius: number;

    readonly alive: Uint8Array;
    readonly team: Uint8Array;
    readonly layer: Uint8Array;
    readonly x: Float32Array;
    readonly y: Float32Array;
    readonly hp: Float32Array;
    readonly shield: Float32Array;
    readonly armor: Float32Array;
    readonly damage: Float32Array;
    readonly range: Float32Array;
    readonly speed: Float32Array;
    readonly attackMask: Uint8Array;
    readonly cooldownTicks: Uint16Array;
    readonly nextAttackTick: Int32Array;
    readonly target: Int32Array;
    readonly capacity: Float32Array;
    readonly renderSize: Float32Array;
    readonly spawnOrder: Int32Array;

    entityCount: number;
    tick: number;
    leftCoreHp: number;
    rightCoreHp: number;
    leftAliveCount: number;
    rightAliveCount: number;
    leftRemainingCapacity: number;
    rightRemainingCapacity: number;
    winner: -1 | 0 | 1;
    isFinished: boolean;

    private readonly maxEntities: number;
    private readonly bucketSize: number;
    private readonly bucketCols: number;
    private readonly bucketRows: number;
    private readonly bucketCount: number;
    private readonly maxTicks: number;
    private readonly coreHpStart: number;
    private readonly bucketHeads: Int32Array;
    private readonly nextInBucket: Int32Array;
    private readonly pendingDamage: Float32Array;
    private readonly rng: XorShift32;

    private readonly leftCoreX: number;
    private readonly leftCoreY: number;
    private readonly rightCoreX: number;
    private readonly rightCoreY: number;

    private spawnCounter: number;
    private leftRace: RaceId;
    private rightRace: RaceId;

    constructor (config?: Partial<SimConfig>)
    {
        const cfg = { ...DEFAULT_CONFIG, ...config };
        this.stepMs = cfg.stepMs;
        this.arenaWidth = cfg.arenaWidth;
        this.arenaHeight = cfg.arenaHeight;
        this.basePadding = cfg.basePadding;
        this.coreRadius = cfg.coreRadius;

        this.maxEntities = cfg.maxEntities;
        this.bucketSize = cfg.bucketSize;
        this.bucketCols = Math.ceil(cfg.arenaWidth / cfg.bucketSize);
        this.bucketRows = Math.ceil(cfg.arenaHeight / cfg.bucketSize);
        this.bucketCount = this.bucketCols * this.bucketRows;
        this.maxTicks = cfg.maxTicks;
        this.coreHpStart = cfg.coreHpStart;

        this.bucketHeads = new Int32Array(this.bucketCount * 4);
        this.nextInBucket = new Int32Array(this.maxEntities);
        this.pendingDamage = new Float32Array(this.maxEntities);
        this.rng = new XorShift32(1);

        this.leftCoreX = this.basePadding;
        this.leftCoreY = this.arenaHeight * 0.5;
        this.rightCoreX = this.arenaWidth - this.basePadding;
        this.rightCoreY = this.arenaHeight * 0.5;

        this.leftRace = 'human';
        this.rightRace = 'beast';
        this.spawnCounter = 0;

        this.alive = new Uint8Array(this.maxEntities);
        this.team = new Uint8Array(this.maxEntities);
        this.layer = new Uint8Array(this.maxEntities);
        this.x = new Float32Array(this.maxEntities);
        this.y = new Float32Array(this.maxEntities);
        this.hp = new Float32Array(this.maxEntities);
        this.shield = new Float32Array(this.maxEntities);
        this.armor = new Float32Array(this.maxEntities);
        this.damage = new Float32Array(this.maxEntities);
        this.range = new Float32Array(this.maxEntities);
        this.speed = new Float32Array(this.maxEntities);
        this.attackMask = new Uint8Array(this.maxEntities);
        this.cooldownTicks = new Uint16Array(this.maxEntities);
        this.nextAttackTick = new Int32Array(this.maxEntities);
        this.target = new Int32Array(this.maxEntities);
        this.capacity = new Float32Array(this.maxEntities);
        this.renderSize = new Float32Array(this.maxEntities);
        this.spawnOrder = new Int32Array(this.maxEntities);

        this.entityCount = 0;
        this.tick = 0;
        this.leftCoreHp = this.coreHpStart;
        this.rightCoreHp = this.coreHpStart;
        this.leftAliveCount = 0;
        this.rightAliveCount = 0;
        this.leftRemainingCapacity = 0;
        this.rightRemainingCapacity = 0;
        this.winner = -1;
        this.isFinished = false;

        this.target.fill(-1);
        this.nextInBucket.fill(-1);
    }

    reset (cfg: ResetConfig): void
    {
        this.leftRace = cfg.leftRace;
        this.rightRace = cfg.rightRace;
        this.rng.setSeed(cfg.seed);

        this.entityCount = 0;
        this.spawnCounter = 0;
        this.tick = 0;
        this.leftCoreHp = this.coreHpStart;
        this.rightCoreHp = this.coreHpStart;
        this.winner = -1;
        this.isFinished = false;

        this.alive.fill(0);
        this.target.fill(-1);
        this.nextAttackTick.fill(0);
        this.nextInBucket.fill(-1);

        this.spawnRace(TEAM_LEFT, this.leftRace);
        this.spawnRace(TEAM_RIGHT, this.rightRace);
        this.refreshAliveStats();
    }

    step (): void
    {
        if (this.isFinished)
        {
            return;
        }

        this.tick += 1;
        this.rebuildBuckets();
        this.pendingDamage.fill(0, 0, this.entityCount);

        for (let i = 0; i < this.entityCount; i++)
        {
            if (this.alive[i] === 0)
            {
                continue;
            }

            const teamId = this.team[i] as TeamId;
            if (this.applyCoreBreach(i, teamId))
            {
                continue;
            }

            let targetId = this.target[i];
            if (!this.isTargetValid(i, targetId))
            {
                targetId = this.acquireTarget(i);
                this.target[i] = targetId;
            }

            if (targetId >= 0)
            {
                const dx = this.x[targetId] - this.x[i];
                const dy = this.y[targetId] - this.y[i];
                const distSq = dx * dx + dy * dy;
                const rangeSq = this.range[i] * this.range[i];

                if (distSq <= rangeSq)
                {
                    if (this.tick >= this.nextAttackTick[i])
                    {
                        this.pendingDamage[targetId] += this.computeDamage(i, targetId);
                        this.nextAttackTick[i] = this.tick + this.cooldownTicks[i];
                    }
                }
                else
                {
                    this.moveByVector(i, dx, dy);
                }
            }
            else
            {
                this.moveTowardEnemyCore(i, teamId);
            }
        }

        this.applyPendingDamage();
        this.refreshAliveStats();
        this.resolveVictory();
    }

    private spawnRace (teamId: TeamId, race: RaceId): void
    {
        const preset = RACE_PRESETS[race];
        const direction = teamId === TEAM_LEFT ? 1 : -1;
        const startX = teamId === TEAM_LEFT ? this.basePadding + 12 : this.arenaWidth - this.basePadding - 12;
        const yMin = this.basePadding + 8;
        const ySpan = Math.max(1, this.arenaHeight - (this.basePadding + 8) * 2);

        for (const archetype of preset)
        {
            const depthStep = archetype.layer === LAYER_GROUNDED ? 5.0 : 6.0;
            for (let n = 0; n < archetype.count; n++)
            {
                const row = Math.floor(n / 20);
                const depth = row * depthStep + (this.rng.nextFloat() - 0.5) * 2.0;
                const spawnX = startX + direction * depth;
                const spawnY = yMin + this.rng.nextFloat() * ySpan;
                this.spawnUnit(
                    teamId,
                    archetype,
                    this.clampX(spawnX),
                    this.clampY(spawnY)
                );
            }
        }
    }

    private spawnUnit (teamId: TeamId, archetype: UnitArchetype, x: number, y: number): void
    {
        if (this.entityCount >= this.maxEntities)
        {
            return;
        }

        const i = this.entityCount++;
        this.alive[i] = 1;
        this.team[i] = teamId;
        this.layer[i] = archetype.layer;
        this.x[i] = x;
        this.y[i] = y;
        this.hp[i] = archetype.hp;
        this.shield[i] = archetype.shield;
        this.armor[i] = archetype.armor;
        this.damage[i] = archetype.damage;
        this.range[i] = archetype.range;
        this.speed[i] = UNIFORM_UNIT_SPEED;
        this.attackMask[i] = archetype.attackMask;
        this.cooldownTicks[i] = archetype.cooldownTicks;
        this.nextAttackTick[i] = Math.floor(this.rng.nextFloat() * archetype.cooldownTicks);
        this.target[i] = -1;
        this.capacity[i] = archetype.capacity;
        this.renderSize[i] = archetype.renderSize;
        this.spawnOrder[i] = this.spawnCounter++;
        this.nextInBucket[i] = -1;
    }

    private rebuildBuckets (): void
    {
        this.bucketHeads.fill(-1);

        for (let i = 0; i < this.entityCount; i++)
        {
            if (this.alive[i] === 0)
            {
                continue;
            }

            const group = this.team[i] * 2 + this.layer[i];
            const bucket = this.toBucketIndex(this.x[i], this.y[i]);
            const headIndex = group * this.bucketCount + bucket;
            this.nextInBucket[i] = this.bucketHeads[headIndex];
            this.bucketHeads[headIndex] = i;
        }
    }

    private applyCoreBreach (i: number, teamId: TeamId): boolean
    {
        const targetCoreX = teamId === TEAM_LEFT ? this.rightCoreX : this.leftCoreX;
        const targetCoreY = teamId === TEAM_LEFT ? this.rightCoreY : this.leftCoreY;
        const dx = this.x[i] - targetCoreX;
        const dy = this.y[i] - targetCoreY;
        const distSq = dx * dx + dy * dy;

        if (distSq <= this.coreRadius * this.coreRadius)
        {
            if (teamId === TEAM_LEFT)
            {
                this.rightCoreHp -= this.computeCoreDamage(i);
            }
            else
            {
                this.leftCoreHp -= this.computeCoreDamage(i);
            }
            this.alive[i] = 0;
            this.target[i] = -1;
            return true;
        }

        return false;
    }

    private computeCoreDamage (i: number): number
    {
        const cap = this.capacity[i];
        return cap >= 100 ? Math.floor(cap * 2.0) : Math.floor(cap * 1.2);
    }

    private moveTowardEnemyCore (i: number, teamId: TeamId): void
    {
        const coreX = teamId === TEAM_LEFT ? this.rightCoreX : this.leftCoreX;
        const coreY = teamId === TEAM_LEFT ? this.rightCoreY : this.leftCoreY;
        this.moveByVector(i, coreX - this.x[i], coreY - this.y[i]);
    }

    private moveByVector (i: number, dx: number, dy: number): void
    {
        const distSq = dx * dx + dy * dy;
        if (distSq <= 0.0001)
        {
            return;
        }

        const dist = Math.sqrt(distSq);
        const step = Math.min(this.speed[i], dist);
        const inv = step / dist;
        this.x[i] = this.clampX(this.x[i] + dx * inv);
        this.y[i] = this.clampY(this.y[i] + dy * inv);
    }

    private computeDamage (attacker: number, defender: number): number
    {
        const raw = this.damage[attacker];
        const mitigated = raw - this.armor[defender];
        return mitigated > 1 ? mitigated : 1;
    }

    private applyPendingDamage (): void
    {
        for (let i = 0; i < this.entityCount; i++)
        {
            if (this.alive[i] === 0)
            {
                continue;
            }

            let dmg = this.pendingDamage[i];
            if (dmg <= 0)
            {
                continue;
            }

            if (this.shield[i] > 0)
            {
                const shieldAbsorb = Math.min(this.shield[i], dmg);
                this.shield[i] -= shieldAbsorb;
                dmg -= shieldAbsorb;
            }

            if (dmg > 0)
            {
                this.hp[i] -= dmg;
            }

            if (this.hp[i] <= 0)
            {
                this.alive[i] = 0;
                this.target[i] = -1;
            }
        }
    }

    private resolveVictory (): void
    {
        if (this.leftCoreHp <= 0 || this.rightCoreHp <= 0)
        {
            if (this.leftCoreHp > this.rightCoreHp)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            if (this.rightCoreHp > this.leftCoreHp)
            {
                this.finish(TEAM_RIGHT);
                return;
            }
            if (this.leftRemainingCapacity >= this.rightRemainingCapacity)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            this.finish(TEAM_RIGHT);
            return;
        }

        if (this.leftAliveCount === 0 && this.rightAliveCount === 0)
        {
            if (this.leftCoreHp >= this.rightCoreHp)
            {
                this.finish(TEAM_LEFT);
            }
            else
            {
                this.finish(TEAM_RIGHT);
            }
            return;
        }

        if (this.leftAliveCount === 0)
        {
            this.finish(TEAM_RIGHT);
            return;
        }
        if (this.rightAliveCount === 0)
        {
            this.finish(TEAM_LEFT);
            return;
        }

        if (this.tick >= this.maxTicks)
        {
            if (this.leftCoreHp > this.rightCoreHp)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            if (this.rightCoreHp > this.leftCoreHp)
            {
                this.finish(TEAM_RIGHT);
                return;
            }
            if (this.leftRemainingCapacity >= this.rightRemainingCapacity)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            this.finish(TEAM_RIGHT);
        }
    }

    private finish (teamId: TeamId): void
    {
        this.winner = teamId;
        this.isFinished = true;
    }

    private refreshAliveStats (): void
    {
        let leftAlive = 0;
        let rightAlive = 0;
        let leftCap = 0;
        let rightCap = 0;

        for (let i = 0; i < this.entityCount; i++)
        {
            if (this.alive[i] === 0)
            {
                continue;
            }
            if (this.team[i] === TEAM_LEFT)
            {
                leftAlive += 1;
                leftCap += this.capacity[i];
            }
            else
            {
                rightAlive += 1;
                rightCap += this.capacity[i];
            }
        }

        this.leftAliveCount = leftAlive;
        this.rightAliveCount = rightAlive;
        this.leftRemainingCapacity = leftCap;
        this.rightRemainingCapacity = rightCap;
    }

    private isTargetValid (attacker: number, targetId: number): boolean
    {
        if (targetId < 0 || targetId >= this.entityCount)
        {
            return false;
        }
        if (this.alive[targetId] === 0)
        {
            return false;
        }
        if (this.team[attacker] === this.team[targetId])
        {
            return false;
        }
        if (!this.canHit(attacker, targetId))
        {
            return false;
        }

        const dx = this.x[targetId] - this.x[attacker];
        const dy = this.y[targetId] - this.y[attacker];
        const distSq = dx * dx + dy * dy;
        const leash = Math.max(this.range[attacker] * 2.2, 120);
        return distSq <= leash * leash;
    }

    private canHit (attacker: number, defender: number): boolean
    {
        const mask = this.attackMask[attacker];
        if (this.layer[defender] === LAYER_GROUNDED)
        {
            return (mask & ATTACK_GROUNDED) !== 0;
        }
        return (mask & ATTACK_FLYING) !== 0;
    }

    private acquireTarget (attacker: number): number
    {
        const xi = this.x[attacker];
        const yi = this.y[attacker];
        const range = this.range[attacker];
        const rangeSq = range * range;
        const radiusBuckets = Math.ceil(range / this.bucketSize);
        const bx = this.toBucketX(xi);
        const by = this.toBucketY(yi);

        const enemyTeam = this.team[attacker] === TEAM_LEFT ? TEAM_RIGHT : TEAM_LEFT;
        const attackMask = this.attackMask[attacker];

        let bestInRange = -1;

        if ((attackMask & ATTACK_GROUNDED) !== 0)
        {
            const groundedGroup = enemyTeam * 2 + LAYER_GROUNDED;
            bestInRange = this.findBestInNeighborhood(attacker, groundedGroup, bx, by, radiusBuckets, rangeSq, xi, yi, bestInRange);
        }
        if ((attackMask & ATTACK_FLYING) !== 0)
        {
            const flyingGroup = enemyTeam * 2 + LAYER_FLYING;
            bestInRange = this.findBestInNeighborhood(attacker, flyingGroup, bx, by, radiusBuckets, rangeSq, xi, yi, bestInRange);
        }

        if (bestInRange >= 0)
        {
            return bestInRange;
        }

        let bestAny = -1;
        const anyRangeSq = Number.MAX_SAFE_INTEGER;
        if ((attackMask & ATTACK_GROUNDED) !== 0)
        {
            const groundedGroup = enemyTeam * 2 + LAYER_GROUNDED;
            bestAny = this.findBestGlobal(attacker, groundedGroup, anyRangeSq, xi, yi, bestAny);
        }
        if ((attackMask & ATTACK_FLYING) !== 0)
        {
            const flyingGroup = enemyTeam * 2 + LAYER_FLYING;
            bestAny = this.findBestGlobal(attacker, flyingGroup, anyRangeSq, xi, yi, bestAny);
        }

        return bestAny;
    }

    private findBestInNeighborhood (
        attacker: number,
        group: number,
        centerBx: number,
        centerBy: number,
        radiusBuckets: number,
        maxRangeSq: number,
        xi: number,
        yi: number,
        currentBest: number
    ): number
    {
        let best = currentBest;
        const minBy = Math.max(0, centerBy - radiusBuckets);
        const maxBy = Math.min(this.bucketRows - 1, centerBy + radiusBuckets);
        const minBx = Math.max(0, centerBx - radiusBuckets);
        const maxBx = Math.min(this.bucketCols - 1, centerBx + radiusBuckets);

        for (let by = minBy; by <= maxBy; by++)
        {
            for (let bx = minBx; bx <= maxBx; bx++)
            {
                const bucket = by * this.bucketCols + bx;
                let idx = this.bucketHeads[group * this.bucketCount + bucket];
                while (idx >= 0)
                {
                    if (this.isCandidateBetter(attacker, idx, maxRangeSq, xi, yi, best))
                    {
                        best = idx;
                    }
                    idx = this.nextInBucket[idx];
                }
            }
        }

        return best;
    }

    private findBestGlobal (
        attacker: number,
        group: number,
        maxRangeSq: number,
        xi: number,
        yi: number,
        currentBest: number
    ): number
    {
        let best = currentBest;
        for (let bucket = 0; bucket < this.bucketCount; bucket++)
        {
            let idx = this.bucketHeads[group * this.bucketCount + bucket];
            while (idx >= 0)
            {
                if (this.isCandidateBetter(attacker, idx, maxRangeSq, xi, yi, best))
                {
                    best = idx;
                }
                idx = this.nextInBucket[idx];
            }
        }
        return best;
    }

    private isCandidateBetter (
        attacker: number,
        candidate: number,
        maxRangeSq: number,
        xi: number,
        yi: number,
        currentBest: number
    ): boolean
    {
        if (this.alive[candidate] === 0)
        {
            return false;
        }
        if (this.team[candidate] === this.team[attacker])
        {
            return false;
        }
        if (!this.canHit(attacker, candidate))
        {
            return false;
        }

        const dx = this.x[candidate] - xi;
        const dy = this.y[candidate] - yi;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxRangeSq)
        {
            return false;
        }

        if (currentBest < 0)
        {
            return true;
        }

        const bestDx = this.x[currentBest] - xi;
        const bestDy = this.y[currentBest] - yi;
        const bestDistSq = bestDx * bestDx + bestDy * bestDy;
        if (distSq < bestDistSq)
        {
            return true;
        }
        if (distSq > bestDistSq)
        {
            return false;
        }

        const candHp = this.hp[candidate] + this.shield[candidate];
        const bestHp = this.hp[currentBest] + this.shield[currentBest];
        if (candHp < bestHp)
        {
            return true;
        }
        if (candHp > bestHp)
        {
            return false;
        }

        return this.spawnOrder[candidate] < this.spawnOrder[currentBest];
    }

    private toBucketX (value: number): number
    {
        const index = Math.floor(value / this.bucketSize);
        if (index < 0)
        {
            return 0;
        }
        if (index >= this.bucketCols)
        {
            return this.bucketCols - 1;
        }
        return index;
    }

    private toBucketY (value: number): number
    {
        const index = Math.floor(value / this.bucketSize);
        if (index < 0)
        {
            return 0;
        }
        if (index >= this.bucketRows)
        {
            return this.bucketRows - 1;
        }
        return index;
    }

    private toBucketIndex (x: number, y: number): number
    {
        return this.toBucketY(y) * this.bucketCols + this.toBucketX(x);
    }

    private clampX (value: number): number
    {
        if (value < this.basePadding)
        {
            return this.basePadding;
        }
        const maxValue = this.arenaWidth - this.basePadding;
        if (value > maxValue)
        {
            return maxValue;
        }
        return value;
    }

    private clampY (value: number): number
    {
        if (value < this.basePadding)
        {
            return this.basePadding;
        }
        const maxValue = this.arenaHeight - this.basePadding;
        if (value > maxValue)
        {
            return maxValue;
        }
        return value;
    }
}
