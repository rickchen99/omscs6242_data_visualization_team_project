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
    assignee_id,
    disambig_assignee_individual_name_first || ' ' || disambig_assignee_individual_name_last AS assignee_name,
    assignee_sequence,
    ROW_NUMBER() OVER (PARTITION BY patent_id ORDER BY assignee_sequence) - 1 AS inventor_sequence
  FROM `master.g_assignee_disambiguated`
  WHERE CAST(assignee_type AS STRING) LIKE '%4%' OR CAST(assignee_type AS STRING) LIKE '%5%'
),

primary_inventors AS (
  SELECT *
  FROM inventors_base
  WHERE inventor_sequence = 0
),

companies_base AS (
  SELECT
    patent_id,
    assignee_id,
    assignee_sequence,
    ROW_NUMBER() OVER (PARTITION BY patent_id ORDER BY assignee_sequence) - 1 AS company_sequence
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
    i.assignee_id AS primary_inventor_assignee_id,
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

SELECT *
FROM edges
