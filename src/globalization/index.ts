import { createLanguageFile, extractValue, parseParams, requirements, translateFile } from './helper';

export default async function () {
  const [, , inputFile, ...args] = process.argv;
  const params = parseParams(args);
  const outputFileName = String(params.output || params.o || params.out || 'output.json');
  requirements(inputFile);
  
  if (params.lang || params.l || params.language) {
    console.log("Creating language file ...");
    createLanguageFile(inputFile, outputFileName);
  }

  if (params.trans || params.t || params.translate) {
    console.log("Translating file ...");
    await translateFile(inputFile, outputFileName);
  }

  if (params.extract || params.e) {
    console.log("Extracting file ...");
    extractValue(inputFile);
  }
  process.exit(0);
};

