const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeStatus = require('../../lib');

describe('makeStatus unprefixed', function () {

  var ASSETS;
  var ResourceModel;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;

        const resourceSchema = new mongoose.Schema({
          testProperty: String
        });

        makeStatus(resourceSchema, {
          statuses: ['enabled', 'disabled']
        });

        ResourceModel = ASSETS.mongooseConnection.model('Resource', resourceSchema);

        ASSETS.ResourceModel = ResourceModel;
      });
  });

  afterEach(function () {
    return aux.teardown(ASSETS);
  });

  describe('setStatus(status, reason, options)', function () {
    it('should modify status', function () {

      var resource = new ResourceModel();

      resource.setStatus('enabled', 'UserRequested');

      resource.get('status.value').should.equal('enabled');
      resource.get('status.reason').should.equal('UserRequested');
      resource.get('status.updatedAt').should.be.instanceof(Date);
    });

    it('should be possible to set the detail property of the status', function () {
      var resource = new ResourceModel();

      resource.setStatus('enabled', 'UserRequested', {
        detail: {
          whatever: 'works',
        }
      });

      resource.get('status.value').should.equal('enabled');
      resource.get('status.reason').should.equal('UserRequested');
      resource.get('status.updatedAt').should.be.instanceof(Date);
      resource.get('status.detail').should.eql({
        whatever: 'works'
      });
    })
  });

  describe('scopeQueryByStatuses(query, statuses)', function () {
    it('should modify the original query to include scoping by statuses', function () {

      var query = {
        tags: ['a', 'b']
      };

      ResourceModel.scopeQueryByStatuses(query, ['enabled', 'disabled']);

      // other query properties should remain untouched
      query.tags.length.should.equal(2);

      query['status.value'].should.eql({
        $in: ['enabled', 'disabled']
      });
    });

    it('should allow to build a query with only one status', function () {

      var query = {
        tags: ['a', 'b']
      };

      ResourceModel.scopeQueryByStatuses(query, 'enabled');

      // other query properties should remain untouched
      query.tags.length.should.equal(2);

      query['status.value'].should.eql({
        $in: ['enabled']
      });
    });

    it('should require the first argument to be the query object to be modified', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByStatuses(undefined, ['enabled']);
      }, TypeError);
    });

    it('should require the second argument to be an array or a string', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByStatuses({}, false);
      }, TypeError);
    });
  });
});