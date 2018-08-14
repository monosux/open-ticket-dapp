import React from 'react';

function LoadingApp() {
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">We are loading our app!</h3>
			<p className="emoji"><span role="img" aria-label="hourglass">⌛</span></p>
			<p>Please be sure that your browser connected to the Ethereum and you selected <b>Rinkeby Network</b>.</p>
		</div>
	);
}

export default LoadingApp;
