import React from 'react';
import makeBlockie from 'ethereum-blockies-base64';

function Notify(props) {
	return (
		<div className="notify">
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash}>
				<img src={makeBlockie(props.hash)} alt={props.hash} />
			</a>
			<a href={"https://rinkeby.etherscan.io/tx/" + props.hash} title={props.hash}>Transaction</a> sent! <span role="img" aria-labelledby="rocket">🚀</span>
		</div>
	);
}

export default Notify;
