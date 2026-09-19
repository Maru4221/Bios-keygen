import { DellTag } from "./types.js";

const md5magic = Uint32Array.from([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
]);

const md5magic2 = Uint32Array.from([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1, 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039
]);

const rotationTable = [
    [7, 12, 17, 22],
    [5, 9, 14, 20],
    [4, 11, 16, 23],
    [6, 10, 15, 21]
];

const initialData = [0x67452301 | 0, 0xEFCDAB89 | 0, 0x98BADCFE | 0, 0x10325476 | 0];

function rol(x, bitsrot) {
    return ((x >>> 0) / Math.pow(2, 32 - bitsrot)) | (((x >>> 0) << bitsrot) | 0);
}

const encF2 = (num1, num2, num3) => ((num3 ^ num2) & num1) ^ num3;
const encF3 = (num1, num2, num3) => ((num1 ^ num2) & num3) ^ num2;
const encF4 = (num1, num2, num3) => (num2 ^ num1) ^ num3;
const encF5 = (num1, num2, num3) => (num1 | ~num3) ^ num2;
const encF1 = (num1, num2) => (num1 + num2) | 0;
const encF1N = (num1, num2) => (num1 - num2) | 0;
const encF2N = (num1, num2, num3) => encF2(num1, num2, ~num3);
const encF4N = (num1, num2, num3) => encF4(num1, ~num2, num3);
const encF5N = (num1, num2, num3) => encF5(~num1, num2, num3);

class Tag595BEncoder {
    constructor(encBlock) {
        this.encBlock = encBlock;
        this.f1 = encF1N;
        this.f2 = encF2N;
        this.f3 = encF3;
        this.f4 = encF4N;
        this.f5 = encF5N;
        this.md5table = md5magic;
        this.reset();
    }

    reset() {
        this.encData = initialData.slice();
        this.A = this.encData[0];
        this.B = this.encData[1];
        this.C = this.encData[2];
        this.D = this.encData[3];
    }

    static encode(encBlock) {
        let obj = new this(encBlock);
        obj.makeEncode();
        return obj.result();
    }

    makeEncode() {
        let t = 0;
        for (let i = 0; i < 64; i++) {
            switch (i >> 4) {
                case 0: t = this.calculate(this.f2, i & 15, i); break;
                case 1: t = this.calculate(this.f3, (i * 5 + 1) & 15, i); break;
                case 2: t = this.calculate(this.f4, (i * 3 + 5) & 15, i); break;
                case 3: t = this.calculate(this.f5, (i * 7) & 15, i); break;
            }
            this.A = this.D;
            this.D = this.C;
            this.C = this.B;
            this.B = rol(t, rotationTable[i >> 4][i & 3]) + this.B | 0;
        }
        this.incrementData();
    }

    result() {
        return this.encData.map((v) => (v | 0) >>> 0);
    }

    calculate(func, key1, key2) {
        let temp = func(this.B, this.C, this.D);
        return this.A + this.f1(temp, this.md5table[key2] + this.encBlock[key1]) | 0;
    }

    incrementData() {
        this.encData[0] += this.A;
        this.encData[1] += this.B;
        this.encData[2] += this.C;
        this.encData[3] += this.D;
        this.encData.forEach((val, index) => { this.encData[index] = val | 0; });
    }
}

class TagD35BEncoder extends Tag595BEncoder {
    constructor(encBlock) {
        super(encBlock);
        this.f1 = encF1;
        this.f2 = encF2;
        this.f3 = encF3;
        this.f4 = encF4;
        this.f5 = encF5;
    }
}

class Tag1D3BEncoder extends Tag595BEncoder {
    makeEncode() {
        for (let j = 0; j < 21; j++) {
            this.A |= 0x97;
            this.B ^= 0x8;
            this.C |= 0x60606161 - j;
            this.D ^= 0x50501010 + j;
            super.makeEncode();
        }
    }
}

class Tag1F66Encoder extends Tag595BEncoder {
    constructor(encBlock) {
        super(encBlock);
        this.md5table = md5magic2;
    }

    makeEncode() {
        let t = 0;
        for (let j = 0; j < 17; j++) {
            this.A |= 0x100097; this.B ^= 0xA0008; this.C |= 0x60606161 - j; this.D ^= 0x50501010 + j;
            for (let i = 0; i < 64; i++) {
                switch (i >> 4) {
                    case 0: t = this.calculate(this.f2, i & 15, i + 16 | 0); break;
                    case 1: t = this.calculate(this.f3, (i * 5 + 1) & 15, i + 32 | 0); break;
                    case 2: t = this.calculate(this.f4, (i * 3 + 5) & 15, i - 2 * (i & 12) + 12); break;
                    case 3: t = this.calculate(this.f5, (i * 7) & 15, 2 * (i & 3) - (i & 15) + 12); break;
                }
                this.A = this.D; this.D = this.C; this.C = this.B; this.B = rol(t, rotationTable[i >> 4][i & 3]) + this.B | 0;
            }
            this.incrementData();
        }
        for (let j = 0; j < 21; j++) {
            this.A |= 0x97; this.B ^= 0x8; this.C |= 0x50501010 - j; this.D ^= 0x60606161 + j;
            for (let i = 0; i < 64; i++) {
                switch (i >> 4) {
                    case 0: t = this.calculate(this.f4, (i * 3 + 5) & 15, 2 * (i & 3) - i + 44); break;
                    case 1: t = this.calculate(this.f5, (i * 7) & 15, 2 * (i & 3) - i + 76); break;
                    case 2: t = this.calculate(this.f2, i & 15, (i & 15) | 0); break;
                    case 3: t = this.calculate(this.f3, (i * 5 + 1) & 15, i - 32 | 0); break;
                }
                let g = (i >> 4) + 2;
                this.A = this.D; this.D = this.C; this.C = this.B; this.B = rol(t, rotationTable[g & 3][i & 3]) + this.B | 0;
            }
            this.incrementData();
        }
    }
}

class Tag6FF1Encoder extends Tag595BEncoder {
    constructor(encBlock) {
        super(encBlock);
        this.md5table = md5magic2;
        this.counter1 = 23;
    }

    makeEncode() {
        let t = 0;
        for (let j = 0; j < this.counter1; j++) {
            this.A |= 0xA08097; this.B ^= 0xA010908; this.C |= 0x60606161 - j; this.D ^= 0x50501010 + j;
            for (let i = 0; i < 64; i++) {
                let k = (i & 15) - ((i & 12) << 1) + 12;
                switch (i >> 4) {
                    case 0: t = this.calculate(this.f2, i & 15, i + 32 | 0); break;
                    case 1: t = this.calculate(this.f3, (i * 5 + 1) & 15, (i & 15) | 0); break;
                    case 2: t = this.calculate(this.f4, (i * 3 + 5) & 15, k + 16 | 0); break;
                    case 3: t = this.calculate(this.f5, (i * 7) & 15, k + 48 | 0); break;
                }
                this.A = this.D; this.D = this.C; this.C = this.B; this.B = rol(t, rotationTable[i >> 4][i & 3]) + this.B | 0;
            }
            this.incrementData();
        }
        for (let j = 0; j < 17; j++) {
            this.A |= 0x100097; this.B ^= 0xA0008; this.C |= 0x50501010 - j; this.D ^= 0x60606161 + j;
            for (let i = 0; i < 64; i++) {
                let k = (i & 15) - ((i & 12) << 1) + 12;
                switch (i >> 4) {
                    case 0: t = this.calculate(this.f4, ((i & 15) * 3 + 5) & 15, k + 16); break;
                    case 1: t = this.calculate(this.f5, ((i & 3) * 7 + (i & 12) + 4) & 15, (i & 15) + 32); break;
                    case 2: t = this.calculate(this.f2, k & 15, k); break;
                    case 3: t = this.calculate(this.f3, ((i & 15) * 5 + 1) & 15, (i & 15) + 48); break;
                }
                let g = (i >> 4) + 2;
                this.A = this.D; this.D = this.C; this.C = this.B; this.B = rol(t, rotationTable[g & 3][i & 3]) + this.B | 0;
            }
            this.incrementData();
        }
    }
}

class Tag1F5AEncoder extends Tag595BEncoder {
    constructor(encBlock) {
        super(encBlock);
        this.md5table = md5magic2;
    }

    makeEncode() {
        let t = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 64; j++) {
                let k = 12 + (j & 3) - (j & 12);
                switch (j >> 4) {
                    case 0: t = this.calculate(this.f2, j & 15, j); break;
                    case 1: t = this.calculate(this.f3, (j * 5 + 1) & 15, j); break;
                    case 2: t = this.calculate(this.f4, (j * 3 + 5) & 15, k + 0x20); break;
                    case 3: t = this.calculate(this.f5, (j * 7) & 15, k + 0x30); break;
                }
                this.B = this.D; this.D = this.A; this.A = this.C; this.C = rol(t, rotationTable[j >> 4][j & 3]) + this.C | 0;
            }
            this.incrementData();
        }
    }

    incrementData() {
        this.encData[0] += this.B; this.encData[1] += this.C; this.encData[2] += this.A; this.encData[3] += this.D;
        this.encData.forEach((val, index) => { this.encData[index] = val | 0; });
    }

    calculate(func, key1, key2) {
        let temp = func(this.C, this.A, this.D);
        return this.B + this.f1(temp, this.md5table[key2] + this.encBlock[key1]) | 0;
    }
}

class TagBF97Encoder extends Tag6FF1Encoder {
    constructor(encBlock) {
        super(encBlock);
        this.counter1 = 31;
    }
}

export class TagE7A8Encoder extends Tag595BEncoder {
    constructor(encBlock) {
        super(encBlock);
        this.md5table = md5magic2;
        this.loopParams = [17, 13, 12, 8];
        this.encodeParams = Uint32Array.from([0x50501010, 0xA010908, 0xA08097, 0x60606161, 0x60606161, 0xA0008, 0x100097, 0x50501010]);
    }

    reset() {
        this.encData = [0, 0, 0, 0];
        this.A = this.encData[0]; this.B = this.encData[1]; this.C = this.encData[2]; this.D = this.encData[3];
    }

    makeEncode() {
        for (let p = 0; p < this.loopParams[0]; p++) {
            this.A |= this.encodeParams[0]; this.B ^= this.encodeParams[1]; this.C |= this.encodeParams[2] - p; this.D ^= this.encodeParams[3] + p;
            for (let j = 0; j < this.loopParams[2]; j += 4) this.shortcut(this.f2, j, j + 32, 0, [0, 1, 2, 3]);
            for (let j = 0; j < this.loopParams[2]; j += 4) this.shortcut(this.f3, j, j, 1, [1, -2, -1, 0]);
            for (let j = this.loopParams[3]; j > 3; j -= 4) this.shortcut(this.f4, j, j + 16, 2, [-3, -4, -1, 2]);
            for (let j = this.loopParams[3]; j > 3; j -= 4) this.shortcut(this.f5, j, j + 48, 3, [2, 3, 2, -3]);
            this.incrementData();
        }
        for (let p = 0; p < this.loopParams[1]; p++) {
            this.A |= this.encodeParams[4]; this.B ^= this.encodeParams[5]; this.C |= this.encodeParams[6] - p; this.D ^= this.encodeParams[7] + p;
            for (let j = this.loopParams[3]; j > 3; j -= 4) this.shortcut(this.f4, j, j + 16, 2, [-3, -4, -1, 2]);
            for (let j = 0; j < this.loopParams[2]; j += 4) this.shortcut(this.f5, j, j + 32, 3, [2, 3, 2, -3]);
            for (let j = this.loopParams[3]; j > 0; j -= 4) this.shortcut(this.f2, j, j, 0, [0, 1, 2, 3]);
            for (let j = 0; j < this.loopParams[2]; j += 4) this.shortcut(this.f3, j, j + 48, 1, [1, -2, 3, 0]);
            this.incrementData();
        }
    }

    shortcut(fun, j, md5_index, rot_index, indexes) {
        for (let i = 0; i < 4; i++) {
            const t = this.calculate(fun, (j + indexes[i]) & 7, i + md5_index);
            this.A = this.D; this.D = this.C; this.C = this.B; this.B = rol(t, rotationTable[rot_index][i]) + this.B | 0;
        }
    }
}

export class TagE7A8EncoderSecond extends TagE7A8Encoder {
    constructor(encBlock) {
        super(encBlock);
        const overfillArr = [0xa0008 ^ 0x6d2f93a5, 0xa08097 ^ 0x6d2f93a5, 0xa010908 ^ 0x6d2f93a5, 0x60606161 ^ 0x6d2f93a5];
        let arr = new Uint32Array(md5magic2.length + overfillArr.length);
        arr.set(md5magic2);
        arr.set(overfillArr, md5magic2.length);
        this.md5table = arr;
        this.loopParams = [17, 13, 12, 16];
    }
}

const encoders = {
    [DellTag.Tag595B]: Tag595BEncoder,
    [DellTag.Tag2A7B]: Tag595BEncoder,
    [DellTag.TagA95B]: Tag595BEncoder,
    [DellTag.Tag1D3B]: Tag1D3BEncoder,
    [DellTag.TagD35B]: TagD35BEncoder,
    [DellTag.Tag1F66]: Tag1F66Encoder,
    [DellTag.Tag6FF1]: Tag6FF1Encoder,
    [DellTag.Tag1F5A]: Tag1F5AEncoder,
    [DellTag.TagBF97]: TagBF97Encoder,
    [DellTag.TagE7A8]: TagE7A8Encoder
};

export function blockEncode(encBlock, tag) {
    return encoders[tag].encode(encBlock);
}
