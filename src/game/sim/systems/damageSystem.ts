import { SimState } from '../simTypes';

export class DamageSystem
{
    constructor (private readonly state: SimState)
    {
    }

    applyPendingDamage (): void
    {
        for (let i = 0; i < this.state.entityCount; i++)
        {
            if (this.state.alive[i] === 0)
            {
                continue;
            }

            let dmg = this.state.pendingDamage[i];
            if (dmg <= 0)
            {
                continue;
            }

            if (this.state.shield[i] > 0)
            {
                const shieldAbsorb = Math.min(this.state.shield[i], dmg);
                this.state.shield[i] -= shieldAbsorb;
                dmg -= shieldAbsorb;
            }

            if (dmg > 0)
            {
                this.state.hp[i] -= dmg;
            }

            if (this.state.hp[i] <= 0)
            {
                this.state.alive[i] = 0;
                this.state.target[i] = -1;
            }
        }
    }
}
