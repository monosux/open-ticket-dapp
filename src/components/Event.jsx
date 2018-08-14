import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';

import ipfs from '../utils/ipfs';

import Loading from './Loading';

class Event extends Component {
    constructor(props, context) {
        super(props);
		this.contracts = context.drizzle.contracts;
		this.event = this.contracts['OpenEvents'].methods.getEvent.cacheCall(this.props.id);
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
		if (this.state.loaded === false && this.state.loading === false && typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined') {
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
		if (this.state.ipfs_problem) description = <p className="text-center mb-0 event-description"><span role="img" aria-label="monkey">🙊</span>We can not load description</p>;
		if (this.state.description !== null) {
			let text = this.state.description.length > 100 ? this.state.description.slice(0, 100) + '...' : this.state.description;
			description = <p className="card-text event-description">{text}</p>;
		}
		return description;
	}

	afterApprove = () => {
		if (this.state.waiting_approve) {
			if (typeof this.props.transactionStack[this.state.approve_tx] !== 'undefined') {
				this.setState({
					waiting_approve: false
				}, () => {
					this.contracts['OpenEvents'].methods.buyTicket.cacheSend(this.props.id);
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
			this.contracts['OpenEvents'].methods.buyTicket.cacheSend(this.props.id, {value: this.props.contracts['OpenEvents'].getEvent[this.event].value[2]});
		}
	}

	render() {
		let body = <div className="card"><div className="card-body"><Loading /></div></div>;

		if (typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined') {
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
				<div className="card">
					<img className="card-img-top event-image" src={image} alt={event_data[0]} />
					<div className="card-header text-muted event-header">
						<img className="float-left" src={makeBlockie(event_data[8])} alt={event_data[8]} />
						<p className="small text-truncate mb-0">
							Creator: <a href={"https://rinkeby.etherscan.io/address/" + event_data[8]} target="_blank">
								{event_data[8]}
							</a>
						</p>
					</div>
					<div className="card-body">
						<h5 className="card-title event-title">
							<Link to={"/event/" + this.props.id}>{event_data[0]}</Link>
						</h5>
						{description}
					</div>
					<ul className="list-group list-group-flush">
						<li className="list-group-item">Price: {symbol}{price}</li>
						<li className="list-group-item">{date.toLocaleDateString()} at {date.toLocaleTimeString()}</li>
						<li className="list-group-item">Seats: {event_data[6]}/{max_seats}</li>
					</ul>
					<div className="card-footer text-muted text-center">
						<button className="btn btn-dark" onClick={this.buyTicket} disabled={disabled}><i className="fas fa-ticket-alt"></i> Buy Ticket</button>
						<label className="pl-2 small">{disabledStatus}</label>
					</div>
				</div>
			;
		}

		return (
			<div className="col-lg-4 pb-4 d-flex align-items-stretch">
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

Event.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts,
		transactionStack: state.transactionStack
    };
};

const AppContainer = drizzleConnect(Event, mapStateToProps);
export default AppContainer;
