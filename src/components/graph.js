import React from 'react';
import d3 from 'd3';


const Graph = (props) =>{
	Graph.destroy = ()=>{
		d3.select('#graph').remove()
		d3.select('.info').remove()
	};
	Graph.remake = ()=>{
		d3.select('#graphDiv').append('div').attr('id', 'graph');
	};

	const data = props.data;
	let array = [];
	for(var i in data){
		for(var j in data[i].values){
			array.push(data[i].values[j].value)
		}
	}
	const range = {
		high: Math.max.apply(Math, array),
		low: Math.min.apply(Math, array),
		start: data[0].values[0].date,
		end: data[0].values[data[0].values.length - 1].date
	};

	const width = 1000, height = 450,
	margins = {
			top: 20, 
			right: 20,
			bottom: 20,
			left: 50,
			padding: 10
	};

	let formatTime = d3.time.format("%m/%d/%y");

	let color = d3.scale.category20();

	let pos;
	let info = d3.select('#graphDiv').insert('div', '#graph').attr('class', 'info').style('opacity', 0).style('z-index', '-100'),
	
	graph = d3.select('#graph').append('div').classed('svg-container', true).append('svg')
		//.attr('width', width + margins.right + margins.left)
		//.attr('height', height + margins.top + margins.bottom)
		.attr('preserveAspectRatio', 'xMinYMin meet')
		.attr('viewBox', '0 0 1051 635')
		.classed('svg-content-responsive', true)
		//.style('padding', '10px')
		.append('g')
		.attr('transform', 'translate('+margins.left+','+margins.top+')'),

	xScale = d3.time.scale.utc()
		.domain([range.start, range.end])
		.range([0, width]),

	yScale = d3.scale.linear()
		.range([height, 0])
		.domain([range.low - 15, range.high + 15]),

	xAxis = d3.svg.axis().orient('bottom').scale(xScale),
	yAxis = d3.svg.axis().orient('left').scale(yScale).tickFormat((d) => {
		if(data[0].values[0].type == 'percent'){
			return parseInt(d, 10) + "%"
		}else if(data[0].values[0].type == 'dollar'){
			return "$" + parseInt(d, 10)
		}
	});
	info.html('<p>10/10/10</p>'+ "PH: 0.00");

	graph.append('g')
		.attr('class', 'xAxis')
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.selectAll('text')
			.style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
			.attr("transform", 'rotate(-65)');
	graph.append('g')
		.call(yAxis)
		.attr('class', 'yAxis')
		.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', 6)
		.attr('dy', '.71em')
		.style('text-anchor', 'end')
		.text((d)=>{
			if(data[0].values[0].type == 'percent'){
				return "Percent Change"
			}else if(data[0].values[0].type == 'dollar'){
				return "Dollar Value"
			}
		});

	let line = d3.svg.line()
		.y((d)=>{
			return yScale(d.value)
		})
		.x((d)=>{
			return xScale(d.date)
		});
	let lines = graph.selectAll('.lines')
		.data(data);

	let linesenter = lines.enter().append("g")
		.attr('class', 'lines')
		.attr('stroke-width', 2)
		.attr('fill', 'none');
	linesenter.append('path')
		.attr('class', 'line')
		.attr('d', d=>{return line(d.values)})
		.attr('stroke', d=>{return color(d.name)})

	let legend = d3.select('#graph').append('ul')
		.attr('class', 'legend')
		.attr('x', width - 65)
		.attr('y', 25)
		.attr('height', 100)
		.attr('width', 100);
	legend.selectAll('g').data(data)
		.enter()
		.append('li')
		.each(function(d, i){
			let div = d3.select(this);
			div.append('div')
			.attr('class', 'legendDiv')
			.attr('x', width - 65)
			.attr("y", i * 25 + 8)
        	.style("width", '10px')
        	.style("height", '10px')
        	.style("background-color", (d)=>{return color(d.name)});
        	div.append('text')
        		.attr("x", width - 50)
        		.attr("y", i * 25 + 8)
        		.attr("height",30)
        		.attr("width",100)
        		.text((d)=>{return d.name});
		})
	let mouse = graph.append('g')
		.attr('class', 'mouse-over');
	mouse.append('path')
		.attr('class', 'mouse-line')
		.attr('stroke', 'black')
		.attr('stroke-width', '1px')
		.style('opacity', '0')
		.attr('margin-left', '50px');
	let graphLines = document.getElementsByClassName('line');
	let text = [];
	let rT =[];
	let textF = (t)=>{
		return t.map(d=>{
			let nT;
			for(var i in data){
				if(data[i].name == d.data.name){
					for(let j in data[i].values){
						if(formatTime(data[i].values[j].date) == formatTime(d.date)){
							nT = data[i].values[j].absoluteValue.toFixed(2);
							rT[i] = data[i].values[j].absoluteValue.toFixed(2);
						}else if(formatTime(data[i].values[j].date) != formatTime(d.date)){
							nT = rT[i]
						}
					}
				}
			}
			return '<b>'+d.data.name+'</b>: '+nT
		})
	}
	let mouseLines = mouse.selectAll('.mouseLines')
		.data(data)
		.enter()
		.append("g")
		.attr('class', 'mouseLines');
	mouseLines.append('circle')
		.attr('r', 4)
		.attr('stroke', (d)=>{return color(d.name)})
		.attr('fill', (d)=>{return color(d.name)})
		.style('stroke-width', '1px')
		.style('opacity', '0');
	mouse.append('rect')
		.attr('width', width)
		.style('margin-left', '50px')
		.attr('height', height)
		.attr('fill', 'none')
		.attr('pointer-events', 'all')
		.on('mousemove', function(){
			let mice = d3.mouse(this);
			d3.select('.mouse-line')
				.attr('d', ()=>{
					let d = "M" + mice[0] + "," + height;
					d+= " " + mice[0] + "," + 0;
					return d;
				});
				text = [];
			d3.selectAll('.mouseLines')
				.attr('transform', function(d, i){
					let xDate = xScale.invert(mice[0]),
						bisect = d3.bisector((d)=>{return d.date;}).right,
						idx = bisect((d.values), xDate);
					let beginning = 0,
						end = graphLines[i].getTotalLength(),
						target = null;
					while(true){
						target = Math.floor((beginning + end) / 2);
						pos = graphLines[i].getPointAtLength(target);
						if((target === end || target === beginning) && pos.x !== mice[0]){
							break
						}
						if(pos.x > mice[0]){end = target;}
						else if(pos.x < mice[0]){beginning = target;}
						else break;
					}
					text.push({
						data: d,
						date: xScale.invert(pos.x)
					});
					return "translate(" + mice[0] + "," + pos.y + ")";
				});
				let newText = textF(text).toString().replace(/,/g, " | ");
				info.html('<p>'+formatTime(text[0].date)+'</p>'+ newText);
		})
		.on('mouseout', ()=>{
			d3.select('.mouse-line')
				.style('opacity', '0');
			d3.selectAll('.mouseLines circle')
				.style('opacity', '0');
			d3.selectAll('.mouseLines text')
				.style('opacity', '0');
			info.style('z-index', '-100').transition()
				.duration(300)
				.style('opacity', '0');
		})
		.on('mouseover', ()=>{
			d3.select('.mouse-line')
				.style('opacity', '1');
			d3.selectAll('.mouseLines circle')
				.style('opacity', '1');
			d3.selectAll('.mouseLines text')
				.style('opacity', '1');
			info.style('z-index', '-100').transition()
				.duration(300)
				.style('opacity', '1');
		});

	return <div id='graph'/>
}

export default Graph;