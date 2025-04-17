// api/checkPrediction.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Prediction ID is required' });
  }

  const replicateApiToken = process.env.REPLICATE_API_TOKEN;

  if (!replicateApiToken) {
    console.error('Replicate API token is missing');
    return res.status(500).json({ error: 'Replicate API token is not configured.' });
  }

  try {
    console.log('Checking prediction status for ID:', id);
    
    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'Replicate API request failed', 
        details: errorText
      });
    }

    const prediction = await response.json();
    console.log('Prediction status:', prediction.status);
    
    return res.status(200).json(prediction);
  } catch (error) {
    console.error('Error checking prediction:', error);
    return res.status(500).json({ 
      error: 'Failed to check prediction status',
      message: error.message
    });
  }
}
