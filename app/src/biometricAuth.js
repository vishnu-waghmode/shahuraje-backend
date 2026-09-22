import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

// वेळ मर्यादा (Timeout) लावून कॉल सुरक्षित करणे
const withTimeout = (promise, ms = 4000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms))
  ]);
};

export const isBiometricAvailable = async () => {
  try {
    if (!BiometricAuth) return false;
    const info = await withTimeout(BiometricAuth.checkBiometry(), 2000);
    return Boolean(info && info.isAvailable);
  } catch (err) {
    console.warn('Biometric availability check failed:', err);
    return false;
  }
};

export const authenticateWithBiometrics = async () => {
  try {
    if (!BiometricAuth) return false;
    
    // बायोमेट्रिक प्रॉम्प्ट दाखवणे
    await withTimeout(
      BiometricAuth.authenticate({
        reason: 'शाहूराजे ॲप अनलॉक करा',
        cancelTitle: 'रद्द करा',
        allowDeviceCredential: true
      }),
      10000 // युझरला बोट लावण्यासाठी १० सेकंद वेळ
    );

    return true;
  } catch (err) {
    console.warn('Biometric authentication failed or timed out:', err);
    return false;
  }
};