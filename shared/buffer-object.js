const _decodeSequence = Symbol("BufferObjectDecodeSequence");

export class BufferObject {
    [_decodeSequence] = [];
    
    /**
        * Usage: @example
        * DerivedClass.prototype.from(buffer)
        * @param {ArrayBuffer} buffer
        * @returns {typeof this}
    */
    from(buffer) {
        const obj = new this.constructor();
        obj.decode(buffer);

        return obj;
    }

    encode() {
        const properties = Object.getOwnPropertyNames(this);
        const propertiesValues = properties.map(property => this[property]);
        const encoded = _encodePropertyValues(propertiesValues);
        return encoded;
    }

    /** 
        * Declare a decoding steps in this function.
        * Make sure they follow the order in which
        * the class properties were defined.
        * @param {ArrayBuffer} buffer
        * @example
        *   decode(buffer) {
        *     decodeNumber();
        *     decodeBoolean();
        *     proceed();
        *   }
    */
    decode(buffer) {
        throw new TypeError(
            `Cannot decode data into an abstract BufferObject class.
            Please provide an implementation of the decoding function in a
            derived class, declared as 'decode(buffer)'.`
        );
    }

    proceed(buffer) {
        const decodeSteps = this[_decodeSequence];
        const properties = Object.getOwnPropertyNames(this);

        const propertySetter = (val, i) => {
            this[properties[i]] = val;
        }
        let offset = 0;

        for (let i = 0; i < decodeSteps.length; i++) {
            offset = _decode(
                buffer, 
                offset, 
                decodeSteps[i],
                (val) => propertySetter(val, i)
            );
        }

        delete this[_decodeSequence];
    }

    decodeNumber() {
        this[_decodeSequence].push("number");
    }

    decodeString() {
        this[_decodeSequence].push("string");
    }

    decodeBoolean() {
        this[_decodeSequence].push("boolean");
    }

    decodeBufferObject() {
        this[_decodeSequence].push("BufferObject");
    }
}

function _decode(buffer, offset, type, propertySetter) {
    const lengthBuf = buffer.slice(offset, offset + 4);
    const lengthView = new Uint32Array(lengthBuf);
    const length = lengthView[0];
    const dataBuf = buffer.slice(offset, offset + 4 + length);

    offset += 4;
    let value;

    if (type === "number") {
        if (length === 4) {
            const dataView = new Int32Array(dataBuf);
            value = dataView[0];
        } else if (length === 8) {
            const dataView = new Float64Array(dataBuf);
            value = dataView[0];
        } else {
            throw new TypeError("Number is of incorrect length");
        }
    } else if (type === "string") {
        const dataView = new Uint16Array(dataBuf);
        let str = "";

        for (let i = 0; i < length; i++) {
            str += String.fromCharCode(dataView[i]);
        }
        
        value = str;
    } else if (type === "boolean") {

    } else if (type === "BufferObject") {

    }

    propertySetter(value);
    offset += length;
}

function _encodePropertyValues(propertyValues) {
    let offset = 0;
    let bytes = 0;

    for (let propertyValue of propertyValues) {
        bytes += _getBytes(propertyValue);

    }

    // the DataLength property of protocol
    // Adds space for each Uint32 corresponding
    // to it's property.
    bytes += propertyValues.length * 4

    const buf = new ArrayBuffer(bytes);
    const view = new Uint8Array(buf);

    for (let propertyValue of propertyValues) {
        /** @type {ArrayBuffer} */
        let encoded;
        if (typeof propertyValue === "number") {
            encoded = _encodeNumber(propertyValue);
            console.log("encoded: ");
            console.log(encoded);
            _insertAtOffset(view, encoded, offset);
        }
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
        data[i] = str[i];
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
