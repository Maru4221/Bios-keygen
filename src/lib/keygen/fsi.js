import { makeSolver } from "./utils.js";
import { Crc32 } from "./cryptoUtils.js";

function generateCRC16Table() {
    let table = [];
    for (let i = 0; i < 256; i++) {
        let crc = (i << 8);
        for (let j = 0; j < 8; j++) {
            crc = (crc << 1);
            if (crc & 0x10000) crc = crc ^ 0x1021;
        }
        table.push(crc & 0xFFFF);
    }
    return table;
}

const crc16Table = generateCRC16Table();

function fsiHexKeygen(serial) {
    const hashToString = (h) => [12, 8, 4, 0].reduce((acc, n) => acc + String.fromCharCode(48 + ((h >> n) % 16) % 10), "");
    const calculateHash = (w, t) => {
        let h = 0;
        for (let i = 0; i < w.length; i++) h = ((h << 8) ^ t[(w.charCodeAt(i) ^ (h >> 8)) % 256]) & 0xFFFF;
        return h;
    };
    if (serial.length === 20) serial = serial.slice(12, 20);
    return hashToString(calculateHash(serial.slice(0, 4), crc16Table)) + hashToString(calculateHash(serial.slice(4, 8), crc16Table));
}

function codeToBytes(code) {
    const nums = [parseInt(code.slice(0, 5), 10), parseInt(code.slice(5, 10), 10), parseInt(code.slice(10, 15), 10), parseInt(code.slice(15, 20), 10)];
    let acc = [];
    for (let v of nums) { acc.push(v % 256); acc.push(Math.floor(v / 256)); }
    return acc;
}

function fsi20DecOldKeygen(serial) {
    const interleave = (o, a1, a2) => {
        let a = [...o];
        a[a1[0]] = ((o[a2[0]] >> 4) | (o[a2[3]] << 4)) & 0xFF; a[a1[1]] = ((o[a2[0]] & 0x0F) | (o[a2[3]] & 0xF0));
        a[a1[2]] = ((o[a2[1]] >> 4) | (o[a2[2]] << 4) & 0xFF); a[a1[3]] = (o[a2[1]] & 0x0F) | (o[a2[2]] & 0xF0);
        return a;
    };
    const decryptCodeOld = (bytes) => {
        const xor = ":3-v@e4i";
        bytes = bytes.map((v, i) => v ^ xor.charCodeAt(i));
        [bytes[2], bytes[6]] = [bytes[6], bytes[2]];[bytes[3], bytes[7]] = [bytes[7], bytes[3]];
        bytes = interleave(bytes, [0, 1, 2, 3], [0, 1, 2, 3]); bytes = interleave(bytes, [4, 5, 6, 7], [6, 7, 4, 5]);
        bytes[0] = ((bytes[0] << 3) & 0xFF) | (bytes[0] >> 5); bytes[1] = ((bytes[1] << 5) & 0xFF) | (bytes[1] >> 3);
        bytes[2] = ((bytes[2] << 7) & 0xFF) | (bytes[2] >> 1); bytes[3] = ((bytes[3] << 4) & 0xFF) | (bytes[3] >> 4);
        bytes[5] = ((bytes[5] << 6) & 0xFF) | (bytes[5] >> 2); bytes[6] = ((bytes[6] << 1) & 0xFF) | (bytes[6] >> 7);
        bytes[7] = ((bytes[7] << 2) & 0xFF) | (bytes[7] >> 6);
        return bytes.map((b) => (b % 36).toString(36)).join("");
    };
    return decryptCodeOld(codeToBytes(serial));
}

function fsi24DecKeygen(serial) {
    const xor = "<7#&9?>s", t = codeToBytes(serial.slice(4));
    let b = [(t[3] & 0xF0) | (t[0] & 0x0F), (t[2] & 0xF0) | (t[1] & 0x0F), (t[5] & 0xF0) | (t[6] & 0x0F), (t[4] & 0xF0) | (t[7] & 0x0F), (t[7] & 0xF0) | (t[4] & 0x0F), (t[6] & 0xF0) | (t[5] & 0x0F), (t[1] & 0xF0) | (t[2] & 0x0F), (t[0] & 0xF0) | (t[3] & 0x0F)];
    b = b.map((v, i) => v ^ xor.charCodeAt(i));
    b[0] = ((b[0] << 1) & 0xFF) | (b[0] >> 7); b[1] = ((b[1] << 7) & 0xFF) | (b[1] >> 1); b[2] = ((b[2] << 2) & 0xFF) | (b[2] >> 6); b[3] = ((b[3] << 8) & 0xFF) | (b[3] >> 0); b[4] = ((b[4] << 3) & 0xFF) | (b[4] >> 5); b[5] = ((b[5] << 6) & 0xFF) | (b[5] >> 2); b[6] = ((b[6] << 4) & 0xFF) | (b[6] >> 4); b[7] = ((b[7] << 5) & 0xFF) | (b[7] >> 3);
    return b.map((v) => (v % 36).toString(36)).join("");
}

function fsi20DecNewKeygen(serial) {
    const k = ["4798156302", "7201593846", "5412367098", "6587249310", "9137605284", "3974018625", "8052974163"];
    return [0, 2, 5, 11, 13, 15, 16].map((v, i) => k[i].charAt(parseInt(serial.charAt(v), 10))).join("");
}

function fsiHex203Cd001Keygen(serial) {
    if (serial.length !== 24 || serial.toLowerCase().slice(0, 8) !== "203cd001") return [];
    let crc = new Crc32();
    crc.update(serial.toLowerCase().slice(8).split("").map(c => c.charCodeAt(0)));
    return [((~crc.digest()) >>> 0).toString(16).padStart(8, "0")];
}

export const fsiHexSolver = makeSolver({
    name: "fsiHex",
    description: "Fujitsu-Siemens (8 hex or 5x4 hex digits)",
    examples: ["DEADBEEF"],
    inputValidator: (s) => /^([0-9ABCDEF]{20}|[0-9ABCDEF]{8})$/i.test(s),
    fun: (code) => [fsiHexKeygen(code.toUpperCase())]
});

export const fsi20DecNewSolver = makeSolver({
    name: "fsiDecNew",
    description: "Fujitsu-Siemens decimal new (5x4)",
    examples: ["1234-4321-1234-4321-1234"],
    inputValidator: (s) => /^\d{20}$/i.test(s),
    fun: (code) => [fsi20DecNewKeygen(code)]
});

export const fsi20DecOldSolver = makeSolver({
    name: "fsiDecOld",
    description: "Fujitsu-Siemens decimal old (5x4)",
    examples: ["1234-4321-1234-4321-1234"],
    inputValidator: (s) => /^\d{20}$/i.test(s),
    fun: (code) => [fsi20DecOldKeygen(code)]
});

export const fsi24DecSolver = makeSolver({
    name: "fsi24Dec",
    description: "Fujitsu-Siemens decimal old (6x4)",
    examples: ["8F16-1234-4321-1234-4321-1234"],
    inputValidator: (s) => /^[0-9ABCDEF]{4}\d{20}$/i.test(s),
    fun: (code) => [fsi24DecKeygen(code)]
});

export const fsi24Hex203cSolver = makeSolver({
    name: "fsi24Hex203c",
    description: "Fujitsu-Siemens Hex (6x4) 203c-d001-...",
    examples: ["203cd0010000001de960227d"],
    inputValidator: (s) => /^[0-9ABCDEF]{24}$/i.test(s),
    fun: (code) => fsiHex203Cd001Keygen(code)
});
