import React from 'react';

const Stock = (props)=>{
	return(
		<div className='stock'>
			<span>
				<p>Name: {props.stock.Symbol} | Price: {props.stock.DataSeries.close.values[props.stock.DataSeries.close.values.length - 1]}</p>
					<div className='delete' onClick={props.delete.bind(this, props.stock)}>
						<span className='deleting up' />
						<span className='deleting down' />
					</div>
			</span>
		</div>
	)
}

export default Stock;