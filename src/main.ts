import { createLanguageFile, extractValue, parseParams, requirements, translateFile } from './helper';

export const main = async () => {
  const [, , ...args] = process.argv;
  const params = parseParams(args);
  const outputFileName = String(params.output || params.o || params.out || 'output.json');
  requirements('');
  if (params.lang || params.l || params.language) {
    console.log("Creating language file: OK");
    createLanguageFile();
  }

  if (params.trans || params.t || params.translate) {
    console.log("Translating file ...");
    await translateFile();
  }

  if (params.extract || params.e) {
    console.log("Extracting file ...");
    extractValue();
  }
  process.exit(0);
};

