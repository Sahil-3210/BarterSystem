import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Sample data
  const categories = ['All', 'Development', 'Design', 'Marketing', 'Writing'];
  const barters = [
    {
      id: '1',
      title: 'Web Development for Photography',
      user: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      skills: ['JavaScript', 'React'],
      distance: '2.5 km away',
      rating: 4.8,
      posted: '2 hours ago'
    },
    {
      id: '2',
      title: 'Logo Design for Social Media',
      user: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      skills: ['Illustrator', 'Branding'],
      distance: '5.1 km away',
      rating: 4.5,
      posted: '1 day ago'
    },
    {
      id: '3',
      title: 'Content Writing for Tutoring',
      user: 'David Wilson',
      avatar: 'https://randomuser.me/api/portraits/men/67.jpg',
      skills: ['Blogging', 'Editing'],
      distance: '1.2 km away',
      rating: 4.9,
      posted: '3 days ago'
    },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Discover Barters</Text>
          <TouchableOpacity>
            <Ionicons name="search-outline" size={24} color="#4f46e5" />
          </TouchableOpacity>
        </View>
        
        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="mb-4"
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              className={`px-4 py-2 mr-2 rounded-full ${activeCategory === category ? 'bg-indigo-600' : 'bg-gray-200'}`}
              onPress={() => setActiveCategory(category)}
            >
              <Text className={`font-medium ${activeCategory === category ? 'text-white' : 'text-gray-700'}`}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Barters List */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
          />
        }
      >
        {barters.map((barter) => (
          <TouchableOpacity 
            key={barter.id} 
            className="bg-white rounded-xl p-4 mb-4 shadow-sm"
            onPress={() => console.log('Navigate to barter details')}
          >
            <View className="flex-row justify-between mb-2">
              <Text className="font-bold text-lg text-gray-900">{barter.title}</Text>
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            
            <View className="flex-row items-center mb-3">
              <Image
                source={{ uri: barter.avatar }}
                className="w-8 h-8 rounded-full mr-2"
              />
              <Text className="text-gray-700">{barter.user}</Text>
              <View className="flex-row items-center ml-auto">
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text className="text-amber-600 ml-1">{barter.rating}</Text>
              </View>
            </View>
            
            <View className="flex-row flex-wrap mb-3">
              {barter.skills.map((skill, index) => (
                <View key={index} className="bg-indigo-50 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-indigo-800 text-sm">{skill}</Text>
                </View>
              ))}
            </View>
            
            <View className="flex-row justify-between">
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text className="text-gray-500 ml-1 text-sm">{barter.distance}</Text>
              </View>
              <Text className="text-gray-500 text-sm">{barter.posted}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Home;