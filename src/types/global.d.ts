declare global {
  interface Window {
    validateBasicProfile?: () => boolean;
    validateTechStack?: () => boolean;
    validateIceBreakers?: () => boolean;
    validateSharedLearnings?: () => boolean;
  }
}

export {}; 