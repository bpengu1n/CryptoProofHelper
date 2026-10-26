/* Course content: Bellare & Rogaway "Introduction to Modern Cryptography"
   Chapters 1–6. */
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
            'In the public-key (or asymmetric) setting, no prior meeting is required. Bob generates a mathematically related pair: a public key $pk$ that he publishes to the world, and a private key $sk$ that only he knows. Alice encrypts using $pk$ — anyone can write to Bob. Only Bob can read, because only Bob has $sk$.',
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
              why: 'If some message $M^*$ had zero probability of producing ciphertext C, seeing C would let an adversary rule out $M^*$ — leaking information. Avoiding this requires every M to be reachable from every C using some key, and those keys must be distinct (due to correctness). So |K| ≥ |M|.'
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
    /* Chapter 3 — Symmetric Encryption                                    */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch3',
      num: 3,
      title: 'Symmetric Encryption',
      blurb: 'Pseudorandom functions, the IND-CPA game, and why counter mode is secure while ECB is not.',
      sections: [
        {
          id: 'ch3-computational',
          title: 'From perfect to computational security',
          body: [
            'Chapter 2 ended with bad news: perfect security needs a key as long as everything you will ever encrypt. Real systems encrypt terabytes under a 128-bit key. So real systems cannot be perfectly secure, and we need a weaker — but still meaningful — goal.',
            'The weakening is this: we stop worrying about adversaries with unlimited computing power and only worry about adversaries who run in a realistic amount of time. An adversary who would need $2^{128}$ steps to succeed is, for every practical purpose, an adversary who fails.',
            'Bellare and Rogaway measure security concretely. An adversary $A$ is an algorithm with a running time $t$ and a number of queries $q$ it makes to whatever oracles the game provides. Its success is measured by its **advantage** — a number between $0$ and $1$ saying how much better than guessing it does. A scheme is secure if every adversary with reasonable $t$ and $q$ has tiny advantage.',
            'Notice what changes: the definition no longer says "the adversary learns nothing". It says "the adversary learns nothing it can use, unless it spends an enormous amount of work". That is weaker than Shannon\'s guarantee, but it is the guarantee every encryption scheme you use today actually provides.',
            'Since we can no longer prove these statements outright (doing so would resolve open questions like P vs NP), every theorem in this chapter has the same shape: if the building block is secure, then the scheme built from it is secure. These are **reductions**, and learning to read them is the main skill of the chapter.'
          ],
          quiz: [
            {
              q: 'Why can\'t a scheme that encrypts many long messages under a short key be perfectly secure?',
              opts: [
                'Short keys are always easy to guess.',
                'Perfect security requires $|\\mathcal{K}| \\ge |\\mathcal{M}|$, and the total message space here is far larger than the key space.',
                'Perfect security only applies to the one-time pad.',
                'Computational adversaries can break any perfectly secure scheme.'
              ],
              answer: 1,
              why: 'The key-length lower bound from Chapter 2 applies to the total amount of data encrypted under one key. A 128-bit key cannot cover gigabytes of plaintext, so perfect security is impossible and we fall back to computational security.'
            }
          ]
        },
        {
          id: 'ch3-prf',
          title: 'Block ciphers and pseudorandom functions',
          anim: 'prf-game',
          body: [
            'The workhorse of symmetric cryptography is the **block cipher**: a function $E : \\{0,1\\}^k \\times \\{0,1\\}^n \\to \\{0,1\\}^n$ that takes a $k$-bit key and an $n$-bit input block and returns an $n$-bit output block. For each key $K$, the map $E_K(\\cdot)$ is a permutation, so it can be inverted by someone who knows $K$. AES is the standard example, with $n = 128$ and $k \\in \\{128, 192, 256\\}$.',
            'What property do we want from $E$? The useful answer is: it should look like a random function to anyone who does not know the key. We capture this with a game.',
            'In the PRF game, a hidden bit decides which world the adversary is in. In the "real" world, a key $K$ is chosen at random and the adversary gets an oracle for $F_K(\\cdot)$. In the "random" world, the adversary gets an oracle for a truly random function $g$ — one where each new input gets a fresh, independent, uniformly random output. The adversary queries the oracle as it likes, then outputs a guess: $1$ for "real", $0$ for "random".',
            '$$\\Adv^{\\mathrm{prf}}_F(A) = \\Pr[A^{F_K} \\Rightarrow 1] - \\Pr[A^{g} \\Rightarrow 1]$$',
            'If no efficient adversary can make this difference noticeably larger than $0$, we say $F$ is a **pseudorandom function** (PRF). The idea is powerful: any argument that would be easy with a truly random function can be carried over to $F_K$, at the cost of the PRF advantage.',
            'A block cipher is really a pseudorandom *permutation* (PRP): the random world uses a random permutation rather than a random function. The two notions are almost interchangeable. A random function on $n$-bit blocks only looks different from a random permutation once two inputs collide on the same output, and with $q$ queries that happens with probability at most $q^2 / 2^{n+1}$. This is the **PRP/PRF switching lemma**, and it lets us treat AES as a PRF in proofs.'
          ],
          quiz: [
            {
              q: 'In the PRF game, the adversary has advantage close to $1$. What does that mean?',
              opts: [
                'It has recovered the key $K$.',
                'It can reliably tell whether its oracle is $F_K$ or a truly random function.',
                'It can invert $F_K$ on any output.',
                'It has found two inputs with the same output.'
              ],
              answer: 1,
              why: 'Advantage measures distinguishing ability, nothing more. Recovering the key would give high advantage, but so would any other noticeable pattern in the outputs. That is what makes the PRF definition strong: it rules out every distinguishing pattern, not just key recovery.'
            }
          ]
        },
        {
          id: 'ch3-syntax',
          title: 'What an encryption scheme is',
          body: [
            'A symmetric encryption scheme $\\mathcal{SE} = (\\mathcal{K}, \\mathcal{E}, \\mathcal{D})$ is a triple of algorithms. Key generation $\\mathcal{K}$ outputs a random key $K$. Encryption $\\mathcal{E}_K(M)$ outputs a ciphertext $C$ and may use fresh randomness each time it runs. Decryption $\\mathcal{D}_K(C)$ outputs the message, or $\\perp$ ("invalid") if $C$ is not a legitimate ciphertext.',
            'Correctness requires $\\mathcal{D}_K(\\mathcal{E}_K(M)) = M$ for every key and every message — whatever random coins encryption happened to use.',
            'Here is the first surprise of the chapter. If $\\mathcal{E}$ is deterministic — the same key and message always give the same ciphertext — then the scheme cannot be secure once the same key encrypts more than one message. The reason is simple: an adversary who sees two equal ciphertexts learns that the two underlying messages were equal. That is information about the plaintexts.',
            'This is not a theoretical quibble. A database that encrypts the "diagnosis" column deterministically reveals which patients share a diagnosis. So a secure scheme must be **randomized** (pick fresh random coins for each encryption) or **stateful** (keep a counter that changes after each encryption). Both approaches appear below.'
          ],
          quiz: [
            {
              q: 'Why must a secure multi-message encryption scheme be randomized or stateful?',
              opts: [
                'Deterministic algorithms are slower.',
                'Without randomness or state, encrypting the same message twice gives the same ciphertext, revealing that the messages repeated.',
                'Decryption requires the randomness to be sent alongside the key.',
                'The block cipher would otherwise leak the key.'
              ],
              answer: 1,
              why: 'Equality of plaintexts is information. A deterministic stateless scheme maps equal plaintexts to equal ciphertexts, so an adversary learns which messages repeat — a violation of any reasonable privacy definition.'
            }
          ]
        },
        {
          id: 'ch3-indcpa',
          title: 'The IND-CPA game',
          anim: 'lr-oracle',
          body: [
            'How do we define "the ciphertext reveals nothing" when the adversary has bounded computing power? Bellare and Rogaway use a **left-or-right** game, and it is worth getting to know it well — every privacy definition in the rest of the book is a variation on it.',
            'A key $K$ is chosen and a hidden bit $b$ is fixed. The adversary may make queries to a left-or-right oracle $\\mathcal{E}_K(\\mathrm{LR}(\\cdot,\\cdot,b))$. Each query is a pair of equal-length messages $(M_0, M_1)$; the oracle encrypts $M_b$ and returns the ciphertext. At the end, the adversary outputs a guess $b\'$ for $b$.',
            '$$\\Adv^{\\mathrm{ind-cpa}}_{\\mathcal{SE}}(A) = \\Pr[b\'=1 \\mid b=1] - \\Pr[b\'=1 \\mid b=0]$$',
            'Notice how much power the adversary has. It chooses the messages. It can ask for an encryption of any message it likes simply by setting $M_0 = M_1$ — that is the "chosen-plaintext attack" (CPA) part. It can adapt each query to the answers it has seen. And yet, if the scheme is secure, it still cannot tell whether it is looking at encryptions of the left messages or the right ones.',
            'Why must the messages have equal length? Because practical encryption leaks length — a 1 MB file produces a ciphertext of roughly 1 MB. Requiring $|M_0| = |M_1|$ is an honest admission that length is not hidden, while everything else is.',
            'The game also handles the deterministic-encryption problem from the previous section automatically. An adversary that queries $(M, M)$ and then $(M, M\')$ with $M \\ne M\'$ sees whether the two ciphertexts match. For a deterministic scheme they match exactly when $b = 0$, so the advantage is $1$.'
          ],
          quiz: [
            {
              q: 'In the left-or-right game, how does the adversary obtain an encryption of a specific message $M$ of its choice?',
              opts: [
                'It cannot; the oracle only encrypts randomly chosen messages.',
                'It queries the pair $(M, M)$, so whichever side is chosen, the result encrypts $M$.',
                'It asks for the key and encrypts $M$ itself.',
                'It submits $M$ to a separate encryption oracle.'
              ],
              answer: 1,
              why: 'Querying the same message on both sides turns the left-or-right oracle into an ordinary encryption oracle. This is why IND-CPA automatically covers chosen-plaintext attacks.'
            }
          ]
        },
        {
          id: 'ch3-modes',
          title: 'Modes of operation: ECB, CBC, and CTR',
          body: [
            'A block cipher encrypts exactly $n$ bits. A **mode of operation** turns it into an encryption scheme for longer messages. Split the message into blocks $M = M[1] M[2] \\cdots M[m]$, each $n$ bits.',
            '**ECB (electronic codebook)** encrypts each block independently: $C[i] = E_K(M[i])$. It is deterministic, so it cannot be IND-CPA secure — but it is worse than that: it leaks equality *within* a single message. Attack: query $(M_0, M_1)$ with $M_0 = 0^n 0^n$ and $M_1 = 0^n 1^n$. If the two ciphertext blocks are equal, answer $0$; otherwise answer $1$. This adversary makes one query and has advantage exactly $1$.',
            '**CBC with a random IV** picks a random $n$-bit $C[0]$ and sets $C[i] = E_K(C[i-1] \\oplus M[i])$. The random start masks every block that follows, so repeated blocks no longer produce repeated ciphertext.',
            '**Randomized counter mode (CTR)** picks a random $n$-bit value $R$ and sets $C[i] = F_K(R + i) \\oplus M[i]$, outputting $R$ along with the $C[i]$. In effect, $F_K$ is used to stretch a short key into a long pad, which is then used like a one-time pad. Unlike CBC, CTR only needs $F_K$ in the forward direction, so $F$ can be any PRF, and all blocks can be processed in parallel.',
            'Both randomized CBC and randomized CTR are IND-CPA secure if the underlying block cipher is a good PRF — as long as the total number of blocks encrypted stays well below $2^{n/2}$. That caveat is the subject of the next section.'
          ],
          quiz: [
            {
              q: 'The one-query ECB attack uses $M_0 = 0^n 0^n$ and $M_1 = 0^n 1^n$. What does the adversary check?',
              opts: [
                'Whether the ciphertext has length $2n$.',
                'Whether the two ciphertext blocks are equal: they are if and only if the left message was encrypted.',
                'Whether the first ciphertext block is $0^n$.',
                'Whether the ciphertext decrypts to $M_0$.'
              ],
              answer: 1,
              why: 'ECB encrypts equal blocks to equal ciphertext blocks. $M_0$ has two equal blocks and $M_1$ has two different blocks, and since $E_K$ is a permutation, different blocks always give different ciphertexts. So the check succeeds with probability 1.'
            }
          ]
        },
        {
          id: 'ch3-ctr-proof',
          title: 'Proving CTR mode secure',
          body: [
            'The theorem for randomized counter mode says, roughly: for any adversary $A$ attacking randomized CTR that encrypts a total of $\\sigma$ blocks, there is a PRF adversary $B$, running in about the same time, such that',
            '$$\\Adv^{\\mathrm{ind-cpa}}_{\\mathrm{CTR}}(A) \\le 2 \\cdot \\Adv^{\\mathrm{prf}}_F(B) + \\frac{\\sigma^2}{2^n}$$',
            'Read the right-hand side term by term. The first term says: if $F$ is a good PRF, this part is tiny. The second term is a **birthday bound**: it stays small only while $\\sigma$ is well below $2^{n/2}$. For AES, $n = 128$, so you should rekey long before encrypting $2^{64}$ blocks.',
            'The proof follows the pattern you will see again and again. Step 1: replace $F_K$ by a truly random function $g$. Any change in $A$\'s behavior when we do this could be turned into a PRF distinguisher $B$ — $B$ simply runs $A$, answers its queries using its own oracle, and outputs whatever $A$ outputs. That accounts for the $\\Adv^{\\mathrm{prf}}$ term (the factor $2$ comes from doing this once in the $b=0$ world and once in the $b=1$ world).',
            'Step 2: analyze the idealized scheme with $g$. If no counter value $R + i$ is ever used twice, every pad block is a fresh uniform string, so every ciphertext block is a one-time-pad encryption and reveals nothing — exactly as in Chapter 2. The only way the adversary can win is if two encryptions happen to use overlapping counter ranges. Bounding the probability of that overlap gives the $\\sigma^2 / 2^n$ term.',
            'The shape of this argument — "swap the real primitive for an ideal one, pay its advantage, then analyze the ideal world with probability" — is the template for nearly every proof in the rest of the course. $\\qed$'
          ],
          quiz: [
            {
              q: 'In the CTR proof, what is the reduction $B$\'s strategy?',
              opts: [
                'It searches for the key $K$ and passes it to $A$.',
                'It runs $A$, uses its own PRF-game oracle to compute the pads for $A$\'s queries, and outputs what $A$ outputs.',
                'It outputs a random bit.',
                'It replaces $A$\'s messages with random strings.'
              ],
              answer: 1,
              why: 'The reduction simulates the encryption game for $A$ using its oracle in place of $F_K$. If the oracle is $F_K$, $A$ sees the real scheme; if it is random, $A$ sees the idealized scheme. Any difference in $A$\'s behavior becomes $B$\'s distinguishing advantage.'
            },
            {
              q: 'Why does the bound include a term like $\\sigma^2 / 2^n$?',
              opts: [
                'Because AES has a known weakness after $2^{n/2}$ queries.',
                'Because in the idealized scheme the adversary can win only if two counter values collide, and that probability grows quadratically in the number of blocks.',
                'Because the key has $n$ bits.',
                'Because each message must be padded to a multiple of $n$ bits.'
              ],
              answer: 1,
              why: 'With a truly random function, CTR is a one-time pad unless a counter value repeats. Repeats among $\\sigma$ values drawn from a space of size $2^n$ are a birthday event, with probability on the order of $\\sigma^2 / 2^n$.'
            }
          ]
        }
      ],
      mastery: [
        {
          q: 'Which statement best describes computational security?',
          opts: [
            'The ciphertext reveals no information to any adversary.',
            'Every adversary with realistic running time and number of queries has only tiny advantage.',
            'The key is longer than the message.',
            'No attack on the scheme has been published.'
          ],
          answer: 1,
          why: 'Computational security bounds the advantage of resource-limited adversaries. It does not claim information is absent — only that it cannot be used without enormous effort.'
        },
        {
          q: 'An encryption scheme is deterministic and stateless. What is its best possible IND-CPA advantage bound against a two-query adversary?',
          opts: [
            'Negligible, if the block cipher is a good PRF.',
            'There is a two-query adversary with advantage $1$, so it is not IND-CPA secure.',
            'Exactly $1/2$.',
            'It depends on the key length.'
          ],
          answer: 1,
          why: 'Query $(M, M)$, then $(M, M\')$. The ciphertexts match exactly when $b = 0$. Determinism alone is enough to break IND-CPA, regardless of how strong the block cipher is.'
        },
        {
          q: 'Why does the left-or-right game require $|M_0| = |M_1|$?',
          opts: [
            'Block ciphers only accept fixed-length input.',
            'Encryption generally reveals message length, so the definition only asks that everything other than length be hidden.',
            'Otherwise the adversary could query the same message twice.',
            'To make the advantage formula well-defined.'
          ],
          answer: 1,
          why: 'Ciphertext length tracks plaintext length in practice. Without the restriction, every scheme would fail trivially by querying a short and a long message.'
        },
        {
          q: 'Counter mode uses $F_K$ only in the forward direction. What does that allow?',
          opts: [
            'Using any PRF, not only an invertible block cipher, and encrypting blocks in parallel.',
            'Encrypting without a key.',
            'Skipping the random starting value.',
            'Avoiding the birthday bound.'
          ],
          answer: 0,
          why: 'Decryption in CTR recomputes the same pad and XORs again, so $F_K$ never needs to be inverted. Each pad block depends only on its counter value, so blocks can be computed in parallel.'
        },
        {
          q: 'In the CTR security bound, what would make the right-hand side large even if AES is a perfect PRF?',
          opts: [
            'Using a 256-bit key instead of a 128-bit key.',
            'Encrypting close to $2^{64}$ blocks under one key with $n = 128$.',
            'Encrypting very short messages.',
            'Choosing the starting value $R$ at random.'
          ],
          answer: 1,
          why: 'The birthday term $\\sigma^2 / 2^n$ approaches $1$ as $\\sigma$ approaches $2^{n/2} = 2^{64}$. Key length does not appear in that term; block length does.'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    /* Chapter 4 — Message Authentication                                  */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch4',
      num: 4,
      title: 'Message Authentication',
      blurb: 'MACs, pseudorandom functions, and integrity without secrecy.',
      sections: [
        {
          id: 'ch4-why',
          title: 'Encryption does not give integrity',
          body: [
            'It is tempting to think that if an adversary cannot read a message, it cannot meaningfully change it either. That intuition is wrong, and the counterexample is the scheme we just proved secure.',
            'Counter mode — like the one-time pad — computes $C = P \\oplus M$ for some pad $P$. An adversary who flips bit $j$ of $C$ flips bit $j$ of the decrypted message, without knowing anything about $P$. If the adversary knows (or guesses) where in the message the amount field sits, it can change "pay 100" into "pay 900" by flipping a few bits. The receiver decrypts and sees a perfectly well-formed message.',
            'IND-CPA says nothing about this, because IND-CPA is only about what the adversary can *learn*. Changing messages in transit is a different attack, and it needs a different tool.',
            'That tool is the **message authentication code** (MAC). Unlike encryption, a MAC does not hide anything: the message is sent in the clear, along with a short **tag**. The tag lets the receiver check that the message came from someone holding the shared key and was not modified on the way.'
          ],
          quiz: [
            {
              q: 'Why can an adversary modify a counter-mode ciphertext in a controlled way?',
              opts: [
                'Because it can recover the key from the ciphertext.',
                'Because flipping a ciphertext bit flips the same plaintext bit after decryption, since $C = P \\oplus M$.',
                'Because counter mode is not IND-CPA secure.',
                'Because the random starting value is sent in the clear.'
              ],
              answer: 1,
              why: 'XOR-based encryption is malleable: $(P \\oplus M) \\oplus \\Delta = P \\oplus (M \\oplus \\Delta)$. The adversary never learns $P$ or $M$, yet controls the change.'
            }
          ]
        },
        {
          id: 'ch4-syntax',
          title: 'What a MAC is',
          body: [
            'A message authentication scheme $\\Pi = (\\mathcal{K}, \\mathcal{T}, \\mathcal{V})$ has three algorithms. Key generation $\\mathcal{K}$ outputs a shared key $K$. The tagging algorithm $\\mathcal{T}_K(M)$ outputs a tag $T$. The verification algorithm $\\mathcal{V}_K(M, T)$ outputs $1$ (accept) or $0$ (reject).',
            'Correctness requires that honestly generated tags always verify: $\\mathcal{V}_K(M, \\mathcal{T}_K(M)) = 1$.',
            'Most practical MACs are deterministic: the tag is a fixed function of key and message, and verification simply recomputes the tag and compares. When this is the case we just call the tagging function a MAC and write $T = \\Mac_K(M)$.',
            'Unlike encryption, determinism is perfectly fine here. A MAC is not trying to hide the message — it is sent in the clear anyway — so there is nothing to protect by randomizing the tag.'
          ]
        },
        {
          id: 'ch4-ufcma',
          title: 'Unforgeability under chosen-message attack',
          anim: 'uf-cma',
          body: [
            'What should it mean for a MAC to be secure? Picture the strongest adversary we can reasonably imagine: it gets to see valid tags on any messages it likes, and it can try out candidate forgeries as often as it likes. It wins if it gets the receiver to accept a message that the legitimate sender never tagged.',
            'Formally, the **UF-CMA** game picks a key $K$ and gives the adversary two oracles: a tagging oracle $\\mathcal{T}_K(\\cdot)$ and a verification oracle $\\mathcal{V}_K(\\cdot,\\cdot)$. The adversary wins if it ever submits a pair $(M, T)$ to the verification oracle such that $\\mathcal{V}_K(M, T) = 1$ and $M$ was never queried to the tagging oracle.',
            '$$\\Adv^{\\mathrm{uf-cma}}_{\\Pi}(A) = \\Pr[A \\text{ forges}]$$',
            'Notice two things about this definition. First, the adversary chooses its messages adaptively — "chosen message attack". This models real systems, where an attacker can often get the sender to authenticate messages of the attacker\'s choosing. Second, the definition does not care whether the forged message is meaningful. A forgery on random garbage still counts. We cannot predict what an application will consider meaningful, so the definition demands protection for every message.',
            'Also note what the definition does *not* rule out: replaying a message that really was tagged. If Alice sent "pay Bob 10" with a valid tag, the adversary can send it again. Preventing replays is a protocol-level job, usually handled with sequence numbers or timestamps inside the authenticated message.'
          ],
          quiz: [
            {
              q: 'An adversary queries the tagging oracle on $M$, gets $T$, and then submits $(M, T)$ to verification. Does it win the UF-CMA game?',
              opts: [
                'Yes, because verification accepted.',
                'No, because $M$ was queried to the tagging oracle, so this is not a forgery.',
                'Yes, because it used fewer than $2^n$ queries.',
                'Only if $T$ is longer than the key.'
              ],
              answer: 1,
              why: 'A forgery must be on a new message — one the adversary never asked to be tagged. Replaying an honestly obtained tag is always possible and is not counted as breaking the MAC.'
            }
          ]
        },
        {
          id: 'ch4-prf-mac',
          title: 'Any PRF is a good MAC',
          body: [
            'The simplest secure MAC is a PRF: set $\\Mac_K(M) = F_K(M)$, with tags of $\\tau$ bits.',
            'The theorem: for any UF-CMA adversary $A$ making $q_t$ tagging queries and $q_v$ verification queries, there is a PRF adversary $B$, using about the same resources, with',
            '$$\\Adv^{\\mathrm{uf-cma}}(A) \\le \\Adv^{\\mathrm{prf}}_F(B) + \\frac{q_v}{2^{\\tau}}$$',
            'The proof is the same two-step pattern as for counter mode. Step 1: $B$ runs $A$, answering tagging queries with its own oracle and verification queries by calling its oracle and comparing. If $A$ forges, $B$ outputs $1$ ("real"); otherwise $0$. So the probability that $A$ forges against the real MAC differs from the probability that it forges against a random function by at most $\\Adv^{\\mathrm{prf}}_F(B)$.',
            'Step 2: suppose the MAC is a truly random function $g$. To forge, $A$ has to guess $g(M)$ on a message $M$ it has never queried. But $g(M)$ is a fresh, uniform $\\tau$-bit string that $A$ has no information about. Each verification attempt succeeds with probability $2^{-\\tau}$, so $q_v$ attempts succeed with probability at most $q_v / 2^{\\tau}$. $\\qed$',
            'The second term tells you how long tags need to be. With $\\tau = 64$ and an adversary making a million guesses, the chance of a lucky forgery is about $2^{-44}$. With $\\tau = 32$ it is far too high.'
          ],
          quiz: [
            {
              q: 'In the idealized world where the MAC is a truly random function, why can\'t the adversary do better than guessing on a new message?',
              opts: [
                'Because the key is secret.',
                'Because a random function\'s output on a new input is uniform and independent of every output already seen.',
                'Because the verification oracle rejects all queries.',
                'Because the tag is longer than the message.'
              ],
              answer: 1,
              why: 'That is the defining property of a random function: outputs on distinct inputs are independent. Knowing $g(M_1), \\ldots, g(M_q)$ tells you nothing about $g(M)$ for a new $M$.'
            }
          ]
        },
        {
          id: 'ch4-cbcmac',
          title: 'CBC-MAC and the variable-length trap',
          body: [
            'A block cipher is a PRF on a single $n$-bit block. To MAC longer messages, we need to extend its domain. **CBC-MAC** chains the blocks: $C_0 = 0^n$ and $C_i = E_K(C_{i-1} \\oplus M[i])$, with the tag being the final $C_m$.',
            'CBC-MAC is a secure PRF — and therefore a secure MAC — provided all messages have the same, fixed number of blocks. (Its security bound has a birthday term, like counter mode.)',
            'If messages may have different lengths, it is badly broken. Here is a forgery that uses one tagging query. Ask for the tag of a one-block message $M_1$; call it $T = E_K(M_1)$. Now output the two-block message $M_1 \\,\\|\\, (M_1 \\oplus T)$ with tag $T$.',
            'Check it: the first chaining value is $E_K(M_1) = T$. The second is $E_K(T \\oplus M_1 \\oplus T) = E_K(M_1) = T$. So the tag of the two-block message is $T$, and the adversary never asked for it. Advantage $1$, one query.',
            'The lesson is general: a construction can be secure under one assumption about its inputs and broken the moment that assumption is dropped. Fixes exist — encrypt the final value under a second key (ECBC-MAC), or prepend the message length, or use CMAC, which is the standardized variant — but each one had to be designed and proved for the variable-length setting.'
          ],
          quiz: [
            {
              q: 'The variable-length CBC-MAC forgery outputs $M_1 \\,\\|\\, (M_1 \\oplus T)$ with tag $T$. Why does it verify?',
              opts: [
                'Because $E_K$ is not a permutation.',
                'Because the second block XORs with the first chaining value $T$, cancelling it and leaving $E_K(M_1) = T$ again.',
                'Because the verification oracle does not check message length.',
                'Because $T$ is all zeros.'
              ],
              answer: 1,
              why: 'The first block produces chaining value $T$. The second block computes $E_K(T \\oplus M_1 \\oplus T) = E_K(M_1) = T$. The two copies of $T$ cancel, and the final value is again $T$.'
            }
          ]
        },
        {
          id: 'ch4-hmac',
          title: 'HMAC and combining MACs with encryption',
          body: [
            'The other widely used MAC is built from a hash function (the subject of Chapter 5). The obvious idea, $\\Mac_K(M) = H(K \\,\\|\\, M)$, is broken for common hash functions like SHA-256: from the tag of $M$, an adversary can compute the tag of $M$ followed by extra data, without the key. (Chapter 5 explains this "length-extension" property.)',
            '**HMAC** avoids the problem by hashing twice with two derived keys:',
            '$$\\mathrm{HMAC}_K(M) = H((K \\oplus \\mathrm{opad}) \\,\\|\\, H((K \\oplus \\mathrm{ipad}) \\,\\|\\, M))$$',
            'where opad and ipad are fixed constants. The outer hash hides the inner value, so length extension no longer helps. HMAC is proved to be a PRF assuming the hash function\'s compression function is itself a PRF.',
            'Finally: how should you get both privacy and integrity? Three generic ways to combine an IND-CPA encryption scheme with a secure MAC have been studied. **Encrypt-then-MAC** (encrypt, then tag the ciphertext) is always secure. **MAC-then-encrypt** (tag the message, then encrypt message and tag together) and **Encrypt-and-MAC** (encrypt the message and tag the message separately) can each fail for some secure components — Encrypt-and-MAC with a deterministic MAC leaks message equality directly through the tag. Use Encrypt-then-MAC, or a dedicated authenticated-encryption mode such as GCM.'
          ],
          quiz: [
            {
              q: 'Why is Encrypt-and-MAC with a deterministic MAC not IND-CPA secure?',
              opts: [
                'Because the MAC key is reused for encryption.',
                'Because the tag is computed on the plaintext and sent in the clear, so equal messages produce equal tags.',
                'Because encryption must come after the MAC.',
                'Because the tag reveals the encryption key.'
              ],
              answer: 1,
              why: 'MACs are not designed to hide anything. A deterministic tag on the plaintext reveals whether two plaintexts are equal — the same leak that breaks deterministic encryption.'
            }
          ]
        }
      ],
      mastery: [
        {
          q: 'A scheme is IND-CPA secure. What does that guarantee about integrity?',
          opts: [
            'Nothing — IND-CPA schemes such as counter mode can be modified in controlled ways.',
            'That any modified ciphertext decrypts to $\\perp$.',
            'That modifications are detected with probability $1/2$.',
            'That only the key holder can produce valid ciphertexts.'
          ],
          answer: 0,
          why: 'IND-CPA is about what the adversary can learn. Malleable schemes like counter mode are IND-CPA secure and offer no integrity at all.'
        },
        {
          q: 'In the UF-CMA game, which of these is a winning output?',
          opts: [
            'A valid tag on a message previously sent to the tagging oracle.',
            'A valid tag on a message never sent to the tagging oracle.',
            'The MAC key.',
            'Any pair $(M, T)$ where $T$ has the right length.'
          ],
          answer: 1,
          why: 'Forgery means verification accepts a message that was never legitimately tagged. Recovering the key would let the adversary do this, but the win condition is the forgery itself.'
        },
        {
          q: 'A PRF-based MAC uses 16-bit tags. Even if the PRF is perfect, what goes wrong?',
          opts: [
            'Nothing; PRF security covers it.',
            'An adversary making about $2^{16}$ verification guesses expects to forge, because each guess succeeds with probability $2^{-16}$.',
            'The tag reveals the key.',
            'The MAC is no longer deterministic.'
          ],
          answer: 1,
          why: 'The bound has a $q_v / 2^{\\tau}$ term. With $\\tau = 16$, around 65,000 guesses suffice — easily done online.'
        },
        {
          q: 'Plain CBC-MAC is secure for which message space?',
          opts: [
            'All bit strings.',
            'Messages of one fixed number of blocks.',
            'Messages shorter than one block.',
            'Messages that do not contain the zero block.'
          ],
          answer: 1,
          why: 'With fixed-length messages CBC-MAC is a secure PRF. Allowing different lengths enables the one-query extension forgery.'
        },
        {
          q: 'Which generic composition of encryption and MAC is secure for every IND-CPA scheme and every secure MAC?',
          opts: [
            'Encrypt-and-MAC.',
            'MAC-then-encrypt.',
            'Encrypt-then-MAC.',
            'None of them.'
          ],
          answer: 2,
          why: 'Tagging the ciphertext means any modification of the ciphertext is caught before decryption, and the tag reveals nothing about the plaintext beyond what the ciphertext already does.'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    /* Chapter 5 — Hash Functions                                          */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch5',
      num: 5,
      title: 'Hash Functions',
      blurb: 'Collision resistance, the birthday attack, Merkle–Damgård, and the random oracle model.',
      sections: [
        {
          id: 'ch5-what',
          title: 'What a hash function is for',
          body: [
            'A hash function takes an input of (almost) any length and returns a short, fixed-length output: SHA-256 maps arbitrary strings to 256 bits. Hashes are everywhere — in signatures, in HMAC, in password storage, in version control, in blockchains.',
            'The property most uses depend on is that the hash acts as a **fingerprint**: it should be infeasible to find two different inputs with the same output. If that holds, then signing or comparing $H(M)$ is as good as signing or comparing $M$ itself, and it is much shorter.',
            'Notice that collisions always *exist*. There are infinitely many inputs and only $2^{256}$ outputs, so by the pigeonhole principle, enormous numbers of inputs share each output. Collision resistance cannot mean "there are no collisions". It has to mean "nobody can *find* one".',
            'This makes hash functions unusual among the primitives in this course: there is no secret key whose secrecy explains why the function is hard to attack. Collision resistance is a property of the function\'s design alone.'
          ],
          quiz: [
            {
              q: 'Why do collisions necessarily exist for SHA-256?',
              opts: [
                'Because SHA-256 has known design flaws.',
                'Because the input space is far larger than the $2^{256}$ possible outputs, so by pigeonhole some inputs must share outputs.',
                'Because SHA-256 uses a key.',
                'They don\'t; SHA-256 is injective.'
              ],
              answer: 1,
              why: 'Any function from a larger set to a smaller set has collisions. Security is about the difficulty of finding them, not their absence.'
            }
          ]
        },
        {
          id: 'ch5-cr',
          title: 'Defining collision resistance',
          body: [
            'Bellare and Rogaway treat a hash function as a family $H : \\mathcal{K} \\times D \\to \\{0,1\\}^n$ indexed by a key $K$. Unlike the keys of earlier chapters, this key is **public**: it is handed to the adversary at the start.',
            'The collision-resistance game: pick $K$ at random, give it to $A$, and let $A$ output two inputs $x_1, x_2$. The adversary wins if $x_1 \\ne x_2$ and $H_K(x_1) = H_K(x_2)$.',
            '$$\\Adv^{\\mathrm{cr}}_H(A) = \\Pr[x_1 \\ne x_2 \\text{ and } H_K(x_1) = H_K(x_2)]$$',
            'Why bother with a key nobody keeps secret? Because of a subtle problem with unkeyed functions. For a fixed function like SHA-256, a collision exists, so an adversary that simply prints out that collision exists too. It runs in constant time and has advantage $1$. We just don\'t know which program it is. A definition that cannot distinguish "an adversary exists" from "we know an adversary" says nothing useful. The random public key fixes this, because no single hardcoded pair works for most keys.',
            'In practice, SHA-256 has no key, and people reason about it informally: "nobody knows how to find collisions". The keyed definition is the cleanest way to make that statement precise enough to use in proofs.'
          ],
          quiz: [
            {
              q: 'Why is collision resistance defined for a keyed family rather than a single fixed function?',
              opts: [
                'To keep the hash secret from the adversary.',
                'Because for a fixed function, an adversary that simply outputs a known collision exists, making the definition trivially unsatisfiable.',
                'Because unkeyed functions cannot be computed efficiently.',
                'Because SHA-256 requires a key.'
              ],
              answer: 1,
              why: 'Existence of an adversary is a mathematical fact, not a matter of knowledge. With a random public key, a single hardcoded collision only works for a tiny fraction of keys, so the definition becomes meaningful.'
            }
          ]
        },
        {
          id: 'ch5-birthday',
          title: 'The birthday attack',
          anim: 'birthday',
          body: [
            'How hard is it to find a collision in a generic $n$-bit hash? Your first guess might be about $2^n$ evaluations. The real answer is about $2^{n/2}$ — and the reason is the **birthday paradox**.',
            'In a room of just 23 people, the chance that two share a birthday is over 50%. That seems too small a room until you count pairs: 23 people form $\\binom{23}{2} = 253$ pairs, and each pair matches with probability $1/365$.',
            'The same logic applies to hashing. Evaluate $H$ on $q$ distinct random inputs. There are about $q^2/2$ pairs, and each pair collides with probability $2^{-n}$. So the chance of some collision is roughly $q^2 / 2^{n+1}$, which becomes substantial once $q \\approx 2^{n/2}$. More precisely, for $q \\le 2^{(n+1)/2}$,',
            '$$\\Pr[\\text{collision}] \\ge 0.3 \\cdot \\frac{q(q-1)}{2^n}$$',
            'This attack works against every hash function regardless of its design, which is why output lengths are double what you might expect. A 128-bit hash gives only about 64 bits of collision resistance — within reach of a determined attacker. SHA-256 gives about 128 bits.',
            'The attack needs memory to store all the hashes and look for repeats, but clever cycle-finding techniques reduce this to almost nothing. Memory is not a real defense.'
          ],
          quiz: [
            {
              q: 'Roughly how many hash evaluations does a generic birthday attack need against a 160-bit hash?',
              opts: [
                '$2^{160}$',
                '$2^{80}$',
                '$2^{40}$',
                '$160^2$'
              ],
              answer: 1,
              why: 'The birthday attack needs about $2^{n/2}$ evaluations, so $2^{80}$ for $n = 160$. That is why 160-bit SHA-1 was considered marginal even before structural attacks were found.'
            }
          ]
        },
        {
          id: 'ch5-preimage',
          title: 'One-wayness and second preimages',
          body: [
            'Collision resistance is not the only property people ask of hash functions. Two others come up often.',
            '**One-wayness** (preimage resistance): given $y = H(x)$ for a random $x$, it should be hard to find any $x\'$ with $H(x\') = y$. Password storage relies on this.',
            '**Second-preimage resistance**: given a specific $x$, it should be hard to find a different $x\'$ with $H(x\') = H(x)$. This is what you need if someone has already published a hash of a document and you want to make sure nobody can substitute another document with the same hash.',
            'The generic attacks for both of these cost about $2^n$, not $2^{n/2}$, because the adversary must hit one specific target rather than any pair. That is why collision resistance is the hardest of the three to achieve.',
            'For compressing functions, collision resistance implies second-preimage resistance: if you could find a second preimage for a random $x$, then $(x, x\')$ would be a collision. It also implies one-wayness under mild conditions. So a function that is collision resistant gives you all three — which is why collision resistance is the property proofs usually assume.'
          ],
          quiz: [
            {
              q: 'Why does collision resistance imply second-preimage resistance?',
              opts: [
                'Because both properties use the same key.',
                'Because a second preimage $x\'$ for $x$ is itself a collision $(x, x\')$, so a second-preimage finder is a collision finder.',
                'Because second-preimage resistance is defined only for collision-resistant functions.',
                'It doesn\'t; the implication goes the other way.'
              ],
              answer: 1,
              why: 'This is a direct reduction: given a second-preimage finder, pick $x$ yourself, run the finder, and output the pair. If the finder succeeds, you have a collision.'
            }
          ]
        },
        {
          id: 'ch5-md',
          title: 'Merkle–Damgård: from short inputs to long ones',
          anim: 'merkle-damgard',
          body: [
            'Designing a collision-resistant function for arbitrary-length inputs from scratch is hard. The **Merkle–Damgård** transform lets you design something much smaller — a compression function $h : \\{0,1\\}^{n+b} \\to \\{0,1\\}^n$ that maps a chaining value and one $b$-bit block to a new chaining value — and extend it.',
            'To hash $M$: pad it to a whole number of blocks, with the final block encoding the original length of $M$. Start with a fixed value $V_0$. For each block, compute $V_i = h(V_{i-1} \\,\\|\\, M[i])$. The hash is the final $V_m$. SHA-1 and SHA-256 follow this structure.',
            '**Theorem.** If $h$ is collision resistant, then so is the Merkle–Damgård hash $H$.',
            'Proof idea: suppose $M \\ne M\'$ collide under $H$. If they have different lengths, their final blocks differ (they encode different lengths), yet the final $h$ outputs are equal — that is a collision in $h$. If they have the same length, walk backward from the end. At each step either the inputs to $h$ differ, giving a collision in $h$, or they are equal, meaning the previous chaining values and blocks agree, and you step back once more. Since $M \\ne M\'$, some block differs, so the walk must stop at a collision in $h$. $\\qed$',
            'The structure has a well-known side effect: **length extension**. From $H(M)$ alone, anyone can compute $H(M \\,\\|\\, \\mathrm{pad} \\,\\|\\, X)$ for any $X$, by continuing the chain from $V_m$. That does not break collision resistance, but it is exactly why $H(K \\,\\|\\, M)$ is not a secure MAC — and why HMAC hashes twice. SHA-3 uses a different structure (a sponge) that avoids this.'
          ],
          quiz: [
            {
              q: 'Why does Merkle–Damgård encode the message length in the final block?',
              opts: [
                'To make the output longer.',
                'So that two colliding messages of different lengths force a collision in $h$ on the last block.',
                'To prevent the birthday attack.',
                'To make the hash function keyed.'
              ],
              answer: 1,
              why: 'Without length encoding, the proof breaks for messages of different lengths. With it, different lengths mean different last blocks, so equal final outputs mean $h$ itself collided.'
            },
            {
              q: 'What does length extension let an adversary do?',
              opts: [
                'Find collisions in $h$.',
                'Compute $H(M \\,\\|\\, \\mathrm{pad} \\,\\|\\, X)$ from $H(M)$ without knowing $M$.',
                'Recover $M$ from $H(M)$.',
                'Shorten the hash output.'
              ],
              answer: 1,
              why: 'The hash output is the full internal state. Continuing the chain from it hashes extra blocks, which breaks naive MACs like $H(K \\,\\|\\, M)$.'
            }
          ]
        },
        {
          id: 'ch5-ro',
          title: 'The random oracle model',
          body: [
            'Some schemes need more from a hash function than collision resistance — they want its outputs to look completely random and unrelated to its inputs. The **random oracle model** captures this by pretending that $H$ is a truly random function that every party, including the adversary, can only access by querying an oracle.',
            'In a proof in this model, the reduction gets to see every hash query the adversary makes, and it can choose the answers itself as long as they look random. That extra power makes many proofs possible, including the security of RSA-OAEP encryption and of full-domain-hash RSA signatures.',
            'The catch: a real hash function is not a random oracle. It is a fixed, public piece of code. Canetti, Goldreich, and Halevi constructed (contrived) schemes that are secure in the random oracle model but insecure with *any* real hash function plugged in. So a random-oracle proof is a strong heuristic, not a guarantee.',
            'The practical attitude in Bellare and Rogaway is that a random-oracle proof rules out a huge class of generic attacks — any attack must exploit some specific weakness of the concrete hash function. That is far better than no proof at all, and schemes proven this way have held up well in practice.'
          ],
          quiz: [
            {
              q: 'What is the main limitation of proofs in the random oracle model?',
              opts: [
                'They only apply to symmetric encryption.',
                'Real hash functions are fixed public code, not random functions, and there are schemes secure in the model but insecure for every real hash.',
                'They require the hash key to stay secret.',
                'They cannot handle adaptive adversaries.'
              ],
              answer: 1,
              why: 'The model idealizes the hash function. Contrived counterexamples show that the idealization can fail, so a random-oracle proof is a heuristic — though a valuable one.'
            }
          ]
        }
      ],
      mastery: [
        {
          q: 'What does collision resistance require?',
          opts: [
            'That no two inputs have the same hash.',
            'That no efficient adversary can find two distinct inputs with the same hash.',
            'That the hash output is uniformly random.',
            'That the hash cannot be computed without a secret key.'
          ],
          answer: 1,
          why: 'Collisions always exist for compressing functions. The requirement is computational: they must be infeasible to find.'
        },
        {
          q: 'You need about 128 bits of collision resistance. What is the shortest hash output that could provide it against generic attacks?',
          opts: [
            '64 bits',
            '128 bits',
            '256 bits',
            '512 bits'
          ],
          answer: 2,
          why: 'The birthday attack finds collisions in about $2^{n/2}$ work. To make that $2^{128}$, you need $n = 256$.'
        },
        {
          q: 'Which property has the cheapest generic attack?',
          opts: [
            'One-wayness.',
            'Second-preimage resistance.',
            'Collision resistance.',
            'They all cost $2^n$.'
          ],
          answer: 2,
          why: 'Collision finding only needs any matching pair, which the birthday attack achieves in about $2^{n/2}$ work. The other two require hitting a specific target, costing about $2^n$.'
        },
        {
          q: 'The Merkle–Damgård theorem says:',
          opts: [
            'If the compression function $h$ is collision resistant, then the full hash $H$ is collision resistant.',
            'If $H$ is collision resistant, then $h$ is a PRF.',
            'Merkle–Damgård hashes are random oracles.',
            'Merkle–Damgård hashes resist length extension.'
          ],
          answer: 0,
          why: 'Any collision in $H$ can be traced back, block by block, to a collision in $h$. Length extension is a separate property, and Merkle–Damgård hashes do not resist it.'
        },
        {
          q: 'Why is $\\Mac_K(M) = H(K \\,\\|\\, M)$ insecure when $H$ is SHA-256?',
          opts: [
            'Because SHA-256 is not collision resistant.',
            'Because length extension lets an adversary compute the tag of $M$ followed by extra blocks from the tag of $M$.',
            'Because the key is too short.',
            'Because SHA-256 output is too long to be a tag.'
          ],
          answer: 1,
          why: 'SHA-256 is a Merkle–Damgård hash, so its output is a full chaining state that can be extended. That gives a forgery without any knowledge of $K$.'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    /* Chapter 6 — Public-Key Encryption                                   */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch6',
      num: 6,
      title: 'Public-Key Encryption',
      blurb: 'RSA, ElGamal, and provable security in the public-key setting.',
      sections: [
        {
          id: 'ch6-setting',
          title: 'Encryption without a shared secret',
          body: [
            'Everything so far assumed Alice and Bob already share a secret key. On the internet, they usually have never met. Public-key encryption removes the assumption: Bob publishes a **public key** $pk$ that anyone may use to encrypt, and keeps a matching **secret key** $sk$ that only he can use to decrypt.',
            'A public-key encryption scheme $\\mathcal{AE} = (\\mathcal{K}, \\mathcal{E}, \\mathcal{D})$ has key generation $\\mathcal{K}$ outputting a pair $(pk, sk)$, encryption $\\mathcal{E}_{pk}(M)$, and decryption $\\mathcal{D}_{sk}(C)$. Correctness is the same as before: $\\mathcal{D}_{sk}(\\mathcal{E}_{pk}(M)) = M$.',
            'The IND-CPA game carries over almost unchanged, with one simplification: the adversary is given $pk$, so it can encrypt anything it likes on its own — the "chosen-plaintext" part comes for free. It is enough to give it a single left-or-right query; a hybrid argument shows that $q$ queries increase the advantage by at most a factor of $q$.',
            'The deterministic-encryption problem is now even more severe. If $\\mathcal{E}_{pk}$ is deterministic, the adversary does not even need two ciphertexts. Given a ciphertext $C$ and two candidate messages, it encrypts both candidates with $pk$ and sees which matches. So **every secure public-key encryption scheme must be randomized**.'
          ],
          quiz: [
            {
              q: 'Why does deterministic public-key encryption fail IND-CPA with just one left-or-right query?',
              opts: [
                'Because public keys are short.',
                'Because the adversary can encrypt $M_0$ and $M_1$ itself with $pk$ and compare to the challenge ciphertext.',
                'Because the secret key leaks through the public key.',
                'Because decryption is slow.'
              ],
              answer: 1,
              why: 'Anyone can encrypt in the public-key setting. With a deterministic scheme, re-encrypting the candidates and comparing identifies which one was encrypted.'
            }
          ]
        },
        {
          id: 'ch6-numbers',
          title: 'Number theory you need',
          body: [
            'Public-key cryptography is built on arithmetic modulo a number. For a positive integer $N$, $\\Z_N = \\{0, 1, \\ldots, N-1\\}$ with addition and multiplication mod $N$. The elements that have a multiplicative inverse are those coprime to $N$; they form the group $\\Z_N^*$, whose size is written $\\varphi(N)$.',
            'For a prime $p$, every nonzero element is invertible, so $\\varphi(p) = p - 1$. For $N = pq$ with $p, q$ distinct primes, $\\varphi(N) = (p-1)(q-1)$.',
            '**Euler\'s theorem**: for any $a \\in \\Z_N^*$, $a^{\\varphi(N)} \\equiv 1 \\pmod N$. Consequently, exponents can be reduced modulo $\\varphi(N)$: $a^x \\equiv a^{x \\bmod \\varphi(N)} \\pmod N$.',
            'Two computations are easy even for numbers thousands of bits long. **Modular exponentiation** $a^x \\bmod N$ takes about $\\log_2 x$ squarings and multiplications (square-and-multiply). **Modular inverses** are found with the extended Euclidean algorithm.',
            'Two computations are believed hard. **Factoring**: given $N = pq$ for large random primes, find $p$ and $q$. **Discrete logarithm**: given a generator $g$ of a large group and $X = g^x$, find $x$. Every scheme in this chapter rests on one of these.'
          ],
          quiz: [
            {
              q: 'What is $\\varphi(N)$ for $N = 5 \\cdot 11 = 55$?',
              opts: [
                '$54$',
                '$40$',
                '$16$',
                '$55$'
              ],
              answer: 1,
              why: 'For $N = pq$, $\\varphi(N) = (p-1)(q-1) = 4 \\cdot 10 = 40$.'
            }
          ]
        },
        {
          id: 'ch6-rsa',
          title: 'RSA: a trapdoor permutation',
          anim: 'rsa-trapdoor',
          body: [
            'RSA key generation picks two large random primes $p, q$, sets $N = pq$, and chooses an exponent $e$ coprime to $\\varphi(N)$. It then computes $d$ with $ed \\equiv 1 \\pmod{\\varphi(N)}$. The public key is $(N, e)$; the secret key is $(N, d)$.',
            'The RSA function is $f(x) = x^e \\bmod N$ and its inverse is $f^{-1}(y) = y^d \\bmod N$. They really are inverses: $(x^e)^d = x^{ed} = x^{1 + k\\varphi(N)} = x \\cdot (x^{\\varphi(N)})^k \\equiv x \\pmod N$ by Euler\'s theorem.',
            'A tiny example: $p = 5$, $q = 11$, so $N = 55$ and $\\varphi(N) = 40$. Take $e = 3$; then $d = 27$, since $3 \\cdot 27 = 81 = 2 \\cdot 40 + 1$. Applying $f$ to $x = 2$ gives $2^3 = 8$. Applying $f^{-1}$ gives $8^{27} \\bmod 55 = 2$.',
            'Anyone can compute $f$. Computing $f^{-1}$ appears to require $d$, and finding $d$ from $(N, e)$ is as hard as factoring $N$. So $f$ is a **trapdoor permutation**: a permutation that is easy in one direction for everyone, and easy in the other direction only for whoever holds the trapdoor $d$.',
            'The **RSA assumption** is that, for a random $y \\in \\Z_N^*$, no efficient adversary given $(N, e, y)$ can find $x$ with $x^e \\equiv y \\pmod N$. Real moduli are 2048 bits or more.'
          ],
          quiz: [
            {
              q: 'Why does $(x^e)^d \\equiv x \\pmod N$ hold?',
              opts: [
                'Because $e = d$.',
                'Because $ed = 1 + k\\varphi(N)$ for some $k$, and $x^{\\varphi(N)} \\equiv 1$ by Euler\'s theorem.',
                'Because $N$ is prime.',
                'Because exponentiation is commutative.'
              ],
              answer: 1,
              why: 'The exponent $ed$ is $1$ more than a multiple of $\\varphi(N)$. Every full multiple of $\\varphi(N)$ in the exponent contributes a factor of $1$, leaving $x^1$.'
            }
          ]
        },
        {
          id: 'ch6-textbook',
          title: 'Why "textbook RSA" is not secure encryption',
          body: [
            'The tempting scheme is to encrypt by $C = M^e \\bmod N$ and decrypt by $M = C^d \\bmod N$. This is called **textbook RSA**, and it is not a secure encryption scheme.',
            'It is deterministic, so by the argument at the start of this chapter it is not IND-CPA secure: given $C$, encrypt both candidate messages and compare.',
            'It is also **malleable**. Given $C = M^e$, anyone can compute $C \\cdot 2^e = (2M)^e$, a valid encryption of $2M$, without knowing $M$. In a protocol where the adversary can see decryptions of modified ciphertexts, this leaks the plaintext.',
            'And the RSA assumption only says it is hard to invert $f$ on a *random* input. Real messages are not random: they are short, structured, or guessable. If $M$ is a small number and $e = 3$, then $M^3$ may be less than $N$, and the "encryption" can be undone with an ordinary cube root.',
            'Secure RSA encryption first transforms the message with randomized padding. **RSA-OAEP**, the standardized method, applies two hash-based mixing rounds with fresh randomness before applying $f$. It is proved IND-CCA secure (secure even when the adversary can see decryptions of other ciphertexts) under the RSA assumption, in the random oracle model.'
          ],
          quiz: [
            {
              q: 'Given a textbook RSA ciphertext $C = M^e \\bmod N$, how can an adversary produce an encryption of $2M$?',
              opts: [
                'It cannot without $d$.',
                'Compute $C \\cdot 2^e \\bmod N$.',
                'Compute $2C \\bmod N$.',
                'Compute $C^2 \\bmod N$.'
              ],
              answer: 1,
              why: 'RSA is multiplicative: $M^e \\cdot 2^e = (2M)^e$. The adversary uses the public $e$ to scale the hidden plaintext.'
            }
          ]
        },
        {
          id: 'ch6-elgamal',
          title: 'Diffie–Hellman and ElGamal',
          body: [
            'Let $G$ be a cyclic group of prime order $q$ with generator $g$ — for example, a prime-order subgroup of $\\Z_p^*$ or an elliptic-curve group. Three problems in $G$ form a hierarchy. **DL**: given $g^x$, find $x$. **CDH**: given $g^x$ and $g^y$, compute $g^{xy}$. **DDH**: given $g^x$, $g^y$, and $Z$, decide whether $Z = g^{xy}$ or $Z$ is a random group element.',
            'Solving DL lets you solve CDH, and solving CDH lets you solve DDH, so DDH is the strongest assumption of the three. In some groups DDH is easy even though DL is hard: in the full group $\\Z_p^*$, quadratic residuosity leaks a bit of $xy$. That is why schemes use prime-order subgroups.',
            '**ElGamal encryption.** The secret key is a random $x \\in \\Z_q$, and the public key is $X = g^x$. To encrypt a group element $M$, pick a random $y \\in \\Z_q$ and output $(Y, W) = (g^y, \\; X^y \\cdot M)$. To decrypt, compute $W \\cdot (Y^x)^{-1}$. Since $Y^x = g^{xy} = X^y$, the mask cancels.',
            '**Theorem.** If DDH is hard in $G$, then ElGamal is IND-CPA secure.',
            'Proof idea: the reduction gets a DDH challenge $(g^x, g^y, Z)$. It sets $pk = g^x$, and answers the left-or-right query with $(g^y, Z \\cdot M_b)$ for a random bit $b$ of its own. If $Z = g^{xy}$, this is a real encryption and the adversary guesses $b$ with its usual advantage. If $Z$ is a random group element, then $Z \\cdot M_b$ is uniform no matter what $M_b$ is — a one-time pad in the group — and the adversary can only guess. Any gap between these cases is a DDH advantage. $\\qed$'
          ],
          quiz: [
            {
              q: 'In the ElGamal proof, why can the adversary do no better than guessing when $Z$ is random?',
              opts: [
                'Because the public key is hidden.',
                'Because multiplying $M_b$ by a uniform group element gives a uniform result, independent of $b$ — a one-time pad in the group.',
                'Because the adversary cannot compute discrete logarithms.',
                'Because $y$ is reused.'
              ],
              answer: 1,
              why: 'In a group, multiplication by a uniform random element is a bijection that maps any fixed $M_b$ to a uniform output. So the ciphertext carries no information about $b$.'
            }
          ]
        },
        {
          id: 'ch6-hybrid',
          title: 'Putting it together: hybrid encryption',
          body: [
            'Public-key operations are slow — thousands of times slower than a block cipher — and schemes like ElGamal only encrypt a single group element. Nobody encrypts a video file with RSA.',
            'Instead, systems use **hybrid encryption**. To send $M$ to Bob: pick a fresh random symmetric key $K$; encrypt $K$ under Bob\'s public key; encrypt $M$ under $K$ with an authenticated symmetric scheme (Chapter 4\'s Encrypt-then-MAC, or GCM). Bob decrypts $K$ with $sk$, then decrypts $M$ with $K$.',
            'Formally the public-key part is a **key encapsulation mechanism** (KEM) and the symmetric part a **data encapsulation mechanism** (DEM). The KEM/DEM theorem says the combination is secure if each part is secure, with the advantages adding up — another reduction in the now-familiar pattern.',
            'This is how TLS, Signal, PGP, and essentially every real system works, and it uses every chapter of this course: a hash function to derive keys (Chapter 5), a MAC for integrity (Chapter 4), a PRF-based symmetric scheme for bulk data (Chapter 3), and a public-key primitive to establish the key in the first place.',
            'Finally, a word on stronger attacks. Real adversaries can often send modified ciphertexts and observe how the receiver reacts — an error message, a timing difference. Bleichenbacher\'s 1998 attack recovered TLS session keys this way from an RSA padding scheme that was only IND-CPA secure. The modern target is **IND-CCA** security, where the adversary may also ask for decryptions of any ciphertext other than its challenge. RSA-OAEP and hybrid schemes with authenticated DEMs achieve it.'
          ],
          quiz: [
            {
              q: 'In hybrid encryption, what does the public-key scheme encrypt?',
              opts: [
                'The entire message.',
                'A fresh random symmetric key.',
                'The hash of the message.',
                'The receiver\'s secret key.'
              ],
              answer: 1,
              why: 'The public-key operation is expensive and handles only short inputs, so it is used once to transport a symmetric key. The fast symmetric scheme then handles the bulk data.'
            }
          ]
        }
      ],
      mastery: [
        {
          q: 'Why must every IND-CPA secure public-key encryption scheme be randomized?',
          opts: [
            'Because public keys change for each message.',
            'Because the adversary holds $pk$ and can re-encrypt candidate messages; a deterministic scheme lets it compare.',
            'Because the RSA function is randomized.',
            'Because decryption needs the randomness.'
          ],
          answer: 1,
          why: 'In the public-key setting encryption is available to everyone. Determinism means a candidate plaintext can be checked against a ciphertext directly.'
        },
        {
          q: 'With $p = 5$, $q = 11$, $e = 3$, which $d$ is the RSA decryption exponent?',
          opts: [
            '$d = 3$',
            '$d = 27$',
            '$d = 37$',
            '$d = 40$'
          ],
          answer: 1,
          why: '$\\varphi(55) = 40$ and $3 \\cdot 27 = 81 = 2 \\cdot 40 + 1$, so $3 \\cdot 27 \\equiv 1 \\pmod{40}$.'
        },
        {
          q: 'Which assumption is ElGamal\'s IND-CPA security based on?',
          opts: [
            'The RSA assumption.',
            'Hardness of factoring.',
            'The Decisional Diffie–Hellman (DDH) assumption.',
            'Collision resistance of a hash function.'
          ],
          answer: 2,
          why: 'The proof replaces the mask $g^{xy}$ with a random group element; any adversary that notices the swap solves DDH.'
        },
        {
          q: 'Which is a reason textbook RSA should not be used to encrypt?',
          opts: [
            'It cannot be decrypted efficiently.',
            'It is deterministic and malleable, and small or structured messages may be recovered directly.',
            'It requires a shared secret key.',
            'It only works for prime moduli.'
          ],
          answer: 1,
          why: 'Textbook RSA fails IND-CPA by determinism, allows controlled modification via its multiplicative structure, and gives no protection for non-random messages. Randomized padding such as OAEP fixes these issues.'
        },
        {
          q: 'Why do real systems use hybrid encryption instead of public-key encryption alone?',
          opts: [
            'Public-key schemes are insecure for long messages.',
            'Public-key operations are slow and handle only short inputs; a symmetric scheme handles the bulk data far more efficiently.',
            'Symmetric schemes provide forward secrecy automatically.',
            'Public-key schemes cannot be randomized.'
          ],
          answer: 1,
          why: 'Hybrid encryption uses one public-key operation to transport a symmetric key, then fast symmetric encryption for everything else, and is provably secure when both parts are.'
        }
      ]
    }
  ];
}());
