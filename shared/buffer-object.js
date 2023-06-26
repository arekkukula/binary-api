export class BufferObject {

    encode() {
        const properties = Object.getOwnPropertyNames(this);
        const propertiesValues = properties.map(property => this[property]);
        const encoded = this._encodePropertyValues(propertiesValues);
    }

    _encodePropertyValues(propertyValues) {
        let index = 0;
        let lengthBytes = 0;

        for (let propertyValue of propertyValues) {
            lengthBytes += this._getBytes(propertyValue);
        }
    }

    _getBytes(value) {
        let bytes = 0;
        if (value instanceof BufferObject) {
            // bytes += value._getBytes
            // TODO:
        } else if (typeof value === "number") {
            bytes = value >> 0 === value ? 2 : 4;
        } else if (typeof value === "string") {
            bytes = value.length * 2;
        } else if (typeof value === "boolean") {
            bytes = 1;
        }

        return bytes;
    }

    _encodeNumber(num) {

    }

    _encodeString(str) {

    }

    _encodeBoolean(bool) {

    }

    _encodeBufferObject(obj) {

    }
}
