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
        .style("opacity", 1)
        .attr("id", (d) => { 
            return 'geo' + d.properties['ADM0_A3'] })   // id using ISO for lookup
/*
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
    */
    })

Promise.all([
    d3.json('https://raw.githubusercontent.com/dynastydi/climate-data/main/climate.json'),
    d3.csv('https://raw.githubusercontent.com/dynastydi/climate-data/main/global.csv')])
    .then(files => { 
        let this_year = ''
        let temp = null
        let climate = files[0]
        let global = files[1]
        const temp_heat = d3.scaleSequential()
            .interpolator(d3.interpolateCool)
            .domain(d3.extent(global, (d) =>
                { return d.Temperature * 1; }))
        const ghg_heat = d3.scaleSequentialSqrt()
            .interpolator(d3.interpolateInferno)
            .domain([0, d3.max(climate.CHN, (d) =>
                { return d['GHG emissions']; })])
        //const iso = Object.keys(gdp[0]).slice(1)    // create array of ISO keys
        /*
        const map_heat = d3.scaleSequential()       // generate heatmap 
            .interpolator(d3.interpolateInferno)
            .domain(d3.extent(total, (d) =>
                { return d.CYP * 1; }))             // use Cyprus for extent - highest case rate per capita
        */
        function update_date(year) {                // date update function to apply to all elements
            this_year = year
            d3.select("#datebox")                   
                .text(year) // show today's date
            
            entry = climate[selected].filter((d) =>
                { return d.Year == year } )[0]
            
            set_pie(entry)
            global_year = global.filter((d) => { return d.Year == year; } )[0]
            
            pop = entry['Population (historical estimates)'] / global_year.Population * 100
            gdp = entry.GDP / global_year.GDP * 100

            d3.select("#poprank")
                .text(pop.toFixed(2) + "% of global population")
            d3.select("#gdprank")
                .text(gdp.toFixed(2) + "% of global GDP")

            globe
                .transition()
                .duration(150)
                .attr("fill", d => {
                    return temp_heat(global_year.Temperature) })
            map_svg.selectAll("path")
                .transition()
                .duration(150)
                .attr("fill", d => {
                    country = climate[d.properties['ADM0_A3']]
                    if (country !== undefined) {
                        val = country.filter((d) => { return d.Year == year; })
                        if (val.length !== 0)
                            { return ghg_heat(val[0]['GHG emissions'])}  }})
            d3.select('#oilbox')
                .text(entry['Oil production (TWh)'].toFixed(2) + " TWh oil")
            d3.select('#gasbox')
                .text(entry['Gas production (TWh)'].toFixed(2) + "TWh gas")
            d3.select('#coalbox')
                .text(entry['Coal production (TWh)'].toFixed(2) + "TWh coal")

            /*
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
              */
            /*
            scatter_svg.selectAll("circle") // scattermap transition dependent on total cases
                .transition()
                .duration(150)
                .attr("cy", (d) =>
                    { return scat_y(today_total[0][d])} )
                .attr("cx", (d) =>
                    { return scat_x(gdp[0][d])})
            */
            }
        function set_line(code) {
        
        }
        
        function set_pie(entry) {

            let pie_scale = d3.scaleLinear()
                .domain([0, d3.max(climate[selected], function(d)
                { return d['GHG emissions']} )] )
                .range([0, 150])
            var pie_data = [
                [
                    'CO\u2082', 
                    entry['Annual CO\u2082 emissions (zero filled)'],
                    'crimson'
                ],
                [
                    'CH\u2084', 
                    entry['Annual methane emissions'],
                    'magenta'
                ],
                [
                    'N\u2082O', 
                    entry['Annual nitrous oxide emissions'],
                    'orange'
                ]
            ]
            
            d3.select('#co2box')
                .text(Math.round(entry['Annual CO\u2082 emissions (zero filled)'] / 100000) / 10 + ' Mt CO\u2082')
            d3.select('#ch4box')
                .text(Math.round(entry['Annual methane emissions'] / 100000) / 10 + ' Mt CH\u2084')
            d3.select('#n2obox')
                .text(Math.round(entry['Annual nitrous oxide emissions'] / 100000) / 10+ ' Mt N\u20820')
            d3.select('#totalbox')
                .text(Math.round(entry['GHG emissions'] / 100000) / 10 + ' Mt total')

            var chart = d3.pie()
                .value(function(d) { 
                    return d[1]; })
                .sort(function(a, b) { 
                    return d3.ascending(a[0], b[0]) })
            
            var p = pie.selectAll('path')
                .data(chart(pie_data))
            
            var radius = pie_scale(entry['GHG emissions'])

            p
                .enter()
                .append('path')
                .merge(p)
                .transition()
                .duration(100)
                .attr('d', d3.arc()
                    .innerRadius(d3.max([10, radius - 50]))
                    .outerRadius(radius)
                )
                .attr('fill', (d) => {
                    return d.data[2]})
                .style('opacity', 1)
            p
                .exit()
                .remove()
           
        }

        
        var parser = d3.timeParse("%Y")
        var format = d3.timeFormat("%Y")
        var line_x = d3.scaleTime()         // timescale for linegraph x-axis
            .domain(d3.extent(global, function(d)
                { return parser(d.Year); } ) )
            .range([0, 500]);
        
        let line_y = d3.scaleLinear()       // scale total / mil for linegraph y-axis
            .domain(d3.extent(climate.GBR, function(d)
                { return d['Oil production (TWh)'] * 1.1; }))
            .range([250, 0])
            
        // apply initial axis and path to linegraph
        line.append("g")
            .attr("id", "dateaxis")
            .attr("transform", "translate(100, 250)")
            .call(d3.axisBottom(line_x));
        line.append("g")
            .attr("id", "lineoutcome")
            .attr("transform", "translate(100, 0)")
            .call(d3.axisLeft(line_y));
        line_svg.append("path")
            .attr("id", "coalline")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("transform", "translate(100, 0)")
        line_svg.append("path")
            .attr("id", "oilline")
            .attr("fill", "none")
            .attr("stroke", "purple")
            .attr("stroke-width", 2)
            .attr("transform", "translate(100, 0)")
        line_svg.append("path")
            .attr("id", "gasline")
            .attr("fill", "none")
            .attr("stroke", "green")
            .attr("stroke-width", 2)
            .attr("transform", "translate(100, 0)")
// apply interactions to linegraph
        line_svg.append("g")
            .append("rect")
            .attr("id", "dateline")
            .attr("class", "dotted")
            .attr("stroke-width", "1px")
            .attr("stroke", "orange")
            .attr("height", 250)
        line_svg.append("g")
            .append("rect")
            .attr("id", "dateselect")
            .attr("class", "dotted")
            .attr("stroke-width", "1px")
            .attr("stroke", "red")
            .attr("height", 250)
        line_svg.append("rect")
            .attr("class", "listening-rect")    // listening rectangle for click & drag along x-axis
            .attr("width", 500)
            .attr("height", 250)
            .attr("transform", "translate(100, 0)")
            .on("mousemove", function(event) {
                let pos = d3.pointer(event)
                let date = line_x.invert(pos[0])
                let xpos = line_x(date) + 100
                d3.select("#dateline")
                    .attr("width", "1px")   
                    .attr("transform", "translate(" + xpos + ", 0)")
            
                line_tip.html(format(line_x.invert(pos[0])))
                    .style("opacity", 1)
                    .style("left", (d3.pointer(event)[0] + 100) + "px")
                    .style("top", (d3.pointer(event)[1] + 550) + "px")
                
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
                let xpos = line_x(date) + 100
                d3.select("#dateselect")
                    .attr("width", "0.5px")
                    .attr("transform", "translate(" + xpos + ", 0)");
                update_date(format(date))
            })
            .call(d3.drag().on("drag", function(event) {
                let pos = d3.pointer(event)
                let date = line_x.invert(pos[0] - 110)
                let xpos = line_x(date) + 100
                d3.select("#dateselect")
                    .attr("width", "0.5px")
                    .attr("transform", "translate(" + xpos + ", 0)");
                d3.select("#dateline")
                    .attr("width", "1px")
                    .attr("transform", "translate(" + xpos + ", 0)");
                update_date(format(date))
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

                let line_y = d3.scaleLinear()       // scale total / mil for linegraph y-axis
                    .domain([0, d3.max(climate[code], function(d)
                        { return d3.max([d['Oil production (TWh)'], d['Gas production (TWh)'], d['Coal production (TWh)']]) * 1.1; })])
                    .range([250, 0])

                d3.select("#lineoutcome")
                    .call(d3.axisLeft(line_y))
                d3.select("#coalline")
                    .datum(climate[code])
                    .attr("d", d3.line()
                        .x(function(d) { return line_x(parser(d.Year)) })
                        .y(function(d) { return line_y(d['Coal production (TWh)']) }) )
                d3.select("#oilline")
                    .datum(climate[code])
                    .attr("d", d3.line()
                        .x(function(d) { return line_x(parser(d.Year)) })
                        .y(function(d) { return line_y(d['Oil production (TWh)']) }) )
                d3.select("#gasline")
                    .datum(climate[code])
                    .attr("d", d3.line()
                        .x(function(d) { return line_x(parser(d.Year)) })
                        .y(function(d) { return line_y(d['Gas production (TWh)']) }) )
                
                update_date(d3.select("#datebox").text())    
            }
        } 
        
        map_svg.selectAll("circle")
            .on("mousemove", function(event) {
                temp = Number(global_year.Temperature).toFixed(2)
                map_tip
                    .html(temp + "\u00B0C")
                    .style("left", (d3.pointer(event)[0] - 75) + "px")
                    .style("top", (d3.pointer(event)[1]) + "px")

            }
            )
            .on("mouseover", function(event) {
                map_tip.style("opacity", 1) })
            .on("mouseout", function(event) {
                map_tip.style("opacity", 0) })
        // apply equivalent events to map
        map_svg.selectAll("path")
            .on("mousemove", function(event) {
                let code = d3.select(this).attr("id").slice(3)
                emissions = climate[code].filter((d) =>
                    { return d.Year == this_year } )[0]['GHG emissions']
                map_tip
                    .html(code + "<br>" + Math.round(emissions/100000) / 10 + "Mt GHG.")
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
        update_date("1965")

        d3.select("#coalline")
            .datum(climate.GBR)
            .attr("d", d3.line()
                .x(function(d) { return line_x(parser(d.Year)) })
                .y(function(d) { return line_y(d['Coal production (TWh)']) }) )
        d3.select("#oilline")
            .datum(climate.GBR)
            .attr("d", d3.line()
                .x(function(d) { return line_x(parser(d.Year)) })
                .y(function(d) { return line_y(d['Oil production (TWh)']) }) )
        d3.select("#gasline")
            .datum(climate.GBR)
            .attr("d", d3.line()
                .x(function(d) { return line_x(parser(d.Year)) })
                .y(function(d) { return line_y(d['Gas production (TWh)']) }) )
        d3.select("#geoGBR").style("stroke", "red").raise()
    })
    
