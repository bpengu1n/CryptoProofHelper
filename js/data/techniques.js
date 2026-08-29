/* The playbook: how each proof technique actually goes, step by step. */
window.CP_TECHNIQUES = [
  {
    id: 'reduction',
    title: 'Security by reduction',
    oneline: 'Turn an attacker on your scheme into an attacker on an assumption.',
    when: [
      'The statement is "if X is secure then my scheme $\\Pi$ is secure".',
      'There is exactly one hardness assumption in play and one place it plugs in.',
      'Default move. Almost every other technique is a reduction with extra structure.'
    ],
    skeleton: [
      { h: 'Fix the contrapositive', t: 'Assume a PPT $\\A$ breaks $\\Pi$ with non-negligible advantage $\\varepsilon(\\lambda)$. You will build PPT $\\B$ breaking the assumption. Write down both games in full before writing a line of $\\B$.' },
      { h: 'Identify $\\B$\'s input and goal', t: 'What does the challenger hand $\\B$ (e.g. a DDH tuple $(g^x,g^y,Z)$), and what must $\\B$ output (a bit, a preimage, a forgery)? These are fixed by the assumption, not by you.' },
      { h: 'Embed the challenge', t: 'Place $\\B$\'s input inside the view $\\A$ expects. This is the creative step: the embedding must be **undetectable** — $\\A$\'s view must be distributed exactly as in the real game (or negligibly close).' },
      { h: 'Simulate every oracle', t: 'Go through $\\A$\'s interface line by line. For each query, say how $\\B$ answers **without** the secret it does not have. If you cannot answer a query, the embedding is wrong — back to step 3.' },
      { h: 'Extract the answer', t: 'Translate $\\A$\'s output into $\\B$\'s output. State the map explicitly.' },
      { h: 'Account', t: 'Bound $\\Adv(\\B)$ in terms of $\\varepsilon$ (often $\\Adv(\\B) \\ge \\varepsilon/q$ or $\\varepsilon - \\negl$), and argue $\\B$ is PPT: $\\text{time}(\\B) = \\text{time}(\\A) + O(q \\cdot \\text{work per query})$.' }
    ],
    pitfalls: [
      'Simulating with a secret $\\B$ does not have. If your simulation writes $\\Dec_k$ anywhere and $\\B$ never got $k$, the proof is broken.',
      'A view that is only *approximately* right, with the gap never bounded. Either argue it is identical, or add the statistical distance to the final bound.',
      'Forgetting the conditioning: $\\A$ only helps when it wins, and $\\B$ may need to guess which query matters. That guess costs a factor $1/q$ — keep it in the bound.',
      'Claiming $\\B$ succeeds "whenever $\\A$ succeeds" when the embedding only works in one of the two challenge cases.'
    ],
    micro: 'If $G$ is a PRG then $G\'(s) = G(s)\\|s_1$ is **not** a PRG. Writing the reduction in the other direction fails at step 3 and tells you why: the last bit is a copy of an input bit, and the distinguisher does not need the assumption at all.'
  },
  {
    id: 'gamehop',
    title: 'Game hopping',
    oneline: 'Walk from the real game to an obviously-unwinnable game, one small change at a time.',
    when: [
      'Several assumptions or several primitives appear in one scheme.',
      'The scheme is composite (encrypt-then-MAC, KEM/DEM, signature-with-hash), so one monolithic reduction would be unreadable.',
      'You need to remove a bad event (a collision, a lucky forgery) before the main argument works.'
    ],
    skeleton: [
      { h: 'Game 0 = the real game', t: 'Write the security experiment verbatim, with $S_i$ denoting the event that the adversary wins in $\\Game_i$. Your target is $\\Pr[S_0]$.' },
      { h: 'Design the endpoint', t: 'Decide the final game first — usually one where the challenge bit is information-theoretically hidden, so $\\Pr[S_n] = 1/2$ exactly. Knowing the destination tells you which hops are needed.' },
      { h: 'Hop, one change per game', t: 'Each $\\Game_i \\to \\Game_{i+1}$ changes exactly **one** thing, and is justified by exactly **one** of the three transition types below.' },
      { h: 'Bound each gap', t: 'Produce $|\\Pr[S_i] - \\Pr[S_{i+1}]| \\le \\delta_i$ with a named justification for every $i$.' },
      { h: 'Telescope', t: 'Triangle inequality: $|\\Pr[S_0] - \\Pr[S_n]| \\le \\sum_i \\delta_i$, so $\\Adv = |\\Pr[S_0] - 1/2| \\le \\sum_i \\delta_i$, negligible as a finite sum of negligibles.' }
    ],
    transitions: [
      { h: 'Indistinguishability', t: 'Replace an object by a computationally close one (PRF output $\\to$ random string, real DDH tuple $\\to$ random tuple). Gap $\\le$ the advantage of a distinguisher you must exhibit. **Ask: could this distinguisher actually be built here?**' },
      { h: 'Failure event / identical-until-bad', t: 'The two games run identically unless event $\\bad$ fires. Then $|\\Pr[S_i]-\\Pr[S_{i+1}]| \\le \\Pr[\\bad]$ (the Difference Lemma). Now bound $\\Pr[\\bad]$ separately — usually a birthday or union bound, or a reduction to unforgeability.' },
      { h: 'Bridging (conceptual)', t: 'Rewrite the game so it is syntactically different but distributed identically — deferring a coin flip, sampling $r$ eagerly, replacing $y \\gets f(x)$ for a bijection $f$ by $y$ uniform. Gap is exactly $0$. Say why, in one sentence.' }
    ],
    pitfalls: [
      'Two changes in one hop. Split it; the justification differs for each.',
      'Applying the Difference Lemma without checking the games really are identical **conditioned on $\\bad$ not firing** — including all oracle answers and the winning condition.',
      'Bounding $\\Pr[\\bad]$ in the wrong game. Bound it where it is easiest (usually the later, more idealised game) and say which one you mean.',
      'A hop that changes the adversary\'s **winning condition** without noting it. That is not a bridging step.'
    ],
    micro: 'Encrypt-then-MAC IND-CCA: Game 1 = real. Game 2 = reject every decryption query whose tag was not produced by the encryption oracle (differ only if $\\A$ forged, so gap $\\le \\Adv^{\\text{euf-cma}}$). Game 3 = encrypt $0^{|m|}$ instead of $m_b$ (gap $\\le \\Adv^{\\text{ind-cpa}}$, now legal because decryption no longer needs the key for new ciphertexts). In Game 3 the bit is unused, so $\\Pr[S_3]=1/2$.'
  },
  {
    id: 'hybrid',
    title: 'Hybrid argument',
    oneline: 'Bridge two far-apart distributions through polynomially many neighbours, each pair close.',
    when: [
      'You must go from "secure for one message/query" to "secure for $q$ of them".',
      'The two endpoints differ in many places at once, so no single reduction applies.',
      'You see a loop, an array of ciphertexts, or a sequence of rounds in the scheme.'
    ],
    skeleton: [
      { h: 'Define the ladder', t: 'Define $\\Hyb_i$ for $i = 0,\\ldots,q$: the first $i$ items are **ideal** (random/simulated) and the remaining $q-i$ are **real**. Check the endpoints: $\\Hyb_0$ must be exactly the real game and $\\Hyb_q$ exactly the ideal one.' },
      { h: 'Neighbour reduction', t: 'Fix an arbitrary $i$ and build **one** $\\B_i$ distinguishing $\\Hyb_i$ from $\\Hyb_{i+1}$ from a distinguisher for the underlying primitive. $\\B$ gets a single challenge, plants it at position $i+1$, generates positions $\\le i$ ideally itself, and positions $> i+1$ really itself.' },
      { h: 'Check both plants', t: 'When the challenge is real, $\\B$ produces exactly $\\Hyb_i$; when ideal, exactly $\\Hyb_{i+1}$. Verify both, explicitly — this is where hybrid proofs break.' },
      { h: 'Sum', t: 'By the triangle inequality $|\\Pr[\\D(\\Hyb_0)=1] - \\Pr[\\D(\\Hyb_q)=1]| \\le \\sum_{i=0}^{q-1}\\delta_i \\le q \\cdot \\delta$. With $q$ polynomial and $\\delta$ negligible, the total is negligible.' },
      { h: 'Guessing variant', t: 'If you cannot build all $\\B_i$ uniformly, let $\\B$ pick $i \\rand \\{0,\\ldots,q-1\\}$ itself. Then $\\Adv(\\B) \\ge \\varepsilon/q$ — same conclusion, factor $q$ loss.' }
    ],
    pitfalls: [
      '**$q$ must be polynomial in $\\lambda$.** A hybrid over $2^{\\lambda}$ steps proves nothing; each individual gap being negligible is not enough.',
      'Endpoints that do not match the actual games. Re-derive $\\Hyb_0$ and $\\Hyb_q$ from the definitions rather than asserting them.',
      '$\\B_i$ needing information it cannot have — e.g. the real keys for positions $>i+1$ when those are the challenger\'s. If so, reorder the ladder so $\\B$ generates the parts it can generate.',
      'Letting the per-step gap $\\delta$ depend on $i$ without saying so, then quietly using a single $\\delta$.'
    ],
    micro: 'Multi-message IND-CPA from single-message: $\\Hyb_i$ encrypts $m^1_1,\\ldots,m^i_1$ (the "$1$" side) for the first $i$ queries and $m^{i+1}_0,\\ldots$ for the rest. Neighbouring hybrids differ in one ciphertext, which is exactly a single-message challenge.'
  },
  {
    id: 'badevent',
    title: 'Identical-until-bad / Difference Lemma',
    oneline: 'Two games agree until something unlucky happens; charge the whole gap to that event.',
    when: [
      'A collision, a repeated nonce/IV, a lucky forgery, or a guessed random-oracle query would break your simulation.',
      'A game hop needs to "just assume that never happens".'
    ],
    skeleton: [
      { h: 'State the lemma', t: 'If $S_i, S_{i+1}, \\bad$ are defined on a single probability space and $S_i \\land \\neg\\bad \\iff S_{i+1} \\land \\neg\\bad$, then $|\\Pr[S_i] - \\Pr[S_{i+1}]| \\le \\Pr[\\bad]$.' },
      { h: 'Couple the games', t: 'Write both games on the **same** coins, so the "identical until bad" claim is literally about the same execution. This is what makes the lemma applicable rather than merely plausible.' },
      { h: 'Verify the syntactic condition', t: 'Best practice: write the two games as one piece of pseudocode where the only difference is inside an $\\If \\bad$ branch. Then the condition holds by inspection.' },
      { h: 'Bound $\\Pr[\\bad]$', t: 'Independently: birthday bound for collisions, union bound over $q$ queries for guessing a random value, or a reduction (a forgery event bounds to EUF-CMA).' }
    ],
    pitfalls: [
      'Bounding $\\Pr[\\bad]$ in a game where the adversary\'s behaviour still depends on the secret. Move the bound to the idealised game where the values are uniform and the count is easy.',
      'A $\\bad$ that is not efficiently detectable — that is fine for the lemma (it is a probability statement), but not if you then try to build a reduction that must *notice* $\\bad$.',
      'Ignoring that $\\A$ adaptively steers toward $\\bad$. Union-bound over all $q$ queries rather than assuming a single fixed attempt.'
    ],
    micro: 'Randomized-IV CTR mode: $\\bad$ = "two encryption queries drew the same IV". Until then all keystream blocks are fresh; $\\Pr[\\bad] \\le q^2/2^{n+1}$ by birthday.'
  },
  {
    id: 'switching',
    title: 'PRP/PRF switching lemma',
    oneline: 'A random permutation looks like a random function until you see a collision.',
    when: [
      'The scheme uses a block cipher (a PRP) but the analysis wants a random function.',
      'You need to explain where a $q^2/2^{n+1}$ term in a mode-of-operation bound comes from.'
    ],
    skeleton: [
      { h: 'The statement', t: 'For any adversary making $q$ queries to a function on $n$ bits: $|\\Pr[\\A^{\\pi}=1] - \\Pr[\\A^{f}=1]| \\le \\frac{q(q-1)}{2^{n+1}}$, where $\\pi$ is a random permutation and $f$ a random function.' },
      { h: 'Where to use it', t: 'As a **bridging-with-a-cost** hop: first replace the block cipher by a random permutation (cost: $\\Adv^{\\PRP}$), then the permutation by a random function (cost: the switching term). Now the analysis is information-theoretic.' },
      { h: 'Why it is true', t: 'Identical-until-bad again: $\\bad$ = the random function repeats an output. Until then, both oracles look like distinct uniform values.' }
    ],
    pitfalls: [
      'Applying it when the adversary also has the **inverse** oracle — then you need a strong PRP, and the plain lemma statement does not apply as written.',
      'Forgetting the term entirely and claiming beyond-birthday security for a mode that does not have it.'
    ],
    micro: 'AES-based CTR "secure up to $2^{128}$ queries" is wrong: the switching term alone makes the bound vacuous around $q = 2^{64}$.'
  },
  {
    id: 'romprog',
    title: 'Programming the random oracle',
    oneline: 'Plant your challenge in a hash answer, or read the adversary\'s queries to extract a solution.',
    when: [
      'The scheme hashes something, and the proof is allowed to be in the ROM.',
      'You need to invert or extract — e.g. CDH from a hashed Diffie-Hellman key, or a preimage from a signature forgery.'
    ],
    skeleton: [
      { h: 'Maintain the table', t: 'Keep $T$ mapping queries to answers. On query $x$: if $x \\in T$ return $T[x]$, else sample $T[x] \\rand \\bits^{m}$ and return it. Say this once, then only describe the deviations.' },
      { h: 'Plant', t: 'For a chosen query (often a guessed index $i^* \\rand [q]$), answer with a value derived from $\\B$\'s challenge instead of a fresh random one. Argue the planted value is distributed identically to a uniform one.' },
      { h: 'Extract', t: 'If $\\A$ can only win by querying some $x^*$, then $x^*$ is sitting in $T$ when $\\A$ halts. $\\B$ reads it off — possibly guessing which of the $q$ entries it is, losing a factor $q$.' },
      { h: 'Account for the guess', t: 'The final bound is typically $\\Adv(\\B) \\ge \\frac{1}{q}\\left(\\varepsilon - \\frac{q}{2^{m}}\\right)$: guess the right query, minus the chance $\\A$ wins without querying at all.' }
    ],
    pitfalls: [
      'Inconsistent answers across repeated queries — instantly distinguishable.',
      'Planting a value with the wrong distribution (e.g. one that is not uniform, or that collides with an earlier answer) without bounding the difference.',
      'Forgetting the "$\\A$ wins without ever querying $x^*$" case. It is small, but it must appear in the bound.',
      'Claiming a standard-model theorem from a ROM proof. State the model in the theorem.'
    ],
    micro: 'Hashed ElGamal (DHIES) is IND-CPA under CDH in the ROM: to win, $\\A$ must query $H(g^{xy})$; the reduction reads $\\A$\'s oracle queries and outputs one at random as its CDH solution.'
  },
  {
    id: 'rewinding',
    title: 'Rewinding and the Forking Lemma',
    oneline: 'Run the adversary twice from the same state with different challenges, and solve for the secret.',
    when: [
      'Sigma protocols, identification schemes, Fiat-Shamir signatures (Schnorr).',
      'Proving special soundness, knowledge extraction, or zero-knowledge simulation.'
    ],
    skeleton: [
      { h: 'Special soundness', t: 'Two accepting transcripts $(a, c, z)$ and $(a, c\', z\')$ with the **same** first message and $c \\ne c\'$ yield the witness. For Schnorr: $x = (z - z\')/(c - c\')$ in $\\Z_q$.' },
      { h: 'Fork', t: 'Run $\\A$ to its output, rewind to just after it produced $a$ (or to just before the target random-oracle query), and resample the challenge. The Forking Lemma bounds the probability that both runs succeed on the same $a$ with distinct challenges.' },
      { h: 'The bound', t: 'Roughly $\\text{frk} \\ge \\varepsilon\\left(\\frac{\\varepsilon}{q} - \\frac{1}{|\\calC|}\\right)$ — the loss is **quadratic** in the adversary\'s advantage, which is why Fiat-Shamir proofs are famously non-tight.' },
      { h: 'Simulation direction', t: 'For zero-knowledge, run the transcript **backwards**: pick $c$ and $z$ first, then solve for $a$ that makes verification accept. This produces a correct-looking transcript with no witness.' }
    ],
    pitfalls: [
      'Rewinding to the wrong point — the two runs must share everything up to and including $a$, and diverge only in the challenge.',
      'Assuming both runs succeed with probability $\\varepsilon^2$ without the Forking Lemma; the dependence between the runs is the whole difficulty.',
      'Nested rewinding in concurrent settings can blow up to super-polynomial time. Say why yours does not.',
      'Forgetting $c \\ne c\'$: identical challenges give you the same equation twice and no witness.'
    ],
    micro: 'Schnorr: verification is $g^{z} = a\\cdot y^{c}$. Two transcripts give $g^{z-z\'} = y^{c-c\'}$, hence $x = (z-z\')(c-c\')^{-1}$, which requires $c \\ne c\'$ and $q$ prime so the inverse exists.'
  },
  {
    id: 'infotheoretic',
    title: 'Information-theoretic and counting arguments',
    oneline: 'No assumption, no adversary running time — just probability and pigeonhole.',
    when: [
      'Perfect secrecy, one-time pads, secret sharing, universal hashing, min-entropy extraction.',
      'You need a lower bound / impossibility ("no scheme with $|\\calK| < |\\calM|$ is perfectly secret").'
    ],
    skeleton: [
      { h: 'Fix the right measure', t: 'Perfect secrecy: $\\Pr[M=m \\mid C=c] = \\Pr[M=m]$ for all $m,c$ with $\\Pr[C=c]>0$. Equivalently $\\Pr[\\Enc_K(m)=c]$ is the same for every $m$.' },
      { h: 'Compute, do not reduce', t: 'Sum over keys directly. With a uniform key, for each $(m,c)$ count how many keys map $m \\mapsto c$.' },
      { h: 'For impossibility, count', t: 'Pigeonhole: if $|\\calK| < |\\calM|$, fix a ciphertext $c$; the set of messages decryptable from $c$ has size $\\le |\\calK| < |\\calM|$, so some $m$ is excluded and observing $c$ rules it out. Secrecy fails.' }
    ],
    pitfalls: [
      'Quietly reusing a one-time key. Two-time pad leaks $m_1 \\oplus m_2$; the perfect-secrecy calculation assumes a fresh uniform key each time.',
      'Confusing statistical distance with computational indistinguishability in the write-up — say which one your theorem gives, since statistical is strictly stronger.'
    ],
    micro: 'OTP: for any $m$, $\\Pr_K[m \\oplus K = c] = \\Pr_K[K = m \\oplus c] = 2^{-n}$, independent of $m$. That single line is the whole proof.'
  }
];
