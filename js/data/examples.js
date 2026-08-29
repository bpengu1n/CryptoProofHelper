/* Worked proofs. Every step carries a `why` — the move that produced it. */
window.CP_EXAMPLES = [
  {
    id: 'prg-onetime',
    title: 'PRG $\\implies$ one-time secrecy',
    technique: 'reduction',
    difficulty: 'warm-up',
    claim: 'Let $G:\\bits^{\\lambda}\\to\\bits^{\\ell}$ be a PRG. Then $\\Enc_k(m) = G(k)\\oplus m$ is one-time indistinguishable (EAV-secure) for $m \\in \\bits^{\\ell}$.',
    idea: 'The only thing standing between this scheme and a one-time pad is that the pad came from $G$ instead of from uniform coins. So: swap it for uniform, pay the PRG advantage, and finish with the OTP argument.',
    steps: [
      { h: 'Set up the contrapositive',
        t: 'Suppose PPT $\\A$ has $\\Adv^{\\text{eav}}_{\\Pi,\\A}(\\lambda) = \\varepsilon(\\lambda)$. Build a PRG distinguisher $\\D$.',
        why: 'The assumption is a distinguishing assumption, so the object we must build is a distinguisher — the assumption dictates $\\D$\'s interface, not us.' },
      { h: 'Embed',
        t: '$\\D$ receives a string $w \\in \\bits^{\\ell}$ (either $G(k)$ for $k \\rand \\bits^{\\lambda}$, or $w \\rand \\bits^{\\ell}$). It runs $\\A$ to get $(m_0,m_1)$, picks $b \\rand \\bits$, and returns $c = w \\oplus m_b$ to $\\A$.',
        why: 'The embedding is forced: $w$ occupies exactly the slot the pad occupies. Note $\\D$ never needs $k$ — that is the check that the simulation is legal.' },
      { h: 'Extract',
        t: '$\\A$ outputs $b\'$; $\\D$ outputs $1$ iff $b\' = b$.',
        why: '$\\D$ must output a bit, and the only signal available is whether $\\A$ succeeded.' },
      { h: 'Analyse the real case',
        t: 'If $w = G(k)$, $\\A$\'s view is exactly $\\Exp^{\\text{eav}}$, so $\\Pr[\\D=1] = \\frac{1}{2} + \\varepsilon$.',
        why: 'Distributed *identically*, not just similarly — check this claim line by line against the experiment.' },
      { h: 'Analyse the ideal case',
        t: 'If $w$ is uniform, $c = w\\oplus m_b$ is uniform and independent of $b$, so $\\Pr[\\D=1] = \\frac{1}{2}$ exactly.',
        why: 'This is the one-time-pad computation. It is information-theoretic: no assumption, no adversary running time.' },
      { h: 'Conclude',
        t: '$\\Adv^{\\PRG}(\\D) = |(\\frac{1}{2}+\\varepsilon) - \\frac{1}{2}| = \\varepsilon$. $\\D$ is PPT (it runs $\\A$ plus one XOR), so $\\varepsilon$ is negligible. $\\qed$',
        why: 'Always close by naming both facts the definition needs: the advantage bound **and** that the constructed machine is efficient.' }
    ],
    remarks: [
      'Reuse the key and the proof collapses at the ideal-case step: with two ciphertexts under one pad, $c_1 \\oplus c_2 = m_1 \\oplus m_2$ regardless of whether the pad is uniform.',
      'Exercise: adapt the proof to $\\Enc_k(m) = G(k) \\oplus m$ where $|m| < \\ell$ and only the first $|m|$ bits are used. Which step changes?'
    ]
  },
  {
    id: 'prg-hybrid',
    title: 'Hybrid argument: $q$ pseudorandom strings',
    technique: 'hybrid',
    difficulty: 'core',
    claim: 'If $G$ is a PRG, then for any polynomial $q(\\lambda)$, the tuple $(G(k_1),\\ldots,G(k_q))$ with independent $k_i \\rand \\bits^{\\lambda}$ is indistinguishable from $q$ uniform strings.',
    idea: 'The assumption gives you **one** pseudorandom string. Build a ladder in which one string at a time turns uniform, so neighbouring rungs differ in exactly the place the assumption covers.',
    steps: [
      { h: 'Define the ladder',
        t: 'For $i = 0,\\ldots,q$ let $\\Hyb_i = (u_1,\\ldots,u_i,\\ G(k_{i+1}),\\ldots,G(k_q))$ with $u_j \\rand \\bits^{\\ell}$ and $k_j \\rand \\bits^{\\lambda}$.',
        why: 'The shape "first $i$ ideal, rest real" is the standard ladder. Write it before anything else.' },
      { h: 'Check the endpoints',
        t: '$\\Hyb_0$ is all-pseudorandom (the real distribution); $\\Hyb_q$ is all-uniform (the ideal one).',
        why: 'A ladder whose endpoints are not the two distributions in the theorem proves a different theorem. Verify, do not assume.' },
      { h: 'Neighbour reduction',
        t: 'Fix $i$ and suppose $\\D$ distinguishes $\\Hyb_i$ from $\\Hyb_{i+1}$ with advantage $\\delta_i$. Build $\\B_i$: on PRG challenge $w$, sample $u_1,\\ldots,u_i$ uniform, sample $k_{i+2},\\ldots,k_q$ and compute $G(k_j)$, then run $\\D(u_1,\\ldots,u_i,\\ w,\\ G(k_{i+2}),\\ldots)$ and echo its output.',
        why: 'Everything except position $i+1$ is something $\\B$ can generate itself. The challenge goes in the one slot that differs between the two rungs.' },
      { h: 'Verify both plants',
        t: 'If $w = G(k)$ the input is exactly $\\Hyb_i$; if $w$ is uniform it is exactly $\\Hyb_{i+1}$. Hence $\\Adv^{\\PRG}(\\B_i) = \\delta_i$.',
        why: 'Both directions. This check is where hybrid proofs actually go wrong, and it is one line to do properly.' },
      { h: 'Telescope',
        t: 'By the triangle inequality, the total distinguishing gap is $\\le \\sum_{i=0}^{q-1}\\delta_i \\le q\\cdot\\max_i \\delta_i \\le q(\\lambda)\\cdot\\negl(\\lambda)$, which is negligible since $q$ is polynomial. $\\qed$',
        why: 'Name the closure property being used: polynomial $\\times$ negligible is negligible. This is the step that requires $q$ to be polynomial.' }
    ],
    remarks: [
      'If you cannot write $\\B_i$ for every $i$ uniformly, let $\\B$ sample $i \\rand \\{0,\\ldots,q-1\\}$; you lose a factor $q$ in the advantage but reach the same conclusion.',
      'The same ladder proves multi-message IND-CPA from single-message security, and proves $q$-query PRF security from a one-query notion.'
    ]
  },
  {
    id: 'prf-ctr',
    title: 'PRF $\\implies$ IND-CPA (randomized counter mode)',
    technique: 'gamehop',
    difficulty: 'core',
    claim: 'Let $F$ be a PRF on $n$-bit blocks. Randomized CTR mode — $\\Enc_k(m) = (IV,\\ m \\oplus (F_k(IV+1)\\|\\cdots\\|F_k(IV+\\ell)))$ for $IV \\rand \\bits^{n}$ — is IND-CPA.',
    idea: 'Two things must go: the PRF (replace by a random function — computational) and the risk of counter blocks repeating across queries (a bad event — statistical). Separate them into two hops, since their justifications are different in kind.',
    steps: [
      { h: '$\\Game_0$: the real game',
        t: 'The IND-CPA experiment with $\\A$ making $q$ encryption queries, each of at most $\\ell$ blocks. Let $S_i = [\\A \\text{ wins in } \\Game_i]$; target $\\Pr[S_0]$.',
        why: 'Naming the win events now means every later hop is a statement about numbers, not vibes.' },
      { h: '$\\Game_1$: idealise the PRF',
        t: 'Replace every call $F_k(\\cdot)$ by $f(\\cdot)$ for a truly random function $f$. Then $|\\Pr[S_0]-\\Pr[S_1]| \\le \\Adv^{\\PRF}_{F}(\\B)$, where $\\B$ runs the whole IND-CPA game using its own oracle in place of $F_k$.',
        why: 'A transition based on **indistinguishability**. It is legal precisely because the entire game can be run with oracle access alone — $\\B$ never needs $k$ itself.' },
      { h: '$\\Game_2$: forbid overlap',
        t: 'Let $\\bad$ be the event that the counter ranges of two queries overlap, i.e. $\\{IV_a+1,\\ldots,IV_a+\\ell\\} \\cap \\{IV_b+1,\\ldots,IV_b+\\ell\\} \\ne \\emptyset$ for some $a \\ne b$. $\\Game_2$ is $\\Game_1$ but aborts if $\\bad$ occurs.',
        why: 'A transition based on a **failure event**. Isolate it because without it the keystream blocks are not independent, and the final step would be false.' },
      { h: 'Bound the bad event',
        t: 'Each $IV$ is uniform and independent, so a fixed pair overlaps with probability $\\le 2\\ell/2^{n}$; union bound over $\\binom{q}{2}$ pairs gives $\\Pr[\\bad] \\le \\frac{q^{2}\\ell}{2^{n}}$. Hence $|\\Pr[S_1]-\\Pr[S_2]| \\le \\frac{q^{2}\\ell}{2^{n}}$.',
        why: 'Bound $\\bad$ in the **idealised** game, where the IVs are plainly uniform and nothing depends on a key. This is a birthday-style count, hence the $q^{2}$.' },
      { h: 'Finish information-theoretically',
        t: 'In $\\Game_2$ no input to $f$ repeats, so every keystream block is a fresh uniform $n$-bit string. The challenge ciphertext is a one-time pad of $m_b$, independent of $b$: $\\Pr[S_2] = 1/2$.',
        why: 'The endpoint we designed for at the start: the bit is now information-theoretically hidden, so the probability is exact, not bounded.' },
      { h: 'Collect',
        t: '$\\Adv^{\\text{ind-cpa}}(\\A) = |\\Pr[S_0]-\\tfrac12| \\le \\Adv^{\\PRF}_F(\\B) + \\frac{q^{2}\\ell}{2^{n}}$. $\\qed$',
        why: 'Concrete bounds like this are more useful than "negligible": they tell you the scheme must be rekeyed well before $q\\sqrt{\\ell} \\approx 2^{n/2}$.' }
    ],
    remarks: [
      'With AES ($n=128$) the second term forces a rekey long before $2^{64}$ blocks. This is exactly why AES-GCM has a usage limit per key.',
      'If $F$ is a block cipher (a PRP, not a PRF), insert the switching lemma as an extra hop and add $q^{2}\\ell^{2}/2^{n+1}$.',
      'Deterministic CTR with a fixed IV is trivially insecure — trace which step fails: the bad event has probability $1$.'
    ]
  },
  {
    id: 'elgamal',
    title: 'DDH $\\implies$ ElGamal is IND-CPA',
    technique: 'reduction',
    difficulty: 'core',
    claim: 'In a prime-order group $\\G = \\langle g \\rangle$ where DDH holds, ElGamal ($pk = g^{x}$, $\\Enc_{pk}(m) = (g^{y},\\ m\\cdot pk^{y})$) is IND-CPA.',
    idea: 'The DDH challenge has three slots and the ciphertext needs three group elements: public key, first component, and the mask. Line them up and the reduction writes itself.',
    steps: [
      { h: 'What $\\B$ gets',
        t: '$\\B$ receives $(g^{a}, g^{b}, Z)$ where $Z = g^{ab}$ (real) or $Z = g^{c}$ for random $c$ (random), and must output a bit.',
        why: 'DDH is a **decisional** assumption, matching IND-CPA\'s decisional goal. If we only had CDH we could not do this directly.' },
      { h: 'Embed',
        t: '$\\B$ sets $pk := g^{a}$ and runs $\\A(pk)$. On challenge $(m_0,m_1)$ it picks $b \\rand \\bits$ and returns $c^{*} = (g^{b},\\ m_b \\cdot Z)$.',
        why: 'The secret key $a$ is the DDH exponent, so $\\B$ genuinely does not know it — and does not need to, since ElGamal encryption only uses $pk$.' },
      { h: 'Real case',
        t: 'If $Z = g^{ab}$ then $c^{*} = (g^{b}, m_b\\cdot g^{ab}) = (g^{b}, m_b \\cdot pk^{b})$, exactly a real encryption with randomness $b$.',
        why: 'Verify against the scheme definition symbol by symbol. Here $b$ is uniform, so the ciphertext distribution is exactly right.' },
      { h: 'Random case',
        t: 'If $Z = g^{c}$ for uniform $c$, then $Z$ is uniform in $\\G$ and independent of everything else, so $m_b \\cdot Z$ is uniform: $\\A$\'s view is independent of $b$ and $\\Pr[b\'=b] = 1/2$.',
        why: 'Multiplication by a uniform group element is a bijection — the group-theoretic version of a one-time pad. Prime order matters: it makes every non-identity element a generator and the masking uniform.' },
      { h: 'Conclude',
        t: '$\\B$ outputs $1$ iff $b\'=b$. Then $\\Adv^{\\DDH}(\\B) = |(\\frac12 + \\Adv^{\\text{ind-cpa}}(\\A)) - \\frac12| = \\Adv^{\\text{ind-cpa}}(\\A)$, so the latter is negligible. $\\qed$',
        why: 'A rare tight reduction: no factor $q$, no guessing. Worth noticing when it happens, and saying so.' }
    ],
    remarks: [
      'ElGamal is **not** IND-CCA: given $(c_1,c_2)$, ask for a decryption of $(c_1, 2c_2)$ and halve. Find the step of this proof that a CCA adversary breaks — it is the missing decryption oracle in the embedding.',
      'DDH is false in pairing groups: $e(g^{a},g^{b}) = e(g,g)^{ab}$ decides it. The proof is only as good as the group.',
      'Messages must be encoded as group elements, not arbitrary bitstrings. Hashed ElGamal (below) fixes this and weakens the assumption to CDH.'
    ]
  },
  {
    id: 'etm',
    title: 'Encrypt-then-MAC gives IND-CCA',
    technique: 'gamehop',
    difficulty: 'advanced',
    claim: 'If $\\Pi_E$ is IND-CPA and $\\Pi_M$ is strongly unforgeable (with an independent key), then $\\Enc\'_{k_e,k_m}(m) = (c, t)$ with $c \\gets \\Enc_{k_e}(m)$, $t \\gets \\Mac_{k_m}(c)$ is IND-CCA.',
    idea: 'The decryption oracle is the obstacle: you cannot reduce to IND-CPA while you still have to answer decryption queries. So first make the decryption oracle useless (unforgeability), then the IND-CPA hop becomes legal.',
    steps: [
      { h: '$\\Game_0$: real IND-CCA',
        t: '$\\A$ gets encryption and decryption oracles; the decryption oracle refuses the challenge ciphertext only.',
        why: 'Write the restriction down explicitly — the proof will lean on it in the last step.' },
      { h: '$\\Game_1$: reject unseen tags',
        t: 'Answer a decryption query $(c,t)$ with $\\perp$ unless $(c,t)$ was output by the encryption oracle.',
        why: 'A **failure event** hop. The games differ only if $\\A$ submits a valid $(c,t)$ never produced by the oracle — which is exactly a strong forgery.' },
      { h: 'Bound the gap',
        t: '$|\\Pr[S_0]-\\Pr[S_1]| \\le \\Adv^{\\text{suf-cma}}_{\\Pi_M}(\\B_1)$, where $\\B_1$ runs the game using its MAC oracle for tags and outputs the first fresh valid pair $\\A$ submits.',
        why: '$\\B_1$ can run everything: it picks $k_e$ itself and gets tags from its oracle. Check that — a reduction that needs $k_m$ would be illegal.' },
      { h: 'Note what changed',
        t: 'In $\\Game_1$ the decryption oracle answers from a table of past encryption queries. It no longer uses $k_e$ at all.',
        why: 'This is the whole point of the hop, and it deserves its own line: it is what makes the next step possible.' },
      { h: '$\\Game_2$: encrypt zeros',
        t: 'Replace the challenge $c^{*} \\gets \\Enc_{k_e}(m_b)$ by $c^{*} \\gets \\Enc_{k_e}(0^{|m_b|})$. Then $|\\Pr[S_1]-\\Pr[S_2]| \\le \\Adv^{\\text{ind-cpa}}_{\\Pi_E}(\\B_2)$.',
        why: 'An **indistinguishability** hop, and it is legal only because of the previous step: $\\B_2$ has no $k_e$, and by $\\Game_1$ it does not need one.' },
      { h: 'Conclude',
        t: 'In $\\Game_2$ nothing depends on $b$, so $\\Pr[S_2] = 1/2$ and $\\Adv^{\\text{ind-cca}}(\\A) \\le \\Adv^{\\text{suf-cma}}(\\B_1) + \\Adv^{\\text{ind-cpa}}(\\B_2)$. $\\qed$',
        why: 'The sum of two negligibles is negligible. Reaching a game where the bit is unused is the standard endpoint.' }
    ],
    remarks: [
      'Order matters. MAC-then-Encrypt and Encrypt-and-MAC are not generically secure; find the step above that fails for them (the $\\Game_1$ hop cannot be justified, because a decryption query can be answered only by decrypting first).',
      'Independent keys matter: with $k_e = k_m$ neither reduction is legal, since each needs the other key to simulate.',
      'Plain EUF-CMA is not enough here — a malleable tag lets $\\A$ produce a new valid $(c,t\')$ on the challenge $c$, so you need **strong** unforgeability.'
    ]
  },
  {
    id: 'otp',
    title: 'Perfect secrecy of the one-time pad, and Shannon\'s bound',
    technique: 'infotheoretic',
    difficulty: 'warm-up',
    claim: 'The OTP over $\\bits^{n}$ is perfectly secret; and any perfectly secret scheme needs $|\\calK| \\ge |\\calM|$.',
    idea: 'No adversary, no running time, no assumption — count.',
    steps: [
      { h: 'State the definition',
        t: 'Perfect secrecy: $\\Pr[C = c \\mid M = m] = \\Pr[C = c \\mid M = m\']$ for all $m,m\',c$.',
        why: 'The form that is easiest to compute with. The "posterior = prior" form is equivalent by Bayes.' },
      { h: 'Compute',
        t: 'For the OTP, $\\Pr_{K}[m \\oplus K = c] = \\Pr_{K}[K = m\\oplus c] = 2^{-n}$, the same for every $m$.',
        why: 'XOR with a fixed string is a bijection on $\\bits^{n}$, so it maps the uniform distribution to the uniform distribution.' },
      { h: 'Now the lower bound',
        t: 'Suppose $|\\calK| < |\\calM|$. Fix any $c$ with $\\Pr[C=c] > 0$ and set $\\calM(c) = \\{\\Dec_k(c) : k \\in \\calK\\}$. Then $|\\calM(c)| \\le |\\calK| < |\\calM|$.',
        why: 'Correctness makes decryption a function of $(k,c)$, so at most $|\\calK|$ messages can produce $c$. Pigeonhole does the rest.' },
      { h: 'Derive the contradiction',
        t: 'Pick $m^{*} \\notin \\calM(c)$. Then $\\Pr[M = m^{*} \\mid C = c] = 0 \\ne \\Pr[M=m^{*}]$ for a uniform prior — secrecy fails. $\\qed$',
        why: 'Seeing $c$ ruled out a message; that is a strictly positive amount of information, which perfect secrecy forbids.' }
    ],
    remarks: [
      'This is the sharp reason we accept computational security: perfect secrecy costs a key as long as everything you will ever send.',
      'The same counting shows why key reuse is fatal — the two-time pad reveals $m_1 \\oplus m_2$ exactly.'
    ]
  },
  {
    id: 'merkle',
    title: 'Merkle-Damg&#229;rd preserves collision resistance',
    technique: 'reduction',
    difficulty: 'core',
    claim: 'If the compression function $h:\\bits^{n+r}\\to\\bits^{n}$ is collision resistant, then MD with length-strengthening padding is collision resistant.',
    idea: 'A collision in the whole hash must localise: walk the two chains backwards from the common output until they first disagree. That disagreement **is** a collision in $h$.',
    steps: [
      { h: 'Set up',
        t: 'Let $M \\ne M\'$ with $\\Hash(M)=\\Hash(M\')$. Write the padded blocks $m_1..m_s$, $m\'_1..m\'_{s\'}$ and chaining values $y_0 = IV$, $y_i = h(y_{i-1}\\|m_i)$, similarly $y\'_i$.',
        why: 'Naming every chaining value is what makes the backward walk expressible. Do this before arguing.' },
      { h: 'Case 1: different lengths',
        t: 'If $|M| \\ne |M\'|$ then the final padded blocks differ (they encode the length), while $y_s = y\'_{s\'}$. So $(y_{s-1}\\|m_s) \\ne (y\'_{s\'-1}\\|m\'_{s\'})$ map to the same value: a collision in $h$.',
        why: 'This is precisely what length-strengthening buys. Without it this case fails and the theorem is false.' },
      { h: 'Case 2: same length',
        t: 'Then $s = s\'$. Let $j$ be the **largest** index with $(y_{j-1}\\|m_j) \\ne (y\'_{j-1}\\|m\'_j)$; it exists because $M \\ne M\'$ implies some block differs.',
        why: 'Largest, not smallest: we walk backwards from the point where the chains are known to agree.' },
      { h: 'Extract the collision',
        t: 'By maximality $y_j = y\'_j$ (either $j=s$ and both equal the output, or all later inputs agree so the values propagate equally). Hence $h(y_{j-1}\\|m_j) = h(y\'_{j-1}\\|m\'_j)$ on distinct inputs: a collision.',
        why: 'The maximality of $j$ is doing all the work. State the two sub-cases explicitly — graders look for this.' },
      { h: 'Make it a reduction',
        t: 'Formally: given PPT $\\A$ finding MD collisions with probability $\\varepsilon$, $\\B$ runs $\\A$, performs the backward walk in $O(s)$ time, and outputs the $h$-collision. $\\Adv^{\\text{cr}}_{h}(\\B) = \\varepsilon$. $\\qed$',
        why: 'A case analysis is not yet a reduction. Name the machine, its running time, and its advantage.' }
    ],
    remarks: [
      'The proof says nothing about length extension: MD hashes satisfy $\\Hash(M\\|\\text{pad}\\|X)$ being computable from $\\Hash(M)$, which is why naive $\\Hash(k\\|m)$ MACs break and HMAC exists.',
      'Try the same walk without length padding and find the counterexample the proof stops producing.'
    ]
  },
  {
    id: 'hashed-elgamal',
    title: 'Hashed ElGamal from CDH in the ROM',
    technique: 'romprog',
    difficulty: 'advanced',
    claim: 'In the random oracle model, $\\Enc_{pk}(m) = (g^{y},\\ H(pk^{y})\\oplus m)$ is IND-CPA under CDH.',
    idea: 'Since $H$ is a random oracle, its output is a perfect pad **unless** the adversary queries the exact point $g^{xy}$. But an adversary that queries it has computed the CDH answer — so read it out of the query table.',
    steps: [
      { h: 'What $\\B$ gets',
        t: '$\\B$ receives $(g^{a},g^{b})$ and must output $g^{ab}$. It sets $pk := g^{a}$ and runs $\\A(pk)$.',
        why: 'A **computational** assumption suffices here, unlike plain ElGamal, because the hash breaks the algebraic link between the ciphertext and the message.' },
      { h: 'Simulate $H$',
        t: 'Keep a table $T$. On query $u$: return $T[u]$ if present, else sample $T[u]\\rand\\bits^{\\ell}$, store, return it.',
        why: 'Lazy sampling. State it once; consistency on repeated queries is what makes the simulation perfect.' },
      { h: 'Answer the challenge',
        t: 'On $(m_0,m_1)$, pick $b \\rand \\bits$, $r \\rand \\bits^{\\ell}$, and return $c^{*} = (g^{b},\\ r)$ — **without** computing any hash.',
        why: 'We cannot compute $H(g^{ab})$: $\\B$ does not know $a$ or $b$. So return a uniform string and hope the point is never queried.' },
      { h: 'Define $\\bad$',
        t: 'Let $\\bad$ be the event that $\\A$ queries $H$ at $g^{ab}$. Conditioned on $\\neg\\bad$, the value $H(g^{ab})$ is unconstrained in $\\A$\'s view, so $r$ is distributed exactly as $H(g^{ab})\\oplus m_b$, and the view is independent of $b$.',
        why: 'This is the identical-until-bad hop, done inside the reduction. Until $\\A$ asks, an unqueried random oracle point is a fresh one-time pad.' },
      { h: 'Bound the advantage',
        t: 'Hence $\\Adv^{\\text{ind-cpa}}(\\A) \\le \\Pr[\\bad]$.',
        why: 'A clean split: whenever $\\bad$ does not happen the adversary is guessing, so all of its advantage lives inside $\\bad$.' },
      { h: 'Extract',
        t: 'When $\\A$ halts, $\\B$ outputs a uniformly chosen $u \\in T$. If $\\bad$ occurred, $g^{ab} \\in T$, so $\\Adv^{\\text{cdh}}(\\B) \\ge \\Pr[\\bad]/q_H$ for $q_H$ hash queries. Therefore $\\Adv^{\\text{ind-cpa}}(\\A) \\le q_H \\cdot \\Adv^{\\text{cdh}}(\\B)$. $\\qed$',
        why: 'Extraction plus a guess. The factor $q_H$ is the price; note it in the theorem rather than hiding it in "negligible".' }
    ],
    remarks: [
      'The loss is real: with $q_H = 2^{60}$ hash queries the theorem is 60 bits weaker than the group. Choose parameters from the concrete bound, not from the asymptotic statement.',
      'Under the stronger DDH assumption you get a tight standard-model-flavoured proof (no $q_H$), and no random oracle. Compare the two and note what each buys.',
      'Adding a MAC over the ciphertext (as in DHIES/ECIES) upgrades this to IND-CCA via the encrypt-then-MAC hop.'
    ]
  }
];
