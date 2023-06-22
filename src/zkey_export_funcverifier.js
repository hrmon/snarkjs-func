
import exportVerificationKey from "./zkey_export_verificationkey.js";
import plonkExportFuncVerifier from './plonk_export_funcverifier.js';
import groth16ExportFuncVerifier from './groth16_export_funcverifier.js';

export default async function exportFuncVerifier(zKeyName, templates, logger) {

    const verificationKey = await exportVerificationKey(zKeyName, logger);
    if (verificationKey.curve != 'bls12381') {
        throw new Error("Only BLS12-381 is supported!");
    }

    if ("groth16" === verificationKey.protocol) {
        return groth16ExportFuncVerifier(verificationKey, templates)
    } if ("plonk" === verificationKey.protocol) {
        return plonkExportFuncVerifier(verificationKey, templates);
    }
}
