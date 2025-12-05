# Serverless Framework v4 - API Gateway Response Streaming Demo

This project demonstrates the new API Gateway response streaming feature introduced in Serverless Framework v4.25.0. It includes a Lambda function that streams data incrementally and a frontend to visualize the streaming in real-time.

## Features

- **API Gateway Response Streaming**: Uses the `response.transferMode: stream` configuration
- **Lambda Response Streaming**: Implements `awslambda.streamifyResponse()` for incremental data delivery
- **Server-Sent Events (SSE)**: Streams data using the SSE protocol
- **Real-time Progress**: Frontend displays streaming progress with a visual progress bar
- **Local Frontend**: HTML/CSS/JS frontend that can be run locally and connect to deployed API

## Prerequisites

- Node.js 24.x or later
- AWS CLI configured with appropriate credentials
- Serverless Framework v4.25.0 or later
- An AWS account with permissions to create Lambda functions and API Gateway resources

## Project Structure

```
.
├── handler.js              # Lambda function with streaming response
├── serverless.yml          # Serverless Framework configuration
├── package.json            # Node.js dependencies
├── frontend/
│   ├── index.html         # Frontend HTML
│   ├── styles.css         # Frontend styles
│   └── app.js             # Frontend JavaScript
└── README.md              # This file
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Deploy to AWS

```bash
npx serverless deploy
```

After deployment, you'll see output similar to:

```
endpoints:
  GET - https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev/stream
functions:
  streamingFunction: serverless-streaming-demo-dev-streamingFunction
```

**Copy the endpoint URL** - you'll need it for the frontend.

## Usage

### Running the Frontend Locally

Start the local development server:

```bash
npm start
```

This will start an HTTP server on `http://localhost:3000` and automatically open it in your browser.

Alternatively, you can directly open `frontend/index.html` in your browser.

### Testing the Streaming Endpoint

1. Open the frontend (either via `npm start` or by opening `frontend/index.html`)
2. Paste the API Gateway endpoint URL from the deployment output into the input field
3. Click "Start Streaming" to begin receiving streamed data
4. Watch as data arrives incrementally with progress updates

### How It Works

#### Backend (Lambda)

The Lambda function (`handler.js`) uses:
- `awslambda.streamifyResponse()` to enable streaming
- `awslambda.HttpResponseStream.from()` to set response metadata
- Server-Sent Events (SSE) format for streaming data
- Incremental writes with delays to simulate real-world processing

#### Frontend

The frontend (`frontend/`) uses:
- Fetch API with ReadableStream to receive streaming data
- Real-time parsing of SSE messages
- Progress bar visualization
- localStorage to remember the API endpoint

#### Serverless Configuration

The `serverless.yml` includes:
- `runtime: nodejs24.x` - Uses Node.js 24.x runtime with ES modules support
- `http` event with `response.transferMode: stream` - Enables API Gateway streaming
- `type: module` in package.json - Enables ES modules for the Lambda function

## Key Configuration

### Serverless Framework Configuration

The key configuration in `serverless.yml` for enabling response streaming:

```yaml
provider:
  runtime: nodejs24.x  # Node.js 24.x with ES modules support

functions:
  streamingFunction:
    handler: handler.streamResponse
    events:
      - http:
          path: stream
          method: get
          response:
            transferMode: stream  # Enables API Gateway response streaming
```

### Package.json Configuration

Enable ES modules support by adding to `package.json`:

```json
{
  "type": "module"
}
```

## Customization

### Modify Streaming Data

Edit the `messages` array in `handler.js` to change the streamed content:

```javascript
const messages = [
  'Your custom message 1',
  'Your custom message 2',
  // Add more messages...
];
```

### Adjust Streaming Speed

Change the delay in `handler.js`:

```javascript
await new Promise(resolve => setTimeout(resolve, 2000)); // 2000ms delay (2 seconds)
```

### Change Response Format

The current implementation uses SSE format. You can modify the response format in `handler.js` and update the frontend parser accordingly.

## Troubleshooting

### CORS Issues

If you encounter CORS errors, ensure the Lambda function includes proper CORS headers:

```javascript
'Access-Control-Allow-Origin': '*',
'Access-Control-Allow-Headers': 'Content-Type'
```

### Stream Not Working

1. Verify you're using Serverless Framework v4.25.0 or later
2. Check that the Lambda function is using Node.js 24.x runtime
3. Ensure the API Gateway endpoint URL is correct
4. Check CloudWatch logs for Lambda errors: `npx serverless logs -f streamingFunction`

### ES Module Syntax Errors

If you see errors like `SyntaxError: Unexpected token 'export'`:

1. Ensure `package.json` includes `"type": "module"`
2. Redeploy the function after adding this field
3. The Lambda function requires ES modules support to use the `export` syntax

### Empty Response

Make sure you're using the correct endpoint from the deployment output and that the function has proper IAM permissions.

## Cleanup

To remove all deployed resources:

```bash
npx serverless remove
```

## Additional Resources

- [Serverless Framework v4.25.0 Release Notes](https://github.com/serverless/serverless/releases)
- [AWS Lambda Response Streaming Documentation](https://docs.aws.amazon.com/lambda/latest/dg/configuration-response-streaming.html)
- [Building Responsive APIs with API Gateway Response Streaming](https://aws.amazon.com/blogs/compute/building-responsive-apis-with-amazon-api-gateway-response-streaming/)

## License

MIT
