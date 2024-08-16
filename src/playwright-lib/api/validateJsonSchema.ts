import { expect } from '@playwright/test';
import Ajv, { AnySchema } from 'ajv';
import path from 'path';
import { createSchema } from 'genson-js';
import * as fs from 'fs/promises';

/**
 * Creates a JSON schema file from the provided JSON object and saves it to the specified folder and file name.
 * @param folderName - The name of the folder where the schema file will be saved.
 * @param fileName - The name of the schema file (without the file extension).
 * @param json - The JSON object used to generate the schema.
 * @returns A Promise that resolves when the schema file has been successfully created and saved.
 */
async function createJsonSchema(folderName: string, fileName: string, json: object) {
  try {
    await fs.mkdir(navigateToRootFolder(folderName), { recursive: true });
    const schema = createSchema(json);
    const schemaString = JSON.stringify(schema, null, 2);
    const schemaFilePath = navigateToRootFolder(`${folderName}/${fileName}_schema.json`);

    await writeJsonFile(schemaFilePath, schemaString);
    console.log(
      `The JSON schema has been successfully created and saved.\nIt is located under the 'api-schema/${folderName}' directory.\n`,
    );
  } catch (err) {
    console.error(err);
  }
}

/**
 * Writes the provided data as a JSON file at the specified location.
 * @param location The file path where the JSON file should be written.
 * @param data The JSON data to be written.
 */
async function writeJsonFile(location: string, data: string) {
  try {
    await fs.writeFile(location, data);
  } catch (err) {
    console.error(err);
  }
}

/**
 * Constructs the absolute path to a file within the 'api-schema' directory located at the root of the project.
 *
 * This function first retrieves the current working directory (root directory of the project) using `process.cwd()`.
 * It then uses the `path.join` method to construct the absolute path to the file within the 'api-schema' directory.
 *
 * @param {string} fileName - The name of the file located within the 'api-schema' directory.
 * @returns {string} The absolute path of the specified file within the 'api-schema' directory.
 *
 */
function navigateToRootFolder(fileName: string): string {
  const rootDir = process.cwd(); // Get the root directory path based on the operating system
  return path.join(rootDir, 'api-schema', fileName);
}

/**
 * Validates an object against a JSON schema.
 *
 * This function first checks if the `createSchema` parameter is true. If it is, it calls the `createJsonSchema` function
 * to create a new JSON schema based on the provided `folderName`, `fileName`, and `body`.
 * It then loads the existing schema file and validates the provided `body` against it.
 *
 * @param {string} folderName - The path to the directory containing the JSON schema file.
 * @param {string} fileName - The name of the JSON schema file. The full name will be `${fileName}_schema.json`.
 * @param {object} body - The object to validate against the JSON schema.
 * @param {boolean} [createSchema=false] - Whether to create the JSON schema if it doesn't exist.
 * It is located under the 'api-schema/search' root directory
 *
 * @example
 *    const body = await response.json();
 *
 *    // This will run the assertion against the existing schema file
 *    await validateJsonSchema("search, "POST_search_Adviseur", body);
 *
 *    // This will create or overwrite the schema file
 *    await validateJsonSchema("search, "POST_search_Adviseur", body, true);
 */
export async function validateJsonSchema(
  folderName: string,
  fileName: string,
  body: object,
  createSchema: boolean = false,
) {
  if (createSchema) {
    await createJsonSchema(folderName, fileName, body);
  }
  const schemaFilePath = navigateToRootFolder(`${folderName}/${fileName}_schema.json`);

  let existingSchema: AnySchema;
  try {
    const schemaFileContent = require(schemaFilePath);
    existingSchema = schemaFileContent.default || schemaFileContent; // Handle ES Module and CommonJS module
  } catch (error) {
    console.error('Error loading schema file:', error);
    return;
  }
  const ajv = new Ajv({ allErrors: false });
  const validate = ajv.compile(existingSchema);
  const validRes = validate(body);

  if (!validRes) {
    console.log('SCHEMA ERRORS:', JSON.stringify(validate.errors), '\nRESPONSE BODY:', JSON.stringify(body));
  }
  expect(validRes).toBe(true);
}
