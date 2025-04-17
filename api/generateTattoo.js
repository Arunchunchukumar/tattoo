// api/generateTattoo.js
const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  if (!replicateApiToken) {
    console.error('Replicate API token is missing');
    return res.status(500).json({ error: 'Replicate API token is not configured.' });
  }

  try {
    // Start the prediction
    const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: "d5e5fd57625682962d899544c546c9679553614684822ca67296902c71c41f6e",
        input: {
          prompt: prompt
        }
      })
    });

    if (!startResponse.ok) {
      console.error('Replicate API error:', startResponse.status, startResponse.statusText);
      return res.status(500).json({ error: 'Replicate API request failed' });
    }

    const prediction = await startResponse.json();
    const predictionId = prediction.id;

    // Poll for the result
    let result = null;
    let attempts = 0;
    const maxAttempts = 30; // Maximum number of polling attempts
    
    while (attempts < maxAttempts) {
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${replicateApiToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (!pollResponse.ok) {
        throw new Error(`Polling failed with status ${pollResponse.status}`);
      }

      result = await pollResponse.json();
      
      if (result.status === 'succeeded') {
        return res.status(200).json({ output: result.output });
      }
      
      if (result.status === 'failed') {
        throw new Error(`Prediction failed: ${result.error}`);
      }
      
      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Maximum polling attempts reached');
  } catch (error) {
    console.error('Error during Replicate API call:', error);
    res.status(500).json({ error: 'Failed to call Replicate API' });
  }
};
