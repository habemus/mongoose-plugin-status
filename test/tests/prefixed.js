const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeStatus = require('../../lib');

describe('makeStatus prefixed', function () {

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
          prefix: 'billing',
          statuses: ['enabled', 'disabled']
        });

        ResourceModel = ASSETS.mongooseConnection.model('Resource', resourceSchema);

        ASSETS.ResourceModel = ResourceModel;
      });
  });

  afterEach(function () {
    return aux.teardown();
  });

  describe('setBillingStatus(status, reason, options)', function () {
    it('should modify status', function () {

      var resource = new ResourceModel();

      resource.setBillingStatus('enabled', 'UserRequested');

      resource.get('billingStatus.value').should.equal('enabled');
      resource.get('billingStatus.reason').should.equal('UserRequested');
      resource.get('billingStatus.updatedAt').should.be.instanceof(Date);
    });

    it('should be possible to set the detail property of the status', function () {
      var resource = new ResourceModel();

      resource.setBillingStatus('enabled', 'UserRequested', {
        detail: {
          whatever: 'works',
        }
      });

      resource.get('billingStatus.value').should.equal('enabled');
      resource.get('billingStatus.reason').should.equal('UserRequested');
      resource.get('billingStatus.updatedAt').should.be.instanceof(Date);
      resource.get('billingStatus.detail').should.eql({
        whatever: 'works'
      });
    })
  });

  describe('scopeQueryByBillingStatuses(query, statuses)', function () {
    it('should modify the original query to include scoping by statuses', function () {

      var query = {
        tags: ['a', 'b']
      };

      ResourceModel.scopeQueryByBillingStatuses(query, ['enabled', 'disabled']);

      // other query properties should remain untouched
      query.tags.length.should.equal(2);

      query['billingStatus.value'].should.eql({
        $in: ['enabled', 'disabled']
      });
    });

    it('should allow to build a query with only one status', function () {

      var query = {
        tags: ['a', 'b']
      };

      ResourceModel.scopeQueryByBillingStatuses(query, 'enabled');

      // other query properties should remain untouched
      query.tags.length.should.equal(2);

      query['billingStatus.value'].should.eql({
        $in: ['enabled']
      });
    });

    it('should require the first argument to be the query object to be modified', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByBillingStatuses(undefined, ['enabled']);
      }, TypeError);
    });

    it('should require the second argument to be an array or a string', function () {
      assert.throws(function () {
        ResourceModel.scopeQueryByBillingStatuses({}, false);
      }, TypeError);
    });
  });
});