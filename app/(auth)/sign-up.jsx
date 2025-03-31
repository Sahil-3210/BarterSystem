// import React, { useState } from 'react';
// import { View, Text, TextInput, Button, Alert } from 'react-native';
// import { Link } from 'expo-router';
// import { useAuth } from '../../lib/AuthContext';

// const SignUp = () => {
//   const [username, setUsername] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const { signUp } = useAuth();

//   const handleSignUp = async () => {
//     if (password !== confirmPassword) {
//       Alert.alert('Passwords do not match');
//       return;
//     }

//     signUp(email, password, username);
//   };

//   return (
//     <View className="flex-1 justify-center p-5">
//       <Text className="text-2xl font-bold mb-5 text-center">Sign Up</Text>
//       <TextInput
//         className="border border-gray-300 rounded p-2 mb-3"
//         placeholder="Username"
//         value={username}
//         onChangeText={setUsername}
//       />
//       <TextInput
//         className="border border-gray-300 rounded p-2 mb-3"
//         placeholder="Email"
//         keyboardType="email-address"
//         value={email}
//         onChangeText={setEmail}
//       />
//       <TextInput
//         className="border border-gray-300 rounded p-2 mb-3"
//         placeholder="Password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />
//       <TextInput
//         className="border border-gray-300 rounded p-2 mb-3"
//         placeholder="Confirm Password"
//         secureTextEntry
//         value={confirmPassword}
//         onChangeText={setConfirmPassword}
//       />
//       <Button title="Sign Up" onPress={handleSignUp} />
//       <Link href="/(auth)/sign-in" className="mt-3 text-blue-500 text-center">
//         Already have an account? Sign In
//       </Link>
//     </View>
//   );
// };

// export default SignUp;


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    signUp(email, password, username);
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center p-6">
      {/* Logo/Header Section */}
      <View className="items-center mb-8">
        <Image 
          source={require('../../assets/favicon.png')} // Replace with your logo
          className="w-24 h-24 mb-4"
        />
        <Text className="text-3xl font-bold text-gray-800">Create Account</Text>
        <Text className="text-gray-500 mt-2">Join our community today</Text>
      </View>

      {/* Form Section */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-1">Username</Text>
        <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
          <Ionicons name="person-outline" size={20} color="#6b7280" className="mr-2" />
          <TextInput
            placeholder="Choose a username"
            className="flex-1 text-gray-700"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1">Email Address</Text>
        <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
          <Ionicons name="mail-outline" size={20} color="#6b7280" className="mr-2" />
          <TextInput
            placeholder="Enter your email"
            className="flex-1 text-gray-700"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
        <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4">
          <Ionicons name="lock-closed-outline" size={20} color="#6b7280" className="mr-2" />
          <TextInput
            placeholder="Create a password"
            className="flex-1 text-gray-700"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-medium text-gray-700 mb-1">Confirm Password</Text>
        <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-4 py-3 mb-6">
          <Ionicons name="lock-closed-outline" size={20} color="#6b7280" className="mr-2" />
          <TextInput
            placeholder="Confirm your password"
            className="flex-1 text-gray-700"
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons 
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-indigo-600 py-3 rounded-lg items-center"
          onPress={handleSignUp}
        >
          <Text className="text-white font-bold text-lg">Sign Up</Text>
        </TouchableOpacity>
      </View>

      {/* Terms and Conditions */}
      <Text className="text-center text-gray-500 text-xs mb-6 px-8">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </Text>

      {/* Sign In Link */}
      <View className="flex-row justify-center">
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/(auth)/sign-in" asChild>
          <TouchableOpacity>
            <Text className="text-indigo-600 font-medium">Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default SignUp;
