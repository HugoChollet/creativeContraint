import { useStyles } from "@/hooks/use-styles";
import { formatRelativeTime } from "@/lib/relative-time";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, Text, TouchableOpacity, View } from "react-native";
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
  const { globalStyles } = useStyles();
  const isDetail = variant === "detail";
  const showDifficulty = typeof difficulty === "number";
  const showMeta = Boolean(subtitle || createdAt || showDifficulty);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={[
        globalStyles.contentHeader,
        isDetail
          ? globalStyles.contentHeaderDetail
          : globalStyles.contentHeaderCard,
        { backgroundColor },
      ]}
    >
      {onBack && (
        <TouchableOpacity
          onPress={onBack}
          style={globalStyles.backButtonSmall}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={20} color={color} />
        </TouchableOpacity>
      )}

      <View style={globalStyles.avatarColumn}>
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("@/assets/images/blank-avatar.jpg")
          }
          style={isDetail ? globalStyles.avatarMedium : globalStyles.avatarSmall}
        />
        <Text
          numberOfLines={1}
          style={[
            isDetail
              ? globalStyles.contentHeaderDetailUsername
              : globalStyles.contentHeaderUsername,
            { color: textColor },
          ]}
        >
          {username ?? "User"}
        </Text>
      </View>

      <View style={globalStyles.titleBlockCenter}>
        <Text
          style={[
            isDetail
              ? globalStyles.contentHeaderDetailTitle
              : globalStyles.contentHeaderTitle,
            { color },
          ]}
          numberOfLines={isDetail ? 2 : 1}
        >
          {title}
        </Text>

        {showMeta && (
          <View style={globalStyles.centeredWrapRow}>
            {subtitle && (
              <Text
                style={[
                  globalStyles.contentHeaderMetaText,
                  { color: discreetTextColor },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
            {createdAt && (
              <Text
                style={[
                  globalStyles.contentHeaderMetaText,
                  { color: discreetTextColor },
                ]}
              >
                {formatRelativeTime(createdAt)}
              </Text>
            )}
            {showDifficulty && (
              <View
                style={[
                  globalStyles.pill,
                  { backgroundColor },
                ]}
              >
                <Ionicons
                  name="speedometer-outline"
                  size={isDetail ? 14 : 12}
                  color={color}
                />
                <Text
                  style={[
                    globalStyles.pillText,
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

      <View style={globalStyles.compactActions}>
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
            style={globalStyles.iconButtonSmall}
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
