import {
    ATTACK_FLYING,
    ATTACK_GROUNDED,
    ATTACK_MEDIUM_DIRECT,
    EXPLOSION_EFFECT_LIFETIME_TICKS,
    EXPLOSION_VISUAL_RADIUS_MIN,
    EXPLOSION_VISUAL_RADIUS_SCALE,
    IMPACT_EXPLOSIVE,
    LAYER_FLYING,
    LAYER_GROUNDED,
    TEAM_LEFT,
    TEAM_RIGHT
} from '../simConstants';
import { SimContext, SimState, TeamId } from '../simTypes';

export class CombatSystem
{
    constructor (
        private readonly state: SimState,
        private readonly context: SimContext
    )
    {
    }

    stepExplosionEffects (): void
    {
        for (let i = 0; i < this.context.config.maxExplosionEffects; i++)
        {
            if (this.state.explosionActive[i] === 0)
            {
                continue;
            }
            const life = this.state.explosionLife[i];
            if (life <= 1)
            {
                this.state.explosionActive[i] = 0;
                this.state.explosionLife[i] = 0;
                continue;
            }
            this.state.explosionLife[i] = life - 1;
        }
    }

    applyCoreBreach (i: number, teamId: TeamId): boolean
    {
        const targetCoreX = teamId === TEAM_LEFT ? this.context.rightCoreX : this.context.leftCoreX;
        const targetCoreY = teamId === TEAM_LEFT ? this.context.rightCoreY : this.context.leftCoreY;
        const dx = this.state.x[i] - targetCoreX;
        const dy = this.state.y[i] - targetCoreY;
        const distSq = dx * dx + dy * dy;

        if (distSq <= this.context.config.coreRadius * this.context.config.coreRadius)
        {
            if (teamId === TEAM_LEFT)
            {
                this.state.rightCoreHp -= this.computeCoreDamage(i);
            }
            else
            {
                this.state.leftCoreHp -= this.computeCoreDamage(i);
            }
            this.state.alive[i] = 0;
            this.state.target[i] = -1;
            return true;
        }

        return false;
    }

    moveTowardEnemyCore (i: number, teamId: TeamId): void
    {
        const coreX = teamId === TEAM_LEFT ? this.context.rightCoreX : this.context.leftCoreX;
        const coreY = teamId === TEAM_LEFT ? this.context.rightCoreY : this.context.leftCoreY;
        this.moveByVector(i, coreX - this.state.x[i], coreY - this.state.y[i]);
    }

    moveByVector (i: number, dx: number, dy: number): void
    {
        const distSq = dx * dx + dy * dy;
        if (distSq <= 0.0001)
        {
            return;
        }

        const dist = Math.sqrt(distSq);
        const step = Math.min(this.state.speed[i], dist);
        const inv = step / dist;
        this.state.x[i] = this.context.clampX(this.state.x[i] + dx * inv);
        this.state.y[i] = this.context.clampY(this.state.y[i] + dy * inv);
    }

    resolveAttack (attacker: number, targetId: number): void
    {
        const attackerTeam = this.state.team[attacker] as TeamId;
        const targetX = this.state.x[targetId];
        const targetY = this.state.y[targetId];
        const rawDamage = this.state.damage[attacker];
        const isExplosive = this.state.impactMode[attacker] === IMPACT_EXPLOSIVE;

        const medium = this.state.attackMedium[attacker];
        if (medium === ATTACK_MEDIUM_DIRECT)
        {
            if (isExplosive)
            {
                this.applyExplosionImpactAtPoint(
                    attackerTeam,
                    this.state.attackMask[attacker],
                    targetX,
                    targetY,
                    rawDamage,
                    this.state.splashRadius[attacker]
                );
                return;
            }
            this.state.pendingDamage[targetId] += this.computeDamage(attacker, targetId);
            return;
        }

        const attackerX = this.state.x[attacker];
        const attackerY = this.state.y[attacker];

        this.spawnProjectile(
            attackerTeam,
            this.state.attackMask[attacker],
            attackerX,
            attackerY,
            targetX,
            targetY,
            rawDamage,
            isExplosive,
            this.state.splashRadius[attacker],
            this.state.hitRadius[attacker],
            this.state.projectileSpeed[attacker]
        );
    }

    stepProjectiles (): void
    {
        for (let i = 0; i < this.context.config.maxProjectiles; i++)
        {
            if (this.state.projectileActive[i] === 0)
            {
                continue;
            }

            this.state.projectilePrevX[i] = this.state.projectileX[i];
            this.state.projectilePrevY[i] = this.state.projectileY[i];

            const remaining = this.state.projectileRemaining[i];
            const step = this.state.projectileStep[i];
            if (remaining <= step)
            {
                const impactX = this.state.projectileAimX[i];
                const impactY = this.state.projectileAimY[i];
                this.state.projectileX[i] = impactX;
                this.state.projectileY[i] = impactY;

                const teamId = this.state.projectileTeam[i] as TeamId;
                if (this.state.projectileExplosive[i] !== 0)
                {
                    this.applyExplosionImpactAtPoint(
                        teamId,
                        this.state.projectileAttackMask[i],
                        impactX,
                        impactY,
                        this.state.projectileRawDamage[i],
                        this.state.projectileSplashRadius[i]
                    );
                }
                else
                {
                    this.applySingleImpactAtPoint(
                        teamId,
                        this.state.projectileAttackMask[i],
                        impactX,
                        impactY,
                        this.state.projectileRawDamage[i],
                        this.state.projectileHitRadius[i]
                    );
                }

                this.state.projectileActive[i] = 0;
                this.state.projectileRemaining[i] = 0;
                continue;
            }

            this.state.projectileX[i] += this.state.projectileVelX[i];
            this.state.projectileY[i] += this.state.projectileVelY[i];
            this.state.projectileRemaining[i] = remaining - step;
        }
    }

    private computeCoreDamage (i: number): number
    {
        const cap = this.state.capacity[i];
        return cap >= 100 ? Math.floor(cap * 2.0) : Math.floor(cap * 1.2);
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
        this.state.projectileActive[slot] = 1;
        this.state.projectileTeam[slot] = teamId;
        this.state.projectileAttackMask[slot] = attackMask;
        this.state.projectileExplosive[slot] = explosive ? 1 : 0;
        this.state.projectileX[slot] = startX;
        this.state.projectileY[slot] = startY;
        this.state.projectilePrevX[slot] = startX;
        this.state.projectilePrevY[slot] = startY;
        this.state.projectileAimX[slot] = aimX;
        this.state.projectileAimY[slot] = aimY;
        this.state.projectileVelX[slot] = dx * inv * speed;
        this.state.projectileVelY[slot] = dy * inv * speed;
        this.state.projectileStep[slot] = speed;
        this.state.projectileRemaining[slot] = dist;
        this.state.projectileRawDamage[slot] = rawDamage;
        this.state.projectileSplashRadius[slot] = splashRadius;
        this.state.projectileHitRadius[slot] = hitRadius;
    }

    private findFreeProjectileSlot (): number
    {
        for (let i = 0; i < this.context.config.maxProjectiles; i++)
        {
            if (this.state.projectileActive[i] === 0)
            {
                return i;
            }
        }
        return -1;
    }

    private spawnExplosionEffect (teamId: TeamId, x: number, y: number, splashRadius: number): void
    {
        const slot = this.findFreeExplosionSlot();
        if (slot < 0)
        {
            return;
        }

        this.state.explosionActive[slot] = 1;
        this.state.explosionTeam[slot] = teamId;
        this.state.explosionX[slot] = x;
        this.state.explosionY[slot] = y;
        this.state.explosionRadius[slot] = Math.max(
            EXPLOSION_VISUAL_RADIUS_MIN,
            splashRadius * EXPLOSION_VISUAL_RADIUS_SCALE
        );
        this.state.explosionLife[slot] = EXPLOSION_EFFECT_LIFETIME_TICKS;
        this.state.explosionLifeMax[slot] = EXPLOSION_EFFECT_LIFETIME_TICKS;
    }

    private findFreeExplosionSlot (): number
    {
        for (let i = 0; i < this.context.config.maxExplosionEffects; i++)
        {
            if (this.state.explosionActive[i] === 0)
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
        const radiusBuckets = Math.ceil(radius / this.context.config.bucketSize);
        const centerBx = this.context.toBucketX(impactX);
        const centerBy = this.context.toBucketY(impactY);
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
            this.state.pendingDamage[bestTarget] += this.computeMitigatedDamage(rawDamage, bestTarget);
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
        this.spawnExplosionEffect(attackerTeam, impactX, impactY, splashRadius);

        const enemyTeam = attackerTeam === TEAM_LEFT ? TEAM_RIGHT : TEAM_LEFT;
        const radius = Math.max(1, splashRadius);
        const radiusSq = radius * radius;
        const radiusBuckets = Math.ceil(radius / this.context.config.bucketSize);
        const centerBx = this.context.toBucketX(impactX);
        const centerBy = this.context.toBucketY(impactY);

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
        const maxBy = Math.min(this.context.config.bucketRows - 1, centerBy + radiusBuckets);
        const minBx = Math.max(0, centerBx - radiusBuckets);
        const maxBx = Math.min(this.context.config.bucketCols - 1, centerBx + radiusBuckets);

        for (let by = minBy; by <= maxBy; by++)
        {
            for (let bx = minBx; bx <= maxBx; bx++)
            {
                const bucket = by * this.context.config.bucketCols + bx;
                let idx = this.state.bucketHeads[group * this.context.config.bucketCount + bucket];
                while (idx >= 0)
                {
                    if (this.isImpactCandidateBetter(idx, radiusSq, impactX, impactY, best))
                    {
                        best = idx;
                    }
                    idx = this.state.nextInBucket[idx];
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
        if (this.state.alive[candidate] === 0)
        {
            return false;
        }

        const dx = this.state.x[candidate] - impactX;
        const dy = this.state.y[candidate] - impactY;
        const distSq = dx * dx + dy * dy;
        if (distSq > radiusSq)
        {
            return false;
        }

        if (currentBest < 0)
        {
            return true;
        }

        const bestDx = this.state.x[currentBest] - impactX;
        const bestDy = this.state.y[currentBest] - impactY;
        const bestDistSq = bestDx * bestDx + bestDy * bestDy;
        if (distSq < bestDistSq)
        {
            return true;
        }
        if (distSq > bestDistSq)
        {
            return false;
        }

        const candHp = this.state.hp[candidate] + this.state.shield[candidate];
        const bestHp = this.state.hp[currentBest] + this.state.shield[currentBest];
        if (candHp < bestHp)
        {
            return true;
        }
        if (candHp > bestHp)
        {
            return false;
        }

        return this.state.spawnOrder[candidate] < this.state.spawnOrder[currentBest];
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
        const maxBy = Math.min(this.context.config.bucketRows - 1, centerBy + radiusBuckets);
        const minBx = Math.max(0, centerBx - radiusBuckets);
        const maxBx = Math.min(this.context.config.bucketCols - 1, centerBx + radiusBuckets);

        for (let by = minBy; by <= maxBy; by++)
        {
            for (let bx = minBx; bx <= maxBx; bx++)
            {
                const bucket = by * this.context.config.bucketCols + bx;
                let idx = this.state.bucketHeads[group * this.context.config.bucketCount + bucket];
                while (idx >= 0)
                {
                    if (this.state.alive[idx] !== 0)
                    {
                        const dx = this.state.x[idx] - impactX;
                        const dy = this.state.y[idx] - impactY;
                        const distSq = dx * dx + dy * dy;
                        if (distSq <= radiusSq)
                        {
                            this.state.pendingDamage[idx] += this.computeMitigatedDamage(rawDamage, idx);
                        }
                    }
                    idx = this.state.nextInBucket[idx];
                }
            }
        }
    }

    private computeDamage (attacker: number, defender: number): number
    {
        return this.computeMitigatedDamage(this.state.damage[attacker], defender);
    }

    private computeMitigatedDamage (rawDamage: number, defender: number): number
    {
        const mitigated = rawDamage - this.state.armor[defender];
        return mitigated > 1 ? mitigated : 1;
    }
}
