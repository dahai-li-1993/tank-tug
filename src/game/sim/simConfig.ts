import { MAX_EXPLOSION_EFFECTS, MAX_PROJECTILES } from './simConstants';
import { SimConfig, SimConfigResolved } from './simTypes';

export const DEFAULT_CONFIG: Omit<SimConfig, 'racePresets'> = {
    maxEntities: 4500,
    arenaWidth: 9600,
    arenaHeight: 5600,
    basePadding: 24,
    coreRadius: 18,
    bucketSize: 240,
    maxTicks: 2400,
    stepMs: 50,
    coreHpStart: 5000
};

export function resolveSimConfig (config?: Partial<SimConfig>): SimConfigResolved
{
    const merged = { ...DEFAULT_CONFIG, ...config };
    const bucketCols = Math.ceil(merged.arenaWidth / merged.bucketSize);
    const bucketRows = Math.ceil(merged.arenaHeight / merged.bucketSize);

    return {
        ...merged,
        bucketCols,
        bucketRows,
        bucketCount: bucketCols * bucketRows,
        maxProjectiles: MAX_PROJECTILES,
        maxExplosionEffects: MAX_EXPLOSION_EFFECTS
    };
}
