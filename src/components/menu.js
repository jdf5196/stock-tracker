import React from 'react';
import Stock from './stock.js';

class Menu extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			input: '',
			appear: false
		}
		this.change = this.change.bind(this);
		this.stockRender = this.stockRender.bind(this);
	}
	change(e){
		this.setState({input: e.target.value.toUpperCase()});
	}
	call(text){
		let data = {text: text, type: 'call'};
		this.props.ws.send(JSON.stringify(data));
		this.setState({input: ''})
	}
	stockRender(){
		if(this.props.data.length > 0){
			return(
				<div className='stocks'>
    				{this.props.data[0].Elements.map((element)=>{
    					return (
    						<Stock key={this.props.data[0].Elements.indexOf(element)} stock={element} data={element.DataSeries} delete={this.delete.bind(this)} />
    					)
    				})}
    			</div>
			)
		}
	}
	delete(stock){
		if(this.props.data[0].Elements.length < 2){
			return;
		}else{
			let data = {type: 'delete', data: stock.Symbol, index: this.props.data[0].Elements.indexOf(stock)};
			this.props.ws.send(JSON.stringify(data));
		}
	}
	appear(){
		if(this.state.appear == false){
			let m = document.getElementById('menu');
			let p = document.getElementById('page-wrap');
			let menubars = document.getElementsByClassName('menuBar');
			for(let i in menubars){
				if(menubars[i].classList){
					menubars[i].classList.add('x')
				}
			}
			p.classList.remove('full');
			p.classList.add('small');
			m.classList.remove('disappear');
			m.classList.add('appear')
			this.setState({appear: true})
		}else{
			let m = document.getElementById('menu');
			let p = document.getElementById('page-wrap');
			let menubars = document.getElementsByClassName('menuBar');
			for(let i in menubars){
				if(menubars[i].classList){
					menubars[i].classList.remove('x')
				}
			}
			p.classList.remove('small');
			p.classList.add('full');
			m.classList.remove('appear');
			m.classList.add('disappear')
			this.setState({appear: false})
		}
	}
	hover(){
		let elements = document.getElementsByClassName('menuBar');
		console.log(elements);
		for(let i in elements){
			if(elements[i].style){
				elements[i].style.opacity = 0.6;
			}
		}
	}
	unHover(){
		let elements = document.getElementsByClassName('menuBar');
		for(let i in elements){
			if(elements[i].style){
				elements[i].style.opacity = 1;
			}
		}
	}
	render(){
		return(
			<div>
			<div onMouseOver={this.hover.bind(this)} onMouseOut={this.unHover.bind(this)} onClick={this.appear.bind(this)} className='menuButton' id='menuButton'>
				<span className='menuBar top' />
				<span className='menuBar middle' />
				<span className='menuBar bottom' />
			</div>
			<div id='menu' className='menu disappear'>
				<h2>Menu</h2>
				<p>{this.props.message}</p>
				<input value={this.state.input} type='text' ref='input' id='text' onChange={this.change}/>
				<button onClick={this.call.bind(this, this.state.input.toUpperCase())} type='submit'>Find Stock</button>
				<br />
				<div className='time-div'>
    				<button onClick={this.props.time.bind(this, "1Yr")} className='btn'>1Yr</button>
    				<button onClick={this.props.time.bind(this, "YTD")} className='btn'>YTD</button>
    				<button onClick={this.props.time.bind(this, "6M")} className='btn'>6M</button>
    				<button onClick={this.props.time.bind(this, "3M")} className='btn'>3M</button>
    				<button onClick={this.props.time.bind(this, "1M")} className='btn'>1M</button>
    			</div>
    			<br />
    			<div className='type-div'>
    				<button id='percent' onClick={this.props.type.bind(this, "%")} className='btn'>%</button>
    				<button id='dollar' onClick={this.props.type.bind(this, "$")} className='btn'>$</button>
    			</div>
    			{this.stockRender()}	
			</div>
			</div>
		)
	}
}

export default Menu;
