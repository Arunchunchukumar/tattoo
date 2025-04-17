async function generateTattoo() {
    const prompt = document.getElementById('prompt').value;
    const tattooImage = document.getElementById('tattooImage');

    try {
        const response = await fetch('/api/generateTattoo', {  // Changed URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        if (!response.ok) {
            console.error('Backend error:', response.status, await response.text());
            return alert('Failed to generate tattoo.  Check the console for details.');
        }

        const data = await response.json();

        if (data.error) {
            console.error('Replicate error:', data.error);
            return alert('Replicate API error. Check the console for details.');
        }

        // Check if the image URL is directly returned
        if (data && data.output && data.output.length > 0) {
            tattooImage.src = data.output[0];
            tattooImage.alt = 'Generated Tattoo';
        } else {
            console.warn('Unexpected data structure:', data);
            alert('Unexpected response from the server. Check the console.');
        }

    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to generate tattoo. Check the console for details.');
    }
}
