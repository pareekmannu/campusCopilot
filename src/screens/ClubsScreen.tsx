import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, FONTS } from '../utils/constants';
import { Club } from '../types';
import { StorageService } from '../services/storageService';
import { User } from '../types';


export default function ClubsScreen() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [myClubs, setMyClubs] = useState<Club[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'all' | 'my'>('all');
  const [user, setUser] = useState<User | null>(null);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    category: 'academic',
  });

  useEffect(() => {
    loadUserAndClubs();
  }, []);

  const loadUserAndClubs = async () => {
    try {
      const [userData, loadedClubs] = await Promise.all([
        StorageService.getUserData(),
        StorageService.getClubs(),
      ]);
      setUser(userData);
      setClubs(loadedClubs);
      setMyClubs(loadedClubs.filter(club => club.isMember));
    } catch (error) {
      console.error('Error loading user and clubs:', error);
    }
  };

  const handleJoinClub = (clubId: string) => {
    const updatedClubs = clubs.map(club =>
      club.id === clubId ? { ...club, isMember: true } : club
    );
    setClubs(updatedClubs);
    setMyClubs(updatedClubs.filter(club => club.isMember));
    StorageService.saveClubs(updatedClubs);
    Alert.alert('Success', 'You have joined the club!');
  };

  const handleLeaveClub = (clubId: string) => {
    Alert.alert(
      'Leave Club',
      'Are you sure you want to leave this club?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            const updatedClubs = clubs.map(club =>
              club.id === clubId ? { ...club, isMember: false } : club
            );
            setClubs(updatedClubs);
            setMyClubs(updatedClubs.filter(club => club.isMember));
            StorageService.saveClubs(updatedClubs);
          },
        },
      ]
    );
  };

  const handleCreateClub = () => {
    if (!newClub.name.trim()) {
      Alert.alert('Error', 'Please enter a club name');
      return;
    }

    const club: Club = {
      id: Date.now().toString(),
      name: newClub.name.trim(),
      description: newClub.description.trim(),
      events: [],
      members: ['current-user'],
      isMember: true,
      adminId: 'current-user',
    };

    const updatedClubs = [...clubs, club];
    setClubs(updatedClubs);
    setMyClubs(updatedClubs.filter(club => club.isMember));
    StorageService.saveClubs(updatedClubs);
    setShowAddModal(false);
    setNewClub({ name: '', description: '', category: 'academic' });
    Alert.alert('Success', 'Club created successfully!');
  };

  const handleClubPress = (club: Club) => {
    Alert.alert(
      club.name,
      `${club.description}\n\nMembers: ${club.members.length}\nEvents: ${club.events.length}\n\n${club.isMember ? 'You are a member of this club.' : 'You can join this club.'}`,
      [
        { text: 'Close', style: 'cancel' },
        club.isMember
          ? {
              text: 'Leave Club',
              style: 'destructive',
              onPress: () => handleLeaveClub(club.id),
            }
          : {
              text: 'Join Club',
              onPress: () => handleJoinClub(club.id),
            },
      ]
    );
  };

  const renderClubCard = ({ item }: { item: Club }) => (
    <TouchableOpacity style={styles.clubCard} onPress={() => handleClubPress(item)}>
      <View style={styles.clubHeader}>
        <View style={styles.clubIcon}>
          <Ionicons name="people" size={24} color={COLORS.primary} />
        </View>
        <View style={styles.clubInfo}>
          <Text style={styles.clubName}>{item.name}</Text>
          <Text style={styles.clubDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.clubStatus}>
          {item.isMember ? (
            <View style={styles.memberBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.memberText}>Member</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinClub(item.id)}
            >
              <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.clubStats}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.members.length} members</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.statText}>{item.events.length} events</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const clubCategories = [
    { key: 'academic', label: 'Academic', icon: 'school' },
    { key: 'technology', label: 'Technology', icon: 'laptop' },
    { key: 'sports', label: 'Sports', icon: 'football' },
    { key: 'arts', label: 'Arts & Culture', icon: 'color-palette' },
    { key: 'social', label: 'Social', icon: 'people' },
  ];

  const displayClubs = selectedTab === 'all' ? clubs : myClubs;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Clubs</Text>
          <Text style={styles.subtitle}>Discover and join student organizations</Text>
        </View>
        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Ionicons
            name="grid-outline"
            size={20}
            color={selectedTab === 'all' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}
          >
            All Clubs
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
        >
          <Ionicons
            name="heart-outline"
            size={20}
            color={selectedTab === 'my' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text
            style={[styles.tabText, selectedTab === 'my' && styles.tabTextActive]}
          >
            My Clubs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clubs List */}
      <FlatList
        data={displayClubs}
        renderItem={renderClubCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.clubsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={COLORS.secondary} />
            <Text style={styles.emptyTitle}>
              {selectedTab === 'all' ? 'No clubs available' : 'You haven\'t joined any clubs'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'all' 
                ? 'Check back later for new clubs'
                : 'Discover and join clubs to get started'
              }
            </Text>
            {selectedTab === 'all' && (
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.emptyButtonText}>Create Club</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Create Club Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Club</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Club Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter club name"
                value={newClub.name}
                onChangeText={(text) => setNewClub({ ...newClub, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your club's purpose and activities"
                value={newClub.description}
                onChangeText={(text) => setNewClub({ ...newClub, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {clubCategories.map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryButton,
                      newClub.category === category.key && styles.categoryButtonActive
                    ]}
                    onPress={() => setNewClub({ ...newClub, category: category.key })}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={newClub.category === category.key ? 'white' : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        newClub.category === category.key && styles.categoryButtonTextActive
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddModal(false);
                setNewClub({ name: '', description: '', category: 'academic' });
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleCreateClub}>
              <Text style={styles.saveButtonText}>Create Club</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: FONTS.bold,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: 'white',
    opacity: 0.9,
    marginTop: SPACING.xs,
    fontFamily: FONTS.medium,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    margin: SPACING.lg,
    padding: SPACING.xs,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginHorizontal: SPACING.xs,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '20',
  },
  tabText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  clubsList: {
    padding: SPACING.lg,
  },
  clubCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clubIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: FONTS.bold,
  },
  clubDescription: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
  },
  clubStatus: {
    alignItems: 'flex-end',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    borderRadius: 12,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  memberText: {
    fontSize: SIZES.sm,
    color: COLORS.success,
    fontFamily: FONTS.medium,
    marginLeft: SPACING.xs,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  joinButtonText: {
    fontSize: SIZES.sm,
    color: 'white',
    fontFamily: FONTS.bold,
  },
  clubStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: SIZES.md,
    color: 'white',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: SIZES.md,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    minWidth: '45%',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: SIZES.md,
    color: 'white',
    fontWeight: '600',
  },
}); 