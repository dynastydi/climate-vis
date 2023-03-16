// DATA LOADING && EVENT SETUP

let map = map_svg.append('g')   // create map object
d3.json('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json')
    .then(function(json) {      // fetch geodata

        map.append("g")         // append geo objects
        .attr("class", "countries" )
        .selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "transparent")
        .style('stroke-width', 2)
        .style("opacity", 0.6)
        .attr("id", (d) => { 
            return 'geo' + d.properties['ADM0_A3'] })   // id using ISO for lookup

        map.append("g")         // append centroid markers
        .attr("class", "countries" )
        .selectAll("path")
        .data(json.features)
        .enter().append("circle")
        .attr("id", "marker")
        .attr("transform", d=> {
            let c = path.centroid(d)
            if (c[0] == c[0] && c[1] == c[1]) {
                return "translate(" + c + ")" }} )
        .style("fill", "yellow")
        .style("opacity", 0.75)
        .style("pointer-events", "none")    // ban from pointer events
    })

Promise.all([   // fetch all OWID csvs (personally processed & hosted)
    d3.csv('https://raw.githubusercontent.com/dynastydi/owid-covid/main/total_cases_per_million.csv'),
    d3.csv('https://raw.githubusercontent.com/dynastydi/owid-covid/main/new_cases_per_million.csv'),
    d3.csv('https://raw.githubusercontent.com/dynastydi/owid-covid/main/gdp.csv')
])
    .then(files => { 
        let today_new = null
        let today_total = null
        let total = files[0]
        let daily = files[1]
        let gdp = files[2]
        
        const iso = Object.keys(gdp[0]).slice(1)    // create array of ISO keys
        
        const map_heat = d3.scaleSequential()       // generate heatmap 
            .interpolator(d3.interpolateInferno)
            .domain(d3.extent(total, (d) =>
                { return d.CYP * 1; }))             // use Cyprus for extent - highest case rate per capita
        
        function update_date(date) {                // date update function to apply to all elements
            d3.select("#datebox")                   
                .text(date) // show today's date
            today_total = total.filter((d) =>
                { return d.date == date; } )    // filter for data today
            today_new = daily.filter((d) =>
                { return d.date == date; } )
            sel_new = today_new[0][selected]
            sel_tot = today_total[0][selected]
            d3.select("#newbox")
                .text(Math.round(sel_new, 2) + " new cases / mil today.")   // describe results
            d3.select("#totalbox")
                .text(Math.round(sel_tot, 2) + " total cases / mil.")

            map_svg.selectAll("path")       // heatmap transition dependent on total cases
                    .transition()
                    .duration(150)
                    .attr("fill", d => {
                        return map_heat(today_total[0][d.properties['ADM0_A3']])
                        })
            map_svg.selectAll("#marker")    // marker radius transition dependent on new cases
                .transition()
                .duration(150)
                .attr("r", function(d) {
                    let num = today_new[0][d.properties['ADM0_A3']] 

                    if (this.hasAttribute("transform") && typeof(num) != 'undefined') { 
                        return num / 200}
                } )
            scatter_svg.selectAll("circle") // scattermap transition dependent on total cases
                .transition()
                .duration(150)
                .attr("cy", (d) =>
                    { return scat_y(today_total[0][d])} )
                .attr("cx", (d) =>
                    { return scat_x(gdp[0][d])})
            }
            


        var parser = d3.timeParse("%Y-%m-%d")
        var line_x = d3.scaleTime()         // timescale for linegraph x-axis
            .domain(d3.extent(total, function(d)
                { return parser(d.date); } ) )
            .range([0, 600]);
        
        var line_y = d3.scaleLinear()       // scale total / mil for linegraph y-axis
            .domain(d3.extent(total, function(d)
                { return d.GBR * 1.1; }))
            .range([150, 0])
            
        // apply initial axis and path to linegraph
        line.append("g")
            .attr("id", "dateaxis")
            .attr("transform", "translate(100, 150)")
            .call(d3.axisBottom(line_x));
        line.append("g")
            .attr("id", "lineoutcome")
            .attr("transform", "translate(100, 0)")
            .call(d3.axisLeft(line_y));
        line_svg.append("path")
            .datum(total)
            .attr("id", "linepath")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("transform", "translate(100, 0)")
        
        // apply interactions to linegraph
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
            .attr("class", "listening-rect")    // listening rectangle for click & drag along x-axis
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
            
                line_tip.html(d3.timeFormat("%Y-%m-%d")(date))
                    .style("opacity", 1)
                    .style("left", (d3.pointer(event)[0] + 100) + "px")
                    .style("top", (d3.pointer(event)[1] + 600) + "px")
                
            })
            .on("mouseleave", function(event) {
                d3.select("#dateline")
                    .attr("width", "0px");
                line_tip.style("opacity", 0)
            })
            .on("mouseover", function(event) {
                console.log()
            } )
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

        // mouse events for both scatter & map
        function m_over (code) {    // use ISO code for bidirectional lookup
            let geo = d3.select("#geo" + code)
            let dot = d3.select("#dot" + code)
            geo.style("stroke", "white").raise()
            dot.style("fill", "white").raise()
        }
            
        function m_out (code) {
            let geo = d3.select("#geo" + code)
            let dot = d3.select("#dot" + code)
            if (selected == code) {
                geo.style("stroke", "red").raise()
                dot.style("fill", "red").raise()
            }
            else {
                geo.style("stroke", "transparent")
                dot.style("fill", "skyblue")
            }
        }

        function m_click (code) {
            let geo = d3.select("#geo" + code)
            let dot = d3.select('#dot' + code)
            
            if (selected != code) {
                d3.select('#geo' + selected)
                    .style("stroke", "transparent")
                d3.select('#dot' + selected)
                    .style("fill", "skyblue")
                    .style("stroke", "skyblue")
                selected = code
                d3.select("#linetitle")
                    .text(code)

                geo.style("stroke", "red").raise()
                
                dot.style("fill", "white")
                    .style("stroke", "red")
                    .raise()

                let line_y = d3.scaleLinear()
                    .domain(d3.extent(total, function(d)
                        { return d[code] * 1.1; } ))
                    .range([150, 0])
                d3.select("#lineoutcome")
                    .call(d3.axisLeft(line_y))
                d3.select("#linepath")
                    .attr("d", d3.line()
                        .x(function(d) { return line_x(parser(d.date)) })
                        .y(function(d) { return line_y(d[code]) }) )
                
                update_date(d3.select("#datebox").text())    
            }
        } 
        
        // scatter axis & data
        var scat_x = d3.scaleLinear()
            .domain([0, gdp[0].QAT])
            .range([0, 500]);
        scatter.append("g")
            .attr("transform", "translate(100, 550)")
            .call(d3.axisBottom(scat_x));
        scatter_svg.append('g')
            .selectAll("dot")
            .data(iso)
            .enter()
            .append("circle")
                .attr("id", (d) => { return "dot" + d; } )
                .attr("r", (d) => 
                    { let r = scat_x(gdp[0][d])
                        if (r > 0) { return 5; }
                        else { return 0; } })
                .style("opacity", 0.75)
                .style("fill", "skyblue")
                .style("stroke-width", 2)
                .style("stroke", "skyblue")
                .attr("transform", "translate(100, 50)")
            .on("mousemove", function(event) {  // apply events
                let code = d3.select(this).attr("id").slice(3)
                scat_tip
                    .html(code + "<br>" + Math.round(today_new[0][code]) + " new / mil.")
                    .style("left", (d3.pointer(event)[0] + 650) + "px")
                    .style("top", (d3.pointer(event)[1] + 50) + "px")
            })
            .on("mouseover", function(event) {
                scat_tip
                    .style("opacity", 1)
                m_over(d3.select(this).attr("id").slice(3))
            })
            .on("mouseout", function(event) {
                m_out(d3.select(this).attr("id").slice(3))
                scat_tip
                    .style("opacity", 0)
            })
            .on("click", function(event) {
                m_click(d3.select(this).attr("id").slice(3)) } )
        
        // apply equivalent events to map
        map_svg.selectAll("path")
            .on("mousemove", function(event) {
                let code = d3.select(this).attr("id").slice(3)
                map_tip
                    .html(code + "<br>" + Math.round(today_new[0][code]) +" new / mil.")
                    .style("left", (d3.pointer(event)[0] - 75) + "px")
                    .style("top", (d3.pointer(event)[1]) + "px")
            } )
            .on("mouseover", function(event) {
                map_tip.style("opacity", 1)
                m_over(d3.select(this).attr("id").slice(3)) } )
            .on("mouseout", function(event) {
                map_tip.style("opacity", 0)
                m_out(d3.select(this).attr("id").slice(3)) } )
            .on("click", function(event) {
                m_click(d3.select(this).attr("id").slice(3)) } )

        // set up with GBR as starting point
        let selected = 'GBR'
        update_date("2020-01-01")
        d3.select("#lineoutcome")
            .call(d3.axisLeft(line_y))
        d3.select("#linepath")
            .attr("d", d3.line()
                .x(function(d) { return line_x(parser(d.date)) })
                .y(function(d) { return line_y(d.GBR) }) )
        d3.select("#geoGBR").style("stroke", "red").raise()
                
        d3.select("#dotGBR").style("fill", "white")
            .style("stroke", "red")
            .raise()
            
    })
    
