//components/inviteItem.tsx
import type { Invite, PageType } from "@/app/invites";
import { styles as InviteStyle } from "@/app/invites";
import { useTheme } from "@/theme/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from "react-native";


// =============== Invite Item Component ===============
export interface InviteItemProps {
  invite: Invite;
  type: PageType;
  onAccept?: (id: number) => void;
  onReject?: (id: number) => void;
  onCancel? : (id : number) => void;
}

export default function InviteItem({ invite, type, onAccept, onReject, onCancel }: InviteItemProps){
  const { colors, radius } = useTheme();
  const user = type === "received" ? invite.sender : invite.receiver;
  const title = type === "received" ? "Sender" : "Receiver";

  const formattedDate = new Date(invite.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const statusConfig = {
    PENDING: { color: colors.warning, icon: "time-outline", label: "Pending" },
    ACCEPTED: { color: colors.success, icon: "checkmark-circle-outline", label: "Accepted" },
    REJECTED: { color: colors.danger, icon: "close-circle-outline", label: "Rejected" },
  }[invite.status];

  const isPending = invite.status === "PENDING";

  return (
    <View style={[InviteStyle.card, { backgroundColor: colors.surface, borderRadius: radius.lg }]}>
      <View style={InviteStyle.cardHeader}>
        <View style={InviteStyle.userInfo}>
          <View style={[InviteStyle.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={[InviteStyle.avatarText, { color: colors.primary }]}>
              {user?.username?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <View style={InviteStyle.userText}>
            <Text style={[InviteStyle.userName, { color: colors.text }]}>
              {user?.username || "Unknown"}
            </Text>
            <Text style={[InviteStyle.userEmail, { color: colors.textMuted }]}>
              {user?.email || "No email"}
            </Text>
          </View>
        </View>
        <View style={[InviteStyle.statusBadge, { backgroundColor: statusConfig.color + "15" }]}>
          <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
          <Text style={[InviteStyle.statusLabel, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={InviteStyle.cardFooter}>
        <View style={InviteStyle.dateContainer}>
          <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
          <Text style={[InviteStyle.dateText, { color: colors.textMuted }]}>{formattedDate}</Text>
        </View>

        {type === "received" && isPending && onAccept && onReject && (
          <View style={InviteStyle.actionButtons}>
            <TouchableOpacity
              style={[InviteStyle.actionBtn, { backgroundColor: colors.success }]}
              onPress={() => onAccept(invite.id)}
            >
              <Ionicons name="checkmark" size={18} color={colors.primaryText} />
              <Text style={[InviteStyle.actionBtnText, { color: colors.primaryText }]}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[InviteStyle.actionBtn, { backgroundColor: colors.danger }]}
              onPress={() => onReject(invite.id)}
            >
              <Ionicons name="close" size={18} color={colors.primaryText} />
              <Text style={[InviteStyle.actionBtnText, { color: colors.primaryText }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
        {type === "sent" && isPending && onCancel && (
          <TouchableOpacity
            style={[InviteStyle.actionBtn, { backgroundColor: colors.warning }]} // یا رنگ دیگر
            onPress={() => onCancel(invite.id)}
          >
            <Ionicons name="close-circle-outline" size={18} color={colors.primaryText} />
            <Text style={[InviteStyle.actionBtnText, { color: colors.primaryText }]}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};