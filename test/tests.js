var expect = require('expect.js');
var request = require('supertest');


describe('test routes', function() {

    var server;
    beforeEach(function() {
        server = require('../app.js');
    });
    afterEach(function() {
        server.close();
    });


    it('GET / returns list of routes', function testBase(done) {
        var routes = request(server)
            .get('/')
            .expect(200, function() {
                // console.log('Response:\n' + this.response.res.text);
                done();
            });

    });

    it('GET /users returns list of routes', function testListUsers(done) {
        var routes = request(server)
            .get('/')
            .expect(200, function() {
                // console.log('Response:\n' + this.response.res.text);
                done();
            });

    });
});
