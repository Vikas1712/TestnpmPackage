/**
 * Creates a base64 token using the provided app URL, username, and password.
 * This function first checks if the appUrl, username, and password are provided.
 * If any of these are missing, it throws an error.
 * It then retrieves the environment constants for the provided app URL.
 * Finally, it creates a base64 encoded string from the username and password and returns it.
 *
 * @param {string} appUrl - The URL of the application.
 * @param {string} username - The username for authentication.
 * @param {string} password - The password for authentication.
 * @returns {string} The base64 token.
 * @throws {Error} If the appUrl, username, or password are missing.
 *
 * @example
 * import { createBase64Token } from "playwright-helper";
 * const token = createBase64Token("https://practiceautomation.com","username", "password");
 */
export function createBase64Token(appUrl: string, username: string, password: string): string {
  if (!appUrl) {
    throw new Error('appName is missing in configuration while calling createAccessToken method');
  }
  if (!username) {
    throw new Error('Username is missing in configuration while calling createBase64Token method');
  }
  if (!password) {
    throw new Error('Password is missing in configuration while calling createBase64Token method');
  }
  const btoa = (str: string) => Buffer.from(str).toString('base64');
  const credentialsBase64 = btoa(`${username}:${password}`);
  return credentialsBase64.toString();
}
