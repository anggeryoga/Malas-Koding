chrome.commands.onCommand.addListener((command) => {
    if (command === "_execute_action") {
      chrome.storage.sync.get(['siteUrl'], function(result) {
        const url = result.siteUrl || 'https://facebook.com';
        chrome.tabs.create({ url: url });
      });
    }
  });