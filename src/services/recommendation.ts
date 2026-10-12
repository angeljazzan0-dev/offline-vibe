import { Q } from '@nozbe/watermelondb';
import { database } from '../database';
import Track from '../database/models/Track';
import PlayHistory from '../database/models/PlayHistory';

export type Vector4D = [number, number, number, number];

export interface RecommendationConfig {
  limit?: number;
  energyTolerance?: number;
  artistPenaltyMultiplier?: number;
  recentArtistsWindow?: number;
}

export function euclideanDistance(v1: Vector4D, v2: Vector4D): number {
  let sum = 0;
  for (let i = 0; i < 4; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function cosineSimilarity(v1: Vector4D, v2: Vector4D): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < 4; i++) {
    dotProduct += v1[i] * v2[i];
    normA += v1[i] * v1[i];
    normB += v2[i] * v2[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  const similarity = dotProduct / denominator;
  return Math.max(0, Math.min(1, similarity));
}

export async function getRecentArtistIds(lastN: number = 2): Promise<string[]> {
  const history = await database
    .get<PlayHistory>('play_history')
    .query(Q.sortBy('played_at', Q.desc), Q.take(lastN))
    .fetch();

  return history
    .map((record) => record.artistId)
    .filter((id): id is string => typeof id === 'string' && id.length > 0);
}

interface ScoredCandidate {
  id: string;
  finalScore: number;
  rawSimilarity: number;
  isPenalized: boolean;
}

export async function getNextRecommendedTrackIds(
  seedTrack: Track,
  config: RecommendationConfig = {}
): Promise<string[]> {
  const {
    limit = 10,
    energyTolerance = 2.0,
    artistPenaltyMultiplier = 0.35,
    recentArtistsWindow = 2,
  } = config;

  const tracksCollection = database.get<Track>('tracks');

  const minEnergy = Math.max(1.0, seedTrack.energy - energyTolerance);
  const maxEnergy = Math.min(10.0, seedTrack.energy + energyTolerance);

  let candidates = await tracksCollection
    .query(
      Q.where('id', Q.notEq(seedTrack.id)),
      Q.where('energy', Q.between(minEnergy, maxEnergy))
    )
    .fetch();

  if (candidates.length < limit) {
    candidates = await tracksCollection
      .query(Q.where('id', Q.notEq(seedTrack.id)))
      .fetch();
  }

  if (candidates.length === 0) return [];

  const recentArtistIds = await getRecentArtistIds(recentArtistsWindow);
  const seedVector = seedTrack.normalizedVector;

  const scoredCandidates: ScoredCandidate[] = candidates.map((candidate) => {
    const rawSim = cosineSimilarity(seedVector, candidate.normalizedVector);
    const isPenalized = recentArtistIds.includes(candidate.artistId);
    const finalScore = isPenalized ? rawSim * artistPenaltyMultiplier : rawSim;

    return {
      id: candidate.id,
      finalScore,
      rawSimilarity: rawSim,
      isPenalized,
    };
  });

  scoredCandidates.sort((a, b) => {
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }
    return b.rawSimilarity - a.rawSimilarity;
  });

  return scoredCandidates.slice(0, limit).map((c) => c.id);
}