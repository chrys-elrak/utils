const fs = require("fs");
const [, , ...args] = process.argv;

let outputFileName = "output.json";
const inputFilePath = args[0];

const parseParams = () => {
  const params = {};
  const paramsArray = args.slice(1);
  paramsArray.forEach((param) => {
    const [key, value] = param.split("=");
    params[key] = value || true;
  });
  return params;
};

const requirements = () => {
  if (!inputFilePath) {
    console.log("You must enter file input");
    process.exit(1);
  }

  if (!fs.existsSync(inputFilePath)) {
    console.log("File does not exist");
    process.exit(1);
  }

  if (!outputFileName.endsWith(".json")) {
    outputFileName += ".json";
  }
};

const readFile = () => {
  try {
    return JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
  } catch (e) {
    if (e.message.includes("JSON")) {
      console.log("Input file is not valid JSON");
    } else {
      console.log("Failed to read file");
    }
    process.exit(1);
  }
};

const writeFile = (data) => {
  try {
    fs.writeFileSync(outputFileName, JSON.stringify(data, null, 4), "utf8");
  } catch (e) {
    console.error("Failed to write file");
    process.exit(1);
  }
};

const createLanguageFile = () => {
  const data = readFile();
  const out = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      out[data[key]] = data[key];
    }
  }
  writeFile(out);
};

const question = (text) => {
  const readline = require("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve, reject) => {
    rl.question(text, (resp) => {
      resolve(resp);
      rl.close();
    });
  });
};

const translateFile = async () => {
  const data = readFile();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      let response = "y";
      let translation = "";
      do {
        translation = ((await question(`${key}: `)) || "").trim();
        response = (
          (await question(`Is this correct: ${translation} ? (y/n)`)) || "y"
        ).toLowerCase();
        if (response !== "n") {
          data[key] = translation;
        }
      } while (response === "n" || translation === "");
    }
  }
  console.table(data);
  response = ((await question(`All correct ?(y/n)`)) || "y").toLowerCase();
  if (response === "n") {
    translateFile();
  } else {
    writeFile(data);
    console.log(`File saved as '${outputFileName}'`);
  }
};

const main = async () => {
  const params = parseParams();
  outputFileName = params.output || params.o || params.out || outputFileName;
  requirements();
  console.log(params)
  if (params.lang || params.l || params.language) {
    console.log("Creating language file: OK");
    createLanguageFile();
  }

  if (params.trans || params.t || params.translate) {
    console.log("Translating file ...");
    await translateFile();
  }
  process.exit(0);
};

main();
