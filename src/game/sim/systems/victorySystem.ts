import { TEAM_LEFT, TEAM_RIGHT } from '../simConstants';
import { SimContext, SimState, TeamId } from '../simTypes';

export class VictorySystem
{
    constructor (
        private readonly state: SimState,
        private readonly context: SimContext
    )
    {
    }

    refreshAliveStats (): void
    {
        let leftAlive = 0;
        let rightAlive = 0;
        let leftCap = 0;
        let rightCap = 0;

        for (let i = 0; i < this.state.entityCount; i++)
        {
            if (this.state.alive[i] === 0)
            {
                continue;
            }
            if (this.state.team[i] === TEAM_LEFT)
            {
                leftAlive += 1;
                leftCap += this.state.capacity[i];
            }
            else
            {
                rightAlive += 1;
                rightCap += this.state.capacity[i];
            }
        }

        this.state.leftAliveCount = leftAlive;
        this.state.rightAliveCount = rightAlive;
        this.state.leftRemainingCapacity = leftCap;
        this.state.rightRemainingCapacity = rightCap;
    }

    resolveVictory (): void
    {
        if (this.state.leftCoreHp <= 0 || this.state.rightCoreHp <= 0)
        {
            if (this.state.leftCoreHp > this.state.rightCoreHp)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            if (this.state.rightCoreHp > this.state.leftCoreHp)
            {
                this.finish(TEAM_RIGHT);
                return;
            }
            if (this.state.leftRemainingCapacity >= this.state.rightRemainingCapacity)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            this.finish(TEAM_RIGHT);
            return;
        }

        if (this.state.leftAliveCount === 0 && this.state.rightAliveCount === 0)
        {
            if (this.state.leftCoreHp >= this.state.rightCoreHp)
            {
                this.finish(TEAM_LEFT);
            }
            else
            {
                this.finish(TEAM_RIGHT);
            }
            return;
        }

        if (this.state.leftAliveCount === 0)
        {
            this.finish(TEAM_RIGHT);
            return;
        }
        if (this.state.rightAliveCount === 0)
        {
            this.finish(TEAM_LEFT);
            return;
        }

        if (this.state.tick >= this.context.config.maxTicks)
        {
            if (this.state.leftCoreHp > this.state.rightCoreHp)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            if (this.state.rightCoreHp > this.state.leftCoreHp)
            {
                this.finish(TEAM_RIGHT);
                return;
            }
            if (this.state.leftRemainingCapacity >= this.state.rightRemainingCapacity)
            {
                this.finish(TEAM_LEFT);
                return;
            }
            this.finish(TEAM_RIGHT);
        }
    }

    private finish (teamId: TeamId): void
    {
        this.state.winner = teamId;
        this.state.isFinished = true;
    }
}
