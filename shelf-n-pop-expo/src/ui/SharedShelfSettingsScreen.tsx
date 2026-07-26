import type { Session } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from "react-native";

import {
  buildSharedStatsMembers,
  confirmAction,
  generateInviteCode,
  sharedShelfMemberName,
} from "../domain/appHelpers";
import {
  fetchSharedShelfCollectionItems,
  fetchSharedShelfMembers,
} from "../data/supabaseQueries";
import { supabase } from "../lib/supabase";
import type { SharedShelf, SharedShelfCollectionItem, SharedShelfMember } from "../types";
import { integer, money } from "../utils/format";
import { Label } from "./FormPrimitives";
import { Text, TextInput } from "./Primitives";
import { ScreenFrame } from "./ShellPrimitives";

type SharedShelfSettingsScreenProps = {
  shelf: SharedShelf;
  session: Session;
  onBack: () => void;
  onShelfUpdated: (shelf: SharedShelf) => void;
  onShelfLeft: () => void;
  appVersion: string;
};

type SharedShelfUpdate = Pick<
  SharedShelf,
  "id" | "name" | "description" | "invite_code" | "created_by" | "created_at" | "updated_at"
>;

export function SharedShelfSettingsScreen({
  shelf,
  session,
  onBack,
  onShelfUpdated,
  onShelfLeft,
  appVersion,
}: SharedShelfSettingsScreenProps) {
  const [currentShelf, setCurrentShelf] = useState(shelf);
  const [shelfName, setShelfName] = useState(shelf.name);
  const [members, setMembers] = useState<SharedShelfMember[]>([]);
  const [memberItems, setMemberItems] = useState<SharedShelfCollectionItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [memberRows, itemRows] = await Promise.all([
        fetchSharedShelfMembers(currentShelf.id),
        fetchSharedShelfCollectionItems(currentShelf.id),
      ]);
      setMembers(memberRows);
      setMemberItems(itemRows);
    } catch (error) {
      Alert.alert("Settings error", error instanceof Error ? error.message : "Could not load shared shelf settings.");
    } finally {
      setBusy(false);
    }
  }, [currentShelf.id]);

  useEffect(() => {
    setCurrentShelf(shelf);
    setShelfName(shelf.name);
  }, [shelf]);

  useEffect(() => {
    load();
  }, [load]);

  const currentMember = members.find((member) => member.user_id === session.user.id);
  const isShelfOwner = currentShelf.created_by === session.user.id || currentMember?.role === "owner";
  const memberStats = useMemo(() => buildSharedStatsMembers(memberItems).filter((member) => member.id !== "all"), [memberItems]);
  const shelfTotals = useMemo(
    () =>
      memberItems.reduce(
        (summary, item) => ({
          pops: summary.pops + Number(item.quantity ?? 0),
          value: summary.value + Number(item.total_value ?? 0),
        }),
        { pops: 0, value: 0 },
      ),
    [memberItems],
  );

  const applyShelfUpdate = (data: SharedShelfUpdate) => {
    const updatedShelf = {
      ...currentShelf,
      ...data,
      member_names: currentShelf.member_names,
      member_count: currentShelf.member_count,
    };
    setCurrentShelf(updatedShelf);
    setShelfName(updatedShelf.name);
    onShelfUpdated(updatedShelf);
  };

  const saveShelfName = async () => {
    const cleanName = shelfName.trim();
    if (!cleanName) {
      Alert.alert("Shelf name needed", "Enter a name for this shared shelf.");
      return;
    }
    if (cleanName === currentShelf.name) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("shared_shelves")
      .update({ name: cleanName })
      .eq("id", currentShelf.id)
      .select("id,name,description,invite_code,created_by,created_at,updated_at")
      .single();
    setSaving(false);

    if (error) {
      Alert.alert("Rename failed", error.message);
      return;
    }

    applyShelfUpdate(data as SharedShelfUpdate);
  };

  const copyInviteCode = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(currentShelf.invite_code);
      Alert.alert("Invite copied", "The invite code is ready to share.");
      return;
    }

    Alert.alert("Invite code", currentShelf.invite_code);
  };

  const updateInviteCode = async () => {
    setSaving(true);
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const { data, error } = await supabase
        .from("shared_shelves")
        .update({ invite_code: generateInviteCode() })
        .eq("id", currentShelf.id)
        .select("id,name,description,invite_code,created_by,created_at,updated_at")
        .single();

      if (!error && data) {
        setSaving(false);
        applyShelfUpdate(data as SharedShelfUpdate);
        return;
      }

      lastError = error;
    }

    setSaving(false);
    Alert.alert("Invite update failed", lastError instanceof Error ? lastError.message : "Could not create a new invite code.");
  };

  const regenerateInviteCode = () => {
    confirmAction("Refresh invite code?", "The old invite code will stop working for new members, but current shelf members stay connected.", () => {
      void updateInviteCode();
    });
  };

  const removeMember = (member: SharedShelfMember) => {
    const memberName = sharedShelfMemberName(member);
    confirmAction("Remove shelf access?", `${memberName} will leave this shared shelf view. Their personal shelf and Pops will not be changed.`, async () => {
      setSaving(true);
      const { data, error } = await supabase
        .from("shared_shelf_members")
        .delete()
        .eq("id", member.id)
        .eq("shelf_id", currentShelf.id)
        .select("id")
        .maybeSingle();
      setSaving(false);

      if (error) {
        Alert.alert("Could not unlink collector", error.message);
        return;
      }

      if (!data) {
        Alert.alert("Nothing changed", "Shelf-n-Pop could not unlink that collector. You may need the shelf owner to try it.");
        return;
      }

      setMembers((current) => current.filter((row) => row.id !== member.id));
      setMemberItems((current) => current.filter((item) => item.owner_user_id !== member.user_id));
      await load();
    });
  };

  const leaveShelf = () => {
    const membership = currentMember;
    if (!membership || membership.role === "owner") return;

    confirmAction("Leave shared shelf?", "You will lose access to this shared shelf. Your personal shelf will not be changed.", async () => {
      setSaving(true);
      const { error } = await supabase.from("shared_shelf_members").delete().eq("id", membership.id);
      setSaving(false);

      if (error) {
        Alert.alert("Could not leave shelf", error.message);
        return;
      }

      onShelfLeft();
    });
  };

  return (
    <ScreenFrame appVersion={appVersion} title="⚙️ Shelf Settings" onBack={onBack}>
      <View style={styles.sharedSettingsPanel}>
        <View style={styles.sharedSettingsBlock}>
          <Text style={styles.dashboardSectionTitle}>{currentShelf.name}</Text>
          <Text style={styles.mutedSmall}>
            {isShelfOwner ? "Tune the shelf name, invite code, and who can see the shared view." : "Review who is connected or step off this shared shelf."}
          </Text>
        </View>

        <View style={styles.sharedSettingsRecapGrid}>
          <View style={styles.sharedSettingsRecapTile}>
            <Text style={styles.sharedSettingsRecapLabel}>Members</Text>
            <Text style={styles.sharedSettingsRecapValue}>{integer(members.length)}</Text>
          </View>
          <View style={styles.sharedSettingsRecapTile}>
            <Text style={styles.sharedSettingsRecapLabel}>Shared Pops</Text>
            <Text style={styles.sharedSettingsRecapValue}>{integer(shelfTotals.pops)}</Text>
          </View>
          <View style={styles.sharedSettingsRecapTile}>
            <Text style={styles.sharedSettingsRecapLabel}>Shelf Value</Text>
            <Text style={styles.sharedSettingsRecapValue}>{money(shelfTotals.value)}</Text>
          </View>
        </View>

        <View style={styles.sharedSettingsBlock}>
          <Label>Shelf name</Label>
          <View style={styles.sharedSettingsNameRow}>
            <TextInput
              value={shelfName}
              onChangeText={setShelfName}
              editable={isShelfOwner && !saving}
              placeholder="Shared shelf name"
              placeholderTextColor="#8c95a3"
              style={[styles.input, styles.flex]}
            />
            <Pressable
              onPress={saveShelfName}
              disabled={!isShelfOwner || saving || shelfName.trim() === currentShelf.name}
              style={[styles.sharedSettingsSmallButton, (!isShelfOwner || saving || shelfName.trim() === currentShelf.name) && styles.disabled]}
            >
              <Text style={styles.sharedSettingsSmallButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.sharedSettingsBlock}>
          <Label>Invite code</Label>
          <View style={styles.sharedInviteControlRow}>
            <Text selectable style={styles.sharedInviteControlCode}>
              {currentShelf.invite_code}
            </Text>
            <Pressable onPress={copyInviteCode} disabled={saving} style={[styles.sharedSettingsSmallButton, saving && styles.disabled]}>
              <Text style={styles.sharedSettingsSmallButtonText}>Copy</Text>
            </Pressable>
            {isShelfOwner ? (
              <Pressable onPress={regenerateInviteCode} disabled={saving} style={[styles.sharedSettingsSmallButtonMuted, saving && styles.disabled]}>
                <Text style={styles.sharedSettingsSmallButtonMutedText}>Refresh</Text>
              </Pressable>
            ) : null}
          </View>
          <Text style={styles.mutedSmall}>Share this code with people you want in the shelf circle.</Text>
        </View>
      </View>

      <View style={styles.sharedSettingsPanel}>
        <View style={styles.sharedSettingsBlock}>
          <Text style={styles.dashboardSectionTitle}>Members</Text>
          <Text style={styles.mutedSmall}>{integer(members.length)} people have access to this shelf.</Text>
        </View>

        {busy ? <ActivityIndicator color="#7e67f4" /> : null}
        {members.map((member) => {
          const isCurrentUser = member.user_id === session.user.id;
          const isOwnerMember = member.role === "owner";
          const stats = memberStats.find((row) => row.id === member.user_id);
          return (
            <View key={member.id} style={styles.sharedMemberRow}>
              <View style={styles.flex}>
                <View style={styles.sharedMemberNameRow}>
                  <Text style={styles.sharedMemberName}>
                    {sharedShelfMemberName(member)}
                    {isCurrentUser ? " (you)" : ""}
                  </Text>
                  <Text style={[styles.sharedMemberRole, isOwnerMember && styles.sharedMemberRoleOwner]}>
                    {isOwnerMember ? "Owner" : "Member"}
                  </Text>
                </View>
                <Text style={styles.mutedSmall}>
                  {integer(stats?.count ?? 0)} Pops - {money(stats?.value ?? 0)}
                </Text>
              </View>
              {isShelfOwner && !isCurrentUser && !isOwnerMember ? (
                <Pressable onPress={() => removeMember(member)} disabled={saving} style={[styles.sharedMemberRemoveButton, saving && styles.disabled]}>
                  <Text style={styles.sharedMemberRemoveText}>Remove Access</Text>
                </Pressable>
              ) : null}
            </View>
          );
        })}

        {!isShelfOwner && currentMember?.role !== "owner" ? (
          <Pressable onPress={leaveShelf} disabled={saving} style={[styles.sharedMemberLeaveButton, saving && styles.disabled]}>
            <Text style={styles.sharedMemberRemoveText}>Step Off Shelf</Text>
          </Pressable>
        ) : isShelfOwner ? (
          <View style={styles.sharedOwnerNote}>
            <Text style={styles.sharedSettingsRecapLabel}>Owner note</Text>
            <Text style={styles.mutedSmall}>Owners keep the shelf anchored. Remove other members above, or rename and refresh the invite code when the shelf changes.</Text>
          </View>
        ) : null}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  sharedSettingsPanel: {
    gap: 14,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#151a1f",
  },
  sharedSettingsBlock: {
    gap: 8,
  },
  sharedSettingsRecapGrid: {
    flexDirection: "row",
    gap: 8,
  },
  sharedSettingsRecapTile: {
    flex: 1,
    minHeight: 68,
    justifyContent: "center",
    gap: 4,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27353d",
    backgroundColor: "#101318",
  },
  sharedSettingsRecapLabel: {
    color: "#9bd5c9",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  sharedSettingsRecapValue: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "900",
  },
  sharedSettingsNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sharedInviteControlRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sharedInviteControlCode: {
    flex: 1,
    minHeight: 44,
    color: "#9bd5c9",
    fontSize: 15,
    fontWeight: "900",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#26313d",
    backgroundColor: "#0d1117",
  },
  sharedSettingsSmallButton: {
    minHeight: 44,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#7bd1c3",
  },
  sharedSettingsSmallButtonText: {
    color: "#101318",
    fontSize: 12,
    fontWeight: "900",
  },
  sharedSettingsSmallButtonMuted: {
    minHeight: 44,
    minWidth: 54,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#7bd1c3",
    backgroundColor: "#101318",
  },
  sharedSettingsSmallButtonMutedText: {
    color: "#d9fff8",
    fontSize: 12,
    fontWeight: "900",
  },
  sharedMemberRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#0d1117",
  },
  sharedMemberNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  sharedMemberName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
  sharedMemberRole: {
    color: "#b8c0cc",
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#202832",
    overflow: "hidden",
  },
  sharedMemberRoleOwner: {
    color: "#101318",
    backgroundColor: "#7bd1c3",
  },
  sharedMemberRemoveButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f07178",
    backgroundColor: "#221519",
  },
  sharedMemberLeaveButton: {
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f07178",
    backgroundColor: "#221519",
  },
  sharedOwnerNote: {
    gap: 5,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#314a49",
    backgroundColor: "#101a1c",
  },
  sharedMemberRemoveText: {
    color: "#f07178",
    fontSize: 12,
    fontWeight: "900",
  },
  dashboardSectionTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  mutedSmall: {
    color: "#b8c0cc",
    fontSize: 12,
    lineHeight: 16,
  },
  flex: {
    flex: 1,
  },
  input: {
    minHeight: 44,
    color: "#fff",
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d7dbe5",
    backgroundColor: "#151a1f",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.55,
  },
});
