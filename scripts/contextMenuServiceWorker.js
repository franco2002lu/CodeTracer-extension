const welcomePage = 'welcomePanel.html';

/**
 * Retrieves the stored OpenAI key from local Chrome storage and decodes it
 *
 * @returns {Promise} Promise resolving to the OpenAI key, after being decoded from Base64
 */
const getKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            if(result['openai-key']) {
                const decodedKey = atob(result['openai-key']);
                resolve(decodedKey);
            }
        });
    });
};

/**
 * Retrieves the stored OpenAI key and requests a text completion from the OpenAI API.
 *
 * @param {String} prompt The input text that will be used as a starting point for the completion.
 *
 * @returns {Promise} Promise resolving to the completed text.
 */
const generate = async (prompt) => {
    const key = await getKey();
    const url = 'https://api.openai.com/v1/completions';

    const completionResponse = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
            model: 'text-davinci-003',
            prompt: prompt,
            max_tokens: 1250,
            temperature: 0.7,
        }),
    });
    const completion = await completionResponse.json();
    return completion.choices.pop();
}

/**
 * Generates a text completion from the given selection text using the OpenAI API and sends a message to
 * display the result.
 *
 * @param {Object} info Object containing the selected text
 */
const generateCompletionAction = async (info) => {
    try {
        await chrome.runtime.sendMessage({name: 'execute', data: {value: 'Generating...'}});

        const { selectionText } = info;
        const basePromptPrefix = "summarize the code below:\n";

        const baseCompletion = await generate(`${basePromptPrefix}${selectionText}`);
        console.log(baseCompletion.text)
        await chrome.runtime.sendMessage({
            name: 'execute',
            data: {value: baseCompletion.text.replace(/(\r\n|\n|\r)/gm, "")}
        });

    } catch (error) {
        console.log(error);
    }
};

// Makes sure that the side panel pops up whenever the extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch((error) => console.error(error));

// Creates an icon in the drop-down menu for the extension
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'context-run',
        title: 'Generate code description',
        contexts: ['selection'],
    });
});

// Makes sure that the welcome page pops up as soon as the extension initiates
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setOptions({ path: welcomePage });
});

// If the app icon in the context menu is clicked, then generate a description of the highlighted code
chrome.contextMenus.onClicked.addListener(generateCompletionAction);
