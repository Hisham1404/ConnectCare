import React from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, Text, StyleSheet, RefreshControl } from 'react-native';
import { Search, Filter, Heart, Activity, Phone, Video, MessageSquare, User, AlertCircle } from 'lucide-react-native';

interface PatientsTabProps {
  patients: any[];
  searchQuery: string;
  selectedFilter: string;
  refreshing: boolean;
  error?: string | null;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onRefresh: () => void;
}

export default function PatientsTab({
  patients,
  searchQuery,
  selectedFilter,
  refreshing,
  error,
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

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle color="#ef4444" size={20} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Patient List */}
      <ScrollView 
        style={styles.patientList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {filteredPatients.length === 0 && !error ? (
          <View style={styles.emptyState}>
            <User color="#6b7280" size={48} />
            <Text style={styles.emptyStateTitle}>No patients found</Text>
            <Text style={styles.emptyStateText}>
              {patients.length === 0 
                ? "You don't have any assigned patients yet."
                : `No patients match your search "${searchQuery}" or filter "${selectedFilter}".`
              }
            </Text>
          </View>
        ) : (
          filteredPatients.map((patient) => (
            <View key={patient.id} style={styles.patientCard}>
              <View style={styles.patientHeader}>
                <View style={styles.patientAvatar}>
                  <User size={20} color="#ffffff" />
                </View>
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
          ))
        )}
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
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
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
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  newCheckinBadge: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newCheckinText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  patientCondition: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    marginTop: 2,
  },
  patientAge: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  patientVitals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  vitalItem: {
    alignItems: 'center',
    gap: 2,
  },
  vitalValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2937',
  },
  vitalLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastCheckin: {
    fontSize: 12,
    color: '#6b7280',
  },
  patientActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riskScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  riskScoreLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  riskScoreValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});