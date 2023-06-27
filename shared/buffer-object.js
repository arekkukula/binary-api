const _decodeSequence = Symbol("BufferObjectDecodeSequence");
const _encodeSequence = Symbol("BufferObjectEncodeSequence");

/**
    * 
*/
export class BufferObject {
    [_decodeSequence] = [];
    [_encodeSequence] = [];
    
    /** 
        * To construct BufferObject from ArrayBuffer,
        * use DeviredClass.prototype.from(ArrayBuffer),
    */
    constructor() {
        // Check if derived object imlements toBuffer and fromBuffer
        if (this.fromBuffer === BufferObject.prototype.fromBuffer) {
            throw new TypeError("Class deriving from BufferObject should implement fromBuffer(buffer) function.");
        }

        if (this.toBuffer === BufferObject.prototype.toBuffer) {
            throw new TypeError("Class deriving from BufferObject should implement fromBuffer(buffer) function.");
        }
    }
    /**
        * Usage: @example
        * DerivedClass.prototype.from(buffer)
        * @param {ArrayBuffer} buffer
        * @returns {typeof this}
    */
    from(buffer) {
        const obj = new this.constructor();
        obj.fromBuffer(buffer);

        buffer = null;

        return obj;
    }
    // eslint-disable-next-line no-unused-vars
    /** 
        * Declare encoding steps in this function.
        * Make sure they follow the order in which
        * the class properties were defined.
        * @param {ArrayBuffer} buffer
        * @example
        *   toBuffer() {
        *     this.encodeNumber("id");
        *     this.encodeString("name");
        *     this.encodeBoolean("available");
        *     return this.encode();
        *   }
    */
    toBuffer() {
        throw new TypeError(
            `Cannot encode data from an abstract BufferObject class.
            Please provide an implementation of the encoding function in a
            derived class, declared as 'toBuffer(buffer)'.`
        );
    }

    // eslint-disable-next-line no-unused-vars
    /** 
        * Declare decoding steps in this function.
        * Make sure they follow the order in which
        * the class properties were defined.
        * @param {ArrayBuffer} buffer
        * @example
        *   fromBuffer(buffer) {
        *     this.decodeNumber("id");
        *     this.decodeString("name");
        *     this.decodeBoolean("available");
        *     this.decode();
        *   }
    */
    fromBuffer(buffer) {
        throw new TypeError(
            `Cannot decode data into an abstract BufferObject class.
            Please provide an implementation of the decoding function in a
            derived class, declared as 'fromBuffer(buffer)'.`
        );
    }

    decode(buffer) {
        const decodeSteps = this[_decodeSequence];

        const propertySetter = (val, field) => {
            this[field] = val;
        }
        let offset = 0;

        for (let i = 0; i < decodeSteps.length; i++) {
            offset = _decode(
                buffer, 
                offset, 
                decodeSteps[i].type,
                (val) => propertySetter(val, decodeSteps[i].field)
            );
        }

        buffer = null;
        // delete this[_decodeSequence];
    }

    decodeNumber(name) {
        _checkIfFieldExists(name, this);
        this[_decodeSequence].push({ type: "number", field: name });
    }

    decodeString(name) {
        _checkIfFieldExists(name, this);
        this[_decodeSequence].push({ type: "string", field: name });
    }

    decodeBoolean(name) {
        _checkIfFieldExists(name, this);
        this[_decodeSequence].push({ type: "boolean", field: name });
    }

    decodeBufferObject(name) {
        _checkIfFieldExists(name, this);
        this[_decodeSequence].push({ type: "BufferObject", field: name });
    }

    encode() {
        const properties = this[_encodeSequence];
        const encoded = _encode(this, properties);
        return encoded;
    }

    encodeNumber(name) {
        _checkIfFieldExists(name, this);
        this[_encodeSequence].push({ type: "number", field: name });
    }

    encodeString(name) {
        _checkIfFieldExists(name, this);
        this[_encodeSequence].push({ type: "string", field: name });
    }

    encodeBoolean(name) {
        _checkIfFieldExists(name, this);
        this[_encodeSequence].push({ type: "boolean", field: name });
    }
    
    encodeBufferObject(name) {
        _checkIfFieldExists(name, this);
        this[_encodeSequence].push({ type: "BufferObject", field: name });
    }
}


/** 
    * For internal use. 
*/
function _checkIfFieldExists(name, obj) {
    if (!(name in obj)) {
        throw new TypeError(`Cannot find field ${name} in ${obj}`);
    }
}

function _decode(buffer, offset, type, propertySetter) {
    const lengthBuf = buffer.slice(offset, offset + 4);
    const lengthView = new Uint32Array(lengthBuf);
    const length = lengthView[0];
    offset += 4;
    const dataBuf = buffer.slice(offset, offset + length);

    let value;

    if (type === "number") {
        value = length === 4
            ? new Int32Array(dataBuf)[0]
            : new Float64Array(dataBuf)[0];
    } else if (type === "string") {
        const dataView = new Uint16Array(dataBuf);
        value = String.fromCharCode(...dataView);
    } else if (type === "boolean") {
        const dataView = new Uint8Array(dataBuf);
        value = dataView[0] > 0;
    } else if (type === "BufferObject") {
        throw "decode BufferObject not implemented";
    }

    propertySetter(value);
    offset += length;
    return offset;
}

function _encode(obj, properties) {
    let offset = 0;
    let bytes = 0;

    for (let property of properties) {
        bytes += _getBytes(obj[property.field]);
    }

    // the DataLength property of protocol
    // Adds space for each Uint32 corresponding
    // to it's property.
    bytes += properties.length * 4

    const buf = new ArrayBuffer(bytes);
    const view = new Uint8Array(buf);

    for (let property of properties) {
        /** @type {ArrayBuffer} */
        let encoded;
        if (property.type === "number") {
            encoded = _encodeNumber(obj[property.field]);
            _insertAtOffset(view, encoded, offset);
        } else if (property.type === "string") {
            encoded = _encodeString(obj[property.field]);
            _insertAtOffset(view, encoded, offset);
        } else if (property.type === "boolean") {
            encoded = _encodeBoolean(obj[property.field]);
            _insertAtOffset(view, encoded, offset);
        }

        offset += encoded.byteLength;
    }

    return buf;
}

/**
    * @param {Uint8Array} view
    * @param {ArrayBuffer} data
    * @param {number} offset
*/
function _insertAtOffset(view, data, offset) {
    const dataView = new Uint8Array(data);
    const dataLength = dataView.byteLength;

    for (let i = 0; i < dataLength; i++) {
        view[offset + i] = dataView[i];
    }
}

function _getBytes(value) {
    let bytes = 0;
    if (value instanceof BufferObject) {
        // bytes += value._getBytes
        // TODO:
    } else if (typeof value === "number") {
        bytes = value >> 0 === value ? 4 : 8;
    } else if (typeof value === "string") {
        bytes = value.length * 2;
    } else if (typeof value === "boolean") {
        bytes = 1;
    }

    return bytes;
}

/**
    * @returns {ArrayBuffer}
*/
function _encodeNumber(num) {
    const bytes = num >> 0 === num ? 4 : 8;
    const buf = new ArrayBuffer(bytes + 4);

    const length = new Uint32Array(buf.slice(0, 4));
    length[0] = bytes;

    const data = bytes == 4
        ? new Int32Array(buf.slice(4))
        : new Float64Array(buf.slice(4));

    data[0] = num;

    const view = new Uint8Array(buf);

    _insertAtOffset(view, length.buffer, 0);
    _insertAtOffset(view, data.buffer, 4);

    return buf;
}

/** 
    * @param {string} str
    * @returns {ArrayBuffer} ArrayBuffer
*/
function _encodeString(str) {
    const bytes = str.length * 2;
    const buf = new ArrayBuffer(bytes + 4);
    const length = new Uint32Array(buf.slice(0, 4));
    length[0] = bytes;

    const data = new Uint16Array(buf.slice(4));

    for (let i = 0; i < str.length; i++) {
        data[i] = str.charCodeAt(i);
    }

    const view = new Uint8Array(buf);

    _insertAtOffset(view, length.buffer, 0);
    _insertAtOffset(view, data.buffer, 4);

    return buf;
}

function _encodeBoolean(bool) {

}

function _encodeBufferObject(obj) {

}
