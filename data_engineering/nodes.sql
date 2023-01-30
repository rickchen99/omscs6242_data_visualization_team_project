-- NOT THE FINAL VERSION, SEE nodes_v2.sql
-- NODES TABLE
SELECT DISTINCT 
  assignee_id,
  disambig_assignee_individual_name_first || ' ' || disambig_assignee_individual_name_last AS assignee_name,
  CASE 
    WHEN CAST(assignee_type AS STRING) LIKE '%2%' OR CAST(assignee_type AS STRING) LIKE '%3%' THEN 'corporation' 
    WHEN CAST(assignee_type AS STRING) LIKE '%4%' OR CAST(assignee_type AS STRING) LIKE '%5%' THEN 'individual' 
    WHEN CAST(assignee_type AS STRING) LIKE '%6%' OR CAST(assignee_type AS STRING) LIKE '%7%' 
      OR CAST(assignee_type AS STRING) LIKE '%8%' OR CAST(assignee_type AS STRING) LIKE '%9%'THEN 'government'
    ELSE 'other' END AS assignee_type_label
FROM `master.g_assignee_disambiguated`

-- Assignee Classification  
-- Source: https://patentsview.org/download/data-download-dictionary
-- 1 - Unassigned
-- 2 - US Company or Corporation
-- 3 - Foreign Company or Corporation
-- 4 - US Individual
-- 5 - Foreign Individual
-- 6 - US Federal Government
-- 7 - Foreign Government
-- 8 - US County Government
-- 9 - US State Government
-- Note: A "1" appearing before any of these codes signifies part interest
