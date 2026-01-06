import type { EnemyState, EnemyIntent } from "./game.model.js";

const ENEMY_TYPES = {
  GOBLIN: { baseHp: 20, baseDamage: 3 },
  ORC: { baseHp: 30, baseDamage: 4 },
  TROLL: { baseHp: 40, baseDamage: 5 },
};

export type EnemyType = keyof typeof ENEMY_TYPES;

export function generateEnemy(type: EnemyType, floor: number): Omit<EnemyState, "id" | "gameId" | "order"> {
  const baseStats = ENEMY_TYPES[type];
  // Light early boost so low floors feel a bit more threatening without spiking late-game.
  const earlyBoost = Math.max(1, 1.15 - 0.05 * Math.max(0, floor - 1)); // 1: +15%, 2: +10%, 3: +5%, 4+: none
  // Softer scaling after floor 4 to avoid exponential spikes (especially noticeable in co-op).
  const earlyFloors = Math.min(Math.max(0, floor - 1), 3); // floors 1-4
  const lateFloors = Math.max(0, floor - 4); // floors 5+
  const hpMultiplier = earlyBoost * Math.pow(1.07, earlyFloors) * Math.pow(1.03, lateFloors);
  const damageMultiplier = earlyBoost * Math.pow(1.01, lateFloors);

  return {
    type,
    hp: Math.floor(baseStats.baseHp * hpMultiplier),
    maxHp: Math.floor(baseStats.baseHp * hpMultiplier),
    intent: generateIntent(type, Math.floor(baseStats.baseDamage * damageMultiplier), []),
  };
}

export function generateIntent(type: EnemyType, baseDamage: number, possibleTargets: string[]): EnemyIntent {
  // Simple AI: mostly attack, occasionally defend
  const roll = Math.random();
  
  if (roll < 0.8) {
    const target = possibleTargets.length
      ? possibleTargets[Math.floor(Math.random() * possibleTargets.length)]
      : undefined;
    return {
      type: "ATTACK",
      value: baseDamage + Math.floor(Math.random() * 3) - 1, // ±1 variance
      targets: target ? [target] : undefined,
    };
  } else {
    return {
      type: "DEFEND",
      value: Math.floor(baseDamage * 0.5),
    };
  }
}

export function executeEnemyTurn(enemy: EnemyState): {
  action: "ATTACK" | "DEFEND";
  value: number;
  targets?: string[];
  newIntent: EnemyIntent;
} {
  const action = enemy.intent.type === "DEFEND" ? "DEFEND" : "ATTACK";
  const value = enemy.intent.value;

  // Generate next intent for next turn
  // Tie damage to max HP but keep it moderate; previously `/4` made mid-game hits explode.
  const baseDamage = Math.max(1, Math.floor(enemy.maxHp / 10));
  const newIntent = generateIntent(enemy.type as EnemyType, baseDamage, []);

  return { action, value, targets: enemy.intent.targets, newIntent };
}
