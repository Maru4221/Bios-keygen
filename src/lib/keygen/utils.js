export const keyboardDict = {
    2: "1", 3: "2", 4: "3", 5: "4", 6: "5", 7: "6", 8: "7", 9: "8",
    10: "9", 11: "0", 16: "q", 17: "w", 18: "e", 19: "r", 20: "t", 21: "y",
    22: "u", 23: "i", 24: "o", 25: "p", 30: "a", 31: "s", 32: "d", 33: "f",
    34: "g", 35: "h", 36: "j", 37: "k", 38: "l", 44: "z", 45: "x", 46: "c",
    47: "v", 48: "b", 49: "n", 50: "m"
};

function getRevKeys() {
    let result = {};
    for (let key in keyboardDict) {
        if (Object.prototype.hasOwnProperty.call(keyboardDict, key)) {
            result[keyboardDict[key]] = parseInt(key, 10);
        }
    }
    return result;
}

export const reversedScanCodes = getRevKeys();

export function keysToAscii(inKey) {
    let out = "";
    for (let key of inKey) {
        if (key === 0) {
            return out;
        }
        if (key in keyboardDict) {
            out += keyboardDict[key];
        } else {
            return "";
        }
    }
    return out;
}

export function asciiToKeys(password) {
    return password.split("").map((c) => {
        let code = reversedScanCodes[c];
        if (code === undefined) {
            throw new Error("Undefined scan code");
        } else {
            return code;
        }
    });
}

function cleanSerial(serial) {
    return serial.trim().replace(/-/gi, "");
}

export function makeSolver(description) {
    let solver = (code) => {
        let cleanCode = solver.cleaner(code);
        if (description.inputValidator(cleanCode)) {
            return description.fun(cleanCode);
        } else {
            return [];
        }
    };

    solver.biosName = description.name;
    solver.validator = description.inputValidator;

    if (description.cleaner) {
        solver.cleaner = description.cleaner;
    } else {
        solver.cleaner = cleanSerial;
    }

    solver.keygen = description.fun;

    if (description.examples) {
        solver.examples = description.examples;
    }

    if (description.description) {
        solver.description = description.description;
    }

    return solver;
}
