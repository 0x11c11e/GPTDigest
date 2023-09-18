document.addEventListener('DOMContentLoaded', function () {
  // Retrieve the stored API key
  chrome.storage.local.get(['apiKey'], function (result) {
    const apiKey = result.apiKey

    // Check if API key is available
    if (!apiKey) {
      // Redirect to apiKeyInput.html if API key is not available
      window.location.href = 'apiKeyInput.html'
      return
    }

    // Add event listener for the Summarize button
    document
      .getElementById('summarizeButton')
      .addEventListener('click', async function () {
        // Fetch the text content from the current tab
        const tabQuery = { active: true, currentWindow: true }
        chrome.tabs.query(tabQuery, async function (tabs) {
          const currentTab = tabs[0]
          chrome.scripting.executeScript(
            {
              target: { tabId: currentTab.id },
              function: getTextFromPage,
            },
            async (result) => {
              if (result && result[0] && result[0].result) {
                const pageText = result[0].result
                const summary = await fetchSummary(apiKey, pageText)
                // Display the summary
                document.getElementById('summaryArea').value = summary
              } else {
                console.error('Failed to fetch text from the page.')
              }
            }
          )
        })
      })
  })
})

// Function to fetch text content from the current webpage
function getTextFromPage() {
  // Retrieve text content (you can make this more sophisticated)
  return document.body.innerText
}

// Function to call OpenAI API for text summarization
async function fetchSummary(apiKey, text) {
  try {
    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `Please summarize the following text: ${text}`,
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

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content
    } else {
      return 'Unable to generate summary.'
    }
  } catch (error) {
    console.error('Error fetching summary:', error)
    return 'Error fetching summary.'
  }
}
