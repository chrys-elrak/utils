import fs from "fs";
import { usage } from "./usage";

let outputFileName = '';

export const parseParams = (args: string[]) => {
    const params: { [key: string]: string | boolean } = {};
    const paramsArray = args.slice(1);
    paramsArray.forEach((param: string) => {
        const [key, value] = param.split("=");
        params[key] = value || true;
    });
    return params;
};

export const requirements = (inputFilePath: string) => {
    if (!inputFilePath) {
        console.log("You must enter file input");
        console.log(usage);
        process.exit(1);
    }

    if (!fs.existsSync(inputFilePath)) {
        console.log(`"${inputFilePath}" does not exist`);
        process.exit(1);
    }

    if (!outputFileName.endsWith(".json")) {
        outputFileName += ".json";
    }
};

export const readFile = (inputFilePath: string) => {
    try {
        return JSON.parse(fs.readFileSync(inputFilePath, "utf8"));
    } catch (e: any) {
        if (e.message.includes("JSON")) {
            console.log(` "${inputFilePath}" is not valid JSON`);
        } else {
            console.log(`Failed to read "${inputFilePath}"`);
        }
        process.exit(1);
    }
};

export const writeFile = (data: { [key: string]: string }) => {
    try {
        fs.writeFileSync(outputFileName, JSON.stringify(data, null, 4), "utf8");
    } catch (e) {
        console.error("Failed to write file");
        process.exit(1);
    }
};

export const createLanguageFile = () => {
    const data = readFile('');
    const out: { [key: string]: string } = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            out[data[key]] = data[key];
        }
    }
    writeFile(out);
};

export const question = (text: string): Promise<string> => {
    const readline = require("readline");
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve, reject) => {
        rl.question(text, (resp: string) => {
            resolve(resp);
            rl.close();
        });
    });
};

export const translateFile = async () => {
    const data = readFile('');
    let i = 1;
    let length = Object.keys(data).length;
    let quit = false;
    for (const key in data) {
        i++;
        if (key !== data[key]) {
            continue;
        }
        if (data.hasOwnProperty(key)) {
            let response = "y";
            let translation = "";
            do {
                translation = ((await question(`${i}/${length}>> ${key}: `)) || "").trim();
                response = (
                    (await question(`Is this correct: ${translation} ? (y/n/quit)`)) ||
                    "y"
                ).toLowerCase();

                if (response !== "n") {
                    data[key] = translation;
                }
                if (response === "q") {
                    quit = true;
                    break;
                }
            } while (response === "n" || translation === "");
        }
        if (quit) {
            break;
        }
    }
    const response = ((await question(`All correct ?(y/n)`)) || "y").toLowerCase();
    if (response === "n") {
        translateFile();
    } else {
        writeFile(data);
        console.log(`File saved as '${outputFileName}'`);
    }
};

export const extractValue = () => {
    const data = readFile('');
    const fileName = outputFileName.split(".").slice(0, -1).join("") + ".txt";
    const out = fs.createWriteStream(fileName, { flags: "w" });
    for (const value of Object.values(data)) {
        out.write(value + "\n");
    }
};
