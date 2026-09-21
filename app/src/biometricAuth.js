import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

// डिव्हाइसमध्ये फिंगरप्रिंट उपलब्ध आहे का तपासणे
export const isBiometricAvailable = async () => {
  try {
    const info = await BiometricAuth.checkBiometry();
    return info.isAvailable;
  } catch (err) {
    console.log('Biometric not available on web/device:', err);
    return false;
  }
};

// फिंगरप्रिंट स्कॅन करणे
export const authenticateWithBiometrics = async () => {
  try {
    const available = await isBiometricAvailable();
    if (!available) return false;

    await BiometricAuth.authenticate({
      reason: 'शाहूराजे ॲप अनलॉक करण्यासाठी फिंगरप्रिंट स्कॅन करा',
      cancelTitle: 'रद्द करा',
      allowDeviceCredential: false
    });

    return true; // ऑथेंटिकेशन यशस्वी झाले
  } catch (err) {
    console.log('Biometric authentication failed or cancelled:', err);
    return false;
  }
};