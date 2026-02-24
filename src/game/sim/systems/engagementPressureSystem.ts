import { ATTACK_MEDIUM_DIRECT } from '../simConstants';
import { SimState } from '../simTypes';

export class EngagementPressureSystem
{
    constructor (private readonly state: SimState)
    {
    }

    clearMeleePressure (): void
    {
        this.state.targetMeleePressure.fill(0, 0, this.state.entityCount);
    }

    seedFromCurrentTargets (): void
    {
        this.clearMeleePressure();

        for (let attacker = 0; attacker < this.state.entityCount; attacker++)
        {
            if (this.state.alive[attacker] === 0 || !this.isMeleeAttacker(attacker))
            {
                continue;
            }

            const targetId = this.state.target[attacker];
            this.incrementPressure(targetId);
        }
    }

    onTargetChanged (attacker: number, previousTarget: number, nextTarget: number): void
    {
        if (!this.isMeleeAttacker(attacker) || previousTarget === nextTarget)
        {
            return;
        }

        this.decrementPressure(previousTarget);
        this.incrementPressure(nextTarget);
    }

    onAttackerRemoved (attacker: number, previousTarget: number): void
    {
        if (!this.isMeleeAttacker(attacker))
        {
            return;
        }

        this.decrementPressure(previousTarget);
    }

    getMeleePressure (target: number): number
    {
        if (!this.isValidTargetIndex(target))
        {
            return 0;
        }
        return this.state.targetMeleePressure[target];
    }

    private isMeleeAttacker (attacker: number): boolean
    {
        return this.state.attackMedium[attacker] === ATTACK_MEDIUM_DIRECT;
    }

    private isValidTargetIndex (target: number): boolean
    {
        return target >= 0 && target < this.state.entityCount;
    }

    private incrementPressure (target: number): void
    {
        if (!this.isValidTargetIndex(target))
        {
            return;
        }

        const value = this.state.targetMeleePressure[target];
        if (value < 65535)
        {
            this.state.targetMeleePressure[target] = value + 1;
        }
    }

    private decrementPressure (target: number): void
    {
        if (!this.isValidTargetIndex(target))
        {
            return;
        }

        const value = this.state.targetMeleePressure[target];
        if (value > 0)
        {
            this.state.targetMeleePressure[target] = value - 1;
        }
    }
}
