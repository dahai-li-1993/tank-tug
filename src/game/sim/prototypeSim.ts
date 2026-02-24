import unitArchetypesCsv from './unitArchetypes.csv?raw';

export type RaceId = 'beast' | 'alien' | 'human';

const TEAM_LEFT = 0;
const TEAM_RIGHT = 1;

const LAYER_GROUNDED = 0;
const LAYER_FLYING = 1;

const ATTACK_GROUNDED = 1;
const ATTACK_FLYING = 2;
const ATTACK_BOTH = ATTACK_GROUNDED | ATTACK_FLYING;
const UNIFORM_UNIT_SPEED = 2.2;
const ATTACK_MEDIUM_DIRECT: 0 = 0;
const ATTACK_MEDIUM_PROJECTILE: 1 = 1;
const IMPACT_SINGLE: 0 = 0;
const IMPACT_EXPLOSIVE: 1 = 1;
const ATTACK_STYLE_MELEE = 'melee';
const ATTACK_STYLE_RANGED = 'ranged';
const MELEE_LOCKED_RANGE = 20;
const RANGED_MIN_RANGE = 40;
const RANGED_MAX_RANGE = 220;
const PROJECTILE_BASE_SPEED = 3.4;
const PROJECTILE_RANGE_SPEED_FACTOR = 0.06;
const PROJECTILE_SINGLE_HIT_RADIUS = 8;
const MAX_PROJECTILES = 7000;

type TeamId = 0 | 1;
type AttackStyle = 'melee' | 'ranged';

interface AttackProfile
{
    medium: 0 | 1;
    impactMode: 0 | 1;
    splashRadius: number;
    projectileSpeed: number;
    hitRadius: number;
}

interface UnitArchetype
{
    unitKey: string;
    layer: 0 | 1;
    hp: number;
    shield: number;
    armor: number;
    damage: number;
    cooldownTicks: number;
    attackStyle: AttackStyle;
    range: number;
    speed: number;
    attackMask: number;
    explosiveRadius: number;
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

const UNIT_ARCHETYPE_CSV_HEADERS = [
    'unitKey',
    'race',
    'layer',
    'hp',
    'shield',
    'armor',
    'damage',
    'cooldownTicks',
    'attackStyle',
    'range',
    'speed',
    'attackMask',
    'renderSize',
    'capacity',
    'count',
    'explosiveRadius'
];

const RACE_PRESETS = parseUnitArchetypesCsv(unitArchetypesCsv);

function parseUnitArchetypesCsv (csv: string): Record<RaceId, UnitArchetype[]>
{
    const rows = csv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'));

    if (rows.length < 2)
    {
        throw new Error('Unit archetype CSV is empty or missing data rows.');
    }

    const header = rows[0].split(',').map((cell) => cell.trim());
    if (header.length !== UNIT_ARCHETYPE_CSV_HEADERS.length)
    {
        throw new Error('Unit archetype CSV header has unexpected column count.');
    }
    for (let i = 0; i < UNIT_ARCHETYPE_CSV_HEADERS.length; i++)
    {
        if (header[i] !== UNIT_ARCHETYPE_CSV_HEADERS[i])
        {
            throw new Error(`Unit archetype CSV header mismatch at column ${i + 1}.`);
        }
    }

    const presets: Record<RaceId, UnitArchetype[]> = {
        beast: [],
        alien: [],
        human: []
    };
    const seenKeys = new Set<string>();

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++)
    {
        const rowNumber = rowIndex + 1;
        const cells = rows[rowIndex].split(',').map((cell) => cell.trim());
        if (cells.length !== UNIT_ARCHETYPE_CSV_HEADERS.length)
        {
            throw new Error(`Unit archetype CSV row ${rowNumber} has unexpected column count.`);
        }

        const unitKey = parseUnitKey(cells[0], rowNumber);
        if (seenKeys.has(unitKey))
        {
            throw new Error(`Duplicate unitKey '${unitKey}' at CSV row ${rowNumber}.`);
        }
        seenKeys.add(unitKey);

        const race = parseRaceId(cells[1], rowNumber);
        const archetype: UnitArchetype = {
            unitKey,
            layer: parseLayerId(cells[2], rowNumber),
            hp: parseCsvNumber('hp', cells[3], rowNumber),
            shield: parseCsvNumber('shield', cells[4], rowNumber),
            armor: parseCsvNumber('armor', cells[5], rowNumber),
            damage: parseCsvNumber('damage', cells[6], rowNumber),
            cooldownTicks: parseCsvNumber('cooldownTicks', cells[7], rowNumber),
            attackStyle: parseAttackStyle(cells[8], rowNumber),
            range: parseCsvNumber('range', cells[9], rowNumber),
            speed: parseCsvNumber('speed', cells[10], rowNumber),
            attackMask: parseAttackMask(cells[11], rowNumber),
            renderSize: parseCsvNumber('renderSize', cells[12], rowNumber),
            capacity: parseCsvNumber('capacity', cells[13], rowNumber),
            count: parseCsvNumber('count', cells[14], rowNumber),
            explosiveRadius: parseCsvNumber('explosiveRadius', cells[15], rowNumber)
        };

        presets[race].push(archetype);
    }

    return presets;
}

function parseUnitKey (value: string, rowNumber: number): string
{
    if (value.length === 0)
    {
        throw new Error(`Missing unitKey at CSV row ${rowNumber}.`);
    }
    return value;
}

function parseRaceId (value: string, rowNumber: number): RaceId
{
    if (value === 'beast' || value === 'alien' || value === 'human')
    {
        return value;
    }
    throw new Error(`Invalid race '${value}' at CSV row ${rowNumber}.`);
}

function parseLayerId (value: string, rowNumber: number): 0 | 1
{
    if (value === 'grounded')
    {
        return LAYER_GROUNDED;
    }
    if (value === 'flying')
    {
        return LAYER_FLYING;
    }
    throw new Error(`Invalid layer '${value}' at CSV row ${rowNumber}.`);
}

function parseAttackStyle (value: string, rowNumber: number): AttackStyle
{
    if (value === ATTACK_STYLE_MELEE || value === ATTACK_STYLE_RANGED)
    {
        return value;
    }
    throw new Error(`Invalid attackStyle '${value}' at CSV row ${rowNumber}.`);
}

function parseAttackMask (value: string, rowNumber: number): number
{
    if (value === 'grounded')
    {
        return ATTACK_GROUNDED;
    }
    if (value === 'flying')
    {
        return ATTACK_FLYING;
    }
    if (value === 'both')
    {
        return ATTACK_BOTH;
    }
    throw new Error(`Invalid attackMask '${value}' at CSV row ${rowNumber}.`);
}

function parseCsvNumber (field: string, value: string, rowNumber: number): number
{
    if (value.length === 0)
    {
        throw new Error(`Missing numeric value for '${field}' at CSV row ${rowNumber}.`);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed))
    {
        throw new Error(`Invalid numeric value for '${field}' at CSV row ${rowNumber}.`);
    }
    return parsed;
}

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
    readonly attackMedium: Uint8Array;
    readonly impactMode: Uint8Array;
    readonly splashRadius: Float32Array;
    readonly projectileSpeed: Float32Array;
    readonly hitRadius: Float32Array;

    readonly maxProjectiles: number;
    readonly projectileActive: Uint8Array;
    readonly projectileTeam: Uint8Array;
    readonly projectileAttackMask: Uint8Array;
    readonly projectileExplosive: Uint8Array;
    readonly projectileX: Float32Array;
    readonly projectileY: Float32Array;
    readonly projectilePrevX: Float32Array;
    readonly projectilePrevY: Float32Array;
    readonly projectileAimX: Float32Array;
    readonly projectileAimY: Float32Array;
    readonly projectileVelX: Float32Array;
    readonly projectileVelY: Float32Array;
    readonly projectileStep: Float32Array;
    readonly projectileRemaining: Float32Array;
    readonly projectileRawDamage: Float32Array;
    readonly projectileSplashRadius: Float32Array;
    readonly projectileHitRadius: Float32Array;

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
        this.attackMedium = new Uint8Array(this.maxEntities);
        this.impactMode = new Uint8Array(this.maxEntities);
        this.splashRadius = new Float32Array(this.maxEntities);
        this.projectileSpeed = new Float32Array(this.maxEntities);
        this.hitRadius = new Float32Array(this.maxEntities);

        this.maxProjectiles = MAX_PROJECTILES;
        this.projectileActive = new Uint8Array(this.maxProjectiles);
        this.projectileTeam = new Uint8Array(this.maxProjectiles);
        this.projectileAttackMask = new Uint8Array(this.maxProjectiles);
        this.projectileExplosive = new Uint8Array(this.maxProjectiles);
        this.projectileX = new Float32Array(this.maxProjectiles);
        this.projectileY = new Float32Array(this.maxProjectiles);
        this.projectilePrevX = new Float32Array(this.maxProjectiles);
        this.projectilePrevY = new Float32Array(this.maxProjectiles);
        this.projectileAimX = new Float32Array(this.maxProjectiles);
        this.projectileAimY = new Float32Array(this.maxProjectiles);
        this.projectileVelX = new Float32Array(this.maxProjectiles);
        this.projectileVelY = new Float32Array(this.maxProjectiles);
        this.projectileStep = new Float32Array(this.maxProjectiles);
        this.projectileRemaining = new Float32Array(this.maxProjectiles);
        this.projectileRawDamage = new Float32Array(this.maxProjectiles);
        this.projectileSplashRadius = new Float32Array(this.maxProjectiles);
        this.projectileHitRadius = new Float32Array(this.maxProjectiles);

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
        this.projectileActive.fill(0);
        this.projectileRemaining.fill(0);

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
                        this.resolveAttack(i, targetId);
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

        this.rebuildBuckets();
        this.stepProjectiles();
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

        for (let index = 0; index < preset.length; index++)
        {
            const archetype = preset[index];
            this.validateArchetype(race, index, archetype);
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

        const attackProfile = this.deriveAttackProfile(archetype);
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
        this.range[i] = archetype.attackStyle === ATTACK_STYLE_MELEE
            ? MELEE_LOCKED_RANGE
            : archetype.range;
        this.speed[i] = UNIFORM_UNIT_SPEED;
        this.attackMask[i] = archetype.attackMask;
        this.cooldownTicks[i] = archetype.cooldownTicks;
        this.nextAttackTick[i] = Math.floor(this.rng.nextFloat() * archetype.cooldownTicks);
        this.target[i] = -1;
        this.capacity[i] = archetype.capacity;
        this.renderSize[i] = archetype.renderSize;
        this.spawnOrder[i] = this.spawnCounter++;
        this.attackMedium[i] = attackProfile.medium;
        this.impactMode[i] = attackProfile.impactMode;
        this.splashRadius[i] = attackProfile.splashRadius;
        this.projectileSpeed[i] = attackProfile.projectileSpeed;
        this.hitRadius[i] = attackProfile.hitRadius;
        this.nextInBucket[i] = -1;
    }

    private validateArchetype (race: RaceId, index: number, archetype: UnitArchetype): void
    {
        if (archetype.explosiveRadius < 0)
        {
            throw new Error(
                `Invalid archetype ${race}[${index}]: explosiveRadius must be >= 0.`
            );
        }

        if (archetype.attackStyle === ATTACK_STYLE_MELEE)
        {
            if (archetype.attackMask !== ATTACK_GROUNDED)
            {
                throw new Error(
                    `Invalid archetype ${race}[${index}]: melee units must use ATTACK_GROUNDED mask.`
                );
            }
            if (archetype.range !== MELEE_LOCKED_RANGE)
            {
                throw new Error(
                    `Invalid archetype ${race}[${index}]: melee units must author range=${MELEE_LOCKED_RANGE}.`
                );
            }
            return;
        }

        if (archetype.range < RANGED_MIN_RANGE || archetype.range > RANGED_MAX_RANGE)
        {
            throw new Error(
                `Invalid archetype ${race}[${index}]: ranged units must author range within ${RANGED_MIN_RANGE}..${RANGED_MAX_RANGE}.`
            );
        }
    }

    private deriveAttackProfile (archetype: UnitArchetype): AttackProfile
    {
        if (archetype.attackStyle === ATTACK_STYLE_MELEE)
        {
            const impactMode = archetype.explosiveRadius > 0 ? IMPACT_EXPLOSIVE : IMPACT_SINGLE;
            return {
                medium: ATTACK_MEDIUM_DIRECT,
                impactMode,
                splashRadius: archetype.explosiveRadius,
                projectileSpeed: 0,
                hitRadius: 0
            };
        }

        const medium = ATTACK_MEDIUM_PROJECTILE;
        const impactMode = archetype.explosiveRadius > 0 ? IMPACT_EXPLOSIVE : IMPACT_SINGLE;

        return {
            medium,
            impactMode,
            splashRadius: archetype.explosiveRadius,
            projectileSpeed: PROJECTILE_BASE_SPEED + archetype.range * PROJECTILE_RANGE_SPEED_FACTOR,
            hitRadius: Math.max(PROJECTILE_SINGLE_HIT_RADIUS, archetype.renderSize * 1.2)
        };
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

    private resolveAttack (attacker: number, targetId: number): void
    {
        const attackerTeam = this.team[attacker] as TeamId;
        const targetX = this.x[targetId];
        const targetY = this.y[targetId];
        const rawDamage = this.damage[attacker];
        const isExplosive = this.impactMode[attacker] === IMPACT_EXPLOSIVE;

        const medium = this.attackMedium[attacker];
        if (medium === ATTACK_MEDIUM_DIRECT)
        {
            if (isExplosive)
            {
                this.applyExplosionImpactAtPoint(
                    attackerTeam,
                    this.attackMask[attacker],
                    targetX,
                    targetY,
                    rawDamage,
                    this.splashRadius[attacker]
                );
                return;
            }
            this.pendingDamage[targetId] += this.computeDamage(attacker, targetId);
            return;
        }

        const attackerX = this.x[attacker];
        const attackerY = this.y[attacker];

        this.spawnProjectile(
            attackerTeam,
            this.attackMask[attacker],
            attackerX,
            attackerY,
            targetX,
            targetY,
            rawDamage,
            isExplosive,
            this.splashRadius[attacker],
            this.hitRadius[attacker],
            this.projectileSpeed[attacker]
        );
    }

    private spawnProjectile (
        teamId: TeamId,
        attackMask: number,
        startX: number,
        startY: number,
        aimX: number,
        aimY: number,
        rawDamage: number,
        explosive: boolean,
        splashRadius: number,
        hitRadius: number,
        stepSpeed: number
    ): void
    {
        const dx = aimX - startX;
        const dy = aimY - startY;
        const distSq = dx * dx + dy * dy;
        if (distSq <= 0.0001)
        {
            if (explosive)
            {
                this.applyExplosionImpactAtPoint(teamId, attackMask, aimX, aimY, rawDamage, splashRadius);
            }
            else
            {
                this.applySingleImpactAtPoint(teamId, attackMask, aimX, aimY, rawDamage, hitRadius);
            }
            return;
        }

        const slot = this.findFreeProjectileSlot();
        if (slot < 0)
        {
            return;
        }

        const dist = Math.sqrt(distSq);
        const inv = 1 / dist;
        const speed = Math.max(0.1, stepSpeed);
        this.projectileActive[slot] = 1;
        this.projectileTeam[slot] = teamId;
        this.projectileAttackMask[slot] = attackMask;
        this.projectileExplosive[slot] = explosive ? 1 : 0;
        this.projectileX[slot] = startX;
        this.projectileY[slot] = startY;
        this.projectilePrevX[slot] = startX;
        this.projectilePrevY[slot] = startY;
        this.projectileAimX[slot] = aimX;
        this.projectileAimY[slot] = aimY;
        this.projectileVelX[slot] = dx * inv * speed;
        this.projectileVelY[slot] = dy * inv * speed;
        this.projectileStep[slot] = speed;
        this.projectileRemaining[slot] = dist;
        this.projectileRawDamage[slot] = rawDamage;
        this.projectileSplashRadius[slot] = splashRadius;
        this.projectileHitRadius[slot] = hitRadius;
    }

    private stepProjectiles (): void
    {
        for (let i = 0; i < this.maxProjectiles; i++)
        {
            if (this.projectileActive[i] === 0)
            {
                continue;
            }

            this.projectilePrevX[i] = this.projectileX[i];
            this.projectilePrevY[i] = this.projectileY[i];

            const remaining = this.projectileRemaining[i];
            const step = this.projectileStep[i];
            if (remaining <= step)
            {
                const impactX = this.projectileAimX[i];
                const impactY = this.projectileAimY[i];
                this.projectileX[i] = impactX;
                this.projectileY[i] = impactY;

                const teamId = this.projectileTeam[i] as TeamId;
                if (this.projectileExplosive[i] !== 0)
                {
                    this.applyExplosionImpactAtPoint(
                        teamId,
                        this.projectileAttackMask[i],
                        impactX,
                        impactY,
                        this.projectileRawDamage[i],
                        this.projectileSplashRadius[i]
                    );
                }
                else
                {
                    this.applySingleImpactAtPoint(
                        teamId,
                        this.projectileAttackMask[i],
                        impactX,
                        impactY,
                        this.projectileRawDamage[i],
                        this.projectileHitRadius[i]
                    );
                }

                this.projectileActive[i] = 0;
                this.projectileRemaining[i] = 0;
                continue;
            }

            this.projectileX[i] += this.projectileVelX[i];
            this.projectileY[i] += this.projectileVelY[i];
            this.projectileRemaining[i] = remaining - step;
        }
    }

    private findFreeProjectileSlot (): number
    {
        for (let i = 0; i < this.maxProjectiles; i++)
        {
            if (this.projectileActive[i] === 0)
            {
                return i;
            }
        }
        return -1;
    }

    private applySingleImpactAtPoint (
        attackerTeam: TeamId,
        attackMask: number,
        impactX: number,
        impactY: number,
        rawDamage: number,
        hitRadius: number
    ): void
    {
        const enemyTeam = attackerTeam === TEAM_LEFT ? TEAM_RIGHT : TEAM_LEFT;
        const radius = Math.max(1, hitRadius);
        const radiusSq = radius * radius;
        const radiusBuckets = Math.ceil(radius / this.bucketSize);
        const centerBx = this.toBucketX(impactX);
        const centerBy = this.toBucketY(impactY);
        let bestTarget = -1;

        if ((attackMask & ATTACK_GROUNDED) !== 0)
        {
            const group = enemyTeam * 2 + LAYER_GROUNDED;
            bestTarget = this.findBestImpactTargetInNeighborhood(
                group,
                centerBx,
                centerBy,
                radiusBuckets,
                radiusSq,
                impactX,
                impactY,
                bestTarget
            );
        }
        if ((attackMask & ATTACK_FLYING) !== 0)
        {
            const group = enemyTeam * 2 + LAYER_FLYING;
            bestTarget = this.findBestImpactTargetInNeighborhood(
                group,
                centerBx,
                centerBy,
                radiusBuckets,
                radiusSq,
                impactX,
                impactY,
                bestTarget
            );
        }

        if (bestTarget >= 0)
        {
            this.pendingDamage[bestTarget] += this.computeMitigatedDamage(rawDamage, bestTarget);
        }
    }

    private applyExplosionImpactAtPoint (
        attackerTeam: TeamId,
        attackMask: number,
        impactX: number,
        impactY: number,
        rawDamage: number,
        splashRadius: number
    ): void
    {
        const enemyTeam = attackerTeam === TEAM_LEFT ? TEAM_RIGHT : TEAM_LEFT;
        const radius = Math.max(1, splashRadius);
        const radiusSq = radius * radius;
        const radiusBuckets = Math.ceil(radius / this.bucketSize);
        const centerBx = this.toBucketX(impactX);
        const centerBy = this.toBucketY(impactY);

        if ((attackMask & ATTACK_GROUNDED) !== 0)
        {
            const group = enemyTeam * 2 + LAYER_GROUNDED;
            this.applyExplosionForGroup(group, centerBx, centerBy, radiusBuckets, radiusSq, impactX, impactY, rawDamage);
        }
        if ((attackMask & ATTACK_FLYING) !== 0)
        {
            const group = enemyTeam * 2 + LAYER_FLYING;
            this.applyExplosionForGroup(group, centerBx, centerBy, radiusBuckets, radiusSq, impactX, impactY, rawDamage);
        }
    }

    private findBestImpactTargetInNeighborhood (
        group: number,
        centerBx: number,
        centerBy: number,
        radiusBuckets: number,
        radiusSq: number,
        impactX: number,
        impactY: number,
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
                    if (this.isImpactCandidateBetter(idx, radiusSq, impactX, impactY, best))
                    {
                        best = idx;
                    }
                    idx = this.nextInBucket[idx];
                }
            }
        }

        return best;
    }

    private isImpactCandidateBetter (
        candidate: number,
        radiusSq: number,
        impactX: number,
        impactY: number,
        currentBest: number
    ): boolean
    {
        if (this.alive[candidate] === 0)
        {
            return false;
        }

        const dx = this.x[candidate] - impactX;
        const dy = this.y[candidate] - impactY;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq)
        {
            return false;
        }

        if (currentBest < 0)
        {
            return true;
        }

        const bestDx = this.x[currentBest] - impactX;
        const bestDy = this.y[currentBest] - impactY;
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

    private applyExplosionForGroup (
        group: number,
        centerBx: number,
        centerBy: number,
        radiusBuckets: number,
        radiusSq: number,
        impactX: number,
        impactY: number,
        rawDamage: number
    ): void
    {
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
                    if (this.alive[idx] !== 0)
                    {
                        const dx = this.x[idx] - impactX;
                        const dy = this.y[idx] - impactY;
                        const distSq = dx * dx + dy * dy;
                        if (distSq <= radiusSq)
                        {
                            this.pendingDamage[idx] += this.computeMitigatedDamage(rawDamage, idx);
                        }
                    }
                    idx = this.nextInBucket[idx];
                }
            }
        }
    }

    private computeDamage (attacker: number, defender: number): number
    {
        return this.computeMitigatedDamage(this.damage[attacker], defender);
    }

    private computeMitigatedDamage (rawDamage: number, defender: number): number
    {
        const mitigated = rawDamage - this.armor[defender];
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
