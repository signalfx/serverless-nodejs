'use strict';

const helper = require('../serverless-common').helper;
const WrapperCore = require('../serverless-common').WrapperCore;

const ResponseWrapper = require('./response-wrapper');

const version = {
  name: 'signalfx_gcf_nodejs',
  version: '0.0.1'
};

const dimPrefix = 'gcp'
const mapEnvDimension = {
  'FUNCTION_REGION': `${dimPrefix}_region`,
  'GCP_PROJECT': `${dimPrefix}_project_id`,
  'FUNCTION_NAME': `${dimPrefix}_function_name`,
  'X_GOOGLE_FUNCTION_VERSION': `${dimPrefix}_function_version`
};

class SignalFxWrapper extends WrapperCore {
  constructor(
    accessToken,
    dimensions,
    originalObj,
    originalFn,
    originalRequest,
    originalResponse
  ) {
    super('gcf', dimensions, accessToken, originalObj, originalFn)

    this.originalRequest = originalRequest;
    this.originalResponse = originalResponse;

    return this;
  }

  invoke() {
    const startTime = new Date().getTime();
    let sent;
    const sendDuration = () => {
      if (sent) {
        return;
      }
      sent = true;
      helper.sendGauge('function.duration', new Date().getTime() - startTime);
      helper.sendCounter('function.invocations', 1);
      if (this.isCold) {
        helper.sendCounter('function.cold_starts', 1);
        this.isCold = false;
      }
    }

    try {
      this.originalFn.call(
        this.originalObj,
        this.originalRequest,
        new ResponseWrapper(this.originalResponse, sendDuration)
      );
    } catch (err) {
      helper.sendCounter('function.errors', 1);
      sendDuration();
    }
  }

  defaultDimensions() {
    let dims = {};

    dims.function_wrapper_version = version.name + '-' + version.version;

    for (let envKey in mapEnvDimension) {
      if (process.env[envKey]) {
        dims[mapEnvDimension[envKey]] = process.env[envKey];
      }
    }

    return dims;
  }
}

module.exports = (originalFn, dimensions, accessToken) => {
  return function customHandler(
    originalRequest,
    originalResponse
  ) {
    var signalFxWrapper = new SignalFxWrapper(
      accessToken,
      dimensions,
      this,
      originalFn,
      originalRequest,
      originalResponse
    );
    signalFxWrapper.invoke();
  };
};