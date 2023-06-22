import blst from './blst.cjs';

export function convertToCompressedHex(curve, p) {
    if (p.length == curve.G1.F.n8*2) {
        let p_blst;
        if (curve.G1.isZero(p)) {
            p_blst = new blst.P1();
        } else {
            const buf = curve.G1.toUncompressed(p);
            p_blst = new blst.P1(buf);
        }
        return Buffer.from(p_blst.compress()).toString('hex');
    }
    else {
        let p_blst;
        if (curve.G2.isZero(p)) {
            p_blst = new blst.P2();
        } else {
            const buf = curve.G2.toUncompressed(p);
            p_blst = new blst.P2(buf);
        }
        return Buffer.from(p_blst.compress()).toString('hex');
    }
}