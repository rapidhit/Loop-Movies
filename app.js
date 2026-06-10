// Notification History
let notificationHistory = JSON.parse(localStorage.getItem('notificationHistory')) || [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    checkBrowserSupport();
    loadHistory();
    setupInstallPrompt();
    checkSubscriptionStatus();
    updateStatusUI();
});

// Check browser support for features
function checkBrowserSupport() {
    // Service Worker Support
    const swSupported = 'serviceWorker' in navigator;
    updateStatusBadge('swStatus', swSupported, 'Service Worker');

    // Notification API Support
    const notifSupported = 'Notification' in window;
    updateStatusBadge('notifStatus', notifSupported, 'Notifications');

    // Push API Support
    const pushSupported = 'PushManager' in window;
    updateStatusBadge('pushStatus', pushSupported, 'Push API');

    // Check permission status
    if (notifSupported) {
        updatePermissionStatus();
    }
}

// Update status badge
function updateStatusBadge(elementId, isSupported, featureName) {
    const element = document.getElementById(elementId);
    if (element) {
        if (isSupported) {
            element.textContent = '✓ Supported';
            element.className = 'status-value badge badge-active';
        } else {
            element.textContent = '✗ Not Supported';
            element.className = 'status-value badge badge-inactive';
        }
    }
}

// Update permission status
function updatePermissionStatus() {
    const element = document.getElementById('permStatus');
    if (element) {
        if (Notification.permission === 'granted') {
            element.textContent = '✓ Granted';
            element.className = 'status-value badge badge-active';
        } else if (Notification.permission === 'denied') {
            element.textContent = '✗ Denied';
            element.className = 'status-value badge badge-danger';
        } else {
            element.textContent = 'Default';
            element.className = 'status-value badge badge-default';
        }
    }
}

// Update subscription status UI
function updateStatusUI() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.getSubscription().then(subscription => {
                updateSubscriptionUI(subscription);
            });
        });
    }
}

// Update subscription UI
function updateSubscriptionUI(subscription) {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const unsubscribeBtn = document.getElementById('unsubscribeBtn');
    const subscriptionInfo = document.getElementById('subscriptionInfo');

    if (subscription) {
        subscribeBtn.style.display = 'none';
        unsubscribeBtn.style.display = 'block';
        subscriptionInfo.classList.remove('hidden');
        document.getElementById('subscriptionDetails').textContent = JSON.stringify(subscription.toJSON(), null, 2);
    } else {
        subscribeBtn.style.display = 'block';
        unsubscribeBtn.style.display = 'none';
        subscriptionInfo.classList.add('hidden');
    }
}

// Subscribe to notifications
async function subscribeToNotifications() {
    try {
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            showNotification('Permission Denied', 'You denied notification permission. Enable it in your browser settings.');
            updatePermissionStatus();
            return;
        }

        // Get service worker registration
        const registration = await navigator.serviceWorker.ready;

        // Create subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(getApplicationServerKey())
        });

        // Save subscription
        await saveSubscription(subscription);

        updateSubscriptionUI(subscription);
        updatePermissionStatus();
        addToHistory('Subscription', 'Successfully subscribed to push notifications');

        // Show confirmation
        showNotification('Subscribed!', 'You are now receiving push notifications.');
    } catch (error) {
        console.error('Subscription error:', error);
        showNotification('Subscription Error', 'Failed to subscribe to notifications: ' + error.message);
        addToHistory('Subscription Error', error.message);
    }
}

// Unsubscribe from notifications
async function unsubscribeFromNotifications() {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            await subscription.unsubscribe();
            await removeSubscription();
            updateSubscriptionUI(null);
            addToHistory('Unsubscription', 'Successfully unsubscribed from push notifications');
            showNotification('Unsubscribed', 'You will no longer receive push notifications.');
        }
    } catch (error) {
        console.error('Unsubscription error:', error);
        showNotification('Unsubscription Error', 'Failed to unsubscribe: ' + error.message);
    }
}

// Save subscription to local storage
async function saveSubscription(subscription) {
    localStorage.setItem('pushSubscription', JSON.stringify(subscription.toJSON()));
}

// Remove subscription from local storage
async function removeSubscription() {
    localStorage.removeItem('pushSubscription');
}

// Get application server key (VAPID public key)
function getApplicationServerKey() {
    // This is a sample VAPID public key. In production, replace with your actual key
    return 'BElmZi82T1BSSzlWQzhkSFlTaDlaTGVBUzFWbE9sQl9nMUI2dnBwMWx6X2ZVQUhLODhfSDZsVWJDMnJ4Q3RETEo=';
}

// Convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

// Send test notification
async function sendTestNotification() {
    try {
        const title = document.getElementById('notifTitle').value || 'Test Notification';
        const body = document.getElementById('notifBody').value || 'This is a test notification';
        const icon = document.getElementById('notifIcon').value;
        const badge = document.getElementById('notifBadge').value;

        // Show notification immediately if permission is granted
        if (Notification.permission === 'granted') {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification(title, {
                body: body,
                icon: icon || 'icon-192.png',
                badge: badge || 'badge-72.png',
                tag: 'test-notification',
                requireInteraction: false,
                actions: [
                    { action: 'open', title: 'Open' },
                    { action: 'close', title: 'Close' }
                ]
            });
            addToHistory(title, body);
        } else {
            showNotification('Permission Required', 'Please enable notifications first.');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
        showNotification('Error', 'Failed to send notification: ' + error.message);
    }
}

// Show notification (fallback for testing)
function showNotification(title, message) {
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: message,
                icon: 'icon-192.png',
                badge: 'badge-72.png'
            });
        });
    } else if (Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: 'icon-192.png'
        });
    }
}

// Add notification to history
function addToHistory(title, message) {
    const timestamp = new Date().toLocaleTimeString();
    notificationHistory.unshift({ title, message, timestamp });
    if (notificationHistory.length > 50) {
        notificationHistory.pop();
    }
    localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
    loadHistory();
}

// Load and display history
function loadHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    if (notificationHistory.length === 0) {
        historyList.innerHTML = '<li class="empty-state">No notifications yet</li>';
    } else {
        notificationHistory.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.innerHTML = `
                <div class="history-item-title">${item.title}</div>
                <div>${item.message}</div>
                <div class="history-item-time">${item.timestamp}</div>
            `;
            historyList.appendChild(li);
        });
    }
}

// Clear notification history
function clearHistory() {
    if (confirm('Are you sure you want to clear notification history?')) {
        notificationHistory = [];
        localStorage.setItem('notificationHistory', JSON.stringify(notificationHistory));
        loadHistory();
    }
}

// Copy subscription endpoint
function copySubscriptionEndpoint() {
    const details = document.getElementById('subscriptionDetails').textContent;
    navigator.clipboard.writeText(details).then(() => {
        alert('Subscription endpoint copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Install app
function installApp() {
    const deferredPrompt = window.deferredPrompt;
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('App installed');
                addToHistory('Installation', 'App successfully installed');
            }
            window.deferredPrompt = null;
        });
    } else {
        showNotification('Installation', 'App is already installed or not available');
    }
}

// Update service worker
async function updateServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();
        showNotification('Update Check', 'Service worker has been updated');
        addToHistory('Update', 'Service worker updated successfully');
    } catch (error) {
        console.error('Update error:', error);
        showNotification('Update Error', 'Failed to update service worker');
    }
}

// Clear cache
async function clearCache() {
    if (confirm('Are you sure you want to clear the app cache?')) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            showNotification('Cache Cleared', 'App cache has been cleared');
            addToHistory('Cache', 'App cache cleared successfully');
        } catch (error) {
            console.error('Cache clear error:', error);
            showNotification('Error', 'Failed to clear cache');
        }
    }
}

// Setup install prompt
function setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        window.deferredPrompt = deferredPrompt;
        showInstallPrompt();
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        dismissInstallPrompt();
        addToHistory('Installation', 'App installed from home screen');
    });
}

// Show install prompt
function showInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    const btn = document.getElementById('installPromptBtn');

    if (prompt && btn) {
        prompt.classList.remove('hidden');
        btn.addEventListener('click', () => {
            const deferredPrompt = window.deferredPrompt;
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('App installed');
                    }
                    window.deferredPrompt = null;
                    dismissInstallPrompt();
                });
            }
        });
    }
}

// Dismiss install prompt
function dismissInstallPrompt() {
    const prompt = document.getElementById('installPrompt');
    if (prompt) {
        prompt.classList.add('hidden');
    }
}

// Check subscription status on page load
function checkSubscriptionStatus() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.getSubscription().then(subscription => {
                if (subscription) {
                    updatePermissionStatus();
                }
            });
        });
    }
}