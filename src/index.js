'use strict';

const fs = require('fs');
const path = require('path');
const {PeerServer} = require('../peerjs-server');
const express = require('express');
const Room = require('./room');
const User = require('./user');
const io = require('socket.io');
const {uniqueNamesGenerator} = require('unique-names-generator');
const Config = require('../config/config.json');

const rooms = {};
let activeIDs = [];
const app = express();

app.use(express.static(path.join(__dirname, Config.appDirectory)));

app.use((req, res) => {
	res.status(200)
		.sendFile(path.join(__dirname, Config.appDirectory, 'index.html'));
});

const server = app.listen(Config.port);
const peerConfig = {
	port: Config.peerServerPort,
	path: '/voice'
}
if (Config.ssl && Config.ssl.crt && Config.ssl.key) {
	peerConfig.ssl = {
		key: fs.readFileSync('/etc/caddy/.caddy/acme/acme-v01.api.letsencrypt.org/sites/himawari.ml/himawari.ml.key'),
		cert: fs.readFileSync('/etc/caddy/.caddy/acme/acme-v01.api.letsencrypt.org/sites/himawari.ml/himawari.ml.crt')
	}
}
const peerServer = PeerServer(peerConfig);
peerServer.on('connection', id => {
	const roomKeys = Object.keys(rooms);
	roomKeys.forEach(roomKey => {
		if (rooms[roomKey].hasUser(id)) {
			rooms[roomKey].hasUser(id).active = true;
		}
	});
	activeIDs.push(id);
});
peerServer.on('disconnect', id => {
	const roomKeys = Object.keys(rooms);
	roomKeys.forEach(roomKey => {
		if (rooms[roomKey].hasUser(id)) {
			rooms[roomKey].hasUser(id).active = false;
			rooms[roomKey].removeUser(id);
		}
	});
	activeIDs = activeIDs.filter(item => item !== id);
});

const ws = io(server);

ws.on('connection', client => {
	client.on('join', data => {
		client.userID = data.userID;
		client.roomID = data.roomID;
		if (data.name) {
			client.name = data.name;
		} else {
			client.name = uniqueNamesGenerator();
		}

		if (rooms[data.roomID]) {
			joinRoom(data.roomID, client);
		} else {
			createRoom(data.roomID, client);
		}
	});
	client.on('message', message => {
		sendRoomMessage(client, message);
	});
	client.on('audioConstraints', data => {
		setAudioConstraints(client, data);
	});
	client.on('disconnect', () => {
		leaveRoom(client);
	});
});

const joinRoom = (roomID, client) => {
	rooms[roomID].addUser(client);
	client.emit('join', {
		users: rooms[roomID].getActiveUsers(),
		name: client.name,
		created: false,
		constraints: rooms[roomID].getAudioConstraints()
	});
};

const createRoom = (roomID, client) => {
	rooms[roomID] = new Room(roomID);
	rooms[roomID].addUser(client);
	client.emit('join', {
		name: client.name,
		created: true
	});
};

const leaveRoom = client => {
	if (!client.roomID) {
		return;
	}

	if (!rooms[client.roomID]) {
		return;
	}

	rooms[client.roomID].removeUser(client.userID);
	if (rooms[client.roomID].getActiveUsers().length == 0) {
		delete rooms[client.roomID];
	}
};

const sendRoomMessage = (client, message) => {
	if (!client.roomID) {
		return;
	}

	if (!rooms[client.roomID]) {
		return;
	}

	rooms[client.roomID].sendMessage(client, message);
};

const setAudioConstraints = (client, constraints) => {
	if (!client.roomID) {
		return;
	}

	if (!rooms[client.roomID]) {
		return;
	}

	if (rooms[client.roomID].getActiveUsers().length > 1) {
		sendRoomMessage(client, `${client.name} tried to change room audio constraints while users are already in a conference. Audio settings can only be set on an empty room.`);
		return;
	}

	rooms[client.roomID].setAudioConstraints(constraints);
};

// this is nasty I know, but there seems to be an error in the PeerJS Server that I have yet to fork and fix. As far as I've tested, this works fine. Alternatively, you could be the hero of this story!
process.on('uncaughtException', e => {
	console.error('Error: ' + e);
});
