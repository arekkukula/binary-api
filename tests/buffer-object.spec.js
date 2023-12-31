import { BufferObject } from "../shared/buffer-object.js";
import { User } from "../shared/user.js";
class TestClass extends BufferObject {
    constructor() { super(); }
    fromBuffer(buffer) { }
    toBuffer() { }
}

class TestNumber extends BufferObject {
    value;
    constructor() { super(); }
    toBuffer() { 
        this.encodeNumber("value");
        return this.encode(); 
    }

    fromBuffer(buffer) { 
        this.decodeNumber("value");
        this.decode(buffer); 
    }
}

class EmptyImplTestClass extends BufferObject { }

/** Helper function to omit DataLength slice in case the algorithm changes */
function getDataSlice(buf) {
    return buf.slice(4);
}

describe("ObjectBuffer", () => {
    it("throws TypeError when fromBuffer and/or toBuffer is not overriden", () => {
        expect(() => new EmptyImplTestClass()).toThrowError(TypeError);
    });

    describe("number encoding/decoding", () => {
        let testObj;
        let buf;
        let decoded;

        beforeEach(() => {
            testObj = new TestNumber();
        });

        afterEach(() => {
            buf = null;
            decoded = null;
        });

        it("encodes and decodes at all", () => {
            testObj.value = 1;
            buf = testObj.toBuffer();

            expect(buf).toBeDefined();
            expect(buf.byteLength).not.toBe(0);

            decoded = TestNumber.prototype.from(buf);
            expect(decoded).toBeDefined();
            expect(decoded instanceof TestNumber).toBe(true);
            expect(decoded.value).toBeDefined();
        });

        it("encodes integers from in [-2^31; 2^31 - 1] as int32", () => {
            // max positive int
            testObj.value = Math.pow(2, 31) - 1;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(4);
            expect(decoded.value).toBe(testObj.value);

            // max negative int
            testObj.value = -Math.pow(2, 31);
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(4);
            expect(decoded.value).toBe(testObj.value);

            // +1 from max positive int
            testObj.value = Math.pow(2, 31);
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).not.toBe(4);

            testObj.value = -Math.pow(2, 31) - 1;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).not.toBe(4);
        });

        it("encodes float numbers as float64", () => {
            // 4 bytes length, 8 bytes data (f64)
            testObj.value = 1.156156156;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);

            testObj.value = -10987654321.123456789;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);

            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes -0 as float64", () => {
            testObj.value = -0;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes positive infinity", () => {
            testObj.value = Number.POSITIVE_INFINITY;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes and decodes negative infinity", () => {
            testObj.value = Number.NEGATIVE_INFINITY;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes and decodes Number.MAX_VALUE", () => {
            testObj.value = Number.MAX_VALUE;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes and decodes Number.MIN_VALUE", () => {
            testObj.value = Number.MIN_VALUE;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes and decodes Number.MAX_SAFE_INTEGER", () => {
            testObj.value = Number.MAX_SAFE_INTEGER;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes and decodes Number.MIN_SAFE_INTEGER", () => {
            testObj.value = Number.MIN_SAFE_INTEGER;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

        it("encodes and decodes NaN", () => {
            testObj.value = NaN;
            buf = testObj.toBuffer();
            decoded = TestNumber.prototype.from(buf);
            
            expect(getDataSlice(buf).byteLength).toBe(8);
            expect(decoded.value).toBe(testObj.value);
        });

    });
});

