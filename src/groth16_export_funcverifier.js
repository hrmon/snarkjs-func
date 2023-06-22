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

const {unstringifyBigInts} = utils;

export default async function plonkExportFuncVerifier(vk, templates, logger) {
    if (logger) logger.info("GROTH16 EXPORT FUNC VERIFIER STARTED");

    const curve = await getCurveFromName(vk.curve);
    const vk_verifier = utils.unstringifyBigInts(vk);

    const blstVerificationkey =  serializeCurvePoints(vk_verifier, curve);
    let template = templates[vk.protocol];
    
    if (logger) logger.info("GROTH16 EXPORT FUNC VERIFIER FINISHED");
    
    return ejs.render(template, blstVerificationkey);

    function serializeCurvePoints(vk, curve) {
        return {
            ...vk,
            vk_alpha_1: convertToCompressedHex(curve, curve.G1.fromObject(vk.vk_alpha_1)),
            vk_beta_2: convertToCompressedHex(curve, curve.G2.fromObject(vk.vk_beta_2)),
            vk_gamma_2: convertToCompressedHex(curve, curve.G2.fromObject(vk.vk_gamma_2)),
            vk_delta_2: convertToCompressedHex(curve, curve.G2.fromObject(vk.vk_delta_2)),
            IC: vk.IC.map(item => convertToCompressedHex(curve, curve.G1.fromObject(item))),
        }
    }
}

