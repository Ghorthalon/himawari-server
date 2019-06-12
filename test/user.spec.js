const User = require('../src/user');
const chai = require('chai');
const { expect } = chai;

let user = null;
describe('A user', function() {
    describe('when given a name', function() {
        beforeEach(function(done) {
            const client = {
                id: "abc123",
                name: "test"
            }
            user = new User(client);
            done();
        })
    
        it('Should be active upon initialization', function() {
            expect(user).to.be.instanceOf(User);
            expect(user.active).to.be.true;
        })
        it('takes on given name', function() {
            expect(user.name).to.equal('test');
        })
        it('takes on given ID', function() {
            expect(user.id).to.equal('abc123');
        })
    });

    describe('not given a name', function() {
        beforeEach(function() {
            user = new User({
                id: "abc123"
            })
        })
        it('should have been given a name by the random name generator', function() {
            expect(user).to.be.instanceOf(User);
            expect(user.name).to.be.ok;
        })
    })
})