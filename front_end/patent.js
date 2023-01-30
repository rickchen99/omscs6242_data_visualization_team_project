let db;
var svg;
var globalCurrentgraph =[];
var globalCurrentgraph2 =[];
var temp_invetor;
var temp_edge_uid_aar=[];
var random_edge_pair =[]; //use to store random edges

var last_clicked;
function graph_generator(arr)
{
   /* console.log(document.getElementById("active_tooltip"))
    //still need a way to close element that is div id = 'active_tooltip' before generating graphs
    //$("active_tooltip").remove();
    temp_hc_len = document.getElementsByClassName("tooltip").length
    //console.log
    if(temp_hc_len==0)
    {
        console.log('found')
    }
    else
    {
        document.getElementsByClassName("tooltip").remove();
    }
    */
    var links = arr;
    var nodes = {};
    var width = 1200,
        height = 800;
    color = d3.scaleOrdinal(d3.schemeCategory10);

    // compute the distinct nodes from the links.
    links.forEach(function (link) {
        link.source = nodes[link.source] || (nodes[link.source] = { name: link.source });
        link.target = nodes[link.target] || (nodes[link.target] = { name: link.target });

    });
    //--------

    var force = d3.forceSimulation()
        .nodes(d3.values(nodes))
        .force("link", d3.forceLink(links).distance(100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-250))
        .alphaTarget(1)
        .on("tick", tick);

    
    svg = d3.select("#d3_network")
        .append("svg")
        .attr("id","the_SVG_ID")
        .attr("width", width)
        .attr("height", height);

    // svg.selectAll("*").remove();
    var Tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("id", "active_tooltip")
    .attr("class", "tooltip")
    .attr("width",60).attr("height",80)
    .style("background-color", "#B0D2F1")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    

    // add the links
    var path = svg.append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("class", function (d) { return "link " + d.type; });

    path.style("stroke", function (d) {
        if (d.value > 80) { return ('green'); }
        else { return 'black'; }
    })

    path.style('stroke-width', function (d) {
        if (d.value > 80) {
            return 4; //Thin
        } else {
            return 2; //Thick
        }
    })

    path.attr('stroke-dasharray', function (d) {
        if (d.value === 1) {
            return '5';
        } else {
            return null;
        }
    })



    path.on("dblclick", function(d) {	
        source_name = d.source.name
        target_name = d.target.name
        temp_table = get_inventions(source_name,target_name)
        Tooltip.transition()		
            .duration(200)		
            .style("opacity", 0.98)
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
          
            Tooltip.html(
                'Inventions by <b>'+source_name+ '</b> ' + 'sponsored by <b>' +target_name + '</b> <br>'+ 
                makeTableHTML(temp_table)
            )
            
        })					
    svg.on("click", function(d) {		
        Tooltip.transition()		
            .duration(500)		
            .style("opacity", 0).attr("visibility", "hidden");
        //document.getElementsById("active_tooltip").remove();
        d3.select("active_tooltip").exsit()
		
    });

    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("id", function (d) {
            return (d.name.replace(/\s+/g, '').toLowerCase());
        })
        .attr("r", function (d) {
            d.weight = links.filter(function (l) {
                return l.source.index == d.index || l.target.index == d.index
            }).length;
            var minRadius = 10;
            return minRadius + (d.weight * 0.2);
        })
        .style("fill", function (d) {
            return color(d.weight);
        });

    var label = svg.selectAll(".mytext")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node");

    label.append("text")
        .text(function (d) { return d.name; })
        .attr("id", function (d) {
            return (d.name.replace(/\s+/g, '').toLowerCase());
        });

    node.on("dblclick", function (d) {
        d.fixed = false;
        d.fx = null;
        d.fy = null;

        d3.select(this) // `this` is the node where drag happend
            .select("circle")
            .style("fill", function (d) {
                return color(d.weight);
            });
    });
    
    // add the curvy lines
    function tick() {
        path.attr("d", function (d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

    

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

        label.attr("transform", function (d) {
            x = d.x + 20;
            y = d.y;
            return "translate(" + x + "," + y + ")";
        });
    };

    function dragstarted(d) {
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;

        d.fixed = true;

        //node.style("fill", color(2));
    };

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    function dragended(d) {
        if (!d3.event.active) force.alphaTarget(0);
        if (d.fixed == true) {
            d.fx = d.x;
            d.fy = d.y;
        }
        else {
            d.fx = null;
            d.fy = null;
        }

        d3.select(this) // `this` is the node where drag happend
            .select("circle")
            .style("fill", "blue");
    };
}


function makeTableHTML(myArray) {

    var result = "<table border=1>";
    result +=`  <tr>
    <th>Invention ID</th>
    <th>Title</th>
    <th>Date</th>
    <th># of Claims</th>
    <th>Confidence %</th>
            </tr>`
    for(var i=0; i<myArray.length; i++) {
        percent = myArray[i].value * 100
        first_30 =myArray[i].invention_title
        result += "<tr>";
        
            result += "<td>"+myArray[i].edge_uid+"</td>";
            result += "<td>"+first_30.slice(0,30)+"</td>";
            result += "<td>"+myArray[i].date+"</td>";
            result += "<td>"+myArray[i].num_claims+"</td>";
            result += "<td>"+percent.toFixed(1)+"</td>";
        
        result += "</tr>";
    }
    
    result += "</table>";
    //console.log(result);

    return result;
}
function graph_aar_generator(query_result)
{
    var arr = [];
    var len = query_result.values.length;
    for (var i = 0; i < len; i++) {
        arr[i] = {
            edge_uid:query_result.values[i][0],
            source: query_result.values[i][3],
            target: query_result.values[i][5],
            value: query_result.values[i][8],
        }
        temp_edge_uid_aar.push(query_result.values[i][0])
    }
    return arr;
}

function get_inventions(inventor,sponsor)
{
    var confidence_r = document.getElementById("range_weight").value;
    invention_query = `SELECT * FROM sample_tb_10k
     WHERE confidence_r * 100 > ${confidence_r} AND source_name is '${inventor}' AND target_name is '${sponsor}'`
    let results = db.exec(invention_query);
    let query_result = results[0];

    var arr = [];
    var len = query_result.values.length;
    for (var i = 0; i < len; i++) {
         arr[i] = {
             edge_uid:query_result.values[i][0],
             invention_title: query_result.values[i][1],
             num_claims: query_result.values[i][6],
             date:query_result.values[i][7],
             value: query_result.values[i][8],
         }
         
     }
    //console.log(arr);
    return arr;
    
     
}
function clearBox(elementID) {
    var div = document.getElementById(elementID);
      
    while(div.firstChild) {
        div.removeChild(div.firstChild);
    }
}
document.getElementById("addGraph").onclick=async ()=>{
    d3.select("#the_SVG_ID").remove();
    //d3.selectAll("*").remove();
    edge_aar_str = random_edge_pair.join(',')
    add_all_query =  `
    SELECT * 
    from sample_tb_10k WHERE
     uid in (${edge_aar_str})

    `
    let results = db.exec(add_all_query);
    let result = results[0];
    arr = graph_aar_generator(result)
    
    graph_generator(arr)
}

document.getElementById("btnApplyFilter").onclick=async ()=>{
    d3.select("#the_SVG_ID").remove();
    d3.select("active_tooltip").remove();

    var confidence_r = document.getElementById("range_weight").value;

    edge_aar_str = temp_edge_uid_aar.join(',')
    filter_query = `
        SELECT * 
        from sample_tb_10k WHERE
        confidence_r * 100>${confidence_r}
        and uid in (${edge_aar_str})
    `
    let results = db.exec(filter_query);
    let result = results[0];
    //console.log(result)
    //arr=[]
    
    arr = graph_aar_generator(result)
    graph_generator(arr)
   
    


}

document.getElementById("btnSearch").onclick=async ()=>{
    d3.select("#the_SVG_ID").remove();
    d3.select("active_tooltip").remove();
    //d3.selectAll("*").remove();
    var source_name = document.getElementById("ddlSearch").value;
    var num_claims = document.getElementById("range_weight").value;
    temp_edge_uid_aar=[]

    var query = `
    select uid,source_name as source, target_name as target, (confidence_r * 100) as value 
    from sample_tb_10k 
    where source_name = '${source_name}' and (confidence_r*100) > ${num_claims}
    `
    //console.log(query);
    let results = db.exec(query);

    let result = results[0];
   // console.log(result)

    var arr = [];
    var len = result.values.length;
    for (var i = 0; i < len; i++) {
        arr[i] = {
            edge_uid:result.values[i][0],
            source: result.values[i][1],
            target: result.values[i][2],
            value: result.values[i][3],
        }
        temp_edge_uid_aar.push(result.values[i][0])
        random_edge_pair.push(result.values[i][0])
    }
    //console.log(arr);
    temp_invetor = arr[1].source;
    globalCurrentgraph = arr;
    current_graph_temp = arr;
    graph_generator(globalCurrentgraph)
};

document.getElementById("btnSearchRandom").onclick=async ()=>{
    d3.select("#the_SVG_ID").remove();
    d3.select("active_tooltip").remove();
    temp_edge_uid_aar =[]
    var num_claims = document.getElementById("range_weight").value;
    var query = `with random_name_list as
    (SELECT DISTINCT(source_name) from sample_tb_10k ORDER by random() LIMIT 1)
    select * FROM sample_tb_10k WHERE source_name is (
    SELECT * FROM random_name_list
    )
    `
   // console.log(query);
    let results = db.exec(query);

    let result = results[0];
   // console.log(result)

    var arr = [];
    var len = result.values.length;
    for (var i = 0; i < len; i++) {
        arr[i] = {
            edge_uid:result.values[i][0],
            source: result.values[i][3],
            target: result.values[i][5],
            value: result.values[i][8] * 100,
        }
       
        temp_edge_uid_aar.push(result.values[i][0])
        random_edge_pair.push(result.values[i][0])
    }


    graph_generator(arr);
    temp_invetor = arr[1].source;
    //console.log(temp_edge_uid_aar)




};





(async () => {
    var select = document.getElementById("ddlSearch");

    let res = await fetch('sample_db_10k.db');
    let arrayBuffer = await res.arrayBuffer();
    let uInt8Array = new Uint8Array(arrayBuffer);
    db=new SQL.Database(uInt8Array);

    var query = `
    select DISTINCT source_name as name 
    from sample_tb_10k 
    order by source_name
    `

   // console.log(query);

    let results = db.exec(query);
    let result = results[0];
    //console.log(result)

    var len = result.values.length;
    for (var i = 0; i < len; i++) {
        var el = document.createElement("option");
        el.textContent = result.values[i][0];
        el.value = result.values[i][0];
        select.appendChild(el);
    }
})();