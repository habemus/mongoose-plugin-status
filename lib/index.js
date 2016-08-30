// third-party
const mongoose = require('mongoose');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Base schema for the status
 * @type {Object}
 */
const BASE_STATUS_SCHEMA = {
  /**
   * Machine friendly string that names the status
   * @type {String}
   */
  value: {
    type: String,
    required: true,
  },

  /**
   * Machine friendly string that denotes the reason
   * the item is in this status
   * @type {String}
   */
  reason: {
    type: String,
    required: true,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },

  /**
   * Arbitrary metadata
   * @type {Object}
   */
  detail: {
    type: Object
  }

  // TBD:
  // notBefore: {
  //   type: Date,
  // },

  // TBD:
  // expiresAt: {
  //   type: Date,
  // },
};

function buildStatusSchema(statuses) {

  var statusSchema = Object.assign({}, BASE_STATUS_SCHEMA);

  /**
   * Validate the status against the specified status values.
   * @type {Object}
   */
  statusSchema.value.validate = {
    validator: function (statusValue) {

      return statuses.indexOf(statusValue) !== -1;
    },
    message: 'Status {VALUE} is not a valid status',
    type: 'StatusInvalid',
  };

  return statusSchema;
}

/**
 * Mixin function that adds properties, methods and statics
 * to the given schema in order to give it 'statusable' functionality.
 * 
 * @param  {mongoose.Schema} schema
 * @param  {Object} options
 * @return {void}
 */
module.exports = function makeSchemaStatusable(schema, options) {

  if (!(schema instanceof mongoose.Schema)) {
    throw new TypeError('schema MUST be instance of mongoose.Schema');
  }

  if (!options) {
    throw new TypeError('options MUST be an object');
  }

  if (!Array.isArray(options.statuses) || options.statuses.length === 0) {
    throw new TypeError('options.setAs MUST be a non-empty array');
  }

  /**
   * Build method and property names
   */
  const PREFIX       = options.prefix || '';
  const PROPERTY     = PREFIX ? PREFIX + 'Status' : 'status';
  const SET_METHOD   = 'set' + capitalizeFirstLetter(PREFIX) + 'Status';
  const QUERY_METHOD = 'scopeQueryBy' + capitalizeFirstLetter(PREFIX) + 'Statuses';
  const STATUSES     = options.statuses;

  /**
   * Auxiliary method that builds path to a sub-property
   * taking into account the prefixing
   * 
   * @param  {String} prop
   * @return {String}
   */
  function _statusProp(prop) {
    return PROPERTY + '.' + prop;
  }

  /**
   * Build the statusSubSchema
   * @type {Object}
   */
  var statusSubSchema = {};
  statusSubSchema[PROPERTY] = buildStatusSchema(STATUSES);
  schema.add(statusSubSchema);

  /**
   * Define the setting method
   */
  schema.methods[SET_METHOD] = function _setStatus(statusValue, reason, options) {
    this.set(_statusProp('value'), statusValue);
    this.set(_statusProp('reason'), reason);
    this.set(_statusProp('updatedAt'), Date.now());

    if (options && options.detail) {
      this.set(_statusProp('detail'), options.detail);
    }
  };

  /**
   * Define the query building method
   */
  schema.statics[QUERY_METHOD] = function _scopeQueryByStatuses(query, statuses) {

    if (typeof query !== 'object') {
      throw new TypeError('query MUST be an object');
    }

    if (!Array.isArray(statuses) && typeof statuses !== 'string') {
      throw new TypeError('statuses MUST be either an Array of statuses or a status String');
    }

    statuses = (typeof statuses === 'string') ? [statuses] : statuses;

    query[_statusProp('value')] = {
      $in: statuses,
    };

    return query;
  };

};
