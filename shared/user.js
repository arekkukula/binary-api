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
}
