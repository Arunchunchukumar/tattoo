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
            console.error('Backend error:', response.status, response.statusText);
            return alert('Failed to generate tattoo.  Check the console for details.');
        }

        const data = await response.json();

        if (data.error) {
            console.error('Replicate error:', data.error);
            return alert('Replicate API error. Check the console for details.');
        }


        let interval = setInterval(async () => {
            const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
                headers: {
                    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
            });

            const checkData = await checkResponse.json();

            if (checkData.status === 'succeeded') {
                clearInterval(interval);
                tattooImage.src = checkData.output[0];  // set the image source
                tattooImage.alt = 'Generated Tattoo';
            } else if (checkData.status === 'failed') {
                clearInterval(interval);
                console.error("Replicate failed:", checkData);
                alert("Replicate Failed");
            }
        }, 2000);

    } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to generate tattoo. Check the console for details.');
    }
}
