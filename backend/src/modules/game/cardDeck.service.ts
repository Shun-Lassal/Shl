import type { Card, CardRank, CardSuit } from "./game.model.js";
import { randomUUID } from "node:crypto";

const SUITS: CardSuit[] = ["HEARTS", "DIAMONDS", "CLUBS", "SPADES"];
const RANKS: CardRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function getCardValue(rank: CardRank): number {
  if (rank === "A") return 1;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  if (rank === "JOKER") return 0;
  return parseInt(rank);
}

export function createStandardDeck(): Card[] {
  const deck: Card[] = [];

  // 52 standard cards
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: randomUUID(),
        suit,
        rank,
        value: getCardValue(rank),
      });
    }
  }

  // 2 jokers
  deck.push({
    id: randomUUID(),
    suit: "JOKER",
    rank: "JOKER",
    value: 0,
  });
  deck.push({
    id: randomUUID(),
    suit: "JOKER",
    rank: "JOKER",
    value: 0,
  });

  return deck;
}

export function createStarterDeck(): Card[] {
  const deck: Card[] = [];
  const starterRanks: CardRank[] = ["A", "2", "3", "4", "5"];

  for (const suit of SUITS) {
    for (const rank of starterRanks) {
      deck.push({
        id: randomUUID(),
        suit,
        rank,
        value: getCardValue(rank),
      });
    }
  }

  return deck;
}

export function shuffleDeck(deck: Card[], seed: string): Card[] {
  // Simple seeded shuffle (Mulberry32 PRNG + Fisher-Yates)
  const shuffled = [...deck];
  let state = hashString(seed);

  function random(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function drawCards(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
  const drawn = deck.slice(0, count);
  const remaining = deck.slice(count);
  return { drawn, remaining };
}

export function reshuffleDiscard(discard: Card[], seed: string): Card[] {
  return shuffleDeck(discard, seed + Date.now());
}
