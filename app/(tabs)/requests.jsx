import { View, Text, TouchableOpacity, FlatList, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import md5 from 'md5';

const Requests = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('received');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    getCurrentUser();
  }, []);
  
  useEffect(() => {
    if (currentUserId) {
      fetchRequests();
    }
  }, [currentUserId, activeTab]);
  
  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        Alert.alert('Error', 'You must be logged in to view requests');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error getting current user:', error);
      navigation.goBack();
    }
  };
  
  // Function to get Gravatar URL based on email
  const getGravatarUrl = (email) => {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  };
  
  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('barter_requests')
        .select(`
          *,
          barters (
            id,
            title,
            teach_skill_id,
            learn_skill_id,
            teach_skill:teach_skill_id (name),
            learn_skill:learn_skill_id (name)
          )
        `);
      
      // Filter based on active tab
      if (activeTab === 'received') {
        query = query.eq('owner_id', currentUserId);
      } else if (activeTab === 'sent') {
        query = query.eq('requester_id', currentUserId);
      } else if (activeTab === 'pending') {
        query = query.eq('requester_id', currentUserId).eq('status', 'pending');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Get user information for each request
      const userIds = data.map(request => 
        activeTab === 'received' ? request.requester_id : request.owner_id
      );
      
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
      
      // Format requests with user information
      const formattedRequests = data.map(request => {
        const otherUserId = activeTab === 'received' ? request.requester_id : request.owner_id;
        const user = userMap[otherUserId] || {};
        
        return {
          id: request.id,
          barterId: request.barter_id,
          barterTitle: request.barters?.title || 'Unknown Barter',
          teachSkill: request.barters?.teach_skill?.name || 'Unknown Skill',
          learnSkill: request.barters?.learn_skill?.name || 'Unknown Skill',
          user: user.username || 'Anonymous User',
          userEmail: user.email,
          avatar: user.email ? getGravatarUrl(user.email) : 'https://randomuser.me/api/portraits/lego/1.jpg',
          status: request.status,
          createdAt: new Date(request.created_at).toLocaleDateString()
        };
      });
      
      setRequests(formattedRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Alert.alert('Error', 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAccept = async (requestId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('barter_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Refresh the requests list
      fetchRequests();
      Alert.alert('Success', 'Request accepted!');
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDecline = async (requestId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('barter_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Refresh the requests list
      fetchRequests();
      Alert.alert('Success', 'Request declined');
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Error', 'Failed to decline request');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async (requestId) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('barter_requests')
        .delete()
        .eq('id', requestId);
        
      if (error) throw error;
      
      // Refresh the requests list
      fetchRequests();
      Alert.alert('Success', 'Request cancelled');
    } catch (error) {
      console.error('Error cancelling request:', error);
      Alert.alert('Error', 'Failed to cancel request');
    } finally {
      setLoading(false);
    }
  };
  
  const renderRequestItem = ({ item }) => {
    return (
      <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <View className="flex-row items-center mb-3">
          <Image
            source={{ uri: item.avatar }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="font-semibold">{item.user}</Text>
            <Text className="text-gray-500 text-sm">{item.createdAt}</Text>
          </View>
          
          {item.status !== 'pending' && (
            <View className={`ml-auto px-2 py-1 rounded ${item.status === 'accepted' ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-xs font-medium ${item.status === 'accepted' ? 'text-green-800' : 'text-red-800'}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          )}
        </View>
        
        <Text className="font-semibold mb-2">{item.barterTitle}</Text>
        
        <View className="flex-row mb-3">
          <View className="bg-indigo-50 rounded-full px-3 py-1 mr-2">
            <Text className="text-indigo-800 text-xs">Offers: {item.teachSkill}</Text>
          </View>
          <View className="bg-amber-50 rounded-full px-3 py-1">
            <Text className="text-amber-800 text-xs">Wants: {item.learnSkill}</Text>
          </View>
        </View>
        
        {activeTab === 'received' && item.status === 'pending' ? (
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-indigo-600 p-2 rounded items-center"
              onPress={() => handleAccept(item.id)}
            >
              <Text className="text-white font-semibold">Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-gray-200 p-2 rounded items-center"
              onPress={() => handleDecline(item.id)}
            >
              <Text className="text-gray-800 font-semibold">Decline</Text>
            </TouchableOpacity>
          </View>
        ) : activeTab === 'sent' && item.status === 'pending' ? (
          <TouchableOpacity 
            className="bg-gray-200 p-2 rounded items-center"
            onPress={() => handleCancel(item.id)}
          >
            <Text className="text-gray-800 font-semibold">Cancel Request</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };
  
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-600 pt-12 pb-4">
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Exchange Requests</Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View className="flex-row bg-white px-2 border-b border-gray-200">
        {['received', 'sent', 'pending'].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-4 px-2 ${activeTab === tab ? 'border-b-2 border-indigo-600' : ''}`}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              className={`text-center font-medium ${activeTab === tab ? 'text-indigo-600' : 'text-gray-600'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Requests List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">Loading requests...</Text>
        </View>
      ) : requests.length === 0 ? (
        <View className="flex-1 items-center justify-center p-4">
          <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
          <Text className="text-gray-500 text-lg mt-4">No {activeTab} requests found</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

export default Requests;