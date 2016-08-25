import React from 'react';
import Graph from './graph.js';
import Menu from './menu.js';

const HOST = location.origin.replace(/^http/, 'ws');
const ws = new WebSocket(HOST);

let addDays = (day)=>{
	let result = new Date(day);
	result.setDate(result.getDate() + 1)
	return result;
};

class Home extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			message: '',
			data: [{Elements: [], dates: []}],
			graphType: '%',
			graphTime: '1yr'
		}
		this.graph = this.graph.bind(this);
	}
	componentDidMount(){
		ws.onmessage = (e)=>{
			let data = JSON.parse(e.data);
			switch(data.type){
				case 'error':
					Graph.destroy();
					Graph.remake();
					this.setState({message: data.message})
					break;
				case 'call':
					Graph.destroy();
					Graph.remake();
					this.setState({data: [JSON.parse(data.data)], message: data.message})
					console.log(this.state.data)
					break;
			}
		}
	}
	call(text){
		let data = {text: text, type: 'call'};
		ws.send(JSON.stringify(data));
	}
	graph(){
		if(this.state.data[0].Elements.length < 1){
			let data = [{name: 'ph', values: [{date: new Date("2015-01-01T00:00:00"), value: 0}]}]
			return (
				<div>
					<Graph data={data} />
				</div>
			)
		}else{
			let data = [];
			let dateArr = [];
			for(let i in this.state.data[0].Dates){
				var d = new Date(this.state.data[0].Dates[i])
				dateArr.push(d.toString().slice(0, 15))
			}
			this.state.data[0].Elements.map((d)=>{
				let arr = [];
				let t = 0;
				switch(this.state.graphTime){
					case '1Yr':
						t = 0;
						break;
					case 'YTD':
						let beginning = new Date('01/01/'+new Date().getFullYear());
						t = dateArr.indexOf(beginning.toString().slice(0, 15));
						while(t == -1){
							beginning = addDays(beginning);
							t = dateArr.indexOf(beginning.toString().slice(0, 15));
						}
						break;
					case '6M':
						let sM = new Date();
						sM.setMonth(sM.getMonth() - 6);
						t = dateArr.indexOf(sM.toString().slice(0, 15));
						while(t == -1){
							sM = addDays(sM);
							t = dateArr.indexOf(sM.toString().slice(0, 15));
						}
						break;
					case '3M':
						let tM = new Date();
						tM.setMonth(tM.getMonth() - 3);
						t = dateArr.indexOf(tM.toString().slice(0, 15));
						while(t == -1){
							tM = addDays(tM);
							t = dateArr.indexOf(tM.toString().slice(0, 15));
						}
						break;
					case '1M':
						let oM = new Date();
						oM.setMonth(oM.getMonth() - 1);
						t = dateArr.indexOf(oM.toString().slice(0, 15));
						while(t == -1){
							oM = addDays(oM);
							t = dateArr.indexOf(oM.toString().slice(0, 15));
						}
						console.log(t)
						break;
				}
				for(let i = t; i< this.state.data[0].Dates.length; i++){
					if(this.state.graphType == '$'){
						let date = new Date(this.state.data[0].Dates[i])
						arr.push({date: new Date(date.setTime( date.getTime() + date.getTimezoneOffset()*60*1000 )), value: d.DataSeries.close.values[i], absoluteValue: d.DataSeries.close.values[i], type: 'dollar'})
					}else if(this.state.graphType == '%'){
						let date = new Date(this.state.data[0].Dates[i])
						arr.push({date: new Date(date.setTime( date.getTime() + date.getTimezoneOffset()*60*1000 )), value: ((d.DataSeries.close.values[i] / d.DataSeries.close.values[t]) * 100)-100, absoluteValue: d.DataSeries.close.values[i], type: 'percent'})
					}
				}
				data.push({name: d.Symbol, values: arr})
				

			});
			return(
				<div>
					<Graph data={data} />
				</div>
			)
		}
	}
	graphType(type){
		Graph.destroy();
		Graph.remake();
		this.setState({graphType: type});
	}
	graphTime(time){
		Graph.destroy();
		Graph.remake();
		this.setState({graphTime: time});
	}
	menuAppear(){

	}
	render(){
		return(
			<div>
				<Menu data={this.state.data} ws={ws} message={this.state.message} time={this.graphTime.bind(this)} type={this.graphType.bind(this)} call={this.call.bind(this)} />
				<div className='center'>
					<div id='page-wrap' className='page-wrap full'>
    					<div className='title'>
    						<p>Stock Market Trend Lines</p>
    					</div>
    					<div id='graphDiv'>
    						{this.graph()}
    					</div>
    				</div>
    			</div>
    			<Footer />
    		</div>
		)
	}
}

export default Home