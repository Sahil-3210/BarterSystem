import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

const Create = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('online'); // 'online' or 'offline'
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [rating, setRating] = useState(3);
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);

  // Sample data - replace with your actual categories
  const categories = [
    { id: '1', name: 'Technology', subcategories: ['Web Development', 'Mobile Development'] },
    { id: '2', name: 'Design', subcategories: ['Graphic Design', 'UI/UX'] },
    { id: '3', name: 'Writing', subcategories: ['Content Writing', 'Copywriting'] },
  ];

  const pickThumbnail = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setThumbnail(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!title || !description || !category || !subcategory) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newBarter = {
      title,
      description,
      mode,
      category,
      subcategory,
      rating,
      thumbnail,
      video,
      createdAt: new Date().toISOString()
    };

    console.log('Submitting:', newBarter);
    Alert.alert('Success', 'Barter created successfully!');
    // Here you would typically send to your backend/Supabase
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <Text className="text-2xl font-bold mb-6">Create New Barter</Text>

      {/* Thumbnail Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Thumbnail Image</Text>
        <TouchableOpacity 
          onPress={pickThumbnail}
          className="border-2 border-dashed border-gray-300 rounded-xl h-40 justify-center items-center"
        >
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} className="w-full h-full rounded-xl" />
          ) : (
            <View className="items-center">
              <Ionicons name="image-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">Tap to add thumbnail</Text>
              <Text className="text-gray-400 text-sm">Recommended: 800x600px</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Video Section */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Video (Optional)</Text>
        <TouchableOpacity 
          onPress={pickVideo}
          className="border-2 border-dashed border-gray-300 rounded-xl h-40 justify-center items-center"
        >
          {video ? (
            <View className="w-full h-full rounded-xl bg-black justify-center items-center">
              <Ionicons name="play-circle-outline" size={48} color="white" />
            </View>
          ) : (
            <View className="items-center">
              <Ionicons name="videocam-outline" size={32} color="#9ca3af" />
              <Text className="text-gray-500 mt-2">Tap to add video</Text>
              <Text className="text-gray-400 text-sm">Max 2 minutes</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Title*</Text>
        <TextInput
          placeholder="e.g. Web Development for Photography"
          className="bg-white p-4 rounded-xl border border-gray-200"
          value={title}
          onChangeText={setTitle}
        />
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
          onChangeText={setDescription}
        />
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

      {/* Category Selection */}
      <View className="mb-6">
        <Text className="text-lg font-semibold mb-2">Category*</Text>
        <View className="flex-row flex-wrap gap-2">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className={`px-4 py-2 rounded-full ${category === cat.name ? 'bg-indigo-600' : 'bg-gray-200'}`}
              onPress={() => {
                setCategory(cat.name);
                setSubcategory('');
              }}
            >
              <Text className={category === cat.name ? 'text-white' : 'text-gray-700'}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Subcategory Selection */}
      {category && (
        <View className="mb-6">
          <Text className="text-lg font-semibold mb-2">Subcategory*</Text>
          <View className="flex-row flex-wrap gap-2">
            {categories
              .find(c => c.name === category)
              ?.subcategories.map((subcat, index) => (
                <TouchableOpacity
                  key={index}
                  className={`px-4 py-2 rounded-full ${subcategory === subcat ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  onPress={() => setSubcategory(subcat)}
                >
                  <Text className={subcategory === subcat ? 'text-white' : 'text-gray-700'}>
                    {subcat}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      )}

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