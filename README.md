# Push Notification App

A comprehensive, full-featured push notification web application built with Progressive Web App (PWA) technology. This app provides a complete solution for managing and testing push notifications with offline support.

## Features

### Core Functionality
- ✅ **Push Notifications**: Send and receive push notifications
- ✅ **Web Push Protocol**: Full Web Push API implementation
- ✅ **Service Worker**: Complete service worker setup with caching
- ✅ **Offline Support**: Works perfectly offline with intelligent caching
- ✅ **PWA Features**: Full progressive web app capabilities

### User Features
- 📱 **Responsive Design**: Works on all devices (desktop, tablet, mobile)
- 🌓 **Dark Mode Support**: Automatic dark mode detection and support
- 📊 **Status Dashboard**: Real-time status of browser capabilities
- 🔔 **Subscription Management**: Easy subscribe/unsubscribe functionality
- 🧪 **Test Notifications**: Send custom test notifications
- 📜 **History Tracking**: Keep track of all notifications received
- ⚙️ **App Controls**: Manage service worker and cache
- 📦 **Installable**: Add to home screen on mobile devices

### Technical Features
- **Service Worker**: Intelligent caching strategy (Network-first for navigation, Cache-first for assets)
- **Push API**: Full support for Web Push Protocol
- **Notification API**: Rich notification features with actions
- **Local Storage**: Persistent storage for subscriptions and history
- **Modern JavaScript**: ES6+ with async/await
- **Responsive Layout**: CSS Grid and Flexbox
- **Manifest File**: Complete PWA manifest with app metadata

## Project Structure

```
├── index.html          # Main HTML file with UI
├── styles.css          # Complete styling with dark mode
├── app.js              # Main application logic
├── sw.js               # Service worker implementation
├── sw-register.js      # Service worker registration
├── manifest.json       # PWA manifest file
├── icon-192.png        # App icon (192x192)
├── icon-512.png        # App icon (512x512)
├── badge-72.png        # Badge icon for notifications
└── README.md           # This file
```

## Installation & Setup

### Prerequisites
- Modern web browser with PWA support (Chrome, Firefox, Edge, Safari 16+)
- HTTPS enabled (required for push notifications)
- Service Worker support

### Getting Started

1. **Clone or download the repository**
2. **Host on HTTPS server** (required for Service Workers)
   - Use GitHub Pages, Vercel, Netlify, or your own server
   - Local testing: Use `python -m http.server` with `--certs` or ngrok for HTTPS

3. **Open the app** in your browser
4. **Enable notifications** when prompted
5. **Send test notifications** to verify setup

### HTTPS Setup for Local Development

For local testing with HTTPS:

```bash
# Option 1: Using Python with SSL
python -m http.server 8000

# Option 2: Using ngrok
ngrok http 8000

# Option 3: Using a local HTTPS server
https-server -c-1 -s . -p 8080
```

## Usage

### Enabling Notifications

1. Click "Enable Notifications" button
2. Accept the permission request in your browser
3. Subscribe to push notifications
4. Your subscription endpoint will be displayed

### Sending Test Notifications

1. Enter notification title and message
2. (Optional) Add custom icon and badge URLs
3. Click "Send Test Notification"
4. Notification will appear on your device

### Managing Subscription

- **View Subscription**: Check your subscription endpoint details
- **Copy Endpoint**: Copy endpoint for server-side use
- **Disable Notifications**: Unsubscribe from push notifications
- **Update Service Worker**: Check for and update service worker
- **Clear Cache**: Remove all cached data

## Backend Integration

To integrate with a backend server for sending push notifications:

### 1. Generate VAPID Keys

```bash
# Using web-push package
npm install -g web-push
web-push generate-vapid-keys
```

### 2. Update Application Server Key

In `app.js`, update the `getApplicationServerKey()` function:

```javascript
function getApplicationServerKey() {
    return 'YOUR_VAPID_PUBLIC_KEY';
}
```

### 3. Server-Side Sending

Example Node.js with web-push:

```javascript
const webpush = require('web-push');

webpush.setVapidDetails(
    'mailto:your-email@example.com',
    'YOUR_VAPID_PUBLIC_KEY',
    'YOUR_VAPID_PRIVATE_KEY'
);

const subscription = req.body.subscription; // From client
const payload = JSON.stringify({
    title: 'New Notification',
    body: 'You have a new message',
    icon: '/icon-192.png'
});

webpush.sendNotification(subscription, payload)
    .catch(error => console.error('Error sending notification:', error));
```

## API Reference

### Core Functions

#### `subscribeToNotifications()`
Subscribe the user to push notifications.

#### `unsubscribeFromNotifications()`
Unsubscribe the user from push notifications.

#### `sendTestNotification()`
Send a test notification immediately.

#### `addToHistory(title, message)`
Add notification to history log.

#### `clearHistory()`
Clear notification history.

#### `checkBrowserSupport()`
Check browser capabilities for PWA features.

#### `installApp()`
Trigger app installation prompt.

#### `updateServiceWorker()`
Check for and update service worker.

#### `clearCache()`
Clear app cache.

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| Push API | ✅ | ✅ | ⚠️ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ✅ | ✅ | ✅ |

## Performance

- **Lighthouse Score**: Targets 90+ in all categories
- **Cache Strategy**: Intelligent caching minimizes network requests
- **Offline Support**: Full functionality available offline
- **Bundle Size**: Minimal dependencies, optimized assets

## Security

- HTTPS required for all features
- Content Security Policy compatible
- No third-party dependencies
- Secure subscription handling
- Safe localStorage usage

## Troubleshooting

### Notifications Not Working
1. Ensure HTTPS is enabled
2. Check browser notification permissions
3. Verify Service Worker is active (DevTools > Application > Service Workers)
4. Clear cache and reinstall service worker

### Service Worker Not Registering
1. Check browser console for errors
2. Ensure files are on HTTPS
3. Verify manifest.json is valid JSON
4. Check CORS headers if hosted remotely

### Push Notifications Not Received
1. Verify VAPID keys are correctly set
2. Check subscription endpoint is valid
3. Ensure backend server has correct public key
4. Check service worker push event listener

## Development

### Local Development

```bash
# Start local HTTPS server
python -m http.server 8000

# Or using Node.js
npx http-server -p 8000 -S -C
```

### Testing

- Open DevTools (F12)
- Go to Application tab
- Test Service Worker, Cache, Storage
- Send test notifications
- Check network requests

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

## License

MIT License - Feel free to use this project for personal and commercial use.

## Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Open an issue on GitHub
4. Check MDN documentation for Push API

## Resources

- [Web Push Protocol](https://tools.ietf.org/html/draft-thomson-webpush-protocol)
- [Push API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notification)

## Changelog

### Version 1.0.0
- Initial release
- Complete push notification functionality
- PWA features
- Service worker implementation
- Offline support
- Notification history
- Test notification feature
- Responsive design
- Dark mode support

---

**Made with ❤️ for better notifications**