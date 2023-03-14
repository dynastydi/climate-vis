let map = map_svg.append('g')
d3.json('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json')
    .then(function(json) {
        map.append("g")
        .attr("class", "countries" )
        .selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "white")
        .style('stroke-width', 0)
        .style("opacity", 0.6)
        .attr("id", (d) => { 
            return d.properties['ADM0_A3'] })
        map_svg.selectAll("path")
        .on("mouseover", function(event) {
            if (selected == this) {
                d3.select(this)
                .style("stroke", "white")
            }
            else {
                d3.select(this)
                .style("stroke-width", 2)
            }
        } )
        .on("mouseout", function(event) {
            if (selected == this) {
                d3.select(this)
                .style("stroke", "orange") 
            }
            else {
                d3.select(this)
                .style("stroke-width", 0)
            }
        } )
        .on("click", function(event) {
            if (selected == this) { 
                d3.select(this)
                .style("stroke", "white")
            }
        })

        map.append("g")
        .attr("class", "countries" )
        .selectAll("path")
        .data(json.features)
        .enter().append("circle")
        .attr("id", "marker")
        .attr("transform", d=> {
            let c = path.centroid(d)
            if (c[0] == c[0] && c[1] == c[1]) {
                return "translate(" + c + ")" }} )
        .style("fill", "#FF5C57")
        .style("opacity", 0.75)
    })



d3.csv('https://raw.githubusercontent.com/dynastydi/owid-covid/main/total_cases_per_million.csv')
    .then(csv => { 
        let total = csv
        d3.csv('https://raw.githubusercontent.com/dynastydi/owid-covid/main/new_cases_per_million.csv')
            .then((csv) => {
                function update_date(date) {
                    let today_total = total.filter((d) =>
                        { return d.date == date; } )
                    let today_new = csv.filter((d) =>
                        { return d.date == date; } )
                    //console.log(today_total[0]['FRA'])
                    map_svg.selectAll("path")
                            .transition()
                            .duration(150)
                            .attr("fill", d => {
                                return colours[Math.round(today_total[0][d.properties['ADM0_A3']] / 10)]
                                })
                    map_svg.selectAll("#marker")
                        .transition()
                        .duration(150)
                        .attr("r", function(d) {
                            let num = today_new[0][d.properties['ADM0_A3']] 

                            if (this.hasAttribute("transform") && typeof(num) != 'undefined') { 
                                return num * 50}
                        } )
                    }


                var parser = d3.timeParse("%Y-%m-%d")
                var line_x = d3.scaleTime()
                    .domain(d3.extent(total, function(d)
                        { return parser(d.date); } ) )
                    .range([0, 600]);
                
                
                var line_y = d3.scaleLinear()
                    .domain(d3.extent(total, function(d)
                        { return d.GBR * 1.1; }))
                    .range([150, 0])
                    
                line.append("g")
                    .attr("id", "dateaxis")
                    .attr("transform", "translate(50, 150)")
                    .call(d3.axisBottom(line_x));
                line.append("g")
                    .attr("id", "lineoutcome")
                    .attr("transform", "translate(50, 0)")
                    .call(d3.axisLeft(line_y));
                line_svg.append("path")
                    .datum(total)
                    .attr("id", "linepath")
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                /*
                    .attr("d", d3.line()
                        .x(function(d) { 
                            return line_x(parser(d.date)) })
                        .y(function(d) { return line_y(d.World) })
                    )*/
                    .attr("transform", "translate(50, 0)")
                line_svg.append("g")
                    .append("rect")
                    .attr("id", "dateline")
                    .attr("class", "dotted")
                    .attr("stroke-width", "1px")
                    .attr("stroke", "orange")
                    .attr("height", 150)
                
                line_svg.append("g")
                    .append("rect")
                    .attr("id", "dateselect")
                    .attr("class", "dotted")
                    .attr("stroke-width", "1px")
                    .attr("stroke", "red")
                    .attr("height", 150)
                
                line_svg.append("rect")
                    .attr("class", "listening-rect")
                    .attr("width", 600)
                    .attr("height", 150)
                    .attr("transform", "translate(50, 0)")
                    .on("mousemove", function(event) {
                        let pos = d3.pointer(event)
                        let date = line_x.invert(pos[0])
                        let xpos = line_x(date) + 50
                        d3.select("#dateline")
                            .attr("width", "1px")   
                            .attr("transform", "translate(" + xpos + ", 0)")
                    })
                    .on("mouseleave", function(event) {
                        d3.select("#dateline")
                            .attr("width", "0px");
                    })
                    .on("click", function(event) {
                        let pos = d3.pointer(event)
                        let date = line_x.invert(pos[0])
                        let xpos = line_x(date) + 50
                        d3.select("#dateselect")
                            .attr("width", "0.5px")
                            .attr("transform", "translate(" + xpos + ", 0)");
                        update_date(d3.timeFormat("%Y-%m-%d")(date))
                    })
                    .call(d3.drag().on("drag", function(event) {
                        let pos = d3.pointer(event)
                        let date = line_x.invert(pos[0] - 60)
                        let xpos = line_x(date) + 50
                        d3.select("#dateselect")
                            .attr("width", "0.5px")
                            .attr("transform", "translate(" + xpos + ", 0)");
                        d3.select("#dateline")
                            .attr("width", "1px")
                            .attr("transform", "translate(" + xpos + ", 0)");
                        update_date(d3.timeFormat("%Y-%m-%d")(date))
                    }))
                map_svg.selectAll("path")
                    .on("mouseover", function(event) {
                        if (selected == this) {
                            d3.select(this)
                            .style("stroke", "white")
                        }
                        else {
                            d3.select(this)
                            .style("stroke-width", 2)
                        }
                    } )
                    .on("mouseout", function(event) {
                        if (selected == this) {
                            d3.select(this)
                            .style("stroke", "orange") 
                        }
                        else {
                            d3.select(this)
                            .style("stroke-width", 0)
                        }
                    } )
                    .on("click", function(event) {
                        if (selected == this) { 
                            d3.select(this)
                            .style("stroke", "white")
                        }
                        else {
                            d3.select(selected)
                                .style("stroke-width", 0)
                                .style("stroke", "white")
                            selected = this
                            d3.select(this)
                                .style("stroke", "orange")
                            let country_name = d3.select(this).attr('id')
                            let line_y = d3.scaleLinear()
                                .domain(d3.extent(total, function(d)
                                    { return d[country_name] * 1.1; } ))
                                .range([150, 0])
                            d3.select("#lineoutcome")
                                .call(d3.axisLeft(line_y))
                            d3.select("#linepath")
                                .attr("d", d3.line()
                                    .x(function(d) { return line_x(parser(d.date)) })
                                    .y(function(d) { return line_y(d[country_name]) }) )
                            
                        }
                    })
                    
            })
    })
