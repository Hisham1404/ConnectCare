import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import ConvAiDOMComponent from '../../components/ConvAI';
import tools from '../../utils/tools';

export default function ChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <View style={styles.content}>
        <Text style={styles.title}>AI Health Assistant</Text>
        <Text style={styles.description}>
          Press the button to talk to the assistant.
        </Text>
      </View>

      <View style={styles.domComponentContainer}>
        <ConvAiDOMComponent
          dom={{ style: styles.domComponent }}
          platform={Platform.OS}
          get_battery_level={tools.get_battery_level}
          change_brightness={tools.change_brightness}
          flash_screen={tools.flash_screen}
        />
      </View>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 40 
  },
  content: { 
    alignItems: 'center', 
    paddingHorizontal: 24 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#E2E8F0', 
    marginBottom: 16 
  },
  description: { 
    fontSize: 16, 
    color: '#94A3B8', 
    textAlign: 'center' 
  },
  domComponentContainer: { 
    width: 120, 
    height: 120, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 24 
  },
  domComponent: { 
    width: 120, 
    height: 120 
  },
});