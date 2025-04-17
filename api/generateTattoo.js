// api/generateTattoo.js
import fetch from 'node-fetch'; // Changed to ES module import

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { prompt } = req.body;
  
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string' });
  }

  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  if (!replicateApiToken) {
    console.error('Replicate API token is missing');
    return res.status(500).json({ error: 'Replicate API token is not configured.' });
  }

  try {
    console.log('Starting prediction with prompt:', prompt);
    
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
      const errorText = await startResponse.text();
      console.error('Replicate API error:', startResponse.status, errorText);
      return res.status(500).json({ 
        error: 'Replicate API request failed', 
        status: startResponse.status,
        details: errorText
      });
    }

    const prediction = await startResponse.json();
    console.log('Prediction started:', prediction.id);
    
    let result = null;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`);
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiToken}`,
          'Content-Type': 'application/json'
        },
      });

      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        throw new Error(`Polling failed with status ${pollResponse.status}: ${errorText}`);
      }

      result = await pollResponse.json();
      console.log('Poll status:', result.status);
      
      if (result.status === 'succeeded') {
        console.log('Generation succeeded:', result.output);
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
    return res.status(500).json({ 
      error: 'Failed to call Replicate API',
      message: error.message
    });
  }
}
