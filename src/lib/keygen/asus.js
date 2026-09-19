import { makeSolver } from "./utils.js";

function initTable(a1 = 11, a2 = 19, a3 = 6) {
    let table = [];
    const zeroCode = "0".charCodeAt(0);
    table[0] = a1 + zeroCode; table[1] = a2 + zeroCode; table[2] = a3 + zeroCode;
    table[3] = "6".charCodeAt(0); table[4] = "7".charCodeAt(0); table[5] = "8".charCodeAt(0); table[6] = "9".charCodeAt(0);
    let chksum = table.reduce((acc, val) => acc + val, 0);
    for (let i = 7; i < 32; i++) {
        chksum = (33676 * chksum + 12345) >>> 0;
        table[i] = ((chksum >> 16) & 0x7FFF) % 43 + zeroCode;
    }
    let v3 = a1 * a2, v4 = shuffle1((a1 - 1) * (a2 - 1), a3);
    return table.map((value) => shuffle2(value - zeroCode, v4, v3));
}

function shuffle1(a1, a2) {
    let v3 = 2;
    for (let i = 0; i < a2; i++) {
        let v4 = v3, v5 = a1;
        while (v5 > 0) { if (v5 < v4) [v5, v4] = [v4, v5]; v5 %= v4; }
        if (v4 !== 1) v3++;
    }
    return v3;
}

function shuffle2(a1, a2, a3) {
    if (a1 >= a3) a1 %= a3;
    let result = a1;
    if (a2 !== 1) for (let i = 0; i < a2 - 1; i++) result = a1 * result % a3;
    return result;
}

function leftPad(base, len, fill = " ") {
    while (base.length < len) base = fill + base;
    return base;
}

const asusTable = initTable();
const years = Array.from({ length: 111 }, (_, i) => (1990 + i).toString().padStart(4, "0"));
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const ymdRegex = new RegExp(`^(${years.join("|")})(${months.join("|")})(${days.join("|")})$`);
const dmyRegex = new RegExp(`^(${days.join("|")})(${months.join("|")})(${years.join("|")})$`);

export function asusKeygen(year, month, day) {
    const date = year.toString().padStart(4, "0") + month.toString().padStart(2, "0") + day.toString().padStart(2, "0");
    let chksum = parseInt(date, 16);
    let password = "";
    for (let i = 0; i < 8; i++) {
        chksum = (33676 * chksum + 12345) >>> 0;
        let index = (chksum >> 16) & 31, pwdChar = asusTable[index] % 36;
        password += String.fromCharCode(pwdChar + (pwdChar > 9 ? "7".charCodeAt(0) : "0".charCodeAt(0)));
    }
    return password;
}

export const asusSolver = makeSolver({
    name: "asusDate",
    description: "ASUS (Using date YYYYMMDD or DDMMYYYY)",
    examples: ["20100203"],
    inputValidator: (s) => s.length === 8,
    fun: (code) => {
        let result = [];
        if (ymdRegex.test(code)) result.push(asusKeygen(parseInt(code.slice(0, 4), 10), parseInt(code.slice(4, 6), 10), parseInt(code.slice(6, 8), 10)));
        if (dmyRegex.test(code)) result.push(asusKeygen(parseInt(code.slice(4, 8), 10), parseInt(code.slice(2, 4), 10), parseInt(code.slice(0, 2), 10)));
        return result;
    }
});
