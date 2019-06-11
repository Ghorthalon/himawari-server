'use strict';

const {uniqueNamesGenerator} = require('unique-names-generator');

class User {
	constructor(client) {
		this.id = client.id;
		this.name = client.name || uniqueNamesGenerator();
		this.client = client;
		this.active = true;
	}
}

module.exports = User;
