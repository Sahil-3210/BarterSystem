import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const Bookmark = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [bookmarkedBarters, setBookmarkedBarters] = useState([
    {
      id: '1',
      title: 'Web Development for Photography',
      user: 'Sarah Johnson',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      skills: ['JavaScript', 'React'],
      distance: '2.5 km away',
      rating: 4.8,
      expiresIn: '3 days left',
      bookmarked: true
    },
    {
      id: '2',
      title: 'Graphic Design for Copywriting',
      user: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      skills: ['Photoshop', 'Illustrator'],
      distance: '5.1 km away',
      rating: 4.5,
      expiresIn: '1 day left',
      bookmarked: true
    },
  ]);

  const toggleBookmark = (id) => {
    setBookmarkedBarters(prev => 
      prev.filter(item => item.id !== id)
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Saved Barters</Text>
        
        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <TouchableOpacity className="bg-indigo-100 px-4 py-2 rounded-full mr-2">
            <Text className="text-indigo-800 font-medium">All</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-gray-200 px-4 py-2 rounded-full mr-2">
            <Text className="text-gray-600">Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white border border-gray-200 px-4 py-2 rounded-full">
            <Text className="text-gray-600">Expiring Soon</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bookmarked Barters List */}
      <ScrollView 
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4f46e5']}
          />
        }
      >
        {bookmarkedBarters.length > 0 ? (
          bookmarkedBarters.map((barter) => (
            <View key={barter.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-lg text-gray-900">{barter.title}</Text>
                <TouchableOpacity onPress={() => toggleBookmark(barter.id)}>
                  <Ionicons name="bookmark" size={20} color="#4f46e5" />
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
                <Text className="text-red-500 text-sm">{barter.expiresIn}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="bookmark-outline" size={48} color="#d1d5db" />
            <Text className="text-gray-400 text-lg mt-4">No saved barters yet</Text>
            <Text className="text-gray-400 text-center mt-2 px-10">
              Tap the bookmark icon on barters to save them here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Bookmark;