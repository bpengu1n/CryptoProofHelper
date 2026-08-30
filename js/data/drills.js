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
  },

  /* Warm-up: the primer material. Wrong answers here are cheap. */
  {
    id: 'w1', kind: 'basics',
    q: 'Which of these functions is **negligible** in $\\lambda$?',
    options: [
      '$2^{-\\lambda}$',
      '$1/\\lambda^{100}$',
      '$1/(1000\\lambda)$',
      '$1/\\log \\lambda$'
    ],
    answer: 0,
    why: 'Negligible means smaller than $1/p(\\lambda)$ for **every** polynomial $p$, eventually. Only the exponential qualifies. $1/\\lambda^{100}$ looks tiny at $\\lambda = 128$ but is merely inverse-polynomial: repeat the attack $\\lambda^{100}$ times — still affordable — and it succeeds reliably.'
  },
  {
    id: 'w2', kind: 'basics',
    q: 'A forger wins the EUF-CMA game with probability $1/2$. What is its advantage?',
    options: [
      '$1/2$',
      '$0$',
      '$1/4$',
      'Undefined without knowing the tag length'
    ],
    answer: 0,
    why: 'EUF-CMA is a **search** game: the adversary must produce a forgery, and guessing does not get you there for free. So the advantage is the raw success probability, with no $1/2$ subtracted. Subtracting $1/2$ is correct only in decision games, where a coin flip already wins half the time.'
  },
  {
    id: 'w3', kind: 'basics',
    q: 'How many strings are in $\\bits^{n}$?',
    options: [
      '$2^{n}$',
      '$n^{2}$',
      '$2n$',
      '$n!$'
    ],
    answer: 0,
    why: 'Each of the $n$ positions is independently $0$ or $1$, so the multiplication rule gives $2 \\cdot 2 \\cdots 2 = 2^{n}$. This is why a $128$-bit key space has $2^{128}$ keys and why guessing one costs $2^{-128}$.'
  },
  {
    id: 'w4', kind: 'basics',
    q: 'What does $x \\rand S$ mean?',
    options: [
      '$x$ is drawn uniformly at random from the set $S$',
      '$x$ is any element of $S$ chosen by the adversary',
      '$x$ is the smallest element of $S$',
      '$x$ is a random subset of $S$'
    ],
    answer: 0,
    why: 'The dollar-arrow is uniform sampling: every element of $S$ is equally likely. Both words matter. **Uniform** is what makes brute force cost the full $|S|$; contrast $x \\gets \\A(y)$, the plain arrow, which just means "the output of running an algorithm".'
  },
  {
    id: 'w5', kind: 'basics',
    q: 'A hash maps $\\bits^{256}$ to $\\bits^{128}$. Do collisions exist?',
    options: [
      'Yes, necessarily — by the pigeonhole principle',
      'No, if the hash is collision-resistant',
      'Only if the hash is badly designed',
      'It depends on the hardness assumption'
    ],
    answer: 0,
    why: 'There are $2^{256}$ inputs and only $2^{128}$ outputs, so some output is hit twice. No assumption can change that, which is why collision resistance can only ever mean **hard to find** a collision, never "none exists". Counting arguments settle impossibility; reductions cannot.'
  },
  {
    id: 'w6', kind: 'basics',
    q: 'Which statement is the contrapositive of "if the scheme is broken then the assumption is false"?',
    options: [
      'If the assumption is true then the scheme is not broken',
      'If the assumption is false then the scheme is broken',
      'If the scheme is not broken then the assumption is true',
      'The scheme is broken if and only if the assumption is false'
    ],
    answer: 0,
    why: 'The contrapositive of $P \\implies Q$ is $\\neg Q \\implies \\neg P$, and it is always logically equivalent. Option 2 is the converse and option 3 is the inverse — different claims, neither implied. This particular contrapositive is the shape of every reduction in the app.'
  },
  {
    id: 'w7', kind: 'basics',
    q: 'You have reached a game where the challenge bit $b$ never influences anything the adversary sees. What is $\\Pr[\\A \\text{ wins}]$?',
    options: [
      'Exactly $1/2$',
      'Negligible',
      'At most $1/2$ plus a negligible amount',
      'It depends on how long $\\A$ runs'
    ],
    answer: 0,
    why: 'If $\\A$\'s view is independent of $b$, it is guessing a fair coin, so it wins exactly half the time — no matter how long it runs or how clever it is. Reaching such a game is the whole goal of a game-hopping proof: the final probability is exact, not another bound.'
  },
  {
    id: 'w8', kind: 'basics',
    q: 'Your reduction $\\B$ answers a decryption query by computing $\\Dec_k(c)$. What should you check first?',
    options: [
      'Whether $\\B$ was ever given $k$',
      'Whether $\\Dec$ runs in polynomial time',
      'Whether the ciphertext is well-formed',
      'Whether $\\A$ has exceeded its query budget'
    ],
    answer: 0,
    why: 'Simulating with a secret you were never handed is the single most common way a reduction dies. Trace every value $\\B$ uses back to something it received from its challenger or generated itself. If $k$ is not on that list, the proof does not exist yet — the embedding needs rethinking.'
  },
  {
    id: 'w9', kind: 'basics',
    q: 'In $\\Z_7^{*}$ with generator $g = 3$, what is $3^{2} \\bmod 7$?',
    options: [
      '$2$',
      '$9$',
      '$6$',
      '$1$'
    ],
    answer: 0,
    why: '$3^{2} = 9$, and $9 = 7 + 2$, so $9 \\equiv 2 \\pmod 7$. Reducing mod $7$ at every step is what keeps the numbers small; the full power list is $3, 2, 6, 4, 5, 1$, which hits all six elements — that is what makes $3$ a generator.'
  },
  {
    id: 'w10', kind: 'basics',
    q: 'Two bad events each have probability at most $2^{-40}$. What bounds the chance that at least one occurs?',
    options: [
      '$2^{-39}$, by the union bound',
      '$2^{-80}$, by independence',
      'Nothing can be said without knowing if they are independent',
      '$2^{-40}$, since they are both that small'
    ],
    answer: 0,
    why: 'The union bound gives $\\Pr[E_1 \\cup E_2] \\le \\Pr[E_1] + \\Pr[E_2] = 2^{-40} + 2^{-40} = 2^{-39}$, and it needs **no** independence assumption. That is exactly why it appears in nearly every bad-event step: you rarely know how the events relate.'
  },
  {
    id: 'w11', kind: 'basics',
    q: 'A hybrid argument uses one hybrid per possible key, so $2^{\\lambda}$ of them, each neighbouring gap negligible. Is it valid?',
    options: [
      'No — the chain must be polynomially long',
      'Yes, since every individual gap is negligible',
      'Yes, provided each hybrid is efficiently samplable',
      'Only in the random-oracle model'
    ],
    answer: 0,
    why: 'Negligible functions are closed under multiplication by a **polynomial**, not by an exponential. Summing $2^{\\lambda}$ gaps of size $2^{-\\lambda/2}$ gives something enormous. Before writing any hybrid proof, ask "how many links?" — the answer must be $\\poly(\\lambda)$.'
  },
  {
    id: 'w12', kind: 'basics',
    q: 'Why must the two messages in the IND-CPA game satisfy $|m_0| = |m_1|$?',
    options: [
      'Ciphertext length leaks plaintext length, so otherwise every scheme loses',
      'To keep the reduction polynomial time',
      'So the encryption oracle can be simulated',
      'It is a convention with no effect on the definition'
    ],
    answer: 0,
    why: 'Practically every encryption scheme reveals the length of what it encrypted. Without the restriction the adversary submits a one-bit and a one-megabyte message and wins by measuring, so no scheme would satisfy the definition. Restrictions in a game are usually load-bearing — read them twice.'
  },
  {
    id: 'w13', kind: 'basics',
    q: 'What does "$\\Pi$ is secure" quantify over, in the standard definition?',
    options: [
      'For every PPT $\\A$ there exists a negligible $\\mu$ bounding its advantage',
      'There exists a negligible $\\mu$ bounding every PPT $\\A$\'s advantage',
      'For every negligible $\\mu$ there exists a PPT $\\A$ with advantage below $\\mu$',
      'There exists a PPT $\\A$ whose advantage is negligible'
    ],
    answer: 0,
    why: 'Order matters: $\\mu$ is chosen **after** $\\A$, so each adversary may have its own bound. Option 2 swaps the quantifiers and demands one universal bound — strictly stronger, and not the standard definition. Negating option 1 gives "there exists a PPT $\\A$ with non-negligible advantage", the first line of nearly every proof here.'
  },
  {
    id: 'w14', kind: 'basics',
    q: 'What does the theorem "if DDH is hard then ElGamal is IND-CPA" actually promise?',
    options: [
      'Any efficient break of ElGamal converts into an efficient DDH solver',
      'ElGamal cannot be broken',
      'DDH is hard',
      'ElGamal is secure against unbounded adversaries'
    ],
    answer: 0,
    why: 'The theorem is conditional, and its content is the conversion. It concentrates all the risk into one much-studied problem: break the scheme and you have broken DDH, so the scheme is exactly as trustworthy as the assumption — no more, and importantly no less.'
  },
  {
    id: 'w15', kind: 'basics',
    q: 'Which is easy, and which is believed hard, in a large prime-order group?',
    options: [
      'Computing $g^{x}$ from $x$ is easy; recovering $x$ from $g^{x}$ is hard',
      'Both are easy',
      'Computing $g^{x}$ from $x$ is hard; recovering $x$ is easy',
      'Both are hard'
    ],
    answer: 0,
    why: 'Repeated squaring computes $g^{x}$ in about $\\log x$ multiplications. Going backwards is the discrete logarithm problem, with no known efficient algorithm for a well-chosen group. Public-key cryptography lives entirely in that gap — nothing about the mathematics gets harder in reverse, only the search space.'
  },
  {
    id: 'w16', kind: 'basics',
    q: 'Why is a deterministic encryption scheme never IND-CPA secure?',
    options: [
      'Encrypting the same message twice gives the same ciphertext, which the adversary can detect',
      'Deterministic algorithms cannot be efficient',
      'The key would have to be reused',
      'It is secure, just not provably so'
    ],
    answer: 0,
    why: 'The adversary asks its encryption oracle for $\\Enc(m_0)$, then submits $(m_0, m_1)$ as the challenge, then compares. A match means $b = 0$. Fresh per-message randomness — a nonce, an IV, an ephemeral value — is what closes this, and reusing it reopens it.'
  }
];
