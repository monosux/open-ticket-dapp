import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';

class Sidebar extends Component {
	render() {
		let user =
			<div>
				<div className="user-status-icon">
					<i className="fas fa-plug"></i>
				</div>
				<p className="mt-3 small">Ethereum network not connected</p>
			</div>
		;

		if (this.props.connection === true) {
			user =
				<div>
					<div className="user-status-icon">
						<img src={makeBlockie(this.props.account)} alt={this.props.account} />
					</div>
					<p className="mt-3 small text-truncate h-25">Hello, {this.props.account}</p>
				</div>
			;
		}

		return (
			<div id="sidebar-wrapper" className="my-sidebar text-center">
				<div className="user-status mt-5">
					{user}
				</div>
				<div className="menu mt-5">
					<h5>I want to buy tickets</h5>
					<ul className="nav flex-column">
						<li className="nav-item">
							<Link to="/findevents/1" className="nav-link">Find Events</Link>
						</li>
						<li className="nav-item">
							<Link to="/mytickets/1" className="nav-link">My Tickets</Link>
						</li>
					</ul>
					<h5 className="mt-5">I want to create event</h5>
					<ul className="nav flex-column">
						<li className="nav-item">
							<Link to="/createevent" className="nav-link">Create event</Link>
						</li>
						<li className="nav-item">
							<Link to="/myevents/1" className="nav-link">My Events</Link>
						</li>
					</ul>
					<h5 className="mt-5">Tools</h5>
					<ul className="nav flex-column">
						<li className="nav-item">
							<Link to="/token" className="nav-link">Get USD Tokens</Link>
						</li>
					</ul>
				</div>
			</div>
		);
	}
}

export default Sidebar;
