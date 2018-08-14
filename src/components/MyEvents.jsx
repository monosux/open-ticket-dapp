import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';

import Loading from './Loading';
import Event from './Event';

class MyEvents extends Component {
    constructor(props, context) {
        super(props);
		this.contracts = context.drizzle.contracts;
		this.events = this.contracts['OpenEvents'].methods.eventsOf.cacheCall(this.props.accounts[0]);
		this.perPage = 6;
	}

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].eventsOf[this.events] !== 'undefined') {
			let events = this.props.contracts['OpenEvents'].eventsOf[this.events].value;

			if (events.length === 0) {
				body =
					<div>
						You do not have any event.
						<Link to="/createevent">Create new event</Link>.
					</div>
				;
			} else {
				let count = this.props.contracts['OpenEvents'].eventsOf[this.events].value.length;

				let currentPage = Number(this.props.match.params.page);
				if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

				let end = currentPage * this.perPage;
				let start = end - this.perPage;
				if (end > count) end = count;
				let pages = Math.ceil(count / this.perPage);

				let events = [];

				for (let i = start; i < end; i++) {
					let event = parseInt(this.props.contracts['OpenEvents'].eventsOf[this.events].value[i], 10);
					events.push(<Event key={event} id={event} />);
				}

				let pagination;

				if (pages > 1) {
					let links = [];
					for (let i = 1; i <= pages; i++) {
						let active = i === currentPage ? 'active' : '';
						links.push(
							<li className={"page-item " + active} key={i}>
								<Link to={"/myevents/" + i} className="page-link">{i}</Link>
							</li>
						);
					}

					pagination =
						<nav>
							<ul className="pagination justify-content-center">
								{links}
							</ul>
						</nav>
					;
				}

				body =
					<div>
						<div className="row user-list mt-4">
							{events}
						</div>
						{pagination}
					</div>
				;
			}
		}

		return (
			<div>
				<h2>My events</h2>
				<hr />
				{body}
			</div>
		);
	}
}

MyEvents.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(MyEvents, mapStateToProps);
export default AppContainer;
