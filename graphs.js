let scatter_svg = d3.select("#scatter")
    .append("svg")
    .attr("width", 800)
    .attr("height", 800)

let scatter = scatter_svg.append('g')

var scat_x = d3.scaleLinear()
    .domain([0, 4000])
    .range([ 0, 300 ]);
scatter.append("g")
    .attr("transform", "translate(50, 350)")
    .call(d3.axisBottom(scat_x));

  // Add Y axis
var scat_y = d3.scaleLinear()
    .domain([0, 500000])
    .range([ 300, 0]);
scatter.append("g")
    .attr("transform", "translate(50, 50)")
    .call(d3.axisLeft(scat_y));



let line_svg = d3.select("#line")
    .append("svg")
    .attr("width", 650)
    .attr("height", 200)

let line = line_svg.append("g")
    .attr("id", "linegraph")
