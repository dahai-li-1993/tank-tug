export type RaceId = 'beast' | 'alien' | 'human';

export type TeamId = 0 | 1;
export type AttackStyle = 'melee' | 'ranged';

export interface AttackProfile
{
    medium: 0 | 1;
    impactMode: 0 | 1;
    splashRadius: number;
    projectileSpeed: number;
    hitRadius: number;
}

export interface UnitArchetype
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

export interface SimConfig
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
    racePresets?: Record<RaceId, UnitArchetype[]>;
}

export interface SimConfigResolved
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
    bucketCols: number;
    bucketRows: number;
    bucketCount: number;
    maxProjectiles: number;
    maxExplosionEffects: number;
}

export interface ResetConfig
{
    seed: number;
    leftRace: RaceId;
    rightRace: RaceId;
}

export interface SimState
{
    alive: Uint8Array;
    team: Uint8Array;
    layer: Uint8Array;
    x: Float32Array;
    y: Float32Array;
    hp: Float32Array;
    shield: Float32Array;
    armor: Float32Array;
    damage: Float32Array;
    range: Float32Array;
    speed: Float32Array;
    attackMask: Uint8Array;
    cooldownTicks: Uint16Array;
    nextAttackTick: Int32Array;
    target: Int32Array;
    capacity: Float32Array;
    renderSize: Float32Array;
    spawnOrder: Int32Array;
    attackMedium: Uint8Array;
    impactMode: Uint8Array;
    splashRadius: Float32Array;
    projectileSpeed: Float32Array;
    hitRadius: Float32Array;

    projectileActive: Uint8Array;
    projectileTeam: Uint8Array;
    projectileAttackMask: Uint8Array;
    projectileExplosive: Uint8Array;
    projectileX: Float32Array;
    projectileY: Float32Array;
    projectilePrevX: Float32Array;
    projectilePrevY: Float32Array;
    projectileAimX: Float32Array;
    projectileAimY: Float32Array;
    projectileVelX: Float32Array;
    projectileVelY: Float32Array;
    projectileStep: Float32Array;
    projectileRemaining: Float32Array;
    projectileRawDamage: Float32Array;
    projectileSplashRadius: Float32Array;
    projectileHitRadius: Float32Array;

    explosionActive: Uint8Array;
    explosionTeam: Uint8Array;
    explosionX: Float32Array;
    explosionY: Float32Array;
    explosionRadius: Float32Array;
    explosionLife: Uint8Array;
    explosionLifeMax: Uint8Array;

    bucketHeads: Int32Array;
    nextInBucket: Int32Array;
    pendingDamage: Float32Array;

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

    spawnCounter: number;
    leftRace: RaceId;
    rightRace: RaceId;
}

export interface RandomSource
{
    setSeed: (seed: number) => void;
    nextFloat: () => number;
}

export interface SimContext
{
    config: SimConfigResolved;
    rng: RandomSource;
    leftCoreX: number;
    leftCoreY: number;
    rightCoreX: number;
    rightCoreY: number;
    toBucketX: (value: number) => number;
    toBucketY: (value: number) => number;
    toBucketIndex: (x: number, y: number) => number;
    clampX: (value: number) => number;
    clampY: (value: number) => number;
}
