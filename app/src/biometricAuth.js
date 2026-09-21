import { BiometricAuth } from '@aparajita/capacitor-biometric-auth';

export const isBiometricAvailable = async () => {
  try {
    if (!BiometricAuth) return false;
    const info = await BiometricAuth.checkBiometry();
    return Boolean(info && info.isAvailable);
  } catch (err) {
    console.warn('Biometric not available:', err);
    return false;
  }
};

export const authenticateWithBiometrics = async () => {
  try {
    if (!BiometricAuth) return false;
    const available = await isBiometricAvailable();
    if (!available) return false;

    await BiometricAuth.authenticate({
      reason: 'शाहूराजे ॲप अनलॉक करा',
      cancelTitle: 'रद्द करा',
      allowDeviceCredential: true
    });

    return true;
  } catch (err) {
    console.warn('Biometric auth error/cancelled:', err);
    return false;
  }
};