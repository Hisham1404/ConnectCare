import React from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, StyleSheet, Image, RefreshControl } from 'react-native';
import { Search, Filter, Heart, Activity, Phone, Video, MessageSquare } from 'lucide-react-native';

interface PatientsTabProps {
  patients: any[];
  searchQuery: string;
  selectedFilter: string;
  refreshing: boolean;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onRefresh: () => void;
}

export default function PatientsTab({
  patients,
  searchQuery,
  selectedFilter,
  refreshing,
  onSearchChange,
  onFilterChange,
  onRefresh
}: PatientsTabProps) {

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'stable': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || patient.priority === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      {/* Compact Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search color="#6b7280" size={18} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={onSearchChange}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#6b7280" size={18} />
        </TouchableOpacity>
      </View>

      {/* Compact Filter Chips */}
      <View style={styles.filterChipsContainer}>
        {['all', 'critical', 'moderate', 'stable'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.activeFilterChip
            ]}
            onPress={() => onFilterChange(filter)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter && styles.activeFilterChipText
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Patient List */}
      <ScrollView 
        style={styles.patientList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredPatients.map((patient) => (
          <View key={patient.id} style={styles.patientCard}>
            <View style={styles.patientHeader}>
              <Image source={{ uri: patient.avatar }} style={styles.patientAvatar} />
              <View style={styles.patientInfo}>
                <View style={styles.patientNameRow}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  {patient.hasNewCheckin && (
                    <View style={styles.newCheckinBadge}>
                      <Text style={styles.newCheckinText}>NEW</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.patientCondition}>{patient.condition}</Text>
                <Text style={styles.patientAge}>Age {patient.age} • {patient.recoveryStage}</Text>
              </View>
              <View style={[
                styles.priorityIndicator,
                { backgroundColor: getPriorityColor(patient.priority) }
              ]} />
            </View>

            <View style={styles.patientVitals}>
              <View style={styles.vitalItem}>
                <Heart color="#ef4444" size={14} />
                <Text style={styles.vitalValue}>{patient.vitals.heartRate}</Text>
                <Text style={styles.vitalLabel}>BPM</Text>
              </View>
              <View style={styles.vitalItem}>
                <Activity color="#3b82f6" size={14} />
                <Text style={styles.vitalValue}>{patient.vitals.bloodPressure}</Text>
                <Text style={styles.vitalLabel}>BP</Text>
              </View>
              <View style={styles.vitalItem}>
                <Text style={styles.vitalValue}>{patient.vitals.temperature}°</Text>
                <Text style={styles.vitalLabel}>TEMP</Text>
              </View>
              <View style={styles.vitalItem}>
                <Text style={styles.vitalValue}>{patient.vitals.oxygen}%</Text>
                <Text style={styles.vitalLabel}>O2</Text>
              </View>
            </View>

            <View style={styles.patientFooter}>
              <Text style={styles.lastCheckin}>Last check-in: {patient.lastCheckin}</Text>
              <View style={styles.patientActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Phone color="#6b7280" size={14} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Video color="#6b7280" size={14} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <MessageSquare color="#6b7280" size={14} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.riskScoreContainer}>
              <Text style={styles.riskScoreLabel}>Risk Score</Text>
              <Text style={[
                styles.riskScoreValue,
                { color: patient.riskScore > 70 ? '#ef4444' : patient.riskScore > 40 ? '#f59e0b' : '#10b981' }
              ]}>
                {patient.riskScore}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  filterButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  activeFilterChip: {
    backgroundColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  patientList: {
    flex: 1,
  },
  patientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  patientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  newCheckinBadge: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  newCheckinText: {
    fontSize: 7,
    color: '#ffffff',
    fontWeight: '700',
  },
  patientCondition: {
    fontSize: 11,
    color: '#3b82f6',
    marginBottom: 1,
  },
  patientAge: {
    fontSize: 10,
    color: '#6b7280',
  },
  priorityIndicator: {
    width: 6,
    height: 40,
    borderRadius: 3,
  },
  patientVitals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  vitalItem: {
    alignItems: 'center',
    gap: 1,
  },
  vitalValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f2937',
  },
  vitalLabel: {
    fontSize: 8,
    color: '#6b7280',
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastCheckin: {
    fontSize: 10,
    color: '#6b7280',
  },
  patientActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskScoreContainer: {
    position: 'absolute',
    top: 14,
    right: 14,
    alignItems: 'center',
  },
  riskScoreLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 1,
  },
  riskScoreValue: {
    fontSize: 13,
    fontWeight: '800',
  },
});