// // app/(tabs)/_layout.jsx
// import { Tabs } from 'expo-router';

// export default function TabLayout() {
//   return (
//     <Tabs screenOptions={{ headerShown: false }}>
//       <Tabs.Screen name="home" />
//       <Tabs.Screen name="create"/>
//       <Tabs.Screen name="bookmark"/>
//       <Tabs.Screen name="profile" />
//     </Tabs>
//   );
// }

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#4f46e5',
      headerShown: false,
    }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      {/* These screens are not shown in tabs but are in the stack */}
      <Tabs.Screen
        name="barter-detail"
        options={{
          href: null, // This prevents the screen from showing in the tab bar
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          href: null, // This prevents the screen from showing in the tab bar
        }}
      />
    </Tabs>
  );
}