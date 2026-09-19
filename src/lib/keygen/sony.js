import JSBI from "jsbi";
import { makeSolver } from "./utils.js";

function sonyKeygen(serial) {
    const table = "0987654321876543210976543210982109876543109876543221098765436543210987";
    let code = "";
    for (let i = 0; i < serial.length; i++) {
        code += table.charAt(parseInt(serial.charAt(i), 10) + 10 * i);
    }
    return code;
}

export const sonySolver = makeSolver({
    name: "sony",
    description: "Sony (7 digits)",
    examples: ["1234567"],
    inputValidator: (s) => /^\d{7}$/i.test(s),
    fun: (code) => {
        let res = sonyKeygen(code);
        return res ? [res] : [];
    }
});

const otpChars = "9DPK7V2F3RT6HX8J";
const pwdChars = "47592836";

function arrayToNumber(arr) {
    return (arr[3] << 24 | arr[2] << 16 | arr[1] << 8 | arr[0]) >>> 0;
}

function numberToArray(num) {
    return [num & 0xFF, (num >> 8) & 0xFF, (num >> 16) & 0xFF, (num >> 24) & 0xFF];
}

function decodeHash(hash) {
    let temp = [];
    for (let i = 0; i < hash.length; i += 2) {
        temp.unshift(otpChars.indexOf(hash[i]) * 16 + otpChars.indexOf(hash[i + 1]));
    }
    return temp;
}

function encodePassword(pwd) {
    let n = arrayToNumber(pwd);
    let result = "";
    for (let i = 0; i < 8; i++) {
        result += pwdChars.charAt((n >> (21 - i * 3)) & 0x7);
    }
    return result;
}

function extEuclideanAlg(a, b) {
    if (JSBI.EQ(b, 0)) return [JSBI.BigInt(1), JSBI.BigInt(0), a];
    let [x, y, gcd] = extEuclideanAlg(b, JSBI.remainder(a, b));
    return [y, JSBI.subtract(x, JSBI.multiply(y, JSBI.divide(a, b))), gcd];
}

function modInvEuclid(a, m) {
    let [x, , gcd] = extEuclideanAlg(a, m);
    if (JSBI.EQ(gcd, 1)) {
        const temp = JSBI.remainder(x, m);
        return JSBI.GE(temp, 0) ? temp : JSBI.add(temp, m);
    }
    return undefined;
}

export function modularPow(base, exponent, modulus) {
    let result = JSBI.BigInt(1);
    if (!(modulus instanceof JSBI)) modulus = JSBI.BigInt(modulus);
    if (JSBI.EQ(modulus, 1)) return 0;
    base = JSBI.remainder(base, modulus);
    while (exponent > 0) {
        if ((exponent & 1) === 1) result = JSBI.remainder(JSBI.multiply(result, base), modulus);
        exponent = exponent >> 1;
        base = JSBI.remainder(JSBI.multiply(base, base), modulus);
    }
    return JSBI.toNumber(result);
}

function rsaDecrypt(code) {
    const low = JSBI.BigInt(arrayToNumber(code.slice(0, 4)));
    const high = JSBI.BigInt(arrayToNumber(code.slice(4, 8)));
    const c = JSBI.bitwiseOr(JSBI.leftShift(high, JSBI.BigInt(32)), low);
    const p = 2795287379, q = 3544934711, e = 41;
    const phi = JSBI.multiply(JSBI.BigInt(p - 1), JSBI.BigInt(q - 1));
    const d = modInvEuclid(JSBI.BigInt(e), phi);
    const dp = JSBI.remainder(d, JSBI.BigInt(p - 1));
    const dq = JSBI.remainder(d, JSBI.BigInt(q - 1));
    const qinv = modInvEuclid(JSBI.BigInt(q), JSBI.BigInt(p));
    const m1 = modularPow(c, JSBI.toNumber(dp), p);
    const m2 = modularPow(c, JSBI.toNumber(dq), q);
    let h;
    if (m1 < m2) h = JSBI.remainder(JSBI.multiply(JSBI.add(JSBI.BigInt(m1 - m2), JSBI.BigInt(p)), qinv), JSBI.BigInt(p));
    else h = JSBI.remainder(JSBI.multiply(JSBI.BigInt(m1 - m2), qinv), JSBI.BigInt(p));
    const m = JSBI.add(JSBI.multiply(h, JSBI.BigInt(q)), JSBI.BigInt(m2));
    return numberToArray(JSBI.toNumber(JSBI.asUintN(32, m))).concat(numberToArray(JSBI.toNumber(JSBI.signedRightShift(m, JSBI.BigInt(32)))));
}

export function sony4x4Keygen(hash) {
    return encodePassword(rsaDecrypt(decodeHash(hash)));
}

export const sony4x4Solver = makeSolver({
    name: "sony4x4",
    description: "Sony 4x4 (16 chars otp)",
    examples: ["73KR-3FP9-PVKH-K29R"],
    cleaner: (input) => input.trim().replace(/[-\s]/gi, "").toUpperCase(),
    inputValidator: (s) => new RegExp(`^[${otpChars}]{16}$`).test(s),
    fun: (code) => {
        let res = sony4x4Keygen(code);
        return res ? [res] : [];
    }
});
