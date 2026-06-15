import { formatRelativeTime } from "@/lib/relative-time";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CommentButton } from "./comment-button";
import { LikeButton } from "./like-button";

type ContentHeaderVariant = "card" | "detail";

type ContentHeaderProps = {
  title: string;
  subtitle?: string | null;
  avatarUrl?: string | null;
  username?: string | null;
  createdAt?: string | null;
  difficulty?: number | null;
  color: string;
  backgroundColor: string;
  textColor: string;
  discreetTextColor: string;
  likeCount?: number;
  isLiked?: boolean;
  isLikePending?: boolean;
  onToggleLike?: () => void;
  commentCount?: number;
  onOpenComments?: () => void;
  onPress?: () => void;
  onBack?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  variant?: ContentHeaderVariant;
};

export function ContentHeader({
  title,
  subtitle,
  avatarUrl,
  username,
  createdAt,
  difficulty,
  color,
  backgroundColor,
  textColor,
  discreetTextColor,
  likeCount = 0,
  isLiked = false,
  isLikePending = false,
  onToggleLike,
  commentCount = 0,
  onOpenComments,
  onPress,
  onBack,
  isExpanded = false,
  onToggleExpanded,
  variant = "card",
}: ContentHeaderProps) {
  const isDetail = variant === "detail";
  const showDifficulty = typeof difficulty === "number";
  const showMeta = Boolean(subtitle || createdAt || showDifficulty);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.container,
        isDetail ? styles.detailContainer : styles.cardContainer,
        { backgroundColor },
      ]}
    >
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={22} color={color} />
        </TouchableOpacity>
      )}

      <View style={styles.authorBlock}>
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("@/assets/images/blank-avatar.jpg")
          }
          style={isDetail ? styles.detailAvatar : styles.cardAvatar}
        />
        <Text
          numberOfLines={1}
          style={[
            styles.username,
            { color: textColor },
            isDetail && styles.detailUsername,
          ]}
        >
          {username ?? "User"}
        </Text>
      </View>

      <View style={styles.titleBlock}>
        <Text
          style={[isDetail ? styles.detailTitle : styles.cardTitle, { color }]}
          numberOfLines={isDetail ? 2 : 1}
        >
          {title}
        </Text>

        {showMeta && (
          <View style={styles.metaRow}>
            {subtitle && (
              <Text
                style={[
                  styles.metaText,
                  { color: discreetTextColor },
                  isDetail && styles.detailMetaText,
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
            {createdAt && (
              <Text
                style={[
                  styles.metaText,
                  { color: discreetTextColor },
                  isDetail && styles.detailMetaText,
                ]}
              >
                {formatRelativeTime(createdAt)}
              </Text>
            )}
            {showDifficulty && (
              <View
                style={[
                  styles.difficultyBadge,
                  isDetail && styles.detailDifficultyBadge,
                  { backgroundColor },
                ]}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={isDetail ? 15 : 13}
                  color={color}
                />
                <Text
                  style={[
                    styles.difficultyText,
                    isDetail && styles.detailDifficultyText,
                    { color },
                  ]}
                >
                  {difficulty}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {onOpenComments && (
          <CommentButton
            count={commentCount}
            color={color}
            onPress={onOpenComments}
          />
        )}
        <LikeButton
          count={likeCount}
          isLiked={isLiked}
          color={color}
          isLoading={isLikePending}
          onPress={onToggleLike}
        />
        {onToggleExpanded && (
          <TouchableOpacity
            onPress={onToggleExpanded}
            style={styles.iconButton}
            accessibilityLabel={isExpanded ? "Hide details" : "Show details"}
          >
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={color}
            />
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  cardContainer: {
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailContainer: {
    minHeight: 76,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(142, 142, 147, 0.2)",
  },
  backButton: {
    width: 30,
    height: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  authorBlock: {
    width: 50,
    alignItems: "center",
    gap: 3,
  },
  cardAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  detailAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  username: {
    maxWidth: 50,
    fontSize: 10,
    fontWeight: "600",
  },
  detailUsername: {
    fontSize: 11,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    maxWidth: "100%",
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 11,
    fontWeight: "600",
  },
  detailMetaText: {
    fontSize: 12,
  },
  difficultyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  detailDifficultyBadge: {
    paddingHorizontal: 7,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "700",
  },
  detailDifficultyText: {
    fontSize: 11,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 86,
    gap: 2,
  },
  iconButton: {
    width: 24,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
