const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeStatus = require('../../lib');

describe('makeStatus(schema, options)', function () {

  var ASSETS;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;
      });
  });

  afterEach(function () {
    return aux.teardown(ASSETS);
  });

  it('should require the first argument to be instanceof mongoose.Schema', function () {

    var fakeSchema = {};

    assert.throws(function () {

      makeStatus(fakeSchema, {
        prefix: 'billing',
        statuses: ['enabled', 'disabled']
      });

    });
  });

  it('should require options.statuses', function () {

    var schema = new mongoose.Schema({});

    assert.throws(function () {
      makeStatus(schema, undefined);
    });

    assert.throws(function () {
      makeStatus(schema, {
        statuses: undefined
      });
    });
  });

  it('should throw error upon schema property conflict', function () {
    assert.throws(function () {
      var schema = new mongoose.Schema({
        // status is the default property
        status: String,
      });

      makeStatus(schema, { statuses: ['status1', 'status2'] });
    });

    assert.throws(function () {
      var schema = new mongoose.Schema({
        prefixedStatus: String,
      });

      makeStatus(schema, {
        prefix: 'prefixed',
        statuses: ['status1', 'status2']
      });
    });

  });
});