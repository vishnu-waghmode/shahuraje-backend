// MPIN सेव्ह करण्याचे लॉजिक
export const setAppMpin = (mpin: string) => {
  localStorage.setItem('user_mpin', mpin);
  localStorage.setItem('has_mpin', 'true');
};

// MPIN बरोबर आहे की नाही ते तपासण्याचे लॉजिक
export const verifyAppMpin = (enteredMpin: string): boolean => {
  const savedMpin = localStorage.getItem('user_mpin');
  return savedMpin === enteredMpin;
};

// MPIN आधी सेट केला आहे का ते तपासणे
export const checkHasMpin = (): boolean => {
  return localStorage.getItem('has_mpin') === 'true';
};

// ॲप लॉक झाले आहे का ते तपासणे
export const isAppLocked = (): boolean => {
  return localStorage.getItem('app_locked') === 'true';
};

// ॲप लॉक करणे (लॉगआउटसाठी)
export const lockApp = () => {
  localStorage.setItem('app_locked', 'true');
};

// ॲप अनलॉक करणे
export const unlockApp = () => {
  localStorage.setItem('app_locked', 'false');
};