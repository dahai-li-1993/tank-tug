export const TEAM_LEFT = 0;
export const TEAM_RIGHT = 1;

export const LAYER_GROUNDED = 0;
export const LAYER_FLYING = 1;

export const ATTACK_GROUNDED = 1;
export const ATTACK_FLYING = 2;
export const ATTACK_BOTH = ATTACK_GROUNDED | ATTACK_FLYING;
export const ATTACK_MEDIUM_DIRECT: 0 = 0;
export const ATTACK_MEDIUM_PROJECTILE: 1 = 1;
export const IMPACT_SINGLE: 0 = 0;
export const IMPACT_EXPLOSIVE: 1 = 1;
export const ATTACK_STYLE_MELEE = 'melee';
export const ATTACK_STYLE_RANGED = 'ranged';

export const MELEE_LOCKED_RANGE = 20;
export const RANGED_MIN_RANGE = 40;
export const BODY_RADIUS_FROM_RENDER_SIZE = 6.4;
export const BODY_RADIUS_MIN = 10;
export const BODY_RADIUS_MAX = 96;
export const LOCAL_SEPARATION_SLOT_PADDING = 3.5;
export const LOCAL_SEPARATION_RANGE_FACTOR = 2.1;
export const LOCAL_GOAL_WEIGHT = 1.0;
export const LOCAL_SEPARATION_WEIGHT = 1.1;
export const LOCAL_SEPARATION_NEIGHBOR_LIMIT = 20;
export const MELEE_TARGET_SOFT_CAP_MAX = 64;
export const MELEE_TARGET_SATURATION_PENALTY_DISTANCE = 72;

export const PROJECTILE_BASE_SPEED = 3.4;
export const PROJECTILE_RANGE_SPEED_FACTOR = 0.06;
export const PROJECTILE_SINGLE_HIT_RADIUS = 8;

export const MAX_PROJECTILES = 7000;
export const MAX_EXPLOSION_EFFECTS = 1200;
export const EXPLOSION_EFFECT_LIFETIME_TICKS = 18;
export const EXPLOSION_VISUAL_RADIUS_SCALE = 2.8;
export const EXPLOSION_VISUAL_RADIUS_MIN = 28;

export const TEAM_SPAWN_SIDE_FRACTION = 0.2;

export const UNIT_ARCHETYPE_CSV_HEADERS = [
    'unitKey',
    'race',
    'layer',
    'hp',
    'shield',
    'armor',
    'damage',
    'cooldownTicks',
    'attackStyle',
    'range',
    'speed',
    'attackMask',
    'renderSize',
    'capacity',
    'count',
    'explosiveRadius'
] as const;
