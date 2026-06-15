import { Colors } from "@/constants/theme";
import { useStyles } from "@/hooks/use-styles";
import { Comment } from "@/hooks/use-comments";
import { formatRelativeTime } from "@/lib/relative-time";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type CommentsSectionProps = {
  itemId: string | number;
  color: string;
  comments: Comment[];
  currentUserId?: string | null;
  loading: boolean;
  submitting: boolean;
  pendingCommentId: string | null;
  onAddComment: (itemId: string | number, body: string) => Promise<unknown>;
  onUpdateComment: (
    itemId: string | number,
    commentId: string,
    body: string,
  ) => Promise<boolean>;
  onDeleteComment: (
    itemId: string | number,
    commentId: string,
  ) => Promise<boolean>;
};

export function CommentsSection({
  itemId,
  color,
  comments,
  currentUserId,
  loading,
  submitting,
  pendingCommentId,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: CommentsSectionProps) {
  const { globalStyles, colors } = useStyles();
  const [body, setBody] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingBody, setEditingBody] = useState("");
  const canSubmit = Boolean(currentUserId && body.trim());

  const handleAddComment = async () => {
    if (!canSubmit) {
      return;
    }

    const addedComment = await onAddComment(itemId, body);

    if (addedComment) {
      setBody("");
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingBody.trim()) {
      return;
    }

    const didUpdate = await onUpdateComment(itemId, commentId, editingBody);

    if (didUpdate) {
      setEditingCommentId(null);
      setEditingBody("");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color }]}>
        Comments
      </Text>

      <View style={styles.inputRow}>
        <TextInput
          value={body}
          onChangeText={setBody}
          multiline
          maxLength={800}
          placeholder={currentUserId ? "Add a comment" : "Sign in to comment"}
          placeholderTextColor={colors.placeholder}
          editable={Boolean(currentUserId)}
          style={[
            globalStyles.input,
            styles.input,
            {
              color: colors.text,
              borderColor: color,
              opacity: currentUserId ? 1 : 0.6,
            },
          ]}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          disabled={!canSubmit || submitting}
          style={[
            styles.sendButton,
            {
              backgroundColor: canSubmit ? color : colors.disable,
            },
          ]}
          accessibilityLabel="Send comment"
        >
          {submitting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Ionicons name="send" size={18} color={Colors.white} />
          )}
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={color} />
        </View>
      ) : (
        <FlatList
          data={comments}
          scrollEnabled={false}
          keyExtractor={(comment) => comment.id}
          contentContainerStyle={styles.commentList}
          ListEmptyComponent={
            <Text style={[globalStyles.discreetText, styles.emptyText]}>
              No comments yet.
            </Text>
          }
          renderItem={({ item }) => {
            const isOwnComment = item.user_id === currentUserId;
            const isEditing = editingCommentId === item.id;
            const isPending = pendingCommentId === item.id;

            return (
              <View style={styles.commentRow}>
                <Image
                  source={
                    item.profile?.avatar_url
                      ? { uri: item.profile.avatar_url }
                      : require("@/assets/images/blank-avatar.jpg")
                  }
                  style={styles.avatar}
                />

                <View
                  style={[
                    styles.commentBubble,
                    { backgroundColor: colors.shadeContainer },
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <Text style={[styles.username, { color }]}>
                      {item.profile?.username ?? "User"}
                    </Text>
                    <Text style={globalStyles.discreetText}>
                      {formatRelativeTime(item.created_at)}
                    </Text>
                  </View>

                  {isEditing ? (
                    <TextInput
                      value={editingBody}
                      onChangeText={setEditingBody}
                      multiline
                      style={[
                        globalStyles.input,
                        styles.editInput,
                        { color: colors.text },
                      ]}
                      placeholderTextColor={colors.placeholder}
                    />
                  ) : (
                    <Text style={[styles.commentText, { color: colors.text }]}>
                      {item.body}
                    </Text>
                  )}

                  {isOwnComment && (
                    <View style={styles.commentActions}>
                      {isEditing ? (
                        <>
                          <TouchableOpacity
                            onPress={() => handleUpdateComment(item.id)}
                            disabled={isPending || !editingBody.trim()}
                          >
                            {isPending ? (
                              <ActivityIndicator size="small" color={color} />
                            ) : (
                              <Ionicons
                                name="checkmark"
                                size={18}
                                color={color}
                              />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingCommentId(null);
                              setEditingBody("");
                            }}
                          >
                            <Ionicons
                              name="close-outline"
                              size={18}
                              color={colors.textDiscreet}
                            />
                          </TouchableOpacity>
                        </>
                      ) : (
                        <>
                          <TouchableOpacity
                            onPress={() => {
                              setEditingCommentId(item.id);
                              setEditingBody(item.body);
                            }}
                          >
                            <Ionicons
                              name="pencil-outline"
                              size={16}
                              color={colors.textDiscreet}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => onDeleteComment(itemId, item.id)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <ActivityIndicator
                                size="small"
                                color={Colors.alert}
                              />
                            ) : (
                              <Ionicons
                                name="trash-outline"
                                size={16}
                                color={Colors.alert}
                              />
                            )}
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingTop: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  loadingContainer: {
    minHeight: 120,
    justifyContent: "center",
  },
  commentList: {
    gap: 12,
    paddingBottom: 32,
  },
  emptyText: {
    alignSelf: "center",
    marginVertical: 24,
  },
  commentRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  commentBubble: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  username: {
    fontSize: 12,
    fontWeight: "700",
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  editInput: {
    minHeight: 72,
    height: undefined,
    paddingTop: 10,
    textAlignVertical: "top",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 48,
    height: undefined,
    maxHeight: 108,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
