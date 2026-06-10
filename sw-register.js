// Service Worker Registration

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            console.log('Service Worker registered successfully:', registration);

            // Check for updates periodically
            setInterval(() => {
                registration.update();
            }, 60000); // Check every minute

            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('New Service Worker available');
                        // You can show a notification to the user here
                    }
                });
            });
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'NOTIFICATION_RECEIVED') {
            console.log('Notification received:', event.data);
        }
    });
}

// Handle page visibility to track active status
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('App is in background');
    } else {
        console.log('App is in foreground');
    }
});