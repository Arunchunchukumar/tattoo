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
    const response = await fetch('https://api.replicate.com/v1/predictions', {
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

    if (!response.ok) {
      console.error('Replicate API error:', response.status, response.statusText);
      return res.status(500).json({ error: 'Replicate API request failed' });
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Error during Replicate API call:', error);
    res.status(500).json({ error: 'Failed to call Replicate API' });
  }
};
