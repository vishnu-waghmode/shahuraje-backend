import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shahuraje.app',
  appName: 'Shahuraje Krushi',
  webDir: 'dist',
  server: {
    url: 'https://shahuraje-app.onrender.com', // तुमची Render ची लाईव्ह साईट URL
    cleartext: true
  }
};

export default config;