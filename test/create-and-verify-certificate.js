const chai = require("chai");
const path = require("path");
const fs = require('fs');
var util = require('util');

// const tester = require("circom").tester;
const wasm_tester = require("circom_tester").wasm;

const buildEddsa = require("circomlibjs").buildEddsa;
const buildBabyjub = require("circomlibjs").buildBabyjub;
const poseidon = require("circomlib").poseidon;
const snarkjs = require("snarkjs");

const assert = chai.assert;


const compactcert = require('../js/compact-certificate.js')


describe("Zero Knowledge Compact Certificates", function () {
    let circuit;
    let eddsa;
    let babyJub;
    let F;

    this.timeout(100000);

    before( async () => {
        eddsa = await buildEddsa();
        babyJub = await buildBabyjub();
        F = babyJub.F;
        circuit = await wasm_tester(path.join(__dirname, "../circuits", "verifier.circom"));
    });

    // it("Misc Test", async () => {
    //     // const msg = (new TextEncoder()).encode("Hello");
    //     const msg = F.e(1234);

    //     const prvKey = Buffer.from("0001020304050607080900010203040506070809000102030405060708090001", "hex");
    //     const pubKey = eddsa.prv2pub(prvKey);
    //     const signature = eddsa.signPoseidon(prvKey, msg);

    //     assert(eddsa.verifyPoseidon(msg, signature, pubKey));

        

    // });

    it("Create Compact Certificate", async () => {

        // Step 1 - Initial Setup
        
        let msg = Fr.e(1234);
        let provenWeight = 40;

        let attestors = [
            { weight: 10, pk: Buffer.from("0000000000000000000000000000000000000000000000000000000000000001", "hex") },
            { weight: 10, pk: Buffer.from("0000000000000000000000000000000000000000000000000000000000000002", "hex") },
            { weight: 10, pk: Buffer.from("0000000000000000000000000000000000000000000000000000000000000003", "hex") },
            { weight: 10, pk: Buffer.from("0000000000000000000000000000000000000000000000000000000000000004", "hex") },
            { weight: 10, pk: Buffer.from("0000000000000000000000000000000000000000000000000000000000000005", "hex") },
        ];

        // Step 2 - 6 (Described in compactcert.js)

        let [sigRoot, signedWeight, reveals] = compactcert.createCertificate(attestors, msg, provenWeight);

        
        // Verify

        // const w = await circuit.calculateWitness({}, true);
        // await circuit.checkConstraints(w);
    });
});