import unitArchetypesCsv from './unitArchetypes.csv?raw';
import {
    ATTACK_BOTH,
    ATTACK_FLYING,
    ATTACK_GROUNDED,
    ATTACK_STYLE_MELEE,
    ATTACK_STYLE_RANGED,
    LAYER_FLYING,
    LAYER_GROUNDED,
    UNIT_ARCHETYPE_CSV_HEADERS
} from './simConstants';
import { AttackStyle, RaceId, UnitArchetype } from './simTypes';

export function parseUnitArchetypesCsv (csv: string): Record<RaceId, UnitArchetype[]>
{
    const rows = csv
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith('#'));

    if (rows.length < 2)
    {
        throw new Error('Unit archetype CSV is empty or missing data rows.');
    }

    const header = rows[0].split(',').map((cell) => cell.trim());
    if (header.length !== UNIT_ARCHETYPE_CSV_HEADERS.length)
    {
        throw new Error('Unit archetype CSV header has unexpected column count.');
    }

    for (let i = 0; i < UNIT_ARCHETYPE_CSV_HEADERS.length; i++)
    {
        if (header[i] !== UNIT_ARCHETYPE_CSV_HEADERS[i])
        {
            throw new Error(`Unit archetype CSV header mismatch at column ${i + 1}.`);
        }
    }

    const presets: Record<RaceId, UnitArchetype[]> = {
        beast: [],
        alien: [],
        human: []
    };
    const seenKeys = new Set<string>();

    for (let rowIndex = 1; rowIndex < rows.length; rowIndex++)
    {
        const rowNumber = rowIndex + 1;
        const cells = rows[rowIndex].split(',').map((cell) => cell.trim());
        if (cells.length !== UNIT_ARCHETYPE_CSV_HEADERS.length)
        {
            throw new Error(`Unit archetype CSV row ${rowNumber} has unexpected column count.`);
        }

        const unitKey = parseUnitKey(cells[0], rowNumber);
        if (seenKeys.has(unitKey))
        {
            throw new Error(`Duplicate unitKey '${unitKey}' at CSV row ${rowNumber}.`);
        }
        seenKeys.add(unitKey);

        const race = parseRaceId(cells[1], rowNumber);
        const archetype: UnitArchetype = {
            unitKey,
            layer: parseLayerId(cells[2], rowNumber),
            hp: parseCsvNumber('hp', cells[3], rowNumber),
            shield: parseCsvNumber('shield', cells[4], rowNumber),
            armor: parseCsvNumber('armor', cells[5], rowNumber),
            damage: parseCsvNumber('damage', cells[6], rowNumber),
            cooldownTicks: parseCsvNumber('cooldownTicks', cells[7], rowNumber),
            attackStyle: parseAttackStyle(cells[8], rowNumber),
            range: parseCsvNumber('range', cells[9], rowNumber),
            speed: parseCsvNumber('speed', cells[10], rowNumber),
            attackMask: parseAttackMask(cells[11], rowNumber),
            renderSize: parseCsvNumber('renderSize', cells[12], rowNumber),
            capacity: parseCsvNumber('capacity', cells[13], rowNumber),
            count: parseCsvNumber('count', cells[14], rowNumber),
            explosiveRadius: parseCsvNumber('explosiveRadius', cells[15], rowNumber)
        };

        presets[race].push(archetype);
    }

    return presets;
}

function parseUnitKey (value: string, rowNumber: number): string
{
    if (value.length === 0)
    {
        throw new Error(`Missing unitKey at CSV row ${rowNumber}.`);
    }
    return value;
}

function parseRaceId (value: string, rowNumber: number): RaceId
{
    if (value === 'beast' || value === 'alien' || value === 'human')
    {
        return value;
    }
    throw new Error(`Invalid race '${value}' at CSV row ${rowNumber}.`);
}

function parseLayerId (value: string, rowNumber: number): 0 | 1
{
    if (value === 'grounded')
    {
        return LAYER_GROUNDED;
    }
    if (value === 'flying')
    {
        return LAYER_FLYING;
    }
    throw new Error(`Invalid layer '${value}' at CSV row ${rowNumber}.`);
}

function parseAttackStyle (value: string, rowNumber: number): AttackStyle
{
    if (value === ATTACK_STYLE_MELEE || value === ATTACK_STYLE_RANGED)
    {
        return value;
    }
    throw new Error(`Invalid attackStyle '${value}' at CSV row ${rowNumber}.`);
}

function parseAttackMask (value: string, rowNumber: number): number
{
    if (value === 'grounded')
    {
        return ATTACK_GROUNDED;
    }
    if (value === 'flying')
    {
        return ATTACK_FLYING;
    }
    if (value === 'both')
    {
        return ATTACK_BOTH;
    }
    throw new Error(`Invalid attackMask '${value}' at CSV row ${rowNumber}.`);
}

function parseCsvNumber (field: string, value: string, rowNumber: number): number
{
    if (value.length === 0)
    {
        throw new Error(`Missing numeric value for '${field}' at CSV row ${rowNumber}.`);
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed))
    {
        throw new Error(`Invalid numeric value for '${field}' at CSV row ${rowNumber}.`);
    }
    return parsed;
}

export const DEFAULT_RACE_PRESETS = parseUnitArchetypesCsv(unitArchetypesCsv);
