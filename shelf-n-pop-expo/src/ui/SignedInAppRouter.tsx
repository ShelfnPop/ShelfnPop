import React, { type ReactNode, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { CollectionItem, SharedShelf } from "../types";
import type { CollectionFilter } from "../domain/appHelpers";

export type SignedInScreen =
  | "dashboard"
  | "scan"
  | "manualAdd"
  | "collection"
  | "detail"
  | "profile"
  | "publicProfile"
  | "sharedShelf"
  | "sharedShelfDetail"
  | "sharedShelfSettings"
  | "shelfStats"
  | "shelfBreakdown"
  | "admin"
  | "adminCatalogFix";

export interface SignedInAdminFix {
  catalogId: string;
  reportId?: string;
}

export interface SignedInAdminScreenProps {
  onBack: () => void;
  onFixCatalog: (catalogId: string, reportId?: string) => void;
}

export interface SignedInAdminCatalogFixScreenProps {
  catalogId: string;
  reportId?: string;
  onBack: () => void;
  onSaved: () => void;
}

export interface SignedInDashboardProps {
  onScan: () => void;
  onCollection: () => void;
  onShelfStats: () => void;
  onOpenItem: (item: CollectionItem) => void;
  onSharedShelf: () => void;
  onProfile: () => void;
  onAdmin?: () => void;
  refreshKey: number;
}

export interface SignedInScanProps {
  onBack: () => void;
  onManualAdd: () => void;
  onAdded: (item: CollectionItem) => void;
}

export interface SignedInManualAddProps {
  onBack: () => void;
  onAdded: (item: CollectionItem) => void;
}

export interface SignedInCollectionProps {
  onBack: () => void;
  initialFilter: CollectionFilter;
  onShelfStats: () => void;
  statsLabel: string;
  onOpenItem: (item: CollectionItem) => void;
}

export interface SignedInShelfStatsProps {
  onBack: () => void;
  onOpenBreakdown: () => void;
  onOpenFilter: (filter: CollectionFilter) => void;
  onOpenItem: (item: CollectionItem) => void;
}

export interface SignedInShelfBreakdownProps {
  onBack: () => void;
  onOpenFilter: (filter: CollectionFilter) => void;
}

export interface SignedInDetailProps {
  item: CollectionItem;
  onBack: () => void;
  onUpdated: (item: CollectionItem) => void;
  onSaved: () => void;
}

export interface SignedInSharedShelfProps {
  onBack: () => void;
  onOpenShelf: (shelf: SharedShelf) => void;
}

export interface SignedInSharedShelfDetailProps {
  shelf: SharedShelf;
  onBack: () => void;
  onSettings: () => void;
  onOpenProfile: (userId: string) => void;
}

export interface SignedInSharedShelfSettingsProps {
  shelf: SharedShelf;
  onBack: () => void;
  onShelfUpdated: (shelf: SharedShelf) => void;
  onShelfLeft: () => void;
}

export interface SignedInProfileProps {
  onBack: () => void;
}

export interface SignedInPublicProfileProps {
  userId: string;
  onBack: () => void;
}

export interface SignedInAppRouterProps {
  session: Session;
  renderDashboard: (props: SignedInDashboardProps) => ReactNode;
  renderScan: (props: SignedInScanProps) => ReactNode;
  renderManualAdd: (props: SignedInManualAddProps) => ReactNode;
  renderCollection: (props: SignedInCollectionProps) => ReactNode;
  renderShelfStats: (props: SignedInShelfStatsProps) => ReactNode;
  renderShelfBreakdown: (props: SignedInShelfBreakdownProps) => ReactNode;
  renderDetail: (props: SignedInDetailProps) => ReactNode;
  renderSharedShelf: (props: SignedInSharedShelfProps) => ReactNode;
  renderSharedShelfDetail: (props: SignedInSharedShelfDetailProps) => ReactNode;
  renderSharedShelfSettings: (props: SignedInSharedShelfSettingsProps) => ReactNode;
  renderProfile: (props: SignedInProfileProps) => ReactNode;
  renderAdmin: (props: SignedInAdminScreenProps) => ReactNode;
  renderAdminCatalogFix: (props: SignedInAdminCatalogFixScreenProps) => ReactNode;
  renderPublicProfile: (props: SignedInPublicProfileProps) => ReactNode;
}

export function SignedInAppRouter({
  session,
  renderDashboard,
  renderScan,
  renderManualAdd,
  renderCollection,
  renderShelfStats,
  renderShelfBreakdown,
  renderDetail,
  renderSharedShelf,
  renderSharedShelfDetail,
  renderSharedShelfSettings,
  renderProfile,
  renderAdmin,
  renderAdminCatalogFix,
  renderPublicProfile,
}: SignedInAppRouterProps) {
  const [screen, setScreen] = useState<SignedInScreen>("dashboard");
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [selectedAdminFix, setSelectedAdminFix] = useState<SignedInAdminFix | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<SharedShelf | null>(null);
  const [selectedPublicProfileId, setSelectedPublicProfileId] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>({ kind: "none", label: "All Pops" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled) {
          setIsAdmin(Boolean(data && !error));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [session.user.id]);

  const goHome = () => {
    setSelectedItem(null);
    setSelectedAdminFix(null);
    setSelectedShelf(null);
    setSelectedPublicProfileId(null);
    setScreen("dashboard");
    setRefreshKey((value) => value + 1);
  };

  return (
    <>
      {screen === "dashboard" &&
        renderDashboard({
          onScan: () => setScreen("scan"),
          onCollection: () => {
            setCollectionFilter({ kind: "none", label: "All Pops" });
            setScreen("collection");
          },
          onShelfStats: () => setScreen("shelfStats"),
          onOpenItem: (item) => {
            setSelectedItem(item);
            setScreen("detail");
          },
          onSharedShelf: () => setScreen("sharedShelf"),
          onProfile: () => setScreen("profile"),
          onAdmin: isAdmin ? () => setScreen("admin") : undefined,
          refreshKey,
        })}
      {screen === "scan" &&
        renderScan({
          onBack: goHome,
          onManualAdd: () => setScreen("manualAdd"),
          onAdded: (item) => {
            setSelectedItem(item);
            setScreen("detail");
          },
        })}
      {screen === "manualAdd" &&
        renderManualAdd({
          onBack: () => setScreen("scan"),
          onAdded: (item) => {
            setSelectedItem(item);
            setScreen("detail");
          },
        })}
      {screen === "collection" &&
        renderCollection({
          onBack: goHome,
          initialFilter: collectionFilter,
          onShelfStats: () => setScreen("shelfStats"),
          statsLabel: "View Stats >",
          onOpenItem: (item) => {
            setSelectedItem(item);
            setScreen("detail");
          },
        })}
      {screen === "shelfStats" &&
        renderShelfStats({
          onBack: goHome,
          onOpenBreakdown: () => setScreen("shelfBreakdown"),
          onOpenFilter: (filter) => {
            setCollectionFilter(filter);
            setScreen("collection");
          },
          onOpenItem: (item) => {
            setSelectedItem(item);
            setScreen("detail");
          },
        })}
      {screen === "shelfBreakdown" &&
        renderShelfBreakdown({
          onBack: () => setScreen("shelfStats"),
          onOpenFilter: (filter) => {
            setCollectionFilter(filter);
            setScreen("collection");
          },
        })}
      {screen === "detail" &&
        selectedItem &&
        renderDetail({
          item: selectedItem,
          onBack: () => setScreen("collection"),
          onUpdated: (item) => setSelectedItem(item),
          onSaved: () => {
            setSelectedItem(null);
            setScreen("collection");
          },
        })}
      {screen === "sharedShelf" && renderSharedShelf({ onBack: goHome, onOpenShelf: (shelf) => {
        setSelectedShelf(shelf);
        setScreen("sharedShelfDetail");
      }})}
      {screen === "sharedShelfDetail" &&
        selectedShelf &&
        renderSharedShelfDetail({
          shelf: selectedShelf,
          onBack: () => setScreen("sharedShelf"),
          onSettings: () => setScreen("sharedShelfSettings"),
          onOpenProfile: (userId) => {
            setSelectedPublicProfileId(userId);
            setScreen("publicProfile");
          },
        })}
      {screen === "sharedShelfSettings" &&
        selectedShelf &&
        renderSharedShelfSettings({
          shelf: selectedShelf,
          onBack: () => setScreen("sharedShelfDetail"),
          onShelfUpdated: (shelf) => setSelectedShelf(shelf),
          onShelfLeft: () => {
            setSelectedShelf(null);
            setScreen("sharedShelf");
          },
        })}
      {screen === "profile" && renderProfile({ onBack: goHome })}
      {screen === "admin" &&
        isAdmin &&
        renderAdmin({
          onBack: goHome,
          onFixCatalog: (catalogId, reportId) => {
            setSelectedAdminFix({ catalogId, reportId });
            setScreen("adminCatalogFix");
          },
        })}
      {screen === "adminCatalogFix" &&
        isAdmin &&
        selectedAdminFix &&
        renderAdminCatalogFix({
          catalogId: selectedAdminFix.catalogId,
          reportId: selectedAdminFix.reportId,
          onBack: () => setScreen("admin"),
          onSaved: () => {
            setSelectedAdminFix(null);
            setScreen("admin");
          },
        })}
      {screen === "publicProfile" &&
        selectedPublicProfileId &&
        renderPublicProfile({
          userId: selectedPublicProfileId,
          onBack: () => setScreen(selectedShelf ? "sharedShelfDetail" : "sharedShelf"),
        })}
    </>
  );
}
