// १. MPIN save करणे
export const setAppMpin = (mpin: string) => {
  localStorage.setItem('user_mpin', mpin);
  localStorage.setItem('has_mpin', 'true');
};

// २. MPIN बरोबर आहे का ते तपासणे
export const verifyAppMpin = (enteredMpin: string): boolean => {
  const savedMpin = localStorage.getItem('user_mpin');
  return savedMpin === enteredMpin;
};

// ३. युझरने MPIN सेट केला आहे का?
export const checkHasMpin = (): boolean => {
  return localStorage.getItem('has_mpin') === 'true';
};

// ४. ॲप अनलॉक करणे (MPIN बरोबर टाकल्यावर)
export const unlockApp = () => {
  sessionStorage.setItem('session_active', 'true');
  localStorage.removeItem('background_exit_timestamp');
};

// ५. ॲप लॉक करणे (Profile/Logout किंवा मॅन्युअल लॉकसाठी) 🔥 ही मेथड आवश्यक होती
export const lockApp = () => {
  sessionStorage.removeItem('session_active');
  localStorage.removeItem('background_exit_timestamp');
};

// ६. बॅकग्राउंड वेळ नोंदवणे
export const recordBackgroundTime = () => {
  localStorage.setItem('background_exit_timestamp', Date.now().toString());
};

// ७. बॅकग्राउंड वेळ पुसणे
export const clearBackgroundTime = () => {
  localStorage.removeItem('background_exit_timestamp');
};

// ८. मुख्य सुरक्षा तपासणी (३० सेकंद किंवा पूर्ण बंद)
export const isAppLocked = (): boolean => {
  if (!checkHasMpin()) return false;

  // ॲप पूर्ण बंद केले असेल तर लगेच लॉक
  const isSessionAlive = sessionStorage.getItem('session_active') === 'true';
  if (!isSessionAlive) {
    return true;
  }

  // मिनिमाइझ केल्यास ३० सेकंदांनंतर लॉक
  const exitTime = localStorage.getItem('background_exit_timestamp');
  if (exitTime) {
    const parsedTime = parseInt(exitTime, 10);
    if (!isNaN(parsedTime)) {
      const elapsedSeconds = (Date.now() - parsedTime) / 1000;
      if (elapsedSeconds >= 30) {
        lockApp();
        return true;
      }
    }
  }

  return false;
};