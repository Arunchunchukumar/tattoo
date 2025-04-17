// Update the counter when a tattoo is successfully generated
let tattooCounter = 0;

async function generateTattoo() {
    const prompt = document.getElementById('prompt').value;
    if (!prompt.trim()) {
        alert('Please enter a tattoo description');
        return;
    }

    const tattooImage = document.getElementById('tattooImage');
    const button = document.querySelector('button');
    
    // Disable button and show loading state
    button.disabled = true;
    button.textContent = 'Generating...';
    tattooImage.src = ''; // Clear previous image
    tattooImage.alt = 'Generating your tattoo...';
    
    try {
        const response = await fetch('/api/generateTattoo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });
        
        if (!response.ok) {
            console.error('Backend error:', response.status, await response.text());
            alert('Failed to generate tattoo. Check the console for details.');
            return;
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('Replicate error:', data.error);
            alert('Replicate API error. Check the console for details.');
            return;
        }
        
        // Check if the image URL is directly returned
        if (data && data.output && data.output.length > 0) {
            tattooImage.src = data.output[0];
            tattooImage.alt = 'Generated Tattoo';
            
            // Update the counter
            tattooCounter++;
            document.getElementById('counter').textContent = tattooCounter;
            
            // Store counter in localStorage
            localStorage.setItem('tattooCounter', tattooCounter);
        } else {
            console.warn('Unexpected data structure:', data);
            alert('Unexpected response from the server. Check the console.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to generate tattoo. Check the console for details.');
    } finally {
        // Re-enable button
        button.disabled = false;
        button.textContent = 'Generate Tattoo';
    }
}

// Initialize the counter from localStorage if available
document.addEventListener('DOMContentLoaded', () => {
    const savedCounter = localStorage.getItem('tattooCounter');
    if (savedCounter) {
        tattooCounter = parseInt(savedCounter);
        document.getElementById('counter').textContent = tattooCounter;
    }
});
