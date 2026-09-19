import { makeSolver, keysToAscii } from "./utils.js";

const rotationMatrix1 = [
    7, 1, 5, 3, 0, 6, 2, 5,
    5, 2, 3, 0, 6, 1, 7, 6,
    6, 1, 5, 2, 7, 1, 0, 3,
    3, 7, 6, 1, 0, 5, 2, 1,
    1, 5, 7, 3, 2, 0, 6, 4
];
const rotationMatrix2 = [
    1, 6, 2, 5, 7, 3, 0, 7,
    7, 1, 6, 2, 5, 0, 3, 0,
    0, 6, 5, 1, 1, 7, 2, 5,
    5, 2, 3, 7, 6, 2, 1, 3,
    3, 7, 6, 5, 0, 1, 7, 4
];
const rotationMatrix3 = Uint8Array.from([
    3, 6, 3, 1, 6, 7, 7, 7, 2, 6, 4, 3, 4, 6, 1, 7, 2, 1, 7, 7,
    5, 3, 3, 1, 2, 3, 1, 2, 1, 7, 4, 7, 6, 2, 4, 4, 1, 6, 1, 5,
    6, 6, 7, 5, 7, 7, 4, 3, 1, 1, 1, 6, 3, 2, 7, 3, 7, 3, 7, 3,
    5, 6, 4, 1, 1, 3, 6, 6, 1, 4, 3, 7, 6, 7, 5, 3, 6, 7, 6, 3,
    1, 3, 5, 7, 5, 6, 2, 2, 7, 5, 7, 1, 2, 3, 2, 1, 6, 4, 5, 3
]);

function keyToAscii(intKeys) {
    let out = "";
    for (let intKey of intKeys) {
        if (intKey === 0) return out;
        if (intKey < 32 || intKey > 127) return undefined;
        out += String.fromCharCode(intKey);
    }
    return out;
}

function decryptHash(hash, key, rotationMatrix) {
    let outhash = [];
    for (let i = 0; i < hash.length; i++) {
        const rotation = rotationMatrix[8 * key + i];
        const val = ((hash[i] << rotation) & 0xFF) | (hash[i] >> (8 - rotation));
        outhash.push(val);
    }
    return outhash;
}

function samsungKeygen(serial) {
    let hash = [];
    for (let i = 1; i < Math.floor(serial.length / 2); i++) {
        hash.push(parseInt(serial.charAt(2 * i) + serial.charAt(2 * i + 1), 16));
    }
    let key = parseInt(serial.substring(0, 2), 16) % 5;
    let calcScanCodePwd = (matrix) => keysToAscii(decryptHash(hash, key, matrix));
    let scanCodePassword = calcScanCodePwd(rotationMatrix1);
    if (scanCodePassword === "") scanCodePassword = calcScanCodePwd(rotationMatrix2);
    const asciiPassword1 = keyToAscii(decryptHash(hash, key, rotationMatrix1));
    const asciiPassword2 = keyToAscii(decryptHash(hash, key, rotationMatrix2));
    return [scanCodePassword, asciiPassword1, asciiPassword2].filter(Boolean);
}

function byteRol(val, shift) {
    return ((val << shift) & 0xff) | (val >> (8 - shift));
}

function nonprintable(sym) {
    return sym >= 127 || sym < 32;
}

export function samsung44HexKeygen(serial) {
    if (serial.length !== 44) return undefined;
    let hash = new Uint8Array(22);
    let password = "";
    for (let i = 21; i >= 0; i--) {
        hash[21 - i] = (parseInt(serial[i * 2 + 1], 16) << 4) | parseInt(serial[i * 2], 16);
    }
    const pwdLength = hash[0] >> 3;
    if (pwdLength > 20) return undefined;
    const key = (hash[1] % 5) * 20;
    for (let i = 0; i < pwdLength; i++) {
        const shift = rotationMatrix3[key + i];
        const sym = byteRol(byteRol(hash[i + 2], shift), 4);
        if (nonprintable(sym)) return undefined;
        password += String.fromCharCode(sym);
    }
    return password;
}

export const samsungSolver = makeSolver({
    name: "samsung",
    description: "Samsung (12, 14, 16, 18 hex digits)",
    examples: ["07088120410C0000"],
    inputValidator: (s) => /^[0-9ABCDEF]+$/i.test(s) && [12, 14, 16, 18].includes(s.length),
    fun: samsungKeygen
});

export const samsung44HexSolver = makeSolver({
    name: "samsung44Hex",
    description: "Samsung (44 hex digits)",
    examples: ["54574AAD6A8B1B9353F6FA66DCD2DA91B06DBD8E3204"],
    inputValidator: (s) => /^[0-9ABCDEF]{44}$/i.test(s),
    fun: (hash) => {
        const pwd = samsung44HexKeygen(hash);
        return pwd ? [pwd] : [];
    }
});
