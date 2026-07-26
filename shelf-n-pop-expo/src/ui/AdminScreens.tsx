import { ActivityIndicator, Alert, Image, Linking, Pressable, Switch, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import React, { useCallback, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import type { AdminAuditEvent, CatalogIssueReport, CatalogParserOverride, PopCatalog } from "../types";
import { integer, money } from "../utils/format";
import { Text, TextInput } from "./Primitives";
import { EmptyDisplayBox, Label, PrimaryButton, SecondaryButton } from "./FormPrimitives";
import { ScreenFrame } from "./ShellPrimitives";
import { adminHealthFilterLabel, adminRowDate, adminSeverityLabel, auditActionLabel, auditChangedFieldText, auditSubjectText, catalogHealthSeverity, displayPopName, getFunctionErrorMessage, issueTypeLabel, learnedOverrideData, parseReasonLabel, percent, sortedCatalogHealthRows, type AdminHealthFilter } from "../domain/appHelpers";

type AdminStyles = Record<string, any>;

type AdminTab = "health" | "reports" | "overrides" | "audit";

type AdminHealthMetrics = {
  missingImages: number;
  missingValues: number;
  lowConfidence: number;
  needsReview: number;
  openReports: number;
  healthQueue: number;
};

type AdminHealthRow = PopCatalog & {
    created_at: string | null;
    api_last_updated: string | null;
    parse_confidence: number | null;
    needs_review: boolean | null;
};

type AdminOverrideRow = CatalogParserOverride;

function buildEbaySoldSearchUrl({
  upc,
  popName,
  franchise,
  number,
  variant,
  exclusivity,
}: {
  upc?: string | null;
  popName: string;
  franchise: string;
  number: string;
  variant: string;
  exclusivity: string;
}) {
  const terms = [
    "Funko Pop",
    popName.trim(),
    franchise.trim(),
    number.trim() ? `#${number.trim().replace(/^#/, "")}` : "",
    !/^common$/i.test(variant.trim()) ? variant.trim() : "",
    exclusivity.trim(),
  ].filter(Boolean);
  const uniqueTerms = terms.filter((term, index) => (
    terms.findIndex((candidate) => candidate.toLowerCase() === term.toLowerCase()) === index
  ));
  const query = uniqueTerms.join(" ") || upc?.trim() || "Funko Pop";

  return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&LH_Sold=1&LH_Complete=1`;
}

type AdminScreenProps = {
  appVersion: string;
  session: Session;
  onBack: () => void;
  onFixCatalog: (catalogId: string, reportId?: string) => void;
  styles: AdminStyles;
};

export function AdminScreen({ appVersion, session, onBack, onFixCatalog, styles }: AdminScreenProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("health");
  const [healthFilter, setHealthFilter] = useState<AdminHealthFilter>("queue");
  const [metrics, setMetrics] = useState<AdminHealthMetrics>({ missingImages: 0, missingValues: 0, lowConfidence: 0, needsReview: 0, openReports: 0, healthQueue: 0, });
  const [healthRows, setHealthRows] = useState<AdminHealthRow[]>([]);
  const [reports, setReports] = useState<CatalogIssueReport[]>([]);
  const [overrides, setOverrides] = useState<AdminOverrideRow[]>([]);
  const [auditEvents, setAuditEvents] = useState<AdminAuditEvent[]>([]);
  const [busy, setBusy] = useState(true);
  const [setupError, setSetupError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setSetupError(null);
    const healthColumns = "id,created_at,api_last_updated,upc,pop_name,character,franchise,number,variant,exclusivity,pop_type,pop_style,set_name,image_url,vault_status,release_date,estimated_value,display_description,limited_edition,limited_count,edition_notes,parse_confidence,parse_reason_codes,needs_review";
    const buildHealthQuery = () => {
      const query = supabase.from("pop_catalog").select(healthColumns).order("api_last_updated", { ascending: false, nullsFirst: false }).limit(80);
      if (healthFilter === "needsReview") return query.eq("needs_review", true);
      if (healthFilter === "lowParse") return query.lt("parse_confidence", 0.75);
      if (healthFilter === "missingImages") return query.is("image_url", null);
      if (healthFilter === "missingValues") return query.or("estimated_value.is.null,estimated_value.eq.0");
      return query.or("needs_review.is.true,image_url.is.null,estimated_value.is.null,estimated_value.eq.0,parse_confidence.lt.0.75");
    };

    const [
      missingImages,
      missingValues,
      lowConfidence,
      needsReview,
      openReports,
      healthQueue,
      healthResult,
      reportsResult,
      overridesResult,
      auditResult,
    ] = await Promise.all([
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).is("image_url", null),
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).or("estimated_value.is.null,estimated_value.eq.0"),
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).lt("parse_confidence", 0.75),
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).eq("needs_review", true),
      supabase.from("catalog_issue_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("pop_catalog").select("id", { count: "exact", head: true }).or("needs_review.is.true,image_url.is.null,estimated_value.is.null,estimated_value.eq.0,parse_confidence.lt.0.75"),
      buildHealthQuery(),
      supabase.from("catalog_issue_reports").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(40),
      supabase.from("catalog_parser_overrides").select("*").eq("is_active", true).order("updated_at", { ascending: false }).limit(80),
      supabase.from("admin_audit_events").select("*").order("created_at", { ascending: false }).limit(40),
    ]);

    if (openReports.error || reportsResult.error) {
      setSetupError(openReports.error?.message ?? reportsResult.error?.message ?? "Admin issue queue is not available yet.");
      setReports([]);
    } else {
      const reportRows = (reportsResult.data ?? []) as CatalogIssueReport[];
      const catalogIds = Array.from(new Set(reportRows.map((report) => report.pop_catalog_id).filter(Boolean))) as string[];
      const catalogResult = catalogIds.length
        ? await supabase.from("pop_catalog").select("id,upc,pop_name,franchise,number,variant,set_name,image_url,estimated_value").in("id", catalogIds)
        : { data: [], error: null };

      const catalogById = new Map(((catalogResult.data ?? []) as PopCatalog[]).map((catalog) => [catalog.id, catalog]));
      setReports(reportRows.map((report) => {
        const catalog = report.pop_catalog_id ? catalogById.get(report.pop_catalog_id) : null;
        return {
          ...report,
          upc: catalog?.upc ?? null,
          pop_name: catalog?.pop_name ?? null,
          franchise: catalog?.franchise ?? null,
          number: catalog?.number ?? null,
          variant: catalog?.variant ?? null,
          set_name: catalog?.set_name ?? null,
          image_url: catalog?.image_url ?? null,
          estimated_value: catalog?.estimated_value ?? null,
        };
      }));
    }

    if (healthResult.error) {
      setSetupError((current) => current ?? healthResult.error.message);
      setHealthRows([]);
    } else {
      setHealthRows(sortedCatalogHealthRows((healthResult.data ?? []) as AdminHealthRow[]));
    }

    if (overridesResult.error) {
      setOverrides([]);
      setSetupError((current) => current ?? overridesResult.error.message);
    } else {
      const overrideRows = (overridesResult.data ?? []) as CatalogParserOverride[];
      const overrideCatalogIds = Array.from(new Set(overrideRows.map((override) => override.pop_catalog_id).filter(Boolean))) as string[];
      const overrideCatalogResult = overrideCatalogIds.length
        ? await supabase.from("pop_catalog").select("id,upc,pop_name,character,franchise,number,variant,set_name,image_url").in("id", overrideCatalogIds)
        : { data: [], error: null };
      const overrideCatalogById = new Map(((overrideCatalogResult.data ?? []) as PopCatalog[]).map((catalog) => [catalog.id, catalog]));

      setOverrides(overrideRows.map((override) => {
        const catalog = override.pop_catalog_id ? overrideCatalogById.get(override.pop_catalog_id) : null;
        return {
          ...override,
          upc: catalog?.upc ?? override.upc,
          pop_name: catalog?.pop_name ?? null,
          character: catalog?.character ?? null,
          franchise: catalog?.franchise ?? null,
          number: catalog?.number ?? null,
          variant: catalog?.variant ?? null,
          set_name: catalog?.set_name ?? null,
          image_url: catalog?.image_url ?? null,
        };
      }));
    }

    if (auditResult.error) {
      setAuditEvents([]);
      setSetupError((current) => current ?? auditResult.error.message);
    } else {
      setAuditEvents((auditResult.data ?? []) as AdminAuditEvent[]);
    }

    setMetrics({
      missingImages: missingImages.count ?? 0,
      missingValues: missingValues.count ?? 0,
      lowConfidence: lowConfidence.count ?? 0,
      needsReview: needsReview.count ?? 0,
      openReports: openReports.count ?? 0,
      healthQueue: healthQueue.count ?? 0,
    });
    setBusy(false);
  }, [healthFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateReportStatus = async (report: CatalogIssueReport, status: "resolved" | "ignored") => {
    setBusy(true);
    const { error } = await supabase.from("catalog_issue_reports").update({
      status,
      resolved_by: session.user.id,
      resolved_at: new Date().toISOString(),
    }).eq("id", report.id);
    setBusy(false);
    if (error) {
      Alert.alert("Update failed", error.message);
      return;
    }
    await load();
  };

  const disableOverride = async (override: AdminOverrideRow) => {
    setBusy(true);
    const { error } = await supabase
      .from("catalog_parser_overrides")
      .update({
        is_active: false,
        updated_by: session.user.id,
        notes: override.notes ? `${override.notes}\nDisabled from Admin Console` : "Disabled from Admin Console",
      })
      .eq("id", override.id);
    setBusy(false);

    if (error) {
      Alert.alert("Override update failed", error.message);
      return;
    }

    await load();
  };

  return (
    <ScreenFrame appVersion={appVersion} title="Admin Console" onBack={onBack} rightLabel="Refresh" onRight={load}>
      <View style={styles.statsHero}>
        <Text style={styles.dashboardEyebrow}>App health</Text>
        <Text style={styles.dashboardSectionTitle}>Catalog quality and user reports</Text>
        <Text style={styles.dashboardSubtext}>Review the signals that most affect collector trust.</Text>
      </View>
      <View style={styles.adminGuidePanel}>
        <View style={styles.adminGuideStep}>
          <Text style={styles.adminGuideNumber}>1</Text>
          <View style={styles.flex}>
            <Text style={styles.adminGuideTitle}>Start with trust signals</Text>
            <Text style={styles.adminGuideCopy}>Reports, missing images, missing values, and low parser confidence should get fixed first.</Text>
          </View>
        </View>
        <View style={styles.adminGuideStep}>
          <Text style={styles.adminGuideNumber}>2</Text>
          <View style={styles.flex}>
            <Text style={styles.adminGuideTitle}>Fix the catalog row</Text>
            <Text style={styles.adminGuideCopy}>Clean franchise, set, box number, name, variant, image, and value before resolving.</Text>
          </View>
        </View>
        <View style={styles.adminGuideStep}>
          <Text style={styles.adminGuideNumber}>3</Text>
          <View style={styles.flex}>
            <Text style={styles.adminGuideTitle}>Let the parser learn</Text>
            <Text style={styles.adminGuideCopy}>Good fixes become overrides so the next scan starts cleaner.</Text>
          </View>
        </View>
      </View>
      <View style={styles.dashboardStatsGrid}>
        <MetricCard styles={styles} label="Reports" value={integer(metrics.openReports)} active={activeTab === "reports"} onPress={() => setActiveTab("reports")} />
        <MetricCard styles={styles} label="Needs Review" value={integer(metrics.needsReview)} active={activeTab === "health" && healthFilter === "needsReview"} onPress={() => { setHealthFilter("needsReview"); setActiveTab("health"); }} />
        <MetricCard styles={styles} label="Low Parse" value={integer(metrics.lowConfidence)} active={activeTab === "health" && healthFilter === "lowParse"} onPress={() => { setHealthFilter("lowParse"); setActiveTab("health"); }} />
      </View>
      <View style={styles.dashboardStatsGrid}>
        <MetricCard styles={styles} label="No Image" value={integer(metrics.missingImages)} active={activeTab === "health" && healthFilter === "missingImages"} onPress={() => { setHealthFilter("missingImages"); setActiveTab("health"); }} />
        <MetricCard styles={styles} label="No Value" value={integer(metrics.missingValues)} active={activeTab === "health" && healthFilter === "missingValues"} onPress={() => { setHealthFilter("missingValues"); setActiveTab("health"); }} />
        <MetricCard styles={styles} label="Queue" value={integer(metrics.openReports + metrics.healthQueue)} active={activeTab === "health" && healthFilter === "queue"} onPress={() => { setHealthFilter("queue"); setActiveTab("health"); }} />
      </View>
      <View style={styles.adminTabs}>
        <Pressable onPress={() => setActiveTab("health")} style={[styles.adminTab, activeTab === "health" && styles.adminTabActive]}>
          <Text style={[styles.adminTabText, activeTab === "health" && styles.adminTabTextActive]}>Health</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("reports")} style={[styles.adminTab, activeTab === "reports" && styles.adminTabActive]}>
          <Text style={[styles.adminTabText, activeTab === "reports" && styles.adminTabTextActive]}>Reports</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("overrides")} style={[styles.adminTab, activeTab === "overrides" && styles.adminTabActive]}>
          <Text style={[styles.adminTabText, activeTab === "overrides" && styles.adminTabTextActive]}>Overrides</Text>
        </Pressable>
        <Pressable onPress={() => setActiveTab("audit")} style={[styles.adminTab, activeTab === "audit" && styles.adminTabActive]}>
          <Text style={[styles.adminTabText, activeTab === "audit" && styles.adminTabTextActive]}>Audit</Text>
        </Pressable>
      </View>
      {setupError ? (
        <View style={styles.adminNotice}>
          <Text style={styles.cardLabel}>Admin setup needed</Text>
          <Text style={styles.mutedSmall}>{setupError}</Text>
        </View>
      ) : null}

      {busy ? (
        <ActivityIndicator color="#7e67f4" />
      ) : activeTab === "health" ? (
        <View style={styles.dashboardInsightPanel}>
          <Text style={styles.dashboardSectionTitle}>{adminHealthFilterLabel(healthFilter)} Queue</Text>
          {healthRows.length === 0 ? (
            <View style={styles.emptyMiniCard}>
              <Text style={styles.cardLabel}>Queue is clear</Text>
              <Text style={styles.mutedSmall}>No catalog rows match this signal right now.</Text>
            </View>
          ) : null}
          {healthRows.map((row) => (
            <View key={row.id} style={styles.adminQueueRow}>
              {row.image_url ? <Image source={{ uri: row.image_url }} style={styles.adminQueueImage} /> : <EmptyDisplayBox style={styles.adminQueueImagePlaceholder} />}
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{displayPopName(row)}</Text>
                <Text style={styles.itemDetailLine}>
                  {[row.franchise, row.set_name, row.number ? `#${row.number}` : null].filter(Boolean).join(" - ") || row.upc || "Catalog row"}
                </Text>
                <View style={styles.adminBadgeRow}>
                  <Text style={styles.adminIssueBadge}>{adminSeverityLabel(catalogHealthSeverity(row))}</Text>
                  {!row.image_url ? <Text style={styles.adminIssueBadge}>Image</Text> : null}
                  {Number(row.estimated_value ?? 0) <= 0 ? <Text style={styles.adminIssueBadge}>Value</Text> : null}
                  {row.needs_review ? <Text style={styles.adminIssueBadge}>Review</Text> : null}
                  {Number(row.parse_confidence ?? 1) < 0.75 ? <Text style={styles.adminIssueBadge}>Parse {percent(Number(row.parse_confidence ?? 0) * 100)}</Text> : null}
                  {(row.parse_reason_codes ?? []).slice(0, 2).map((reason) => (
                    <Text key={reason} style={styles.adminReasonBadge}>{parseReasonLabel(reason)}</Text>
                  ))}
                </View>
              </View>
              <View style={styles.adminQueueMeta}>
                <Text style={styles.dashboardInsightValue}>{money(row.estimated_value)}</Text>
                <Text style={styles.dashboardInsightLabel}>{adminRowDate(row.api_last_updated ?? row.created_at)}</Text>
                <Pressable onPress={() => onFixCatalog(row.id)} style={styles.adminFixButton}>
                  <Text style={styles.adminFixButtonText}>Fix</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : activeTab === "reports" ? (
        <View style={styles.dashboardInsightPanel}>
          <Text style={styles.dashboardSectionTitle}>User Reports</Text>
          {reports.length === 0 ? (
            <View style={styles.emptyMiniCard}>
              <Text style={styles.cardLabel}>No open user reports</Text>
              <Text style={styles.mutedSmall}>When collectors flag bad images, values, or details, they will land here.</Text>
            </View>
          ) : null}
          {reports.map((report) => (
            <View key={report.id} style={styles.adminReportCard}>
              <View style={styles.adminReportTop}>
                {report.image_url ? <Image source={{ uri: report.image_url }} style={styles.adminQueueImage} /> : <EmptyDisplayBox style={styles.adminQueueImagePlaceholder} />}
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{report.pop_name ?? "Catalog item"}</Text>
                  <Text style={styles.itemDetailLine}>
                    {[report.franchise, report.set_name, report.number ? `#${report.number}` : null].filter(Boolean).join(" - ") || report.upc || "User report"}
                  </Text>
                  <Text style={styles.adminIssueBadge}>{issueTypeLabel(report.issue_type)}</Text>
                </View>
                <Text style={styles.dashboardInsightLabel}>{adminRowDate(report.created_at)}</Text>
              </View>
              {report.notes ? <Text style={styles.mutedSmall}>{report.notes}</Text> : null}
              <View style={styles.adminReportActions}>
                {report.pop_catalog_id ? <SecondaryButton label="Open Fix" onPress={() => onFixCatalog(report.pop_catalog_id as string, report.id)} disabled={busy} /> : null}
                <SecondaryButton label="Ignore" onPress={() => updateReportStatus(report, "ignored")} disabled={busy} />
                <PrimaryButton label="Resolve" onPress={() => updateReportStatus(report, "resolved")} disabled={busy} />
              </View>
            </View>
          ))}
        </View>
      ) : activeTab === "overrides" ? (
        <View style={styles.dashboardInsightPanel}>
          <Text style={styles.dashboardSectionTitle}>Learned Overrides</Text>
          <Text style={styles.mutedSmall}>Active parser lessons saved from admin fixes. Disable one if a correction should stop influencing future lookups.</Text>
          {overrides.length === 0 ? (
            <View style={styles.emptyMiniCard}>
              <Text style={styles.cardLabel}>No active learned overrides</Text>
              <Text style={styles.mutedSmall}>Fixes with learning enabled will show here after they are saved.</Text>
            </View>
          ) : null}
          {overrides.map((override) => {
            const learnedFields = Object.keys(override.override_data ?? {}).filter((field) => !["parse_confidence", "needs_review", "parse_reason_codes", "warnings"].includes(field));
            return (
              <View key={override.id} style={styles.adminReportCard}>
                <View style={styles.adminReportTop}>
                  {override.image_url ? <Image source={{ uri: override.image_url }} style={styles.adminQueueImage} /> : <EmptyDisplayBox style={styles.adminQueueImagePlaceholder} />}
                  <View style={styles.flex}>
                    <Text style={styles.itemTitle}>{displayPopName(override)}</Text>
                    <Text style={styles.itemDetailLine}>
                      {[override.franchise, override.set_name, override.number ? `#${override.number}` : null].filter(Boolean).join(" - ") || override.upc || "Learned override"}
                    </Text>
                    <Text style={styles.mutedSmall}>Fields: {learnedFields.length ? learnedFields.slice(0, 6).join(", ") : "Identity fields"}</Text>
                    <Text style={styles.mutedSmall}>Updated: {adminRowDate(override.updated_at ?? override.created_at)}</Text>
                  </View>
                </View>
                {override.notes ? <Text style={styles.mutedSmall}>{override.notes}</Text> : null}
                <View style={styles.adminReportActions}>
                  {override.pop_catalog_id ? <SecondaryButton label="Open Fix" onPress={() => onFixCatalog(override.pop_catalog_id as string)} disabled={busy} /> : null}
                  <SecondaryButton label="Disable" onPress={() => disableOverride(override)} disabled={busy} />
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.dashboardInsightPanel}>
          <Text style={styles.dashboardSectionTitle}>Recent Audit Trail</Text>
          {auditEvents.length === 0 ? (
            <View style={styles.emptyMiniCard}>
              <Text style={styles.cardLabel}>No admin changes yet</Text>
              <Text style={styles.mutedSmall}>Catalog fixes, report status changes, and learned override updates will appear here.</Text>
            </View>
          ) : null}
          {auditEvents.map((event) => (
            <View key={event.id} style={styles.adminAuditRow}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{auditActionLabel(event.action)}</Text>
                <Text style={styles.itemDetailLine}>{auditSubjectText(event)}</Text>
                <Text style={styles.mutedSmall}>Changed: {auditChangedFieldText(event)}</Text>
              </View>
              <Text style={styles.dashboardInsightLabel}>{adminRowDate(event.created_at)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScreenFrame>
  );
}

type AdminCatalogFixScreenProps = {
  appVersion: string;
  session: Session;
  catalogId: string;
  reportId?: string;
  onBack: () => void;
  onSaved: () => void;
  styles: AdminStyles;
};

export function AdminCatalogFixScreen({ appVersion, session, catalogId, reportId, onBack, onSaved, styles }: AdminCatalogFixScreenProps) {
  const [catalog, setCatalog] = useState<PopCatalog | null>(null);
  const [popName, setPopName] = useState("");
  const [character, setCharacter] = useState("");
  const [franchise, setFranchise] = useState("");
  const [setName, setSetName] = useState("");
  const [number, setNumber] = useState("");
  const [variant, setVariant] = useState("");
  const [exclusivity, setExclusivity] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [displayDescription, setDisplayDescription] = useState("");
  const [needsReview, setNeedsReview] = useState(false);
  const [learnFromFix, setLearnFromFix] = useState(true);
  const [busy, setBusy] = useState(true);
  const [apiBusy, setApiBusy] = useState(false);

  const applyCatalogRow = useCallback((row: PopCatalog | null) => {
    setCatalog(row);
    setPopName(row?.pop_name ?? "");
    setCharacter(row?.character ?? "");
    setFranchise(row?.franchise ?? "");
    setSetName(row?.set_name ?? "");
    setNumber(row?.number ?? "");
    setVariant(row?.variant ?? "");
    setExclusivity(row?.exclusivity ?? "");
    setImageUrl(row?.image_url ?? "");
    setEstimatedValue(row?.estimated_value == null ? "" : String(row.estimated_value));
    setDisplayDescription(row?.display_description ?? "");
    setNeedsReview(Boolean(row?.needs_review));
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    const { data, error } = await supabase
      .from("pop_catalog")
      .select("id,created_at,api_last_updated,upc,pop_name,character,franchise,number,variant,exclusivity,pop_type,pop_style,set_name,image_url,vault_status,release_date,estimated_value,display_description,limited_edition,limited_count,edition_notes,parse_confidence,parse_reason_codes,needs_review")
      .eq("id", catalogId)
      .maybeSingle();
    setBusy(false);
    if (error) {
      Alert.alert("Catalog load failed", error.message);
      return;
    }
    applyCatalogRow(data as PopCatalog | null);
  }, [applyCatalogRow, catalogId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (resolveReport: boolean) => {
    const parsedValue = estimatedValue.trim() ? Number(estimatedValue) : null;
    if (parsedValue != null && !Number.isFinite(parsedValue)) {
      Alert.alert("Check value", "Estimated value needs to be a number.");
      return;
    }
    setBusy(true);
    const payload = {
      pop_name: popName.trim() || null,
      character: character.trim() || null,
      franchise: franchise.trim() || null,
      set_name: setName.trim() || null,
      number: number.trim() || null,
      variant: variant.trim() || null,
      exclusivity: exclusivity.trim() || null,
      image_url: imageUrl.trim() || null,
      estimated_value: parsedValue,
      display_description: displayDescription.trim() || null,
      needs_review: needsReview,
      parse_confidence: learnFromFix ? 0.95 : catalog?.parse_confidence ?? null,
      parse_reason_codes: learnFromFix && !needsReview ? [] : catalog?.parse_reason_codes ?? [],
      api_last_updated: new Date().toISOString(),
    };
    const { error } = await supabase.from("pop_catalog").update(payload).eq("id", catalogId);
    if (error) {
      setBusy(false);
      Alert.alert("Save failed", error.message);
      return;
    }

    if (learnFromFix && catalog?.upc) {
      const overrideData = learnedOverrideData({
        pop_name: payload.pop_name,
        character: payload.character,
        franchise: payload.franchise,
        set_name: payload.set_name,
        number: payload.number,
        variant: payload.variant,
        exclusivity: payload.exclusivity,
        pop_type: catalog.pop_type,
        pop_style: catalog.pop_style,
        display_description: payload.display_description,
      });
      if (Object.keys(overrideData).length > 0) {
        const overrideResult = await supabase.from("catalog_parser_overrides").upsert({
          upc: catalog.upc,
          pop_catalog_id: catalogId,
          override_data: overrideData,
          updated_by: session.user.id,
          created_by: session.user.id,
          is_active: true,
          notes: "Learned from Admin Console catalog fix",
        }, { onConflict: "upc" });

        if (overrideResult.error) {
          setBusy(false);
          Alert.alert("Catalog saved", `The catalog row was updated, but the parser learning override was not saved: ${overrideResult.error.message}`);
          return;
        }
      }
    }

    if (resolveReport && reportId) {
      const reportResult = await supabase.from("catalog_issue_reports").update({
        status: "resolved",
        resolved_by: session.user.id,
        resolved_at: new Date().toISOString(),
      }).eq("id", reportId);
      if (reportResult.error) {
        setBusy(false);
        Alert.alert("Catalog saved", `The catalog row was updated, but the report was not resolved: ${reportResult.error.message}`);
        return;
      }
    }
    setBusy(false);
    onSaved();
  };

  const refreshFromApi = async () => {
    if (!catalog?.upc) {
      Alert.alert("Missing UPC", "This catalog row needs a UPC before it can refresh from the lookup API.");
      return;
    }

    const requestBody = {
      barcode: catalog.upc,
      forceRefresh: true,
      variantOverride: variant.trim() || catalog.variant || "Common",
      exclusivityOverride: exclusivity.trim() || null,
    };

    setApiBusy(true);
    const { data, error } = await supabase.functions.invoke("lookup_pop", {
      method: "POST",
      body: requestBody,
    });

    if (error) {
      setApiBusy(false);
      Alert.alert("API refresh failed", await getFunctionErrorMessage(error, catalog.upc));
      return;
    }

const response = data as { found?: boolean; pop?: PopCatalog; message?: string; } | null;
    if (response == null || typeof response !== "object") {
      setApiBusy(false);
      Alert.alert("API refresh incomplete", "Lookup API returned an unexpected payload.");
      return;
    }
    const hasResponseObject = true;
    const hasFoundFlag = hasResponseObject && Object.prototype.hasOwnProperty.call(response, "found");
    const hasPop = Boolean(hasResponseObject && "pop" in response && response.pop);

    if ((hasFoundFlag && response?.found === false) || (!hasFoundFlag && !hasPop)) {
      setApiBusy(false);
      const responseMessage = hasResponseObject && "message" in response && response.message
        ? response.message
        : "Lookup API did not return a matching catalog record.";
      Alert.alert("API refresh incomplete", responseMessage);
      return;
    }
    if (!hasPop) {
      setApiBusy(false);
      Alert.alert("API refresh incomplete", `Lookup API returned an unexpected payload: ${JSON.stringify(response, null, 2)}`);
      return;
    }

    applyCatalogRow(response.pop as PopCatalog);
    await load();
    setApiBusy(false);
    Alert.alert("API refresh complete", "The latest lookup data has been loaded into this fix screen.");
  };

  const reviewEbaySold = async () => {
    const url = buildEbaySoldSearchUrl({
      upc: catalog?.upc,
      popName,
      franchise,
      number,
      variant,
      exclusivity,
    });

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert(
        "Could not open eBay",
        error instanceof Error ? error.message : "Open eBay sold listings in a browser and search for this Pop.",
      );
    }
  };
  const fixRecapValue = estimatedValue.trim() && Number.isFinite(Number(estimatedValue)) ? Number(estimatedValue) : catalog?.estimated_value;

  return (
    <ScreenFrame appVersion={appVersion} title="Fix Catalog Item" onBack={onBack} rightLabel="Reload" onRight={load}>
      {busy && !catalog ? <ActivityIndicator color="#7e67f4" /> : catalog ? (
        <>
          <View style={styles.detailHero}>
            <View style={styles.detailHeroTop}>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.detailHeroImage} /> : <EmptyDisplayBox style={styles.detailHeroImagePlaceholder} />}
              <View style={styles.detailHeroCopy}>
                <Text style={styles.dashboardEyebrow}>Shared catalog record</Text>
                <Text style={styles.detailTitle}>{displayPopName({ ...catalog, pop_name: popName, character, variant })}</Text>
                <Text style={styles.mutedSmall}>UPC: {catalog.upc ?? "--"}</Text>
                <Text style={styles.mutedSmall}>Confidence: {catalog.parse_confidence == null ? "--" : percent(Number(catalog.parse_confidence) * 100)}</Text>
                {(catalog.parse_reason_codes ?? []).length > 0 ? (
                  <View style={styles.adminBadgeRow}>
                    {(catalog.parse_reason_codes ?? []).map((reason) => (
                      <Text key={reason} style={styles.adminReasonBadge}>{parseReasonLabel(reason)}</Text>
                    ))}
                  </View>
                ) : null}
              </View>
            </View>
          </View>
          <View style={styles.detailStoryPanel}>
            <Text style={styles.dashboardSectionTitle}>Fix Recap</Text>
            <View style={styles.detailStoryGrid}>
              <View style={styles.detailStoryTile}>
                <Text style={styles.dashboardInsightLabel}>UPC</Text>
                <Text style={styles.detailStoryValue} numberOfLines={1}>{catalog.upc ?? "--"}</Text>
              </View>
              <View style={styles.detailStoryTile}>
                <Text style={styles.dashboardInsightLabel}>Value</Text>
                <Text style={styles.detailStoryValue}>{money(fixRecapValue)}</Text>
              </View>
              <View style={styles.detailStoryTile}>
                <Text style={styles.dashboardInsightLabel}>Confidence</Text>
                <Text style={styles.detailStoryValue}>{catalog.parse_confidence == null ? "--" : percent(Number(catalog.parse_confidence) * 100)}</Text>
              </View>
            </View>
            <View style={styles.detailNextMoveCard}>
              <Text style={styles.dashboardInsightLabel}>Save target</Text>
              <Text style={styles.detailNextMoveText}>
                Confirm identity first, then media and value. Keep Learn from this fix on when the UPC should use these fields next time.
              </Text>
            </View>
          </View>
          <View style={styles.detailTwoColumn}>
            <SecondaryButton label={apiBusy ? "Refreshing..." : "Refresh API"} onPress={refreshFromApi} disabled={busy || apiBusy} />
            <SecondaryButton label="Review eBay Sold" onPress={reviewEbaySold} disabled={busy || apiBusy} />
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.dashboardSectionTitle}>Identity</Text>
            <Label>Name</Label>
            <TextInput value={popName} onChangeText={setPopName} placeholder="Pop name" placeholderTextColor="#8c95a3" style={styles.input} />
            <Label>Character</Label>
            <TextInput value={character} onChangeText={setCharacter} placeholder="Character" placeholderTextColor="#8c95a3" style={styles.input} />
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Franchise</Label>
                <TextInput value={franchise} onChangeText={setFranchise} placeholder="Franchise" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
              <View style={styles.flex}>
                <Label>Set</Label>
                <TextInput value={setName} onChangeText={setSetName} placeholder="Set name" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
            </View>
            <View style={styles.detailTwoColumn}>
              <View style={styles.flex}>
                <Label>Number</Label>
                <TextInput value={number} onChangeText={setNumber} placeholder="Box #" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
              <View style={styles.flex}>
                <Label>Value ($)</Label>
                <TextInput value={estimatedValue} onChangeText={setEstimatedValue} keyboardType="decimal-pad" placeholder="0" placeholderTextColor="#8c95a3" style={styles.input} />
              </View>
            </View>
            <Label>Variant</Label>
            <TextInput value={variant} onChangeText={setVariant} placeholder="Variant" placeholderTextColor="#8c95a3" style={styles.input} />
            <Label>Exclusivity</Label>
            <TextInput value={exclusivity} onChangeText={setExclusivity} placeholder="Exclusive / retailer / convention" placeholderTextColor="#8c95a3" style={styles.input} />
          </View>
          <View style={styles.detailSection}>
            <Text style={styles.dashboardSectionTitle}>Media & Description</Text>
            <Label>Image URL</Label>
            <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." placeholderTextColor="#8c95a3" style={styles.input} />
            <Label>Description</Label>
            <TextInput value={displayDescription} onChangeText={setDisplayDescription} multiline placeholder="Catalog description" placeholderTextColor="#8c95a3" style={[styles.input, styles.notes]} />
            <View style={styles.settingRowCard}>
              <View style={styles.flex}>
                <Text style={styles.cardLabel}>Needs review</Text>
                <Text style={styles.mutedSmall}>{needsReview ? "Keep this in the queue." : "Remove this from the review queue."}</Text>
              </View>
              <Switch value={needsReview} onValueChange={setNeedsReview} trackColor={{ true: "#f6c95f", false: "#283039" }} thumbColor={needsReview ? "#7e67f4" : "#11161d"} />
            </View>
            <View style={styles.settingRowCard}>
              <View style={styles.flex}>
                <Text style={styles.cardLabel}>Learn from this fix</Text>
                <Text style={styles.mutedSmall}>Save these identity fields as the UPC override for future API refreshes.</Text>
              </View>
              <Switch value={learnFromFix} onValueChange={setLearnFromFix} trackColor={{ true: "#7bd1c3", false: "#283039" }} thumbColor={learnFromFix ? "#7e67f4" : "#11161d"} />
            </View>
          </View>
          <PrimaryButton label={busy ? "Saving..." : "Save Fix"} onPress={() => save(false)} disabled={busy || apiBusy} />
          {reportId ? <SecondaryButton label="Save & Resolve Report" onPress={() => save(true)} disabled={busy || apiBusy} /> : null}
        </>
      ) : (
        <View style={styles.emptyMiniCard}>
          <Text style={styles.cardLabel}>Catalog item not found</Text>
          <Text style={styles.mutedSmall}>This report may point at a removed catalog row.</Text>
        </View>
      )}
    </ScreenFrame>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  onPress?: () => void;
  active?: boolean;
  styles: AdminStyles;
};

function MetricCard({ label, value, onPress, active, styles }: MetricCardProps) {
  const content = (
    <>
      <Text style={styles.cardLabel} adjustsFontSizeToFit numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.metricValue} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </>
  );
  if (!onPress) {
    return <View style={[styles.metricCard, active && styles.metricCardActive]}>{content}</View>;
  }
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.metricCard, styles.metricCardPressable, active && styles.metricCardActive, pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}
