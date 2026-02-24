import React, { useState, useEffect } from "react";
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
    KeyboardAvoidingView, Platform, ActionSheetIOS, Image, ActivityIndicator, Modal,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { itemsApi, Item } from "../src/api/items";
import { listsApi, List } from "../src/api/lists";
import { uploadFile } from "../src/api/client";
import { fetchPageMetadata } from "../src/utils/fetchPageMetadata";
import { Colors, Spacing, FontSize, FontFamily, BorderRadius } from "../src/theme";
import LoadingSpinner from "../src/components/LoadingSpinner";

export default function ItemFormScreen() {
    const { id, sharedUrl, sharedTitle, listId } = useLocalSearchParams<{ id?: string; sharedUrl?: string; sharedTitle?: string; listId?: string }>();
    const router = useRouter();
    const isEdit = !!id;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [selectedListIds, setSelectedListIds] = useState<string[]>([]);
    const [linkInput, setLinkInput] = useState("");
    const [attachments, setAttachments] = useState<Array<{ type: string; url: string }>>([]);
    const [userLists, setUserLists] = useState<List[]>([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [titleFocused, setTitleFocused] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [uploadingAttach, setUploadingAttach] = useState(false);
    const [fetchingMeta, setFetchingMeta] = useState(false);

    useEffect(() => {
        listsApi.getLists().then(setUserLists).catch(() => { });

        if (sharedUrl && !isEdit) {
            const url = decodeURIComponent(sharedUrl);
            const type = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "IMAGE" : "LINK";
            setAttachments([{ type, url }]);
            if (sharedTitle) setTitle(decodeURIComponent(sharedTitle));

            // Auto-fetch metadata from URL (like Chrome extension)
            if (type === "LINK" && url.startsWith("http")) {
                setFetchingMeta(true);
                fetchPageMetadata(url)
                    .then((meta) => {
                        if (meta.title && !title) setTitle(meta.title);
                        if (meta.description) setDescription(meta.description);
                        if (meta.thumbnail) setThumbnail(meta.thumbnail);
                        if (meta.autoTags.length > 0) setTags((prev) => {
                            const merged = [...new Set([...prev, ...meta.autoTags])];
                            return merged.slice(0, 10);
                        });
                    })
                    .catch((err) => console.log("[item-form] Meta fetch error:", err))
                    .finally(() => setFetchingMeta(false));
            }
        }

        if (listId && !isEdit) setSelectedListIds([listId]);

        if (isEdit) {
            itemsApi.getItem(id!).then((item) => {
                setTitle(item.title);
                setDescription(item.description || "");
                setThumbnail(item.thumbnail || "");
                setIsPublic(item.viewMode === "PUBLIC");
                setTags(item.tags.map((t) => t.name));
                setSelectedListIds(item.lists.map((l) => l.id));
                setAttachments((item.attachments || []).map((a) => ({ type: a.type, url: a.url })));
                setLoading(false);
            }).catch(() => { Alert.alert("Lỗi", "Không thể tải item"); router.back(); });
        }
    }, []);

    const addTag = () => {
        const t = tagInput.trim();
        if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); }
    };

    const addLink = () => {
        const url = linkInput.trim();
        if (url) {
            const type = /\.(jpg|jpeg|png|gif|webp)$/i.test(url) ? "IMAGE" : "LINK";
            setAttachments([...attachments, { type, url }]);
            setLinkInput("");
            setShowLinkInput(false);
        }
    };

    // === Image picker ===
    const [showPickerModal, setShowPickerModal] = useState(false);
    const pickerCallbackRef = React.useRef<((uri: string) => void) | null>(null);

    const showImagePicker = (onPick: (uri: string) => void) => {
        pickerCallbackRef.current = onPick;
        setShowPickerModal(true);
    };

    const handlePickerOption = async (option: "camera" | "library") => {
        setShowPickerModal(false);
        let result: ImagePicker.ImagePickerResult | null = null;

        if (option === "camera") {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Quyền truy cập", "Cần quyền camera để chụp ảnh. Vui lòng bật trong Cài đặt.");
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                quality: 0.8,
                allowsEditing: true,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 0.8,
                allowsEditing: true,
            });
        }

        if (result && !result.canceled && result.assets[0] && pickerCallbackRef.current) {
            pickerCallbackRef.current(result.assets[0].uri);
        }
    };

    // Upload thumbnail
    const pickThumbnail = () => {
        showImagePicker(async (uri) => {
            setUploadingThumb(true);
            try {
                const publicUrl = await uploadFile(uri);
                setThumbnail(publicUrl);
            } catch (err) {
                Alert.alert("Lỗi", "Upload ảnh thất bại. Thử lại sau.");
            } finally {
                setUploadingThumb(false);
            }
        });
    };

    // Upload attachment image
    const pickAttachmentImage = () => {
        if (attachments.length >= 10) {
            Alert.alert("Giới hạn", "Tối đa 10 đính kèm.");
            return;
        }
        showImagePicker(async (uri) => {
            setUploadingAttach(true);
            try {
                const publicUrl = await uploadFile(uri);
                setAttachments((prev) => [...prev, { type: "IMAGE", url: publicUrl }]);
            } catch (err) {
                Alert.alert("Lỗi", "Upload ảnh thất bại. Thử lại sau.");
            } finally {
                setUploadingAttach(false);
            }
        });
    };

    const handleSave = async () => {
        if (!title.trim()) { Alert.alert("Lỗi", "Vui lòng nhập tên"); return; }
        setSaving(true);
        try {
            const data = {
                title: title.trim(),
                description: description.trim() || undefined,
                thumbnail: thumbnail.trim() || undefined,
                viewMode: isPublic ? "PUBLIC" as const : "PRIVATE" as const,
                tagNames: tags,
                listIds: selectedListIds,
                attachments: attachments.filter((a) => a.url.trim()),
            };
            if (isEdit) { await itemsApi.updateItem(id!, data); }
            else { await itemsApi.createItem(data); }
            // Navigate to items list
            router.replace("/(tabs)/items");
        } catch (err: unknown) {
            Alert.alert("Lỗi", (err as Error).message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: "",
                    headerBackTitle: "Back",
                    headerRight: () => (
                        <TouchableOpacity
                            style={[styles.saveHeaderBtn, saving && { opacity: 0.5 }]}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Ionicons name="checkmark" size={22} color="#fff" />
                        </TouchableOpacity>
                    ),
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color={Colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <KeyboardAvoidingView style={{ flex: 1, backgroundColor: Colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView keyboardShouldPersistTaps="handled">
                    {/* Header */}
                    <View style={styles.formHeader}>
                        <Text style={styles.formTitle}>{isEdit ? "Chỉnh sửa link hay" : "Thêm link hay mới"}</Text>
                        <Text style={styles.formSubtitle}>
                            {isEdit ? "Cập nhật thông tin link hay của bạn" : "Tạo và lưu trữ link hay yêu thích của bạn"}
                        </Text>
                        {fetchingMeta && (
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 }}>
                                <ActivityIndicator size="small" color={Colors.primary} />
                                <Text style={{ fontSize: FontSize.xs, color: Colors.primary, fontFamily: FontFamily.medium }}>
                                    Đang tải thông tin trang...
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.form}>
                        {/* Thumbnail upload area */}
                        <View style={styles.uploadArea}>
                            {thumbnail ? (
                                <View style={styles.thumbPreviewWrap}>
                                    <Image source={{ uri: thumbnail }} style={styles.thumbPreview} />
                                    <View style={styles.thumbActions}>
                                        <TouchableOpacity style={styles.thumbActionBtn} onPress={pickThumbnail}>
                                            <Ionicons name="camera-outline" size={18} color={Colors.text} />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.thumbActionBtn, { backgroundColor: "rgba(239,68,68,0.1)" }]} onPress={() => setThumbnail("")}>
                                            <Ionicons name="trash-outline" size={18} color={Colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.uploadDashed} onPress={pickThumbnail} disabled={uploadingThumb} activeOpacity={0.7}>
                                    {uploadingThumb ? (
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="image-outline" size={32} color={Colors.textMuted} />
                                            <Text style={styles.uploadText}>Thêm ảnh</Text>
                                            <Text style={styles.uploadHint}>Tối đa 5MB · JPG, PNG, WebP</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                            <TextInput
                                style={styles.thumbnailInput}
                                value={thumbnail}
                                onChangeText={setThumbnail}
                                placeholder="Hoặc paste URL ảnh..."
                                placeholderTextColor={Colors.textMuted}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Title */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Ionicons name="text-outline" size={16} color={Colors.textSecondary} />
                                <Text style={styles.label}>Tên link hay <Text style={styles.required}>*</Text></Text>
                            </View>
                            <TextInput
                                style={[styles.input, titleFocused && styles.inputFocused]}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="VD: Phở bò Hà Nội"
                                placeholderTextColor={Colors.textMuted}
                                onFocus={() => setTitleFocused(true)}
                                onBlur={() => setTitleFocused(false)}
                            />
                        </View>

                        {/* Description */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
                                <Text style={styles.label}>Mô tả / Ghi chú</Text>
                            </View>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Mô tả chi tiết về link hay..."
                                placeholderTextColor={Colors.textMuted}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Attachments */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Ionicons name="attach" size={16} color={Colors.textSecondary} />
                                <Text style={styles.label}>Đính kèm</Text>
                                <Text style={styles.countBadge}>{attachments.length}/10</Text>
                            </View>
                            {attachments.map((att, i) => (
                                <View key={i} style={styles.attachItem}>
                                    <Ionicons
                                        name={att.type === "LINK" ? "link-outline" : "image-outline"}
                                        size={16}
                                        color={Colors.info}
                                    />
                                    <Text style={styles.attachUrl} numberOfLines={1}>{att.url}</Text>
                                    <TouchableOpacity onPress={() => setAttachments(attachments.filter((_, j) => j !== i))}>
                                        <Ionicons name="close-circle" size={18} color={Colors.error} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <View style={styles.attachActions}>
                                <TouchableOpacity
                                    style={[styles.attachButton, showLinkInput && styles.attachButtonActive]}
                                    onPress={() => setShowLinkInput(!showLinkInput)}
                                >
                                    <Ionicons name="link-outline" size={16} color={showLinkInput ? Colors.primary : Colors.textSecondary} />
                                    <Text style={[styles.attachButtonText, showLinkInput && { color: Colors.primary }]}>Thêm link</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.attachButton} onPress={pickAttachmentImage} disabled={uploadingAttach}>
                                    {uploadingAttach ? (
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="image-outline" size={16} color={Colors.textSecondary} />
                                            <Text style={styles.attachButtonText}>Thêm ảnh</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            {showLinkInput && (
                                <View style={styles.linkInputRow}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        value={linkInput}
                                        onChangeText={setLinkInput}
                                        placeholder="Paste link hoặc URL ảnh..."
                                        placeholderTextColor={Colors.textMuted}
                                        autoCapitalize="none"
                                        onSubmitEditing={addLink}
                                        autoFocus
                                    />
                                    <TouchableOpacity style={styles.addSmallBtn} onPress={addLink}>
                                        <Ionicons name="add" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Tags */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Ionicons name="pricetags-outline" size={16} color={Colors.textSecondary} />
                                <Text style={styles.label}>Tags</Text>
                            </View>
                            {tags.length > 0 && (
                                <View style={styles.chipRow}>
                                    {tags.map((tag) => (
                                        <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => setTags(tags.filter((t) => t !== tag))}>
                                            <Text style={styles.tagChipText}>#{tag}</Text>
                                            <Ionicons name="close" size={12} color={Colors.primary} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                            <TextInput
                                style={styles.input}
                                value={tagInput}
                                onChangeText={setTagInput}
                                placeholder="Nhập tag rồi Enter..."
                                placeholderTextColor={Colors.textMuted}
                                onSubmitEditing={addTag}
                                returnKeyType="done"
                            />
                        </View>

                        {/* Lists */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Ionicons name="albums-outline" size={16} color={Colors.textSecondary} />
                                <Text style={styles.label}>Bộ sưu tập</Text>
                            </View>
                            <View style={styles.chipRow}>
                                {userLists.map((list) => {
                                    const selected = selectedListIds.includes(list.id);
                                    return (
                                        <TouchableOpacity
                                            key={list.id}
                                            style={[styles.listChip, selected && styles.listChipActive]}
                                            onPress={() => {
                                                if (selected) setSelectedListIds(selectedListIds.filter((lid) => lid !== list.id));
                                                else setSelectedListIds([...selectedListIds, list.id]);
                                            }}
                                        >
                                            <Text style={[styles.listChipText, selected && styles.listChipTextActive]}>
                                                {list.name}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                                <TouchableOpacity style={styles.createListChip} onPress={() => router.push("/list-form")}>
                                    <Ionicons name="add" size={14} color={Colors.primary} />
                                    <Text style={styles.createListText}>Tạo mới</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* View Mode */}
                        <View style={styles.fieldGroup}>
                            <View style={styles.labelRow}>
                                <Ionicons name="lock-closed-outline" size={16} color={Colors.textSecondary} />
                                <Text style={styles.label}>Chế độ hiển thị</Text>
                            </View>
                            <View style={styles.viewModeRow}>
                                <TouchableOpacity
                                    style={[styles.viewModeCard, !isPublic && styles.viewModeCardActive]}
                                    onPress={() => setIsPublic(false)}
                                >
                                    <Ionicons name="lock-closed" size={20} color={!isPublic ? Colors.primary : Colors.textMuted} />
                                    <Text style={[styles.viewModeTitle, !isPublic && styles.viewModeTitleActive]}>Private</Text>
                                    <Text style={styles.viewModeDesc}>Chỉ mình bạn</Text>
                                    {!isPublic && <Ionicons name="checkmark-circle" size={18} color={Colors.primary} style={styles.viewModeCheck} />}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.viewModeCard, isPublic && styles.viewModeCardActive]}
                                    onPress={() => setIsPublic(true)}
                                >
                                    <Ionicons name="globe" size={20} color={isPublic ? Colors.success : Colors.textMuted} />
                                    <Text style={[styles.viewModeTitle, isPublic && { color: Colors.success }]}>Public</Text>
                                    <Text style={styles.viewModeDesc}>Mọi người...</Text>
                                    {isPublic && <Ionicons name="checkmark-circle" size={18} color={Colors.success} style={styles.viewModeCheck} />}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Saving overlay */}
            <Modal visible={saving} transparent animationType="fade">
                <View style={styles.savingOverlay}>
                    <View style={styles.savingBox}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.savingText}>Đang lưu...</Text>
                    </View>
                </View>
            </Modal>

            {/* Image Picker Bottom Sheet */}
            <Modal visible={showPickerModal} transparent animationType="slide" onRequestClose={() => setShowPickerModal(false)}>
                <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowPickerModal(false)}>
                    <View style={styles.pickerSheet}>
                        <View style={styles.pickerHandle} />
                        <Text style={styles.pickerTitle}>Chọn ảnh</Text>
                        <Text style={styles.pickerSubtitle}>Chụp mới hoặc chọn từ thư viện</Text>

                        <View style={styles.pickerOptions}>
                            <TouchableOpacity style={styles.pickerOptionBtn} onPress={() => handlePickerOption("camera")}>
                                <View style={[styles.pickerIconWrap, { backgroundColor: "#FFF0F5" }]}>
                                    <Ionicons name="camera" size={28} color={Colors.primary} />
                                </View>
                                <Text style={styles.pickerOptionText}>Chụp ảnh</Text>
                                <Text style={styles.pickerOptionHint}>Mở camera thiết bị</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.pickerOptionBtn} onPress={() => handlePickerOption("library")}>
                                <View style={[styles.pickerIconWrap, { backgroundColor: "#F0F5FF" }]}>
                                    <Ionicons name="images" size={28} color="#4A90D9" />
                                </View>
                                <Text style={styles.pickerOptionText}>Thư viện</Text>
                                <Text style={styles.pickerOptionHint}>Chọn từ bộ sưu tập</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.pickerCancelBtn} onPress={() => setShowPickerModal(false)}>
                            <Text style={styles.pickerCancelText}>Hủy</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    formHeader: {
        paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
    },
    formTitle: {
        fontSize: FontSize.xl, fontFamily: FontFamily.bold, color: Colors.text,
    },
    formSubtitle: {
        fontSize: FontSize.sm, fontFamily: FontFamily.regular, color: Colors.textSecondary, marginTop: 4,
    },
    form: { paddingHorizontal: Spacing.xl, paddingBottom: 60 },

    // Upload area
    uploadArea: {
        marginBottom: Spacing.lg,
    },
    uploadDashed: {
        borderWidth: 2, borderColor: Colors.border, borderStyle: "dashed", borderRadius: BorderRadius.lg,
        paddingVertical: 28, alignItems: "center", backgroundColor: "rgba(0,0,0,0.01)",
    },
    uploadText: { fontSize: FontSize.sm, fontFamily: FontFamily.medium, color: Colors.textSecondary, marginTop: 8 },
    uploadHint: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, color: Colors.textMuted, marginTop: 4 },
    thumbPreviewWrap: {
        alignItems: "center", position: "relative",
    },
    thumbPreview: {
        width: 120, height: 120, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: Colors.border,
    },
    thumbActions: {
        flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm,
    },
    thumbActionBtn: {
        width: 36, height: 36, borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
        justifyContent: "center", alignItems: "center",
    },
    thumbnailInput: {
        fontSize: FontSize.xs, fontFamily: FontFamily.regular, color: Colors.text,
        backgroundColor: Colors.surface, borderRadius: BorderRadius.sm, borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Spacing.md, height: 36, marginTop: Spacing.sm,
    },

    // Field group
    fieldGroup: { marginBottom: Spacing.xl },
    labelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: Spacing.sm },
    label: { fontSize: FontSize.sm, fontFamily: FontFamily.semiBold, color: Colors.text },
    required: { color: Colors.primary },
    countBadge: { fontSize: FontSize.xs, color: Colors.primary, fontFamily: FontFamily.medium, marginLeft: "auto" },

    // Inputs
    input: {
        backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border,
        paddingHorizontal: Spacing.lg, height: 48, fontSize: FontSize.md, color: Colors.text, fontFamily: FontFamily.regular,
    },
    inputFocused: { borderColor: Colors.primary, borderWidth: 1.5 },
    textArea: { height: 100, paddingTop: Spacing.md, textAlignVertical: "top" },

    // Chips
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.sm },
    tagChip: {
        flexDirection: "row", alignItems: "center", gap: 4,
        backgroundColor: "rgba(233,30,99,0.08)", paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: BorderRadius.full,
    },
    tagChipText: { fontSize: FontSize.sm, color: Colors.primary, fontFamily: FontFamily.medium },
    listChip: {
        borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.lg, paddingVertical: 8,
        borderRadius: BorderRadius.full, backgroundColor: Colors.surface,
    },
    listChipActive: { borderColor: Colors.primary, backgroundColor: "rgba(233,30,99,0.06)" },
    listChipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.regular },
    listChipTextActive: { color: Colors.primary, fontFamily: FontFamily.semiBold },
    createListChip: {
        flexDirection: "row", alignItems: "center", gap: 4,
        borderWidth: 1, borderColor: Colors.primary, borderStyle: "dashed",
        paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: BorderRadius.full,
    },
    createListText: { fontSize: FontSize.sm, color: Colors.primary, fontFamily: FontFamily.medium },

    // Attachments
    attachItem: {
        flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md,
        backgroundColor: Colors.surface, borderRadius: BorderRadius.md, marginBottom: 4,
        borderWidth: 1, borderColor: Colors.border,
    },
    attachUrl: { flex: 1, fontSize: FontSize.xs, color: Colors.info, fontFamily: FontFamily.regular },
    attachActions: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.sm },
    attachButton: {
        flexDirection: "row", alignItems: "center", gap: 4,
        borderWidth: 1, borderColor: Colors.border, borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.lg, paddingVertical: 8,
    },
    attachButtonText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontFamily: FontFamily.medium },
    attachButtonActive: { borderColor: Colors.primary, backgroundColor: "rgba(233,30,99,0.06)" },
    linkInputRow: { flexDirection: "row", gap: Spacing.sm, alignItems: "center" },
    addSmallBtn: {
        backgroundColor: Colors.primary, width: 48, height: 48, borderRadius: BorderRadius.lg,
        justifyContent: "center", alignItems: "center",
    },

    // View Mode
    viewModeRow: { flexDirection: "row", gap: Spacing.md },
    viewModeCard: {
        flex: 1, padding: Spacing.lg, borderRadius: BorderRadius.lg,
        borderWidth: 1.5, borderColor: Colors.border, alignItems: "center", position: "relative",
    },
    viewModeCardActive: { borderColor: Colors.primary, backgroundColor: "rgba(233,30,99,0.04)" },
    viewModeTitle: { fontSize: FontSize.md, fontFamily: FontFamily.bold, color: Colors.textSecondary, marginTop: 6 },
    viewModeTitleActive: { color: Colors.primary },
    viewModeDesc: { fontSize: FontSize.xs, fontFamily: FontFamily.regular, color: Colors.textMuted, marginTop: 2 },
    viewModeCheck: { position: "absolute", top: 8, right: 8 },

    // Save button in header
    saveHeaderBtn: {
        backgroundColor: Colors.primary, width: 40, height: 40, borderRadius: 20,
        justifyContent: "center", alignItems: "center",
    },

    // Saving overlay
    savingOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center", alignItems: "center",
    },
    savingBox: {
        backgroundColor: "#fff", borderRadius: BorderRadius.xl,
        paddingHorizontal: 40, paddingVertical: 32,
        alignItems: "center", gap: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
    },
    savingText: {
        fontSize: FontSize.md, fontFamily: FontFamily.medium,
        color: Colors.text,
    },

    // Image picker bottom sheet
    pickerOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    pickerSheet: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12,
        alignItems: "center",
    },
    pickerHandle: {
        width: 40, height: 4, borderRadius: 2,
        backgroundColor: "#DDD", marginBottom: 16,
    },
    pickerTitle: {
        fontSize: FontSize.lg, fontFamily: FontFamily.bold,
        color: Colors.text, marginBottom: 4,
    },
    pickerSubtitle: {
        fontSize: FontSize.sm, fontFamily: FontFamily.regular,
        color: Colors.textMuted, marginBottom: 20,
    },
    pickerOptions: {
        flexDirection: "row", gap: 16, marginBottom: 20, width: "100%",
    },
    pickerOptionBtn: {
        flex: 1, alignItems: "center",
        backgroundColor: "#FAFAFA", borderRadius: BorderRadius.lg,
        paddingVertical: 20, borderWidth: 1, borderColor: "#F0F0F0",
    },
    pickerIconWrap: {
        width: 56, height: 56, borderRadius: 28,
        justifyContent: "center", alignItems: "center", marginBottom: 10,
    },
    pickerOptionText: {
        fontSize: FontSize.sm, fontFamily: FontFamily.bold,
        color: Colors.text,
    },
    pickerOptionHint: {
        fontSize: FontSize.xs, fontFamily: FontFamily.regular,
        color: Colors.textMuted, marginTop: 2,
    },
    pickerCancelBtn: {
        width: "100%", paddingVertical: 14,
        borderRadius: BorderRadius.lg, backgroundColor: "#F5F5F5",
        alignItems: "center",
    },
    pickerCancelText: {
        fontSize: FontSize.md, fontFamily: FontFamily.medium,
        color: Colors.textSecondary,
    },
});
