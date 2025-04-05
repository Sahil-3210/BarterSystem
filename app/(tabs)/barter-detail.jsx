import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import md5 from 'md5';

const BarterDetail = ({ route, navigation }) => {
  const { barter } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    getCurrentUser();
  }, []);
  
  const getCurrentUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };
  
  const handleRequest = async () => {
    if (!currentUserId) {
      Alert.alert('Error', 'You must be logged in to send a request');
      return;
    }
    
    if (currentUserId === barter.userId) {
      Alert.alert('Error', 'You cannot send a request to your own barter');
      return;
    }
    
    try {
      setLoading(true);
      
      // Check if request already exists
      const { data: existingRequests, error: checkError } = await supabase
        .from('barter_requests')
        .select('*')
        .eq('barter_id', barter.id)
        .eq('requester_id', currentUserId);
        
      if (checkError) throw checkError;
      
      if (existingRequests && existingRequests.length > 0) {
        Alert.alert('Request Exists', 'You have already sent a request for this barter');
        setLoading(false);
        return;
      }
      
      // Create new request
      const { data, error } = await supabase
        .from('barter_requests')
        .insert({
          barter_id: barter.id,
          requester_id: currentUserId,
          owner_id: barter.userId,
          status: 'pending',
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      Alert.alert('Success', 'Your request has been sent!');
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigation.goBack();
  };
  
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header with back button */}
      <View className="bg-indigo-600 pt-12 pb-4">
        <View className="flex-row items-center px-4">
          <TouchableOpacity onPress={handleCancel} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Barter Details</Text>
        </View>
      </View>
      
      {/* Barter Card */}
      <View className="mx-4 -mt-4 bg-white rounded-t-xl shadow-sm">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">{barter.title}</Text>
          
          <View className="flex-row items-center mt-4">
            <Image
              source={{ uri: barter.avatar }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View>
              <Text className="font-semibold text-lg">{barter.user}</Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#f59e0b" />
                <Text className="text-amber-600 ml-1">{barter.rating}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Description */}
        <View className="p-4 border-b border-gray-100">
          <Text className="text-lg font-semibold mb-2">Description</Text>
          <Text className="text-gray-700">
            {barter.description}
          </Text>
        </View>
        
        {/* Skills Exchange */}
        <View className="p-4 border-b border-gray-100">
          <Text className="text-lg font-semibold mb-2">Skills Exchange</Text>
          
          <View className="flex-row mb-4 items-center">
            <View className="w-6 h-6 rounded-full bg-indigo-100 items-center justify-center mr-2">
              <Ionicons name="checkmark" size={16} color="#4f46e5" />
            </View>
            <Text className="text-gray-800">Offers: {barter.skills[0]}</Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-amber-100 items-center justify-center mr-2">
              <Ionicons name="arrow-forward" size={16} color="#f59e0b" />
            </View>
            <Text className="text-gray-800">Wants: {barter.wantedSkill}</Text>
          </View>
        </View>
        
        {/* Details */}
        <View className="p-4 border-b border-gray-100">
          <Text className="text-lg font-semibold mb-2">Details</Text>
          
          <View className="flex-row mb-2">
            <Ionicons name={barter.mode === 'online' ? 'wifi-outline' : 'location-outline'} size={18} color="#6b7280" />
            <Text className="text-gray-700 ml-2">{barter.distance}</Text>
          </View>
          
          <View className="flex-row">
            <Ionicons name="time-outline" size={18} color="#6b7280" />
            <Text className="text-gray-700 ml-2">Posted {barter.posted}</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View className="p-4 flex-row space-x-4">
          <TouchableOpacity
            className="flex-1 bg-indigo-600 p-4 rounded-xl items-center"
            onPress={handleRequest}
            disabled={loading || currentUserId === barter.userId}
          >
            <Text className="text-white font-bold text-lg">
              {loading ? 'Sending...' : 'Request Exchange'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 bg-gray-200 p-4 rounded-xl items-center"
            onPress={handleCancel}
          >
            <Text className="text-gray-800 font-bold text-lg">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default BarterDetail;