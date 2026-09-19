import { asciiToKeys, keysToAscii, reversedScanCodes } from "./utils.js";

const digitsOnly = "123456789".split("");
const lettersOnly = "abcdefghijklmnopqrstuvwxyz".split("");

const defaultPhoenix = {
    shift: 0,
    salt: 0,
    dictionary: lettersOnly,
    minLen: 3,
    maxLen: 7
};

function badCRC16(pwd, salt = 0) {
    let hash = salt;
    for (let c = 0; c < pwd.length; c++) {
        hash ^= pwd[c];
        for (let i = 8; i--;) {
            if (hash & 1) hash = (hash >> 1) ^ 0x2001;
            else hash = (hash >> 1);
        }
    }
    return hash;
}

function searchBadCRC16(pwd, salt, requiredHash, minLen) {
    minLen--;
    let hash = salt;
    for (let c = 0; c < pwd.length; c++) {
        hash ^= pwd[c];
        for (let i = 8; i--;) {
            if (hash & 1) hash = (hash >> 1) ^ 0x2001;
            else hash = (hash >> 1);
        }
        if (c >= minLen && hash === requiredHash) return c + 1;
    }
    return -1;
}

function generatePhoenixPassword(encodedPwd, characters = lettersOnly) {
    let rnd = Math.random() * characters.length;
    for (let i = 0; i < encodedPwd.length; i++) {
        let index = Math.floor(rnd % characters.length);
        encodedPwd[i] = reversedScanCodes[characters[index]];
        rnd *= encodedPwd.length;
    }
}

function bruteForce(hash, salt = 0, characters = lettersOnly, minLen = 3, maxLen = 7) {
    let encodedPwd = Array(maxLen).fill(0);
    if (hash > 0x3FFF) return "BadHash";
    let kk = 0;
    while (true) {
        kk++;
        if (kk > 7000000) return "NotFound";
        generatePhoenixPassword(encodedPwd, characters);
        let found = searchBadCRC16(encodedPwd, salt, hash, minLen);
        if (found !== -1) return keysToAscii(encodedPwd.slice(0, found));
    }
}

function makePhoenixSolver(description = {}) {
    for (let key in defaultPhoenix) {
        if (description[key] === undefined) description[key] = defaultPhoenix[key];
    }
    const info = {
        shift: description.shift,
        salt: description.salt,
        dictionary: description.dictionary,
        minLen: description.minLen,
        maxLen: description.maxLen
    };
    let keygen = (code) => {
        let password = bruteForce(parseInt(code, 10) + info.shift, info.salt, info.dictionary, info.minLen, info.maxLen);
        return typeof password === "string" && !["BadHash", "NotFound"].includes(password) ? [password] : [];
    };
    let cleaner = (code) => code.trim().replace(/[-\s]/gi, "");
    let validator = (s) => /^[0-9]{5}$/i.test(s);
    let solver = (code) => {
        let cleanCode = cleaner(code);
        return validator(cleanCode) ? keygen(cleanCode) : [];
    };
    solver.biosName = description.name;
    solver.validator = validator;
    solver.cleaner = cleaner;
    solver.keygen = keygen;
    solver.examples = ["12345"];
    solver.info = info;
    if (description.description) solver.description = description.description;
    return solver;
}

export const phoenixSolver = makePhoenixSolver({ name: "phoenix", description: "Generic Phoenix" });
export const phoenixHPCompaqSolver = makePhoenixSolver({ name: "phoenixHP", description: "HP/Compaq Phoenix", salt: 17232 });
export const phoenixFsiSolver = makePhoenixSolver({ name: "phoenixFSI", description: "Fujitsu-Siemens Phoenix", salt: 65, dictionary: digitsOnly });
export const phoenixFsiLSolver = makePhoenixSolver({ name: "phoenixFSIModelL", description: "Fujitsu-Siemens (model L) Phoenix", shift: 1, salt: "L".charCodeAt(0), dictionary: digitsOnly });
export const phoenixFsiPSolver = makePhoenixSolver({ name: "phoenixFSIModelP", description: "Fujitsu-Siemens (model P) Phoenix", shift: 1, salt: "P".charCodeAt(0), dictionary: digitsOnly });
export const phoenixFsiSSolver = makePhoenixSolver({ name: "phoenixFSIModelS", description: "Fujitsu-Siemens (model S) Phoenix", shift: 1, salt: "S".charCodeAt(0), dictionary: digitsOnly });
export const phoenixFsiXSolver = makePhoenixSolver({ name: "phoenixFSIModelX", description: "Fujitsu-Siemens (model X) Phoenix", shift: 1, salt: "X".charCodeAt(0), dictionary: digitsOnly });
