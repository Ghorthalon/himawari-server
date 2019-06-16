const chai = require('chai');
const Room = require('../src/room');
const User = require('../src/user');
const sinon = require('sinon');

const { expect } = chai;
let room = null;

describe('A room', function() {
    describe('when empty', function() {
        beforeEach(function() {
            room = new Room("test");
        })
        it('should take on given name', function() {
            expect(room).to.be.instanceOf(Room);
            expect(room.name).to.equal('test');
        })
        it('should not have any users', function() {
            expect(room.users).to.be.instanceOf(Array);
            expect(room.users.length).to.equal(0);
        })
        it('should accept a new user', function() {
            room.addUser({
                id: "abc123",
                "name": "test"
            })
            expect(room.users.length).to.equal(1);
            expect(room.users[0]).to.be.instanceOf(User);
        })
    })
    describe('With a user', function() {
        beforeEach(function() {
            let user = {
                name: "test",
                id: "abc123"
            }
            room = new Room("test");
            room.addUser(user);
            room.users[0].client.emit = sinon.spy();
        })
        it('should not be empty', function() {
            expect(room.users.length).to.be.ok;
        })
        it('should find that user by its ID', function() {
            expect(room.hasUser("abc123")).to.be.ok;
        })
        it('should be able to remove a user by its ID', function() {
            room.removeUser("abc123");
            expect(room.users.length).to.equal(0);
        })

        describe('and another user joins', function() {
            this.beforeEach(function() {
                const anotherUser = {
                    name: "test2",
                    id: "def456"
                }
                room.addUser(anotherUser);
                room.users[1].client.emit = sinon.spy();
            })
            it('should now have two users', function() {
                expect(room.users.length).to.equal(2);
            })
            it('should get all active users', function() {
                const users = room.getActiveUsers();
                expect(users.length).to.equal(2);
            })
        })
    })
})