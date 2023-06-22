/*
    Copyright 2022 iden3 association.

    This file is part of snarkjs.

    snarkjs is a free software: you can redistribute it and/or
    modify it under the terms of the GNU General Public License as published by the
    Free Software Foundation, either version 3 of the License, or (at your option)
    any later version.

    snarkjs is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for
    more details.

    You should have received a copy of the GNU General Public License along with
    snarkjs. If not, see <https://www.gnu.org/licenses/>.
*/

import {Scalar} from "ffjavascript";
import jsSha3 from "js-sha3";
const { keccak256 } = jsSha3;
import blst from "./blst/blst.cjs";

const POLYNOMIAL = 0;
const SCALAR = 1;

export class Keccak256Transcript {
    constructor(curve) {
        this.curve = curve;
        this.G1 = curve.G1;
        this.Fr = curve.Fr;

        this.reset();
    }

    reset() {
        this.data = [];
    }

    addPolCommitment(polynomialCommitment) {
        this.data.push({type: POLYNOMIAL, data: polynomialCommitment});
    }

    addScalar(scalar) {
        this.data.push({type: SCALAR, data: scalar});
    }

    getChallenge() {
        if(0 === this.data.length) {
            throw new Error("Keccak256Transcript: No data to generate a transcript");
        }

        let nPolynomials = 0;
        let nScalars = 0;

        this.data.forEach(element => POLYNOMIAL === element.type ? nPolynomials++ : nScalars++);
        let buffer;
        if (this.curve.name != 'bls12381') {
            buffer = new Uint8Array(nScalars * this.Fr.n8 + nPolynomials * this.G1.F.n8 * 2);
        } else {
            buffer = new Uint8Array(nScalars * this.Fr.n8 + nPolynomials * this.G1.F.n8);
        }
        let offset = 0;

        for (let i = 0; i < this.data.length; i++) {
            if (POLYNOMIAL === this.data[i].type) {
                if (this.curve.name != 'bls12381') {
                    this.G1.toRprUncompressed(buffer, offset, this.data[i].data);
                    offset += this.G1.F.n8 * 2;
                } else {
                    var buf;
                    if (this.G1.isZero(this.data[i].data)) {
                        buf = new Uint8Array(this.G1.F.n8 * 2);
                        buf[0] = parseInt('40', 16);
                    } else  {
                        buf = this.G1.toUncompressed(this.data[i].data);
                    }
                    const pBlst = new blst.P1(buf);
                    buffer.set(pBlst.compress(), offset);
                    offset += this.G1.F.n8;
                }
            } else {
                this.Fr.toRprBE(buffer, offset, this.data[i].data);
                offset += this.Fr.n8;
            }
        }
        
        const value = Scalar.fromRprBE(new Uint8Array(keccak256.arrayBuffer(buffer)));
        return this.Fr.e(value);
    }
}