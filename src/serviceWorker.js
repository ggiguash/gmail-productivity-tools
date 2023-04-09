// Import scripts to enable the necessary functionality:
// - InboxSDK: background.js
try {
    console.log('Importing scripts into the background page');
    importScripts("background.js");
} catch (e) {
    console.log(e);
}

// Register message listener
chrome.runtime.onMessage.addListener(function (request/*, sender, sendResponse*/) {
    // Get the message fields
    const action = request.action;
    const strSubject = request.subject;
    const threadID = request.threadID;
    if (!action || !strSubject || !threadID) {
        console.log('Skipping message:', request);
        return;
    }

    // Process the message
    switch(action) {
        case 'search':
            runSearchQuery(threadID, strSubject);
            break;
        case 'delete':
            runDeleteThread(threadID, strSubject);
            break;
        default:
            console.log('Unsupported action:', action);
    }
});

// Examples of search query templates:
//
// https://groups.google.com/search/conversations?inOrg=true&q=subject%3A"${SUBJECT}"
// https://www.google.com/search?q="${SUBJECT}"
//
function runSearchQuery(threadID, strSubject) {
    // Read the search template from the storage
    chrome.storage.sync.get(['search_template'], (result) => {
        const search_template = result.search_template;
        if (!search_template) {
            console.log('Search query template is not defined');
            return;
        }
        // Replace the subject pattern in the query
        const newURL = search_template.replace('${SUBJECT}', strSubject);
        // Run the search query in a new tab next to the current one
        chrome.tabs.query({ active: true, currentWindow: true }, function (tab) {
            let index = -1;
            if (tab && tab[0]) {
                index = tab[0].index;
            }
            chrome.tabs.create({ url: newURL, index: index + 1 });
        });
    });
}

function runDeleteThread(threadID, strSubject) {
    console.log('Opening thread:', threadID, 'with subject:', strSubject);
    const encSub = encodeURIComponent(strSubject);
    const newURL = 'https://mail.google.com/mail/u/0/#search/subject%3A"' + encSub + '"';
    // Open the thread search results in the current tab
    chrome.tabs.update({ url: newURL });

    //chrome.tabs.create({ url: newURL });

    // const strQry = encodeURIComponent('subject:' + strSubject);
    // const newURL = 'https://gmail.googleapis.com/gmail/v1/users/me/threads?q=' + strQry;

    // fetch(newURL).then(function(res) {
    //     if (res.status !== 200) {
    //         console.log('Failed query:', res);
    //         return;
    //     }
    //     console.log('Response:', res);

    //     res.json().then(function(data) {
    //         console.log('Data:', data);
    //     });

    // }).catch(function(err) {
    //     console.log('Error:', err);
    // });
}
