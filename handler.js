/**
 * Streaming Lambda Function Handler
 * Demonstrates API Gateway response streaming with incremental data chunks
 */
export const streamResponse = awslambda.streamifyResponse(
  async (event, responseStream, context) => {
    // Set response metadata (status code and headers)
    const metadata = {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Accel-Buffering': 'no'
      }
    };

    // Wrap the response stream with metadata
    responseStream = awslambda.HttpResponseStream.from(responseStream, metadata);

    try {
      // Simulate streaming data - sending messages incrementally
      const messages = [
        'Starting data stream...',
        'Processing item 1 of 10',
        'Processing item 2 of 10',
        'Processing item 3 of 10',
        'Processing item 4 of 10',
        'Processing item 5 of 10',
        'Processing item 6 of 10',
        'Processing item 7 of 10',
        'Processing item 8 of 10',
        'Processing item 9 of 10',
        'Processing item 10 of 10',
        'Stream complete!'
      ];

      // Send each message with a delay to demonstrate streaming
      for (let i = 0; i < messages.length; i++) {
        const data = {
          id: i,
          message: messages[i],
          timestamp: new Date().toISOString(),
          progress: Math.round((i / (messages.length - 1)) * 100)
        };

        // Write data as Server-Sent Events format
        responseStream.write(`data: ${JSON.stringify(data)}\n\n`);

        // Simulate processing delay (except for the last message)
        if (i < messages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      // Signal end of stream
      responseStream.end();
      await responseStream.finished();
    } catch (error) {
      console.error('Streaming error:', error);
      responseStream.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      responseStream.end();
    }
  }
);
