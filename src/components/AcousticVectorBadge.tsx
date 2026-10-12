import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface VectorBadgeProps {
  energy: number;
  bpm: number;
  popularity: number;
  genre: string;
}

export const AcousticVectorBadge: React.FC<VectorBadgeProps> = ({
  energy,
  bpm,
  popularity,
  genre,
}) => {
  return (
    <View style={styles.badgeContainer}>
      <View style={styles.topRow}>
        <Text style={styles.genreText}>{genre.toUpperCase()}</Text>
        <Text style={styles.energyValue}>Energía: {energy.toFixed(1)} / 10</Text>
      </View>

      <View style={styles.energyMeterBackground}>
        <View
          style={[
            styles.energyMeterFill,
            { width: `${Math.min(100, Math.max(0, (energy / 10) * 100))}%` },
          ]}
        />
      </View>

      <View style={styles.metricsFooter}>
        <Text style={styles.metricItem}>Tempo: {bpm} BPM</Text>
        <Text style={styles.metricItem}>Afinidad: {(popularity * 100).toFixed(0)}%</Text>
        <Text style={styles.heuristicItem}>Filtro: Δ ≤ 2.0 ✓</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    backgroundColor: '#0f0f18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e1b4b',
    padding: 10,
    marginTop: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  genreText: {
    color: '#a78bfa',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  energyValue: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'Courier',
  },
  energyMeterBackground: {
    height: 4,
    backgroundColor: '#1e1e2f',
    borderRadius: 2,
    overflow: 'hidden',
  },
  energyMeterFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 2,
  },
  metricsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  metricItem: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'Courier',
  },
  heuristicItem: {
    color: '#10b981',
    fontSize: 9,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
});