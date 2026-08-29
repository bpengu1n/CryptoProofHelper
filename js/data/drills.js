/* Drills. Two kinds:
 *   kind 'technique' — read a problem statement, name the right proof move.
 *   kind 'flaw'      — read a proof step, find what is actually wrong with it.
 */
window.CP_DRILLS = [
  {
    id: 'd1', kind: 'technique',
    q: 'Prove: if $F$ is a PRF then $\\Mac_k(m) = F_k(m)$ is EUF-CMA secure for fixed-length messages.',
    options: [
      'Direct reduction: a forger becomes a PRF distinguisher',
      'Hybrid argument over the $q$ signing queries',
      'Rewinding the forger to extract the key',
      'Information-theoretic counting over the key space'
    ],
    answer: 0,
    why: 'One primitive, one assumption, one plug-in point — the default move. $\\B$ answers signing queries with its oracle, and tests the forgery $(m^{*},t^{*})$ by querying $m^{*}$ and checking $t^{*}$. Against a random function the forgery succeeds with probability $2^{-m}$, so $\\Adv^{\\PRF}(\\B) \\ge \\varepsilon - 2^{-m}$. No hybrid is needed because the assumption already covers $q$ queries.'
  },
  {
    id: 'd2', kind: 'technique',
    q: 'Prove: a scheme secure for one encryption is secure for $q(\\lambda)$ encryptions.',
    options: [
      'Hybrid argument',
      'Identical-until-bad',
      'Simulation with rewinding',
      'The switching lemma'
    ],
    answer: 0,
    why: 'The classic trigger: going from one to many. Build $\\Hyb_i$ where the first $i$ ciphertexts encrypt the "left" messages and the rest the "right" ones; neighbours differ in exactly one ciphertext, which is what the single-message assumption covers.'
  },
  {
    id: 'd3', kind: 'technique',
    q: 'You are analysing CBC mode and need to argue that the chaining values never repeat during the game.',
    options: [
      'Identical-until-bad plus a birthday bound',
      'A direct reduction to the block cipher',
      'A hybrid over the message blocks',
      'Programming the random oracle'
    ],
    answer: 0,
    why: '"Never repeats" is a bad event, not a computational claim. Define $\\bad$ = a repeated input to the permutation, apply the Difference Lemma, and bound $\\Pr[\\bad]$ by the birthday bound in the idealised game where the values are uniform.'
  },
  {
    id: 'd4', kind: 'technique',
    q: 'Prove that a Schnorr identification adversary can be used to compute discrete logs.',
    options: [
      'Rewinding / special soundness',
      'A hybrid argument over the challenge space',
      'A single straight-line reduction',
      'A counting argument'
    ],
    answer: 0,
    why: 'One accepting transcript reveals nothing — a simulator can produce it without the witness. You need **two** transcripts sharing the first message with different challenges, which is exactly rewinding: $x = (z-z\')/(c-c\')$.'
  },
  {
    id: 'd5', kind: 'technique',
    q: 'Show no encryption scheme with a 128-bit key can be perfectly secret for 256-bit messages.',
    options: [
      'Counting / pigeonhole (information-theoretic)',
      'Reduction to a hardness assumption',
      'Game hopping to a game where the bit is hidden',
      'A hybrid over the message bits'
    ],
    answer: 0,
    why: 'It is an impossibility for **unbounded** adversaries, so no computational assumption can appear. Fix a ciphertext $c$: at most $2^{128}$ messages decrypt from it, so some 256-bit message is excluded, and seeing $c$ rules it out.'
  },
  {
    id: 'd6', kind: 'technique',
    q: 'Prove IND-CCA for a KEM/DEM construction where the DEM key is derived as $H(\\text{shared secret})$.',
    options: [
      'Game hopping, with a ROM-programming hop for $H$',
      'A single reduction to the DEM\'s security',
      'A hybrid over the ciphertext blocks',
      'The switching lemma'
    ],
    answer: 0,
    why: 'Two primitives and a hash means a sequence of games: first make the derived key uniform (ROM: the adversary cannot query the shared secret without solving CDH), then reduce to DEM security. One monolithic reduction would need to simulate both parts at once.'
  },
  {
    id: 'd7', kind: 'technique',
    q: 'Prove that a zero-knowledge protocol leaks nothing about the witness.',
    options: [
      'Exhibit a simulator and prove real $\\approx_c$ ideal',
      'Reduce to a decisional assumption directly',
      'Bound the adversary\'s advantage by a birthday bound',
      'Hybrid over the protocol rounds'
    ],
    answer: 0,
    why: '"Leaks nothing" is not a guessing game, so it needs the simulation paradigm: build $\\Sim$ that produces the adversary\'s view **without** the witness, then show the two views are indistinguishable. (Hybrids often appear *inside* that indistinguishability proof, but the top-level shape is simulation.)'
  },
  {
    id: 'd8', kind: 'flaw',
    q: 'Step: "$\\B$ receives the DDH challenge $(g^{a},g^{b},Z)$, sets $pk = g^{a}$, and answers $\\A$\'s decryption queries by computing $\\Dec_{a}(c)$."',
    options: [
      '$\\B$ does not know $a$, so it cannot decrypt',
      'The public key should be $g^{b}$',
      'DDH is the wrong assumption for a decisional goal',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'The canonical illegal simulation. $a$ is the DDH challenger\'s secret exponent; $\\B$ only ever sees $g^{a}$. Any proof line that uses a value the reduction was never given is fatal. It is also why this template proves IND-CPA and not IND-CCA.'
  },
  {
    id: 'd9', kind: 'flaw',
    q: 'Step: "We build hybrids $\\Hyb_0,\\ldots,\\Hyb_{2^{\\lambda}}$, each pair differing negligibly, so the endpoints are indistinguishable."',
    options: [
      'The number of hybrids must be polynomial in $\\lambda$',
      'Hybrids must differ by exactly one bit',
      'The triangle inequality does not apply to probabilities',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'The sum $\\sum_i \\delta_i$ is only negligible when the number of terms is polynomial. With $2^{\\lambda}$ steps of size $2^{-\\lambda/2}$ each, the total is astronomically large — you can "prove" that uniform is indistinguishable from constant this way.'
  },
  {
    id: 'd10', kind: 'flaw',
    q: 'Step: "$\\A$ forges with probability $\\varepsilon$, so $\\B$ succeeds with probability $\\varepsilon$; since $\\varepsilon$ is non-negligible we are done." — in a proof where $\\B$ must first guess which of $\\A$\'s $q$ queries is the target.',
    options: [
      'The bound must be $\\varepsilon/q$, not $\\varepsilon$',
      'Non-negligible should read noticeable',
      '$\\B$ is not PPT',
      'Nothing is wrong'
    ],
    answer: 0,
    why: '$\\B$ only wins when its guess is right, which happens with probability $1/q$ independently of $\\A$\'s success. The conclusion survives ($\\varepsilon/q$ is still non-negligible for polynomial $q$), but the stated bound is wrong — and in concrete-security terms the loss is exactly what determines parameter sizes.'
  },
  {
    id: 'd11', kind: 'flaw',
    q: 'Step: "Games $\\Game_1$ and $\\Game_2$ are identical unless $\\bad$ occurs, and $\\Pr[\\bad]$ is small **in $\\Game_1$**, where $\\bad$ = a collision among values the adversary derives from the real PRF."',
    options: [
      'Bound $\\Pr[\\bad]$ in the idealised game, where the values are uniform',
      'The Difference Lemma needs the games to be independent',
      '$\\bad$ must be efficiently detectable',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'In $\\Game_1$ the values come from a keyed PRF, so you have no clean probability to compute — a birthday bound does not apply to them directly. Do the PRF hop first, then bound $\\bad$ in the game where the values are genuinely uniform. (The Difference Lemma itself is fine with either game, since $\\bad$ lives in a shared probability space; the issue is that only one of them lets you *compute* the bound.)'
  },
  {
    id: 'd12', kind: 'flaw',
    q: 'Step: "The simulator $\\Sim$ takes the witness $w$ and the statement $x$, and outputs a transcript identical to the real one. Hence the protocol is zero-knowledge."',
    options: [
      '$\\Sim$ must work without $w$',
      '$\\Sim$ must be deterministic',
      'Identical is too strong; it must be computational',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'A simulator given the witness proves nothing at all — the honest prover is such a "simulator". The entire content of zero-knowledge is that the view is producible from $x$ alone.'
  },
  {
    id: 'd13', kind: 'flaw',
    q: 'Step: "Since $G$ is a PRG, $G(k)$ is a uniformly random string, so the ciphertext is a one-time pad and secrecy is perfect."',
    options: [
      'Pseudorandom is not uniform; the conclusion must be computational',
      'The PRG must be length-doubling',
      'The pad must be at least as long as the message',
      'Nothing is wrong'
    ],
    answer: 0,
    why: '$G(k)$ ranges over at most $2^{\\lambda}$ of $2^{\\ell}$ strings, so it is statistically *very* far from uniform — an unbounded adversary breaks it outright. The correct phrasing replaces $G(k)$ by uniform in a game hop and pays $\\Adv^{\\PRG}$, concluding computational, not perfect, secrecy.'
  },
  {
    id: 'd14', kind: 'flaw',
    q: 'Step: "$\\B$ answers each random-oracle query with a fresh uniform string."',
    options: [
      'Repeated queries must receive the same answer',
      'Answers should come from the challenge distribution',
      'The oracle should be programmed on every query',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'A random *function* is consistent. Answering the same query twice with different values is trivially distinguishable from a real random oracle, so $\\A$\'s success probability inside the simulation says nothing about the real game. Keep the table.'
  },
  {
    id: 'd15', kind: 'flaw',
    q: 'Step: "$\\B$ tries all $2^{\\lambda}$ keys to find the one consistent with $\\A$\'s queries, then outputs it."',
    options: [
      '$\\B$ is not PPT, so it breaks no assumption',
      'The key might not be unique',
      '$\\A$ might not make any queries',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'Assumptions only say that *efficient* adversaries fail. An exponential-time $\\B$ contradicts nothing — it "breaks" every computational assumption and therefore proves nothing. Every reduction must state its running time.'
  },
  {
    id: 'd16', kind: 'flaw',
    q: 'Step: "In the CCA game, $\\B$ answers the decryption query on the challenge ciphertext $c^{*}$ by returning $m_b$."',
    options: [
      'The game forbids that query; handling it hides a broken simulation',
      '$\\B$ should return $\\perp$ and continue',
      '$\\B$ should abort and output a random bit',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'The IND-CCA definition bars $\\A$ from querying $c^{*}$; a legal adversary never makes it. Writing an answer that uses $m_b$ suggests the simulation is relying on knowledge it does not have. State the restriction and drop the case.'
  },
  {
    id: 'd17', kind: 'flaw',
    q: 'Step: "Both games abort on $\\bad$; since aborting is the same in both, $\\Pr[S_1] = \\Pr[S_2]$."',
    options: [
      'The Difference Lemma gives $\\le \\Pr[\\bad]$, not equality',
      '$\\bad$ must have probability zero',
      'The games must use independent coins',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'Identical-until-bad yields $|\\Pr[S_1]-\\Pr[S_2]| \\le \\Pr[\\bad]$. Equality requires $\\Pr[\\bad]=0$. Skipping this quietly drops a term that is often the dominant one in the final concrete bound.'
  },
  {
    id: 'd18', kind: 'flaw',
    q: 'Step: "Since $\\A$ has advantage $\\varepsilon$ in the IND-CPA game, $\\Pr[\\A \\text{ outputs } b] = \\varepsilon$."',
    options: [
      'It is $\\frac{1}{2}+\\varepsilon$ (or $\\frac{1}{2}+\\frac{\\varepsilon}{2}$, by convention)',
      'It is $2\\varepsilon$',
      'It is $\\varepsilon - \\frac{1}{2}$',
      'Nothing is wrong'
    ],
    answer: 0,
    why: 'Advantage in a decision game is measured **relative to guessing**. Under $\\Adv = |\\Pr[\\text{win}]-1/2|$ the win probability is $1/2 + \\varepsilon$; under the doubled convention $\\Adv = 2|\\Pr[\\text{win}]-1/2|$ it is $1/2+\\varepsilon/2$. Fix one convention at the top of the proof and never mix them.'
  }
];
