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
import {getCurveFromName} from "./curves.js";
import {utils} from "ffjavascript";
import {convertToCompressedHex} from './blst/utils.js';

const {unstringifyBigInts, stringifyBigInts} = utils;

export default async function plonkExportFuncVerifier(vk, templates, logger) {
    if (logger) logger.info("PLONK EXPORT FUNC VERIFIER STARTED");

    const curve = await getCurveFromName(vk.curve);
    const tmp = unstringifyBigInts(vk);
    const data = {...vk, ...serializeCurvePoints(fromObjectVk(curve, tmp))};

    let template = templates[vk.protocol];

    if (logger) logger.info("PLONK EXPORT FUNC VERIFIER FINISHED");

    return ejs.render(template, data);

    function serializeCurvePoints(vk) {
        return {
            Qm: convertToCompressedHex(curve, vk.Qm),
            Ql: convertToCompressedHex(curve, vk.Ql),
            Qr: convertToCompressedHex(curve, vk.Qr),
            Qo: convertToCompressedHex(curve, vk.Qo),
            Qc: convertToCompressedHex(curve, vk.Qc),
            S1: convertToCompressedHex(curve, vk.S1),
            S2: convertToCompressedHex(curve, vk.S2),
            S3: convertToCompressedHex(curve, vk.S3),
            X2: convertToCompressedHex(curve, vk.X2),
        }
    }

    function fromObjectVk(curve, vk) {
        const G1 = curve.G1;
        const G2 = curve.G2;
        const res = {};
        res.Qm = G1.fromObject(vk.Qm);
        res.Ql = G1.fromObject(vk.Ql);
        res.Qr = G1.fromObject(vk.Qr);
        res.Qo = G1.fromObject(vk.Qo);
        res.Qc = G1.fromObject(vk.Qc);
        res.S1 = G1.fromObject(vk.S1);
        res.S2 = G1.fromObject(vk.S2);
        res.S3 = G1.fromObject(vk.S3);
        res.X2 = G2.fromObject(vk.X_2);
        return res;
    }
}

