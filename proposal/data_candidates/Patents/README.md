# Potential API Sources

(Patents View API)[https://patentsview.org/apis/api-endpoints/patentsbeta]

Can easily query for all patents and their inventors.

Query for patents:

`https://search.patentsview.org/api/v1/patent/` 

`{"q":{"patent_number":"10757852"}, "f": ["patent_title", "patent_date", "patent_country"]}`

Query for inventors:

`https://search.patentsview.org/api/v1/inventor/`

`{"q": {"name_last":"Young"},"f": ["inventor_id","name_last","name_first"],"o": {},"s": []}`

Idea would be to visualize this data via a network with:

    - Nodes: Patents
    - Edges: Inventors (class of inventors does not appear to be available on this API. eg. co-inventor, inspirer, etc.)