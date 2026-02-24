import { SimContext, SimState } from '../simTypes';

export class SpatialBucketSystem
{
    constructor (
        private readonly state: SimState,
        private readonly context: SimContext
    )
    {
    }

    rebuildBuckets (): void
    {
        this.state.bucketHeads.fill(-1);

        for (let i = 0; i < this.state.entityCount; i++)
        {
            if (this.state.alive[i] === 0)
            {
                continue;
            }

            const group = this.state.team[i] * 2 + this.state.layer[i];
            const bucket = this.context.toBucketIndex(this.state.x[i], this.state.y[i]);
            const headIndex = group * this.context.config.bucketCount + bucket;
            this.state.nextInBucket[i] = this.state.bucketHeads[headIndex];
            this.state.bucketHeads[headIndex] = i;
        }
    }
}
