let line_svg = d3.select("#line")
    .append("svg")
    .attr("width", 650)
    .attr("height", 200)

let line = line_svg.append('g')
    .attr("id", "linegraph")
