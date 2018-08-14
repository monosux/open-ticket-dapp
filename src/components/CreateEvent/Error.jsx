import React from 'react';

function Error(props) {
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">Ooops, we have an error!</h3>
			<p className="emoji"><span role="img" aria-label="swearing">🤬</span></p>
			<p>Something went wrong! Reload the page and try again.</p>
			<code>{props.message}</code>
		</div>
	);
}

export default Error;
