import { TugPrototypeSim, type RaceId } from '../prototypeSim';
import {
    BODY_RADIUS_FROM_RENDER_SIZE,
    BODY_RADIUS_MAX,
    BODY_RADIUS_MIN
} from '../simConstants';
import type { UnitArchetype } from '../simTypes';

function assert (condition: boolean, message: string): void
{
    if (!condition)
    {
        throw new Error(message);
    }
}

function createBaseMeleeArchetype (overrides: Partial<UnitArchetype>): UnitArchetype
{
    return {
        unitKey: 'unit',
        layer: 0,
        hp: 500,
        shield: 0,
        armor: 0,
        damage: 6,
        cooldownTicks: 10,
        attackStyle: 'melee',
        range: 20,
        speed: 6,
        attackMask: 1,
        explosiveRadius: 0,
        renderSize: 4,
        capacity: 2,
        count: 1,
        ...overrides
    };
}

function createBaseRangedArchetype (overrides: Partial<UnitArchetype>): UnitArchetype
{
    return {
        unitKey: 'unit',
        layer: 0,
        hp: 900,
        shield: 0,
        armor: 0,
        damage: 1,
        cooldownTicks: 40,
        attackStyle: 'ranged',
        range: 140,
        speed: 0,
        attackMask: 1,
        explosiveRadius: 0,
        renderSize: 4,
        capacity: 2,
        count: 1,
        ...overrides
    };
}

function createSimWithPresets (presets: Record<RaceId, UnitArchetype[]>): TugPrototypeSim
{
    return new TugPrototypeSim({
        maxEntities: 256,
        arenaWidth: 2600,
        arenaHeight: 1000,
        basePadding: 24,
        coreRadius: 18,
        bucketSize: 80,
        maxTicks: 1200,
        stepMs: 50,
        coreHpStart: 4000,
        racePresets: presets
    });
}

function setPositions (sim: TugPrototypeSim, from: number, toInclusive: number, x: number, y: number): void
{
    for (let i = from; i <= toInclusive; i++)
    {
        sim.x[i] = x;
        sim.y[i] = y;
    }
}

function computeBodyRadiusFromRenderSize (renderSize: number): number
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

function computeOverlapPairs (sim: TugPrototypeSim, from: number, toInclusive: number): number
{
    let overlaps = 0;
    for (let a = from; a <= toInclusive; a++)
    {
        if (sim.alive[a] === 0)
        {
            continue;
        }

        for (let b = a + 1; b <= toInclusive; b++)
        {
            if (sim.alive[b] === 0)
            {
                continue;
            }

            const dx = sim.x[a] - sim.x[b];
            const dy = sim.y[a] - sim.y[b];
            const distSq = dx * dx + dy * dy;
            const ra = computeBodyRadiusFromRenderSize(sim.renderSize[a]);
            const rb = computeBodyRadiusFromRenderSize(sim.renderSize[b]);
            const overlapDist = (ra + rb) * 0.68;
            if (distSq < overlapDist * overlapDist)
            {
                overlaps += 1;
            }
        }
    }
    return overlaps;
}

(function runCrowdBehaviorTests ()
{
    const separationPresets: Record<RaceId, UnitArchetype[]> = {
        beast: [
            createBaseMeleeArchetype({
                unitKey: 'beast_swarm',
                count: 32,
                speed: 6.5,
                renderSize: 4
            })
        ],
        alien: [createBaseMeleeArchetype({ unitKey: 'alien_unused', count: 0 })],
        human: [
            createBaseRangedArchetype({
                unitKey: 'human_dummy',
                count: 1,
                hp: 20000,
                damage: 0,
                cooldownTicks: 999,
                speed: 0,
                renderSize: 5
            })
        ]
    };

    const separationSim = createSimWithPresets(separationPresets);
    separationSim.reset({ seed: 7, leftRace: 'beast', rightRace: 'human' });

    const leftCount = 32;
    const rightFirstId = leftCount;
    setPositions(separationSim, 0, leftCount - 1, 360, 500);
    separationSim.x[rightFirstId] = 2300;
    separationSim.y[rightFirstId] = 500;

    const overlapStart = computeOverlapPairs(separationSim, 0, leftCount - 1);
    for (let tick = 0; tick < 45; tick++)
    {
        separationSim.step();
    }
    const overlapAfter = computeOverlapPairs(separationSim, 0, leftCount - 1);

    assert(
        overlapAfter < overlapStart * 0.55,
        `separation overlap reduction failed: start=${overlapStart} after=${overlapAfter}`
    );

    const focusPresets: Record<RaceId, UnitArchetype[]> = {
        beast: [
            createBaseMeleeArchetype({
                unitKey: 'beast_focus_swarm',
                count: 24,
                speed: 5.4,
                renderSize: 4
            })
        ],
        alien: [createBaseMeleeArchetype({ unitKey: 'alien_unused', count: 0 })],
        human: [
            createBaseRangedArchetype({
                unitKey: 'human_focus_dummy',
                count: 3,
                hp: 12000,
                damage: 0,
                cooldownTicks: 999,
                speed: 0,
                renderSize: 4
            })
        ]
    };

    const focusSim = createSimWithPresets(focusPresets);
    focusSim.reset({ seed: 9, leftRace: 'beast', rightRace: 'human' });

    for (let i = 0; i < 24; i++)
    {
        focusSim.x[i] = 900;
        focusSim.y[i] = 500;
    }

    const d0 = 24;
    const d1 = 25;
    const d2 = 26;
    focusSim.x[d0] = 1120;
    focusSim.y[d0] = 460;
    focusSim.x[d1] = 1120;
    focusSim.y[d1] = 500;
    focusSim.x[d2] = 1120;
    focusSim.y[d2] = 540;

    focusSim.step();

    const focusCounts = new Map<number, number>();
    for (let i = 0; i < 24; i++)
    {
        const t = focusSim.target[i];
        if (t >= 0)
        {
            focusCounts.set(t, (focusCounts.get(t) ?? 0) + 1);
        }
    }

    const focusedTargets = [ d0, d1, d2 ].map((id) => focusCounts.get(id) ?? 0);
    const activeTargetSlots = focusedTargets.filter((count) => count > 0).length;
    const maxFocused = Math.max(...focusedTargets);

    assert(activeTargetSlots === 3, `focus-fire distribution failed: counts=${focusedTargets.join(',')}`);
    assert(maxFocused <= 12, `focus-fire max concentration too high: counts=${focusedTargets.join(',')}`);

    const sizePresets: Record<RaceId, UnitArchetype[]> = {
        beast: [
            createBaseMeleeArchetype({
                unitKey: 'beast_size_swarm',
                count: 26,
                speed: 5.4,
                renderSize: 4
            })
        ],
        alien: [createBaseMeleeArchetype({ unitKey: 'alien_unused', count: 0 })],
        human: [
            createBaseRangedArchetype({
                unitKey: 'human_small_dummy',
                count: 1,
                hp: 20000,
                damage: 0,
                cooldownTicks: 999,
                speed: 0,
                renderSize: 4
            }),
            createBaseRangedArchetype({
                unitKey: 'human_big_dummy',
                count: 1,
                hp: 20000,
                damage: 0,
                cooldownTicks: 999,
                speed: 0,
                renderSize: 12
            })
        ]
    };

    const sizeSim = createSimWithPresets(sizePresets);
    sizeSim.reset({ seed: 11, leftRace: 'beast', rightRace: 'human' });

    for (let i = 0; i < 26; i++)
    {
        sizeSim.x[i] = 900;
        sizeSim.y[i] = 500;
    }

    const smallId = 26;
    const bigId = 27;
    sizeSim.x[smallId] = 1120;
    sizeSim.y[smallId] = 470;
    sizeSim.x[bigId] = 1120;
    sizeSim.y[bigId] = 530;

    sizeSim.step();

    let smallCount = 0;
    let bigCount = 0;
    for (let i = 0; i < 26; i++)
    {
        if (sizeSim.target[i] === smallId)
        {
            smallCount += 1;
        }
        else if (sizeSim.target[i] === bigId)
        {
            bigCount += 1;
        }
    }

    assert(
        bigCount >= smallCount + 2,
        `size-vulnerability distribution failed: small=${smallCount} big=${bigCount}`
    );

    console.log('prototypeSim crowd behavior tests passed');
})();
