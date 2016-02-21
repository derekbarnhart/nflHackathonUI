var margin = {top: 20, right: 20, bottom: 10, left: 10},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
  .range([0, width]);

var y = d3.scale.linear()
  .range([height, 0]);

var color = d3.scale.linear()
  .domain([95, 115, 135, 155, 175, 195])
  .range(["#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff"]);

var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .ticks(20);

var yAxis = d3.svg.axis()
  .scale(y)
  .orient("left");

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("readme-heatmap.json", function(error, heatmap) {
if (error) throw error;

var dx = heatmap[0].length,
    dy = heatmap.length;

x.domain([0, dx]);
y.domain([0, dy]);

svg.selectAll(".isoline")
    .data(color.domain().map(isoline))
  .enter().append("path")
    .datum(function(d) { return d3.geom.contour(d).map(transform); })
    .attr("class", "isoline")
    .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
    .style("fill", function(d, i) { return color.range()[i]; });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

function isoline(min) {
  return function(x, y) {
    return x >= 0 && y >= 0 && x < dx && y < dy && heatmap[y][x] >= min;
  };
}

function transform(point) {
  return [point[0] * width / dx, point[1] * height / dy];
}
});
