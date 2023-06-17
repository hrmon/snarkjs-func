import ejs from "ejs";
import {  utils }   from "ffjavascript";

import exportVerificationKey from "./zkey_export_verificationkey.js";
import { getCurveFromName } from "./curves.js";
import blst from "./blst/blst.cjs";
// const blst = require("./blst/blst");
// import fflonkExportSolidityVerifierCmd from "./fflonk_export_solidity_verifier.js";
// Not ready yet
// module.exports.generateVerifier_kimleeoh = generateVerifier_kimleeoh;

export default async function exportFuncVerifier(zKeyName, templates, logger) {

    const verificationKey = await exportVerificationKey(zKeyName, logger);
    const vk_verifier = utils.unstringifyBigInts(verificationKey);
    if (verificationKey.curve != 'bls12381') {
        throw new Error("Only BLS12-381 is supported!");
    }

    const curve = await getCurveFromName(verificationKey.curve);
    if ("groth16" === verificationKey.protocol) {
        const blstVerificationkey =  convertGroth16VerificationKeyToBlstHex(vk_verifier, curve);
        let template = templates[verificationKey.protocol];
        return ejs.render(template, blstVerificationkey);
    }



    function convertToBlstCompressedHex(curve, p) {
        if (p.length == curve.G1.F.n8*2) {
            const buf = curve.G1.toUncompressed(p);
            const p_blst = new blst.P1(buf);
            return Buffer.from(p_blst.compress()).toString('hex');
        }
        else {
            const buf = curve.G2.toUncompressed(p);
            const p_blst = new blst.P2(buf);
            return Buffer.from(p_blst.compress()).toString('hex');
        }
    }

    function convertToArray(bi, length=48) {
        const hexRpr = bi.toString(16);
        const buff = Buffer.from('0'.repeat(length-hexRpr.length) + hexRpr, 'hex');
        return Uint8Array.from(buff);
    }

    function convertGroth16VerificationKeyToBlstHex(vk, curve) {
        return {
            ...vk,
            vk_alpha_1: convertToBlstCompressedHex(curve, curve.G1.fromObject(vk.vk_alpha_1)),
            vk_beta_2: convertToBlstCompressedHex(curve, curve.G2.fromObject(vk.vk_beta_2)),
            vk_gamma_2: convertToBlstCompressedHex(curve, curve.G2.fromObject(vk.vk_gamma_2)),
            vk_delta_2: convertToBlstCompressedHex(curve, curve.G2.fromObject(vk.vk_delta_2)),
            IC: vk.IC.map(item => convertToBlstCompressedHex(curve, curve.G1.fromObject(item))),
        }
    }
}
