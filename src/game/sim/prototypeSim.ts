import { ATTACK_MEDIUM_DIRECT, TEAM_LEFT, TEAM_RIGHT } from './simConstants';
import { resolveSimConfig } from './simConfig';
import { createSimContext } from './simContext';
import { createSimState, resetSimState } from './simState';
import {
    RaceId,
    ResetConfig,
    SimConfig,
    SimConfigResolved,
    SimContext,
    SimState,
    TeamId,
    UnitArchetype
} from './simTypes';
import { DEFAULT_RACE_PRESETS } from './unitArchetypeCatalog';
import { CombatSystem } from './systems/combatSystem';
import { DamageSystem } from './systems/damageSystem';
import { EngagementPressureSystem } from './systems/engagementPressureSystem';
import { SpatialBucketSystem } from './systems/spatialBucketSystem';
import { SpawnSystem } from './systems/spawnSystem';
import { TargetingSystem } from './systems/targetingSystem';
import { VictorySystem } from './systems/victorySystem';

export type { RaceId };

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

    readonly maxExplosionEffects: number;
    readonly explosionActive: Uint8Array;
    readonly explosionTeam: Uint8Array;
    readonly explosionX: Float32Array;
    readonly explosionY: Float32Array;
    readonly explosionRadius: Float32Array;
    readonly explosionLife: Uint8Array;
    readonly explosionLifeMax: Uint8Array;

    private readonly config: SimConfigResolved;
    private readonly context: SimContext;
    private readonly state: SimState;
    private readonly racePresets: Record<RaceId, UnitArchetype[]>;

    private readonly spawnSystem: SpawnSystem;
    private readonly spatialBucketSystem: SpatialBucketSystem;
    private readonly engagementPressureSystem: EngagementPressureSystem;
    private readonly targetingSystem: TargetingSystem;
    private readonly combatSystem: CombatSystem;
    private readonly damageSystem: DamageSystem;
    private readonly victorySystem: VictorySystem;

    constructor (config?: Partial<SimConfig>)
    {
        this.config = resolveSimConfig(config);
        this.context = createSimContext(this.config);
        this.state = createSimState(this.config);
        this.racePresets = config?.racePresets ?? DEFAULT_RACE_PRESETS;

        this.spawnSystem = new SpawnSystem(this.state, this.context, this.racePresets);
        this.spatialBucketSystem = new SpatialBucketSystem(this.state, this.context);
        this.engagementPressureSystem = new EngagementPressureSystem(this.state);
        this.targetingSystem = new TargetingSystem(this.state, this.context, this.engagementPressureSystem);
        this.combatSystem = new CombatSystem(this.state, this.context);
        this.damageSystem = new DamageSystem(this.state);
        this.victorySystem = new VictorySystem(this.state, this.context);

        this.stepMs = this.config.stepMs;
        this.arenaWidth = this.config.arenaWidth;
        this.arenaHeight = this.config.arenaHeight;
        this.basePadding = this.config.basePadding;
        this.coreRadius = this.config.coreRadius;

        this.alive = this.state.alive;
        this.team = this.state.team;
        this.layer = this.state.layer;
        this.x = this.state.x;
        this.y = this.state.y;
        this.hp = this.state.hp;
        this.shield = this.state.shield;
        this.armor = this.state.armor;
        this.damage = this.state.damage;
        this.range = this.state.range;
        this.speed = this.state.speed;
        this.attackMask = this.state.attackMask;
        this.cooldownTicks = this.state.cooldownTicks;
        this.nextAttackTick = this.state.nextAttackTick;
        this.target = this.state.target;
        this.capacity = this.state.capacity;
        this.renderSize = this.state.renderSize;
        this.spawnOrder = this.state.spawnOrder;
        this.attackMedium = this.state.attackMedium;
        this.impactMode = this.state.impactMode;
        this.splashRadius = this.state.splashRadius;
        this.projectileSpeed = this.state.projectileSpeed;
        this.hitRadius = this.state.hitRadius;

        this.maxProjectiles = this.config.maxProjectiles;
        this.projectileActive = this.state.projectileActive;
        this.projectileTeam = this.state.projectileTeam;
        this.projectileAttackMask = this.state.projectileAttackMask;
        this.projectileExplosive = this.state.projectileExplosive;
        this.projectileX = this.state.projectileX;
        this.projectileY = this.state.projectileY;
        this.projectilePrevX = this.state.projectilePrevX;
        this.projectilePrevY = this.state.projectilePrevY;
        this.projectileAimX = this.state.projectileAimX;
        this.projectileAimY = this.state.projectileAimY;
        this.projectileVelX = this.state.projectileVelX;
        this.projectileVelY = this.state.projectileVelY;
        this.projectileStep = this.state.projectileStep;
        this.projectileRemaining = this.state.projectileRemaining;
        this.projectileRawDamage = this.state.projectileRawDamage;
        this.projectileSplashRadius = this.state.projectileSplashRadius;
        this.projectileHitRadius = this.state.projectileHitRadius;

        this.maxExplosionEffects = this.config.maxExplosionEffects;
        this.explosionActive = this.state.explosionActive;
        this.explosionTeam = this.state.explosionTeam;
        this.explosionX = this.state.explosionX;
        this.explosionY = this.state.explosionY;
        this.explosionRadius = this.state.explosionRadius;
        this.explosionLife = this.state.explosionLife;
        this.explosionLifeMax = this.state.explosionLifeMax;
    }

    get entityCount (): number
    {
        return this.state.entityCount;
    }

    set entityCount (value: number)
    {
        this.state.entityCount = value;
    }

    get tick (): number
    {
        return this.state.tick;
    }

    set tick (value: number)
    {
        this.state.tick = value;
    }

    get leftCoreHp (): number
    {
        return this.state.leftCoreHp;
    }

    set leftCoreHp (value: number)
    {
        this.state.leftCoreHp = value;
    }

    get rightCoreHp (): number
    {
        return this.state.rightCoreHp;
    }

    set rightCoreHp (value: number)
    {
        this.state.rightCoreHp = value;
    }

    get leftAliveCount (): number
    {
        return this.state.leftAliveCount;
    }

    set leftAliveCount (value: number)
    {
        this.state.leftAliveCount = value;
    }

    get rightAliveCount (): number
    {
        return this.state.rightAliveCount;
    }

    set rightAliveCount (value: number)
    {
        this.state.rightAliveCount = value;
    }

    get leftRemainingCapacity (): number
    {
        return this.state.leftRemainingCapacity;
    }

    set leftRemainingCapacity (value: number)
    {
        this.state.leftRemainingCapacity = value;
    }

    get rightRemainingCapacity (): number
    {
        return this.state.rightRemainingCapacity;
    }

    set rightRemainingCapacity (value: number)
    {
        this.state.rightRemainingCapacity = value;
    }

    get winner (): -1 | 0 | 1
    {
        return this.state.winner;
    }

    set winner (value: -1 | 0 | 1)
    {
        this.state.winner = value;
    }

    get isFinished (): boolean
    {
        return this.state.isFinished;
    }

    set isFinished (value: boolean)
    {
        this.state.isFinished = value;
    }

    reset (cfg: ResetConfig): void
    {
        this.context.rng.setSeed(cfg.seed);
        resetSimState(this.state, this.config, cfg.leftRace, cfg.rightRace);

        this.spawnSystem.spawnRace(TEAM_LEFT, this.state.leftRace);
        this.spawnSystem.spawnRace(TEAM_RIGHT, this.state.rightRace);
        this.victorySystem.refreshAliveStats();
    }

    step (): void
    {
        if (this.state.isFinished)
        {
            return;
        }

        this.state.tick += 1;
        this.combatSystem.stepExplosionEffects();
        this.spatialBucketSystem.rebuildBuckets();
        this.state.pendingDamage.fill(0, 0, this.state.entityCount);
        this.engagementPressureSystem.seedFromCurrentTargets();

        for (let i = 0; i < this.state.entityCount; i++)
        {
            if (this.state.alive[i] === 0)
            {
                continue;
            }

            const teamId = this.state.team[i] as TeamId;
            const previousTarget = this.state.target[i];
            if (this.combatSystem.applyCoreBreach(i, teamId))
            {
                this.engagementPressureSystem.onAttackerRemoved(i, previousTarget);
                continue;
            }

            let targetId = this.state.target[i];
            if (!this.targetingSystem.isTargetValid(i, targetId))
            {
                const nextTarget = this.targetingSystem.acquireTarget(i);
                this.engagementPressureSystem.onTargetChanged(i, targetId, nextTarget);
                targetId = nextTarget;
                this.state.target[i] = nextTarget;
            }

            if (targetId >= 0)
            {
                const dx = this.state.x[targetId] - this.state.x[i];
                const dy = this.state.y[targetId] - this.state.y[i];
                const distSq = dx * dx + dy * dy;
                let effectiveRange = this.state.range[i];
                if (this.state.attackMedium[i] === ATTACK_MEDIUM_DIRECT)
                {
                    effectiveRange += this.state.bodyRadius[targetId];
                }
                const rangeSq = effectiveRange * effectiveRange;

                if (distSq <= rangeSq)
                {
                    if (this.state.tick >= this.state.nextAttackTick[i])
                    {
                        this.combatSystem.resolveAttack(i, targetId);
                        this.state.nextAttackTick[i] = this.state.tick + this.state.cooldownTicks[i];
                    }
                }
                else
                {
                    this.combatSystem.moveTowardPointWithSeparation(i, this.state.x[targetId], this.state.y[targetId]);
                }
            }
            else
            {
                this.combatSystem.moveTowardEnemyCoreWithSeparation(i, teamId);
            }
        }

        this.spatialBucketSystem.rebuildBuckets();
        this.combatSystem.stepProjectiles();
        this.damageSystem.applyPendingDamage();
        this.victorySystem.refreshAliveStats();
        this.victorySystem.resolveVictory();
    }

    debugDeterminismChecksum (): number
    {
        let hash = 2166136261 >>> 0;

        const mix = (value: number): void => {
            hash ^= value | 0;
            hash = Math.imul(hash, 16777619) >>> 0;
        };

        mix(this.state.tick);
        mix(this.state.entityCount);
        mix(this.state.leftCoreHp);
        mix(this.state.rightCoreHp);
        mix(this.state.leftAliveCount);
        mix(this.state.rightAliveCount);

        for (let i = 0; i < this.state.entityCount; i++)
        {
            if (this.state.alive[i] === 0)
            {
                continue;
            }
            mix(i);
            mix(this.state.team[i]);
            mix(this.state.layer[i]);
            mix((this.state.x[i] * 1000) | 0);
            mix((this.state.y[i] * 1000) | 0);
            mix((this.state.hp[i] * 1000) | 0);
            mix((this.state.shield[i] * 1000) | 0);
            mix(this.state.target[i]);
        }

        for (let i = 0; i < this.config.maxProjectiles; i++)
        {
            if (this.state.projectileActive[i] === 0)
            {
                continue;
            }
            mix(i);
            mix(this.state.projectileTeam[i]);
            mix((this.state.projectileX[i] * 1000) | 0);
            mix((this.state.projectileY[i] * 1000) | 0);
            mix((this.state.projectileRemaining[i] * 1000) | 0);
        }

        return hash >>> 0;
    }
}
