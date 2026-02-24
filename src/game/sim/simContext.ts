import { XorShift32 } from './rng';
import { SimConfigResolved, SimContext } from './simTypes';

export function createSimContext (config: SimConfigResolved): SimContext
{
    const leftCoreX = config.basePadding;
    const leftCoreY = config.arenaHeight * 0.5;
    const rightCoreX = config.arenaWidth - config.basePadding;
    const rightCoreY = config.arenaHeight * 0.5;

    const toBucketX = (value: number): number => {
        const index = Math.floor(value / config.bucketSize);
        if (index < 0)
        {
            return 0;
        }
        if (index >= config.bucketCols)
        {
            return config.bucketCols - 1;
        }
        return index;
    };

    const toBucketY = (value: number): number => {
        const index = Math.floor(value / config.bucketSize);
        if (index < 0)
        {
            return 0;
        }
        if (index >= config.bucketRows)
        {
            return config.bucketRows - 1;
        }
        return index;
    };

    const clampX = (value: number): number => {
        if (value < config.basePadding)
        {
            return config.basePadding;
        }
        const maxValue = config.arenaWidth - config.basePadding;
        if (value > maxValue)
        {
            return maxValue;
        }
        return value;
    };

    const clampY = (value: number): number => {
        if (value < config.basePadding)
        {
            return config.basePadding;
        }
        const maxValue = config.arenaHeight - config.basePadding;
        if (value > maxValue)
        {
            return maxValue;
        }
        return value;
    };

    return {
        config,
        rng: new XorShift32(1),
        leftCoreX,
        leftCoreY,
        rightCoreX,
        rightCoreY,
        toBucketX,
        toBucketY,
        toBucketIndex: (x: number, y: number) => toBucketY(y) * config.bucketCols + toBucketX(x),
        clampX,
        clampY
    };
}
