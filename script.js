const submitIcon = document.querySelector("#submit-icon");
const inputElement = document.querySelector("input");
const imageContainer = document.querySelector('.image-container');
const loadingOverlay = document.getElementById('loadingOverlay');



let generationCounter = 0;

function showLoadingOverlay() {
  loadingOverlay.classList.add('active');
}

function hideLoadingOverlay() {
  loadingOverlay.classList.remove('active');
}


async function generateAndDisplayImage() {

  if (generationCounter >= 4) {
    var n = prompt('You have reached the maximum limit of generated images.');
    return;
  }

  showLoadingOverlay();


  const generateOptions = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImVlYTJjYzg5ODA2NWE4ZTY4ZThmZGJlNDc2M2E3NGRhIiwiY3JlYXRlZF9hdCI6IjIwMjMtMTEtMjhUMDc6NTY6NDYuMjM5NDM3In0.h0A923x4vkEKDkqaE77FfpwhoO7Dwyy7cobI8hAevr4' // Replace with your actual access token
    },
    body: JSON.stringify({ prompt: inputElement.value,
    })
  };

  try {
    const generateResponse = await fetch('https://api.monsterapi.ai/v1/generate/txt2img', generateOptions);
    const generateData = await generateResponse.json();
    console.log('Generate Data', generateData);

    // Assuming 'process_id' is the key in the generateData response containing process ID
    const processId = generateData.process_id;

      generationCounter++;


    // Call the function to check the status after generating the image
    checkStatus(processId);
  } catch (error) {
    console.error('Error generating image', error);
  } 
}

async function checkStatus(processId) {
  const statusUrl = `https://api.monsterapi.ai/v1/status/${processId}`;

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImVlYTJjYzg5ODA2NWE4ZTY4ZThmZGJlNDc2M2E3NGRhIiwiY3JlYXRlZF9hdCI6IjIwMjMtMTEtMjhUMDc6NTY6NDYuMjM5NDM3In0.h0A923x4vkEKDkqaE77FfpwhoO7Dwyy7cobI8hAevr4', // Replace with your actual access token
    },
  };

  // Function to recursively check status
  const pollStatus = async () => {
    try {
      const response = await fetch(statusUrl, options);
      const responseData = await response.json();

      console.log('Status Response:', responseData);


      if (responseData.status === 'COMPLETED') {
        // Assuming 'output' is the key in the response array containing image links
        const imageLinks = responseData.result.output;


        console.log('Image Links', imageLinks);
        // Clear existing images in the container
        imageContainer.innerHTML = '';

        // Loop through the image links and create image elements
        imageLinks.forEach(link => {
          const imageElement = document.createElement('img');
          imageElement.classList.add('generated-image');
          imageElement.src = link;
          imageContainer.appendChild(imageElement);
        });
      } else if (responseData.status === 'IN_PROGRESS' || responseData.status === 'IN_QUEUE') {
        // If still in progress, wait for a while and then check again
        setTimeout(pollStatus, 10000); // Check again after 1 second
      } else {
        console.error(`Unexpected status: ${responseData.status}`);
      }
    } catch (error) {
      console.error('Error checking status', error);
    }
    finally {
      setTimeout (() => {
      hideLoadingOverlay();
    }, 18000);
  }
};

  // Start polling the status
  pollStatus();
}

submitIcon.addEventListener('click', generateAndDisplayImage);
