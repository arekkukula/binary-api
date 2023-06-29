import { BufferObject } from "../shared/buffer-object.js";
class TestClass extends BufferObject {
    constructor() { super(); }
}

/** Helper function to omit DataLength slice in case the algorithm changes */
function getDataSlice(buf) {
    return buf.slice(4);
}

describe("ObjectBuffer", () => {

    describe("number encoding/decoding", () => {
        let numberTest;
        let buf;
        let decoded;

        beforeEach(() => {
            numberTest = new TestClass();
            numberTest.value = 0;
            numberTest.toBuffer = function() {
                this.encodeNumber("value");
                return this.encode();
            };
        });

        afterEach(() => {
            buf = null;
            decoded = null;
        });

        it("encodes and decodes at all", () => {
            numberTest.value = 1;
            buf = numberTest.toBuffer();

            expect(buf).toBeDefined();
            expect(buf.byteLength).not.toBe(0);
            
            decoded = Test.prototype.from(buf);
            expect(decoded).toBeDefined();
            expect(decoded instanceof Test).toBe(true);
            expect(decoded.value).toBeDefined();
        });

        it("encodes integers from in [-2^31; 2^31 - 1] as int32", () => {
            numberTest.value = Math.pow(2, 31) - 1;
            buf = numberTest.toBuffer();
            decoded = Test.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(4);
            expect(decoded.value).toBe(numberTest.value);

            numberTest.value = -Math.pow(2, 31);
            buf = numberTest.toBuffer();
            decoded = Test.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(numberTest.value);
        });

        it("encodes float numbers as float64", () => {
            // 4 bytes length, 8 bytes data (f64)
            numberTest.value = 1.156156156;
            buf = numberTest.toBuffer();
            decoded = Test.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(numberTest.value);

            numberTest.value = -10987654321.123456789;
            buf = numberTest.toBuffer();
            decoded = Test.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(numberTest.value);
        });

        it("encodes -0 as float64", () => {
            user = new User(-0, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });
        
        it("encodes positive infinity", () => {
            user = new User(Number.POSITIVE_INFINITY, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });

        it("encodes and decodes negative infinity", () => {
            user = new User(Number.NEGATIVE_INFINITY, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });

        it("encodes and decodes Number.MAX_VALUE", () => {
            user = new User(Number.MAX_VALUE, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });

        it("encodes and decodes Number.MIN_VALUE", () => {
            user = new User(Number.MIN_VALUE, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });

        it("encodes and decodes Number.MAX_SAFE_INTEGER", () => {
            user = new User(Number.MAX_SAFE_INTEGER, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });

        it("encodes and decodes Number.MIN_SAFE_INTEGER", () => {
            user = new User(Number.MIN_SAFE_INTEGER, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });

        it("encodes and decodes NaN", () => {
            user = new User(NaN, "", "");
            buf = user.toBuffer();
            decoded = User.prototype.from(buf);
        });

    });
});

