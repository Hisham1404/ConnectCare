import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Chrome as Home, Heart, MessageCircle, User } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { user, loading } = useAuth();
  if (!loading && !user) {
    return <Redirect href="/(auth)/signin" />;
  }
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: `${Colors.textSecondary}${Colors.opacity.light}`,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Home color={color} size={size} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'My Health',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Heart color={color} size={size} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'AI Assistant',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle color={color} size={size} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <User color={color} size={size} strokeWidth={2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle color={color} size={size} strokeWidth={2} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}