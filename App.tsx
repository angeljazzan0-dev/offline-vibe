import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NowPlayingScreen } from './src/screens/NowPlayingScreen';
import { initializeAudioPlayer } from './src/services/audioPlayer';

export default function App() {
  useEffect(() => {
    initializeAudioPlayer();
  }, []);

  return (
    <SafeAreaProvider>
      <NowPlayingScreen />
    </SafeAreaProvider>
  );
}