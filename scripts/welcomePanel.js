const mainPage = 'sidePanel.html';

/**
 * Checks Chrome storage to determine whether an OpenAI Key is already present
 *
 * @returns {Promise} Promise resolving to the OpenAI Key, if present, otherwise undefined
 */
const checkForKey = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai-key'], (result) => {
            resolve(result['openai-key']);
        });
    });
};

/**
 * Encodes the given input as Base64
 *
 * @param {String} input The string to encode
 * @returns {String} The Base64-encoded version of the given string
 */
const encode = (input) => {
    return btoa(input);
};

/**
 * Retrieves the value from the given input element, encodes it as Base64 and saves it to local Chrome storage.
 * If successful, the main page will be displayed
 */
const saveKey = () => {
    const input = document.getElementById('key_input');

    if (input) {
        const { value } = input;

        const encodedValue = encode(value);

        chrome.storage.local.set({ 'openai-key': encodedValue }, () => {
            chrome.sidePanel.setOptions({ path: mainPage });
        });

    }
};

// Waits for the save-key to be clicked, switches to main page if clicked
document.getElementById('save_key_button').addEventListener('click', saveKey);

// checks if there is an API key stored, if so then switches to main page
checkForKey().then((response) => {
    if (response) {
        chrome.sidePanel.setOptions({ path: mainPage });
    }
});