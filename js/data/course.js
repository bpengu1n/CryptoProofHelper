/* Course content: Bellare & Rogaway "Introduction to Modern Cryptography"
   Chapters 1–7. */
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
      book: 'Bellare & Rogaway, Chapter 1 (Introduction).',
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
            'Confidentiality (also called privacy or secrecy) means the adversary cannot learn anything about the content of a message. Not just the main content — even incidental information such as "this message starts with the letter A" counts as a violation of confidentiality in the formal definitions.',
            'Two things standard encryption deliberately does *not* hide. The first is **length**: a ciphertext usually reveals roughly how long the message is, and the formal definitions in Chapter 3 explicitly allow that leak. The second is **metadata** — who is talking to whom, when, and how often. Hiding those takes extra measures such as padding messages to fixed sizes or routing traffic through anonymity networks.',
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
                'Any efficient algorithm that breaks it could be turned into one that solves a problem believed to be hard.',
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
      book: 'Bellare & Rogaway, Chapter 2 (Classical Encryption).',
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
            'Perfect security is a remarkably strong guarantee: it holds even against an adversary with unlimited computational power. There is no algorithm — not now, not ever — that can learn anything about the plaintext from the ciphertext alone. Compare this to computational security, which only holds against adversaries with a realistic amount of computing time (Chapter 3 makes this precise). A computationally secure scheme might, in principle, be broken by an adversary with enough compute; a perfectly secure scheme cannot, period.',
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
            'Proof of the bound. Fix any ciphertext $C$ that can actually occur — some message and key produce it. Let $\\mathcal{M}(C) = \\{M : \\exists K, \\mathcal{E}_K(M) = C\\}$ be the set of messages that can produce $C$. Correctness of decryption means: for each $M \\in \\mathcal{M}(C)$, the key $K_M$ satisfying $\\mathcal{E}_{K_M}(M) = C$ is unique to $M$ — two different messages require different keys (otherwise decryption of $C$ with that key would be ambiguous). So the map $M \\mapsto K_M$ is injective, giving $|\\mathcal{M}(C)| \\leq |\\mathcal{K}|$. But since $C$ occurs for some message, perfect security forces $\\Pr[\\mathcal{E}_K(M) = C] > 0$ for every $M$ — otherwise seeing $C$ would rule out some plaintext and leak information. So $\\mathcal{M} \\subseteq \\mathcal{M}(C)$, and therefore $|\\mathcal{M}| \\leq |\\mathcal{K}|$. $\\square$'
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
          why: 'The OTP key is a uniform $m$-bit string, so $|\\mathcal{K}| = 2^m$. Messages are also $m$-bit strings, so $|\\mathcal{M}| = 2^m$. The OTP meets the lower bound with equality — the key is exactly as long as the message, no more.'
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
      book: 'Bellare & Rogaway, Chapters 3–5 (Blockciphers, Pseudorandom Functions, Symmetric Encryption), condensed.',
      blurb: 'Pseudorandom functions, the IND-CPA game, and why counter mode is secure while ECB is not.',
      sections: [
        {
          id: 'ch3-computational',
          title: 'From perfect to computational security',
          body: [
            'Chapter 2 ended with bad news: perfect security needs a key as long as everything you will ever encrypt. Real systems encrypt terabytes under a 128-bit key. So real systems cannot be perfectly secure, and we need a weaker — but still meaningful — goal.',
            'The weakening is this: we stop worrying about adversaries with unlimited computing power and only worry about adversaries who run in a realistic amount of time. An adversary who would need $2^{128}$ steps to succeed is, for every practical purpose, an adversary who fails.',
            'Bellare and Rogaway measure security concretely. An adversary $A$ is an algorithm with a running time $t$ and a number of queries $q$ it makes to whatever oracles the game provides. Its success is measured by its **advantage** — a number that is at most $1$, where a value near $0$ means it does no better than guessing. A scheme is secure if every adversary with reasonable $t$ and $q$ has tiny advantage.',
            'Notice what changes: the definition no longer says "the adversary learns nothing". It says "the adversary learns nothing it can use, unless it spends an enormous amount of work". That is weaker than Shannon\'s guarantee, but it is the guarantee every encryption scheme you use today actually provides.',
            'Since we can no longer prove these statements outright (doing so would resolve open questions like P vs NP), most results in this chapter have the same shape: if the building block is secure, then the scheme built from it is secure. These are **reductions**, and learning to read them is the main skill of the chapter.'
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
            'What property do we want from $E$? The useful answer is: it should look like a random function to anyone who does not know the key. We capture this with a game, stated for any keyed function $F : \\{0,1\\}^k \\times \\{0,1\\}^{\\ell} \\to \\{0,1\\}^L$ (a *function family*). A block cipher $E$ is the special case where every $F_K$ is a permutation.',
            'In the PRF game, a hidden bit decides which world the adversary is in. In the "real" world, a key $K$ is chosen at random and the adversary gets an **oracle** for $F_K(\\cdot)$ — a black box it can send inputs to and get outputs back from, without seeing inside. In the "random" world, the adversary gets an oracle for a truly random function $g$ — one where each new input gets a fresh, independent, uniformly random output (and a repeated input gets the same answer as before). The adversary queries the oracle as it likes, then outputs a guess: $1$ for "real", $0$ for "random".',
            '$$\\Adv^{\\mathrm{prf}}_F(A) = \\Pr[A^{F_K} \\Rightarrow 1] - \\Pr[A^{g} \\Rightarrow 1]$$',
            'Here $A^{F_K} \\Rightarrow 1$ means "$A$, given oracle $F_K$, outputs $1$". If no efficient adversary can make this difference noticeably larger than $0$, we say $F$ is a **pseudorandom function** (PRF). The idea is powerful: any argument that would be easy with a truly random function can be carried over to $F_K$, at the cost of the PRF advantage.',
            'A block cipher is really a pseudorandom *permutation* (PRP): the random world uses a random permutation rather than a random function. The two notions are almost interchangeable. A random function on $n$-bit blocks only looks different from a random permutation once two inputs collide on the same output, and with $q$ queries that happens with probability at most $q^2 / 2^{n+1}$. This is the **PRP/PRF switching lemma**, and it lets us treat AES as a PRF in proofs, at the cost of an extra $q^2 / 2^{n+1}$ term in the bound. (B&R state the slightly tighter $q(q-1) / 2^{n+1}$.)'
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
            'Here is the first surprise of the chapter. If $\\mathcal{E}$ is deterministic and stateless — the same key and message always give the same ciphertext — then the scheme cannot be secure once the same key encrypts more than one message. The reason is simple: an adversary who sees two equal ciphertexts learns that the two underlying messages were equal. That is information about the plaintexts.',
            'This is not a theoretical quibble. A database that encrypts the "diagnosis" column deterministically reveals which patients share a diagnosis. So a secure scheme must be **randomized** (pick fresh random coins for each encryption) or **stateful** (keep a counter that changes after each encryption). Both approaches appear in the modes section below.'
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
            'How do we define "the ciphertext reveals nothing" when the adversary has bounded computing power? Bellare and Rogaway use a **left-or-right** game for **IND-CPA** (*indistinguishability under chosen-plaintext attack*), and it is worth getting to know it well — most privacy definitions in the rest of the book are variations on it.',
            'A key $K$ is chosen and a hidden bit $b$ is fixed. The adversary may make queries to a left-or-right oracle $\\mathcal{E}_K(\\mathrm{LR}(\\cdot,\\cdot,b))$. Each query is a pair of equal-length messages $(M_0, M_1)$; the oracle encrypts $M_b$ and returns the ciphertext. At the end, the adversary outputs a guess $b\'$ for $b$.',
            '$$\\Adv^{\\mathrm{ind-cpa}}_{\\mathcal{SE}}(A) = \\Pr[b\'=1 \\mid b=1] - \\Pr[b\'=1 \\mid b=0]$$',
            'Notice how much power the adversary has. It chooses the messages. It can ask for an encryption of any message it likes simply by setting $M_0 = M_1$ — that is the "chosen-plaintext attack" (CPA) part. It can adapt each query to the answers it has seen. And yet, if the scheme is secure, it still cannot tell whether it is looking at encryptions of the left messages or the right ones.',
            'Why must the messages have equal length? Because practical encryption leaks length — a 1 MB file produces a ciphertext of roughly 1 MB. Requiring $|M_0| = |M_1|$ is an honest admission that length is not hidden, while everything else is.',
            'The game also handles the deterministic-encryption problem from the previous section automatically. An adversary that queries $(M, M)$ and then $(M, M\')$, with $M \\ne M\'$ of the same length, outputs $1$ if the two ciphertexts differ and $0$ if they match. For a deterministic stateless scheme they match exactly when $b = 0$, so the advantage is $1$.',
            '(The primer\'s IND-CPA lesson uses a one-challenge version with a separate encryption oracle. The two definitions are equivalent up to a factor of the number of queries, so either one works.)'
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
            'A block cipher encrypts exactly $n$ bits. A **mode of operation** turns it into an encryption scheme for longer messages. Split the message into blocks $M = M[1] M[2] \\cdots M[m]$, each $n$ bits. Below, $0^n$ means a string of $n$ zeros and $1^n$ a string of $n$ ones.',
            '**ECB (electronic codebook)** encrypts each block independently: $C[i] = E_K(M[i])$. It is deterministic, so it cannot be IND-CPA secure — but it is worse than that: it leaks equality *within* a single message. Attack: query $(M_0, M_1)$ with $M_0 = 0^n 0^n$ and $M_1 = 0^n 1^n$. If the two ciphertext blocks are equal, answer $0$; otherwise answer $1$. This adversary makes one query and has advantage exactly $1$.',
            '**CBC with a random IV** picks a random $n$-bit *initialization vector* (IV) $C[0]$ and sets $C[i] = E_K(C[i-1] \\oplus M[i])$. The random start masks every block that follows, so repeated plaintext blocks produce repeated ciphertext blocks only with tiny probability (until about $2^{n/2}$ blocks, when birthday collisions start to leak information). The IV must be *unpredictable*, not merely different each time: if the adversary can predict the next IV, it can choose $M[1]$ to cancel it and force a repeated block. CBC with a counter as its IV is insecure for exactly this reason.',
            '**Randomized counter mode (CTR)** picks a random $n$-bit value $R$ and sets $C[i] = F_K(R + i) \\oplus M[i]$ (with $R + i$ computed mod $2^n$), outputting $R$ along with the $C[i]$. In effect, $F_K$ is used to stretch a short key into a long pad, which is then used like a one-time pad. Unlike CBC, CTR only needs $F_K$ in the forward direction, so $F$ can be any PRF, and all blocks can be processed in parallel.',
            '**Stateful counter mode** is the stateful alternative: instead of picking $R$ at random, the sender keeps a counter $ctr$, sets $C[i] = F_K(ctr + i) \\oplus M[i]$, outputs $ctr$, and then advances $ctr$ by $m$. Counter values never repeat, so its security bound has no birthday term from counter collisions. The price is that the sender must never lose or reset its state.',
            '**Never reuse a counter value under the same key.** If the pad block $F_K(v)$ is used twice, then $C[i] \\oplus C\'[j] = M[i] \\oplus M\'[j]$ — exactly the two-time-pad failure from Chapter 2. Randomness, or a counter that never resets, is what prevents this.',
            'Both randomized CBC and randomized CTR are IND-CPA secure if the underlying block cipher is a good PRP (equivalently, by the switching lemma, a good PRF up to a birthday term) — as long as the total number of blocks encrypted stays well below $2^{n/2}$. That caveat is the subject of the next section.',
            'One more warning. IND-CPA is only about what an eavesdropper can *learn*; it promises nothing against an attacker who *modifies* ciphertexts. In counter mode, flipping bit $j$ of $C[i]$ flips bit $j$ of the decrypted $M[i]$. Chapter 4 deals with this.'
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
            'The theorem for randomized counter mode says, roughly: for any adversary $A$ attacking randomized CTR that encrypts a total of $\\sigma$ blocks across all its queries, there is a PRF adversary $B$, running in about the same time, such that',
            '$$\\Adv^{\\mathrm{ind-cpa}}_{\\mathrm{CTR}}(A) \\le 2 \\cdot \\Adv^{\\mathrm{prf}}_F(B) + \\frac{\\sigma^2}{2^n}$$',
            'Read the right-hand side term by term. The first term says: if $F$ is a good PRF, this part is tiny. The second term is a **birthday bound**: it stays small only while $\\sigma$ is well below $2^{n/2}$. For AES, $n = 128$, so you should rekey long before encrypting $2^{64}$ blocks. For example, encrypting $\\sigma = 2^{32}$ blocks (64 GB) under one key gives a birthday term of $2^{64} / 2^{128} = 2^{-64}$ — negligible. At $\\sigma = 2^{60}$ it is $2^{-8}$, already uncomfortable. (B&R prove a slightly tighter bound; this simpler form is still a valid upper bound.)',
            'The proof follows the pattern you will see again and again. Step 1: replace $F_K$ by a truly random function $g$. Any change in $A$\'s behavior when we do this can be turned into a PRF distinguisher $B$. $B$ picks its own bit $b$ at random, runs $A$, and answers each query $(M_0, M_1)$ by encrypting $M_b$ in counter mode, using its own oracle in place of $F_K$. When $A$ outputs $b\'$, $B$ outputs $1$ if $b\' = b$. That accounts for the $\\Adv^{\\mathrm{prf}}$ term; the factor $2$ appears because $\\Adv^{\\mathrm{ind-cpa}}(A) = 2 \\Pr[A \\text{ guesses } b] - 1$.',
            'Step 2: analyze the idealized scheme with $g$. If no counter value $R + i$ is ever used twice, every pad block is a fresh uniform string, so every ciphertext block is a one-time-pad encryption and reveals nothing — exactly as in Chapter 2. The only way the adversary can win is if two encryptions happen to use overlapping counter ranges. Bounding the probability of that overlap gives the $\\sigma^2 / 2^n$ term.',
            'If you compare this with the worked proof in the Proofs tab ("PRF ⟹ IND-CPA, randomized counter mode"), you will see $|\\Pr[S_0] - \\tfrac12| \\le \\Adv^{\\mathrm{prf}}_F(B) + q^2 \\ell / 2^n$ instead. Same theorem, different bookkeeping. Its advantage $|\\Pr[\\text{win}] - \\tfrac12|$ is half of ours, which is where our factor $2$ goes. It counts $q$ queries of at most $\\ell$ blocks each (so $\\sigma \\le q\\ell$), and it bounds overlaps per pair of *queries* rather than per pair of blocks, which gives $q^2 \\ell$ in place of $(q\\ell)^2$ — tighter whenever queries are longer than one block. Both are valid upper bounds. The Notation page lists these differences under "Two notations, one idea".',
            'The shape of this argument — "swap the real primitive for an ideal one, pay its advantage, then analyze the ideal world with probability" — is the template for nearly every proof in the rest of the course. $\\qed$'
          ],
          quiz: [
            {
              q: 'In the CTR proof, what is the reduction $B$\'s strategy?',
              opts: [
                'It searches for the key $K$ and passes it to $A$.',
                'It picks a random bit $b$, runs $A$, uses its own PRF-game oracle to compute the pads when encrypting $M_b$, and outputs $1$ if $A$ guesses $b$.',
                'It outputs a random bit.',
                'It replaces $A$\'s messages with random strings.'
              ],
              answer: 1,
              why: 'The reduction simulates the encryption game for $A$ using its oracle in place of $F_K$. It must pick $b$ itself, since it has to know which message to encrypt. If the oracle is $F_K$, $A$ sees the real scheme; if it is random, $A$ sees the idealized scheme. Any difference in how often $A$ guesses $b$ becomes $B$\'s distinguishing advantage.'
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
          q: 'An encryption scheme is deterministic and stateless. What can be said about its IND-CPA security?',
          opts: [
            'It is secure, as long as its building blocks are secure.',
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
          why: 'Ciphertext length tracks plaintext length in practice. Without the restriction, any scheme whose ciphertext length depends on the message length would fail trivially by querying a short and a long message.'
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
      book: 'Bellare & Rogaway, Chapter 7 (Message Authentication), with a first look at Chapter 8 (Authenticated Encryption).',
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
            'Unlike encryption, determinism is perfectly fine here. A MAC is not trying to hide the message — it is sent in the clear anyway — so there is nothing to protect by randomizing the tag.',
            'One practical warning: compare the received tag against the recomputed one in *constant time*. A comparison that stops at the first mismatched byte leaks, through its timing, how many leading bytes of a guess were right.'
          ]
        },
        {
          id: 'ch4-ufcma',
          title: 'Unforgeability under chosen-message attack',
          anim: 'uf-cma',
          body: [
            'What should it mean for a MAC to be secure? Picture the strongest adversary we can reasonably imagine: it gets to see valid tags on any messages it likes, and it can try out candidate forgeries as often as it likes. It wins if it gets the receiver to accept a message that the legitimate sender never tagged.',
            'Formally, the **UF-CMA** game (*unforgeability under chosen-message attack*) picks a key $K$ and gives the adversary two oracles: a tagging oracle $\\mathcal{T}_K(\\cdot)$ and a verification oracle $\\mathcal{V}_K(\\cdot,\\cdot)$. The adversary wins if it ever submits a pair $(M, T)$ to the verification oracle such that $\\mathcal{V}_K(M, T) = 1$ and $M$ was never queried to the tagging oracle. The verification oracle models the fact that a real receiver\'s accept/reject behavior is observable, so an attacker can try many candidate forgeries online.',
            '$$\\Adv^{\\mathrm{uf-cma}}_{\\Pi}(A) = \\Pr[A \\text{ forges}]$$',
            'Notice two things about this definition. First, the adversary chooses its messages adaptively — "chosen message attack". This models real systems, where an attacker can often get the sender to authenticate messages of the attacker\'s choosing. Second, the definition does not care whether the forged message is meaningful. A forgery on random garbage still counts. We cannot predict what an application will consider meaningful, so the definition demands protection for every message.',
            'Also note what the definition does *not* rule out: replaying a message that really was tagged. If Alice sent "pay Bob 10" with a valid tag, the adversary can send it again. Preventing replays is a protocol-level job, usually handled with sequence numbers or timestamps inside the authenticated message.',
            'A stronger variant, **strong unforgeability** (SUF-CMA), also counts a *new tag on an old message* as a forgery: any accepted pair $(M, T)$ that the tagging oracle never returned. For deterministic MACs whose verification recomputes the tag, the two notions coincide, because each message has only one valid tag.'
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
            'Step 2: suppose the MAC is a truly random function $g$. To forge, $A$ has to guess $g(M)$ on a message $M$ it has never queried. But $g(M)$ is a fresh, uniform $\\tau$-bit string that $A$ has no information about. Each verification attempt succeeds with probability $2^{-\\tau}$, so $q_v$ attempts succeed with probability at most $q_v / 2^{\\tau}$. Tagging queries don\'t appear in this term: seeing $g$ on other messages tells $A$ nothing about $g$ on a new one. $\\qed$',
            'The second term tells you how long tags need to be. With $\\tau = 64$ and an adversary making a million guesses, the chance of a lucky forgery is about $2^{-44}$. With $\\tau = 32$ it is far too high.',
            'One problem remains: a block cipher only accepts $n$-bit inputs, and real messages are longer. The next section extends the domain.'
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
            'A block cipher is (up to the birthday term from Chapter 3) a PRF on a single $n$-bit block. To MAC longer messages, we need to extend its domain.',
            'Why not tag each block separately and XOR the results, $T = E_K(M[1]) \\oplus \\cdots \\oplus E_K(M[m])$? Because swapping two blocks leaves $T$ unchanged: one tagging query gives a forgery. The blocks need to be *chained* so that order matters.',
            '**CBC-MAC** chains the blocks: $C_0 = 0^n$ and $C_i = E_K(C_{i-1} \\oplus M[i])$, with the tag being the final $C_m$. Note that the IV is fixed at $0^n$. Unlike CBC *encryption*, CBC-MAC with a random IV sent alongside the tag is insecure: changing the IV and the first message block by the same XOR leaves the tag unchanged.',
            'CBC-MAC is a secure PRF — and therefore a secure MAC — provided all messages have the same, fixed number of blocks. (Its security bound has a birthday term, like counter mode.)',
            'If messages may have different lengths, it is badly broken. Here is a forgery that uses one tagging query. Ask for the tag of a one-block message $M_1$; call it $T = E_K(M_1)$. Now output the two-block message $M_1 \\,\\|\\, (M_1 \\oplus T)$ with tag $T$.',
            'Check it: the first chaining value is $E_K(M_1) = T$. The second is $E_K(T \\oplus M_1 \\oplus T) = E_K(M_1) = T$. So the tag of the two-block message is $T$, and the adversary never asked for it. Advantage $1$, one query.',
            'The lesson is general: a construction can be secure under one assumption about its inputs and broken the moment that assumption is dropped. The precise requirement is that no allowed message is a prefix of another (fixed-length messages are a special case). Fixes exist — encrypt the final value under a second key (EMAC, also called ECBC-MAC), or *prepend* the message length (appending it is still forgeable), or use CMAC, which is the standardized variant — but each one had to be designed and proved for the variable-length setting.'
          ],
          quiz: [
            {
              q: 'The variable-length CBC-MAC forgery outputs $M_1 \\,\\|\\, (M_1 \\oplus T)$ with tag $T$. Why does it verify?',
              opts: [
                'Because $E_K$ is not a permutation.',
                'Because the second block XORs with the first chaining value $T$, cancelling it and leaving $E_K(M_1) = T$ again.',
                'Because the adversary already queried the two-block message to the tagging oracle.',
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
            'The other widely used MAC is built from a hash function (the subject of Chapter 5). The obvious idea, $\\Mac_K(M) = H(K \\,\\|\\, M)$, is broken for common hash functions like SHA-256: from the tag of $M$, an adversary can compute the tag of $M$ followed by extra data, without the key. (A hash like SHA-256 processes its input one block at a time with a smaller *compression function*, chaining the results; Chapter 5 shows why this lets an outsider keep extending $H(K \\,\\|\\, M)$. This is called "length extension".)',
            '**HMAC** avoids the problem by hashing twice with two derived keys:',
            '$$\\mathrm{HMAC}_K(M) = H((K \\oplus \\mathrm{opad}) \\,\\|\\, H((K \\oplus \\mathrm{ipad}) \\,\\|\\, M))$$',
            'where opad and ipad are fixed constants, and $K$ is first padded with zeros to the hash\'s block length (or hashed first if it is longer). The outer hash hides the inner value, so length extension no longer helps. HMAC is proved to be a PRF assuming the hash\'s compression function behaves like a PRF (including under the two related keys $K \\oplus \\mathrm{ipad}$ and $K \\oplus \\mathrm{opad}$). Notably, the proof does *not* need collision resistance, which is why HMAC-SHA1 is still considered a sound MAC even though SHA-1 collisions have been found.',
            'Finally: how should you get both privacy and integrity? The goal has a name: an **authenticated encryption** scheme must provide IND-CPA privacy *and* **ciphertext integrity** — no adversary, even after seeing encryptions of messages it chose, can produce a new ciphertext that decrypts to anything other than $\\perp$.',
            'Three generic ways to combine an IND-CPA encryption scheme with a MAC have been studied. **Encrypt-then-MAC** — encrypt, then tag the *entire* ciphertext (including the IV or starting value) under a *separate, independent* MAC key — achieves authenticated encryption for any IND-CPA scheme combined with a strongly unforgeable MAC. Every deterministic UF-CMA MAC, such as HMAC or CMAC, qualifies. Any tampering with the ciphertext is rejected before decryption even runs. **MAC-then-encrypt** (tag the message, then encrypt message and tag together) and **Encrypt-and-MAC** (encrypt the message and tag the message separately) can each fail for some secure components — Encrypt-and-MAC with a deterministic MAC leaks message equality directly through the tag. Use Encrypt-then-MAC, or a dedicated authenticated-encryption mode such as GCM.'
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
            'Messages whose final block is chosen at random.',
            'Messages that do not contain the zero block.'
          ],
          answer: 1,
          why: 'With fixed-length messages CBC-MAC is a secure PRF. Allowing different lengths enables the one-query extension forgery.'
        },
        {
          q: 'Which generic composition of encryption and MAC gives authenticated encryption for every IND-CPA scheme and every secure deterministic MAC, using independent keys?',
          opts: [
            'Encrypt-and-MAC.',
            'MAC-then-encrypt.',
            'Encrypt-then-MAC.',
            'None of them.'
          ],
          answer: 2,
          why: 'With independent keys, tagging the whole ciphertext means any modification of it is caught before decryption, and the tag reveals nothing about the plaintext beyond what the ciphertext already does.'
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
      book: 'Bellare & Rogaway, Chapter 6 (Hash Functions). The book covers hashing before MACs; this course swaps them.',
      blurb: 'Collision resistance, the birthday attack, Merkle–Damgård, and the random oracle model.',
      sections: [
        {
          id: 'ch5-what',
          title: 'What a hash function is for',
          body: [
            'A hash function takes an input of (almost) any length and returns a short, fixed-length output: SHA-256 maps arbitrary strings to 256 bits. Hashes are everywhere — in signatures, in HMAC, in password storage, in version control, in blockchains.',
            'The property most uses depend on is that the hash acts as a **fingerprint**: it should be infeasible to find two different inputs with the same output. If that holds, then signing or comparing $H(M)$ is as good as signing or comparing $M$ itself, and it is much shorter.',
            'Notice that collisions always *exist*. There are infinitely many inputs and only $2^{256}$ outputs, so by the pigeonhole principle, enormous numbers of inputs share each output. Collision resistance cannot mean "there are no collisions". It has to mean "nobody can *find* one".',
            'This makes hash functions unusual among the primitives in this course: there is no secret key whose secrecy explains why the function is hard to attack. Collision resistance is a property of the function\'s design alone. (In the next section, theorists add a *public* key anyway, for a technical reason.)'
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
            'The collision-resistance game: pick $K$ at random, give it to $A$, and let $A$ output two inputs $x_1, x_2$. The adversary wins if $x_1 \\ne x_2$ and $H_K(x_1) = H_K(x_2)$. As in earlier chapters, $H$ is collision resistant if every adversary with reasonable running time has small advantage.',
            '$$\\Adv^{\\mathrm{cr}}_H(A) = \\Pr[x_1 \\ne x_2 \\text{ and } H_K(x_1) = H_K(x_2)]$$',
            'Why bother with a key nobody keeps secret? Because of a subtle problem with unkeyed functions. For a fixed function like SHA-256, a collision exists, so an adversary that simply prints out that collision exists too. It runs in constant time and has advantage $1$. We just don\'t know which program it is. A definition that cannot distinguish "an adversary exists" from "we know an adversary" says nothing useful. The random public key fixes this: for a well-designed family, no single hardcoded pair works for more than a tiny fraction of keys. (B&R also discuss weaker variants, for example where the adversary must commit to $x_1$ before seeing the key; this chapter uses the strongest common one.)',
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
              why: 'Existence of an adversary is a mathematical fact, not a matter of knowledge. With a random public key and a well-designed family, a single hardcoded collision only works for a tiny fraction of keys, so the definition becomes meaningful.'
            }
          ]
        },
        {
          id: 'ch5-birthday',
          title: 'The birthday attack',
          anim: 'birthday',
          body: [
            'How hard is it to find a collision in a generic $n$-bit hash? Your first guess might be about $2^n$ evaluations. The real answer is about $2^{n/2}$ — and the reason is the **birthday paradox**.',
            'In a room of just 23 people, the chance that two share a birthday is over 50%. That seems too small a room until you count pairs: 23 people form $\\binom{23}{2} = 253$ pairs, and each pair matches with probability $1/365$. (The pairs overlap, so you can\'t simply multiply $253 \\times 1/365$; the true figure is 50.7%.)',
            'The same logic applies to hashing. Evaluate $H$ on $q$ distinct inputs. There are about $q^2/2$ pairs, and if the outputs behave like independent uniform $n$-bit values, each pair collides with probability $2^{-n}$. (A hash whose outputs are uneven only collides more easily.) So the chance of some collision is roughly $q^2 / 2^{n+1}$, which becomes substantial once $q \\approx 2^{n/2}$. More precisely, B&R show that for $2 \\le q \\le 2^{(n+1)/2}$,',
            '$$0.3 \\cdot \\frac{q(q-1)}{2^n} \\le \\Pr[\\text{collision}] \\le 0.5 \\cdot \\frac{q(q-1)}{2^n}$$',
            'This attack works against every hash function regardless of its design, which is why output lengths are double what you might expect. A 128-bit hash gives only about 64 bits of collision resistance — within reach of a determined attacker. SHA-256 gives about 128 bits. Structural attacks can do even better than the birthday attack against weak designs: MD5 collisions are found in seconds, and a practical SHA-1 collision was published in 2017. SHA-2 and SHA-3 are the current standards.',
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
            '**One-wayness** (preimage resistance): given $y = H(x)$ for a random $x$, it should be hard to find any $x\'$ with $H(x\') = y$. Note the word *random*: passwords are not random, so an attacker can simply hash likely guesses. That is why password storage uses salts and deliberately slow hashes, not one-wayness alone.',
            '**Second-preimage resistance**: given a random $x$, it should be hard to find a different $x\'$ with $H(x\') = H(x)$. This is what you need if someone has already published a hash of a document and you want to make sure nobody can substitute another document with the same hash.',
            'The generic attacks for both of these cost about $2^n$, not $2^{n/2}$, because the adversary must hit one specific target rather than any pair. That is why collision resistance is the hardest of the three to achieve.',
            'Collision resistance implies second-preimage resistance for any function: if you could find a second preimage $x\'$ for a random $x$, then $(x, x\')$ would be a collision. It also implies one-wayness, but only if $H$ is *compressing* — its inputs are substantially longer than its outputs. (The identity function never collides, yet is trivially invertible.) So a collision-resistant hash that compresses a lot is also second-preimage resistant and one-way, which is why collision resistance is the property proofs usually assume. The guarantee you get this way is only as strong as the collision resistance, about $2^{n/2}$, not the $2^n$ of the generic attacks.'
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
            'Designing a collision-resistant function for arbitrary-length inputs from scratch is hard. The **Merkle–Damgård** transform lets you design something much smaller — a compression function $h : \\{0,1\\}^{n+b} \\to \\{0,1\\}^n$ that maps a chaining value and one $b$-bit block to a new chaining value — and extend it. (As before, $h$ may carry a public key, used for every block; the theorem below holds key by key.)',
            'To hash $M$: pad it to a whole number of blocks, with the final block encoding the original length of $M$. Start with a fixed value $V_0$. For each block, compute $V_i = h(V_{i-1} \\,\\|\\, M[i])$. The hash is the final $V_m$. SHA-1 and SHA-256 follow this structure. (The padding must be injective, and the length field is bounded: SHA-256 messages must be shorter than $2^{64}$ bits.)',
            '**Theorem.** If $h$ is collision resistant, then so is the Merkle–Damgård hash $H$.',
            'Proof idea: suppose $M \\ne M\'$ collide under $H$. If they have different lengths, their final blocks differ (they encode different lengths), yet the final $h$ outputs are equal — that is a collision in $h$. If they have the same length, walk backward from the end. At each step either the inputs to $h$ differ, giving a collision in $h$, or they are equal, meaning the previous chaining values and blocks agree, and you step back once more. Since $M \\ne M\'$, some block differs, so the walk must stop at a collision in $h$. $\\qed$',
            'For example, with two blocks: equal hashes mean $h(V_1 \\,\\|\\, M[2]) = h(V_1\' \\,\\|\\, M\'[2])$. If the inputs differ, that is a collision in $h$. If they are equal, then $M[2] = M\'[2]$ and $V_1 = V_1\'$, i.e. $h(V_0 \\,\\|\\, M[1]) = h(V_0 \\,\\|\\, M\'[1])$ — and since the messages differ, $M[1] \\ne M\'[1]$, so this is a collision in $h$.',
            'The structure has a well-known side effect: **length extension**. From $H(M)$ and the length of $M$ (but not $M$ itself), anyone can compute $H(M \\,\\|\\, \\mathrm{pad} \\,\\|\\, X)$ for any $X$, by continuing the chain from $V_m$. That does not break collision resistance, but it is exactly why $H(K \\,\\|\\, M)$ is not a secure MAC — and why HMAC hashes twice. SHA-3 uses a different structure (a sponge) that avoids this, as do truncated variants such as SHA-512/256.'
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
                'Compute $H(M \\,\\|\\, \\mathrm{pad} \\,\\|\\, X)$ from $H(M)$ and $|M|$, without knowing $M$.',
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
            'In a proof in this model, the reduction gets to see every hash query the adversary makes, and it can choose the answers itself as long as they look random. That extra power makes many proofs possible, including security proofs for RSA-OAEP encryption (Chapter 7) and for full-domain-hash RSA signatures.',
            'The catch: a real hash function is not a random oracle. It is a fixed, public piece of code. Canetti, Goldreich, and Halevi constructed (contrived) schemes that are secure in the random oracle model but insecure with *any* real hash function plugged in. So a random-oracle proof is a strong heuristic, not a guarantee.',
            'The practical attitude in Bellare and Rogaway is that a random-oracle proof rules out a huge class of generic attacks — any attack must exploit something about the concrete hash function beyond its behavior as a random function. That is far better than no proof at all, and schemes proven this way have held up well in practice.'
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
            'Because length extension lets an adversary compute the tag of $M \\,\\|\\, \\mathrm{pad} \\,\\|\\, X$ from the tag of $M$.',
            'Because the key is too short.',
            'Because SHA-256 output is too long to be a tag.'
          ],
          answer: 1,
          why: 'SHA-256 is a Merkle–Damgård hash, so its output is a full chaining state that can be extended. That gives a forgery without any knowledge of $K$ (beyond its length, which is usually public).'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    /* Chapter 6 — Number Theory                                           */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch6',
      num: 6,
      title: 'Number Theory',
      book: 'Bellare & Rogaway, Chapters 9–10 (Computational Number Theory, Number-Theoretic Primitives).',
      blurb: 'Modular arithmetic, Euclid, inverses, Euler, the CRT, cyclic groups — the maths public-key cryptography runs on, with a hands-on widget in every section.',
      sections: [
        {
          id: 'ch6-divide',
          title: 'Divisibility, primes, and remainders',
          body: [
            'Every public-key scheme in Chapter 7 is arithmetic on very large integers. Their security, and even the fact that they decrypt correctly, rests on a small set of theorems about whole numbers. This chapter builds those theorems from the ground up. Each section has a **Try it** widget: change the numbers, step through the algorithm, and watch the theorem hold. Small examples are how number theory is learned — do the arithmetic yourself before reading on.',
            'Two kinds of facts matter. Some are **computations we must do quickly** on 2048-bit numbers: reduce, multiply, invert, exponentiate. Others are **structural theorems** that explain why a scheme works: why RSA decryption undoes encryption, why ElGamal\'s mask looks random. By the end of the chapter we will also have the third kind — problems believed to be **hard**, which is where security comes from.',
            '**Divisibility.** For integers $a, b$ we write $a \\mid b$ ("$a$ divides $b$") if $b = ka$ for some integer $k$. One small fact does a lot of work: if $d \\mid a$ and $d \\mid b$, then $d \\mid xa + yb$ for all integers $x, y$. (Proof: $a = kd$ and $b = ld$, so $xa + yb = (xk + yl)d$.) In words, a common divisor divides every combination.',
            '**Division with remainder.** For any integer $a$ and any $N \\ge 1$ there are unique integers $q$ and $r$ with $$a = qN + r, \\qquad 0 \\le r < N.$$ The remainder is written $a \\bmod N$. Note that $r$ is never negative: $-7 = (-3) \\cdot 3 + 2$, so $-7 \\bmod 3 = 2$. Beware that the `%` operator in C, Java and JavaScript gives $-1$ for `-7 % 3`. That difference is a classic source of crypto implementation bugs.',
            '**Primes.** An integer $p \\ge 2$ is **prime** if its only positive divisors are $1$ and $p$. The *fundamental theorem of arithmetic* says every integer $n \\ge 2$ factors into primes in exactly one way (up to order), for example $360 = 2^3 \\cdot 3^2 \\cdot 5$. It rests on **Euclid\'s lemma**: if a prime $p$ divides a product $ab$, then $p \\mid a$ or $p \\mid b$. (We prove it in the section on Bézout below.)',
            'Primes are plentiful. The *prime number theorem* says that a random integer near $x$ is prime with probability about $1/\\ln x$. Near $2^{1024}$ that is about $1/710$, so picking random odd 1024-bit numbers and testing each one finds a prime after a few hundred tries. RSA key generation does exactly this.'
          ],
          quiz: [
            {
              q: 'What is $-17 \\bmod 5$?',
              opts: ['$-2$', '$3$', '$2$', '$-3$'],
              answer: 1,
              why: 'The remainder must lie in $\\{0, \\ldots, 4\\}$. $-17 = (-4) \\cdot 5 + 3$, so the answer is $3$. ($-2$ is congruent to $3$, but it is not in the allowed range.)'
            },
            {
              q: 'If $d \\mid a$ and $d \\mid b$, which of these must $d$ also divide?',
              opts: ['$a/b$', '$a + 1$', '$5a - 3b$', '$ab + 1$'],
              answer: 2,
              why: 'A common divisor divides every integer combination $xa + yb$. Here $x = 5$ and $y = -3$.'
            }
          ]
        },
        {
          id: 'ch6-modular',
          title: 'Congruences and $\\Z_N$',
          widget: 'mod-clock',
          body: [
            'We write $a \\equiv b \\pmod N$, read "$a$ is congruent to $b$ modulo $N$", when $N \\mid a - b$. Equivalently, $a$ and $b$ leave the same remainder when divided by $N$. Congruence splits the integers into $N$ classes, one per remainder. We name each class by its remainder, so $\\Z_N = \\{0, 1, \\ldots, N-1\\}$, with addition and multiplication done mod $N$.',
            '**You may reduce whenever you like.** If $a \\equiv a\'$ and $b \\equiv b\'$ (mod $N$), then $a + b \\equiv a\' + b\'$ and $ab \\equiv a\'b\'$. For the product, $ab - a\'b\' = a(b - b\') + b\'(a - a\')$, and both terms are multiples of $N$. This is what makes cryptographic arithmetic possible: reduce after every operation and no intermediate number ever exceeds $N^2$. Without it, $7^{2^{100}}$ would have about $10^{30}$ digits — far more than all the world\'s computers could store.',
            'Subtraction is fine too: every $a$ has an additive inverse $-a \\equiv N - a$. **Division is the problem.** In $\\Z_{12}$ we have $2 \\cdot 3 \\equiv 6 \\equiv 2 \\cdot 9$, yet $3$ and $9$ are not congruent. So you cannot simply "cancel the $2$". Worse, $3 \\cdot 4 \\equiv 0$ although neither factor is $0$ — $\\Z_{12}$ has *zero divisors*. The next two sections find out exactly which numbers you are allowed to divide by.',
            'Use the clock below. Pick $N = 12$ and add: arithmetic mod $N$ is walking around a circle. Then multiply $a = 4$ by $b = 3$, and $a = 5$ by $b = 3$. The jumps of size $4$ only ever land on $0, 4, 8$, while the jumps of size $5$ eventually land everywhere. That difference is the whole story of the next two sections.'
          ],
          quiz: [
            {
              q: 'Compute $2^{10} \\bmod 7$ without computing $1024$.',
              opts: ['$1$', '$2$', '$4$', '$3$'],
              answer: 1,
              why: '$2^3 = 8 \\equiv 1 \\pmod 7$. So $2^{10} = (2^3)^3 \\cdot 2 \\equiv 1^3 \\cdot 2 = 2$. Reducing early keeps every step small.'
            },
            {
              q: 'In $\\Z_{12}$, why can\'t you conclude $x \\equiv y$ from $4x \\equiv 4y$?',
              opts: [
                'Because $12$ is even, and cancellation mod an even modulus only works for odd factors such as $3$ or $5$.',
                'Because $4$ shares a factor with $12$, so multiplying by $4$ is not one-to-one: $4 \\cdot 0 \\equiv 4 \\cdot 3$.',
                'You can: multiply both sides by $4^{-1} = 3$, since $4 \\cdot 3 \\equiv 0$ means multiplying by $3$ undoes the $4$ on both sides.',
                'Because $4$ is not prime, and only prime factors can be cancelled from both sides of a congruence.'
              ],
              answer: 1,
              why: '$4 \\cdot 3 = 12 \\equiv 0 = 4 \\cdot 0$, yet $3$ and $0$ are not congruent. Cancellation works only for numbers coprime to $N$, as the next sections show.'
            }
          ]
        },
        {
          id: 'ch6-gcd',
          title: 'Greatest common divisors and Euclid\'s algorithm',
          widget: 'euclid',
          body: [
            'The **greatest common divisor** $\\gcd(a, b)$ is the largest integer dividing both $a$ and $b$, with $\\gcd(a, 0) = |a|$. We call $a$ and $b$ **coprime** if $\\gcd(a, b) = 1$.',
            '**Lemma.** $\\gcd(a, b) = \\gcd(b, \\, a \\bmod b)$. *Proof.* Write $a = qb + r$. A common divisor of $a$ and $b$ divides $r = a - qb$, a combination of the two. A common divisor of $b$ and $r$ divides $a = qb + r$. So the two pairs have exactly the same common divisors, and therefore the same greatest one. $\\qed$',
            '**Euclid\'s algorithm** applies the lemma until the second number is $0$: $\\gcd(252, 105) = \\gcd(105, 42) = \\gcd(42, 21) = \\gcd(21, 0) = 21$. Step through it in the widget.',
            '**It is fast.** Every two steps, the larger number at least halves. Take a step from $(a, b)$ with $a > b$. If $b \\le a/2$, the new larger number $b$ is already at most half of $a$. If $b > a/2$, the remainder is $r = a - b < a/2$, and $r$ becomes the larger number one step later. So the number of steps is at most about $2\\log_2 a$ — proportional to the number of *digits*, not the size of the number. Two 2048-bit numbers need at most around $4000$ divisions, and in practice far fewer. Note that no factoring is involved: $\\gcd$ is easy even when factoring is hard.',
            'That combination — gcd easy, factoring hard — once broke real keys. In 2012 two research teams collected millions of RSA public keys from the internet. They found that badly seeded devices had generated moduli sharing a prime: $N_1 = pq_1$, $N_2 = pq_2$. Then $\\gcd(N_1, N_2) = p$ factors both instantly. One team recovered the private keys of about $0.5\\%$ of the TLS servers they scanned.'
          ],
          quiz: [
            {
              q: 'What is $\\gcd(84, 36)$?',
              opts: ['$6$', '$12$', '$4$', '$18$'],
              answer: 1,
              why: '$84 = 2 \\cdot 36 + 12$, then $36 = 3 \\cdot 12 + 0$. The last nonzero remainder is $12$.'
            },
            {
              q: 'Roughly how many division steps does Euclid\'s algorithm need on two $k$-bit numbers?',
              opts: ['About $2^k$', 'About $\\sqrt{2^k}$', 'At most about $2k$', 'Exactly $k^2$'],
              answer: 2,
              why: 'The larger argument at least halves every two steps, so there are at most about $2\\log_2(2^k) = 2k$ steps. The number of steps is linear in the bit length.'
            }
          ]
        },
        {
          id: 'ch6-inverse',
          title: 'Bézout\'s identity and modular inverses',
          widget: 'egcd',
          body: [
            '**Bézout\'s identity.** For any integers $a, b$, not both $0$, there are integers $s, t$ with $$\\gcd(a, b) = s \\cdot a + t \\cdot b.$$ The **extended Euclidean algorithm** finds $s$ and $t$. Run Euclid, but write every remainder as a combination of the two original numbers. The first two rows are $a = 1 \\cdot a + 0 \\cdot b$ and $b = 0 \\cdot a + 1 \\cdot b$. Each new remainder is "row two above minus $q$ times the row above", so it is again a combination. The last nonzero row expresses the gcd. It costs the same number of steps as plain Euclid.',
            '**Theorem.** $a$ has a multiplicative inverse modulo $N$ if and only if $\\gcd(a, N) = 1$.',
            '*Proof.* ($\\Leftarrow$) If $\\gcd(a, N) = 1$, Bézout gives $1 = sN + ta$. Reduce mod $N$: the $sN$ term vanishes, leaving $ta \\equiv 1$. So $t \\bmod N$ is an inverse. ($\\Rightarrow$) If $ab \\equiv 1 \\pmod N$, then $ab - 1 = kN$ for some $k$, so $1 = ab - kN$. Any common divisor of $a$ and $N$ divides the right-hand side, so it divides $1$. $\\qed$',
            'The inverse is unique mod $N$: if $ab \\equiv ab\' \\equiv 1$, then $b \\equiv b(ab\') = (ba)b\' \\equiv b\'$. We write it $a^{-1} \\bmod N$. With it, **cancellation comes back**. If $\\gcd(a, N) = 1$ and $ax \\equiv ay$, multiply both sides by $a^{-1}$ to get $x \\equiv y$. Likewise $ax \\equiv c$ has the unique solution $x \\equiv a^{-1}c$.',
            '**When $\\gcd(a, N) = d > 1$.** The congruence $ax \\equiv c \\pmod N$ has a solution exactly when $d \\mid c$, and then it has $d$ solutions mod $N$. If $d$ does not divide $c$ there is none, because every $ax - kN$ is a multiple of $d$. If $d \\mid c$, divide everything by $d$: $(a/d)x \\equiv c/d \\pmod{N/d}$, where now $\\gcd(a/d, N/d) = 1$. That gives one solution $x_0$ mod $N/d$, and the solutions mod $N$ are $x_0, \\; x_0 + N/d, \\; \\ldots, \\; x_0 + (d-1)N/d$. Example: $6x \\equiv 4 \\pmod{10}$ has $d = 2$, which divides $4$. Then $3x \\equiv 2 \\pmod 5$ gives $x \\equiv 4$, so the solutions mod $10$ are $4$ and $9$.',
            '*Euclid\'s lemma, as promised.* Suppose a prime $p$ divides $ab$ but not $a$. Then $\\gcd(a, p) = 1$, so $1 = sa + tp$. Multiply by $b$: $b = s(ab) + (tb)p$. Both terms are multiples of $p$, so $p \\mid b$. $\\qed$',
            'In Chapter 7, RSA key generation computes the decryption exponent as $d = e^{-1} \\bmod \\varphi(N)$ — exactly the computation in the widget, on 2048-bit numbers.'
          ],
          quiz: [
            {
              q: 'What is $7^{-1} \\bmod 26$?',
              opts: ['$15$', '$19$', '$11$', 'It does not exist'],
              answer: 0,
              why: '$7 \\cdot 15 = 105 = 4 \\cdot 26 + 1$. Extended Euclid: $26 = 3 \\cdot 7 + 5$, $7 = 1 \\cdot 5 + 2$, $5 = 2 \\cdot 2 + 1$. Back-substituting gives $1 = 3 \\cdot 26 - 11 \\cdot 7$, so $7^{-1} \\equiv -11 \\equiv 15$.'
            },
            {
              q: 'Does $6$ have an inverse modulo $15$?',
              opts: [
                'Yes, $6^{-1} = 11$.',
                'Yes, $6^{-1} = 6$.',
                'No, because $\\gcd(6, 15) = 3 \\neq 1$.',
                'No, because $15$ is not prime — nothing has an inverse mod $15$.'
              ],
              answer: 2,
              why: 'Every $6x - 15k$ is a multiple of $3$, so it can never equal $1$. (Other elements, such as $2$, do have inverses mod $15$. Only those sharing a factor with $15$ do not.)'
            }
          ]
        },
        {
          id: 'ch6-groups',
          title: 'Groups and the unit group $\\Z_N^*$',
          widget: 'units',
          body: [
            'A **group** $(G, \\cdot)$ is a set with an operation satisfying four rules. *Closure*: $a \\cdot b \\in G$. *Associativity*: $(ab)c = a(bc)$. *Identity*: some $1 \\in G$ has $1 \\cdot a = a \\cdot 1 = a$. *Inverses*: each $a$ has an $a^{-1}$ with $a a^{-1} = 1$. All groups in this course are also *abelian* ($ab = ba$). The **order** $|G|$ is the number of elements.',
            'Two families matter. $(\\Z_N, +)$ is a group of order $N$ with identity $0$. And the **unit group** $$\\Z_N^* = \\{ a \\in \\Z_N : \\gcd(a, N) = 1 \\}$$ is a group under multiplication mod $N$. Inverses exist by the last section. It is closed because if $a$ and $b$ are invertible, so is $ab$, with inverse $b^{-1}a^{-1}$. By contrast, $\\Z_{12} \\setminus \\{0\\}$ under multiplication is *not* a group: $3 \\cdot 4 = 0$ falls out of the set.',
            'The order of $\\Z_N^*$ is **Euler\'s totient** $\\varphi(N)$. Three rules compute it:',
            '(1) $\\varphi(p) = p - 1$ for prime $p$, since every nonzero element is coprime to $p$. (2) $\\varphi(p^k) = p^k - p^{k-1}$, because the non-units are exactly the $p^{k-1}$ multiples of $p$. (3) $\\varphi(mn) = \\varphi(m)\\varphi(n)$ when $\\gcd(m, n) = 1$ (proved with the CRT below). Together: $$\\varphi(N) = N \\prod_{p \\mid N} \\left(1 - \\frac{1}{p}\\right).$$ For an RSA modulus $N = pq$ this gives $\\varphi(N) = (p - 1)(q - 1)$.',
            '**Knowing $\\varphi(N)$ is as good as knowing the factors.** If $N = pq$, then $\\varphi(N) = N - (p + q) + 1$, so $p + q = N - \\varphi(N) + 1$. With both the sum and the product of $p$ and $q$, they are the roots of $x^2 - (p+q)x + N = 0$, which the quadratic formula solves. This is why RSA keeps $\\varphi(N)$ secret.',
            '*A note on standards.* B&R and this course use $\\varphi(N)$. RSA standards such as PKCS #1 often use the Carmichael function $\\lambda(N) = \\lcm(p-1, q-1)$ instead, which divides $\\varphi(N)$. Everything in Chapter 7 works with either one; $\\lambda$ just gives a slightly smaller $d$.',
            'In the widget, tap a highlighted unit to see its inverse. Tap a non-unit to see why it has none. Then tap a unit and look at the "shuffle" line — it is the key step in the next section\'s proof.'
          ],
          quiz: [
            {
              q: 'What is $\\varphi(36)$?',
              opts: ['$35$', '$24$', '$12$', '$18$'],
              answer: 2,
              why: '$36 = 2^2 \\cdot 3^2$, so $\\varphi(36) = 36 \\cdot \\tfrac12 \\cdot \\tfrac23 = 12$. Equivalently $\\varphi(4)\\varphi(9) = 2 \\cdot 6$.'
            },
            {
              q: 'For an RSA modulus $N = pq$, someone learns $\\varphi(N)$. What can they compute?',
              opts: [
                'Nothing useful: $\\varphi(N)$ is just a count of units and says nothing about which primes divide $N$.',
                '$p + q = N - \\varphi(N) + 1$, and then $p$ and $q$ themselves from a quadratic equation.',
                'Only $p \\cdot q$ again, since $\\varphi(N) = (p-1)(q-1)$ expands to an expression in $N$ alone.',
                'Whether $N$ is prime, but finding the actual factors would still require running a factoring algorithm.'
              ],
              answer: 1,
              why: 'With the sum and the product of $p$ and $q$ known, they are the two roots of $x^2 - (p+q)x + N$. So computing $\\varphi(N)$ is as hard as factoring $N$.'
            }
          ]
        },
        {
          id: 'ch6-euler',
          title: 'Order, Lagrange, and the theorems of Fermat and Euler',
          widget: 'powers',
          body: [
            'In a group, $g^x$ means $g$ multiplied by itself $x$ times, with $g^0 = 1$. The usual laws hold: $g^{x+y} = g^x g^y$ and $(g^x)^y = g^{xy}$.',
            '**Order of an element.** In a finite group the powers $g^0, g^1, g^2, \\ldots$ must eventually repeat. If $g^i = g^j$ with $i < j$, multiplying by $g^{-i}$ gives $g^{j-i} = 1$. The smallest $m \\ge 1$ with $g^m = 1$ is the **order** of $g$, written $\\ord(g)$. After that the powers cycle with period $m$, so $$g^x = 1 \\iff \\ord(g) \\mid x, \\qquad g^x = g^{x \\bmod \\ord(g)}.$$',
            'A **subgroup** $H$ of $G$ is a subset that is itself a group under the same operation: closed under the operation and under inverses. **Lagrange\'s theorem.** If $H$ is a subgroup of a finite group $G$, then $|H|$ divides $|G|$. *Proof sketch.* For $a \\in G$ the *coset* $aH = \\{ah : h \\in H\\}$ has exactly $|H|$ elements, because multiplying by $a$ is one-to-one. Two cosets are equal or disjoint: if $ah = bh\'$ then $a = bh\'h^{-1} \\in bH$, so $aH = bH$. So the cosets cut $G$ into pieces of equal size $|H|$, and $|H|$ divides $|G|$. $\\qed$ The powers of $g$ form a subgroup $\\langle g \\rangle$ of size $\\ord(g)$. So every element\'s order divides $|G|$, and therefore $g^{|G|} = 1$ for every $g \\in G$. Apply this to the groups of the last section:',
            '**Fermat\'s little theorem.** If $p$ is prime and $p$ does not divide $a$, then $a^{p-1} \\equiv 1 \\pmod p$. **Euler\'s theorem.** If $\\gcd(a, N) = 1$, then $a^{\\varphi(N)} \\equiv 1 \\pmod N$.',
            'Here is a self-contained proof of Euler\'s theorem — one worth being able to reproduce. List the units $u_1, \\ldots, u_m$, where $m = \\varphi(N)$. Multiply each by $a$. Since $a$ is invertible, $au_i = au_j$ forces $u_i = u_j$, so $au_1, \\ldots, au_m$ are the same $m$ units in a different order (the "shuffle" in the previous widget). The two lists have the same product: $$\\prod_i (a u_i) = a^m \\prod_i u_i \\equiv \\prod_i u_i.$$ The product of units is a unit, so cancel it: $a^m \\equiv 1$. $\\qed$',
            'Three consequences you will use constantly. **Reduce exponents mod $\\varphi(N)$**: $a^x \\equiv a^{x \\bmod \\varphi(N)}$ for $a \\in \\Z_N^*$. **Inverses by exponentiation**: $a^{-1} \\equiv a^{\\varphi(N) - 1}$, which is $a^{p-2}$ mod a prime. **A primality test**: if $a^{N-1} \\bmod N \\neq 1$, then $N$ is certainly composite, and we learned that without finding a factor. Some composites fool this test; $561 = 3 \\cdot 11 \\cdot 17$ fools it for every coprime $a$. Real systems use the strengthened **Miller–Rabin** test, which no composite fools for more than a quarter of the bases.',
            '*Miller–Rabin in one paragraph.* Write $N - 1 = 2^s u$ with $u$ odd. Pick a random base $a$ and compute $a^u, a^{2u}, a^{4u}, \\ldots, a^{2^s u} \\bmod N$ by repeated squaring. If $N$ is prime, the sequence either starts at $1$ or hits $-1$ before it reaches $1$, because the only square roots of $1$ mod a prime are $\\pm 1$. If the sequence reaches $1$ without passing through $-1$, or never reaches $1$ at all, $N$ is certainly composite. For composite $N$ at least $3/4$ of the bases expose it, so $k$ independent rounds leave an error probability of at most $4^{-k}$.',
            'In the widget, watch the powers of $a$ cycle, and check that the cycle length always divides $\\varphi(N)$. Then type an enormous exponent and see it collapse.'
          ],
          quiz: [
            {
              q: 'Compute $3^{100} \\bmod 7$.',
              opts: ['$3$', '$4$', '$1$', '$6$'],
              answer: 1,
              why: 'By Fermat, $3^6 \\equiv 1 \\pmod 7$, so reduce the exponent: $100 \\bmod 6 = 4$. Then $3^4 = 81 = 11 \\cdot 7 + 4$.'
            },
            {
              q: 'Which of these **cannot** be the order of an element of $\\Z_{11}^*$?',
              opts: ['$1$', '$2$', '$4$', '$10$'],
              answer: 2,
              why: '$|\\Z_{11}^*| = 10$, and by Lagrange every order divides $10$. The possible orders are $1, 2, 5, 10$, so $4$ is impossible.'
            }
          ]
        },
        {
          id: 'ch6-modexp',
          title: 'Fast exponentiation: square-and-multiply',
          widget: 'modexp',
          body: [
            'RSA decryption in Chapter 7 computes $y^d \\bmod N$ with $d$ around $2^{2048}$. Multiplying by $y$ one step at a time would take $2^{2048}$ steps, which is out of the question. Yet the computation takes milliseconds.',
            '**Square-and-multiply** reads the bits of $x$ from left to right. Start with $y = 1$. For each bit, square $y$; if the bit is $1$, also multiply by $g$. Reduce mod $N$ after every operation.',
            '*Why it works.* If the bits read so far spell the number $x\'$, then appending a bit $b$ gives $2x\' + b$. Squaring turns $g^{x\'}$ into $g^{2x\'}$, and the optional multiply adds the $b$. So the invariant "$y = g^{\\text{bits read so far}}$" holds at every step — the last column of the widget shows it.',
            '*Cost.* A $k$-bit exponent needs $k - 1$ squarings and at most $k - 1$ multiplications, and every number stays below $N^2$. That is polynomial in the bit length: about $3000$ multiplications of 2048-bit numbers, instead of $2^{2048}$.',
            '*A warning from practice.* Plain square-and-multiply does extra work exactly on the $1$ bits of the exponent. If the exponent is a secret key, the running time and power draw leak those bits. Kocher\'s 1996 timing attack recovered keys this way. Production code uses *constant-time* variants (such as the Montgomery ladder) that perform the same operations whatever the bits are.'
          ],
          quiz: [
            {
              q: 'In left-to-right square-and-multiply, after processing the bits $1011$ of the exponent, what is $y$?',
              opts: ['$g^{4}$', '$g^{1011}$', '$g^{11}$', '$g^{13}$'],
              answer: 2,
              why: 'The invariant is $y = g^{\\text{bits so far}}$, and $1011_2 = 11$. Step by step: $g^1 \\to g^2 \\to g^5 \\to g^{11}$.'
            },
            {
              q: 'About how many modular multiplications (squarings included) does square-and-multiply need for a 2048-bit exponent?',
              opts: ['About $2048$ to $4096$', 'About $2^{1024}$', 'About $2048^2$', 'About $2^{2048}$'],
              answer: 0,
              why: 'One squaring per bit plus one multiplication per $1$ bit: between $2047$ and $4094$. On average, about $3000$.'
            }
          ]
        },
        {
          id: 'ch6-crt',
          title: 'The Chinese Remainder Theorem',
          widget: 'crt',
          body: [
            '**Theorem (CRT).** Let $N_1, N_2$ be coprime and $N = N_1 N_2$. For any $r_1, r_2$ there is exactly one $x \\in \\Z_N$ with $$x \\equiv r_1 \\pmod{N_1}, \\qquad x \\equiv r_2 \\pmod{N_2}.$$ Equivalently, the map $x \\mapsto (x \\bmod N_1, \\; x \\bmod N_2)$ is a bijection from $\\Z_N$ to $\\Z_{N_1} \\times \\Z_{N_2}$. It also respects addition and multiplication, so arithmetic mod $N$ is the same as doing arithmetic mod $N_1$ and mod $N_2$ side by side.',
            '*Proof of existence.* Let $e_1 = N_2 \\cdot (N_2^{-1} \\bmod N_1)$ and $e_2 = N_1 \\cdot (N_1^{-1} \\bmod N_2)$. These inverses exist because the moduli are coprime. Then $e_1 \\equiv 1 \\pmod{N_1}$ and $e_1 \\equiv 0 \\pmod{N_2}$, and the other way round for $e_2$. So $x = r_1 e_1 + r_2 e_2$ works.',
            '*Proof of uniqueness.* If $x$ and $x\'$ both work, then $N_1$ and $N_2$ both divide $x - x\'$. Since they are coprime, $N_1 N_2$ divides $x - x\'$. (Write $x - x\' = kN_1$; then $N_2 \\mid kN_1$ with $\\gcd(N_1, N_2) = 1$, so $N_2 \\mid k$.) So $x \\equiv x\' \\pmod N$. $\\qed$',
            'The same works for any number of pairwise coprime moduli $N_1, \\ldots, N_k$ with $N = N_1 \\cdots N_k$: set $e_i = (N/N_i) \\cdot ((N/N_i)^{-1} \\bmod N_i)$ and $x = \\sum_i r_i e_i$. This version appears in multi-prime RSA and in Håstad\'s attack on textbook RSA with a small exponent sent to several recipients.',
            'In the widget, press **Count** and watch $x = 0, 1, 2, \\ldots$ travel diagonally through the grid, wrapping at the edges. With coprime moduli it fills every cell exactly once — that is the bijection. Then try $N_1 = 4$, $N_2 = 6$: the walk repeats after $\\lcm(4, 6) = 12$ steps, leaving cells empty and filling others twice.',
            '**Consequences.** $x$ is a unit mod $N$ exactly when it is a unit mod both $N_1$ and $N_2$, which gives $\\varphi(N_1 N_2) = \\varphi(N_1)\\varphi(N_2)$. In Chapter 7 the CRT does three more jobs. It **speeds up RSA**: the key holder computes $y^d$ separately mod $p$ and mod $q$, with half-size numbers and exponents reduced mod $p-1$ and $q-1$, then combines — about $4\\times$ faster. It **endangers RSA**: if a hardware fault corrupts just one of the two halves, the faulty result is still correct mod the other prime, and a single $\\gcd$ reveals that prime: $\\gcd(s - \\hat s, N)$ for a correct result $s$ and a faulty one $\\hat s$ (Boneh, DeMillo and Lipton, 1997), or even $\\gcd(\\hat s^e - m, N)$ from the faulty result alone (Lenstra). And it **completes the RSA correctness proof** for messages that are not units.'
          ],
          quiz: [
            {
              q: 'Find $x \\in \\Z_{15}$ with $x \\equiv 2 \\pmod 3$ and $x \\equiv 3 \\pmod 5$.',
              opts: ['$13$', '$8$', '$11$', '$2$'],
              answer: 1,
              why: 'The numbers $\\equiv 3 \\pmod 5$ are $3, 8, 13$. Of these, $8 \\equiv 2 \\pmod 3$. By the formula: $e_1 = 5 \\cdot 2 = 10$, $e_2 = 3 \\cdot 2 = 6$, $x = 2 \\cdot 10 + 3 \\cdot 6 = 38 \\equiv 8$.'
            },
            {
              q: 'Why does the system $x \\equiv 0 \\pmod 2$, $x \\equiv 1 \\pmod 4$ have no solution?',
              opts: [
                'It does have one: $x = 5$ satisfies both, because $5 \\equiv 1 \\pmod 4$ and $5 = 2 \\cdot 2 + 1$.',
                'The moduli share the factor $2$, and the conditions clash mod $2$: one makes $x$ odd, the other even.',
                'Because $4$ is not prime, and the CRT construction needs a prime modulus to compute the inverses $e_1, e_2$.',
                'Because $0$ is not a valid remainder, so the condition $x \\equiv 0 \\pmod 2$ must be rewritten first.'
              ],
              answer: 1,
              why: '$x \\equiv 1 \\pmod 4$ implies $x$ is odd, contradicting $x \\equiv 0 \\pmod 2$. With non-coprime moduli the CRT does not apply. A solution exists only if the remainders agree mod the gcd.'
            }
          ]
        },
        {
          id: 'ch6-cyclic',
          title: 'Cyclic groups, generators, and discrete logarithms',
          widget: 'generators',
          body: [
            'A group $G$ is **cyclic** if some $g \\in G$ has $\\langle g \\rangle = G$. Such a $g$ is a **generator**. Then every $h \\in G$ equals $g^x$ for exactly one $x \\in \\Z_{|G|}$, called the **discrete logarithm** $\\log_g h$. The map $x \\mapsto g^x$ turns addition of exponents into multiplication of elements, since $g^{x+y} = g^x g^y$. Diffie–Hellman and ElGamal are built on exactly this.',
            '**Fact.** For a prime $p$, the group $\\Z_p^*$ is cyclic, of order $p - 1$. (We state this without proof.) It has $\\varphi(p - 1)$ generators.',
            '**Testing a generator.** Given the prime factors of $p - 1$, $g$ is a generator if and only if $g^{(p-1)/q} \\neq 1$ for every prime $q \\mid p - 1$. *Proof.* If $\\ord(g) = m < p - 1$, then $m$ is a proper divisor of $p - 1$. Then $(p-1)/m > 1$, so it has some prime factor $q$. Since $q \\mid (p-1)/m$, we get $m \\mid (p-1)/q$, and so $g^{(p-1)/q} = 1$. Conversely, a generator has order $p - 1$, which divides none of these exponents. $\\qed$',
            '**Prime-order groups are the gold standard.** If $|G| = q$ is prime, Lagrange says every element has order $1$ or $q$. So *every* element except $1$ is a generator. Cryptography therefore works in a subgroup of large prime order $q$, not in all of $\\Z_p^*$. One common choice is a *safe prime* $p = 2q + 1$ with the subgroup of squares, which has order $q$. Elliptic-curve groups of prime order are the other.',
            'Why insist on prime order? The **Pohlig–Hellman** algorithm computes a discrete log in a group of order $m$ by solving one small log in a subgroup for each prime factor of $m$, then combining the answers with the CRT. If $p - 1$ has only small factors, discrete logs mod $p$ are easy, whatever the size of $p$. The difficulty is set by the *largest prime factor* of the group order.',
            'The **discrete log problem**: given $g$ and $h = g^x$, find $x$. Generic algorithms (baby-step giant-step, Pollard\'s rho) take about $\\sqrt{q}$ steps, so a 256-bit $q$ gives roughly 128-bit security. In $\\Z_p^*$ the special-purpose *index calculus* method is faster, which is why $p$ itself must be 2048 bits or more. On well-chosen elliptic curves no such shortcut is known, so 256-bit curves suffice. (Weak curve families, such as those with small embedding degree, do have shortcuts.)',
            'In the widget, tap elements to see the subgroup each one generates. Every subgroup size divides $p - 1$. Then take the discrete-log challenge, and press **Brute-force it** to watch the simplest method that works at this size.'
          ],
          quiz: [
            {
              q: 'How many generators does $\\Z_{13}^*$ have?',
              opts: ['$12$', '$6$', '$4$', '$1$'],
              answer: 2,
              why: '$\\Z_{13}^*$ is cyclic of order $12$, so it has $\\varphi(12) = 4$ generators. They are $2, 6, 7, 11$.'
            },
            {
              q: 'Why are discrete-log schemes run in a subgroup of large **prime** order $q$?',
              opts: [
                'Exponentiation is several times faster in a prime-order group, because square-and-multiply can skip the extra reductions modulo the many small prime factors of the group order, which saves real time.',
                'Pohlig–Hellman splits a discrete log into logs in subgroups of each prime-factor order, so the order needs a large prime factor; prime order also makes every element but $1$ a generator.',
                'Because $\\Z_p^*$ is not a group unless you remove the even elements, and what remains is exactly the subgroup of prime order.',
                'Because in a group of composite order some elements have no discrete logarithm at all, so the scheme could fail to decrypt.'
              ],
              answer: 1,
              why: 'The difficulty of a discrete log is governed by the largest prime factor of the group order. Prime order $q$ puts all of the difficulty in one place. As the next section shows, it also avoids a bit leak that breaks DDH.'
            }
          ]
        },
        {
          id: 'ch6-qr',
          title: 'Squares mod $p$, and a bit that leaks',
          widget: 'qr',
          body: [
            'An element $a \\in \\Z_p^*$ is a **quadratic residue** (a "square") if $a \\equiv x^2$ for some $x$. For an odd prime $p$, **exactly half** of $\\Z_p^*$ consists of squares. *Proof.* $x$ and $-x$ have the same square. Conversely, if $x^2 \\equiv y^2$ then $p \\mid (x - y)(x + y)$, so by Euclid\'s lemma $x \\equiv \\pm y$. And $x \\neq -x$ because $p$ is odd. So squaring is exactly two-to-one, and its image has $(p-1)/2$ elements. $\\qed$',
            'With a generator $g$: $g^x$ is a square **if and only if $x$ is even**. Even powers $g^{2k} = (g^k)^2$ are obviously squares. There are $(p-1)/2$ even exponents, which already accounts for all the squares.',
            '**Euler\'s criterion.** $a^{(p-1)/2} \\equiv 1$ if $a$ is a square, and $\\equiv -1$ otherwise. *Proof.* Write $a = g^x$. Then $a^{(p-1)/2} = g^{x(p-1)/2}$, which is $1$ exactly when $p - 1 \\mid x(p-1)/2$, that is, when $x$ is even. Its square is $a^{p-1} = 1$, and the only square roots of $1$ mod a prime are $\\pm 1$. $\\qed$',
            'Look at what that means. One fast exponentiation tells anyone whether $\\log_g h$ is even or odd. **The lowest bit of every discrete log in $\\Z_p^*$ leaks.**',
            'This is the flaw that makes **DDH easy in the full group $\\Z_p^*$**, as Chapter 7 mentions. From $g^x$ and $g^y$, an attacker learns the parities of $x$ and $y$, hence the parity of $xy$, hence whether $g^{xy}$ is a square. A random $Z$ passes that check only half the time, so the attacker tells "real" from "random" with advantage $\\tfrac12$. The fix is to work in the subgroup of squares of a safe prime $p = 2q + 1$. That subgroup has prime order $q$, every element in it is a square, and the test reveals nothing.',
            '**Notation.** The *Legendre symbol* $\\left(\\frac{a}{p}\\right)$ is $+1$ if $a$ is a square mod $p$ and $-1$ if not (and $0$ if $p \\mid a$). Euler\'s criterion says $\\left(\\frac{a}{p}\\right) \\equiv a^{(p-1)/2} \\pmod p$. For $N = pq$ the *Jacobi symbol* is the product $\\left(\\frac{a}{N}\\right) = \\left(\\frac{a}{p}\\right)\\left(\\frac{a}{q}\\right)$. Surprisingly, it can be computed quickly *without* knowing $p$ and $q$, by a Euclid-like algorithm based on quadratic reciprocity.',
            '**Taking square roots.** Modulo a prime $p \\equiv 3 \\pmod 4$ it is one exponentiation: if $a$ is a square, $x = a^{(p+1)/4}$ works, since $x^2 = a^{(p+1)/2} = a \\cdot a^{(p-1)/2} \\equiv a$ by Euler\'s criterion. (Other primes need the Tonelli–Shanks algorithm.) Modulo $N = pq$ a square has **four** square roots: combine $\\pm x_p$ (the roots mod $p$) with $\\pm x_q$ (the roots mod $q$) using the CRT. Two roots $x, y$ with $x \\neq \\pm y$ factor $N$: $N$ divides $x^2 - y^2 = (x - y)(x + y)$ but neither factor, so $\\gcd(x - y, N)$ is $p$ or $q$. That is why computing square roots mod $N$ is exactly as hard as factoring (Rabin, 1979).',
            'Modulo a composite $N = pq$ the situation flips. Deciding whether a number is a square mod $N$ (when its Jacobi symbol is $+1$) is believed to be hard unless you know $p$ and $q$. That is the *quadratic residuosity assumption*. It underlies Goldwasser–Micali (1982), the first encryption scheme with a proof of semantic security.'
          ],
          quiz: [
            {
              q: 'How many quadratic residues are there in $\\Z_{13}^*$?',
              opts: ['$12$', '$6$', '$4$', '$3$'],
              answer: 1,
              why: 'Exactly half of the $12$ units: $\\{1, 3, 4, 9, 10, 12\\}$.'
            },
            {
              q: 'Given only $g$ and $h = g^x$ in $\\Z_p^*$ ($g$ a generator), what can anyone compute efficiently about $x$?',
              opts: [
                'Nothing at all, since that would contradict the discrete log assumption.',
                'Whether $x$ is even, by checking whether $h^{(p-1)/2} \\equiv 1$.',
                'All of $x$, by applying Euler\'s criterion bit by bit.',
                'Whether $x$ is prime, by checking whether $h^{x} \\equiv h$.'
              ],
              answer: 1,
              why: 'Euler\'s criterion detects squares, and $g^x$ is a square exactly when $x$ is even. This leaked bit is why DDH fails in $\\Z_p^*$ and why schemes use a prime-order subgroup.'
            }
          ]
        },
        {
          id: 'ch6-hard',
          title: 'Easy and hard: the gap public-key cryptography lives in',
          widget: 'factor',
          body: [
            '**Easy** — polynomial time in the bit length $k$. Addition (about $k$ bit operations), multiplication and reduction (about $k^2$). $\\gcd$, Bézout and inverses (Euclid, about $k^2$). Modular exponentiation (square-and-multiply, about $k^3$). The CRT. **Primality testing**: Miller–Rabin is fast and its error probability falls below $4^{-t}$ after $t$ rounds; AKS (2002) is even deterministic. **Generating random primes**: test random candidates; by the prime number theorem you need only a few hundred tries. **Square roots modulo a prime**: the Tonelli–Shanks algorithm.',
            '**Believed hard** — no polynomial-time algorithm known, for well-chosen parameters. **Factoring** $N = pq$. **Computing $\\varphi(N)$** — equivalent to factoring, as shown in the section on groups. **Square roots mod $N = pq$** — also equivalent to factoring (Rabin). The **RSA problem**: given $N, e, y$, find $x$ with $x^e \\equiv y$. **Discrete log** in a prime-order subgroup, together with its relatives **CDH** and **DDH**. **Quadratic residuosity** mod $N$.',
            'The relationships run one way. If you can factor, you can compute $\\varphi(N)$ and then $d$, so you can solve the RSA problem. If you can take discrete logs, you can solve CDH, and if you can solve CDH you can solve DDH. None of the converses is known in general. And **none of these problems is proven hard**: a proof would settle P vs NP and more. They are *assumptions* that have survived decades of attack. That is why the strongest statement in Chapter 7 is a reduction: "anyone who breaks this scheme can solve problem $X$."',
            'For scale: the record for factoring an RSA-style modulus is RSA-250, an 829-bit number, factored in 2020 using about 2700 core-years of computing with the number field sieve. A 2048-bit modulus is estimated at roughly 112-bit security, and 3072 bits at 128. A large quantum computer running **Shor\'s algorithm** would factor and take discrete logs in polynomial time. That is why post-quantum schemes based on other problems are now being deployed.',
            'Feel the asymmetry for yourself. The widget multiplies two random primes instantly, then factors the product the obvious way, by trial division. Add a digit to the primes and watch the work grow tenfold.'
          ],
          quiz: [
            {
              q: 'Which of these is computationally **easy** for 2048-bit inputs?',
              opts: [
                'Factoring $N = pq$.',
                'Computing $\\varphi(N)$ from $N = pq$ alone.',
                'Computing $\\gcd(a, b)$ and $a^{-1} \\bmod b$.',
                'Computing a discrete log in a 2048-bit prime-order group.'
              ],
              answer: 2,
              why: 'Euclid and extended Euclid take a number of steps linear in the bit length. The other three are believed hard; computing $\\varphi(N)$ is equivalent to factoring.'
            },
            {
              q: 'If someone had a fast factoring algorithm, what would happen to RSA?',
              opts: [
                'Nothing directly, because RSA security rests on the RSA problem ($e$-th roots), not on factoring itself.',
                'It would be broken: factor $N$, compute $\\varphi(N) = (p-1)(q-1)$, then $d = e^{-1} \\bmod \\varphi(N)$.',
                'Only RSA signatures would be affected, since encryption also depends on the padding scheme being secure.',
                'Keys would need to double in length, since factoring speed-ups only shave a constant off the exponent.'
              ],
              answer: 1,
              why: 'Factoring gives $\\varphi(N)$, and extended Euclid then gives the secret exponent. So RSA is at most as hard as factoring. Whether it is exactly as hard is open.'
            }
          ]
        },
        {
          id: 'ch6-practice',
          title: 'Practice until it is automatic',
          widget: 'nt-practice',
          body: [
            'Fluency with these computations is what lets you follow — and write — the proofs in Chapter 7 without getting lost in the arithmetic. The practice widget below generates endless problems on every topic in this chapter, each with a worked solution. Pick a topic you are unsure of, or leave it on *Mixed*. Your best streak is saved on this device.',
            'Habits that save marks on exams. **Reduce early**, before multiplying. **Check every inverse** by multiplying it back. **Reduce exponents first** with Fermat or Euler, and only then square-and-multiply. **Sanity-check orders**: by Lagrange, every order divides the group order. **Show the table** for extended Euclid: graders give credit for the method even when the arithmetic slips.'
          ]
        }
      ],
      mastery: [
        {
          q: 'What is $5^{-1} \\bmod 17$?',
          opts: ['$7$', '$12$', '$3$', '$10$'],
          answer: 0,
          why: '$5 \\cdot 7 = 35 = 2 \\cdot 17 + 1$. Extended Euclid: $17 = 3 \\cdot 5 + 2$, $5 = 2 \\cdot 2 + 1$, so $1 = 5 - 2 \\cdot 2 = 5 - 2(17 - 3 \\cdot 5) = 7 \\cdot 5 - 2 \\cdot 17$.'
        },
        {
          q: 'What is $\\varphi(77)$?',
          opts: ['$76$', '$60$', '$18$', '$70$'],
          answer: 1,
          why: '$77 = 7 \\cdot 11$, so $\\varphi(77) = 6 \\cdot 10 = 60$.'
        },
        {
          q: 'Compute $2^{1000} \\bmod 11$.',
          opts: ['$2$', '$10$', '$1$', '$0$'],
          answer: 2,
          why: 'By Fermat, $2^{10} \\equiv 1 \\pmod{11}$, and $1000 = 100 \\cdot 10$. So $2^{1000} = (2^{10})^{100} \\equiv 1$.'
        },
        {
          q: 'Which $x \\in \\Z_{20}$ satisfies $x \\equiv 1 \\pmod 4$ and $x \\equiv 2 \\pmod 5$?',
          opts: ['$13$', '$17$', '$7$', '$12$'],
          answer: 1,
          why: 'Numbers $\\equiv 2 \\pmod 5$: $2, 7, 12, 17$. Only $17 \\equiv 1 \\pmod 4$. The CRT guarantees it is the only one in $\\Z_{20}$.'
        },
        {
          q: 'Which statement about $\\Z_{23}^*$ is **false**?',
          opts: [
            'Every element\'s order divides $22$.',
            'It has exactly $\\varphi(22) = 10$ generators.',
            'Exactly $11$ of its elements are squares.',
            'It contains an element of order $4$.'
          ],
          answer: 3,
          why: 'The group has order $22 = 2 \\cdot 11$. By Lagrange, every order is one of $1, 2, 11, 22$, so no element has order $4$. The other three statements are true.'
        },
        {
          q: 'RSA key generation computes $d = e^{-1} \\bmod \\varphi(N)$ easily, yet recovering $d$ from the public $(N, e)$ is believed hard. Why the difference?',
          opts: [
            'Key generation runs extended Euclid on $e$ and $N$, which is fast; an attacker would instead have to search through all possible $d$.',
            'Key generation knows $p, q$ and hence $\\varphi(N) = (p-1)(q-1)$; computing $\\varphi(N)$ without them is as hard as factoring.',
            'Inverses mod $\\varphi(N)$ are only unique when $e$ is prime, so an attacker cannot tell which of the many candidate values of $d$ is correct.',
            'Key generation picks $d$ first and derives $e$ from it, so $d$ never has to be computed from $e$ at all.'
          ],
          answer: 1,
          why: 'The inverse is easy once you know the modulus $\\varphi(N)$. But $\\varphi(N)$ together with $N$ reveals $p + q$ and hence $p$ and $q$. So computing it is exactly as hard as factoring.'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    /* Chapter 7 — Public-Key Encryption                                   */
    /* ------------------------------------------------------------------ */
    {
      id: 'ch7',
      num: 7,
      title: 'Public-Key Encryption',
      book: 'Bellare & Rogaway, Chapter 11 (Asymmetric Encryption), using the Diffie–Hellman assumptions from Chapter 10.',
      blurb: 'RSA, ElGamal, and provable security in the public-key setting.',
      sections: [
        {
          id: 'ch7-setting',
          title: 'Encryption without a shared secret',
          body: [
            'Everything so far assumed Alice and Bob already share a secret key. On the internet, they usually have never met. Public-key encryption removes the assumption: Bob publishes a **public key** $pk$ that anyone may use to encrypt, and keeps a matching **secret key** $sk$ that only he can use to decrypt.',
            'A public-key encryption scheme $\\mathcal{AE} = (\\mathcal{K}, \\mathcal{E}, \\mathcal{D})$ ($\\mathcal{AE}$ for *asymmetric* encryption, as in B&R) has key generation $\\mathcal{K}$ outputting a pair $(pk, sk)$, encryption $\\mathcal{E}_{pk}(M)$, and decryption $\\mathcal{D}_{sk}(C)$. Correctness is the same as before: $\\mathcal{D}_{sk}(\\mathcal{E}_{pk}(M)) = M$ for every key pair output by $\\mathcal{K}$, every message, and whatever coins encryption uses.',
            'The IND-CPA game carries over almost unchanged, with one simplification: the adversary is given $pk$, so it can encrypt anything it likes on its own — the "chosen-plaintext" part comes for free. It is enough to give it a single left-or-right query. Picture switching $q$ answers from left to right one at a time. Each switch is a one-query game, because the adversary can produce the other ciphertexts itself using $pk$. So $q$ queries multiply the advantage by at most $q$. (This one-at-a-time technique is called a *hybrid argument*; it has nothing to do with "hybrid encryption" later in the chapter.)',
            'The deterministic-encryption problem is now even more severe. If $\\mathcal{E}_{pk}$ is deterministic, the adversary does not even need two ciphertexts. Given a ciphertext $C$ and two candidate messages, it encrypts both candidates with $pk$ and sees which matches. So **every secure public-key encryption scheme must be randomized**. Keeping a counter no longer helps either: encryptors are many independent strangers who share no state, and the adversary can always run $\\mathcal{E}_{pk}$ itself.'
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
          id: 'ch7-numbers',
          title: 'Recap: the number theory you need',
          body: [
            'Chapter 6 built all the number theory this chapter uses. The short version: $\\Z_N^*$ is the set of $a \\in \\Z_N$ with $\\gcd(a, N) = 1$. It is a group under multiplication mod $N$, of order $\\varphi(N)$. For a prime $p$, $\\varphi(p) = p - 1$. For $N = pq$ with distinct primes, $\\varphi(N) = (p-1)(q-1)$.',
            '**Euler\'s theorem**: $a^{\\varphi(N)} \\equiv 1 \\pmod N$ for $a \\in \\Z_N^*$, so exponents can be reduced mod $\\varphi(N)$. **Easy**: modular exponentiation (square-and-multiply) and inverses (extended Euclid). **Believed hard**: factoring $N = pq$, computing $\\varphi(N)$ without the factors, and discrete logarithms in a large prime-order group. If any of this feels shaky, work through the widgets in Chapter 6 first.'
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
          id: 'ch7-rsa',
          title: 'RSA: a trapdoor permutation',
          anim: 'rsa-trapdoor',
          body: [
            'RSA key generation picks two large random primes $p, q$, sets $N = pq$, and chooses an exponent $e$ coprime to $\\varphi(N)$. It then computes $d$ with $ed \\equiv 1 \\pmod{\\varphi(N)}$, using the extended Euclidean algorithm (Chapter 6). The public key is $(N, e)$; the secret key is $(N, d)$.',
            'The RSA function on $\\Z_N^*$ is $f(x) = x^e \\bmod N$ and its inverse is $f^{-1}(y) = y^d \\bmod N$. They really are inverses: $(x^e)^d = x^{ed} = x^{1 + k\\varphi(N)} = x \\cdot (x^{\\varphi(N)})^k \\equiv x \\pmod N$ by Euler\'s theorem. (Euler\'s theorem covers $x \\in \\Z_N^*$. For *every* $x \\in \\Z_N$, use the CRT from Chapter 6: it is enough to check $x^{ed} \\equiv x$ mod $p$ and mod $q$ separately. Mod $p$: if $p \\mid x$ both sides are $0$; otherwise $ed = 1 + k(p-1)(q-1)$ and Fermat gives $x^{ed} = x \\cdot (x^{p-1})^{k(q-1)} \\equiv x$. The same argument works mod $q$.)',
            'A tiny example: $p = 5$, $q = 11$, so $N = 55$ and $\\varphi(N) = 40$. Take $e = 3$; then $d = 27$, since $3 \\cdot 27 = 81 = 2 \\cdot 40 + 1$ (found with extended Euclid, Chapter 6). Applying $f$ to $x = 7$ gives $7^3 = 343 \\equiv 13 \\pmod{55}$. Applying $f^{-1}$ gives $13^{27} \\bmod 55 = 7$.',
            'Anyone can compute $f$. Knowing $d$ (or the factors $p, q$) lets you invert $f$, and recovering $d$ from $(N, e)$ is provably as hard as factoring $N$. But nobody has proved that inverting $f$ *without* finding $d$ requires factoring — that is why we state the RSA assumption separately below. So $f$ is a **trapdoor permutation**: a permutation that is easy in one direction for everyone, and easy in the other direction only for whoever holds the trapdoor $d$.',
            'The **RSA assumption** is that, for a random $y \\in \\Z_N^*$, no efficient adversary given $(N, e, y)$ can find $x$ with $x^e \\equiv y \\pmod N$. Real moduli are 2048 bits or more; $2^{2048}$ is a 617-digit number.'
          ],
          quiz: [
            {
              q: 'Why does $(x^e)^d \\equiv x \\pmod N$ hold?',
              opts: [
                'Because $e = d$.',
                'Because $ed = 1 + k\\varphi(N)$ for some $k$, and $x^{\\varphi(N)} \\equiv 1$ for $x \\in \\Z_N^*$ by Euler\'s theorem.',
                'Because $N$ is prime.',
                'Because exponentiation is commutative.'
              ],
              answer: 1,
              why: 'The exponent $ed$ is $1$ more than a multiple of $\\varphi(N)$. Every full multiple of $\\varphi(N)$ in the exponent contributes a factor of $1$, leaving $x^1$.'
            }
          ]
        },
        {
          id: 'ch7-textbook',
          title: 'Why "textbook RSA" is not secure encryption',
          body: [
            'The tempting scheme is to encrypt by $C = M^e \\bmod N$ and decrypt by $M = C^d \\bmod N$. This is called **textbook RSA**, and it is not a secure encryption scheme.',
            'It is deterministic, so by the argument at the start of this chapter it is not IND-CPA secure: given $C$, encrypt both candidate messages and compare.',
            'It is also **malleable**. Given $C = M^e \\bmod N$, anyone can compute $C \\cdot 2^e \\bmod N = (2M)^e \\bmod N$, a valid encryption of $2M$, without knowing $M$. In a protocol where the adversary can see decryptions of modified ciphertexts, this leaks the plaintext.',
            'And the RSA assumption only says it is hard to invert $f$ on a *random* input. Real messages are not random: they are short, structured, or guessable. If $M$ is a small number and $e = 3$, then $M^3$ may be less than $N$, and the "encryption" can be undone with an ordinary cube root.',
            'Secure RSA encryption first transforms the message with randomized padding. **RSA-OAEP**, the standardized method, applies two hash-based mixing rounds with fresh randomness before applying $f$. It is proved IND-CCA secure (secure even when the adversary can see decryptions of other ciphertexts; defined at the end of this chapter) under the RSA assumption, in the random oracle model. The original 1994 proof had a gap, found by Shoup in 2001 and repaired for RSA soon after — a good lesson in why proofs get checked.'
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
          id: 'ch7-elgamal',
          title: 'Diffie–Hellman and ElGamal',
          body: [
            'Let $G$ be a cyclic group of prime order $q$ with generator $g$ — for example, a prime-order subgroup of $\\Z_p^*$ or an elliptic-curve group.',
            'The **Diffie–Hellman key exchange** (1976) is where these problems come from. Alice picks a secret $x$ and sends $g^x$; Bob picks a secret $y$ and sends $g^y$. Both can now compute $g^{xy}$: Alice as $(g^y)^x$, Bob as $(g^x)^y$. An eavesdropper sees only $g^x$ and $g^y$. Is that enough to find $g^{xy}$?',
            'Three problems in $G$ form a hierarchy. **DL**: given $g^x$, find $x$. **CDH**: given $g^x$ and $g^y$, compute $g^{xy}$. **DDH**: given $g^x$, $g^y$, and $Z$, decide whether $Z = g^{xy}$ or $Z$ is a random group element.',
            'Solving DL lets you solve CDH, and solving CDH lets you solve DDH, so DDH is the strongest assumption of the three. In some groups DDH is easy even though DL is hard. In the full group $\\Z_p^*$ one can efficiently test whether an element is a square (Euler\'s criterion, Chapter 6), and $g^{xy}$ is a square exactly when $xy$ is even — which is computable from $g^x$ and $g^y$. A random $Z$ passes this test only half the time, so DDH is easy there. That is why schemes use prime-order subgroups.',
            '**ElGamal encryption.** The secret key is a random $x \\in \\Z_q$, and the public key is $X = g^x$. To encrypt a group element $M$, pick a random $y \\in \\Z_q$ and output $(Y, W) = (g^y, \\; X^y \\cdot M)$. To decrypt, compute $W \\cdot (Y^x)^{-1}$. Since $Y^x = g^{xy} = X^y$, the mask cancels. (Encoding a message as a group element is awkward; in practice $X^y$ is instead hashed into a symmetric key — "hashed ElGamal" — which leads to the hybrid encryption section below.)',
            '**Theorem.** For any IND-CPA adversary $A$ against ElGamal there is a DDH adversary $B$, about as efficient, with $\\Adv^{\\mathrm{ind-cpa}}(A) \\le 2 \\, \\Adv^{\\mathrm{ddh}}(B)$.',
            'Proof idea: we only handle one left-or-right query, which is enough by the remark at the start of the chapter. $B$ gets a DDH challenge $(g^x, g^y, Z)$. It sets $pk = g^x$, picks a random bit $b$ of its own, answers the left-or-right query with $(g^y, Z \\cdot M_b)$, and outputs $1$ if $A$ guesses $b$. If $Z = g^{xy}$, this is a real encryption and $A$ is correct with probability $\\tfrac12 + \\tfrac12 \\Adv(A)$. If $Z$ is a random group element, then $Z \\cdot M_b$ is uniform no matter what $M_b$ is — a one-time pad in the group — and $A$ is correct with probability exactly $\\tfrac12$. The gap between these cases, $\\tfrac12 \\Adv(A)$, is $B$\'s DDH advantage. $\\qed$'
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
          id: 'ch7-hybrid',
          title: 'Putting it together: hybrid encryption',
          body: [
            'Public-key operations are slow — thousands of times slower than a block cipher — and schemes like ElGamal only encrypt a single group element. Nobody encrypts a video file with RSA.',
            'Instead, systems use **hybrid encryption**. To send $M$ to Bob: pick a fresh random symmetric key $K$; encrypt $K$ under Bob\'s public key (or, equivalently, derive $K$ together with an encapsulation of it, as below); encrypt $M$ under $K$ with an authenticated symmetric scheme (Chapter 4\'s Encrypt-then-MAC, or GCM). Bob decrypts $K$ with $sk$, then decrypts $M$ with $K$.',
            'Formally, a **key encapsulation mechanism** (KEM) outputs a fresh key $K$ and an encapsulation $C_1$ that only $sk$ can open — for example $C_1 = g^y$ and $K = H(X^y)$, which is hashed ElGamal. A **data encapsulation mechanism** (DEM) encrypts $M$ under $K$. Since each $K$ is used only once, the DEM only needs one-time security. The KEM/DEM theorem bounds the combined scheme\'s advantage by a small multiple of the KEM\'s advantage plus the DEM\'s — another reduction in the now-familiar pattern.',
            'PGP, HPKE (RFC 9180) and age use hybrid encryption directly. TLS 1.3 and Signal use the closely related Diffie–Hellman key exchange to agree on $K$, then the same symmetric machinery. Either way, it uses every chapter of this course: number theory for the public-key step (Chapter 6), a hash function to derive keys (Chapter 5), a MAC for integrity (Chapter 4), a PRF-based symmetric scheme for bulk data (Chapter 3), and a public-key primitive to establish the key in the first place.',
            'Finally, a word on stronger attacks. Real adversaries can often send modified ciphertexts and observe how the receiver reacts — an error message, a timing difference. Bleichenbacher\'s 1998 "million-message" attack decrypted SSL key-exchange ciphertexts by sending about a million modified ciphertexts and watching whether the server reported a padding error. The padding scheme (PKCS #1 v1.5) had no security proof, and certainly none against such attacks. The modern target is **IND-CCA** security, where the adversary may also ask for decryptions of any ciphertext other than its challenge. RSA-OAEP achieves it (in the random oracle model), and so does hybrid encryption when *both* the KEM is CCA-secure and the DEM is authenticated.'
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
          why: 'Hybrid encryption uses one public-key operation to transport a symmetric key, then fast symmetric encryption for everything else. It is provably secure when both the KEM and the DEM meet the required security notions.'
        }
      ]
    }
  ];
}());
