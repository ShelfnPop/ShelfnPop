# Supabase Schema Map

Generated from the CSV exports in `migration-inbox/`.

## Objects Found

- `dashboard_home_view`
- `dashboard_snapshots`
- `pop_catalog`
- `profiles`
- `user_collection_items`
- `user_collection_summary_view`
- `user_collection_view`

## Notes

- The foreign-key export references tables not present in the column export: `wishlist_items`.
- Objects named like views appear in the column export because Postgres exposes view columns through `information_schema.columns`.

## Foreign Keys

| From | To | Constraint |
| --- | --- | --- |
| user_collection_items.pop_catalog_id | pop_catalog.id | user_collection_items_pop_catalog_id_fkey |
| user_collection_items.user_id | profiles.id | user_collection_items_user_id_fkey |
| wishlist_items.pop_catalog_id | pop_catalog.id | wishlist_items_pop_catalog_id_fkey |
| wishlist_items.user_id | profiles.id | wishlist_items_user_id_fkey |

## Columns

### dashboard_home_view

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| user_id | uuid | YES | null |
| display_name | text | YES | null |
| greeting_text | text | YES | null |
| insight_text | text | YES | null |
| unique_items | bigint (int8) | YES | null |
| total_pops | bigint (int8) | YES | null |
| total_collection_value | numeric | YES | null |
| total_paid | numeric | YES | null |
| gain_loss | numeric | YES | null |
| gain_loss_percent | numeric | YES | null |
| wishlist_count | integer (int4) | YES | null |
| pops_added_this_month | integer (int4) | YES | null |
| baseline_snapshot_date | date | YES | null |
| baseline_collection_value | numeric | YES | null |
| monthly_value_change | numeric | YES | null |
| monthly_value_change_percent | numeric | YES | null |
| generated_date | date | YES | null |

### dashboard_snapshots

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | gen_random_uuid() |
| user_id | uuid | NO | null |
| snapshot_date | date | NO | CURRENT_DATE |
| total_collection_value | numeric | NO | 0 |
| total_paid | numeric | NO | 0 |
| total_pops | integer (int4) | NO | 0 |
| gain_loss | numeric | NO | 0 |
| wishlist_count | integer (int4) | NO | 0 |
| created_at | timestamp with time zone (timestamptz) | NO | now() |

### pop_catalog

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp with time zone (timestamptz) | NO | now() |
| uuid | uuid | NO | gen_random_uuid() |
| upc | text | YES | null |
| pop_name | text | YES | null |
| character | text | YES | null |
| franchise | text | YES | null |
| number | text | YES | null |
| variant | text | YES | null |
| exclusivity | text | YES | null |
| pop_type | text | YES | null |
| set_name | text | YES | null |
| set_total | bigint (int8) | YES | null |
| image_url | text | YES | null |
| vault_status | text | YES | null |
| estimated_value | numeric | YES | null |
| id | uuid | NO | gen_random_uuid() |
| api_source | text | YES | null |
| api_last_updated | timestamp with time zone (timestamptz) | YES | null |
| raw_api_json | jsonb | YES | null |
| pop_style | text | YES | null |
| raw_title | text | YES | null |
| clean_title | text | YES | null |
| parse_confidence | numeric | YES | null |
| needs_review | boolean (bool) | YES | false |
| image_source | text | YES | null |
| image_last_checked | timestamp with time zone (timestamptz) | YES | null |

### profiles

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| id | uuid | NO | null |
| username | text | NO | null |
| display_name | text | YES | null |
| avatar_url | text | YES | null |
| bio | text | YES | null |
| is_public | boolean (bool) | YES | true |
| created_at | timestamp with time zone (timestamptz) | YES | now() |

### user_collection_items

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| created_at | timestamp with time zone (timestamptz) | NO | now() |
| user_id | uuid | YES | null |
| pop_catalog_id | uuid | YES | null |
| quantity | bigint (int8) | YES | '1'::bigint |
| condition | text | YES | null |
| box_condition | text | YES | null |
| purchase_price | numeric | YES | null |
| current_value | numeric | YES | null |
| notes | text | YES | null |
| for_trade | boolean (bool) | YES | false |
| for_sale | boolean (bool) | YES | false |
| visibility | text | YES | '''private'''::text |
| acquired_date | date | YES | null |
| id | uuid | NO | gen_random_uuid() |
| owned_variant | text | YES | null |

### user_collection_summary_view

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| user_id | uuid | YES | null |
| unique_items | bigint (int8) | YES | null |
| total_quantity | numeric | YES | null |
| total_collection_value | numeric | YES | null |
| total_purchase_cost | numeric | YES | null |
| total_gain_loss | numeric | YES | null |

### user_collection_view

| Column | Type | Nullable | Default |
| --- | --- | --- | --- |
| collection_item_id | uuid | YES | null |
| user_id | uuid | YES | null |
| pop_catalog_id | uuid | YES | null |
| quantity | bigint (int8) | YES | null |
| condition | text | YES | null |
| box_condition | text | YES | null |
| purchase_price | numeric | YES | null |
| current_value | numeric | YES | null |
| notes | text | YES | null |
| for_trade | boolean (bool) | YES | null |
| for_sale | boolean (bool) | YES | null |
| visibility | text | YES | null |
| acquired_date | date | YES | null |
| created_at | timestamp with time zone (timestamptz) | YES | null |
| upc | text | YES | null |
| pop_name | text | YES | null |
| character | text | YES | null |
| franchise | text | YES | null |
| number | text | YES | null |
| variant | text | YES | null |

## View Definitions

### dashboard_home_view

```sql
 WITH wishlist_counts AS (
         SELECT wishlist_items.user_id,
            (count(*))::integer AS wishlist_count
           FROM wishlist_items
          WHERE (wishlist_items.user_id IS NOT NULL)
          GROUP BY wishlist_items.user_id
        ), monthly_adds AS (
         SELECT user_collection_items.user_id,
            (COALESCE(sum(COALESCE(user_collection_items.quantity, (1)::bigint)), (0)::numeric))::integer AS pops_added_this_month
           FROM user_collection_items
          WHERE ((user_collection_items.user_id IS NOT NULL) AND (user_collection_items.acquired_date >= (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))::date) AND (user_collection_items.acquired_date < ((date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone) + '1 mon'::interval))::date))
          GROUP BY user_collection_items.user_id
        ), baseline_snapshot AS (
         SELECT DISTINCT ON (ds.user_id) ds.user_id,
            ds.snapshot_date AS baseline_snapshot_date,
            ds.total_collection_value AS baseline_collection_value
           FROM dashboard_snapshots ds
          WHERE (ds.snapshot_date < (date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone))::date)
          ORDER BY ds.user_id, ds.snapshot_date DESC
        ), base AS (
         SELECT p.id AS user_id,
            COALESCE(NULLIF(p.display_name, ''::text), NULLIF(p.username, ''::text), 'Collector'::text) AS display_name,
            COALESCE(s.unique_items, (0)::bigint) AS unique_items,
            (COALESCE(s.total_quantity, (0)::numeric))::bigint AS total_pops,
            (COALESCE(s.total_collection_value, (0)::numeric))::numeric(12,2) AS total_collection_value,
            (COALESCE(s.total_purchase_cost, (0)::numeric))::numeric(12,2) AS total_paid,
            (COALESCE(s.total_gain_loss, (0)::numeric))::numeric(12,2) AS gain_loss,
            COALESCE(w.wishlist_count, 0) AS wishlist_count,
            COALESCE(m.pops_added_this_month, 0) AS pops_added_this_month,
            b.baseline_snapshot_date,
            b.baseline_collection_value
           FROM ((((profiles p
             LEFT JOIN user_collection_summary_view s ON ((s.user_id = p.id)))
             LEFT JOIN wishlist_counts w ON ((w.user_id = p.id)))
             LEFT JOIN monthly_adds m ON ((m.user_id = p.id)))
             LEFT JOIN baseline_snapshot b ON ((b.user_id = p.id)))
          WHERE (p.id = auth.uid())
        ), calc AS (
         SELECT base.user_id,
            base.display_name,
            base.unique_items,
            base.total_pops,
            base.total_collection_value,
            base.total_paid,
            base.gain_loss,
            base.wishlist_count,
            base.pops_added_this_month,
            base.baseline_snapshot_date,
            base.baseline_collection_value,
            ('Welcome back, '::text || base.display_name) AS greeting_text,
                CASE
                    WHEN (base.baseline_collection_value IS NULL) THEN NULL::numeric
                    ELSE ((base.total_collection_value - base.baseline_collection_value))::numeric(12,2)
                END AS monthly_value_change,
                CASE
                    WHEN ((base.baseline_collection_value IS NULL) OR (base.baseline_collection_value = (0)::numeric)) THEN NULL::numeric
                    ELSE round((((base.total_collection_value - base.baseline_collection_value) / base.baseline_collection_value) * (100)::numeric), 1)
                END AS monthly_value_change_percent,
                CASE
                    WHEN (base.total_paid = (0)::numeric) THEN NULL::numeric
                    ELSE round(((base.gain_loss / base.total_paid) * (100)::numeric), 1)
                END AS gain_loss_percent
           FROM base
        )
 SELECT user_id,
    display_name,
    greeting_text,
        CASE
            WHEN (monthly_value_change_percent IS NULL) THEN
            CASE
                WHEN (pops_added_this_month = 1) THEN 'You added 1 Pop this month.'::text
                WHEN (pops_added_this_month > 1) THEN (('You added '::text || pops_added_this_month) || ' Pops this month.'::text)
                ELSE 'Track your shelf, value, and collection.'::text
            END
            WHEN (monthly_value_change > (0)::numeric) THEN (('Your collection value is up '::text || monthly_value_change_percent) || '% this month.'::text)
            WHEN (monthly_value_change < (0)::numeric) THEN (('Your collection value is down '::text || abs(monthly_value_change_percent)) || '% this month.'::text)
            ELSE 'Your collection value is steady this month.'::text
        END AS insight_text,
    unique_items,
    total_pops,
    total_collection_value,
    total_paid,
    gain_loss,
    gain_loss_percent,
    wishlist_count,
    pops_added_this_month,
    baseline_snapshot_date,
    baseline_collection_value,
    monthly_value_change,
    monthly_value_change_percent,
    CURRENT_DATE AS generated_date
   FROM calc;
```

### user_collection_summary_view

```sql
 SELECT uci.user_id,
    count(DISTINCT uci.pop_catalog_id) AS unique_items,
    COALESCE(sum(COALESCE(uci.quantity, (1)::bigint)), (0)::numeric) AS total_quantity,
    COALESCE(sum(((COALESCE(uci.quantity, (1)::bigint))::numeric * COALESCE(uci.current_value, pc.estimated_value, (0)::numeric))), (0)::numeric) AS total_collection_value,
    COALESCE(sum(((COALESCE(uci.quantity, (1)::bigint))::numeric * COALESCE(uci.purchase_price, (0)::numeric))), (0)::numeric) AS total_purchase_cost,
    COALESCE(sum(((COALESCE(uci.quantity, (1)::bigint))::numeric * (COALESCE(uci.current_value, pc.estimated_value, (0)::numeric) - COALESCE(uci.purchase_price, (0)::numeric)))), (0)::numeric) AS total_gain_loss
   FROM (user_collection_items uci
     JOIN pop_catalog pc ON ((pc.id = uci.pop_catalog_id)))
  GROUP BY uci.user_id;
```

### user_collection_view

```sql
 SELECT uci.id AS collection_item_id,
    uci.user_id,
    uci.pop_catalog_id,
    uci.quantity,
    uci.condition,
    uci.box_condition,
    uci.purchase_price,
    uci.current_value,
    uci.notes,
    uci.for_trade,
    uci.for_sale,
    uci.visibility,
    uci.acquired_date,
    uci.created_at,
    pc.upc,
    pc.pop_name,
    pc."character",
    pc.franchise,
    pc.number,
    pc.variant,
    pc.exclusivity,
    pc.pop_type,
    pc.set_name,
    pc.image_url,
    pc.vault_status,
    pc.estimated_value,
    COALESCE(NULLIF(uci.current_value, (0)::numeric), pc.estimated_value, (0)::numeric) AS value_each,
    COALESCE(uci.purchase_price, (0)::numeric) AS cost_each,
    ((COALESCE(uci.quantity, (1)::bigint))::numeric * COALESCE(NULLIF(uci.current_value, (0)::numeric), pc.estimated_value, (0)::numeric)) AS total_value,
    ((COALESCE(uci.quantity, (1)::bigint))::numeric * COALESCE(uci.purchase_price, (0)::numeric)) AS total_cost,
    (((COALESCE(uci.quantity, (1)::bigint))::numeric * COALESCE(NULLIF(uci.current_value, (0)::numeric), pc.estimated_value, (0)::numeric)) - ((COALESCE(uci.quantity, (1)::bigint))::numeric * COALESCE(uci.purchase_price, (0)::numeric))) AS gain_loss,
    pc.pop_style,
    uci.owned_variant,
    COALESCE(uci.owned_variant, pc.variant) AS display_variant
   FROM (user_collection_items uci
     JOIN pop_catalog pc ON ((pc.id = uci.pop_catalog_id)));
```
