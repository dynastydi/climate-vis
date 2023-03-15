const colours = ["#000000", "#174215", "#53802A", "#B0BD40", "#F8C658", "#FFA351", "#FF754D", "#FF4C57"]

let cases = d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/cases_deaths/new_cases_per_million.csv')

let data = {}
//let width = d3.select("#content canvas").node().getBoundingClientRect().width
//let height = 500

let map_svg = d3.select("#map")
    .append("svg")
    .attr("width", 600)
    .attr("height", 600)
let projection = d3.geoOrthographic()
    .scale(150)
    .center([0, 0])
    .translate([300, 300])
    .rotate([0, -45])
let path = d3.geoPath().projection(projection);

let scale = projection.scale()

let yaw = 0;
let pitch = -45;
let speed = 1;    

let moving = false;

let globe = map_svg.append("circle")
    .attr("fill", "skyblue")
    .attr("stroke", "#000")
    .attr("stroke-width", "0.2")
    .attr("cx", 300)
    .attr("cy", 300)
    .attr("r", scale)
    .style("opacity", "0.9")



map_svg.call(d3.drag().on('drag', (event) => {
    const rotate = projection.rotate()
    const k = 75 / projection.scale()
    projection.rotate([
      rotate[0] + event.dx * k,
      rotate[1] - event.dy * k
    ])
    path = d3.geoPath().projection(projection)
    map_svg.selectAll("path").attr("d", path)
    map_svg.selectAll("circle")
        .attr("transform", d=> {
            let c = path.centroid(d)
            if (c[0] == c[0] && c[1] == c[1]) {
                return "translate(" + c + ")" }} )
  }))
    .call(d3.zoom().on('zoom', (event) => {
      if(event.transform.k > 0.3) {
        projection.scale(scale * event.transform.k)
        path = d3.geoPath().projection(projection)
        map_svg.selectAll("path").attr("d", path)
        map_svg.selectAll("circle")
            .attr("transform", d=> {
                let c = path.centroid(d)
                if (c[0] == c[0] && c[1] == c[1]) {
                    return "translate(" + c + ")" }} )
        globe.attr("r", projection.scale())
      }
      else {
        event.transform.k = 0.3
      }
    }))


function reset() {
    if (!moving) {
        moving = true
        let proportion = 1/10
        let yaw_goal = 0
        let pitch_goal = -45
        const rotate = projection.rotate()
        yaw = rotate[0] % 360
        pitch = rotate[1] % 360

        let id = window.setInterval(()=> {
            yaw -= Math.round(proportion * (yaw-yaw_goal))
            pitch -= Math.round(proportion * (pitch-pitch_goal))
            projection.rotate([yaw, pitch])
            path = d3.geoPath().projection(projection)
            map_svg.selectAll("path").attr("d", path)
            map_svg.selectAll("circle")
                .attr("transform", d=> {
                    let c = path.centroid(d)
                    if (c[0] == c[0] && c[1] == c[1]) {
                        return "translate(" + c + ")" }} )
            if (Math.abs(yaw - yaw_goal) <= 1 && Math.abs(pitch - pitch_goal) <= 1) {
                moving = false
                window.clearInterval(id)
            }
            else if (proportion < 1) {
                proportion *= 1.1
            }
          }, 0)
    }
}





function yaw_rot(direction) {
    if (!moving) {
        moving = true;
        let total = 0;
        const rotate = projection.rotate()
        yaw = rotate[0]
         
        let id = window.setInterval(function() {
            yaw -= Math.round(speed * direction);
            total += Math.round(speed);
            projection.rotate([yaw, rotate[1]]);
            path = d3.geoPath().projection(projection)
            map_svg.selectAll("path").attr("d", path)  
            map_svg.selectAll("circle")
                .attr("transform", d=> {
                    let c = path.centroid(d)
                    if (c[0] == c[0] && c[1] == c[1]) {
                        return "translate(" + c + ")" }} )
            if (total >= 90) { 
                speed = 1; 
                moving = false; 
                window.clearInterval(id); 
            }
            else if (total < 43) {
                speed *= (6/5);
            }
            else if (speed > 1) { speed *= (5/6); };
    } , 0); }
}

