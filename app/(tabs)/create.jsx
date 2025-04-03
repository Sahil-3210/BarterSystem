import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Assuming you have supabase client setup

const Create = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('online'); // 'online' or 'offline'
  const [rating, setRating] = useState(3);
  const [userSkills, setUserSkills] = useState([]); // Skills the user knows
  const [otherSkills, setOtherSkills] = useState([]); // Skills the user doesn't know
  const [selectedTeachSkill, setSelectedTeachSkill] = useState(null); // What I can teach
  const [selectedLearnSkill, setSelectedLearnSkill] = useState(null); // What I want to learn
  const [loading, setLoading] = useState(true);
  
  // Fetch user skills and all available skills on component mount
  useEffect(() => {
    fetchUserSkills();
  }, []);
  
  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a barter');
        return;
      }
      
      // Get user's skills
      const { data: userSkillsData, error: userSkillsError } = await supabase
        .from('user_skills')
        .select('skill_id')
        .eq('user_id', user.id);
        
      if (userSkillsError) throw userSkillsError;
      
      // Get all skill details
      const { data: allSkills, error: allSkillsError } = await supabase
        .from('skills')
        .select('*');
        
      if (allSkillsError) throw allSkillsError;
      
      // Extract user skill IDs
      const userSkillIds = userSkillsData.map(item => item.skill_id);
      
      // Filter skills the user has
      const mySkills = allSkills.filter(skill => userSkillIds.includes(skill.id));
      
      // Filter skills the user doesn't have
      const skillsToLearn = allSkills.filter(skill => !userSkillIds.includes(skill.id));
      
      setUserSkills(mySkills);
      setOtherSkills(skillsToLearn);
    } catch (error) {
      console.error('Error fetching skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !selectedTeachSkill || !selectedLearnSkill) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a barter');
        return;
      }
      
      // Create new barter in your Supabase table
      const { data, error } = await supabase
        .from('barters') // Assuming you have a barters table
        .insert({
          title,
          description,
          mode,
          user_id: user.id,
          teach_skill_id: selectedTeachSkill.id,
          learn_skill_id: selectedLearnSkill.id,
          skill_rating: rating,
          created_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      Alert.alert('Success', 'Barter created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setMode('online');
      setRating(3);
      setSelectedTeachSkill(null);
      setSelectedLearnSkill(null);
      
    } catch (error) {
      console.error('Error creating barter:', error);
      Alert.alert('Error', 'Failed to create barter');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-6">Create New Barter</Text>

      {/* Title */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Title*</Text>
        <TextInput
          placeholder="e.g. Web Development for Photography"
          className="bg-white p-4 rounded-xl border border-gray-200"
          value={title}
          onChangeText={(text) => setTitle(text.slice(0, 100))}
          maxLength={100}
        />
        <Text className="text-right text-gray-500 mt-1">{title.length}/100</Text>
      </View>

      {/* Description */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Description*</Text>
        <TextInput
          placeholder="Describe what you're offering and what you want in return..."
          className="bg-white p-4 rounded-xl border border-gray-200 h-32 textAlignVertical='top'"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={(text) => setDescription(text.slice(0, 150))}
          maxLength={150}
        />
        <Text className="text-right text-gray-500 mt-1">{description.length}/150</Text>
      </View>

      {/* Mode Selection */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Barter Mode*</Text>
        <View className="flex-row space-x-4">
          <TouchableOpacity
            className={`flex-1 p-3 rounded-xl border ${mode === 'online' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
            onPress={() => setMode('online')}
          >
            <View className="flex-row items-center space-x-2">
              <Ionicons 
                name="wifi-outline" 
                size={20} 
                color={mode === 'online' ? '#4f46e5' : '#6b7280'} 
              />
              <Text className={mode === 'online' ? 'text-indigo-600 font-medium' : 'text-gray-600'}>
                Online
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 p-3 rounded-xl border ${mode === 'offline' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
            onPress={() => setMode('offline')}
          >
            <View className="flex-row items-center space-x-2">
              <Ionicons 
                name="location-outline" 
                size={20} 
                color={mode === 'offline' ? '#4f46e5' : '#6b7280'} 
              />
              <Text className={mode === 'offline' ? 'text-indigo-600 font-medium' : 'text-gray-600'}>
                In-Person
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* What I Can Teach Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">What I Can Teach*</Text>
        {loading ? (
          <Text className="text-gray-500">Loading your skills...</Text>
        ) : userSkills.length === 0 ? (
          <Text className="text-gray-500">You haven't added any skills to your profile yet.</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {userSkills.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                className={`px-4 py-2 rounded-full ${selectedTeachSkill?.id === skill.id ? 'bg-indigo-600' : 'bg-gray-200'}`}
                onPress={() => setSelectedTeachSkill(skill)}
              >
                <Text className={selectedTeachSkill?.id === skill.id ? 'text-white' : 'text-gray-700'}>
                  {skill.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* What I Want To Learn Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">What I Want To Learn*</Text>
        {loading ? (
          <Text className="text-gray-500">Loading available skills...</Text>
        ) : otherSkills.length === 0 ? (
          <Text className="text-gray-500">You already know all available skills!</Text>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {otherSkills.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                className={`px-4 py-2 rounded-full ${selectedLearnSkill?.id === skill.id ? 'bg-indigo-600' : 'bg-gray-200'}`}
                onPress={() => setSelectedLearnSkill(skill)}
              >
                <Text className={selectedLearnSkill?.id === skill.id ? 'text-white' : 'text-gray-700'}>
                  {skill.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Self Rating */}
      <View className="mb-8">
        <Text className="text-lg font-semibold mb-2">Your Skill Level*</Text>
        <View className="flex-row justify-between">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color={star <= rating ? '#f59e0b' : '#d1d5db'}
              />
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row justify-between mt-1">
          <Text className="text-gray-500 text-sm">Beginner</Text>
          <Text className="text-gray-500 text-sm">Expert</Text>
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="bg-indigo-600 p-4 rounded-xl items-center mb-8"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-lg">Post Barter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Create;