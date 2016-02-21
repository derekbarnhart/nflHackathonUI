

//Collect Data


var positionData = Q.promise(function(resolve,reject){
  d3.csv( window.ctx.csvPath )
      .row(function(d) {


        d.circle1_r = +d.circle1_r;
        d.circle1_x = +d.circle1_x;
        d.circle1_y = +d.circle1_y;
        d.circle2_r = +d.circle2_r;
        d.circle2_x = +d.circle2_x;
        d.circle2_y = +d.circle2_y;

        d.dis = parseFloat(d.dis);
        d.gameId = +d.gameId;
        d.gsisPlayId = +d.gsisPlayId;
        d.jerseyNumber = +d.jerseyNumber;

        var bin = parseFloat(d.millisecs_since_epoch)*100;
        //bin - bin %10
        d.millisecs_since_epoch = bin - (bin % 10);
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

        var playerPosition = d3.nest()
        //.key(function(d){ return d.gameId; }) //Game
        //.key(function(d){ return d.ngsPlayId; }) //

          .key(function(d){ return d.nflId; })
          .key(function(d){ return d.millisecs_since_epoch })
          .entries(rows);

        var playerHeat = d3.nest()
          .key(function(d){ return d.team; })
          .key(function(d){ return d.millisecs_since_epoch })
          .entries(rows);

          resolve([playerPosition,playerHeat])
      });
})

var coverageData = Q.promise(function(resolve,reject){

  d3.csv( window.ctx.csvPathCoverage )
      .row(function(d) {

  

        d.away_cover_px= +d.away_cover_px;
        d.coverage= parseFloat(d.coverage);
        d.coverage_smooth = (d.coverage_smooth === "NA") ? 0: parseFloat(d.coverage_smooth)


        var bin = parseFloat(d.millisecs_since_epoch)*100;
        //bin - bin %10
        d.millisecs_since_epoch = bin - (bin % 10);

        return d;
      })
      .get(function(error, rows) {

        var playerPosition = d3.nest()
        //.key(function(d){ return d.gameId; }) //Game
        //.key(function(d){ return d.ngsPlayId; }) //

          .key(function(d){ return d.nflId; })
          .key(function(d){ return d.millisecs_since_epoch })
          .entries(rows);

          resolve(playerPosition);
      });

    });



Q.all([ positionData,coverageData])
.then(function(payload){

    app( payload[0][0], payload[0][1], payload[1])
})


function app(data, heatmapData){




  var margin = {top: 20, right: 50, bottom: 30, left: 50},

      width = parseInt(d3.select('#field').style('width'),10) - margin.left - margin.right;
      var fieldRatio = 53.3/120;
      height = parseInt(fieldRatio*width);

      $('.heatmapContainer')
        .width(width)
        .height(height)
        .css({ top:margin.top,left:margin.left })


  var divHeight = d3.select('#field').style('height', height + margin.top + margin.bottom);


  var xScale = d3.scale.linear()
      .domain([0, 120 ])
      .range([0, width]);

  var yScale = d3.scale.linear()
      .domain([0, 53.3 ])
      .range([height, 0]);

  var homeFrames = buildHeatmapFrames( heatmapData[0].values);
  var awayFrames = buildHeatmapFrames( heatmapData[1].values);


  function buildHeatmapFrames(timeBins){
      // var newTimeBins = _.sortBy(timeBins,'millisecs_since_epoch');


    return timeBins.map(function(timeBin){
        var players = timeBin.values;
        return players.reduce(function( frame, player){
          var heatFootprint = [
              {
                x: Math.round(xScale(player.circle1_x),0),
                y: Math.round(yScale(player.circle1_y),0),
                radius: Math.round(xScale(player.circle1_r),0),
                value: Math.round(xScale(player.circle1_r),0)
              },
              {
                x: Math.round(xScale(player.circle2_x),0),
                y: Math.round(yScale(player.circle2_y),0),
                radius: Math.round(xScale(player.circle2_r),0),
                value: Math.round(xScale(player.circle2_r),0)
              }
          ];
          return frame.concat(heatFootprint);
        },[])
    })
  }

  var xAxisBottom = d3.svg.axis()
      .scale(xScale)
      .orient("bottom")
      .innerTickSize(-height)
      .outerTickSize(0)
      .tickPadding(10)
      .tickFormat(function(d) {
              if(d=== 0 || d== 120) return '';
              d = d-10
              if(d <50){
                return d;
              } else {

                return 100 - d
              }

              return d; });;

  var xAxisTop = d3.svg.axis()
          .scale(xScale)
          .orient("top")
          .innerTickSize(-height)
          .outerTickSize(0)
          .tickFormat(function(d) {
            if(d=== 0 || d==120) return '';
            d = d-10
            if(d <50){
              return d;
            } else {

              return 100 - d
            }

            return d; })
          .tickPadding(10);

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .orient("left")
      .innerTickSize(-width)
      .outerTickSize(0)
      .tickPadding(10)


  var line = d3.svg.line()
      .x(function(d) { return xScale(d.x); })
      .y(function(d) { return yScale(d.y); });

  var svg = d3.select("body")
    .append("svg")
      .attr("class","field")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxisBottom)

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + 0 + ")")
            .call(xAxisTop)


    var playersData = data;
    var maxTime = 0;

    var players = playersData.map(function(playerDat){
      var player = _.clone(playerDat.values[0].values[0]);
      _.extend(player,playerDat);
    //  var values = _.sortBy(playerDat.values,'millisecs_since_epoch');
      var playerMarker = svg.append("circle");


      var color = player.team == "HOME" ? 'rgba(0,255,0,.5)' : 'rgba(255,0,0,.5)';
      playerMarker.attr("r", xScale(0.5))
        .style("fill",color)
        .attr("transform", "translate(" + xScale(data[0].values[0].values[0].x) + ","+ yScale(data[0].values[0].values[0].y)  +")" );


      // var path = svg.append("path")
      //     .data([values])
      //     .attr("class", "line")
      //     .attr("d", line);

      player.marker = playerMarker;
      //player.path = path;

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
    //
    // players.forEach(function(player){
    //   transition(player);
    // })
initHeatmaps( width, height, homeFrames, awayFrames, players);
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

    function initHeatmaps(width, height, homeFrames, awayFrames, players ){
      // minimal heatmap instance configuration
      var heatmapInstance1 = h337.create({
        // only container is required, the rest will be defaults
        container: document.querySelector('.heatmap1'),
        gradient: {
            // enter n keys between 0 and 1 here
            // for gradient color customization
            '1': 'red',
            '0':'red'
            // '.8': 'red',
            // '.95': 'white'
          },
          //radius: 40,
          blur: 1,
          // the maximum opacity (the value with the highest intensity will have it)
          maxOpacity: .8,
          // minimum opacity. any value > 0 will produce
          // no transparent gradient transition
          minOpacity: .3

      });

      var heatmapInstance2 = h337.create({
        // only container is required, the rest will be defaults
        container: document.querySelector('.heatmap2'),
        gradient: {
            // enter n keys between 0 and 1 here
            // for gradient color customization
            '1': 'green',
            '0': 'green',
            // '.8': 'red',
            // '.95': 'white'
          },
          //radius: 40,
          blur: 1,
          // the maximum opacity (the value with the highest intensity will have it)
          maxOpacity: .8,
          // minimum opacity. any value > 0 will produce
          // no transparent gradient transition
          minOpacity: .3

      });


      function createData(){
        // now generate some random data
        var points = [];
        var max = 100;
        //var width = width;
        //var height = height;
        var len = 200;

        while (len--) {
          var val = Math.floor(Math.random()*100);
          max = Math.max(max, val);
          var point = {
            x: Math.floor(Math.random()*width),
            y: Math.floor(Math.random()*height),
            value: val
          };
          points.push(point);
        }
        // heatmap data format
        var data = {
        //  max: max,
          data: points
        };
        return data;
      }


      var max = homeFrames.length > awayFrames.length ? homeFrames.length : awayFrames.length;
      var currentFrame = 0;


      var startTime = new Date().getTime();
      var totalTime = max * 100;


      hash = {};

      setInterval(function(){

        var curTime = new Date().getTime();

        var diff = curTime - startTime;
        var refTime = diff % totalTime;
        currentFrame = Math.floor(refTime/100);

        players.map(function(player){
          var frmData = player.values[currentFrame].values[0];
          player.marker.transition()
            .duration(100)
            .attrTween("transform", function(){
              return function(){
                return "translate(" + xScale(frmData.x) + "," + yScale(frmData.y) + ")"
              }
            })
        })

        // player.marker.transition()
        //   .duration(maxTime)
        //   .attrTween("transform", translateAlong(player.path.node()))

        var offensiveData = {
          data: getFrame(homeFrames,currentFrame)
        };
        var defensiveData = {
          data: getFrame(awayFrames,currentFrame)
        };
        heatmapInstance2.setData(offensiveData);
        heatmapInstance1.setData(defensiveData);

        if(!_.has(hash,currentFrame)){
          console.log(currentFrame)

          hash[currentFrame]={
            frame: currentFrame,
            offensive:heatmapInstance2.getDataURL(),
            defensive:heatmapInstance1.getDataURL()
          };
          if(_.keys(hash).length == homeFrames.length){
            console.log(hash)
          }
        }


        // currentFrame++;
        //
        // if(currentFrame === max){
        //   currentFrame = 0;
        // }

      }, 100);

      function getFrame(data,idx){
        if(idx >= data.length){
          return [];
        }
        return data[idx];
      }


      // if you have a set of datapoints always use setData instead of addData
      // for data initialization

    }


}
function download(text, name, type) {
  var a = document.getElementById("save");
  var file = new Blob([text], {type: type});
  a.href = URL.createObjectURL(file);
  a.download = name;
}
$( "#save" ).click(function( event ) {

  download(JSON.stringify(_.values(hash)),'heatmapImages.json','text/plain')

    //this.href = 'data:plain/text,' + JSON.stringify(hash)
});
