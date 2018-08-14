import React from 'react';

function NetworkError() {
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">Network Error!</h3>
			<p className="emoji"><span role="img" aria-label="sweat">😓</span></p>
			<p>This browser has no connection to the Ethereum network.</p>
			<p>Be sure that your browser supports connection to the Ethereum network and you selected <b>Rinkeby Network</b>.</p>
		</div>
	);
}

export default NetworkError;
