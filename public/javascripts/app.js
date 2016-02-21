

//Collect Data
d3.csv("sample_play.csv")
    .row(function(d) {

      d.dis = parseFloat(d.dis);
      d.gameId = +d.gameId;
      d.gsisPlayId = +d.gsisPlayId;
      d.jerseyNumber = +d.jerseyNumber;
      d.millisecs_since_epoch = parseFloat(d.millisecs_since_epoch);
      d.nflId = +d.nflId;
      d.ngsPlayId = +d.ngsPlayId;
      d.s = parseFloat(d.s);
      d.time = new Date(d.time);
      d.weight = +d.weight;
      d.x = +d.x;
      d.y = +d.y;

      return d;
    })
    .get(function(error, rows) {

      var data = d3.nest()
        .key(function(d){ return d.gameId; }) //Game
        .key(function(d){ return d.ngsPlayId; }) //
        .key(function(d){ return d.nflId; })
        .entries(rows);

      app(data)
    });




function app(data){

  var margin = {top: 20, right: 50, bottom: 30, left: 50},

      width = parseInt(d3.select('#field').style('width'),10) - margin.left - margin.right;
      var fieldRatio = 53.3/120;


      height = parseInt(fieldRatio*width);


  var divHeight = d3.select('#field').style('height', height + margin.top + margin.bottom);



  var xScale = d3.scale.linear()
      .domain([0, 120 ])
      .range([0, width]);

  var yScale = d3.scale.linear()
      .domain([0, 53.3 ])
      .range([height, 0]);

  var xAxisBottom = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10);

  var xAxisTop = d3.svg.axis()
          .scale(xScale)
          .orient("top")
          .innerTickSize(-height)
          .outerTickSize(0)
          .tickPadding(10);

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10);

  var line = d3.svg.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });

  var svg = d3.select("body")
    .append("svg")
      .attr("class","field")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("background","green")
      .style("fill","green")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisBottom)

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + 0 + ")")
            .call(xAxisTop)




    var playersData = data[0].values[0].values;
    var maxTime = 0;

    var players = playersData.map(function(playerDat){
      var player = _.clone(playerDat.values[0]);

      if( playerDat.values.length > maxTime ){
        maxTime = playerDat.values.length;
      }
      var values = _.sortBy(playerDat.values,'millisecs_since_epoch');
      var playerMarker = svg.append("circle");

    

      playerMarker.attr("r", xScale(1))
        .style("fill",'red')
        .attr("transform", "translate(" + xScale(values[0].x) + ","+ yScale(values[0].y)  +")" );

      var path = svg.append("path")
          .data([values])
          .attr("class", "line")
          .attr("d", line);

      player.marker = playerMarker;
      player.path = path;

      return player;
    });

    maxTime = maxTime * 100;

    // var dataset = _(data[0].values[0].values[0].values)
    //                         .sortBy('millisecs_since_epoch')
    //                         .value();
    // var marker = svg.append("circle");
    //     marker.attr("r", xScale(1))
    //       .attr("transform", "translate(" + xScale(dataset[0].x) + ","+ yScale(dataset[0].y)  +")" );
    //
    //
    // var path = svg.append("path")
    //     .data([dataset])
    //     .attr("class", "line")
    //     .attr("d", line);

    players.forEach(function(player){
      transition(player);
    })

    function translateAlong(path) {
      var l = path.getTotalLength();
      return function(i) {
        return function(t) {
          var p = path.getPointAtLength(t * l);
          return "translate(" + p.x + "," + p.y + ")";//Move marker
        }
      }
    }

    function transition(player){
      player.marker.transition()
        .duration(maxTime)
        .attrTween("transform", translateAlong(player.path.node()))
    }

}
