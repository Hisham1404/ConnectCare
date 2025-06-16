import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Stethoscope, ChevronDown, X } from 'lucide-react-native';
import { Colors } from '../../constants/Colors';
import { supabase } from '../../lib/supabase';

interface Doctor {
  id: string;
  full_name: string;
  email: string;
}

interface DoctorSearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onDoctorSelect: (doctor: Doctor) => void;
  placeholder?: string;
}

export default function DoctorSearchInput({
  value,
  onValueChange,
  onDoctorSelect,
  placeholder = "Search for your doctor...",
}: DoctorSearchInputProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const searchDoctors = async (query: string) => {
    if (query.length < 2) {
      setDoctors([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('role', 'doctor')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (error) {
        console.error('Error searching doctors:', error);
        return;
      }

      setDoctors(data || []);
    } catch (error) {
      console.error('Error searching doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery) {
        searchDoctors(searchQuery);
      } else {
        setDoctors([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    setShowDropdown(true);
    setSelectedDoctor(null);
    onValueChange(text);
  };

  const handleBlur = () => {
    // Don't close dropdown if user is actively selecting
    if (isSelecting) return;
    
    // Delay hiding dropdown to allow for item selection
    setTimeout(() => {
      if (!isSelecting) {
        setShowDropdown(false);
      }
    }, 200);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    console.log('🏥 Doctor selected:', doctor.full_name);
    setIsSelecting(true);
    setSelectedDoctor(doctor);
    setSearchQuery(doctor.full_name);
    setShowDropdown(false);
    onValueChange(doctor.id);
    onDoctorSelect(doctor);
    
    // Reset selecting state after a brief delay
    setTimeout(() => setIsSelecting(false), 100);
  };

  const clearSelection = () => {
    setSelectedDoctor(null);
    setSearchQuery('');
    setShowDropdown(false);
    onValueChange('');
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => handleDoctorSelect(item)}
      onPressIn={() => setIsSelecting(true)}
      activeOpacity={0.7}
      delayPressIn={0}
    >
      <View style={styles.doctorInfo}>
        <View style={styles.doctorIcon}>
          <Stethoscope color={Colors.primary} size={16} />
        </View>
        <View style={styles.doctorDetails}>
          <Text style={styles.doctorName}>{item.full_name}</Text>
          <Text style={styles.doctorEmail}>{item.email}</Text>
          <Text style={styles.doctorId}>ID: {item.id.slice(0, 8)}...</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Stethoscope color={Colors.textSecondary} size={20} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={searchQuery}
          onChangeText={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={handleBlur}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {selectedDoctor ? (
          <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
            <X color={Colors.textSecondary} size={16} />
          </TouchableOpacity>
        ) : (
          <ChevronDown color={Colors.textSecondary} size={16} />
        )}
      </View>

      {selectedDoctor && (
        <View style={styles.selectedDoctorCard}>
          <View style={styles.selectedDoctorIcon}>
            <Stethoscope color={Colors.primary} size={14} />
          </View>
          <View style={styles.selectedDoctorInfo}>
            <Text style={styles.selectedDoctorName}>Dr. {selectedDoctor.full_name}</Text>
            <Text style={styles.selectedDoctorId}>ID: {selectedDoctor.id.slice(0, 8)}...</Text>
          </View>
        </View>
      )}

      {showDropdown && searchQuery.length >= 2 && (
        <View style={styles.dropdown}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Searching doctors...</Text>
            </View>
          ) : doctors.length > 0 ? (
            <FlatList
              data={doctors}
              renderItem={renderDoctorItem}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled={true}
            />
          ) : searchQuery.length >= 2 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No doctors found</Text>
              <Text style={styles.noResultsSubtext}>
                Try searching by name, email, or doctor ID
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    zIndex: 1001,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  clearButton: {
    padding: 4,
  },
  selectedDoctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  selectedDoctorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedDoctorInfo: {
    flex: 1,
  },
  selectedDoctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  selectedDoctorId: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10000,
    borderWidth: 1,
    borderColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${Colors.textSecondary}${Colors.opacity.light}`,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}${Colors.opacity.light}`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  doctorEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  doctorId: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
}); 