import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Loading from './Loading';
import Event from './Event';

class FindEvents extends Component {
    constructor(props, context) {
        super(props);
		this.contracts = context.drizzle.contracts;
		this.eventCount = this.contracts['OpenEvents'].methods.getEventsCount.cacheCall();
		this.perPage = 6;
	}

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].getEventsCount[this.eventCount] !== 'undefined') {
			let count = Number(this.props.contracts['OpenEvents'].getEventsCount[this.eventCount].value);
			if (count === 0) {
				body = <p className="text-center"><span role="img" aria-label="thinking">🤔</span>No events found</p>;
			} else {
				let currentPage = Number(this.props.match.params.page);
				if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

				let end = currentPage * this.perPage;
				let start = end - this.perPage;
				if (end > count) end = count;
				let pages = Math.ceil(count / this.perPage);

				let events_list = [];

				for (let i = start; i < end; i++) {
					events_list.push(<Event key={i} id={i} />);
				}

				let pagination = '';
				if (pages > 1) {
					let links = [];

					for (let i = 1; i <= pages; i++) {
						let active = i === currentPage ? 'active' : '';
						links.push(
							<li className={"page-item " + active} key={i}>
								<Link to={"/findevents/" + i} className="page-link">{i}</Link>
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
							{events_list}
						</div>
						{pagination}
					</div>
				;
			}
		}

		return(
			<div>
				<h2>All events</h2>
				<hr />
				{body}
			</div>
		);
	}
}

FindEvents.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(FindEvents, mapStateToProps);
export default AppContainer;
