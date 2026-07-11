-- Audit note: The Office reviewed checklist pass, 2026-07-08.
--
-- Sources:
--   FigureRealm Office checklist, scoped to Pop! Vinyl Figures only:
--     https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3835&ssid=-1
--   Funko official Dwight Schrute (Blonde) item evidence:
--     https://funko.com/n4s-pop-tee-the-office---dwight-schrute-blonde/42590.html
--
-- Live changes:
--   * Promote The Office to reviewed with 79 required Pop! Vinyl rows.
--   * Exclude ornaments, pins, pocket keychains, rides, sets, Popsies, and Soda from the denominator.
--   * Normalize owned Office catalog rows with noisy set names and missing variant labels.
--   * Correct UPC 889698425902 from Dwight Basketball #1103 to Dwight Schrute (Blonde Hair) #871.

with office_set as (
  insert into public.pop_sets (canonical_name, franchise, status, source_label, source_url, confidence, reviewed_at, notes)
  values (
    'The Office',
    'The Office',
    'reviewed',
    'FigureRealm Office Pop! Vinyl Figures checklist',
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3835&ssid=-1',
    0.90,
    now(),
    'FigureRealm browse-all checklist has 104 Office items; scoped completion denominator is 79 Pop! Vinyl Figures, excluding ornaments, pins, pocket keychains, rides, sets, Popsies, and Soda.'
  )
  on conflict (canonical_name, franchise) do update set
    status = excluded.status,
    source_label = excluded.source_label,
    source_url = excluded.source_url,
    confidence = excluded.confidence,
    reviewed_at = excluded.reviewed_at,
    notes = excluded.notes,
    updated_at = now()
  returning id
), clear_prior as (
  delete from public.pop_set_checklist_items
  where set_id in (select id from office_set)
  returning id
), checklist(pop_name, character_name, number_value, variant_value, exclusivity_value, confidence_value, notes_value) as (
  values
    ('Andy Bernard (Banjo)','Andy Bernard','878','Banjo',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Andy Bernard (Sumo Suit)','Andy Bernard','1061','Sumo Suit',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Angela Martin','Angela Martin','1159',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Angela Martin (with Sprinkles)','Angela Martin','1024','with Sprinkles',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Creed Bratton','Creed Bratton','1104',null,'Specialty Series',0.88::numeric,'FigureRealm lists Specialty Series.'),
    ('Creed Bratton (Bloody Chase)','Creed Bratton','1104','Bloody Chase','Specialty Series',0.88::numeric,'FigureRealm lists Specialty Series Bloody Chase.'),
    ('Creed Bratton (with Mung Beans)','Creed Bratton','1107','with Mung Beans',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Darryl Philbin','Darryl Philbin','873',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Date Mike','Date Mike','904',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dundie Award (Gold Chrome)','Dundie Award','1062','Gold Chrome',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Belsnickel)','Dwight Schrute','907','As Belsnickel',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Belsnickel) (D.I.Y.)','Dwight Schrute','1160','D.I.Y.',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Elf)','Dwight Schrute','905','As Elf',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Elf) (D.I.Y.)','Dwight Schrute','1161','D.I.Y.',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Kerrigan)','Dwight Schrute','1072','As Kerrigan','Emerald City Comic Con',0.88::numeric,'Owned row and raw title identify ECCC release.'),
    ('Dwight Schrute (As Pam Beesly)','Dwight Schrute','1049','As Pam Beesly',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Recyclops)','Dwight Schrute','938','As Recyclops','Spring Convention',0.88::numeric,'Owned row identifies Spring Convention release.'),
    ('Dwight Schrute (As Recyclops)','Dwight Schrute','1041','As Recyclops',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Recyclops)','Dwight Schrute','1015','As Recyclops',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (As Scranton Strangler)','Dwight Schrute','1045','As Scranton Strangler',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (Basketball)','Dwight Schrute','1103','Basketball',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (Basketball) (Shirtless Chase)','Dwight Schrute','1103','Shirtless Chase',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (Blonde Hair)','Dwight Schrute','871','Blonde Hair','Target',0.92::numeric,'Funko official item 42590 confirms box #871.'),
    ('Dwight Schrute (Brown Hair)','Dwight Schrute','871','Brown Hair',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (Company Picnic)','Dwight Schrute','1670','Company Picnic',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (CPR Mask)','Dwight Schrute','927','CPR Mask',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (Dark Lord)','Dwight Schrute','1010','Dark Lord','Specialty Series',0.88::numeric,'FigureRealm lists Specialty Series.'),
    ('Dwight Schrute (Hay King)','Dwight Schrute','876','Hay King',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (Pumpkinhead)','Dwight Schrute','1171','Pumpkinhead',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (with Blow Torch)','Dwight Schrute','1178','with Blow Torch',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (with Bobblehead)','Dwight Schrute','882','with Bobblehead',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (with Jello Stapler)','Dwight Schrute','1004','with Jello Stapler',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Dwight Schrute (with Princess Unicorn Doll)','Dwight Schrute','1009','with Princess Unicorn Doll',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Erin Hannon (with Happy Box & Champagne)','Erin Hannon','1174','with Happy Box & Champagne',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Florida Stanley','Florida Stanley','1006',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Fun Run Andy','Fun Run Andy','1393',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Fun Run Dwight','Fun Run Dwight','1394',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Fun Run Meredith','Fun Run Meredith','1396',null,'Specialty Series',0.88::numeric,'FigureRealm lists Specialty Series.'),
    ('Goldenface','Goldenface','877',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Jan Levinson','Jan Levinson','1047',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Jim Halpert','Jim Halpert','870',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Jim Halpert (3 Hole Punch)','Jim Halpert','880','3 Hole Punch',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Jim Halpert (Chase)','Jim Halpert','870','Chase',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Jim Halpert (Last Nonsense)','Jim Halpert','1046','Last Nonsense',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Jim Halpert (Sumo Suit)','Jim Halpert','1156','Sumo Suit',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Kelly Kapoor','Kelly Kapoor','1008',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Kelly Kapoor','Kelly Kapoor','1285',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Kevin Malone','Kevin Malone','874',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Kevin Malone (As Dunder Mifflin Superhero)','Kevin Malone','1175','As Dunder Mifflin Superhero',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Kevin Malone (Company Picnic)','Kevin Malone','1671','Company Picnic',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Kevin Malone (Tissue Box Shoes)','Kevin Malone','1048','Tissue Box Shoes',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Meredith Palmer','Meredith Palmer','1007',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Meredith Palmer (Company Picnic)','Meredith Palmer','1672','Company Picnic',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael as Jesus','Michael Scott','1306','As Jesus',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Klump','Michael Klump','1059',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scarn (Threat Level Midnight)','Michael Scarn','1060','Threat Level Midnight','Go! Calendars',0.88::numeric,'Owned row identifies Go! Calendars release.'),
    ('Michael Scott','Michael Scott','869',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (As Classy Santa)','Michael Scott','906','As Classy Santa',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (As Willy Wonka with Golden Ticket)','Michael Scott','1177','As Willy Wonka with Golden Ticket',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (Basketball)','Michael Scott','1120','Basketball',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (Check)','Michael Scott','1395','Check',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (Crutches)','Michael Scott','1170','Crutches',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (Straitjacket)','Michael Scott','1044','Straitjacket',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (Survivor)','Michael Scott','1005','Survivor',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (That''s What She Said)','Michael Scott','1773','That''s What She Said',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Michael Scott (Young)','Michael Scott','1176','Young',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Mose Schrute','Mose Schrute','1179',null,'New York Comic Con',0.88::numeric,'Owned row identifies New York Comic Con release.'),
    ('Oscar Martinez','Oscar Martinez','1132',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Oscar Martinez (with Scarecrow Doll)','Oscar Martinez','1173','with Scarecrow Doll',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Pam Beesly','Pam Beesly','872',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Pam Beesly (with Teapot)','Pam Beesly','1172','with Teapot',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Phyllis Vance','Phyllis Vance','1131',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Phyllis Vance (Santa Claus)','Phyllis Vance','1189','Santa Claus',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Prison Mike','Prison Mike','875',null,null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Ryan Howard (Blond)','Ryan Howard','1130','Blond','Exclusive',0.88::numeric,'Owned row identifies exclusive release.'),
    ('Ryan Howard (Brown Hair)','Ryan Howard','1130','Brown Hair',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Stanley Hudson (Pretzel)','Stanley Hudson','972','Pretzel',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Stanley Hudson (Sumo Suit)','Stanley Hudson','1157','Sumo Suit',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.'),
    ('Stanley Hudson (Warrior)','Stanley Hudson','1145','Warrior',null,0.90::numeric,'FigureRealm Office Pop! Vinyl item.')
), inserted_checklist as (
  insert into public.pop_set_checklist_items (
    set_id,
    pop_name,
    character,
    number,
    variant,
    exclusivity,
    pop_type,
    pop_style,
    is_required_for_completion,
    source_url,
    confidence,
    notes
  )
  select
    office_set.id,
    checklist.pop_name,
    checklist.character_name,
    checklist.number_value,
    checklist.variant_value,
    checklist.exclusivity_value,
    'Pop! Television',
    'Standard',
    true,
    'https://www.figurerealm.com/actionfigure?action=seriesitemlist&id=3835&ssid=-1',
    checklist.confidence_value,
    checklist.notes_value
  from checklist
  cross join office_set
  returning id
), owned_updates(upc, pop_name, character_name, number_value, variant_value, exclusivity_value, notes_value) as (
  values
    ('889698349000','Michael Scott','Michael Scott','869',null,null,'The Office owned row cleanup.'),
    ('889698349031','Jim Halpert (Chase)','Jim Halpert','870','Chase',null,'Normalize noisy Book Face set name while preserving Chase.'),
    ('889698418843','Kevin Malone','Kevin Malone','874',null,null,'The Office owned row cleanup.'),
    ('889698434294','Dwight Schrute (As Elf)','Dwight Schrute','905','As Elf',null,'The Office owned row cleanup.'),
    ('889698459167','Dwight Schrute (As Recyclops)','Dwight Schrute','938','As Recyclops','Spring Convention','The Office owned row cleanup.'),
    ('889698484978','Michael Scott (Survivor)','Michael Scott','1005','Survivor',null,'The Office owned row cleanup.'),
    ('889698484961','Florida Stanley','Florida Stanley','1006',null,null,'The Office owned row cleanup.'),
    ('889698485005','Dwight Schrute (with Princess Unicorn Doll)','Dwight Schrute','1009','with Princess Unicorn Doll',null,'Normalize noisy Shop set name.'),
    ('889698516150','Jim Halpert (Last Nonsense)','Jim Halpert','1046','Last Nonsense',null,'The Office owned row cleanup.'),
    ('889698520614','Michael Scarn (Threat Level Midnight)','Michael Scarn','1060','Threat Level Midnight','Go! Calendars','Normalize noisy Threat Level Midnight set name.'),
    ('889698530668','Andy Bernard (Sumo Suit)','Andy Bernard','1061','Sumo Suit',null,'The Office owned row cleanup.'),
    ('889698542593','Dwight Schrute (As Kerrigan)','Dwight Schrute','1072','As Kerrigan','Emerald City Comic Con','The Office owned row cleanup.'),
    ('889698425902','Dwight Schrute (Blonde Hair)','Dwight Schrute','871','Blonde Hair','Target','Correct from Dwight Basketball #1103 to Funko official item 42590, box #871.'),
    ('889698561495','Ryan Howard (Blond)','Ryan Howard','1130','Blond','Exclusive','The Office owned row cleanup.'),
    ('889698579506','Dwight Schrute (As Elf) (D.I.Y.)','Dwight Schrute','1161','D.I.Y.',null,'The Office owned row cleanup.'),
    ('889698573948','Erin Hannon (with Happy Box & Champagne)','Erin Hannon','1174','with Happy Box & Champagne',null,'The Office owned row cleanup.'),
    ('889698586276','Mose Schrute','Mose Schrute','1179',null,'New York Comic Con','Remove Common variant; convention belongs in exclusivity.'),
    ('889698657587','Fun Run Andy','Fun Run Andy','1393',null,null,'The Office owned row cleanup.')
), updated_catalog as (
  update public.pop_catalog pc
  set
    pop_name = owned_updates.pop_name,
    character = owned_updates.character_name,
    franchise = 'The Office',
    set_name = 'The Office',
    number = owned_updates.number_value,
    variant = owned_updates.variant_value,
    exclusivity = owned_updates.exclusivity_value,
    pop_type = 'Pop! Television',
    pop_style = 'Standard',
    set_total = 79,
    needs_review = false,
    parse_confidence = greatest(coalesce(pc.parse_confidence, 0), 0.90),
    description = owned_updates.pop_name || ' is a The Office Pop! Television release #' || owned_updates.number_value ||
      case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end ||
      case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.',
    display_description = owned_updates.pop_name || ' is a The Office Pop! Television release #' || owned_updates.number_value ||
      case when owned_updates.variant_value is not null then ', ' || owned_updates.variant_value else '' end ||
      case when owned_updates.exclusivity_value is not null then ', ' || owned_updates.exclusivity_value || ' exclusive' else '' end || '.'
  from owned_updates
  where pc.upc = owned_updates.upc
  returning pc.id, pc.upc, pc.pop_name
), relink_by_name as (
  update public.pop_set_checklist_items ci
  set pop_catalog_id = pc.id,
      upc = pc.upc,
      updated_at = now()
  from public.pop_catalog pc
  where ci.set_id = (select id from office_set)
    and pc.set_name = 'The Office'
    and pc.franchise = 'The Office'
    and ci.number = pc.number
    and lower(ci.pop_name) = lower(pc.pop_name)
  returning ci.id
)
select
  (select count(*) from inserted_checklist) as inserted_checklist_rows,
  (select count(*) from updated_catalog) as updated_catalog_rows,
  (select count(*) from relink_by_name) as linked_catalog_rows;

-- Verification queries:
-- select ps.canonical_name, ps.status, ps.confidence, ps.reviewed_at, count(ci.id) as required_rows
-- from public.pop_sets ps
-- left join public.pop_set_checklist_items ci on ci.set_id = ps.id and ci.is_required_for_completion
-- where ps.canonical_name = 'The Office'
-- group by ps.id;
--
-- select count(*) as office_catalog_rows, count(*) filter (where set_total = 79) as rows_with_total_79,
--   count(*) filter (where needs_review) as needs_review_rows
-- from public.pop_catalog
-- where franchise = 'The Office' and set_name = 'The Office';
--
-- select upc, pop_name, number, variant, exclusivity, set_total, needs_review
-- from public.pop_catalog
-- where franchise = 'The Office' and set_name = 'The Office'
-- order by nullif(regexp_replace(coalesce(number,''), '[^0-9]', '', 'g'), '')::int nulls last, pop_name;
