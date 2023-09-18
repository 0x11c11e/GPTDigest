document.addEventListener('DOMContentLoaded', function () {
  // Check if API key is stored
  chrome.storage.local.get(['apiKey'], function (result) {
    if (result.apiKey) {
      // API key exists, switch to main popup
      window.location.href = 'popup.html'
    }
  })

  // Listen for the Submit button
  document
    .getElementById('submitApiKey')
    .addEventListener('click', async function () {
      console.log('submitting')
      const apiKey = document.getElementById('apiKey').value
      if (!apiKey) {
        alert('Please enter your OpenAI API Key')
        return
      }

      // Validate API Key (you can improve this part)
      const isValid = await validateApiKey(apiKey)

      if (isValid) {
        // Store API key
        chrome.storage.local.set({ apiKey: apiKey }, function () {
          // Switch to main popup
          window.location.href = 'popup.html'
        })
      } else {
        // Show an error message
        document.getElementById('errorText').innerText =
          'Invalid API key. Please try again.'
      }
    })
})

async function validateApiKey(apiKey) {
  try {
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: 'Say this is a test!',
        },
      ],
      temperature: 0.7,
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (
      data &&
      data.choices &&
      data.choices.length > 0 &&
      data.choices[0].message.content.trim() === 'This is a test!'
    ) {
      return true
    } else {
      return false
    }
  } catch (error) {
    console.error('API key validation failed:', error)
    return false
  }
}
