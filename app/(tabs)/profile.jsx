import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';

const Profile = () => {
  const { session, signOut } = useAuth();
  const user = session?.user;

  const stats = [
    { label: 'Barters', value: '24' },
    { label: 'Skills', value: '5' },
    { label: 'Rating', value: '4.8' },
  ];

  const skills = ['JavaScript', 'UI Design', 'Photography', 'Carpentry', 'Cooking'];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-600 pb-6 pt-12 px-6 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-white">My Profile</Text>
          <TouchableOpacity onPress={signOut}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center">
            <Image
              source={{ uri: user?.user_metadata?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg' }}
              className="w-20 h-20 rounded-full border-4 border-indigo-100"
            />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">
                {user?.user_metadata?.username || 'John Doe'}
              </Text>
              <Text className="text-gray-500">{user?.email}</Text>
              <Text className="text-indigo-600 mt-1">Pro Member</Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mt-6">
            {stats.map((stat, index) => (
              <View key={index} className="items-center">
                <Text className="text-2xl font-bold text-gray-800">{stat.value}</Text>
                <Text className="text-gray-500 text-sm">{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="px-6 mt-6">
        {/* About Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-3">About</Text>
          <Text className="text-gray-600">
            Experienced web developer and designer with a passion for creating beautiful, functional interfaces. 
            Open to barter my skills for photography lessons or home-cooked meals!
          </Text>
        </View>

        {/* Skills Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-3">My Skills</Text>
          <View className="flex-row flex-wrap">
            {skills.map((skill, index) => (
              <View key={index} className="bg-indigo-100 rounded-full px-4 py-2 mr-2 mb-2">
                <Text className="text-indigo-800">{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View>
          <Text className="text-lg font-bold text-gray-800 mb-3">Recent Barters</Text>
          {[1, 2, 3].map((item) => (
            <View key={item} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <View className="flex-row justify-between mb-2">
                <Text className="font-medium">Web Development</Text>
                <Text className="text-gray-500">2 days ago</Text>
              </View>
              <Text className="text-gray-600 mb-2">Traded with Sarah for photography session</Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text className="text-amber-600 ml-1">5.0</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;