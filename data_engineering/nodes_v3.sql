
WITH temp_tb as (
SELECT DISTINCT 
  assignee_id,
  disambig_assignee_individual_name_first,
  disambig_assignee_individual_name_last,
  disambig_assignee_individual_name_first || ' ' || disambig_assignee_individual_name_last AS assignee_name,
  disambig_assignee_organization,
  CASE 
    WHEN CAST(assignee_type AS STRING) LIKE '%2%' OR CAST(assignee_type AS STRING) LIKE '%3%' THEN 'corporation' 
    WHEN CAST(assignee_type AS STRING) LIKE '%4%' OR CAST(assignee_type AS STRING) LIKE '%5%' THEN 'individual' 
    WHEN CAST(assignee_type AS STRING) LIKE '%6%' OR CAST(assignee_type AS STRING) LIKE '%7%' 
      OR CAST(assignee_type AS STRING) LIKE '%8%' OR CAST(assignee_type AS STRING) LIKE '%9%'THEN 'government'
    ELSE 'other' END AS assignee_type_label
FROM `master.g_assignee_disambiguated`
WHERE assignee_type is not null
)
,temp_inventor_tb as(
  SELECT distinct inventor_id,
  disambig_inventor_name_first || ' ' || disambig_inventor_name_last as inventor_name,
  'inventor' as type
  FROM
  `master.g_inventor_disambiguated`
  WHERE 
   patent_id in
      (  --exclude patent and inventors that are not associated with any sponsors
        select patent_id from
        `master.g_assignee_disambiguated`
      ) 
  AND
  (disambig_inventor_name_first != '' OR disambig_inventor_name_last != '')

)

SELECT assignee_id as uid,
CASE
WHEN disambig_assignee_individual_name_last != '' and disambig_assignee_individual_name_first = '' Then disambig_assignee_individual_name_last
WHEN disambig_assignee_individual_name_first = '' THEN disambig_assignee_organization
ELSE assignee_name
END AS name,
assignee_type_label as type
FROM temp_tb
UNION ALL
SELECT inventor_id as uid,
inventor_name as name,
type
FROM temp_inventor_tb
Order by name
