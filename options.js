// Memuat pengaturan saat ini
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['siteUrl'], function(result) {
      document.getElementById('siteUrl').value = result.siteUrl || '';
    });
  
    document.getElementById('saveButton').addEventListener('click', saveOptions);
  });
  
  function saveOptions() {
    const siteUrl = document.getElementById('siteUrl').value;
    
    chrome.storage.sync.set({
      siteUrl: siteUrl
    }, function() {
      // Memperlihatkan status
      const status = document.getElementById('status');
      status.textContent = 'Pengaturan tersimpan.';
      setTimeout(function() {
        status.textContent = '';
      }, 2000);
    });
  }