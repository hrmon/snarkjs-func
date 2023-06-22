/*
    Copyright 2021 0KIMS association.

    This file is part of snarkJS.

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/
import ejs from "ejs";
import { getCurveFromName } from "./curves.js";
import {convertToCompressedHex} from './blst/utils.js';
import {  utils }   from "ffjavascript";
const { unstringifyBigInts} = utils;


export default async function plonkExportFuncCallData(template, _proof, _pub) {
    const curve = await getCurveFromName(_proof.curve);
    const proof = fromObjectProof(curve, unstringifyBigInts(_proof));
    const pub = unstringifyBigInts(_pub);

    const data = {
        pub: pub,
        proof: {...proof, ...serializeCurvePoints(curve, proof)},
    }

    return ejs.render(template, data);
}

function fromObjectProof(curve, proof) {
    const G1 = curve.G1;
    const res = proof;
    res.A = G1.fromObject(proof.A);
    res.B = G1.fromObject(proof.B);
    res.C = G1.fromObject(proof.C);
    res.Z = G1.fromObject(proof.Z);
    res.T1 = G1.fromObject(proof.T1);
    res.T2 = G1.fromObject(proof.T2);
    res.T3 = G1.fromObject(proof.T3);
    res.Wxi = G1.fromObject(proof.Wxi);
    res.Wxiw = G1.fromObject(proof.Wxiw);
    return res;
}

function serializeCurvePoints(curve, vk) {
    return {
        A: convertToCompressedHex(curve, vk.A),
        B: convertToCompressedHex(curve, vk.B),
        C: convertToCompressedHex(curve, vk.C),
        Z: convertToCompressedHex(curve, vk.Z),
        T1: convertToCompressedHex(curve, vk.T1),
        T2: convertToCompressedHex(curve, vk.T2),
        T3: convertToCompressedHex(curve, vk.T3),
        Wxi: convertToCompressedHex(curve, vk.Wxi),
        Wxiw: convertToCompressedHex(curve, vk.Wxiw),
    }
}