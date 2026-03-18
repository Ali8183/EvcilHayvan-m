import React, { useContext } from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TamagotchiProvider, TamagotchiContext } from './context/TamagotchiContext';

import HomeScreen from './screens/HomeScreen';
import ShopScreen from './screens/ShopScreen';
import ProfileScreen from './screens/ProfileScreen';
import FocusScreen from './screens/FocusScreen';
import GameScreen from './screens/GameScreen';

const Tab = createBottomTabNavigator();

const GlobalHeaderRight = () => {
  const { altin, isReady, isDarkMode, setIsDarkMode } = useContext(TamagotchiContext);
  if (!isReady) return null;
  
  return (
    <View style={styles.headerRightContainer}>
      <TouchableOpacity 
         onPress={() => setIsDarkMode(!isDarkMode)} 
         style={[styles.themeToggleBtn, isDarkMode && { backgroundColor: '#2d3436', borderColor: '#636e72' }]}
      >
         <Text style={{ fontSize: 18 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
      </TouchableOpacity>

      <View style={[styles.headerCoinContainer, isDarkMode && { backgroundColor: '#2d3436', borderColor: '#f39c12' }]}>
        <Text style={[styles.headerCoinText, isDarkMode && { color: '#f1c40f' }]}>💰 {altin}</Text>
      </View>
    </View>
  );
};

const NavigationLogic = () => {
  const { isDarkMode } = useContext(TamagotchiContext);

  const bgStyle = isDarkMode ? '#1e1e1e' : '#ffffff';
  const textStyle = isDarkMode ? '#f1f2f6' : '#2d3436';
  const borderStyle = isDarkMode ? '#2d3436' : '#f1f2f6';

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: isDarkMode ? '#a29bfe' : '#6c5ce7',
          tabBarInactiveTintColor: isDarkMode ? '#636e72' : '#b2bec3',
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: '#6c5ce7',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDarkMode ? 0.4 : 0.12,
            shadowRadius: 16,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11, fontWeight: '700',
          },
          headerStyle: {
            backgroundColor: isDarkMode ? '#1a1a2e' : '#ffffff',
            elevation: 0,
            shadowColor: '#6c5ce7',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDarkMode ? 0.3 : 0.08,
            shadowRadius: 8,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? 'rgba(108,92,231,0.2)' : 'rgba(108,92,231,0.1)',
          },
          headerTitleStyle: {
            fontWeight: '900', fontSize: 17,
            color: isDarkMode ? '#f1f2f6' : '#2d3436',
          },
          headerRight: () => <GlobalHeaderRight />
        }}
      >
        <Tab.Screen 
          name="Ev" 
          component={HomeScreen} 
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏠</Text>,
            title: "Evcil Hayvanım"
          }}
        />
        <Tab.Screen 
          name="Odak" 
          component={FocusScreen} 
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>🎯</Text>,
            title: "Odak"
          }}
        />
        <Tab.Screen 
          name="Market" 
          component={ShopScreen} 
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>🛒</Text>,
            title: "Market"
          }}
        />
        <Tab.Screen 
          name="Profil" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>🏆</Text>,
            title: "Başarımlar"
          }}
        />
        <Tab.Screen 
          name="Oyunlar" 
          component={GameScreen} 
          options={{
            tabBarIcon: () => <Text style={{ fontSize: 24 }}>🎮</Text>,
            title: "Oyun Salonu"
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <TamagotchiProvider>
      <NavigationLogic />
    </TamagotchiProvider>
  );
}

const styles = StyleSheet.create({
  headerRightContainer: {
    flexDirection: 'row', alignItems: 'center', marginRight: 14, gap: 8,
  },
  themeToggleBtn: {
    backgroundColor: '#f0f0ff',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
    borderWidth: 1.5, borderColor: 'rgba(108,92,231,0.25)',
    alignItems: 'center', justifyContent: 'center',
    elevation: 2,
    shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4,
  },
  headerCoinContainer: {
    backgroundColor: '#fffbeb', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#f1c40f',
    elevation: 2,
    shadowColor: '#f39c12', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4,
  },
  headerCoinText: {
    fontSize: 15, fontWeight: '900', color: '#e67e22',
  },
});
