import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TrackPlayer, {
  useActiveTrack,
  usePlaybackState,
  useProgress,
  State,
} from 'react-native-track-player';
import { AcousticVectorBadge } from '../components/AcousticVectorBadge';
import { DynamicIslandPreview } from '../components/DynamicIslandWidget';
import { InfiniteQueueModal } from '../components/InfiniteQueueModal';

const { width } = Dimensions.get('window');

export const NowPlayingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const activeTrack = useActiveTrack();
  const playbackState = usePlaybackState();
  const { position, duration } = useProgress(250);
  const [isQueueVisible, setIsQueueVisible] = useState(false);

  const isPlaying = playbackState.state === State.Playing;

  const togglePlayPause = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top > 0 ? insets.top : 20,
          paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 24,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent />

      <DynamicIslandPreview
        title={activeTrack?.title || 'Offline Vibe'}
        artist={activeTrack?.artist || 'Listo'}
        isPlaying={isPlaying}
      />

      <View style={styles.header}>
        <Text style={styles.appTitle}>OFFLINE VIBE</Text>
        <Text style={styles.headerSubtitle}>Acoustic Graph Flow</Text>
      </View>

      <View style={styles.artworkContainer}>
        <View style={[styles.vinylDisc, isPlaying && styles.vinylPlayingBorder]}>
          <View style={styles.vinylCenterGroove}>
            <View style={styles.vinylCenterLabel}>
              <Text style={styles.vinylLabelText}>OV</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.metaSection}>
        <View style={styles.titleRow}>
          <View style={styles.textContainer}>
            <Text style={styles.trackTitle} numberOfLines={1}>
              {activeTrack?.title || 'Sin tema seleccionado'}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {activeTrack?.artist || 'Biblioteca local'}
            </Text>
          </View>
          <Pressable
            onPress={() => setIsQueueVisible(true)}
            style={styles.queueButton}
          >
            <Text style={styles.queueButtonText}>Cola ∞</Text>
          </Pressable>
        </View>

        <AcousticVectorBadge
          energy={7.8}
          bpm={124}
          popularity={0.92}
          genre={activeTrack?.genre || 'Electronic'}
        />
      </View>

      <View style={styles.scrubberSection}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: duration > 0 ? `${(position / duration) * 100}%` : '0%' },
            ]}
          />
        </View>
        <View style={styles.timeLabelsRow}>
          <Text style={styles.timeLabel}>{formatTime(position)}</Text>
          <Text style={styles.timeLabel}>-{formatTime(Math.max(0, duration - position))}</Text>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <Pressable onPress={() => TrackPlayer.skipToPrevious()} style={styles.secondaryButton}>
          <Text style={styles.secondaryIconText}>⏮</Text>
        </Pressable>

        <Pressable onPress={togglePlayPause} style={styles.mainPlayButton}>
          <Text style={styles.playIconText}>{isPlaying ? '❚❚' : '▶'}</Text>
        </Pressable>

        <Pressable onPress={() => TrackPlayer.skipToNext()} style={styles.secondaryButton}>
          <Text style={styles.secondaryIconText}>⏭</Text>
        </Pressable>
      </View>

      <InfiniteQueueModal
        visible={isQueueVisible}
        onClose={() => setIsQueueVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  header: { alignItems: 'center', marginVertical: 4 },
  appTitle: { color: '#8b5cf6', fontSize: 11, fontWeight: '800', letterSpacing: 2.5 },
  headerSubtitle: { color: '#64748b', fontSize: 13, fontWeight: '500', marginTop: 2 },
  artworkContainer: { alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  vinylDisc: {
    width: width * 0.62,
    height: width * 0.62,
    borderRadius: (width * 0.62) / 2,
    backgroundColor: '#0c0c12',
    borderWidth: 2,
    borderColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylPlayingBorder: { borderColor: 'rgba(139, 92, 246, 0.6)' },
  vinylCenterGroove: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#050508',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#312e81',
  },
  vinylCenterLabel: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vinylLabelText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  metaSection: { marginVertical: 6 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  textContainer: { flex: 1, marginRight: 12 },
  trackTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  trackArtist: { color: '#94a3b8', fontSize: 14, marginTop: 2 },
  queueButton: { backgroundColor: '#1e1b4b', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: '#4338ca' },
  queueButtonText: { color: '#c7d2fe', fontSize: 11, fontWeight: '700' },
  scrubberSection: { marginVertical: 10 },
  progressBarBackground: { height: 4, backgroundColor: '#1e293b', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#ffffff', borderRadius: 2 },
  timeLabelsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeLabel: { color: '#64748b', fontSize: 11, fontFamily: 'Courier', fontWeight: '500' },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 36, marginBottom: 8 },
  secondaryButton: { padding: 12 },
  secondaryIconText: { color: '#e2e8f0', fontSize: 24 },
  mainPlayButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconText: { color: '#000000', fontSize: 24, fontWeight: '900' },
});