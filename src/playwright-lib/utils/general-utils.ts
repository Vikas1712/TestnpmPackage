import { Locator } from '@playwright/test';

export const randomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'a';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const isLocator = (param: any): param is Locator =>
  typeof param === 'object' && param.toString().split('@')[0] === 'Locator';

export const getDate = (daysToAdd?: number): string => {
  const current = new Date();
  const mod = new Date(current);
  if (daysToAdd) mod.setDate(mod.getDate() + daysToAdd);
  const dd = String(mod.getDate()).padStart(2, '0');
  const mm = String(mod.getMonth() + 1).padStart(2, '0');
  const yyyy = mod.getFullYear();

  return dd + '-' + mm + '-' + yyyy;
};
