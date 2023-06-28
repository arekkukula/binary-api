# binary-api

**Proof of Concept** 

This repository represents a binary communication between a client and a server. 
It is based upon JavaScript's `ArrayBuffer`, where each message follows a pattern:

`Uint32 NextDataLength` | `SpecifiedDataFormat Data` | `Uint32 NextDataLength` | ...

Where `SpecifiedDataFormat` is a `TypedArray` (view of the buffer), for example:
* `Uint8Array`,
* `Int32Array`,
* `Float64Array`,
* `...`

This approach requires a bit of setup, namely to specify how each type is encoded 
and decoded. 

## Encoding

The algorithm asserts the ordering. Encoding basic types is rather simple.

* `string` - each `char` in JavaScript is 2 bytes. Take the length of the string and double it.
* `number` - it's either 4 or 8 bytes (32-bit `int` or 64-bit `float`). 


  Differing what `TypedArray` to use comes from bit shifting the number by 0. \
  If it is the same as the original value, then it surely is a 32-bit `int`, \
  otherwise the following behavior can be observed:

    * Positive value outside of 32-bit integer (2^31):
        * `Math.pow(2, 31)` = 2147483648
        * `Math.pow(2, 31) >> 0` = -2147483648
    * Negative value outside of 32-bit integer (-2^40):
        * `-Math.pow(2, 40)` = -1099511627776
        * `-Math.pow(2, 40) >> 0` = 0
    * Floating point number:
        * `32.6725418 >> 0` = 32
        * `-15.88888 >> 0` = -15 

* `boolean` is rather unfortunate, as only 1 bit is required to represent it. \
  Here we need to allocate a whole byte for it, which could fit 8 boolean properties.\
  If an object declares whole bunch of booleans, the optimization could come from \
  counting them and setting values in the 1-byte buffer.

* `object` - this PoC forbids using POJO objects. Instead it's required to use \
  classes inheriting from `BufferObject`, which can encode and decode themselves.
  (TODO)

## Example BufferObject

```javascript
export class User extends BufferObject {
    id;
    firstName;
    secondName;

    constructor(id, firstName, secondName) {
        super();
        this.id = id;
        this.firstName = firstName;
        this.secondName = secondName;
    }

    // REQUIRED!
    toBuffer() {
        this.encodeNumber("id");
        this.encodeString("firstName");
        this.encodeString("secondName");
        return this.encode();
    }

    // REQUIRED!
    fromBuffer(buffer) {
        this.decodeNumber("id");
        this.decodeString("firstName");
        this.decodeString("secondName");
        this.decode(buffer);
    }
}
```
Under the hood, each `this.encodeXYZ(...)` and `this.decodeXYZ(...)` call adds 
an encoding or a decoding step respectively, which won't be executed until 
`this.encode()` or `this.decode(buffer)` is called.

## BufferObject creation

Creating such object can be done in two ways:
```javascript
let user = User.prototype.fromBuffer(buffer);
```
or 
```javascript
let user = new User().fromBuffer(buffer);
```

Foreign callers should not call `encode` or `decode` directly.

## Benchmarks vs JSON

// TODO

![Buf chart](./docs/buf_chart.png "Buf chart")
![JSON chart](./docs/json_chart.png "JSON chart")

