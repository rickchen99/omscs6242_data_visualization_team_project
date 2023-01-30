
WITH temp_tb as (
SELECT DISTINCT 
  assignee_id,
  disambig_assignee_individual_name_first || ' ' || disambig_assignee_individual_name_last AS assignee_name,
  disambig_assignee_organization,
  CASE 
    WHEN CAST(assignee_type AS STRING) LIKE '%2%' OR CAST(assignee_type AS STRING) LIKE '%3%' THEN 'corporation' 
    WHEN CAST(assignee_type AS STRING) LIKE '%4%' OR CAST(assignee_type AS STRING) LIKE '%5%' THEN 'individual' 
    WHEN CAST(assignee_type AS STRING) LIKE '%6%' OR CAST(assignee_type AS STRING) LIKE '%7%' 
      OR CAST(assignee_type AS STRING) LIKE '%8%' OR CAST(assignee_type AS STRING) LIKE '%9%'THEN 'government'
    ELSE 'other' END AS assignee_type_label
FROM `master.g_assignee_disambiguated`
)
SELECT assignee_id as uid,
       CASE assignee_type_label 
           WHEN 'individual' THEN assignee_name
           WHEN 'corporation' THEN disambig_assignee_organization
       END AS name,
       assignee_type_label as type
FROM temp_tb
