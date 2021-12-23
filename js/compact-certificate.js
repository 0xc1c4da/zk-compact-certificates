const chai = require("chai");
const path = require("path");
const fs = require('fs');
var util = require('util');

const snarkjs = require("snarkjs");

// const buildEddsa = require("circomlibjs").buildEddsa;
// const buildBabyjub = require("circomlibjs").buildBabyjub;
const poseidon = require("circomlib").poseidon;
const smt = require("circomlib").smt;
const eddsa = require("circomlib").eddsa;
const newMemEmptyTrie = require("circomlibjs").newMemEmptyTrie;

const { sign } = require("crypto");

const assert = chai.assert;

// https://github.com/iden3/circuits/blob/master/circuits/idOwnership.circom

// https://github.com/iden3/circomlib/blob/master/test/eddsaposeidon.js
// https://github.com/iden3/circomlib/blob/master/test/smtverifier.js
// https://github.com/iden3/circomlib/blob/master/test/smtprocessor.js
// https://github.com/iden3/circomlibjs/blob/main/test/smt.js

function index(_weight, _sigs) {
    function search (_lo, _hi) {
        assert (_hi < _lo, "index not found in _sigs");

        let mid = Math.floor((_lo + _hi) * 0.5);

        if (_weight < _sigs[mid].L) search(_lo, mid);
        if (_weight < _sigs[mid].L+_sigs[mid].weight) return mid;

        search(mid + 1, _hi);
    }
    return search(0, _sigs.length);
}

function hashMsg() {

}


function buildParticipantTree(leaves) {
    let tree = newMemEmptyTrie();
    
}

function buildSigTree(leaves) {
    let tree = newMemEmptyTrie();
    
}


function buildReveals() {
    // numReveals = secKQ / Math.log2(signedWeight/provenWeight)
    // numReveals computes the number of reveals necessary to achieve the desired
    // security parameters. Section 8

    // numReveals is the smallest number that satisfies:

    // 2^-k >= 2^q * (provenWeight / signedWeight) ^ numReveals

    // which is equivalent to the following:

    // signedWeight ^ numReveals >= 2^(k+q) * provenWeight ^ numReveals

    // To ensure that rounding errors do not reduce the security parameter,
    // compute the left-hand side with rounding-down, and compute the
    // right-hand side with rounding-up.
}

function createCertificate(_attestors, _msg, _provenWeight) {
    assert(_provenWeight>0, "requires _provenWeight > 0");
    assert(_attestors.length>0, "_attestors empty");
    assert(_msg, "No Message to Sign");

    // Step 2 - Obtain signatures of attestors

    let l = _attestors.length;
    let participants = new Array(l);
    let signedWeight = 0;
    
    for(var i=0;i<l;i++) {
        let attestor = _attestors[i];
        let pubKey = eddsa.prv2pub(attestor.pk);
        let signature = eddsa.signPoseidon(attestor.pk, _msg);
        assert(eddsa.verifyPoseidon(_msg, signature, pubKey), "Invalid Signature");

        signedWeight = signedWeight + attestor.weight;
        attestor.sig = signature;

        participants[i] = attestor;
        console.log(i, signedWeight);

        if (signedWeight > _provenWeight) break;
    }
  
    assert(signedWeight > _provenWeight, "signedWeight does not meet provenWeight threshold");

    // Step 3 - Build Signature Linked List

    let sigs = new Array(l);

    for(var i=0;i<l;i++) {
        let sig = {L:0, R: 0, sig: null, weight: 0 };
        let participant = participants[i];

        if (i > 0) sig.L = sigs[i-1].R;
        sig.R = sig.L;

        if (participant) {
            sig.R = sig.L + participant.weight;
            sig.sig = participant.sig;
        }
        
        sig.weight = sig.R - sig.L;
        sigs[i] = sig;
    }

    assert(sigs[sigs.length - 1].R === signedWeight, "last sig.R is not equal to signedWeight");

    // Step 4 -  Build a Merkle Trees

    let participantTree = buildParticipantTree(participants);
    let sigTree = buildSigTree(sigs);
    let reveals = buildReveals(signedWeight, _provenWeight, _msg, participantTree, sigTree);

    //  k & q = secKQ := uint64(128)
    // numReveals = [ k + q / Math.log2(signedWeight/_provenWeight)]

    // let reveals = {};
    // for(var j=0;j<numReveals;j++) {
    //     // Hin_j = (j, Root_sigs, provenWeight, M, C_attestors)
    //     let choice = {
    //         j: j,
    //         signedWeight: signedWeight,
    //         provenWeight: _provenWeight,
    //         sigCommit: sigCommit,
    //         attestor_root: tree.root,
    //         hashedMsg: hashedMsg
    //     };

    //     coin_j = hashSignedWeight(coin)
    //     ij = index(coin_j)

    // }

    
    let sigRoot, reveals = null;
    return [sigRoot, signedWeight, reveals];
}


module.exports.createCertificate = createCertificate;