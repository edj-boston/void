var should = require('should');


describe('AWS credentials', function() {

    it('should throw an error if AWS_ACCESS_KEY_ID is undefined in the environment', function() {
        process.env.AWS_ACCESS_KEY_ID.should.not.equal(undefined);
    });

    it('should throw an error if AWS_SECRET_ACCESS_KEY is undefined in the environment', function() {
        process.env.AWS_SECRET_ACCESS_KEY.should.not.equal(undefined);
    });

    it('should throw an error if DISTRIBUTION_ID is undefined in the environment', function() {
        process.env.DISTRIBUTION_ID.should.not.equal(undefined);
    });

});