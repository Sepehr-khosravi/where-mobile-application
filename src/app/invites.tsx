//app/invites.tsx
import InviteList from "@/components/InviteList";
import { acceptInvite, cancelInvite, rejectInvite } from "@/services/relations";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export type InviteStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Invite {
  id: number;
  senderId: number;
  receiverId: number;
  status: InviteStatus;
  createdAt: string;
  sender?: User;
  receiver?: User;
}

export type PageType = "received" | "sent";




export default function Invites() {
  const { colors, radius } = useTheme();
  const [page, setPage] = useState<PageType>("received");
  const [refreshKey, setRefreshKey] = useState(0); // برای رفرش

  const handleAccept = async (id: number) => {
    try {
      await acceptInvite(id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Accept failed', error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectInvite(id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Reject failed', error);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await cancelInvite(id);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Cancel failed', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back-sharp" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Invites</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabWrapper, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            page === "received" && [styles.activeTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setPage("received")}
        >
          <Text
            style={[
              styles.tabText,
              { color: page === "received" ? colors.primaryText : colors.textMuted },
            ]}
          >
            Received
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            page === "sent" && [styles.activeTab, { backgroundColor: colors.primary }],
          ]}
          onPress={() => setPage("sent")}
        >
          <Text
            style={[
              styles.tabText,
              { color: page === "sent" ? colors.primaryText : colors.textMuted },
            ]}
          >
            Sent
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <View style={styles.listWrapper}>
        <InviteList
          type={page}
          onAccept={handleAccept}
          onReject={handleReject}
          onCancel={handleCancel}
          refreshKey={refreshKey}
        />
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  tabWrapper: {
    flexDirection: "row",
    marginHorizontal: 20,
    padding: 4,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 999,
  },
  activeTab: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  listWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingBottom: 20,
    gap: 12,
  },
  // Card
  card: {
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
  },
  userText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: "400",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "400",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 0,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centeredText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

;
