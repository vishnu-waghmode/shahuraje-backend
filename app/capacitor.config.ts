import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shahuraje.app',
  appName: 'Shahuraje Krushi',
  webDir: 'dist',
  server: {
    url: 'https://shahuraje-app.onrender.com', 
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;