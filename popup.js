document.addEventListener('DOMContentLoaded', function() {
    let clickCount = 0;
    
    // Load saved preferences
    chrome.storage.sync.get(['siteUrl', 'darkMode', 'clickCount', 'lastUsed', 'favorites'], function(result) {
      // Update URL display
      const currentUrl = document.getElementById('currentUrl');
      currentUrl.textContent = result.siteUrl || 'https://facebook.com';
      
      // Update click count
      clickCount = result.clickCount || 0;
      document.getElementById('clickCount').textContent = `Klik: ${clickCount}`;
      
      // Update last used
      if (result.lastUsed) {
        const lastUsed = new Date(result.lastUsed);
        const now = new Date();
        const diffMinutes = Math.floor((now - lastUsed) / 1000 / 60);
        
        let lastUsedText = 'Terakhir: ';
        if (diffMinutes < 1) {
          lastUsedText += 'Baru saja';
        } else if (diffMinutes < 60) {
          lastUsedText += `${diffMinutes} menit lalu`;
        } else {
          lastUsedText += `${Math.floor(diffMinutes / 60)} jam lalu`;
        }
        document.getElementById('lastUsed').textContent = lastUsedText;
      }
      
      // Set theme
      if (result.darkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
      }
      
      // Load favorites
      if (result.favorites) {
        updateFavoritesList(result.favorites);
      }
    });
  
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', function() {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
      chrome.storage.sync.set({ darkMode: isDark });
    });
  
    // Launch button
    document.getElementById('launchButton').addEventListener('click', function() {
      chrome.storage.sync.get(['siteUrl'], function(result) {
        const url = result.siteUrl || 'https://facebook.com';
        chrome.tabs.create({ url: url });
        
        // Update stats
        clickCount++;
        const now = new Date().toISOString();
        chrome.storage.sync.set({
          clickCount: clickCount,
          lastUsed: now
        });
        
        document.getElementById('clickCount').textContent = `Klik: ${clickCount}`;
        document.getElementById('lastUsed').textContent = 'Terakhir: Baru saja';
      });
    });
  
    // Edit button
    document.getElementById('editButton').addEventListener('click', function() {
      chrome.runtime.openOptionsPage();
    });
  
    // Copy URL button
    document.getElementById('copyUrl').addEventListener('click', function() {
      chrome.storage.sync.get(['siteUrl'], function(result) {
        const url = result.siteUrl || 'https://facebook.com';
        navigator.clipboard.writeText(url).then(() => {
          showToast('URL berhasil disalin!');
        });
      });
    });
  
    // Share URL button
    document.getElementById('shareUrl').addEventListener('click', function() {
      chrome.storage.sync.get(['siteUrl'], function(result) {
        const url = result.siteUrl || 'https://facebook.com';
        if (navigator.share) {
          navigator.share({
            title: 'Bagikan URL',
            url: url
          }).catch(() => {
            showToast('Gagal membagikan URL');
          });
        } else {
          navigator.clipboard.writeText(url).then(() => {
            showToast('URL disalin ke clipboard!');
          });
        }
      });
    });
  
    // Add to favorites
    document.getElementById('addToFavorites').addEventListener('click', function() {
      chrome.storage.sync.get(['siteUrl', 'favorites'], function(result) {
        const url = result.siteUrl || 'https://facebook.com';
        const favorites = result.favorites || [];
        
        if (!favorites.includes(url)) {
          favorites.push(url);
          chrome.storage.sync.set({ favorites: favorites }, function() {
            updateFavoritesList(favorites);
            showToast('Ditambahkan ke favorit!');
          });
        } else {
          showToast('URL sudah ada di favorit!');
        }
      });
    });
  
    // Help modal
    const modal = document.getElementById('helpModal');
    document.getElementById('helpButton').addEventListener('click', () => {
      modal.style.display = 'block';
    });
    
    document.getElementById('closeHelp').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  
    // Check shortcut status
    chrome.commands.getAll(function(commands) {
      const shortcutCommand = commands.find(command => command.name === '_execute_action');
      const statusDot = document.querySelector('.status-dot');
      const statusText = document.querySelector('.status-text');
  
      if (shortcutCommand && shortcutCommand.shortcut) {
        statusDot.style.background = 'var(--success-color)';
        statusText.textContent = 'Aktif';
        statusText.style.color = 'var(--success-color)';
      } else {
        statusDot.style.background = '#ef4444';
        statusText.textContent = 'Nonaktif';
        statusText.style.color = '#ef4444';
      }
    });
  });
  
  // Helper functions
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  function updateFavoritesList(favorites) {
    const container = document.getElementById('urlFavorites');
    container.innerHTML = '';
    
    favorites.forEach(url => {
      const div = document.createElement('div');
      div.className = 'favorite-item';
      div.innerHTML = `
        <span class="favorite-url">${new URL(url).hostname}</span>
        <button class="remove-favorite" data-url="${url}">
          <i class="fas fa-times"></i>
        </button>
      `;
      container.appendChild(div);
    });
  
    // Add remove handlers
    document.querySelectorAll('.remove-favorite').forEach(btn => {
      btn.addEventListener('click', function() {
        const urlToRemove = this.dataset.url;
        chrome.storage.sync.get(['favorites'], function(result) {
          const favorites = result.favorites.filter(u => u !== urlToRemove);
          chrome.storage.sync.set({ favorites: favorites }, function() {
            updateFavoritesList(favorites);
            showToast('Dihapus dari favorit!');
          });
        });
      });
    });
  }