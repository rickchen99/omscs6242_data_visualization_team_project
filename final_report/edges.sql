-- EDGES TABLE

WITH 

patents_base AS (
  SELECT
    patent_id,
    patent_date,
    num_claims
  FROM `master.g_patent`
),

inventors_base AS (
  SELECT 
    patent_id,
    inventor_id,
    disambig_inventor_name_first || ' ' || disambig_inventor_name_last AS assignee_name,
    ROW_NUMBER() OVER (PARTITION BY patent_id ORDER BY inventor_sequence) - 1 AS inventor_sequence
  FROM `master.g_inventor_disambiguated`
),

primary_inventors AS (
  SELECT *
  FROM inventors_base
  WHERE inventor_sequence = 0  --order in which the inventors are listed in the raw XML for current patent
),

companies_base AS (
  -- assignee_type
  -- 1 - Unassigned, 
  -- 2 - US Company or Corporation, 
  -- 3 - Foreign Company or Corporation, 
  -- 4 - US Individual, 
  -- 5 - Foreign Individual, 
  -- 6 - US Federal Government, 
  -- 7 - Foreign Government, 
  -- 8 - US County Government, 
  -- 9 - US State Government. Note: A "1" appearing before any of these codes signifies part interest
  SELECT
    patent_id,
    assignee_id,
    assignee_sequence,
    ROW_NUMBER() OVER (PARTITION BY patent_id ORDER BY assignee_sequence) - 1 AS company_sequence -- assignee_sequence: order in which assignee appears in patent file
  FROM `master.g_assignee_disambiguated`
  WHERE CAST(assignee_type AS STRING) LIKE '%2%' OR CAST(assignee_type AS STRING) LIKE '%3%'
),

primary_companies AS (
  SELECT *
  FROM companies_base
  WHERE company_sequence = 0
),

edges AS (
  SELECT
    p.patent_id,
    i.inventor_id AS primary_inventor_assignee_id,
    c.assignee_id AS primary_company_assignee_id,
    p.patent_date,
    p.num_claims
  FROM patents_base p
  LEFT JOIN primary_inventors i ON i.patent_id = p.patent_id
  LEFT JOIN primary_companies c ON c.patent_id = p.patent_id
),

counts AS (
  SELECT 
    COUNT(patent_id) AS count_all,
    COUNT(CASE WHEN primary_inventor_assignee_id IS NULL AND primary_company_assignee_id IS NULL THEN patent_id ELSE NULL END) AS count_blank
  FROM edges
)

SELECT patent_id as uid,
       primary_inventor_assignee_id as source,
       primary_company_assignee_id as target,
       patent_date as date,
       num_claims
FROM edges
WHERE primary_inventor_assignee_id IS NOT NULL and primary_company_assignee_id IS NOT NULL
order by num_claims DESC
