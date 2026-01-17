// doc.js: Shared functionality for all doc pages

document.addEventListener('DOMContentLoaded', () => {
    // Hide any open menus when clicking anywhere on the document page
    document.addEventListener('click', () => {
        const menus = document.querySelectorAll('.menu');
        menus.forEach(menu => menu.remove());
    });

    // Add 'Open in new window' button if loaded in an iframe
    if (window.self !== window.top) {
        const openButton = document.createElement('button');
        openButton.className = 'open';
        openButton.textContent = 'Open in new window';
        openButton.addEventListener('click', () => {
            const theme = document.body.className || 'dark';
            const url = new URL(window.location.href);
            url.searchParams.set('theme', theme);
            const newWindow = window.open(url.toString(), '_blank');

            // Register the new window with the parent if opener exists
            if (window.opener) {
                window.opener.postMessage('register', '*');
            }
        });
        document.body.appendChild(openButton);
    }

    // Add 'Close' button if the page is opened in a new window
    if (window.opener) {
        const closeButton = document.createElement('button');
        closeButton.className = 'close';
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', () => {
            window.close();
        });
        document.body.appendChild(closeButton);

        // Listen for theme updates from the parent
        window.addEventListener('message', (event) => {
            if (event.data.theme) {
                document.body.className = event.data.theme;
            }
        });
    }

    // Add 'Exit Fullscreen' button
    const exitFullscreenButton = document.createElement('button');
    exitFullscreenButton.className = 'exit-fullscreen';
    exitFullscreenButton.textContent = 'Exit Fullscreen';
    exitFullscreenButton.style.display = 'none';

    exitFullscreenButton.addEventListener('click', () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { // Safari
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE11
            document.msExitFullscreen();
        }
        exitFullscreenButton.style.display = 'none';
    });

    document.body.appendChild(exitFullscreenButton);

    // Show the exit fullscreen button when fullscreen is activated
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            exitFullscreenButton.style.display = 'block';
        } else {
            exitFullscreenButton.style.display = 'none';
        }
    });

    // Add keyword input for highlighting text
    const keywordInput = document.createElement('input');
    keywordInput.className = 'keyword';
    keywordInput.type = 'text';
    keywordInput.placeholder = 'Enter keyword to highlight';
    keywordInput.style.margin = '10px'; // Add spacing for visibility
    keywordInput.style.padding = '5px'; // Add padding for better usability
    keywordInput.style.width = 'calc(100% - 30px)'; // Ensure it spans the width of the page
    keywordInput.style.boxSizing = 'border-box'; // Prevent overflow
    keywordInput.style.border = '1px solid #ccc'; // Add a border for clarity
    keywordInput.style.borderRadius = '4px'; // Rounded corners

    keywordInput.addEventListener('input', () => {
        const keyword = keywordInput.value.trim().toLowerCase();
        const content = document.body;

        // Clear previous highlights
        const highlightedElements = content.querySelectorAll('mark');
        highlightedElements.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });

        if (keyword === '') return;

        // Highlight new matches using Range API
        const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                // Exclude the keyword input field and its descendants
                if (keywordInput.contains(node.parentNode)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (node.nodeValue.toLowerCase().includes(keyword)) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_REJECT;
            }
        });

        const nodesToHighlight = [];
        while (walker.nextNode()) {
            nodesToHighlight.push(walker.currentNode);
        }

        nodesToHighlight.forEach(node => {
            let text = node.nodeValue;
            let startIndex = text.toLowerCase().indexOf(keyword);

            while (startIndex !== -1) {
                const range = document.createRange();
                range.setStart(node, startIndex);
                range.setEnd(node, startIndex + keyword.length);

                const mark = document.createElement('mark');
                mark.textContent = range.toString();
                range.deleteContents();
                range.insertNode(mark);

                // Move to the next match in the same node
                startIndex = text.toLowerCase().indexOf(keyword, startIndex + keyword.length);
                text = node.nodeValue; // Update the text after modification
            }
        });
    });

    // Insert the input field at the top of the body
    document.body.insertBefore(keywordInput, document.body.firstChild);
});

// Apply the same theme as the main page
const urlParams = new URLSearchParams(window.location.search);
const theme = urlParams.get('theme') || 'dark';
document.body.className = theme;

// Ensure theme is saved in localStorage for consistency
localStorage.setItem('theme', theme);