# ZK Compact Certificates

This is a WIP implementation of [Compact Certificates of Collective Knowledge](https://eprint.iacr.org/2020/1568), started under the [0xPARC](https://0xparc.org) program.

CC's are useful for proving stake behind a block in consensus and for inter-chain communication, as an alternative to other signature aggregation methods, and they scale to large set of participants with minimal coordination and size costs.

They claim:
    - aggregate signatures, multisignatures and threshold signatures require more coordination than compact certificates, and grow in size and costs of computation
        - compact certificates scale, and they can be used regardless of the number of attestors who participated
        - compact certificates support weighted attestors (ie stake) and allow for threshold verification
        - compact certificates work with any underlying signature scheme (and, more generally, with any NP statement), whereas other options are specific to the signature scheme

In the paper, they have future work suggestion of combining SNARKs and compact certificates to prove knowledge of a valid compact certificate (instead of proving validity of attestors’ signatures directly).

This would potentially further reduce certificate size and verification cost.

The goal of this implementation is to explore the further research suggested in the paper, and encode the verification step under a Circom 2 circuit.

This implementation will explore the use of [EdDSA](https://iden3-docs.readthedocs.io/en/latest/iden3_repos/research/publications/zkproof-standards-workshop-2/ed-dsa/ed-dsa.html), [Poseidon](https://www.poseidon-hash.info/) & [Sparse Merkle Trees](https://iden3-docs.readthedocs.io/en/latest/iden3_repos/research/publications/zkproof-standards-workshop-2/merkle-tree/merkle-tree.html)


## Requirements

- [Circom 2](https://docs.circom.io/getting-started/installation/)
- Node.js


## Usage

Run `yarn install && yarn test`