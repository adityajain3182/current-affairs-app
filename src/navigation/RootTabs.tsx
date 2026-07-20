import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { QuizTab } from '../screens/QuizTab';
import { ProgressScreen } from '../screens/ProgressScreen';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator();

const DailyScreen = () => <QuizTab type="daily" />;
const WeeklyScreen = () => <QuizTab type="weekly" />;

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Daily: ['today', 'today-outline'],
  Weekly: ['calendar', 'calendar-outline'],
  Progress: ['stats-chart', 'stats-chart-outline'],
};

export function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { ...typography.caption, fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = ICONS[route.name] ?? ['ellipse', 'ellipse-outline'];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Daily" component={DailyScreen} />
      <Tab.Screen name="Weekly" component={WeeklyScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
    </Tab.Navigator>
  );
}
