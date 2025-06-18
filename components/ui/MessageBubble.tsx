import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Bookmark, Copy, Share, MoveHorizontal as MoreHorizontal } from 'lucide-react-native';

interface MessageBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  isBookmarked?: boolean;
  onBookmark?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  colors: {
    primary: string;
    surface: string;
    text: string;
    textSecondary: string;
    warning: string;
  };
}

export default function MessageBubble({
  message,
  isUser,
  timestamp,
  isBookmarked = false,
  onBookmark,
  onCopy,
  onShare,
  colors,
}: MessageBubbleProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isUser ? 50 : -50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
        {
          transform: [
            { scale: scaleAnim },
            { translateX: slideAnim },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.aiBubble,
          {
            backgroundColor: isUser ? colors.primary : colors.surface,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isUser ? '#FFFFFF' : colors.text },
          ]}
        >
          {message}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timestamp,
              { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
            ]}
          >
            {timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
          
          {!isUser && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={onBookmark} style={styles.actionButton}>
                <Bookmark
                  size={14}
                  color={isBookmarked ? colors.warning : colors.textSecondary}
                  fill={isBookmarked ? colors.warning : 'none'}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={onCopy} style={styles.actionButton}>
                <Copy size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onShare} style={styles.actionButton}>
                <Share size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
});