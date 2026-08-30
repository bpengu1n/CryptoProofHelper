/* Course content: Bellare & Rogaway "Introduction to Modern Cryptography"
   Chapters 1–2. Chapters 3+ are placeholders. */
(function () {
  'use strict';

  window.CP_COURSE = [
    /* ------------------------------------------------------------------ */
    /* Chapter 1 — Introduction                                            */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch1',
      num: 1,
      title: 'Introduction',
      blurb: 'What cryptography actually solves, the players involved, and the modern way of proving a scheme is secure.',
      sections: [
        {
          id: 'ch1-bigpicture',
          title: 'What cryptography is actually solving',
          body: [
            'Cryptography starts from a simple, practical problem: two people want to exchange information privately, but their messages have to travel through a world that cannot be trusted. The internet was not designed for privacy. Packets get copied. Logs get kept. Anyone with access to the right router can read what you sent.',
            'The classical response was to obscure the message — replace letters with other letters, use a codebook, rotate the alphabet by a fixed amount. These tricks worked until someone with enough patience found the pattern. Then a better trick was invented. Then that one was broken. For centuries, cryptography was an arms race between scheme designers and cryptanalysts, with no principled way to know which side was winning.',
            'Modern cryptography takes a different route entirely. Instead of hoping nobody finds the flaw, you prove that exploiting the flaw would require solving a mathematical problem that the world\'s best mathematicians have tried and failed to solve for decades. The security comes not from obscurity, but from reduction: breaking the scheme would imply breaking something believed to be genuinely hard.',
            'That shift — from "nobody has broken it yet" to "breaking it requires solving problem X, and X is hard" — is what makes modern cryptography a science rather than a craft. Learning to read and write arguments in that style is what this course is about.'
          ]
        },
        {
          id: 'ch1-players',
          title: 'The cast: sender, receiver, adversary',
          anim: 'channel',
          body: [
            'Every cryptographic protocol casts three roles. The sender (call them S, or Alice) wants to get a message to the receiver (R, or Bob). The adversary (A, or Eve) sits in the middle, watching.',
            'The "channel" is just whatever medium carries the messages — the internet, a phone network, the postal service. The central assumption of modern cryptography is that this channel is completely controlled by the adversary. They can read every bit that travels across it. In stronger attack models, they can also modify messages in transit, inject fake ones, delay or replay old ones. The adversary is assumed to be powerful.',
            'This might sound hopeless, but notice what the adversary cannot do: they cannot read your mind. They do not know the secret key that Alice and Bob share (in the symmetric setting), or the private key that only Bob holds (in the public-key setting). That small piece of private information is the only thing standing between the adversary and full access.',
            'The job of a cryptographic scheme is to take that small, local secret and use it to make messages unintelligible to anyone who does not hold it — even an adversary who sees every ciphertext ever produced and has unlimited time to stare at them.'
          ]
        },
        {
          id: 'ch1-goals',
          title: 'Three goals: confidentiality, integrity, authentication',
          body: [
            'Security means different things in different contexts. Three goals appear most often.',
            'Confidentiality (also called privacy or secrecy) means the adversary cannot learn anything about the content of a message. Not just the main content — even incidental information such as "this message is longer than ten characters" or "this message starts with the letter A" counts as a violation of confidentiality in the strongest formal definitions.',
            'Integrity means the adversary cannot change a message in transit without the receiver detecting it. Integrity and confidentiality are logically independent. You can build a scheme that hides the content perfectly but allows an adversary to flip arbitrary bits undetected. You can build another that lets the adversary read everything but guarantees any tampering is caught. The goals are complementary but not the same.',
            'Authentication means the receiver can verify that a message truly came from the claimed sender, not from an adversary impersonating them. A digital signature is the public-key tool for this: a piece of data attached to the message that only the true sender could have produced, verifiable by anyone who has the sender\'s public key.',
            'This course opens with confidentiality — specifically the question of when an encryption scheme provably keeps messages secret — because the definitions and proof techniques there are the clearest introduction to the style of reasoning used across the field.'
          ]
        },
        {
          id: 'ch1-models',
          title: 'Symmetric and public-key encryption',
          anim: 'trust-models',
          body: [
            'How much do Alice and Bob already trust each other? In cryptography this question has a precise technical answer: do they share a secret that the adversary does not know?',
            'In the symmetric-key (or shared-key) setting, Alice and Bob have already established a shared secret key $K$ through some secure out-of-band channel — maybe they met in person, maybe they ran a key-exchange protocol earlier. Both know $K$; the adversary does not. The encryption algorithm uses $K$ to lock a message; decryption uses the same $K$ to unlock it.',
            'In the public-key (or asymmetric) setting, no prior meeting is required. Bob generates a mathematically related pair: a public key $\\mathit{pk}$ that he publishes to the world, and a private key $\\mathit{sk}$ that only he knows. Alice encrypts using $\\mathit{pk}$ — anyone can write to Bob. Only Bob can read, because only Bob has $\\mathit{sk}$.',
            'A symmetric encryption scheme is formally a triple of algorithms $(\\mathcal{K}, \\mathcal{E}, \\mathcal{D})$. The key generation algorithm $\\mathcal{K}$ produces a key $K$. The encryption algorithm takes $K$ and a plaintext $M$ and produces a ciphertext $C = \\mathcal{E}_K(M)$. The decryption algorithm takes $K$ and $C$ and recovers $M = \\mathcal{D}_K(C)$. The correctness requirement is that $\\mathcal{D}_K(\\mathcal{E}_K(M)) = M$ for every valid key and message.',
            'This course focuses on symmetric encryption first because the definitions and proofs are more concrete. Public-key schemes come later, once you have the tools and the vocabulary.'
          ]
        },
        {
          id: 'ch1-paradigm',
          title: 'The provable-security paradigm',
          body: [
            'How do you know if a cryptographic scheme is secure? There are two historical traditions.',
            'The older approach is cryptanalysis-driven: design a scheme, publish it, and challenge the world to break it. If nobody breaks it for long enough — say, twenty years — you decide to trust it. This has genuine value: a scheme that survives decades of public scrutiny has passed a real test. The problem is that absence of a known attack is not proof of security. A single new idea can break a widely trusted scheme overnight.',
            'The modern approach — provable security — defines formally what "breaking the scheme" means, then proves that any algorithm that breaks the scheme can be turned into one that solves a mathematical problem believed to be hard: factoring large integers, computing discrete logarithms, and so on. Since we believe those problems are genuinely intractable, the scheme must also be hard to break.',
            'The crucial point: provable security is always relative. You are not proving security in an absolute sense. You are proving "if problem X is hard, then this scheme is secure." If the underlying assumption turns out to be wrong, the guarantee evaporates. The proof is only as strong as its assumptions.',
            'A reduction argument has a shape you will see over and over. Suppose someone claims they have an efficient algorithm $\\mathcal{A}$ that breaks scheme $\\mathcal{E}$. You construct a new algorithm $\\mathcal{B}$ that receives an instance of the hard problem, uses it to simulate the "break $\\mathcal{E}$" game for $\\mathcal{A}$, and then translates $\\mathcal{A}$\'s output into a solution for the hard problem. Conclusion: if breaking $\\mathcal{E}$ is easy, the hard problem is easy. But we assumed it is hard. Contradiction — $\\mathcal{A}$ cannot exist.'
          ],
          quiz: [
            {
              q: 'What does it mean for a cipher to be "provably secure"?',
              opts: [
                'No adversary has ever broken it in practice.',
                'Breaking it is mathematically equivalent to solving a problem believed to be hard.',
                'It uses keys long enough to resist brute-force search.',
                'It has been approved by a standards body.'
              ],
              answer: 1,
              why: 'Provable security means there is a mathematical proof: any efficient algorithm that breaks the cipher can be turned into one that solves a hard problem (like factoring). Security is conditional on that problem being hard.'
            },
            {
              q: 'Alice wants to send a secret message to Bob, whom she has never met. Which setting applies?',
              opts: [
                'Symmetric-key, because they share a common key.',
                'Public-key, because no prior shared secret is needed.',
                'Information-theoretic, because the adversary has unlimited power.',
                'Computational, because the key is long.'
              ],
              answer: 1,
              why: 'In the public-key setting, Bob publishes a public key and keeps a private key. Alice can encrypt to the public key without ever meeting Bob or sharing a secret in advance.'
            }
          ]
        }
      ],
      mastery: [
        {
          q: 'In a symmetric encryption scheme $(\\mathcal{K}, \\mathcal{E}, \\mathcal{D})$, which statement is always required to be true?',
          opts: [
            '$\\mathcal{D}_K(\\mathcal{E}_K(M)) = M$ for every valid $K$ and $M$.',
            'The key $K$ is publicly known.',
            'The adversary can compute $K$ from the ciphertext $C$.',
            'Encryption and decryption always use different keys.'
          ],
          answer: 0,
          why: 'Correctness is the defining requirement of any encryption scheme: decryption must undo encryption exactly. The key is kept private (not public), and using different keys for encryption and decryption is the public-key setting, not symmetric.'
        },
        {
          q: 'An adversary who sees every ciphertext produced still cannot learn anything about the underlying plaintext. This property is called:',
          opts: ['Integrity', 'Authentication', 'Confidentiality', 'Non-repudiation'],
          answer: 2,
          why: 'Confidentiality (also called secrecy or privacy) is the guarantee that the ciphertext reveals nothing about the plaintext. Integrity and authentication are separate, equally important goals.'
        },
        {
          q: 'A security proof shows: "If algorithm $\\mathcal{A}$ breaks scheme $\\mathcal{E}$, then algorithm $\\mathcal{B}$ factors large integers efficiently." This is a:',
          opts: [
            'Counterexample demonstrating $\\mathcal{E}$ is broken.',
            'Reduction showing that breaking $\\mathcal{E}$ is at least as hard as factoring.',
            'Proof that factoring is computationally hard.',
            'Attack on $\\mathcal{E}$.'
          ],
          answer: 1,
          why: 'This is a reduction: it shows that breaking $\\mathcal{E}$ would imply solving factoring — which we believe is hard. So $\\mathcal{E}$ must also be hard to break, assuming factoring is.'
        },
        {
          q: 'Integrity without confidentiality means:',
          opts: [
            'The adversary cannot read messages and cannot modify them.',
            'The adversary can read messages but cannot modify them undetected.',
            'The adversary cannot read messages but can modify them undetected.',
            'The adversary has no access to the channel at all.'
          ],
          answer: 1,
          why: 'Integrity and confidentiality are independent. Integrity means any modification is detected — but it says nothing about whether the adversary can read the plaintext. A scheme providing integrity alone lets the adversary see everything while preventing undetected tampering.'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    /* Chapter 2 — Classical Encryption                                    */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch2',
      num: 2,
      title: 'Classical Encryption',
      blurb: 'Substitution ciphers and why they fail, the one-time pad, and Shannon\'s notion of perfect security.',
      sections: [
        {
          id: 'ch2-subst',
          title: 'Substitution ciphers',
          anim: 'subst-cipher',
          body: [
            'The simplest kind of encryption replaces each letter in your message with a different letter, according to a fixed rearrangement — a permutation — of the alphabet.',
            'Formally, a key $\\pi$ is a bijection from the 26-letter alphabet to itself. Encryption applies $\\pi$ letter-by-letter: $\\mathcal{E}_\\pi(M_1 M_2 \\cdots M_n) = \\pi(M_1)\\,\\pi(M_2)\\cdots\\pi(M_n)$. Decryption applies the inverse permutation $\\pi^{-1}$ to each ciphertext letter.',
            'The key space has $26!$ elements — roughly $4 \\times 10^{26}$, or about $2^{88}$. If an adversary tried every possible key at a billion keys per second, they would spend more time than the age of the universe. On that measure alone, the substitution cipher looks impregnable.',
            'But key-space size is a necessary condition for security, not a sufficient one. A cipher can have an astronomically large key space and still be trivially broken. To see why, you need to think about what an adversary can actually do with a ciphertext — not how long brute force would take.'
          ]
        },
        {
          id: 'ch2-frequency',
          title: 'Why substitution ciphers fail: frequency analysis',
          anim: 'freq-analysis',
          body: [
            'The flaw is this: a substitution cipher applies the same permutation to every letter it touches, so any statistical pattern in the original language is preserved exactly in the ciphertext.',
            'In English, E appears roughly 13% of the time, T about 9%, A about 8%. These frequencies are stable across any large English sample — they are properties of the language, not of the particular text. When you encrypt English with a substitution cipher, the most common letter in the ciphertext is almost certainly $\\pi(E)$; the second most common is $\\pi(T)$; and so on.',
            'An adversary who sees only the ciphertext can: count letter frequencies, match high-frequency ciphertext letters to high-frequency English letters, and then use dictionary knowledge and surrounding context to fill in the rest. This attack is called frequency analysis, and it was described by the Arab polymath al-Kindi in the ninth century — long before formal cryptography existed.',
            'The B&R notes illustrate this with a voting example. Three candidates are A, B, and C. An authority encrypts each ballot with $\\pi(A) = X$, $\\pi(B) = Y$, $\\pi(C) = Z$. An adversary who sees all the encrypted ballots does not need to know $\\pi$ — they simply count X\'s, Y\'s, and Z\'s. The tally is immediately visible.',
            'The deeper issue is not that this particular key was weak. Every key has this structure: the pattern of letters survives because the substitution is letter-by-letter and fixed. That structural fact is what a formal proof will exploit.'
          ]
        },
        {
          id: 'ch2-proof-subst',
          title: 'Formally: why the substitution cipher fails perfect security',
          body: [
            'We can make the failure precise using the definition of perfect security: a cipher is perfectly secure if, for every two plaintexts $M_0, M_1$ and every ciphertext $C$, the probability that $M_0$ encrypts to $C$ equals the probability that $M_1$ encrypts to $C$. To disprove perfect security, we just need one pair where the probabilities differ.',
            'Take $M_0 = $ FEE, $M_1 = $ FAR, and $C = $ XYY. The key $\\pi$ is drawn uniformly from all $26!$ permutations.',
            'For $M_0$: $\\Pr[\\mathcal{E}_\\pi(\\text{FEE}) = \\text{XYY}]$ requires $\\pi(F) = X$ and $\\pi(E) = Y$. Fix those two mappings; the remaining 24 letters can be permuted freely. That gives $24!$ valid permutations out of $26!$ total, so the probability is $24!/26! = 1/(26 \\times 25) \\approx 0.0015$.',
            'For $M_1$: $\\Pr[\\mathcal{E}_\\pi(\\text{FAR}) = \\text{XYY}]$ requires $\\pi(F) = X$, $\\pi(A) = Y$, and $\\pi(R) = Y$. But a permutation is a bijection: it cannot map two different letters to the same output. Since $A \\neq R$, we cannot have $\\pi(A) = \\pi(R) = Y$. This probability is exactly $0$.',
            'Since $1/(26 \\times 25) \\neq 0$, the two probabilities differ. An adversary who sees ciphertext XYY knows immediately that the plaintext could not have been FAR — the third letter repeats, which forces the second and third plaintext letters to be the same. The substitution cipher leaks structure, and the proof is complete.'
          ],
          quiz: [
            {
              q: 'Why is $\\Pr[\\mathcal{E}_\\pi(\\text{FAR}) = \\text{XYY}] = 0$?',
              opts: [
                'FAR has three distinct letters, so it cannot encrypt to a ciphertext with a repeated letter.',
                'A permutation cannot map two different plaintext letters (A and R) to the same ciphertext letter (Y).',
                'The letter F cannot map to X under any permutation.',
                'XYY is not in the ciphertext space of the substitution cipher.'
              ],
              answer: 1,
              why: 'A permutation is a bijection: distinct inputs must map to distinct outputs. Since A ≠ R, both mapping to Y is impossible. This forces the probability to 0.'
            }
          ]
        },
        {
          id: 'ch2-otp',
          title: 'The one-time pad',
          anim: 'otp-xor',
          body: [
            'The one-time pad fixes the substitution cipher\'s core problem: instead of applying the same key to every message forever, you use a fresh random key for each message, with the key as long as the message itself.',
            'Let the message $M$ be a string of $m$ bits. The key $K$ is chosen uniformly at random from $\\{0,1\\}^m$. Encryption is bitwise XOR: $\\mathcal{E}_K(M) = K \\oplus M$. Decryption is the same operation: $\\mathcal{D}_K(C) = K \\oplus C$.',
            'Decryption works because XOR is its own inverse: $K \\oplus (K \\oplus M) = (K \\oplus K) \\oplus M = 0^m \\oplus M = M$. Each bit of the key cancels itself out when applied twice.',
            'Back to the voting example: each ballot is XOR\'d with an independently drawn random key. The encrypted ballot looks like a uniformly random string. An adversary who sees it cannot tell whether the vote was for A, B, or C, because the key was equally likely to have produced that ciphertext from any vote.',
            'The name "one-time pad" points at the critical constraint: the key must be used exactly once. If you encrypt two different messages $M_0$ and $M_1$ with the same key $K$, an adversary who sees both ciphertexts $C_0 = K \\oplus M_0$ and $C_1 = K \\oplus M_1$ can compute $C_0 \\oplus C_1 = M_0 \\oplus M_1$. The key cancels, and the adversary has the XOR of the two plaintexts. For natural-language text, that is often enough to reconstruct both. The Venona project used exactly this weakness against Soviet messages that reused OTP keys in the 1940s.'
          ]
        },
        {
          id: 'ch2-perfect',
          title: 'Perfect security',
          body: [
            'The security property that the OTP achieves has a precise name: perfect security, also called information-theoretic security or Shannon security after Claude Shannon, who formalized it in 1949.',
            'A cipher $(\\mathcal{K}, \\mathcal{E}, \\mathcal{D})$ over message space $\\mathcal{M}$ is perfectly secure if, for every $M_0, M_1 \\in \\mathcal{M}$ and every ciphertext $C$:',
            '$$\\Pr_{K \\leftarrow \\mathcal{K}}[\\mathcal{E}_K(M_0) = C] = \\Pr_{K \\leftarrow \\mathcal{K}}[\\mathcal{E}_K(M_1) = C]$$',
            'In words: looking at any ciphertext $C$, you cannot distinguish whether it came from encrypting $M_0$ or $M_1$. The distribution of ciphertexts is identical regardless of which message was encrypted.',
            'Perfect security is a remarkably strong guarantee: it holds even against an adversary with unlimited computational power. There is no algorithm — not now, not ever — that can learn anything about the plaintext from the ciphertext alone. Compare this to computational security, which only holds against adversaries running in polynomial time. A computationally secure scheme might, in principle, be broken by an adversary with enough compute; a perfectly secure scheme cannot, period.',
            'The trade-off: as the next section proves, achieving perfect security requires a key at least as long as the message. For a gigabyte file, you need a gigabyte key, used exactly once. This is impractical for most applications. Computationally secure schemes — which relax the guarantee to hold only against efficient adversaries — are what gets used in practice.'
          ]
        },
        {
          id: 'ch2-proofs',
          title: 'Proving the OTP and the key-length lower bound',
          body: [
            'With the definition in hand, the proof that the OTP achieves perfect security is clean. Let $m$ be the message length. Fix any $M_0, M_1 \\in \\{0,1\\}^m$ and any $C \\in \\{0,1\\}^m$; the key $K$ is chosen uniformly from $\\{0,1\\}^m$.',
            '$\\Pr[\\mathcal{E}_K(M_0) = C] = \\Pr[K \\oplus M_0 = C] = \\Pr[K = M_0 \\oplus C]$.',
            'Since $K$ is uniform over $\\{0,1\\}^m$, the probability it equals any particular value is $1/2^m$. So $\\Pr[\\mathcal{E}_K(M_0) = C] = 1/2^m$. The same calculation for $M_1$ gives $\\Pr[\\mathcal{E}_K(M_1) = C] = 1/2^m$. Both are $1/2^m$, so the definition is satisfied.',
            'The key insight: for any fixed message $M$ and ciphertext $C$, there is exactly one key that encrypts $M$ to $C$ — namely $K = M \\oplus C$. Since the key is uniform, that one key has probability exactly $1/2^m$. Every message is equally plausible for every ciphertext.',
            'Now the bad-news theorem: if a cipher is perfectly secure, its key space must be at least as large as its message space — $|\\mathcal{K}| \\geq |\\mathcal{M}|$. The OTP meets this bound exactly: keys and messages are both $m$-bit strings, so $|\\mathcal{K}| = |\\mathcal{M}| = 2^m$.',
            'Proof of the bound. Fix any ciphertext $C$. Let $\\mathcal{M}(C) = \\{M : \\exists K, \\mathcal{E}_K(M) = C\\}$ be the set of messages that can produce $C$. Correctness of decryption means: for each $M \\in \\mathcal{M}(C)$, the key $K_M$ satisfying $\\mathcal{E}_{K_M}(M) = C$ is unique to $M$ — two different messages require different keys (otherwise decryption of $C$ with that key would be ambiguous). So the map $M \\mapsto K_M$ is injective, giving $|\\mathcal{M}(C)| \\leq |\\mathcal{K}|$. But perfect security requires $\\Pr[\\mathcal{E}_K(M) = C] > 0$ for every $M$ — otherwise seeing $C$ would rule out some plaintext and leak information. So $\\mathcal{M} \\subseteq \\mathcal{M}(C)$, and therefore $|\\mathcal{M}| \\leq |\\mathcal{K}|$. $\\square$'
          ],
          quiz: [
            {
              q: 'Why does the OTP proof conclude $\\Pr[\\mathcal{E}_K(M) = C] = 1/2^m$ for any $M$ and $C$?',
              opts: [
                'There are $2^m$ possible ciphertexts and each is equally likely to appear.',
                'For any $M$ and $C$, exactly one key maps $M$ to $C$, and that key has probability $1/2^m$.',
                'XOR always produces uniformly distributed output.',
                'The key and message have the same length.'
              ],
              answer: 1,
              why: 'For fixed M and C, the equation K⊕M=C has exactly one solution: K=M⊕C. Since K is uniform over 2^m values, that specific key appears with probability 1/2^m. This is true for every M, giving equal probabilities across all messages.'
            },
            {
              q: 'The key-length lower bound says $|\\mathcal{K}| \\geq |\\mathcal{M}|$ for any perfectly secure cipher. What forces this?',
              opts: [
                'Longer keys take longer to brute-force.',
                'Perfect security requires every message to be a plausible source of any ciphertext — which requires at least one distinct key per message.',
                'XOR only works correctly when key and message have equal length.',
                'Shannon proved this using information-theoretic entropy.'
              ],
              answer: 1,
              why: 'If some message M* had zero probability of producing ciphertext C, seeing C would let an adversary rule out M* — leaking information. Avoiding this requires every M to be reachable from every C using some key, and those keys must be distinct (due to correctness). So |K| ≥ |M|.'
            }
          ]
        }
      ],
      mastery: [
        {
          q: 'A substitution cipher over a 26-letter alphabet has $26!$ possible keys. Why is it still insecure against a realistic adversary?',
          opts: [
            'The key space $26!$ is too small to resist brute-force search.',
            'The cipher preserves the letter-frequency pattern of the plaintext in the ciphertext.',
            'The decryption algorithm is publicly known.',
            'A permutation can be recovered directly from a single ciphertext.'
          ],
          answer: 1,
          why: 'Key-space size is necessary but not sufficient for security. A substitution cipher maps each plaintext letter to a fixed ciphertext letter, so English letter frequencies survive intact. Frequency analysis exploits this — no brute force needed.'
        },
        {
          q: 'What makes the one-time pad "one-time"?',
          opts: [
            'You can only encrypt messages of exactly one bit.',
            'The key must be used for exactly one encryption; reusing it lets an adversary learn M0⊕M1.',
            'A new encryption algorithm must be chosen for each message.',
            'The pad is physically destroyed after use.'
          ],
          answer: 1,
          why: 'If two messages M0 and M1 are encrypted with the same key K, the adversary can XOR the two ciphertexts to get M0⊕M1 (the key cancels). For natural-language text, that is often enough to recover both messages.'
        },
        {
          q: 'Perfect security guarantees that the adversary learns nothing about the plaintext, even with:',
          opts: [
            'Polynomial-time computing power.',
            'Unbounded computing power.',
            'Knowledge of the key generation algorithm.',
            'Access to an encryption oracle.'
          ],
          answer: 1,
          why: 'Perfect security is information-theoretic: it holds against any adversary regardless of computational resources. The guarantee comes from the probability distribution of ciphertexts, not from the cost of computation.'
        },
        {
          q: 'To disprove that a cipher is perfectly secure, what exactly do you need to show?',
          opts: [
            'An efficient algorithm that finds the key.',
            'A pair of plaintexts $M_0, M_1$ and a ciphertext $C$ where $\\Pr[\\mathcal{E}_K(M_0)=C] \\neq \\Pr[\\mathcal{E}_K(M_1)=C]$.',
            'That the cipher has been broken by a known attack.',
            'That the key space is smaller than the message space.'
          ],
          answer: 1,
          why: 'Perfect security requires equal ciphertext distributions for every message pair. One counterexample — one pair M0, M1 and one C with unequal probabilities — suffices to disprove it entirely. The substitution cipher proof found exactly such a triple: FEE, FAR, XYY.'
        },
        {
          q: 'For the OTP over $m$-bit messages, the key-length lower bound says $|\\mathcal{K}| \\geq |\\mathcal{M}|$. What are these values?',
          opts: [
            '$|\\mathcal{K}| = m$ and $|\\mathcal{M}| = m$.',
            '$|\\mathcal{K}| = 2^m$ and $|\\mathcal{M}| = 2^m$. The OTP meets the bound exactly.',
            '$|\\mathcal{K}| = 26!$ and $|\\mathcal{M}| = 26^m$.',
            '$|\\mathcal{K}| > 2^m$; the OTP exceeds the minimum requirement.'
          ],
          answer: 1,
          why: 'The OTP key is a uniform m-bit string, so |K| = 2^m. Messages are also m-bit strings, so |M| = 2^m. The OTP meets the lower bound with equality — the key is exactly as long as the message, no more.'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    /* Chapters 3–6 — Coming soon                                          */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch3',
      num: 3,
      title: 'Symmetric Encryption',
      blurb: 'Pseudorandom generators and functions, semantic security, and the IND-CPA game.',
      locked: true
    },
    {
      id: 'ch4',
      num: 4,
      title: 'Message Authentication',
      blurb: 'MACs, pseudorandom functions, and integrity without secrecy.',
      locked: true
    },
    {
      id: 'ch5',
      num: 5,
      title: 'Hash Functions',
      blurb: 'Collision resistance, second-preimage resistance, and the random oracle model.',
      locked: true
    },
    {
      id: 'ch6',
      num: 6,
      title: 'Public-Key Encryption',
      blurb: 'RSA, ElGamal, and provable security in the public-key setting.',
      locked: true
    }
  ];
}());
