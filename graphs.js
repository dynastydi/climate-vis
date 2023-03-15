var map_tip = d3.select("#map")
    .append("div")
    .style("opacity", 1)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .raise()
var scat_tip = d3.select("#scatter")
    .append("div")
    .style("opacity", 1)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .raise()

var line_tip = d3.select("#scatter")
    .append("div")
    .style("opacity", 1)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("position", "absolute")
    .raise()
let scatter_svg = d3.select("#scatter")
    .append("svg")
    .attr("width", 800)
    .attr("height", 800)

let scatter = scatter_svg.append('g')

/*
var scat_x = d3.scaleLinear()
    .domain([0, 4000])
    .range([ 0, 300 ]);
scatter.append("g")
    .attr("transform", "translate(50, 350)")
    .call(d3.axisBottom(scat_x));
*/
  // Add Y axis
var scat_y = d3.scaleLinear()
    .domain([0, 750000])
    .range([ 500, 0]);
scatter.append("g")
    .attr("id", "scatoutcome")
    .attr("transform", "translate(100, 50)")
    .call(d3.axisLeft(scat_y));

scatter_svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", 380)
    .attr("y", 600)
    .text("GDP per capita");

scatter_svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -225)
    .attr("y", 25)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Cases per million");


let line_svg = d3.select("#line")
    .append("svg")
    .attr("width", 650)
    .attr("height", 200)

let line = line_svg.append("g")
    .attr("id", "linegraph")

line_svg.append("text")
    .attr("x", 375)
    .attr("y", 18)
    .attr("text-anchor", "middle")
    .attr("id", "linetitle")
    .text("GBR")
    .style("font-weight", "box")
line_svg.append("text")
    .attr("x", 110)
    .attr("y", 18)
    .attr("id", "datebox")
    .style("font-size", "14px")
line_svg.append("text")
    .attr("x", 110)
    .attr("y", 32)
    .attr("id", "newbox")
    .style("font-size", "14px")
line_svg.append("text")
    .attr("x", 110)
    .attr("y", 46)
    .attr("id", "totalbox")
    .style("font-size", "14px")

line_svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "end")
    .attr("x", 395)
    .attr("y", 190)
    .text("Date");

line_svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("x", -25)
    .attr("y", 25)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Cases per million");


