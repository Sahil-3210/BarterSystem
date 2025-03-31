// import React, { useState } from 'react';
// import { View, Text, TextInput, Button } from 'react-native';
// import { Link } from 'expo-router';
// import { useAuth } from '../../lib/AuthContext';

// const SignIn = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { signIn } = useAuth();

//   const handleSignIn = async () => {
//     signIn(email, password);
//   };

//   return (
//     <View className="flex-1 justify-center p-5">
//       <Text className="text-2xl font-bold mb-5 text-center">Sign In</Text>
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
//       <Button title="Sign In" onPress={handleSignIn} />
//       <Link href="/(auth)/sign-up" className="mt-3 text-blue-500 text-center">
//         Don't have an account? Sign Up
//       </Link>
//     </View>
//   );
// };

// export default SignIn;



import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../lib/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    signIn(email, password);
  };

  return (
    <View className="flex-1 bg-gray-50 justify-center p-6">
      {/* Logo/Header Section */}
      <View className="items-center mb-10">
        <Image 
          source={require('../../assets/favicon.png')} // Replace with your logo
          className="w-24 h-24 mb-4"
        />
        <Text className="text-3xl font-bold text-gray-800">Welcome Back</Text>
        <Text className="text-gray-500 mt-2">Sign in to continue</Text>
      </View>

      {/* Form Section */}
      <View className="mb-6">
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
        <View className="flex-row items-center bg-white rounded-lg border border-gray-200 px-4 py-3 mb-2">
          <Ionicons name="lock-closed-outline" size={20} color="#6b7280" className="mr-2" />
          <TextInput
            placeholder="Enter your password"
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

        <TouchableOpacity className="self-end mb-6">
          <Text className="text-indigo-600 text-sm font-medium">Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-indigo-600 py-3 rounded-lg items-center"
          onPress={handleSignIn}
        >
          <Text className="text-white font-bold text-lg">Sign In</Text>
        </TouchableOpacity>
      </View>

      {/* Social Login Options */}
      <View className="mb-8">
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-gray-200" />
          <Text className="mx-4 text-gray-500">Or continue with</Text>
          <View className="flex-1 h-px bg-gray-200" />
        </View>

        <View className="flex-row justify-center space-x-4">
          <TouchableOpacity className="border border-gray-200 rounded-full p-3">
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          {/* <TouchableOpacity className="border border-gray-200 rounded-full p-3">
            <Ionicons name="logo-apple" size={24} color="#000000" />
          </TouchableOpacity>
          <TouchableOpacity className="border border-gray-200 rounded-full p-3">
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Sign Up Link */}
      <View className="flex-row justify-center">
        <Text className="text-gray-600">Don't have an account? </Text>
        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <Text className="text-indigo-600 font-medium">Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default SignIn;