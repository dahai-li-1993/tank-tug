import { SimConfigResolved, SimState } from './simTypes';

export function createSimState (config: SimConfigResolved): SimState
{
    const state: SimState = {
        alive: new Uint8Array(config.maxEntities),
        team: new Uint8Array(config.maxEntities),
        layer: new Uint8Array(config.maxEntities),
        x: new Float32Array(config.maxEntities),
        y: new Float32Array(config.maxEntities),
        hp: new Float32Array(config.maxEntities),
        shield: new Float32Array(config.maxEntities),
        armor: new Float32Array(config.maxEntities),
        damage: new Float32Array(config.maxEntities),
        range: new Float32Array(config.maxEntities),
        speed: new Float32Array(config.maxEntities),
        attackMask: new Uint8Array(config.maxEntities),
        cooldownTicks: new Uint16Array(config.maxEntities),
        nextAttackTick: new Int32Array(config.maxEntities),
        target: new Int32Array(config.maxEntities),
        capacity: new Float32Array(config.maxEntities),
        renderSize: new Float32Array(config.maxEntities),
        bodyRadius: new Float32Array(config.maxEntities),
        spawnOrder: new Int32Array(config.maxEntities),
        attackMedium: new Uint8Array(config.maxEntities),
        impactMode: new Uint8Array(config.maxEntities),
        splashRadius: new Float32Array(config.maxEntities),
        projectileSpeed: new Float32Array(config.maxEntities),
        hitRadius: new Float32Array(config.maxEntities),

        projectileActive: new Uint8Array(config.maxProjectiles),
        projectileTeam: new Uint8Array(config.maxProjectiles),
        projectileAttackMask: new Uint8Array(config.maxProjectiles),
        projectileExplosive: new Uint8Array(config.maxProjectiles),
        projectileX: new Float32Array(config.maxProjectiles),
        projectileY: new Float32Array(config.maxProjectiles),
        projectilePrevX: new Float32Array(config.maxProjectiles),
        projectilePrevY: new Float32Array(config.maxProjectiles),
        projectileAimX: new Float32Array(config.maxProjectiles),
        projectileAimY: new Float32Array(config.maxProjectiles),
        projectileVelX: new Float32Array(config.maxProjectiles),
        projectileVelY: new Float32Array(config.maxProjectiles),
        projectileStep: new Float32Array(config.maxProjectiles),
        projectileRemaining: new Float32Array(config.maxProjectiles),
        projectileRawDamage: new Float32Array(config.maxProjectiles),
        projectileSplashRadius: new Float32Array(config.maxProjectiles),
        projectileHitRadius: new Float32Array(config.maxProjectiles),

        explosionActive: new Uint8Array(config.maxExplosionEffects),
        explosionTeam: new Uint8Array(config.maxExplosionEffects),
        explosionX: new Float32Array(config.maxExplosionEffects),
        explosionY: new Float32Array(config.maxExplosionEffects),
        explosionRadius: new Float32Array(config.maxExplosionEffects),
        explosionLife: new Uint8Array(config.maxExplosionEffects),
        explosionLifeMax: new Uint8Array(config.maxExplosionEffects),

        bucketHeads: new Int32Array(config.bucketCount * 4),
        nextInBucket: new Int32Array(config.maxEntities),
        pendingDamage: new Float32Array(config.maxEntities),
        targetMeleePressure: new Uint16Array(config.maxEntities),

        entityCount: 0,
        tick: 0,
        leftCoreHp: config.coreHpStart,
        rightCoreHp: config.coreHpStart,
        leftAliveCount: 0,
        rightAliveCount: 0,
        leftRemainingCapacity: 0,
        rightRemainingCapacity: 0,
        winner: -1,
        isFinished: false,

        spawnCounter: 0,
        leftRace: 'human',
        rightRace: 'beast'
    };

    state.target.fill(-1);
    state.nextInBucket.fill(-1);

    return state;
}

export function resetSimState (
    state: SimState,
    config: SimConfigResolved,
    leftRace: SimState['leftRace'],
    rightRace: SimState['rightRace']
): void
{
    state.leftRace = leftRace;
    state.rightRace = rightRace;

    state.entityCount = 0;
    state.spawnCounter = 0;
    state.tick = 0;
    state.leftCoreHp = config.coreHpStart;
    state.rightCoreHp = config.coreHpStart;
    state.winner = -1;
    state.isFinished = false;
    state.leftAliveCount = 0;
    state.rightAliveCount = 0;
    state.leftRemainingCapacity = 0;
    state.rightRemainingCapacity = 0;

    state.alive.fill(0);
    state.target.fill(-1);
    state.nextAttackTick.fill(0);
    state.nextInBucket.fill(-1);
    state.projectileActive.fill(0);
    state.projectileRemaining.fill(0);
    state.explosionActive.fill(0);
    state.explosionLife.fill(0);
    state.targetMeleePressure.fill(0);
}
