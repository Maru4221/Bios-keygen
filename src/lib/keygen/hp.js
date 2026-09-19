import { Crc32 } from "./cryptoUtils.js";
import { makeSolver } from "./utils.js";

function hpAmiKeygen(input) {
    if (input.length !== 8) return undefined;
    const salt = Uint8Array.from([0xb9, 0xed, 0xf5, 0x69, 0x9d, 0x16, 0x49, 0xf9, 0x8c, 0x5f, 0x7c, 0xb3, 0x68, 0x3c, 0xd4, 0xa7]);
    const backdoor = parseInt(input, 16);
    let temp = new Uint8Array(20);
    const crc = new Crc32();
    for (let i = 0; i < 0x10; i++) temp[i] = salt[i] ^ 0x36;
    temp[0x10] = backdoor & 0xFF; temp[0x11] = (backdoor >>> 8) & 0xFF; temp[0x12] = (backdoor >>> 16) & 0xFF; temp[0x13] = (backdoor >>> 24) & 0xFF;
    crc.update(temp);
    const next = crc.digest();
    for (let i = 0; i < 0x10; i++) temp[i] = salt[i] ^ 0x5C;
    temp[0x10] = next & 0xFF; temp[0x11] = (next >>> 8) & 0xFF; temp[0x12] = (next >>> 16) & 0xFF; temp[0x13] = (next >>> 24) & 0xFF;
    crc.reset(); crc.update(temp);
    return crc.hexdigest();
}

export const hpAMISolver = makeSolver({
    name: "hpAMI",
    description: "HP AMI BIOS (8 hex chars)",
    examples: ["A7AF422F"],
    inputValidator: (s) => /^[0-9ABCDEF]{8}$/i.test(s),
    fun: (input) => {
        const output = hpAmiKeygen(input);
        return output ? [output] : [];
    }
});

const table1 = {
    "1": "3", "0": "1", "3": "F", "2": "7", "5": "Q", "4": "V", "7": "X", "6": "G", "9": "O", "8": "U", "a": "C", "c": "E",
    "b": "P", "e": "M", "d": "T", "g": "H", "f": "8", "i": "Y", "h": "Z", "k": "S", "j": "W", "m": "4", "l": "K", "o": "J",
    "n": "9", "q": "5", "p": "2", "s": "N", "r": "B", "u": "L", "t": "A", "w": "D", "v": "6", "y": "I", "x": "4", "z": "0"
};

const table2 = {
    "1": "3", "0": "1", "3": "F", "2": "7", "5": "Q", "4": "V", "7": "X", "6": "G", "9": "O", "8": "U", "a": "C", "c": "E",
    "b": "P", "e": "M", "d": "T", "g": "H", "f": "8", "i": "Y", "h": "Z", "k": "S", "j": "W", "m": "4", "l": "K", "o": "J",
    "n": "9", "q": "5", "p": "2", "s": "N", "r": "B", "u": "L", "t": "A", "w": "D", "v": "6", "y": "I", "x": "R", "z": "0"
};

function hpMiniKeygen(serial) {
    let p1 = "", p2 = "";
    serial = serial.toLowerCase();
    for (let c of serial) { p1 += table1[c]; p2 += table2[c]; }
    return p1 === p2 ? [p1.toLowerCase()] : [p1.toLowerCase(), p2.toLowerCase()];
}

export const hpMiniSolver = makeSolver({
    name: "hpMini",
    description: "HP/Compaq Mini Netbooks (10 chars)",
    examples: ["CNU1234ABC"],
    inputValidator: (s) => /^[0-9A-Z]{10}$/i.test(s),
    fun: hpMiniKeygen
});
