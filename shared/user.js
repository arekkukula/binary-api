/** Author: @arekkukula on GitHub.
 * See README.md for license contents.
*/
import { BufferObject } from "./buffer-object.js";

export class User extends BufferObject {
    static f_id = "id";
    static f_firstName = "firstName";
    static f_secondName = "secondName";

    /** @type {number} */
    id;
    /** @type {string} */
    firstName;
    /** @type {string} */
    secondName;

    constructor(id, firstName, secondName) {
        super();
        this[User.f_id] = id;
        this[User.f_firstName] = firstName;
        this[User.f_secondName] = secondName;
    }

    toBuffer() {
        this.encodeNumber(User.f_id);
        this.encodeString(User.f_firstName);
        this.encodeString(User.f_secondName);
        return this.encode();
    }

    fromBuffer(buffer) {
        this.decodeNumber(User.f_id);
        this.decodeString(User.f_firstName);
        this.decodeString(User.f_secondName);
        this.decode(buffer);
    }
}
