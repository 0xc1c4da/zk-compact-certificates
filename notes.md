## Creating the certificate

- 1) Set `signersList` to empty and `signedWeight` to 0.

- 2) Obtain signatures of attestors until `signedWeight > provenWeight`, where `signedWeight` is computed as described immediately below:
	- For each signature obtained:
    	- **Find** the location `i` of the attestor who created it in the `attestors` list and verify that `i < signersList` (otherwise reject this signature as a duplicate and continue)
    	- **Verify** the signature under `attestors[i].pk` (this is done to prevent a denial of service attack, in which a bad signature could cause the prover to create an invalid certificate—see §VIII-A).
    	- If verification succeeds, set
        	- `signedWeight =signedWeight+attestors[i].weight`
        	- add `i` to `signersList`
          	- (higher signedWeight will result in a smaller compact certificate, so it’s good to obtain more)

- 3) Initialize a list `sigs` having the same length as `attestors`.
  - Each entry in `sigs` consists of a triple `(sig,L,R)`, which is computed as follows:
    - For each i starting with 0, first set `sigs[i].L = sigs[i −1].R`, (with the base case `sigs[0].L = 0`)
    - if `i` is in `signersList`, set `sigs[i].R = sigs[i].L + attestors[i].weight`
      - and let `sigs[i].sig` be the signature on `M` under `attestors[i].pk` that the prover obtained in the previous step.
      - Otherwise, set `sigs[i].R = sigs[i].L` and leave `sigs[i].sig` empty
    - In addition, we define (but do not store) `sigs[i].weight = sigs[i].R − sigs[i].L`
    - Notice that the `R` value of the last entry in `sigs` will be equal to `signedWeight`

- 4) Compute `Root_sigs` as the Merkle root of a Merkle tree whose leaves are the entries of `sigs`

- 5) Create a function **IntToInd** that allows efficient lookups from a value coin
  - such that `0 ≤ coin < signedWeight`, to the unique index `i` 
  - such that `sigs[i].L ≤ coin < sigs[i].R`
  - This function can be implemented via a binary search on the `L` values of the `sigs` array.
  - We will denote such `i` via `IntToInd(coin)`
  
- 6) Create a map `T` as follows:
  - `numReveals = [ k + q / log2(signedWeight/provenWeight) ]`
  - then for j ∈ {0,1, . . .,numReveals −1},
    - Hin_j = (j, Root_sigs, provenWeight, M, C_attestors),
    - coin_j = HashsignedWeight(Hinj )
    - `ij` = IntToInd(coin_j)
    - If `T[ij]` is not yet defined, define `T[ij]` to consist of the four-tuple `(s, πs, p, πp)` containing:
      - `s` = sigs[ij] (the tuple, without the R value)
      - the Merkle authenticating path `πs` to the ithj leaf,
      - `p` = attestors[ij ], and
      - `πp` = ComProve(ij, attestors)
    - The resulting compact certificate cert consists of `Root_sigs`, `signedWeight`, and the `map T`, which has at most `numReveals` entries,
    - but will have fewer if different iterations of Step 6 select the same i value (see Figure 7, Section VII).

## Verifying the Certificate

The verifier `V` knows `C_attestors = Commit(attestors)`, and
- receives the message `M`,
- the value `provenWeight`,
- and the compact certificate cert consisting of `Root_sigs`,
- `signedWeight`,
- and a map `T` with up to `numReveals` entries, each containing the four-tuple `(s, πs, p, πp )`, where `numReveals` is defined in Equation (1) (Section IV-A).

If `signedWeight ≤ provenWeight`, then `V` outputs **False**


To protect itself against having to do too much work `V` may choose to require a higher `signedWeight` in order to avoid having to verify certificates that are too long.

This may also be accomplished simply by limiting the maximum size of the map `T` that `V` will accept.) 


Otherwise, for each entry `i` such that `T[i]` is defined as `(s, πs, p, πp )`
- check that `πs` is the correct authenticating path for the `i`th leaf value `s` with respect to `Root_sigs`;
- check that `ComVerify(C_attestors, i, p, πp ) = T`; and
- check that `s.sig` is a valid signature on `M` under `p.pk`.

If any of the above checks fails, `V` outputs **False**.

Otherwise, for `j ∈ {0,1, . . .,numReveals −1}`, `V` computes:

- H_inj = (j,Rootsigs,provenWeight, M,Cattestors) and
- coinj = HashsignedWeight(Hinj)

then checks that there exists `i` such that `T[i]` is defined and is equal to `(s, πs, p, πp )` with `s.L ≤ coinj < s.L +p.weight`
If no such `i` exists, then `V` outputs **False**

If all of the above checks pass, then `V` outputs **True**.
Otherwise, `V` outputs **False**.


## Combine SNARKs and compact certificates: 

prove knowledge of a valid compact certificate
- instead of proving validity of attestors’ signatures directly


This approach would reduce the SNARK’s proving costs by
orders of magnitude (because the compact certificate verifier
only checks a small number of attestors’ signatures) while
potentially reducing certificate size and verification cost. 

We leave evaluating this approach to future work.


## Optimisations

To save space and reduce the cost of computing Rootsigs,
the entry sigs[i] may be left entirely empty for i <
signersList, and the R value of each entry in sigs need
not be stored (since it equals the L value of the next entry).

- Computing numReveals precisely in the prover and verifier
algorithms requires high-precision arithmetic, which may
be slow and difficult to implement. Instead, we propose (in
Appendix B) and implement (in Section VII) an approximate
calculation of numReveals.

- **Combining multiple Merkle paths into a single subtree** will
save bandwidth, because of overlapping entries. Moreover,
because higher-weight entries in the sigs and attestors
lists are more likely to be revealed, sorting attestors by
weight before committing to it will likely provide more
overlap in Merkle paths and thus will reduce the total proof
size. We implement this optimization in Section VII.

- **Aggregatable vector commitments** (see [57] and references
therein) allow one to combine multiple proofs πp into one,
reducing the size of the certificate (we do not implement
this optimization, because it comes at a considerable
computational cost; instead, we use a Merkle tree for
Cattestors)