import {
    ATTACK_FLYING,
    ATTACK_GROUNDED,
    ATTACK_MEDIUM_DIRECT,
    LAYER_FLYING,
    LAYER_GROUNDED,
    LOCAL_SEPARATION_SLOT_PADDING,
    MELEE_TARGET_SATURATION_PENALTY_DISTANCE,
    MELEE_TARGET_SOFT_CAP_MAX,
    TEAM_LEFT,
    TEAM_RIGHT
} from '../simConstants';
import { SimContext, SimState } from '../simTypes';
import { EngagementPressureSystem } from './engagementPressureSystem';

export class TargetingSystem
{
    constructor (
        private readonly state: SimState,
        private readonly context: SimContext,
        private readonly engagementPressureSystem: EngagementPressureSystem
    )
    {
    }

    isTargetValid (attacker: number, targetId: number): boolean
    {
        if (targetId < 0 || targetId >= this.state.entityCount)
        {
            return false;
        }
        if (this.state.alive[targetId] === 0)
        {
            return false;
        }
        if (this.state.team[attacker] === this.state.team[targetId])
        {
            return false;
        }
        if (!this.canHit(attacker, targetId))
        {
            return false;
        }

        const dx = this.state.x[targetId] - this.state.x[attacker];
        const dy = this.state.y[targetId] - this.state.y[attacker];
        const distSq = dx * dx + dy * dy;
        const leash = Math.max(this.state.range[attacker] * 2.2, 120);
        return distSq <= leash * leash;
    }

    acquireTarget (attacker: number): number
    {
        const xi = this.state.x[attacker];
        const yi = this.state.y[attacker];
        const range = this.state.range[attacker];
        const rangeSq = range * range;
        const radiusBuckets = Math.ceil(range / this.context.config.bucketSize);
        const bx = this.context.toBucketX(xi);
        const by = this.context.toBucketY(yi);

        const enemyTeam = this.state.team[attacker] === TEAM_LEFT ? TEAM_RIGHT : TEAM_LEFT;
        const attackMask = this.state.attackMask[attacker];

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

    private canHit (attacker: number, defender: number): boolean
    {
        const mask = this.state.attackMask[attacker];
        if (this.state.layer[defender] === LAYER_GROUNDED)
        {
            return (mask & ATTACK_GROUNDED) !== 0;
        }
        return (mask & ATTACK_FLYING) !== 0;
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
                    if (this.isCandidateBetter(attacker, idx, maxRangeSq, xi, yi, best))
                    {
                        best = idx;
                    }
                    idx = this.state.nextInBucket[idx];
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
        for (let bucket = 0; bucket < this.context.config.bucketCount; bucket++)
        {
            let idx = this.state.bucketHeads[group * this.context.config.bucketCount + bucket];
            while (idx >= 0)
            {
                if (this.isCandidateBetter(attacker, idx, maxRangeSq, xi, yi, best))
                {
                    best = idx;
                }
                idx = this.state.nextInBucket[idx];
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
        if (this.state.alive[candidate] === 0)
        {
            return false;
        }
        if (this.state.team[candidate] === this.state.team[attacker])
        {
            return false;
        }

        if (!this.canHit(attacker, candidate))
        {
            return false;
        }

        const dx = this.state.x[candidate] - xi;
        const dy = this.state.y[candidate] - yi;
        const distSq = dx * dx + dy * dy;
        if (distSq > maxRangeSq)
        {
            return false;
        }

        if (currentBest < 0)
        {
            return true;
        }

        const candidateScore = this.computeCandidateScore(attacker, candidate, distSq);
        const bestDx = this.state.x[currentBest] - xi;
        const bestDy = this.state.y[currentBest] - yi;
        const bestDistSq = bestDx * bestDx + bestDy * bestDy;
        const bestScore = this.computeCandidateScore(attacker, currentBest, bestDistSq);
        if (candidateScore < bestScore)
        {
            return true;
        }
        if (candidateScore > bestScore)
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

    private computeCandidateScore (attacker: number, candidate: number, distSq: number): number
    {
        if (this.state.attackMedium[attacker] !== ATTACK_MEDIUM_DIRECT)
        {
            return distSq;
        }

        const softCap = this.computeMeleeSoftCap(attacker, candidate);
        const pressure = this.engagementPressureSystem.getMeleePressure(candidate);
        const overflow = Math.max(0, pressure - softCap + 1);
        const penaltyDistance = overflow * MELEE_TARGET_SATURATION_PENALTY_DISTANCE;
        return distSq + penaltyDistance * penaltyDistance;
    }

    private computeMeleeSoftCap (attacker: number, candidate: number): number
    {
        const targetBodyRadius = Math.max(1, this.state.bodyRadius[candidate]);
        const meleeRange = Math.max(1, this.state.range[attacker]);
        const attackerBodyRadius = Math.max(1, this.state.bodyRadius[attacker]);
        const circumference = 2 * Math.PI * (targetBodyRadius + meleeRange);
        const slotWidth = 2 * (attackerBodyRadius + LOCAL_SEPARATION_SLOT_PADDING);
        const raw = Math.floor(circumference / Math.max(1, slotWidth));
        if (raw < 1)
        {
            return 1;
        }
        if (raw > MELEE_TARGET_SOFT_CAP_MAX)
        {
            return MELEE_TARGET_SOFT_CAP_MAX;
        }
        return raw;
    }
}
