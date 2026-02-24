import {
    ATTACK_GROUNDED,
    ATTACK_MEDIUM_DIRECT,
    ATTACK_MEDIUM_PROJECTILE,
    ATTACK_STYLE_MELEE,
    IMPACT_EXPLOSIVE,
    IMPACT_SINGLE,
    BODY_RADIUS_FROM_RENDER_SIZE,
    BODY_RADIUS_MAX,
    BODY_RADIUS_MIN,
    MELEE_LOCKED_RANGE,
    PROJECTILE_BASE_SPEED,
    PROJECTILE_RANGE_SPEED_FACTOR,
    PROJECTILE_SINGLE_HIT_RADIUS,
    RANGED_MIN_RANGE,
    TEAM_SPAWN_SIDE_FRACTION
} from '../simConstants';
import { AttackProfile, RaceId, SimContext, SimState, TeamId, UnitArchetype } from '../simTypes';

export class SpawnSystem
{
    constructor (
        private readonly state: SimState,
        private readonly context: SimContext,
        private readonly racePresets: Record<RaceId, UnitArchetype[]>
    )
    {
    }

    spawnRace (teamId: TeamId, race: RaceId): void
    {
        const preset = this.racePresets[race];
        const sideBandWidth = this.context.config.arenaWidth * TEAM_SPAWN_SIDE_FRACTION;
        const rawBandMinX = teamId === 0 ? 0 : this.context.config.arenaWidth - sideBandWidth;
        const rawBandMaxX = teamId === 0 ? sideBandWidth : this.context.config.arenaWidth;
        const bandMinX = this.context.clampX(rawBandMinX);
        const bandMaxX = this.context.clampX(rawBandMaxX);
        const bandXSpan = Math.max(1, bandMaxX - bandMinX);
        const yMin = this.context.config.basePadding + 8;
        const ySpan = Math.max(1, this.context.config.arenaHeight - (this.context.config.basePadding + 8) * 2);

        for (let index = 0; index < preset.length; index++)
        {
            const archetype = preset[index];
            this.validateArchetype(race, index, archetype);
            for (let n = 0; n < archetype.count; n++)
            {
                const spawnX = bandMinX + this.context.rng.nextFloat() * bandXSpan;
                const spawnY = yMin + this.context.rng.nextFloat() * ySpan;
                this.spawnUnit(
                    teamId,
                    archetype,
                    this.context.clampX(spawnX),
                    this.context.clampY(spawnY)
                );
            }
        }
    }

    private spawnUnit (teamId: TeamId, archetype: UnitArchetype, x: number, y: number): void
    {
        if (this.state.entityCount >= this.context.config.maxEntities)
        {
            return;
        }

        const attackProfile = this.deriveAttackProfile(archetype);
        const i = this.state.entityCount++;
        this.state.alive[i] = 1;
        this.state.team[i] = teamId;
        this.state.layer[i] = archetype.layer;
        this.state.x[i] = x;
        this.state.y[i] = y;
        this.state.hp[i] = archetype.hp;
        this.state.shield[i] = archetype.shield;
        this.state.armor[i] = archetype.armor;
        this.state.damage[i] = archetype.damage;
        this.state.range[i] = archetype.attackStyle === ATTACK_STYLE_MELEE
            ? MELEE_LOCKED_RANGE
            : archetype.range;
        this.state.speed[i] = archetype.speed;
        this.state.attackMask[i] = archetype.attackMask;
        this.state.cooldownTicks[i] = archetype.cooldownTicks;
        this.state.nextAttackTick[i] = Math.floor(this.context.rng.nextFloat() * archetype.cooldownTicks);
        this.state.target[i] = -1;
        this.state.capacity[i] = archetype.capacity;
        this.state.renderSize[i] = archetype.renderSize;
        this.state.bodyRadius[i] = this.computeBodyRadius(archetype.renderSize);
        this.state.spawnOrder[i] = this.state.spawnCounter++;
        this.state.attackMedium[i] = attackProfile.medium;
        this.state.impactMode[i] = attackProfile.impactMode;
        this.state.splashRadius[i] = attackProfile.splashRadius;
        this.state.projectileSpeed[i] = attackProfile.projectileSpeed;
        this.state.hitRadius[i] = attackProfile.hitRadius;
        this.state.nextInBucket[i] = -1;
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
            return;
        }

        if (archetype.range < RANGED_MIN_RANGE)
        {
            throw new Error(
                `Invalid archetype ${race}[${index}]: ranged units must author range >= ${RANGED_MIN_RANGE}.`
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

    private computeBodyRadius (renderSize: number): number
    {
        const raw = renderSize * BODY_RADIUS_FROM_RENDER_SIZE;
        if (raw < BODY_RADIUS_MIN)
        {
            return BODY_RADIUS_MIN;
        }
        if (raw > BODY_RADIUS_MAX)
        {
            return BODY_RADIUS_MAX;
        }
        return raw;
    }
}
