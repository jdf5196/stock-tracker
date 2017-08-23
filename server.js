'use strict';

const mongoose = require('mongoose');
const express = require('express');
const compression = require('compression');
const request = require('request');
const yahoo = require('yahoo-finance');
const db = process.env.MONGODB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/stocks';
mongoose.connect(db);
require('./models/stock.js');
const Stock = mongoose.model('Stock');
const SocketServer = require('ws').Server;
let response = {data: [], type: 'call'};
let yres = {data: [], type: 'call'};
let id = 0;
let lookup = {};
let arr = [];
let initial = false;

const port = process.env.PORT || 5000;
const server = express()
	.use(compression())
	.use(express.static(process.cwd() + '/build'))
	.listen(port, ()=>console.log(`Listening on port ${port}`))

const wss = new SocketServer({ server });

let addYear = (day)=>{
	let result = new Date(day);
	result.setDate(result.getDate() - 365)
	return result;
};

wss.on('connection', (ws)=>{
	ws.id = id++;
	lookup[ws.id] = ws;
	console.log('Client connected. ID: ', ws.id);
	if(initial == false){
		Stock.find((err, stocks)=>{
			if(err){return err};
			if(stocks.length < 1){
				initial = true;
				return
			}
			stocks.map((s)=>{
				arr.push(s.symbol)
			})
			let params = encodeURIComponent(JSON.stringify(getInputParams(arr)));
			let url = `http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=${params}`;
			console.log(url)
			request(url, (err, res, body)=>{
				if(err){
					console.log(err)
				}else{
					initial = true;
					response.data = [body];
					ws.send(JSON.stringify(response));
				}
			});
		});
	}else if(initial == true){
		ws.send(JSON.stringify(response))
	}
	ws.on('message', (msg)=>{
		let newMsg = JSON.parse(msg);
		switch(newMsg.type){
			case 'call':
				let old = false;
				Stock.findOne({symbol: newMsg.text}, (err, stock)=>{
					if(stock){
						lookup[ws.id].send(JSON.stringify({message: 'Stock already in chart.', type: 'error'}))
					}else{
						arr.push(newMsg.text);
						let today = new Date();
						let params = encodeURIComponent(JSON.stringify(getInputParams(arr)));
						let url = `http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=${params}`
						console.log(url)
						request(url, (err, res, body)=>{
							if(err){
								console.log(err)
							}else{
								if(body[0] == '{'){
									let stockData = JSON.parse(body);
									let name = stockData.Elements[stockData.Elements.length - 1].Symbol;
									Stock.findOne({symbol: name}, (err, stock)=>{
										if(stock){
											old = true;
											arr.splice(arr.indexOf(newMsg.text), 1);
											lookup[ws.id].send(JSON.stringify({message: 'Stock already in chart.', type: 'error'}))
										}else{
											let aStock = new Stock();
											aStock.symbol = name;
											aStock.save((err)=>{
												if(err){return err}
											});
											arr.splice(arr.indexOf(newMsg.text), 1, name);
											response.data = [body];
											wss.clients.forEach((client)=>{
												client.send(JSON.stringify(response))
											})
										}
									})
								}else if(old === false){
									arr.splice(arr.indexOf(newMsg.text), 1)
									lookup[ws.id].send(JSON.stringify({message: 'Unable to find stock.', type: 'error'}))
								}
							}
						});
					}
				})
				break;
			case 'delete':
				Stock.findOne({symbol: newMsg.data}, (err, stock)=>{
					if(err){return err};
					stock.remove((err)=>{
						if(err){return err}
					})
				});
				arr.splice(newMsg.index, 1);
				let data = JSON.parse(response.data)
				data.Elements.splice(newMsg.index, 1);
				response.data = JSON.stringify(data);
				wss.clients.forEach((client)=>{
					client.send(JSON.stringify(response))
				})
				break;
			case 'ping':
				lookup[ws.id].send(JSON.stringify({message:'ping', type: 'ping'}))
				break;
		};
	});
	ws.on('close', ()=>{
		console.log('Client disconnected. ID: ', ws.id);
	});
})

let getInputParams = (sym)=>{
	let params = {  
      	Normalized: false,
        NumberOfDays: 365,
        DataPeriod: "Day",
        Elements: []
    };
	sym.map((sy)=>{
		params.Elements.push({
            Symbol: sy,
            Type: "price",
            Params: ["c"]
		})
	});
    return params
};