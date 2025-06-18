import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// Audio file mappings
const audioFiles = {
  'patient-dashboard': require('../assets/audio/patient-dashboard-demo.mp3'),
  'patient-health': require('../assets/audio/patient-health-demo.mp3'),
  'doctor-overview': require('../assets/audio/doctor-overview-demo.mp3'),
  'doctor-monitoring': require('../assets/audio/doctor-monitoring-demo.mp3'),
  'doctor-patients': require('../assets/audio/doctor-patients-demo.mp3'),
  'doctor-reports': require('../assets/audio/doctor-reports-demo.mp3'),
};

export type AudioDemo = keyof typeof audioFiles;

// Global sound object to manage playback
let currentSound: Audio.Sound | null = null;

export const playDemoAudio = async (demoType: AudioDemo): Promise<void> => {
  try {
    // Stop any currently playing audio
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Configure audio mode for playback (native only)
    if (Platform.OS !== 'web') {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
      });
    }

    // Load and play the audio
    const { sound } = await Audio.Sound.createAsync(
      audioFiles[demoType],
      { shouldPlay: true, volume: 1.0 }
    );

    currentSound = sound;

    // Handle playback completion
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });

    console.log(`Playing demo audio: ${demoType}`);
  } catch (error) {
    console.error(`Error playing demo audio (${demoType}):`, error);
    // Fallback to console log if audio fails
    console.log(`Demo audio failed, showing fallback for: ${demoType}`);
  }
};

// Function to stop any currently playing demo audio
export const stopDemoAudio = async (): Promise<void> => {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.error('Error stopping demo audio:', error);
  }
};

// Cleanup function for app shutdown
export const cleanupAudio = async (): Promise<void> => {
  await stopDemoAudio();
}; 