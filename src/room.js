'use strict';

const User = require('./user');

class Room {
	constructor(name) {
		this.name = name;
		this.users = [];
		this.audioConstraints; {true;}
	}

	addUser(client) {
		const user = new User(client);
		this.users.push(user);
	}

	removeUser(id) {
		this.users = this.users.filter(item => item.client.userID != id);
		this.users.forEach(user => {
			user.client.emit('leave', id);
		});
	}

	hasUser(id) {
		return this.users.find(item => item.client.userID == id);
	}

	sendUserList(client) {
		this.users.forEach(user => {
			if (user !== client) {
				client.client.emit('call', user.client.userID);
			}
		});
	}

	getActiveUsers() {
		const users = this.users.map(item => {
			if (item.active) {
				return {
					userID: item.client.userID,
					name: item.name
				};
			}
		});
		return users;
	}

	sendMessage(client, message) {
		this.users.forEach(user => {
			user.client.emit('message', {
				userID: client.userID,
				name: client.name,
				message
			});
		});
	}

	getAudioConstraints(constraints) {
		return this.audioConstraints;
	}

	setAudioConstraints(constraints) {
		this.audioConstraints = constraints;
	}
}

module.exports = Room;
