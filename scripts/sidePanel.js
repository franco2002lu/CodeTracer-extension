const welcomePage = 'welcomePanel.html';

/**
 * Listens for incoming messages from the extension and, when needed, executes code to hide instructions and show the code description.
 *
 * @param {Object} name Object containing a 'name' field and a 'data' field
 */
chrome.runtime.onMessage.addListener(({ name, data }) => {
    if (name === 'execute') {
        // Hide instructions.
        document.body.querySelector('#select-code').style.display = 'none';

        // Show description of code
        document.body.querySelector('#description').innerText =
            data.value;
    }
});

/**
 * Removes the OpenAI key from storage and displays the welcome page
 */
const changeKey = () => {
    chrome.storage.local.remove(['openai-key']);
    chrome.sidePanel.setOptions({ path: welcomePage });
};

// Displays the change-key button because it is not default
document.getElementById('key_entered').style.display = 'block';

// Waits for click on the change-key button, switches to welcome page if the button is clicked
document.getElementById('change_key_button').addEventListener('click', changeKey);