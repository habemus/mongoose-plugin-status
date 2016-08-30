const assert = require('assert');

// third-party dependencies
const should   = require('should');
const mongoose = require('mongoose');

// auxiliary
const aux = require('../auxiliary');

const makeStatus = require('../../lib');

describe('makeStatus(schema, options)', function () {

  var ASSETS;
  var ResourceModel;

  beforeEach(function () {
    return aux.setup()
      .then((assets) => {
        ASSETS = assets;
      });
  });

  afterEach(function () {
    return aux.teardown();
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
});