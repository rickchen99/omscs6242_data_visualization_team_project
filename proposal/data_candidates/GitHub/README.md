start with repository using search mechanism  
search api for repos enables this searching  
example request: https://api.github.com/search/repositories?q=react  
return: "gh_repo_search_api_example.json"  
this is a list of dictionaries, each includes keys "full_name." and "contributors_url". parse out those two.  
display "full_name" that in dropdown list. allow users to select repo to add to graph.  

once we have a repo (node) on the graph, access that node's "contributors_url"  
"contributors_url": "https://api.github.com/repos/facebook/react/contributors"  
return: gh_contributors_api_example.json  
list of dictionaries. includes keys "login" (name, id of person) and "contributions" (int, number of contributions)  
create edges connecting repo(node) to person (node) with weight (number of contributions)  

now, our user can click a 'person' node and prompt a search for all the repos that person has contributed to.  
do so with the "commits api"  
example request: https://api.github.com/search/commits?q=author:gaearon  
'author' = 'login' from that person's json.  
example response: gh_commits_api_example.json  
list of dictionaries. each dict contains key "repository", value dictionary, containing keys "full_name" and "url"  
because each dict is a distinct commit, and because each person can contribute to the same repo many times,  
here we have to group dicts by "full_name" and count to get the edge weights.  
add each distinct "repository" to graph as node. we already have "full_name". also create "contributors_url".  
edges connecting person to repo nodes weighted with 'count'  

TODO: these urls are returning sample results. figure out how to get comprehensive results.  
Some of these may be huge numbers. may have to work out some way to limit the graph size before newman's algo can be run.  

repo node attributes:  
1. full_name (eg: facebook/react)  
2. contributors url (eg: https://api.github.com/repos/facebook/react/contributors) (derived from full_name)  

person node attributes:  
1. author (eg: gaearon)  
2. commits_url (eg: https://api.github.com/search/commits?q=author:gaearon)  

edge attributes:  
1. commits: integer, number of commits person has made to repo  
