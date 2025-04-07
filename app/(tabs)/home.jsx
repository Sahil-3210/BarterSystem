import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import md5 from 'md5';

const Home = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [barters, setBarters] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [bookmarkedBarters, setBookmarkedBarters] = useState([]);
  const navigation = useNavigation();
  
  // Fetch barters, categories, and bookmarks on component mount
  useEffect(() => {
    fetchCategories();
    fetchBarters();
    fetchBookmarks();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('name')
        .order('name');

      if (error) throw error;
      
      // Extract skill names and add 'All' category
      const skillCategories = ['All', ...data.map(item => item.name)];
      setCategories(skillCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };
  
  // Function to get Gravatar URL based on email
  const getGravatarUrl = (email) => {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  };
  
  // Fetch user's bookmarks
  const fetchBookmarks = async () => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session) return;
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select('barter_id')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      const bookmarkedIds = data.map(item => item.barter_id);
      setBookmarkedBarters(bookmarkedIds);
      
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };
  
  const fetchBarters = async () => {
    try {
      setRefreshing(true);
  
      // Query barters with correct references to auth.users
      const { data: bartersData, error: bartersError } = await supabase
        .from('barters')
        .select(`
          *,
          teach_skill:teach_skill_id (name),
          learn_skill:learn_skill_id (name)
        `)
        .order('created_at', { ascending: false });
        
      if (bartersError) throw bartersError;
      
      // Get corresponding user profiles from public.users 
      const userIds = bartersData.map(barter => barter.user_id);
      
      // Get all users with the correct column names based on our discovered structure
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, email')
        .in('id', userIds);
        
      if (usersError) throw usersError;
      
      // Create a lookup map for user data
      const userMap = {};
      usersData.forEach(user => {
        userMap[user.id] = user;
      });
      
      // Transform barters data with user information
      const formattedBarters = bartersData.map(barter => {
        const user = userMap[barter.user_id] || {};
        return {
          id: barter.id,
          title: barter.title,
          description: barter.description,
          user: user.username || 'Anonymous User',
          userId: barter.user_id,
          userEmail: user.email,
          avatar: user.email ? getGravatarUrl(user.email) : 'https://randomuser.me/api/portraits/lego/1.jpg',
          skills: [barter.teach_skill?.name || 'Unknown Skill'],
          distance: barter.mode === 'offline' ? 'In-person' : 'Online',
          mode: barter.mode,
          rating: barter.skill_rating || 3,
          posted: formatTimeAgo(barter.created_at),
          wantedSkill: barter.learn_skill?.name || 'Unknown Skill',
          teachSkillId: barter.teach_skill_id,
          learnSkillId: barter.learn_skill_id,
          bookmarked: bookmarkedBarters.includes(barter.id)
        };
      });
      
      setBarters(formattedBarters);
  
    } catch (error) {
      console.error('Error fetching barters:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Helper function to format time ago
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const createdAt = new Date(timestamp);
    const diffInSeconds = Math.floor((now - createdAt) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + ' min ago';
    if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + ' hours ago';
    return Math.floor(diffInSeconds / 86400) + ' days ago';
  };

  // Toggle bookmark function
  const toggleBookmark = async (barterId) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session) {
        alert('Please login to bookmark barters');
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Check if already bookmarked
      const isBookmarked = bookmarkedBarters.includes(barterId);
      
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('barter_id', barterId);
          
        if (error) throw error;
        
        // Update local state
        setBookmarkedBarters(prev => prev.filter(id => id !== barterId));
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            barter_id: barterId
          });
          
        if (error) throw error;
        
        // Update local state
        setBookmarkedBarters(prev => [...prev, barterId]);
      }
      
      // Update the barters state to reflect the bookmark change
      setBarters(prev => 
        prev.map(barter => 
          barter.id === barterId 
            ? { ...barter, bookmarked: !isBookmarked } 
            : barter
        )
      );
      
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('Failed to update bookmark');
    }
  };

  // Filter barters based on selected category
  const filteredBarters = activeCategory === 'All' 
    ? barters 
    : barters.filter(barter => barter.skills.includes(activeCategory) || barter.wantedSkill === activeCategory);

  const onRefresh = () => {
    fetchBarters();
    fetchBookmarks();
  };
  
  const goToRequests = () => {
    navigation.navigate('requests');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-bold text-gray-900">Discover Barters</Text>
          <View className="flex-row">
            {/* <TouchableOpacity className="mr-4" onPress={goToRequests}>
              <Ionicons name="people-outline" size={24} color="#4f46e5" />
            </TouchableOpacity> */}
            <TouchableOpacity>
              <Ionicons name="search-outline" size={24} color="#4f46e5" />
            </TouchableOpacity>
          </View>
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
        {filteredBarters.length === 0 ? (
          <View className="flex-1 items-center justify-center py-8">
            <Ionicons name="search" size={48} color="#d1d5db" />
            <Text className="text-gray-500 text-lg mt-4">No barters found</Text>
          </View>
        ) : (
          filteredBarters.map((barter) => (
            <TouchableOpacity 
              key={barter.id} 
              className="bg-white rounded-xl p-4 mb-4 shadow-sm"
              onPress={() => navigation.navigate('barter-details', { barter })}
            >
              <View className="flex-row justify-between mb-2">
                <Text className="font-bold text-lg text-gray-900">{barter.title}</Text>
                <TouchableOpacity onPress={() => toggleBookmark(barter.id)}>
                  <Ionicons 
                    name={barter.bookmarked ? "bookmark" : "bookmark-outline"} 
                    size={20} 
                    color={barter.bookmarked ? "#4f46e5" : "#9ca3af"} 
                  />
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
              
              {/* Short description preview */}
              {barter.description ? (
                <Text className="text-gray-700 mb-3" numberOfLines={2}>
                  {barter.description}
                </Text>
              ) : null}
              
              <View className="flex-row flex-wrap mb-3">
                <View className="bg-indigo-50 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-indigo-800 text-sm">I can teach: {barter.skills[0]}</Text>
                </View>
                <View className="bg-amber-50 rounded-full px-3 py-1 mr-2 mb-2">
                  <Text className="text-amber-800 text-sm">I want to learn: {barter.wantedSkill}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between">
                <View className="flex-row items-center">
                  <Ionicons name={barter.mode === 'online' ? 'wifi-outline' : 'location-outline'} size={16} color="#6b7280" />
                  <Text className="text-gray-500 ml-1 text-sm">{barter.distance}</Text>
                </View>
                <Text className="text-gray-500 text-sm">{barter.posted}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default Home;