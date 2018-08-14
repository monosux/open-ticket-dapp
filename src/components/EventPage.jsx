import React, { Component } from 'react';
import { drizzleConnect } from "drizzle-react";
import PropTypes from 'prop-types';
import makeBlockie from 'ethereum-blockies-base64';

import ipfs from '../utils/ipfs';

import Loading from './Loading';
import CheckUser from './CheckUser';

class EventPage extends Component {
    constructor(props, context) {
        super(props);
		this.contracts = context.drizzle.contracts;
		this.event = this.contracts['OpenEvents'].methods.getEvent.cacheCall(this.props.match.params.id);
		this.state = {
			loading: false,
			loaded: false,
			description: null,
			image: null,
			ipfs_problem: false,
			approve_tx: null,
			waiting_approve: false
		};
		this.isCancelled = false;
	}

	updateIPFS = () => {
		if (
			this.state.loaded === false &&
			this.state.loading === false &&
			typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined' &&
			!this.props.contracts['OpenEvents'].getEvent[this.event].error
		) {
			this.setState({
				loading: true
			}, () => {
				ipfs.get(this.props.contracts['OpenEvents'].getEvent[this.event].value[7]).then((file) => {
					let data = JSON.parse(file[0].content.toString());
					if (!this.isCancelled) {
						this.setState({
							loading: false,
							loaded: true,
							description: data.text,
							image: data.image
						});
					}
				}).catch(() => {
					if (!this.isCancelled) {
						this.setState({
							loading: false,
							loaded: true,
							ipfs_problem: true
						});
					}
				});
			});
		}
	}

	getImage = () => {
		let image = '/images/loading_ipfs.png';
		if (this.state.ipfs_problem) image = '/images/problem_ipfs.png';
		if (this.state.image !== null) image = this.state.image;
		return image;
	}

	getDescription = () => {
		let description = <Loading />;
		if (this.state.ipfs_problem) description = <p><span role="img" aria-label="monkey">🙊</span>We can not load description</p>;
		if (this.state.description !== null) description = <p>{this.state.description}</p>;
		return description;
	}

	afterApprove = () => {
		if (this.state.waiting_approve) {
			if (typeof this.props.transactionStack[this.state.approve_tx] !== 'undefined') {
				this.setState({
					waiting_approve: false
				}, () => {
					this.contracts['OpenEvents'].methods.buyTicket.cacheSend(this.props.match.params.id);
				});
			}
		}
	}

	buyTicket = () => {
		if (this.props.contracts['OpenEvents'].getEvent[this.event].value[3]) {
			let tx = this.contracts['StableToken'].methods.approve.cacheSend(this.contracts['OpenEvents'].address, this.props.contracts['OpenEvents'].getEvent[this.event].value[2]);
			this.setState({
				approve_tx: tx,
				waiting_approve: true
			});
		} else {
			this.contracts['OpenEvents'].methods.buyTicket.cacheSend(this.props.match.params.id, {value: this.props.contracts['OpenEvents'].getEvent[this.event].value[2]});
		}
	}

	render() {
		let body = <Loading />;

		if (typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined') {
			if (this.props.contracts['OpenEvents'].getEvent[this.event].error) {
				body = <div className="text-center mt-5"><span role="img" aria-label="unicorn">🦄</span> Event not found</div>;
			} else {
				let event_data = this.props.contracts['OpenEvents'].getEvent[this.event].value;

				let image = this.getImage();
				let description = this.getDescription();

				let symbol = event_data[3] ? '$' : 'Ξ';
				let price = this.context.drizzle.web3.utils.fromWei(event_data[2]);
				let date = new Date(parseInt(event_data[1], 10) * 1000);

				let max_seats = event_data[4] ? event_data[5] : '∞';

				let disabled = false;
				let disabledStatus;

				if (event_data[4] && (Number(event_data[6]) >= Number(event_data[5]))) {
					disabled = true;
					disabledStatus = <span><span role="img" aria-label="alert">⚠️</span> No more tickets</span>;
				}

				if (date.getTime() < new Date().getTime()) {
					disabled = true;
					disabledStatus = <span><span role="img" aria-label="alert">⚠️</span> Has already ended</span>;
				}

				body =
					<div className="row">
						<div className="col-6">
							<h3>{event_data[0]}</h3>
							{description}
							<div className="mt-5">
								<button className="btn btn-dark" onClick={this.buyTicket} disabled={disabled}><i className="fas fa-ticket-alt"></i> Buy Ticket</button>
								<label className="pl-2 small">{disabledStatus}</label>
							</div>
							<CheckUser event_id={this.props.match.params.id} />
						</div>
						<div className="col-6">
							<div className="card">
								<img className="card-img-top event-image" src={image} alt={event_data[0]} />
								<div className="card-header event-header">
									<img className="float-left" src={makeBlockie(event_data[8])} alt={event_data[8]} />
									<p className="small text-truncate mb-0">
										Creator: <a href={"https://rinkeby.etherscan.io/address/" + event_data[8]} target="_blank">
											{event_data[8]}
										</a>
									</p>
								</div>
								<ul className="list-group list-group-flush">
									<li className="list-group-item">Price: {symbol}{price}</li>
									<li className="list-group-item">{date.toLocaleDateString()} at {date.toLocaleTimeString()}</li>
									<li className="list-group-item">Seats: {event_data[6]}/{max_seats}</li>
								</ul>
							</div>
						</div>
					</div>
				;
			}
		}

		return (
			<div>
				<h2>Event</h2>
				<hr />
				{body}
			</div>
		);
	}

	componentDidMount() {
		this.updateIPFS();
	}

	componentDidUpdate() {
		this.updateIPFS();
		this.afterApprove();
	}

	componentWillUnmount() {
		this.isCancelled = true;
	}
}

EventPage.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts,
		transactionStack: state.transactionStack
    };
};

const AppContainer = drizzleConnect(EventPage, mapStateToProps);
export default AppContainer;
