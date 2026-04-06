import { app } from 'electron';

export const isDevelopment = (): boolean => {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.ELECTRON_IS_DEV === '1' ||
    !app.isPackaged
  );
};

export const getAppUrl = (path: string = ''): string => {
  if (isDevelopment()) {
    return `http://localhost:3000${path ? `/#${path}` : ''}`;
  }
  return ''; // Will use loadFile for production
};
