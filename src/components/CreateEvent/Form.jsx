import React, { Component } from 'react';

import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';

class Form extends Component {
	constructor(props) {
		super(props);

		this.form = {};

		this.state = {
			title: '',
			title_length: 0,
			time: 0,
			currency: 'eth',
			limited: false,
			wrong_file: false,
			file_name: null,
			file: null,
			form_validation: []
		}
	}

	handleDate = (date) => {
		if (typeof date === 'object' && date.isValid()) {
			this.setState({
				time: date.unix()
			});
		}
	}

	handleCurrency = (event) => {
		this.setState({
			currency: event.target.value
		});
	}

	handleLimited = () => {
		this.setState({
			limited: !this.state.limited
		});
	}

	handleFile = (event) => {
		let file = event.target.files[0];
		if (
			file.size > 1024 * 1024 ||
			(file.type !== 'image/jpeg' && file.type !== 'image/png')
		) {
			this.setState({
				wrong_file: true,
				file: null
			});
		} else {
			this.setState({
				wrong_file: false,
				file_name: file.name,
				file: file
			});
		}
	}

	titleChange = (event) => {
		let title = event.target.value;
		if (title.length > 160) {
			title = title.slice(0, 160);
		}
		this.setState({
			title: title,
			title_length: title.length
		});
	}

	handleForm = (event) => {
		event.preventDefault();

		let form_validation = [];
		if (this.state.title === '') form_validation.push('name');
		if (this.form.description.value === '') form_validation.push('description');
		if (this.state.wrong_file === true || this.state.file === null) form_validation.push('image');
		if (this.state.time === 0) form_validation.push('time');
		if (this.form.price.value === '') form_validation.push('price');
		if (this.state.limited === true && this.form.seats.value < 1) form_validation.push('seats');

		this.setState({
			form_validation: form_validation
		});

		if (form_validation.length === 0) {
			this.props.createEvent(
				this.state.title,
				this.form.description.value,
				this.state.file,
				this.state.time,
				this.state.currency,
				this.form.price.value,
				this.state.limited,
				this.form.seats.value
			);
		}
	}

	render() {
		let symbol = this.state.currency === 'eth' ? 'Ξ' : '$';

		let file_label = !this.state.wrong_file && this.state.file_name !== '' ? this.state.file_name : 'Select file';

		let warning = {
			name: this.state.form_validation.indexOf('name') === -1 ? '' : 'is-invalid',
			description: this.state.form_validation.indexOf('description') === -1 ? '' : 'is-invalid',
			image: this.state.form_validation.indexOf('image') === -1 && !this.state.wrong_file ? '' : 'is-invalid',
			time: this.state.form_validation.indexOf('time') === -1 ? '' : 'is-invalid',
			price: this.state.form_validation.indexOf('price') === -1 ? '' : 'is-invalid',
			seats: this.state.form_validation.indexOf('seats') === -1 ? '' : 'is-invalid',
		};

		let alert;

		if (this.state.form_validation.length > 0) {
			alert = <div className="alert alert-dark mt-2" role="alert">Required fields are missed.</div>
		}

		return (
			<form>
				<div className="form-group">
					<label htmlFor="name">Event name:</label>
					<input type="text" className={"form-control " + warning.name} id="name" value={this.state.title} onChange={this.titleChange} />
					<small className="form-text text-muted">{this.state.title_length}/160</small>
				</div>
				<div className="form-group">
					<label htmlFor="description">Event description:</label>
					<textarea className={"form-control " + warning.description} id="description" rows="3" ref={(input) => this.form.description = input}></textarea>
				</div>
				<div className="form-group">
					<p>Event cover image:</p>
					<div className="custom-file">
						<input type="file" className={"custom-file-input " + warning.image} id="customFile" onChange={this.handleFile} />
						<label className="custom-file-label" htmlFor="customFile">{file_label}</label>
					</div>
					<small className="form-text text-muted">Image format: jpg, png. Max file size 1mb.</small>
				</div>
				<div className="form-group">
					<label htmlFor="description">Event date and time:</label>
					<Datetime closeOnSelect={true} onChange={this.handleDate} inputProps={{className : "form-control " + warning.time}} />
				</div>
				<div className="form-group">
					<p>Payment Options:</p>
					<div className="custom-control custom-radio custom-control-inline">
						<input type="radio" id="payment1" name="payment" className="custom-control-input" defaultChecked="true" value="eth" onChange={this.handleCurrency} />
						<label className="custom-control-label" htmlFor="payment1">Ethereum</label>
					</div>
					<div className="custom-control custom-radio custom-control-inline">
						<input type="radio" id="payment2" name="payment" className="custom-control-input" value="usd" onChange={this.handleCurrency} />
						<label className="custom-control-label" htmlFor="payment2">USD (Stable Token)</label>
					</div>
				</div>
				<div className="form-group row">
					<div className="col-lg-3">
						<label htmlFor="price">Ticket Price:</label>
						<div className="input-group mb-3">
							<div className="input-group-prepend">
								<span className="input-group-text">{symbol}</span>
							</div>
							<input type="number" min="0.00000001" className={"form-control " + warning.price} id="price" ref={(input) => this.form.price = input} />
						</div>
					</div>
				</div>
				<div className="form-group">
					<p>Seats Options:</p>
					<div className="custom-control custom-checkbox">
						<input type="checkbox" className="custom-control-input" id="limited" value="true" onChange={this.handleLimited} />
						<label className="custom-control-label" htmlFor="limited">Limited seats</label>
					</div>
					<div className="row mt-3">
						<div className="col-lg-3">
							<label htmlFor="seats">Seats available:</label>
							<input type="number" className={"form-control " + warning.seats} id="seats" disabled={!this.state.limited}  ref={(input) => this.form.seats = input} />
						</div>
					</div>
				</div>
				{alert}
				<button type="submit" className="btn btn-outline-dark" onClick={this.handleForm}>Create an Event</button>
			</form>
		);
	}
}

export default Form;
