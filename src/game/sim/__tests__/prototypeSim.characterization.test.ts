import { TugPrototypeSim, type RaceId } from '../prototypeSim';
import type { UnitArchetype } from '../simTypes';

const TEST_PRESETS: Record<RaceId, UnitArchetype[]> = {
    beast: [
        {
            unitKey: 'beast_melee',
            layer: 0,
            hp: 100,
            shield: 0,
            armor: 0,
            damage: 10,
            cooldownTicks: 8,
            attackStyle: 'melee',
            range: 20,
            speed: 4,
            attackMask: 1,
            explosiveRadius: 0,
            renderSize: 4,
            capacity: 2,
            count: 12
        },
        {
            unitKey: 'beast_archer',
            layer: 0,
            hp: 70,
            shield: 0,
            armor: 0,
            damage: 9,
            cooldownTicks: 11,
            attackStyle: 'ranged',
            range: 140,
            speed: 3.5,
            attackMask: 3,
            explosiveRadius: 0,
            renderSize: 4,
            capacity: 3,
            count: 8
        }
    ],
    alien: [
        {
            unitKey: 'alien_stabber',
            layer: 0,
            hp: 90,
            shield: 15,
            armor: 0,
            damage: 11,
            cooldownTicks: 8,
            attackStyle: 'melee',
            range: 20,
            speed: 4.2,
            attackMask: 1,
            explosiveRadius: 0,
            renderSize: 4,
            capacity: 2,
            count: 12
        },
        {
            unitKey: 'alien_orbiter',
            layer: 1,
            hp: 80,
            shield: 20,
            armor: 0,
            damage: 10,
            cooldownTicks: 12,
            attackStyle: 'ranged',
            range: 150,
            speed: 3.6,
            attackMask: 3,
            explosiveRadius: 16,
            renderSize: 4,
            capacity: 3,
            count: 8
        }
    ],
    human: [
        {
            unitKey: 'human_guard',
            layer: 0,
            hp: 110,
            shield: 0,
            armor: 1,
            damage: 9,
            cooldownTicks: 9,
            attackStyle: 'melee',
            range: 20,
            speed: 3.9,
            attackMask: 1,
            explosiveRadius: 0,
            renderSize: 4,
            capacity: 2,
            count: 12
        },
        {
            unitKey: 'human_mortar',
            layer: 0,
            hp: 75,
            shield: 0,
            armor: 0,
            damage: 12,
            cooldownTicks: 13,
            attackStyle: 'ranged',
            range: 160,
            speed: 3.4,
            attackMask: 3,
            explosiveRadius: 20,
            renderSize: 4,
            capacity: 3,
            count: 8
        }
    ]
};

function createTestSim (): TugPrototypeSim
{
    return new TugPrototypeSim({
        maxEntities: 128,
        arenaWidth: 1200,
        arenaHeight: 700,
        basePadding: 24,
        coreRadius: 18,
        bucketSize: 60,
        maxTicks: 600,
        stepMs: 50,
        coreHpStart: 1200,
        racePresets: TEST_PRESETS
    });
}

function assert (condition: boolean, message: string): void
{
    if (!condition)
    {
        throw new Error(message);
    }
}

function assertDeepEqual (actual: unknown, expected: unknown, message: string): void
{
    const actualJson = JSON.stringify(actual);
    const expectedJson = JSON.stringify(expected);
    if (actualJson !== expectedJson)
    {
        throw new Error(`${message}\nexpected=${expectedJson}\nactual=${actualJson}`);
    }
}

function runScenario (
    sim: TugPrototypeSim,
    seed: number,
    leftRace: RaceId,
    rightRace: RaceId
): {
    tick: number;
    winner: number;
    leftCoreHp: number;
    rightCoreHp: number;
    leftAliveCount: number;
    rightAliveCount: number;
    leftRemainingCapacity: number;
    rightRemainingCapacity: number;
    entityCount: number;
    checksum: number;
    timeline: number[];
}
{
    sim.reset({ seed, leftRace, rightRace });

    const timeline: number[] = [sim.debugDeterminismChecksum()];
    while (!sim.isFinished && sim.tick < 650)
    {
        sim.step();
        if (sim.tick % 100 === 0 || sim.isFinished)
        {
            timeline.push(sim.debugDeterminismChecksum());
        }
    }

    return {
        tick: sim.tick,
        winner: sim.winner,
        leftCoreHp: sim.leftCoreHp,
        rightCoreHp: sim.rightCoreHp,
        leftAliveCount: sim.leftAliveCount,
        rightAliveCount: sim.rightAliveCount,
        leftRemainingCapacity: sim.leftRemainingCapacity,
        rightRemainingCapacity: sim.rightRemainingCapacity,
        entityCount: sim.entityCount,
        checksum: sim.debugDeterminismChecksum(),
        timeline
    };
}

(function runCharacterizationTests ()
{
    const simA = createTestSim();
    const firstRun = runScenario(simA, 1337, 'human', 'beast');
    const secondRun = runScenario(simA, 1337, 'human', 'beast');

    assertDeepEqual(secondRun, firstRun, 'same seed scenario should replay identically');

    assertDeepEqual(
        firstRun,
        {
            tick: 327,
            winner: 0,
            leftCoreHp: 1200,
            rightCoreHp: 1200,
            leftAliveCount: 12,
            rightAliveCount: 0,
            leftRemainingCapacity: 30,
            rightRemainingCapacity: 0,
            entityCount: 40,
            checksum: 588939588,
            timeline: [2267777956, 2390510460, 4099505119, 1547319932, 588939588]
        },
        'human vs beast snapshot changed'
    );

    const simB = createTestSim();
    const alienVsHuman = runScenario(simB, 2024, 'alien', 'human');
    assertDeepEqual(
        alienVsHuman,
        {
            tick: 553,
            winner: 0,
            leftCoreHp: 1198,
            rightCoreHp: 1200,
            leftAliveCount: 4,
            rightAliveCount: 0,
            leftRemainingCapacity: 12,
            rightRemainingCapacity: 0,
            entityCount: 40,
            checksum: 1076545144,
            timeline: [2768355806, 2448211921, 3942220431, 3852017576, 3607113080, 1610120643, 1076545144]
        },
        'alien vs human snapshot changed'
    );

    const simContract = createTestSim();
    simContract.reset({ seed: 1, leftRace: 'human', rightRace: 'beast' });

    const gameContractFields: Array<keyof TugPrototypeSim> = [
        'stepMs',
        'isFinished',
        'reset',
        'step',
        'leftCoreHp',
        'rightCoreHp',
        'entityCount',
        'alive',
        'team',
        'layer',
        'renderSize',
        'x',
        'y',
        'maxProjectiles',
        'projectileActive',
        'projectileTeam',
        'projectileExplosive',
        'projectilePrevX',
        'projectilePrevY',
        'projectileX',
        'projectileY',
        'maxExplosionEffects',
        'explosionActive',
        'explosionTeam',
        'explosionLife',
        'explosionLifeMax',
        'explosionRadius',
        'explosionX',
        'explosionY',
        'winner',
        'tick',
        'leftAliveCount',
        'rightAliveCount',
        'leftRemainingCapacity',
        'rightRemainingCapacity'
    ];

    for (let i = 0; i < gameContractFields.length; i++)
    {
        const key = gameContractFields[i];
        assert(key in simContract, `missing public contract field '${String(key)}'`);
    }

    assert(simContract.alive.length >= simContract.entityCount, 'alive array length must cover entities');
    assert(simContract.projectileActive.length === simContract.maxProjectiles, 'projectile arrays must match maxProjectiles');
    assert(simContract.explosionActive.length === simContract.maxExplosionEffects, 'explosion arrays must match maxExplosionEffects');

    console.log('prototypeSim characterization tests passed');
})();
