/* Foundations: the definitions you must be able to state cold before any proof. */
window.CP_CONCEPTS = [
  {
    id: 'negligible',
    title: 'Negligible function',
    tags: ['asymptotics', 'definitions'],
    body: [
      'A function $\\mu:\\N \\to \\R^{+}$ is **negligible** if for every polynomial $p$ there is an $N$ such that $\\mu(\\lambda) < 1/p(\\lambda)$ for all $\\lambda > N$. Equivalently: $\\mu$ shrinks faster than the inverse of every polynomial.',
      'Why it is the right notion: it is closed under the operations proofs actually perform. If $\\mu_1, \\mu_2$ are negligible and $p$ is a polynomial, then $\\mu_1 + \\mu_2$, $p(\\lambda)\\cdot\\mu_1(\\lambda)$, and $\\mu_1\\cdot\\mu_2$ are all negligible. That closure is exactly what lets a hybrid argument sum $q(\\lambda)$ negligible gaps and still conclude "negligible".'
    ],
    watch: [
      '$2^{-\\lambda}$ and $\\lambda^{-\\log \\lambda}$ are negligible; $1/\\lambda^{100}$ is **not**.',
      'Summing a **super**-polynomial number of negligible terms is invalid. A hybrid argument over $2^{\\lambda}$ hybrids proves nothing.'
    ]
  },
  {
    id: 'ppt',
    title: 'PPT adversary and the security parameter',
    tags: ['model', 'definitions'],
    body: [
      'An adversary $\\A$ is **PPT** (probabilistic polynomial time) if it runs in time polynomial in the security parameter $\\lambda$ and may flip coins. Everything in a proof is indexed by $\\lambda$: key lengths, the number of queries $q(\\lambda)$, and the advantage.',
      'The security parameter is what makes "efficient" and "negligible" meaningful. A statement like "the adversary cannot break it" is not a theorem; "for every PPT $\\A$ there is a negligible $\\mu$ with $\\Adv_{\\A}(\\lambda) \\le \\mu(\\lambda)$" is.'
    ],
    watch: [
      'Your **reduction** must also be PPT. If $\\B$ runs $\\A$ once and does polynomial extra work, fine. If $\\B$ enumerates all keys, your proof is dead.',
      'Non-uniform adversaries get a polynomial-size advice string per $\\lambda$. Some assumptions (and most textbook definitions) are stated non-uniformly; check which your course uses before claiming a reduction is tight.'
    ]
  },
  {
    id: 'advantage',
    title: 'Advantage',
    tags: ['definitions', 'notation'],
    body: [
      'For a decision game with a hidden bit $b$, the advantage is $\\Adv(\\A) = |\\Pr[\\A \\text{ wins}] - 1/2|$, or equivalently the **distinguishing** form $\\Adv(\\A) = |\\Pr[\\A^{\\text{left}} = 1] - \\Pr[\\A^{\\text{right}} = 1]|$. The two differ by a factor of $2$; fix a convention and keep it.',
      'For a search game (forgery, inversion, collision) the advantage is just $\\Pr[\\A \\text{ wins}]$ — there is no $1/2$ to subtract, because guessing does not help.'
    ],
    watch: [
      'Do not subtract $1/2$ in a search game. A forger that succeeds with probability $1/2$ has advantage $1/2$, not $0$.',
      'The factor-of-2 slip between the two decision conventions is the single most common bookkeeping error in submitted proofs.'
    ]
  },
  {
    id: 'indist',
    title: 'Computational indistinguishability',
    tags: ['definitions'],
    body: [
      'Two ensembles $\\{X_\\lambda\\}$ and $\\{Y_\\lambda\\}$ are computationally indistinguishable, written $X \\approx_c Y$, if for every PPT distinguisher $\\D$, $|\\Pr[\\D(X_\\lambda)=1] - \\Pr[\\D(Y_\\lambda)=1]|$ is negligible.',
      'Key property: $\\approx_c$ is **transitive over polynomially many steps**. That single fact is the engine of both game hopping and hybrid arguments — it is why a chain $\\Game_0 \\approx_c \\Game_1 \\approx_c \\cdots \\approx_c \\Game_n$ with $n$ polynomial gives $\\Game_0 \\approx_c \\Game_n$.',
      'Statistical distance $\\Delta(X,Y) = \\frac{1}{2}\\sum_z |\\Pr[X=z]-\\Pr[Y=z]|$ is the stronger, unbounded-adversary version. $\\Delta$ negligible $\\implies$ $\\approx_c$; the converse fails badly (a PRG output is far from uniform statistically, yet indistinguishable).'
    ],
    watch: [
      'Indistinguishability is about **ensembles**, not single strings. "$0^\\lambda$ is indistinguishable from a random string" is not a well-formed claim about a fixed string.',
      'You may only apply $\\approx_c$ when the distinguisher can actually be built efficiently from your context. If constructing the input to $\\D$ requires the secret key, the step is illegal.'
    ]
  },
  {
    id: 'games',
    title: 'Security games and experiment notation',
    tags: ['notation', 'model'],
    body: [
      'A security definition is a game between a challenger and $\\A$. Writing it out explicitly — every line, every oracle — is not busywork: most proof bugs are visible only once the game is written as code.',
      'Template: $\\Exp^{\\text{ind-cpa}}_{\\Pi,\\A}(\\lambda)$: $k \\gets \\Gen(1^\\lambda)$; $(m_0,m_1) \\gets \\A^{\\Enc_k(\\cdot)}(1^\\lambda)$ with $|m_0|=|m_1|$; $b \\rand \\bits$; $c \\gets \\Enc_k(m_b)$; $b\' \\gets \\A^{\\Enc_k(\\cdot)}(c)$; output $1$ iff $b\'=b$.',
      'Read the game to find the leverage: what does the adversary **not** see, and which line would you have to change for the game to become trivially unwinnable? That line is usually your first game hop.'
    ],
    watch: [
      'State the restrictions explicitly ($|m_0|=|m_1|$; no decryption query on the challenge ciphertext). Proofs that quietly drop a restriction "prove" false theorems.'
    ]
  },
  {
    id: 'primitives',
    title: 'Primitive cheat sheet',
    tags: ['definitions', 'reference'],
    body: [
      '**OWF** $f$: for all PPT $\\A$, $\\Pr[f(\\A(f(x))) = f(x)]$ is negligible over $x \\rand \\bits^\\lambda$. Note the inversion condition is on the **image**, not on $x$.',
      '**PRG** $G:\\bits^\\lambda \\to \\bits^{\\ell(\\lambda)}$ with $\\ell > \\lambda$: $G(U_\\lambda) \\approx_c U_{\\ell}$.',
      '**PRF** $F:\\bits^\\lambda\\times\\bits^{n}\\to\\bits^{m}$: oracle access to $F_k$ for random $k$ is indistinguishable from oracle access to a uniformly random function $f \\rand \\Func[n,m]$.',
      '**PRP**: same, but $F_k$ is a permutation and the ideal object is a random permutation. With decryption queries allowed it is a **strong** PRP.',
      '**IND-CPA / IND-CCA**: the game above, with a decryption oracle added for CCA (barred from the challenge ciphertext).',
      '**EUF-CMA** (MAC/signature): $\\A$ gets a signing oracle and must output $(m^*,\\sigma^*)$ with $m^*$ never queried. **Strong** EUF-CMA only requires the **pair** to be new.',
      '**Collision resistance**: find $x \\ne x\'$ with $H(x)=H(x\')$. Needs a keyed family for a meaningful asymptotic definition.'
    ],
    watch: [
      'The ideal object is the tell. PRF $\\to$ random **function**, PRP $\\to$ random **permutation**. Swapping them silently is the switching-lemma trap.'
    ]
  },
  {
    id: 'rom',
    title: 'Random oracle model',
    tags: ['model'],
    body: [
      'In the ROM, a hash $H$ is modelled as a uniformly random function that all parties, including $\\A$, access only by querying. The reduction **simulates** $H$ by lazy sampling: keep a table, answer a fresh query with a fresh random value, and repeat answers consistently.',
      'Two powers this grants the reduction, and neither exists in the standard model: **programming** (choosing the answer to a query, e.g. embedding a challenge), and **extraction** (reading $\\A$\'s queries, so you learn a preimage $\\A$ must have queried to succeed).'
    ],
    watch: [
      'Consistency is mandatory: a repeated query must get the repeated answer, or your simulation is distinguishable.',
      'Programming must be **undetectable**: the value you plant has to be distributed identically to a fresh random value from $\\A$\'s view.',
      'ROM proofs are heuristic. There are schemes secure in the ROM and insecure under every instantiation. Say "in the ROM" in the theorem statement.'
    ]
  },
  {
    id: 'assumptions',
    title: 'Standard hardness assumptions',
    tags: ['assumptions', 'reference'],
    body: [
      'In a group $\\G$ of prime order $q$ with generator $g$: **DLog** — given $g^x$, find $x$. **CDH** — given $g^x,g^y$, compute $g^{xy}$. **DDH** — distinguish $(g^x,g^y,g^{xy})$ from $(g^x,g^y,g^z)$ for random $x,y,z$.',
      'Strength ordering: DDH $\\implies$ CDH $\\implies$ DLog (breaking a weaker one breaks the stronger assumption\'s scheme). DDH is **false** in groups with an efficient pairing, where CDH is still believed hard.',
      'Also standard: factoring, RSA, quadratic residuosity, and lattice assumptions (LWE, SIS). LWE is the usual post-quantum starting point.'
    ],
    watch: [
      'Pick the **weakest** assumption your proof actually needs. A proof that uses DDH when CDH suffices is a weaker theorem.',
      'Decisional assumptions prove indistinguishability; computational ones prove unforgeability/inversion. Mixing them up is a structural error, not a typo.'
    ]
  },
  {
    id: 'birthday',
    title: 'Birthday bound and union bound',
    tags: ['probability'],
    body: [
      'Union bound: $\\Pr[\\bigcup_i E_i] \\le \\sum_i \\Pr[E_i]$. It needs no independence, which is why almost every bad-event step in a game hop uses it.',
      'Birthday: among $q$ values drawn uniformly from a set of size $N$, a collision occurs with probability at most $\\frac{q(q-1)}{2N} \\le \\frac{q^2}{2N}$, and at least $\\approx 1 - e^{-q^2/2N}$. Collisions become likely at $q \\approx \\sqrt{N}$.',
      'This is where the $q^2/2^{n}$ terms in block-cipher mode proofs come from — a 128-bit block cipher gives birthday security at $2^{64}$ blocks, not $2^{128}$.'
    ],
    watch: [
      'Count the right $q$: it is the number of **blocks** or IVs, not the number of messages.'
    ]
  },
  {
    id: 'simulation',
    title: 'The simulation paradigm',
    tags: ['definitions', 'model'],
    body: [
      'For secrecy properties that are not phrased as a guessing game ("the protocol leaks nothing beyond the output"), security says: whatever an adversary learns in the **real** execution, a simulator $\\Sim$ could have produced from the ideal functionality\'s output alone.',
      'Formally $\\{\\Real_{\\Pi,\\A}(x)\\} \\approx_c \\{\\Ideal_{\\calF,\\Sim}(x)\\}$. Zero-knowledge, secure multiparty computation, and semantic security are all instances.',
      'Semantic security is the classic case: anything computable from the ciphertext is computable without it, which is exactly a simulator that never sees the message.'
    ],
    watch: [
      'The simulator must work **without** the honest parties\' inputs — that is the entire content of the definition. A "simulator" that peeks at the witness proves nothing.',
      'Watch quantifier order and rewinding: $\\Sim$ usually gets black-box access to $\\A$ and may rewind it, but must still run in expected polynomial time.'
    ]
  }
];
