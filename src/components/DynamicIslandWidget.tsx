import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface DynamicIslandProps {
  title: string;
  artist: string;
  isPlaying: boolean;
}

export const DynamicIslandPreview: React.FC<DynamicIslandProps> = ({
  title,
  artist,
  isPlaying,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.islandContainer}>
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={[
          styles.pillBase,
          isExpanded ? styles.pillExpanded : styles.pillCompact,
        ]}
      >
        {!isExpanded ? (
          <View style={styles.compactRow}>
            <View style={styles.leadingContainer}>
              <View style={styles.miniIconBadge}>
                <Text style={styles.miniIconText}>OV</Text>
              </View>
              <Text style={styles.compactEnergyBadge}>7.8E</Text>
            </View>
            <View style={styles.trailingWave}>
              <View style={[styles.waveBar, isPlaying && styles.waveBarAnim1]} />
              <View style={[styles.waveBar, isPlaying && styles.waveBarAnim2]} />
              <View style={[styles.waveBar, isPlaying && styles.waveBarAnim3]} />
            </View>
          </View>
        ) : (
          <View style={styles.expandedContent}>
            <View style={styles.expandedHeader}>
              <View style={styles.expandedArtwork}>
                <Text style={styles.expandedArtworkText}>OV</Text>
              </View>
              <View style={styles.expandedInfo}>
                <Text style={styles.expandedTitle} numberOfLines={1}>{title}</Text>
                <Text style={styles.expandedArtist} numberOfLines={1}>{artist}</Text>
                <Text style={styles.expandedVectorMetric}>Energy: 7.8 • 124 BPM</Text>
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  islandContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  pillBase: {
    backgroundColor: '#000000',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
  },
  pillCompact: {
    width: 126,
    height: 35,
    paddingHorizontal: 10,
  },
  pillExpanded: {
    width: 320,
    height: 80,
    padding: 12,
    borderRadius: 28,
  },
  compactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniIconBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniIconText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '800',
  },
  compactEnergyBadge: {
    color: '#a78bfa',
    fontSize: 10,
    fontFamily: 'Courier',
    fontWeight: '700',
  },
  trailingWave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    width: 2.5,
    height: 10,
    backgroundColor: '#8b5cf6',
    borderRadius: 1.5,
  },
  waveBarAnim1: { height: 14 },
  waveBarAnim2: { height: 8 },
  waveBarAnim3: { height: 16 },
  expandedContent: {
    flex: 1,
    justifyContent: 'center',
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expandedArtwork: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandedArtworkText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  expandedInfo: {
    flex: 1,
  },
  expandedTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  expandedArtist: {
    color: '#94a3b8',
    fontSize: 11,
  },
  expandedVectorMetric: {
    color: '#a78bfa',
    fontSize: 9,
    fontFamily: 'Courier',
    marginTop: 2,
  },
});