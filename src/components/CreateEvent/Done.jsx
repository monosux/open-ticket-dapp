import React from 'react';

function Done(props) {
	return (
		<div className="mt-5 text-center">
			<h3 className="mt-5">Done, your event has been created!</h3>
			<p className="emoji"><span role="img" aria-label="sunglasses">😎</span></p>
			<p>After transaction confirmation it will be available for users.</p>
			<code>{props.message}</code>
		</div>
	);
}

export default Done;
