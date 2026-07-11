-- Refresh weak generated catalog descriptions into compact catalog notes.
-- Applied live 2026-07-08.

with candidates as (
  select
    id,
    coalesce(nullif(btrim(character), ''), nullif(btrim(pop_name), '')) as name,
    case
      when set_name is not null and btrim(set_name) <> '' then btrim(set_name)
      else nullif(btrim(franchise), '')
    end as line_name,
    case
      when pop_type is not null and btrim(pop_type) <> '' and pop_type !~* '^pop!?$' then btrim(pop_type)
      else 'Funko Pop'
    end as type_name,
    nullif(btrim(number), '') as number_value,
    case
      when pop_style is not null and pop_style !~* '^(standard|common|pop)$' then btrim(pop_style) || ' format'
    end as style_detail,
    case
      when variant is not null and variant !~* '^common$' then btrim(variant) || ' variant'
    end as variant_detail,
    case
      when exclusivity is null or btrim(exclusivity) = '' then null
      when exclusivity ~* '^exclusive$' then 'exclusive release'
      when exclusivity ~* 'exclusive' then btrim(exclusivity)
      else btrim(exclusivity) || ' exclusive'
    end as exclusive_detail,
    case
      when release_date is not null then 'Released in ' || extract(year from release_date)::int::text
    end as release_detail,
    case
      when vault_status is not null and vault_status !~* '^active$' then 'currently ' || lower(btrim(vault_status))
    end as vault_detail,
    case
      when limited_edition = true and limited_count is not null then 'limited to ' || to_char(limited_count, 'FM999,999,999') || ' pieces'
      when limited_edition = true then 'limited edition'
    end as limited_detail
  from public.pop_catalog
  where display_description ~* '^(From .*, .*)?[^.]+ is an? .*release'
     or display_description ~* ' is an? .*Funko Pop'
     or display_description ~* 'release #[0-9]+'
     or display_description ~* 'exclusive exclusive'
), built as (
  select
    id,
    concat_ws(
      ' ',
      name
        || ' belongs to '
        || case
          when line_name is null then 'the ' || type_name || ' line'
          when line_name ~* '^(the|a|an) ' then line_name || ' ' || type_name || ' line'
          else 'the ' || line_name || ' ' || type_name || ' line'
        end
        || coalesce(' as #' || number_value, '')
        || '.',
      case
        when concat_ws(', ', style_detail, variant_detail, exclusive_detail) <> ''
          then 'This catalog entry tracks the ' || concat_ws(', ', style_detail, variant_detail, exclusive_detail) || '.'
      end,
      case
        when concat_ws('; ', release_detail, vault_detail, limited_detail) <> ''
          then concat_ws('; ', release_detail, vault_detail, limited_detail) || '.'
      end
    ) as next_display_description
  from candidates
  where name is not null
)
update public.pop_catalog pc
set display_description = built.next_display_description
from built
where pc.id = built.id
  and pc.display_description is distinct from built.next_display_description;
