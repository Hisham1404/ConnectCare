import React from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Minus, MessageCircle } from 'lucide-react-native';
import { useAppGuide } from '@/context/AppGuideContext';
import ConvAI from './ConvAI';
import tools from '@/utils/tools';

const { width, height } = Dimensions.get('window');

export const AppGuideAgent: React.FC = () => {
  const { isGuideVisible, isMinimized, minimizeGuide, expandGuide, closeGuide } = useAppGuide();

  if (!isGuideVisible) {
    return null;
  }

  // Always render the modal (expanded view) but hide it when minimized to preserve state
  return (
    <>
      <View style={[styles.container, isMinimized && { display: 'none' }]}>
        <BlurView intensity={80} style={styles.blurView}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Carey - AI Assistant</Text>
              <View style={styles.headerButtons}>
                <Pressable style={styles.minimizeButton} onPress={minimizeGuide}>
                  <Minus size={20} color="#374151" strokeWidth={2} />
                </Pressable>
                <Pressable style={styles.closeButton} onPress={closeGuide}>
                  <X size={20} color="#374151" strokeWidth={2} />
                </Pressable>
              </View>
            </View>
            
            {/* Content Area */}
            <View style={styles.content}>
              <ConvAI
                platform="react-native"
                patientId="carey-global-assistant"
                agentId={process.env.EXPO_PUBLIC_ELEVENLABS_CAREY_AGENT_ID}
                get_battery_level={tools.get_battery_level}
                change_brightness={tools.change_brightness}
                flash_screen={tools.flash_screen}
              />
            </View>
          </View>
        </BlurView>
      </View>

      {/* Minimized bubble rendered only when minimized */}
      {isMinimized && (
        <Pressable style={styles.minimizedContainer} onPress={expandGuide}>
          <BlurView intensity={80} style={styles.minimizedBlur}>
            <View style={styles.minimizedContent}>
              <MessageCircle size={20} color="#3B82F6" strokeWidth={2} />
              <Text style={styles.minimizedText}>Carey</Text>
            </View>
          </BlurView>
        </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modal: {
    width: width * 0.9,
    height: height * 0.8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  minimizeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  closeButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Minimized state styles
  minimizedContainer: {
    position: 'absolute',
    bottom: 100, // Above the floating button
    right: 30,
    zIndex: 9998,
  },
  minimizedBlur: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  minimizedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    gap: 8,
  },
  minimizedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
}); 