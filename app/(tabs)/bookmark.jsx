import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigation } from '@react-navigation/native';
import md5 from 'md5';

const Bookmark = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [bookmarkedBarters, setBookmarkedBarters] = useState([]);
  const navigation = useNavigation();

  // Fetch bookmarked barters on component mount and when screen is focused
  useEffect(() => {
    fetchBookmarkedBarters();
    
    // Refetch when screen comes into focus (returning from other screens)
    const unsubscribe = navigation.addListener('focus', () => {
      fetchBookmarkedBarters();
    });
    
    return unsubscribe;
  }, [navigation]);

  // Function to get Gravatar URL based on email
  const getGravatarUrl = (email) => {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  };

  const fetchBookmarkedBarters = async () => {
    try {
      setRefreshing(true);
      
      // Get current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session) {
        setBookmarkedBarters([]);
        return;
      }
      
      // Get the auth user ID
      const authUserId = sessionData.session.user.id;
      
      // Get the corresponding user from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUserId)
        .single();
        
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
      
      const userId = userData ? userData.id : authUserId;
      
      // Fetch bookmarked barter IDs
      const { data: bookmarkData, error: bookmarkError } = await supabase
        .from('bookmarks')
        .select('barter_id')
        .eq('user_id', userId);
        
      if (bookmarkError) throw bookmarkError;
      
      if (bookmarkData.length === 0) {
        setBookmarkedBarters([]);
        return;
      }
      
      // Get the actual barter data for bookmarked IDs
      const barterIds = bookmarkData.map(item => item.barter_id);
      
      const { data: bartersData, error: bartersError } = await supabase
        .from('barters')
        .select(`
          *,
          teach_skill:teach_skill_id (name),
          learn_skill:learn_skill_id (name)
        `)
        .in('id', barterIds);
        
      if (bartersError) throw bartersError;
      
      // Get user data for these barters
      const userIds = bartersData.map(barter => barter.user_id);
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, email')
        .in('id', userIds);
        
      if (usersError) throw usersError;
      
      // Create user lookup map
      const userMap = {};
      usersData.forEach(user => {
        userMap[user.id] = user;
      });
      
      // Format barters with user data
      const formattedBarters = bartersData.map(barter => {
        const user = userMap[barter.user_id] || {};
        return {
          id: barter.id,
          title: barter.title,
          description: barter.description,
          user: user.username || 'Anonymous User',
          avatar: user.email ? getGravatarUrl(user.email) : 'https://randomuser.me/api/portraits/lego/1.jpg',
          skills: [barter.teach_skill?.name || 'Unknown Skill'],
          distance: barter.mode === 'offline' ? 'In-person' : 'Online',
          mode: barter.mode,
          rating: barter.skill_rating || 3,
          expiresIn: getExpiryText(barter.created_at),
          wantedSkill: barter.learn_skill?.name || 'Unknown Skill',
          bookmarked: true
        };
      });
      
      setBookmarkedBarters(formattedBarters);
      
    } catch (error) {
      console.error('Error fetching bookmarked barters:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Helper function to calculate expiry text
  const getExpiryText = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffDays = Math.ceil((now - created) / (1000 * 60 * 60 * 24));
    const daysLeft = 30 - diffDays; // Assuming barters expire after 30 days
    
    if (daysLeft <= 0) return 'Expired';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft} days left`;
  };

  // Remove bookmark function
  const toggleBookmark = async (barterId) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      
      if (!sessionData.session) return;
      
      // Get the auth user ID
      const authUserId = sessionData.session.user.id;
      
      // Get the corresponding user from the users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', authUserId)
        .single();
        
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
      
      const userId = userData ? userData.id : authUserId;
      
      // Delete bookmark
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('barter_id', barterId);
        
      if (error) throw error;
      
      // Update local state
      setBookmarkedBarters(prev => prev.filter(barter => barter.id !== barterId));
      
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  // Filter barters based on selected filter
  const filteredBarters = (() => {
    if (activeFilter === 'All') return bookmarkedBarters;
    if (activeFilter === 'Nearby') return bookmarkedBarters.filter(barter => barter.mode === 'offline');
    if (activeFilter === 'Expiring Soon') {
      return bookmarkedBarters.filter(barter => {
        const days = parseInt(barter.expiresIn.split(' ')[0]);
        return !isNaN(days) && days <= 7; // 7 days or less
      });
    }
    return bookmarkedBarters;
  })();

  const onRefresh = () => {
    fetchBookmarkedBarters();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-12 pb-4 border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900 mb-4">Saved Barters</Text>
        
        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === 'All' ? 'bg-indigo-100' : 'bg-white border border-gray-200'}`}
            onPress={() => setActiveFilter('All')}
          >
            <Text className={activeFilter === 'All' ? 'text-indigo-800 font-medium' : 'text-gray-600'}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full mr-2 ${activeFilter === 'Nearby' ? 'bg-indigo-100' : 'bg-white border border-gray-200'}`}
            onPress={() => setActiveFilter('Nearby')}
          >
            <Text className={activeFilter === 'Nearby' ? 'text-indigo-800 font-medium' : 'text-gray-600'}>Nearby</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className={`px-4 py-2 rounded-full ${activeFilter === 'Expiring Soon' ? 'bg-indigo-100' : 'bg-white border border-gray-200'}`}
            onPress={() => setActiveFilter('Expiring Soon')}
          >
            <Text className={activeFilter === 'Expiring Soon' ? 'text-indigo-800 font-medium' : 'text-gray-600'}>Expiring Soon</Text>
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
        {filteredBarters.length > 0 ? (
          filteredBarters.map((barter) => (
            <TouchableOpacity 
              key={barter.id} 
              className="bg-white rounded-xl p-4 mb-4 shadow-sm"
              onPress={() => navigation.navigate('barter-details', { barter })}
            >
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
                <Text className={`text-sm ${barter.expiresIn === 'Expired' ? 'text-red-500' : (parseInt(barter.expiresIn) <= 3 ? 'text-red-500' : 'text-gray-500')}`}>
                  {barter.expiresIn}
                </Text>
              </View>
            </TouchableOpacity>
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