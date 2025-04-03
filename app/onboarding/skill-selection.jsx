import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import { useGlobalContext } from '../../context/GlobalProvider';

const SkillSelection = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const router = useRouter();
  const { session } = useAuth();
  const { setSkillsSelected } = useGlobalContext();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name');

        if (categoryError) {
          Alert.alert('Error', categoryError.message);
        } else {
          setCategories(categoryData || []);
        }

        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('subcategories')
          .select('id, name, category_id');

        if (subcategoryError) {
          Alert.alert('Error', subcategoryError.message);
        } else {
          setSubcategories(subcategoryData || []);
        }

        const { data: skillData, error: skillError } = await supabase
          .from('skills')
          .select('id, name, subcategory_id');

        if (skillError) {
          Alert.alert('Error', skillError.message);
        } else {
          setSkills(skillData || []);
        }
      } catch (error) {
        Alert.alert('Error', error.message);
      }
    };

    fetchCategories();
  }, []);

  const handleSkillSelect = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      setSelectedSkills(selectedSkills.filter((id) => id !== skillId));
    } else {
      if (selectedSkills.length < 3) {
        setSelectedSkills([...selectedSkills, skillId]);
      } else {
        Alert.alert('Limit Reached', 'You can select a maximum of 3 skills.');
      }
    }
  };

  const handleSaveSkills = async () => {
    if (!session?.user?.id) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      router.push('/(auth)/sign-in');
      return;
    }

    if (selectedSkills.length === 0) {
      Alert.alert('Warning', 'Please select at least one skill.');
      return;
    }

    try {
      // First delete any existing user skills (in case this is an update)
      await supabase
        .from('user_skills')
        .delete()
        .eq('user_id', session.user.id);

      // Then insert the new selected skills
      const { error } = await supabase
        .from('user_skills')
        .insert(
          selectedSkills.map((skillId) => ({
            user_id: session.user.id,
            skill_id: skillId,
          }))
        );

      if (error) {
        console.error('Error saving skills:', error);
        Alert.alert('Error', 'Failed to save skills. Please try again.');
        return;
      }

      // Update the skills_selected status in the users table
      const { error: updateError } = await supabase
        .from('users')
        .update({ skills_selected: true })
        .eq('id', session.user.id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
        return;
      }

      // Update the global context
      setSkillsSelected(true);
      
      Alert.alert('Success', 'Skills saved successfully!');
      router.push('/(tabs)/home');
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const skillsRemaining = 3 - selectedSkills.length;

  const styles = StyleSheet.create({
    // Styles remain the same as in your original code
    categoryButton: {
      padding: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 10,
    },
    selectedCategoryButton: {
      backgroundColor: '#007bff',
      borderColor: '#007bff',
    },
    categoryText: {
      textAlign: 'center',
    },
    selectedCategoryText: {
      color: '#fff',
    },
    subcategoryButton: {
      padding: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 10,
    },
    selectedSubcategoryButton: {
      backgroundColor: '#007bff',
      borderColor: '#007bff',
    },
    subcategoryText: {
      textAlign: 'center',
    },
    selectedSubcategoryText: {
      color: '#fff',
    },
    skillButton: {
      padding: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: '#ccc',
      marginBottom: 10,
    },
    selectedSkillButton: {
      backgroundColor: '#007bff',
      borderColor: '#007bff',
    },
    skillText: {
      textAlign: 'center',
    },
    selectedSkillText: {
      color: '#fff',
    },
    selectedSkillsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    selectedSkill: {
      padding: 5,
      borderRadius: 5,
      backgroundColor: '#007bff',
      color: '#fff',
      marginRight: 5,
      marginBottom: 5,
    },
  });

  return (
    <ScrollView className="flex-1 p-5">
      <Text className="text-2xl font-bold mb-5 text-center">Please select your skills</Text>
      <Text className="mb-3 text-center">
        You can select up to {skillsRemaining} more skill{skillsRemaining !== 1 ? 's' : ''}.
      </Text>

      {/* Categories */}
      <Text className="text-lg font-bold mb-3">Categories</Text>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.selectedCategoryButton,
          ]}
          onPress={() => {
            setSelectedCategory(category.id);
            setSelectedSubcategory(null);
          }}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Subcategories */}
      {selectedCategory && (
        <>
          <Text className="text-lg font-bold mb-3">Subcategories</Text>
          {subcategories
            .filter((subcategory) => subcategory.category_id === selectedCategory)
            .map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.subcategoryButton,
                  selectedSubcategory === subcategory.id && styles.selectedSubcategoryButton,
                ]}
                onPress={() => setSelectedSubcategory(subcategory.id)}
              >
                <Text
                  style={[
                    styles.subcategoryText,
                    selectedSubcategory === subcategory.id && styles.selectedSubcategoryText,
                  ]}
                >
                  {subcategory.name}
                </Text>
              </TouchableOpacity>
            ))}
        </>
      )}

      {/* Skills */}
      {selectedSubcategory && (
        <>
          <Text className="text-lg font-bold mb-3">Skills</Text>
          {skills
            .filter((skill) => skill.subcategory_id === selectedSubcategory)
            .map((skill) => (
              <TouchableOpacity
                key={skill.id}
                style={[
                  styles.skillButton,
                  selectedSkills.includes(skill.id) && styles.selectedSkillButton,
                ]}
                onPress={() => handleSkillSelect(skill.id)}
              >
                <Text
                  style={[
                    styles.skillText,
                    selectedSkills.includes(skill.id) && styles.selectedSkillText,
                  ]}
                >
                  {skill.name}
                </Text>
              </TouchableOpacity>
            ))}
        </>
      )}

      {/* Selected Skills */}
      <Text className="text-lg font-bold mb-3">Selected Skills ({selectedSkills.length}/3)</Text>
      <View style={styles.selectedSkillsContainer}>
        {selectedSkills.map((skillId) => {
          const skill = skills.find((s) => s.id === skillId);
          return (
            skill && (
              <Text key={skill.id} style={styles.selectedSkill}>
                {skill.name}
              </Text>
            )
          );
        })}
      </View>

      <Button 
        title={selectedSkills.length > 0 ? "Save Skills" : "Skip for now"} 
        onPress={handleSaveSkills} 
      />
    </ScrollView>
  );
};

export default SkillSelection;
