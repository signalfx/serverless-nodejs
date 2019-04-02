# ~~SignalFx Node Google Cloud Function Wrapper~~ (This doc will be updated as the dependency structure finalizes)

SignalFx Node Google Cloud Function Wrapper.

## Usage

The SignalFx NodeJS Google Cloud Function Wrapper is a wrapper around an Google Cloud Function NodeJS function handler, used to instrument execution of the function and send metrics to SignalFx.

### Installation

Use the hosted package:
```
{
  "name": "my-module",
  "dependencies": {
    "signalfx-gcf": "^0.0.1"
  }
}
```

Wrap your function handler
```
'use strict';

const signalFxGCF = require('signalfx-gcf');

exports.handler = signalFxGCF.wrapper((req, res) => {
  ...
  res.status(200).send("Hello");
});
```

#### Configuring the ingest endpoint

By default, this function wrapper will send to the `us0` realm. If you are
not in this realm you will need to set the `SIGNALFX_INGEST_ENDPOINT` environment
variable to the correct realm ingest endpoint (https://ingest.{REALM}.signalfx.com).
To determine what realm you are in, check your profile page in the SignalFx
web application (click the avatar in the upper right and click My Profile).


### Environment Variables

```
 SIGNALFX_AUTH_TOKEN=signalfx token
```

Optional parameters available:
```
SIGNALFX_SEND_TIMEOUT=milliseconds for signalfx client timeout [1000]

# Change the ingest endpoint URL:
SIGNALFX_INGEST_ENDPOINT=[https://pops.signalfx.com]
```

### Metrics and dimensions sent by the wrapper

The Google Cloud Function wrapper sends the following metrics to SignalFx:

| Metric Name  | Type | Description |
| ------------- | ------------- | ---|
| function.invocations  | Counter  | Count number of Google Cloud Function invocations|
| function.cold_starts  | Counter  | Count number of cold starts|
| function.errors  | Counter  | Count number of errors from underlying Google Cloud Function handler|
| function.duration  | Gauge  | Milliseconds in execution time of underlying Google Cloud Function handler|

The Google Cloud Function wrapper adds the following dimensions to all data points sent to SignalFx:

| Dimension | Description |
| ------------- | ---|
| gcf_region  | Google Cloud Function Region  |
| gcf_project_id | Google Cloud Function Project ID  |
| gcf_function_name  | Google Cloud Function Name |
| gcf_function_version  | Google Cloud Function Version |
| function_wrapper_version  | SignalFx function wrapper qualifier (e.g. signalfx-gcf-0.0.9) |
| metric_source | The literal value of 'gcf_wrapper' |

### Sending a metric from the Google Cloud Function function

```
'use strict';

const signalFxGCF = require('signalfx-gcf');

exports.handler = signalFxGCF.wrapper((req, res) => {
  ...
  signalFxGCF.helper.sendGauge('gauge.name', value);
});
```

### Deployment

Run `npm pack` to package the module with the configuration in `package.json`.

## Testing

WIP ~~Install node-lambda via `npm install -g node-lambda` (globally) or `npm install node-lambda` (locally).~~

### Testing locally

1) Create deploy.env to submit data to SignalFx, containing the required and optional environment variables mentioned above:

2) Run `node-lambda run -f deploy.env`.

## Testing from Google Cloud Function

Run `gcloud functions deploy [FUNTION_NAME_ON_CLOUD] --entry-point [FUNCTION_ENTRY_POINT] --runtime nodejs6 --trigger-http --set-env-vars PROJECT_ID=[GCF_PROJECT_ID],SIGNALFX_AUTH_TOKEN=[SFX_ACCESS_TOKEN],SIGNALFX_INGEST_ENDPOINT=[SFX_INGEST_ENDPOINT_URL]

### License

Apache Software License v2. Copyright © 2014-2019 SignalFx
