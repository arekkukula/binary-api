import { BufferObject } from "./buffer-object.js";

export class User extends BufferObject {
    /** @type {number} */
    id;
    /** @type {string} */
    firstName;
    /** @type {string} */
    secondName;

    constructor(id, firstName, secondName) {
        super();
        this.id = id;
        this.firstName = firstName;
        this.secondName = secondName;
    }

    toBuffer() {
        this.encodeNumber("id");
        this.encodeString("firstName");
        this.encodeString("secondName");
        return this.encode();
    }

    fromBuffer(buffer) {
        this.decodeNumber("id");
        this.decodeString("firstName");
        this.decodeString("secondName");
        this.decode(buffer);
    }
}
