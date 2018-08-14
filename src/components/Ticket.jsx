import React, { Component } from 'react';
import { drizzleConnect } from 'drizzle-react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import makeBlockie from 'ethereum-blockies-base64';

import ipfs from '../utils/ipfs';

import Loading from './Loading';

class Ticket extends Component {
    constructor(props, context) {
        super(props);
		this.contracts = context.drizzle.contracts;
		this.ticket = this.contracts['OpenEvents'].methods.getTicket.cacheCall(this.props.id);
		this.event = null;
		this.address = null;
		this.state = {
			loading: false,
			loaded: false,
			description: null,
			image: null,
			ipfs_problem: false,
			card_tab: 1,
			wrong_address: false
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

	changeTab = (tab, event) => {
		event.preventDefault();
		this.setState({
			card_tab: tab
		});
	}

	sendTicket = () => {
		if (!this.address.value || !this.context.drizzle.web3.utils.isAddress(this.address.value)) {
			this.setState({wrong_address: true});
		} else {
			this.setState({wrong_address: false});
			this.contracts['OpenEvents'].methods.safeTransferFrom.cacheSend(
				this.props.accounts[0], this.address.value, this.props.id
			);
		}
	}

	updateEvent = () => {
		if (typeof this.props.contracts['OpenEvents'].getTicket[this.ticket] !== 'undefined' && this.event === null) {
			this.event = this.contracts['OpenEvents'].methods.getEvent.cacheCall(this.props.contracts['OpenEvents'].getTicket[this.ticket].value[0]);
		}

		if (this.event !== null) {
			this.updateIPFS();
		}
	}

	render() {
		let body = <div className="card"><div className="card-body"><Loading /></div></div>;

		if (this.event !== null && typeof this.props.contracts['OpenEvents'].getEvent[this.event] !== 'undefined') {
			let ticket_data = this.props.contracts['OpenEvents'].getTicket[this.ticket].value;
			let event_data = this.props.contracts['OpenEvents'].getEvent[this.event].value;

			let card_body;

			if (this.state.card_tab === 1) {
				let image = this.getImage();
				let description = this.getDescription();

				let date = new Date(parseInt(event_data[1], 10) * 1000);

				let timeStatus, timeClass;

				if (date.getTime() < new Date().getTime()) {
					timeStatus = <p className="text-center small"><span role="img" aria-label="alert">⚠️</span> Ticket Expired</p>;
					timeClass = 'text-danger';
				}

				card_body =
					<div>
						<div className="card-body">
							<h4 className={"text-center " + timeClass}>
								<i className="far fa-calendar-alt"></i>
								<span className="pl-2">{date.toLocaleDateString()} at {date.toLocaleTimeString()}</span>
							</h4>
							{timeStatus}
							<h5 className="text-center mb-0">Your seat: {ticket_data[1]}</h5>
						</div>
						<img className="card-img event-image" src={image} alt={event_data[0]} />
						<div className="card-body">
							<h5 className="card-title event-title">
								<Link to={"/event/" + ticket_data[0]}>{event_data[0]}</Link>
							</h5>
							{description}
						</div>
						<div className="card-footer text-muted event-header">
							<img className="float-left" src={makeBlockie(event_data[8])} alt={event_data[8]} />
							<p className="small text-truncate mb-2">
								Creator: <a href={"https://rinkeby.etherscan.io/address/" + event_data[8]} target="_blank">
									{event_data[8]}
								</a>
							</p>
						</div>
					</div>
				;
			} else {
				let warning = this.state.wrong_address ? 'is-invalid' : '';

				card_body =
					<div>
						<div className="card-body">
							<h5 className="text-center">Send Ticket:</h5>
							<div className="form-group">
								<label htmlFor="address">Ethereum address</label>
								<input type="text" className={"form-control " + warning} id="address" ref={(input) => this.address = input} />
							</div>
							<button className="btn btn-dark" onClick={this.sendTicket}><i className="fas fa-share-square"></i> Send Ticket</button>
						</div>
					</div>
				;
			}

			body =
				<div className="card w-100">
					<div className="card-header">
						<ul className="nav nav-tabs card-header-tabs">
							<li className="nav-item">
								<a href="" className={"nav-link " + (this.state.card_tab === 1 ? 'active' : '')} onClick={(e) => this.changeTab(1, e)}>About Event</a>
							</li>
							<li className="nav-item">
								<a href="" className={"nav-link " + (this.state.card_tab === 2 ? 'active' : '')} onClick={(e) => this.changeTab(2, e)}>Manage Ticket</a>
							</li>
						</ul>
					</div>
					{card_body}
				</div>
			;
		}

		return (
			<div className="col-lg-6 pb-4 d-flex align-items-stretch">
				{body}
			</div>
		);
	}

	componentDidUpdate() {
		this.updateEvent();
	}

	componentDidMount() {
		this.updateEvent();
	}

	componentWillUnmount() {
		this.isCancelled = true;
	}
}

Ticket.contextTypes = {
    drizzle: PropTypes.object
}

const mapStateToProps = state => {
    return {
		contracts: state.contracts,
		accounts: state.accounts
    };
};

const AppContainer = drizzleConnect(Ticket, mapStateToProps);
export default AppContainer;
