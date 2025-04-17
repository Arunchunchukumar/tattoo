let count = 0;

async function generateTattoo() {
  const prompt = document.getElementById("prompt").value;
  const counter = document.getElementById("counter");
  const image = document.getElementById("tattooImage");

  if (!prompt) {
    alert("Please enter a tattoo idea.");
    return;
  }

  image.src = "";
  image.alt = "Generating...";

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: "c78fc6f0d51c0f83e65536f211f7cbba635e5f43ec0168a4e958036d5f3f28e1", // SDXL Fresh Ink
      input: { prompt }
    })
  });

  const prediction = await response.json();
  const predictionId = prediction.id;

  let outputUrl = null;

  // Poll until the result is ready
  while (!outputUrl) {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: {
        "Authorization": `Token ${API_TOKEN}`,
      }
    });

    const data = await res.json();

    if (data.status === "succeeded") {
      outputUrl = data.output[0];
    } else if (data.status === "failed") {
      image.alt = "Failed to generate tattoo.";
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  image.src = outputUrl;
  image.alt = "Generated tattoo";

  count++;
  counter.innerText = count;
}

