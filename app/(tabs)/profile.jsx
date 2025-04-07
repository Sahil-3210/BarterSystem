import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import md5 from 'md5'; // Add this import

const Profile = () => {
  const { session, signOut } = useAuth();
  const user = session?.user;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [barters, setBarters] = useState([]);
  const [stats, setStats] = useState({
    barterCount: 0,
    skillCount: 0,
    rating: 0
  });

  const getGravatarUrl = (email) => {
    const hash = md5(email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`;
  };

  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch profile data
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle() instead of single()
          
        // If no profile exists, create one
        if (!profileData) {
          const newProfile = {
            user_id: user.id,
            bio: '',
            avatar_url: user?.user_metadata?.avatar_url || null,
            location: '',
            pro_member: false,
            social_links: {},
            contact_info: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { data: insertData, error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();
            
          if (insertError) throw insertError;
          profileData = insertData;
        }
        
        setProfile(profileData);
        
        // Fetch user skills
        const { data: userSkills, error: skillsError } = await supabase
          .from('user_skills')
          .select('skill_id, skills(id, name)')
          .eq('user_id', user.id);
          
        if (skillsError) throw skillsError;
        
        // Extract skill names from the joined data
        const skillNames = userSkills
          ?.filter(item => item.skills) // Filter out any null joins
          .map(item => item.skills.name) || [];
          
        setSkills(skillNames);
        
        // Fetch recent barters
        const { data: barterData, error: barterError } = await supabase
          .from('barters')
          .select(`
            id,
            title,
            description,
            mode,
            created_at,
            teach_skill_id,
            learn_skill_id,
            skill_rating
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (barterError) throw barterError;
        
        // If we have barter data, fetch the related skill names
        if (barterData && barterData.length > 0) {
          // Get all unique skill IDs from teach and learn fields
          const skillIds = [...new Set([
            ...barterData.map(b => b.teach_skill_id).filter(Boolean),
            ...barterData.map(b => b.learn_skill_id).filter(Boolean)
          ])];
          
          // Fetch skill names if we have any IDs
          if (skillIds.length > 0) {
            const { data: skillNames, error: skillLookupError } = await supabase
              .from('skills')
              .select('id, name')
              .in('id', skillIds);
              
            if (!skillLookupError && skillNames) {
              // Create a lookup map for skill names
              const skillMap = {};
              skillNames.forEach(skill => {
                skillMap[skill.id] = skill.name;
              });
              
              // Add skill names to barter objects
              barterData.forEach(barter => {
                if (barter.teach_skill_id) {
                  barter.teach_skill_name = skillMap[barter.teach_skill_id];
                }
                if (barter.learn_skill_id) {
                  barter.learn_skill_name = skillMap[barter.learn_skill_id];
                }
              });
            }
          }
        }
        
        setBarters(barterData || []);
        
        // Calculate stats
        const { count: barterCount } = await supabase
          .from('barters')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        // Get average rating
        const { data: ratingData } = await supabase
          .from('barters')
          .select('skill_rating')
          .eq('user_id', user.id)
          .not('skill_rating', 'is', null);
          
        let avgRating = 0;
        if (ratingData && ratingData.length > 0) {
          const sum = ratingData.reduce((acc, barter) => acc + barter.skill_rating, 0);
          avgRating = (sum / ratingData.length).toFixed(1);
        }
        
        setStats({
          barterCount: barterCount || 0,
          skillCount: skillNames.length || 0,
          rating: avgRating
        });
        
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-indigo-600 pb-6 pt-12 px-6 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-2xl font-bold text-white">My Profile</Text>
          <TouchableOpacity onPress={signOut}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <View className="flex-row items-center">
            {/* <Image
              source={{ uri: profile?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg' }}
              className="w-20 h-20 rounded-full border-4 border-indigo-100"
            /> */}
            <Image
              source={{ 
                uri: user?.email 
                  ? getGravatarUrl(user.email) 
                  : (profile?.avatar_url || 'https://randomuser.me/api/portraits/men/1.jpg')
              }}
              className="w-20 h-20 rounded-full border-4 border-indigo-100"
            />
            <View className="ml-4 flex-1">
              <Text className="text-xl font-bold text-gray-800">
                {user?.user_metadata?.username || user?.email?.split('@')[0]}
              </Text>
              <Text className="text-gray-500">{user?.email}</Text>
              <Text className="text-indigo-600 mt-1">
                {profile?.pro_member ? 'Pro Member' : 'Free Member'}
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row justify-between mt-6">
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">{stats.barterCount}</Text>
              <Text className="text-gray-500 text-sm">Barters</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">{stats.skillCount}</Text>
              <Text className="text-gray-500 text-sm">Skills</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-gray-800">{stats.rating}</Text>
              <Text className="text-gray-500 text-sm">Rating</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="px-6 mt-6">
        {/* About Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-3">About</Text>
          <Text className="text-gray-600">
            {profile?.bio || 'No bio provided yet. Tell others about your skills and what you\'re looking to barter!'}
          </Text>
        </View>

        {/* Skills Section */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-3">My Skills</Text>
          <View className="flex-row flex-wrap">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <View key={index} className="bg-indigo-100 rounded-full px-4 py-2 mr-2 mb-2">
                  <Text className="text-indigo-800">{skill}</Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500">No skills added yet.</Text>
            )}
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-3">Recent Barters</Text>
          {barters.length > 0 ? (
            barters.map((barter) => (
              <View key={barter.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-medium">{barter.title || 'Unnamed Barter'}</Text>
                  <Text className="text-gray-500">
                    {new Date(barter.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text className="text-gray-600 mb-2">
                  {barter.mode === 'teach' 
                    ? `Teaching ${barter.teach_skill_name || 'a skill'}`
                    : `Learning ${barter.learn_skill_name || 'a skill'}`}
                </Text>
                {barter.skill_rating ? (
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={16} color="#f59e0b" />
                    <Text className="text-amber-600 ml-1">{barter.skill_rating.toFixed(1)}</Text>
                  </View>
                ) : null}
              </View>
            ))
          ) : (
            <Text className="text-gray-500">No barters yet.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;