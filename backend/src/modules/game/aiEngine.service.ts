import type { EnemyState, EnemyIntent } from "./game.model.ts";

const ENEMY_TYPES = {
  GOBLIN: { baseHp: 20, baseDamage: 5 },
  ORC: { baseHp: 40, baseDamage: 8 },
  TROLL: { baseHp: 60, baseDamage: 12 },
};

export type EnemyType = keyof typeof ENEMY_TYPES;

export function generateEnemy(type: EnemyType, floor: number): Omit<EnemyState, "id" | "gameId" | "order"> {
  const baseStats = ENEMY_TYPES[type];
  const hpMultiplier = Math.pow(1.3, floor - 1);
  const damageMultiplier = Math.pow(1.2, floor - 1);

  return {
    type,
    hp: Math.floor(baseStats.baseHp * hpMultiplier),
    maxHp: Math.floor(baseStats.baseHp * hpMultiplier),
    intent: generateIntent(type, Math.floor(baseStats.baseDamage * damageMultiplier)),
  };
}

export function generateIntent(type: EnemyType, baseDamage: number): EnemyIntent {
  // Simple AI: mostly attack, occasionally defend
  const roll = Math.random();
  
  if (roll < 0.8) {
    return {
      type: "ATTACK",
      value: baseDamage + Math.floor(Math.random() * 3) - 1, // ±1 variance
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
  newIntent: EnemyIntent;
} {
  const action = enemy.intent.type === "DEFEND" ? "DEFEND" : "ATTACK";
  const value = enemy.intent.value;

  // Generate next intent for next turn
  const baseDamage = Math.floor(enemy.maxHp / 4); // Rough estimate
  const newIntent = generateIntent(enemy.type as EnemyType, baseDamage);

  return { action, value, newIntent };
}
