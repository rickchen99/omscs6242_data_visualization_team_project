# load libraries
from google.cloud import bigquery
import numpy as np
import pandas as pd
import random
from scipy.special import binom

# read in edges sql query
with open('edges.sql', 'r') as f:
    query = f.read()
f.close()

# execute edges sql, retrieve results to dataframe
client = bigquery.Client()
df = client.query(query).to_dataframe()
df['num_claims'] = df['num_claims'].astype(int)

# read in nodes sql query
with open('nodes.sql', 'r') as f:
    query = f.read()
f.close()

nodes = client.query(query).to_dataframe()

# edge weight log transformation
df['e'] = df['num_claims'].apply(lambda x: np.log10(x))

# set required outer values for NGTA
measurement_count = max(df['e'])
node_count = len(nodes)
edge_count = len(df)

# run newman's algorithm
alpha = beta = rho = 0.5*random.random()
_alpha, _beta, _rho = [], [], []

for r in range(3):
    print(r)
    df['q'] = df.apply(lambda row: rho*(alpha**row['e'])*(1-alpha)**(measurement_count - row['e'])/ \
                       (rho*(alpha**row['e'])*(1-alpha)**(measurement_count-row['e']) + \
                       (1-rho)*(beta**row['e'])*(1-beta)**(measurement_count-row['e'])), axis=1)

    df['eq'] = df.apply(lambda row: row['e']* row['q'], axis=1)

    alpha = df['eq'].sum() / (measurement_count*df['q'].sum())
    _alpha.append(alpha)

    beta = (df['e'].sum()-df['eq'].sum()) / (measurement_count*(binom(node_count, 2)-df['q'].sum()))
    _beta.append(beta)

    rho = df['q'].sum() / binom(node_count, 2)
    _rho.append(rho)

# with converged alpha, beta, and rho values, we can calculate a false-discovery rate for the network
fdr = ((1-rho)*beta)/((rho*alpha) + ((1-rho)*beta))

# load network level metastatistics to bigquery
meta_df = pd.DataFrame.from_dict({'true_positive': alpha,
                                  'false_positive': beta,
                                  'false_discovery': fdr},
                                 orient='index').reset_index().rename(columns={'index': 'stat',
                                                                               0: 'value'})

# push results to bigquery
del df['eq']
del df['e']
df = df.rename(columns={'q': 'confidence'})
df.to_gbq('master.ngta')
