let map = map_svg.append('g')
d3.json('https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/110m/cultural/ne_110m_admin_0_countries.json')
    .then(function(json) {

        map.append("g")
        .attr("class", "countries" )
        .selectAll("path")
        .data(json.features)
        .enter().append("path")
        .attr("d", path)
        .attr("stroke", "transparent")
        .style('stroke-width', 2)
        .style("opacity", 0.6)
        .attr("id", (d) => { 
            return 'geo' + d.properties['ADM0_A3'] })

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
        .style("fill", "yellow")
        .style("opacity", 0.75)
    })

Promise.all([
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
        
        const iso = Object.keys(gdp[0]).slice(1)
        console.log(iso)
        
        function update_date(date) {
            d3.select("#datebox")
                .text(date)
            today_total = total.filter((d) =>
                { return d.date == date; } )
            today_new = daily.filter((d) =>
                { return d.date == date; } )
            sel_new = today_new[0][selected]
            sel_tot = today_total[0][selected]
            d3.select("#newbox")
                .text(Math.round(sel_new, 2) + " new cases / mil today.")
            d3.select("#totalbox")
                .text(Math.round(sel_tot, 2) + " total cases / mil.")

            let map_heat = d3.scaleSequential()
                .interpolator(d3.interpolateInferno)
                .domain(d3.extent(total, (d) =>
                    { return d.CYP * 1; }))

            map_svg.selectAll("path")
                    .transition()
                    .duration(150)
                    .attr("fill", d => {
                        return map_heat(today_total[0][d.properties['ADM0_A3']])
                        //return colours[Math.round(today_total[0][d.properties['ADM0_A3']] / 100000)]
                        })
            map_svg.selectAll("#marker")
                .transition()
                .duration(150)
                .attr("r", function(d) {
                    let num = today_new[0][d.properties['ADM0_A3']] 

                    if (this.hasAttribute("transform") && typeof(num) != 'undefined') { 
                        return num / 200}
                } )
            scatter_svg.selectAll("circle")
                //.data(iso)
                //.join("circle")
                .transition()
                .duration(150)
                .attr("cy", (d) =>
                    { return scat_y(today_total[0][d])} )
                .attr("cx", (d) =>
                    { return scat_x(gdp[0][d])})
                //.attr("cy"
            /*
            let scat_y = d3.scaleLinear()
                .domain(d3.extent(today_total, function(d) 
                    { return Object.values(d); }))
                .range([300, 0]);
            d3.select("#scatoutcome")
                .call(d3.axisLeft(scat_y))
            */
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
        function m_over (code) {
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

        var scat_x = d3.scaleLinear()
            .domain([0, gdp[0].QAT])
            .range([0, 500]);
        console.log(scat_x.domain())
        console.log(gdp[0].QAT)
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
            .on("mousemove", function(event) {
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
                //tooltip
            })
            .on("mouseout", function(event) {
                m_out(d3.select(this).attr("id").slice(3))
                scat_tip
                    .style("opacity", 0)
            })
            .on("click", function(event) {
                m_click(d3.select(this).attr("id").slice(3)) } )
        /*

        scatter_svg.append("rect")
            .attr("class", "listening-rect")
            .attr("width", 500)
            .attr("height", 500)
            .attr("transform", "translate(50, 50)")
            //.call(d3.brush())
                //.extent([50,50], [100, 100]))
    
        const brush = d3.brush()
            .on("start brush end", brusher)
            .extent([[50, 50], [550, 550]])
        scatter_svg.call(brush)
        
        function brusher (event) {
            let value = []
            let select = event.selection
            let dots = scatter_svg.selectAll("circle")
            if (select) {
                const [[x0, y0], [x1, y1]] = select
                dots
                    //.style("fill", "skyblue")
                    //.filter(d => x0 <= scat_x(d.cx) && scat_x(d.cx) < x1 && y0 <= scat_y(d.cy) && scat_y(d.cy) < y1)
                    .style("fill", "orange")
                    .attr("r", function(d) {console.log(d)})
                    .data();

                
            } else {
                dots
                    .style("fill", "skyblue")
            }
            scatter_svg.property("value", value).dispatch("input");
        }
        //scatter_svg.call(brush)
        */
        map_svg.selectAll("path")
            .on("mousemove", function(event) {
                let code = d3.select(this).attr("id").slice(3)
                map_tip
                    .html(code + "<br>" + Math.round(today_new[0][code]) +" new / mil.")
                    .style("left", (d3.pointer(event)[0] + 70) + "px")
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
    
