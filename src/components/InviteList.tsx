import { Invite, InviteStatus, InviteStyle, PageType } from "@/app/invites";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import InviteItem from "./InviteItem";
// مسیر سرویس‌ها را مطابق پروژه خود تنظیم کنید
import { getReceivedInvites, getSentInvites } from "@/services/relations";

export interface InviteListProps {
  type: PageType;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel? : (id : number) => void;
  refreshKey? : number;
}

export default function InviteList({ type, onAccept, onReject, onCancel, refreshKey }: InviteListProps) {
  const { colors } = useTheme();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvites = async () => {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (type === "received") {
          const response = await getReceivedInvites();
          data = response.invites;
        } else {
          const response = await getSentInvites();
          data = response.invites;
        }

        // نگاشت داده‌های API به ساختار Invite
        const mapped: Invite[] = data.map((item) => {
          // تبدیل createdAt به رشته در صورت نیاز
          const createdAtStr = typeof item.createdAt === 'string' 
            ? item.createdAt 
            : item.createdAt.toISOString();

          const base = {
            id: item.id,
            senderId: item.senderId,
            receiverId: item.receiverId,
            status: item.status as InviteStatus,
            createdAt: createdAtStr,
          };

          if (type === "received") {
            return {
              ...base,
              sender: {
                id: item.friend.id,
                username: item.friend.username,
                email: item.friend.email,
              },
              receiver: undefined,
            };
          } else {
            return {
              ...base,
              sender: undefined,
              receiver: {
                id: item.friend.id,
                username: item.friend.username,
                email: item.friend.email,
              },
            };
          }
        });

        setInvites(mapped);
      } catch (err) {
        setError("Failed to load invites");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvites();
  }, [type, refreshKey]);

  if (loading) {
    return (
      <View style={[InviteStyle.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[InviteStyle.centeredText, { color: colors.textMuted }]}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[InviteStyle.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={[InviteStyle.centeredText, { color: colors.danger, marginTop: 8 }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (invites.length === 0) {
    return (
      <View style={[InviteStyle.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="mail-outline" size={48} color={colors.textMuted} />
        <Text style={[InviteStyle.centeredText, { color: colors.textMuted, marginTop: 8 }]}>
          {type === "received" ? "No invites received" : "No invites sent"}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={invites}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <InviteItem invite={item} type={type} onAccept={onAccept} onReject={onReject} onCancel={onCancel} />
      )}
      contentContainerStyle={InviteStyle.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
}