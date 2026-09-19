import { makeSolver } from "./utils.js";
import { Crc64, Sha256, AES128 } from "./cryptoUtils.js";

const INSYDE_SALT = "Insyde Software Corp.";

export function insydeAcerSwitch(arr) {
    if (arr.length !== 32) throw new Error("Input array should have 32 length");
    const fun0 = (a) => {
        let o = new Uint8Array(16), k = 0;
        for (let i = 3; i >= 0; i--) for (let j = 0; j < 16; j += 4) o[k++] = a[i + j];
        return o;
    };
    const fun1 = (a) => {
        let o = new Uint8Array(16), k = 0;
        for (let i = 0; i < 4; i++) for (let j = 12; j >= 0; j -= 4) o[k++] = a[i + j];
        return o;
    };
    const fun2 = (a) => {
        let o = new Uint8Array(16), k = 0;
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) o[k++] = (a[((j + i) & 3) + i * 4] + i) & 0xFF;
        return o;
    };
    const fun3 = (a) => {
        let o = new Uint8Array(16), k = 0, a1 = 0, a2 = 0;
        for (let i = 0; i < 4; i++) { a1 ^= a[i * 5]; a2 ^= a[i * 3 + 3]; }
        for (let i = 0; i < 16; i++) { const p = (i & 1) === 0 ? a1 : a2; o[k++] = a[i] ^ p; }
        return o;
    };
    const fun4 = (a) => {
        let o = new Uint8Array(16), k = 0;
        for (let i = 0; i < 16; i++) {
            const t1 = a[i], t2 = a[(i + 1) & 0xF], p = t2 < t1 ? t2 : 0xFF;
            o[k++] = t1 ^ p;
        }
        return o;
    };
    const fun5 = (a) => {
        let o = new Uint8Array(16);
        for (let i = 0; i < 4; i++) {
            let acc = 0;
            for (let j = 0; j < 16; j += 4) acc ^= a[j + i];
            for (let j = 0; j < 16; j += 4) { const t = i + j; o[t] = (a[t] * acc) & 0xFF; }
        }
        return o;
    };
    const keyProcess = (a) => {
        let o = new Uint8Array(16);
        for (let i = 0; i < 16; i++) {
            let acc = 0;
            for (let j = 0; j < 8; j++) acc += a[((i >> 2) << 3) + j] * a[j * 4 + (i & 3)];
            o[i] = acc & 0xFF;
        }
        return o;
    };
    const temp = keyProcess(arr);
    switch (arr[8] % 6) {
        case 0: return fun0(temp);
        case 1: return fun1(temp);
        case 2: return fun2(temp);
        case 3: return fun3(temp);
        case 4: return fun4(temp);
        default: return fun5(temp);
    }
}

function acerInsydeKeygen(serial) {
    const rotatefun = (a) => {
        const idx = a[9] & 0xF;
        let o = new Uint8Array(16);
        for (let i = 0; i < o.length; i++) o[i] = a[((idx * 2 + 1) * i) % a.length];
        return o;
    };
    const inputBytes = Uint8Array.from(serial.split("").map((c) => c.charCodeAt(0) & 0xFF));
    const digest = (new Sha256(inputBytes)).digest();
    const key = insydeAcerSwitch(digest);
    const blockData = rotatefun(digest);
    const data = (new AES128(key)).encryptBlock(blockData);
    let crc = new Crc64(Crc64.ECMA_POLYNOMIAL);
    crc.update(data);
    return [crc.hexdigest()];
}

function insydeKeygen(serial) {
    const salt1 = INSYDE_SALT;
    const salt2 = ":\x16@>\x1496H\x07.\x0f\x0e\nG-MDGHBT";
    const serial2 = (parseInt(serial, 10).toString() + "\x00".repeat(8)).slice(0, 8);
    let p1 = "", p2 = "", p3 = "";
    for (let i = 0; i < 8; i++) {
        let b = (salt1.charCodeAt(i) + i) ^ serial.charCodeAt(i); p1 += (b % 10).toString();
        b = (salt1.charCodeAt(i) + i) ^ serial2.charCodeAt(i); p2 += (b % 10).toString();
        b = salt2.charCodeAt(i) ^ serial2.charCodeAt(i); p3 += (b % 10).toString();
    }
    return p1 === p2 ? [p1, p3] : [p1, p2, p3];
}

function hpInsydeKeygen(serial) {
    const match = /^i\s*(\d{8})$/i.exec(serial);
    if (!match) return [];
    const s = match[1];
    const salt1 = "c6B|wS^8", salt2 = INSYDE_SALT;
    let p1 = "", p2 = "";
    for (let i = 0; i < 8; i++) {
        let b = (salt1.charCodeAt(i) + i) ^ s.charCodeAt(i); p1 += (b % 10).toString();
        b = (salt2.charCodeAt(i) + i) ^ s.charCodeAt(i); p2 += (b % 10).toString();
    }
    return [p1, p2];
}

export const insydeSolver = makeSolver({
    name: "insydeH2O",
    description: "Insyde H2O BIOS (Acer, HP) (8 digits)",
    examples: ["03133610"],
    inputValidator: (s) => /^\d{8}$/i.test(s),
    fun: insydeKeygen
});

export const acerInsyde10Solver = makeSolver({
    name: "acerInsyde10",
    description: "Acer Insyde (10 digits)",
    examples: ["0173549286"],
    inputValidator: (s) => /^\d{10}$/i.test(s),
    fun: acerInsydeKeygen
});

export const hpInsydeSolver = makeSolver({
    name: "hpInsyde",
    description: "HP Insyde H2O (i 8 digits)",
    examples: ["i 70412809", "I 59170869"],
    inputValidator: (s) => /^i\s*\d{8}$/i.test(s),
    fun: hpInsydeKeygen
});
