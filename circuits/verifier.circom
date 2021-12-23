pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/eddsa.circom";
include "../node_modules/circomlib/circuits/smt/smtverifier.circom";

// component main = SMTVerifier(10);
component main = EdDSAPoseidonVerifier();


/*
The verifier takes as input:
- the Message
- the provenWeight
- the signedWeight
- the root of the attestors tree, C_attestors = Commit(attestors)
- the root of the signature tree, Root_sigs
- map T (numReveals) each containg (s, πs, p, πp )`
    - s = sigs[ij] (a tuple)
        - signature
        - R (discarded?)
        - L
    - πs - inclusion path in (of which?) merkle tree 
    - p - attestors[ij]
    - πp - commit proof? in sig tree?


If `signedWeight ≤ provenWeight`, then `V` outputs **False**

To protect itself against having to do too much work `V` may choose to require a higher `signedWeight` in order to avoid having to verify certificates that are too long.
This may also be accomplished simply by limiting the maximum size of the map `T` that `V` will accept.) 


Otherwise, for each entry `i` such that `T[i]` is defined as `(s, πs, p, πp )`
    - check that `s.sig` is a valid signature on `M` under `p.pk`.
    - check that `πs` is the correct authenticating path for the `i`th leaf value `s` with respect to `Root_sigs`;
        - check that i is in root_sigs, with value s
    - check that `ComVerify(C_attestors, i, p, πp ) = T`; and
        - TODO
If any of the above checks fails, `V` outputs **False**.

Otherwise, for `j ∈ {0,1, . . .,numReveals −1}`, `V` computes:
    - H_inj = (j,Rootsigs,provenWeight, M,Cattestors) and
    - coinj = HashsignedWeight(Hinj)

then checks that there exists `i` such that `T[i]` is defined and is equal to `(s, πs, p, πp )` with `s.L ≤ coinj < s.L +p.weight`
If no such `i` exists, then `V` outputs **False**

If all of the above checks pass, then `V` outputs **True**.
Otherwise, `V` outputs **False**.

-----------

Verifier should
    - take a finite set of numReveal entries
    - validate the reveal signature against M
    - validate the reveal is in the attestor tree
    - validate the reveal entry is in reveal tree

*/

