import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function Landing() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ConnectCare AI</Text>
      <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/signin')}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 40,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 18,
    fontWeight: '700',
  },
});