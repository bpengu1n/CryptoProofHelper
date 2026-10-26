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
      prereq: ['#/primer/why-prove', '#/primer/reduction-idea'],
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
          see: ['#/primer/reduction-idea', '#/learn/reduction'],
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
                'No adversary has broken it, even after years of public analysis by experts.',
                'Any efficient attack on it could be turned into a solver for a problem believed hard.',
                'Its keys are long enough that trying every key would outlast the universe.',
                'A standards body has reviewed its design in detail and approved it for sensitive data.'
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
            'The key $K$ is publicly known, so anyone can decrypt but only the sender encrypts.',
            'The adversary can compute $K$ from enough ciphertexts, so keys must change often.',
            'Encryption and decryption always use two different keys, one public and one private.'
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
            'Counterexample showing $\\mathcal{E}$ falls to anyone with enough computing power.',
            'Reduction: breaking $\\mathcal{E}$ is at least as hard as factoring.',
            'Proof that factoring large integers is computationally hard.',
            'Attack on $\\mathcal{E}$ that recovers the key by factoring a modulus.'
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
      prereq: ['#/primer/probability', '#/primer/counting'],
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
                'A permutation cannot send two different letters (A and R) to the same letter (Y).',
                'The letter F cannot map to X under any permutation of the 26-letter alphabet.',
                'XYY is not a valid ciphertext, because the cipher never outputs repeated letters.'
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
          see: ['#/proofs/otp', '#/learn/infotheoretic'],
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
                'There are $2^m$ ciphertexts, and encryption picks one of them uniformly at random.',
                'Exactly one key, $M \\oplus C$, maps $M$ to $C$, and it has probability $1/2^m$.',
                'XOR of any two bit strings always produces a uniformly distributed output.',
                'The key and the message have the same length $m$, so their probabilities match.'
              ],
              answer: 1,
              why: 'For fixed M and C, the equation K⊕M=C has exactly one solution: K=M⊕C. Since K is uniform over 2^m values, that specific key appears with probability 1/2^m. This is true for every M, giving equal probabilities across all messages.'
            },
            {
              q: 'The key-length lower bound says $|\\mathcal{K}| \\geq |\\mathcal{M}|$ for any perfectly secure cipher. What forces this?',
              opts: [
                'Longer keys take longer to brute-force, and perfect security must resist any search.',
                'Every message must be able to produce a given ciphertext, each with its own key.',
                'XOR only works correctly when the key and message have exactly equal length.',
                'Shannon derived it from the entropy of English text, which bounds the key size.'
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
            'The key space of $26!$ is too small to resist brute-force search on modern hardware.',
            'It preserves the plaintext\'s letter-frequency pattern in the ciphertext.',
            'The decryption algorithm is public, so anyone can run it on a ciphertext.',
            'The permutation can be read off directly from any single ciphertext letter.'
          ],
          answer: 1,
          why: 'Key-space size is necessary but not sufficient for security. A substitution cipher maps each plaintext letter to a fixed ciphertext letter, so English letter frequencies survive intact. Frequency analysis exploits this — no brute force needed.'
        },
        {
          q: 'What makes the one-time pad "one-time"?',
          opts: [
            'Each pad encrypts only a single bit, so long messages need many pads.',
            'The key may encrypt only one message; reuse leaks $M_0 \\oplus M_1$.',
            'A new encryption algorithm must be designed for every message sent.',
            'The paper pad must be physically destroyed after use so it cannot be stolen.'
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
            'An efficient algorithm that, given any ciphertext $C$ produced by the cipher, outputs the key $K$ that was used.',
            'A pair of plaintexts $M_0, M_1$ and a ciphertext $C$ where $\\Pr[\\mathcal{E}_K(M_0)=C] \\neq \\Pr[\\mathcal{E}_K(M_1)=C]$.',
            'A published attack that recovers plaintexts faster than brute force does.',
            'That $|\\mathcal{K}| \\ge |\\mathcal{M}|$ fails for the cipher, i.e. that it has more keys than possible messages.'
          ],
          answer: 1,
          why: 'Perfect security requires equal ciphertext distributions for every message pair. One counterexample — one pair M0, M1 and one C with unequal probabilities — suffices to disprove it entirely. The substitution cipher proof found exactly such a triple: FEE, FAR, XYY.'
        },
        {
          q: 'For the OTP over $m$-bit messages, the key-length lower bound says $|\\mathcal{K}| \\geq |\\mathcal{M}|$. What are these values?',
          opts: [
            '$|\\mathcal{K}| = m$ and $|\\mathcal{M}| = m$, since both are $m$-bit strings.',
            '$|\\mathcal{K}| = |\\mathcal{M}| = 2^m$, so the OTP meets the bound exactly.',
            '$|\\mathcal{K}| = 26!$ and $|\\mathcal{M}| = 26^m$, as for a substitution cipher.',
            '$|\\mathcal{K}| > 2^m$, so the OTP uses more key than the bound requires.'
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
      blurb: 'Pseudorandom functions, the IND-CPA game, and why counter mode is secure while ECB is not.',
      prereq: ['#/primer/adversary', '#/primer/game', '#/basics/advantage'],
      sections: [
        {
          id: 'ch3-computational',
          title: 'From perfect to computational security',
          see: ['#/basics/negligible', '#/basics/ppt'],
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
                'Short keys can always be guessed by trying every possible value quickly.',
                'It needs $|\\mathcal{K}| \\ge |\\mathcal{M}|$, and here messages far outnumber keys.',
                'Perfect security is a property of the one-time pad alone, and no other scheme can ever have it.',
                'Computationally bounded adversaries can break any perfectly secure scheme.'
              ],
              answer: 1,
              why: 'The key-length lower bound from Chapter 2 applies to the total amount of data encrypted under one key. A 128-bit key cannot cover gigabytes of plaintext, so perfect security is impossible and we fall back to computational security.'
            }
          ]
        },
        {
          id: 'ch3-prf',
          title: 'Block ciphers and pseudorandom functions',
          see: ['#/learn/switching'],
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
                'It has recovered the key $K$, the only way to win the PRF game.',
                'It can reliably tell whether its oracle is $F_K$ or a random function.',
                'It can invert $F_K$, finding an input for any output it is given.',
                'It has found two different inputs on which $F_K$ gives the same output.'
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
                'Deterministic algorithms are too slow for encrypting large volumes of data.',
                'Otherwise equal messages give equal ciphertexts, revealing which ones repeat.',
                'Decryption needs the encryption randomness, which is sent along with the key.',
                'A deterministic block cipher would otherwise leak its key after many messages.'
              ],
              answer: 1,
              why: 'Equality of plaintexts is information. A deterministic stateless scheme maps equal plaintexts to equal ciphertexts, so an adversary learns which messages repeat — a violation of any reasonable privacy definition.'
            }
          ]
        },
        {
          id: 'ch3-indcpa',
          title: 'The IND-CPA game',
          see: ['#/basics/indist', '#/primer/game'],
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
                'It cannot; the oracle only encrypts messages that it picks at random itself.',
                'It queries $(M, M)$: whichever side is chosen, the result encrypts $M$.',
                'It asks the oracle for the key $K$ and then encrypts $M$ on its own.',
                'It submits $M$ to a separate encryption oracle that the game also provides.'
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
                'Whether the ciphertext has length $2n$, which only the left message gives.',
                'Whether its two ciphertext blocks are equal, which happens only for $M_0$.',
                'Whether the first ciphertext block is $0^n$, since ECB maps zeros to zeros.',
                'Whether the ciphertext decrypts to $M_0$ under a key it has guessed.'
              ],
              answer: 1,
              why: 'ECB encrypts equal blocks to equal ciphertext blocks. $M_0$ has two equal blocks and $M_1$ has two different blocks, and since $E_K$ is a permutation, different blocks always give different ciphertexts. So the check succeeds with probability 1.'
            }
          ]
        },
        {
          id: 'ch3-ctr-proof',
          title: 'Proving CTR mode secure',
          see: ['#/proofs/prf-ctr', '#/learn/gamehop', '#/learn/badevent', '#/basics/birthday'],
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
                'It searches for $K$ by brute force, then passes $K$ to $A$ to finish the attack.',
                'It picks $b$, runs $A$, builds the pads from its own oracle, and outputs $1$ if $A$ guesses $b$.',
                'It ignores $A$ and outputs a random bit, which already wins the PRF game.',
                'It replaces each of $A$\'s messages with a fresh random string of the same length and outputs whatever $A$ outputs.'
              ],
              answer: 1,
              why: 'The reduction simulates the encryption game for $A$ using its oracle in place of $F_K$. It must pick $b$ itself, since it has to know which message to encrypt. If the oracle is $F_K$, $A$ sees the real scheme; if it is random, $A$ sees the idealized scheme. Any difference in how often $A$ guesses $b$ becomes $B$\'s distinguishing advantage.'
            },
            {
              q: 'Why does the bound include a term like $\\sigma^2 / 2^n$?',
              opts: [
                'Because AES has a known structural weakness after about $2^{n/2}$ queries.',
                'In the ideal scheme $A$ wins only if counter values collide, and collisions grow like $\\sigma^2$.',
                'Because the key has $n$ bits, so a brute-force key search succeeds after about $\\sigma^2$ guesses on average.',
                'Because every message must be padded to a multiple of $n$ bits before encryption.'
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
            'The ciphertext reveals no information at all, even to an unbounded adversary.',
            'Every adversary with realistic time and queries has only tiny advantage.',
            'The key is longer than all the messages encrypted under it put together.',
            'No attack on the scheme has been published after years of scrutiny.'
          ],
          answer: 1,
          why: 'Computational security bounds the advantage of resource-limited adversaries. It does not claim information is absent — only that it cannot be used without enormous effort.'
        },
        {
          q: 'An encryption scheme is deterministic and stateless. What can be said about its IND-CPA security?',
          opts: [
            'It is secure, provided its block cipher is a secure PRF.',
            'A two-query adversary has advantage $1$, so it is not IND-CPA secure.',
            'Its best adversary has advantage exactly $1/2$, so it is half secure.',
            'It is secure only if its key is at least 256 bits long.'
          ],
          answer: 1,
          why: 'Query $(M, M)$, then $(M, M\')$. The ciphertexts match exactly when $b = 0$. Determinism alone is enough to break IND-CPA, regardless of how strong the block cipher is.'
        },
        {
          q: 'Why does the left-or-right game require $|M_0| = |M_1|$?',
          opts: [
            'Block ciphers accept only fixed-length input, so longer messages cannot be encrypted.',
            'Encryption usually reveals length, so the definition hides everything but length.',
            'Otherwise the adversary could put the same message on both sides of a pair.',
            'To keep the advantage formula well-defined when ciphertext lengths differ.'
          ],
          answer: 1,
          why: 'Ciphertext length tracks plaintext length in practice. Without the restriction, any scheme whose ciphertext length depends on the message length would fail trivially by querying a short and a long message.'
        },
        {
          q: 'Counter mode uses $F_K$ only in the forward direction. What does that allow?',
          opts: [
            'Using any PRF, not just a block cipher, and computing blocks in parallel.',
            'Encrypting without a key, since the forward direction of $F$ is public.',
            'Skipping the random starting value, since counters are never reused anyway.',
            'Avoiding the birthday bound, since $F_K$ never needs to be inverted.'
          ],
          answer: 0,
          why: 'Decryption in CTR recomputes the same pad and XORs again, so $F_K$ never needs to be inverted. Each pad block depends only on its counter value, so blocks can be computed in parallel.'
        },
        {
          q: 'In the CTR security bound, what would make the right-hand side large even if AES is a perfect PRF?',
          opts: [
            'Switching from a 128-bit key to a 256-bit key with the same block size.',
            'Encrypting close to $2^{64}$ blocks under one key, with $n = 128$.',
            'Encrypting only a few short messages, each a single block long.',
            'Choosing the starting value $R$ uniformly at random for each message.'
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
      prereq: ['#/course/ch3', '#/basics/games'],
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
                'Because it can recover the key from the ciphertext and re-encrypt freely.',
                'Flipping a ciphertext bit flips the same plaintext bit, since $C = P \\oplus M$.',
                'Because counter mode is not IND-CPA secure, so its ciphertexts leak the plaintext to an observer.',
                'Because the random starting value is sent in the clear and can be altered.'
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
                'Yes, because the verification oracle accepted the pair $(M, T)$ it submitted.',
                'No: $M$ was queried to the tagging oracle, so this is not a forgery.',
                'Yes, because it made far fewer than $2^n$ queries in total.',
                'Only if the tag $T$ is longer than the key $K$ it was made with.'
              ],
              answer: 1,
              why: 'A forgery must be on a new message — one the adversary never asked to be tagged. Replaying an honestly obtained tag is always possible and is not counted as breaking the MAC.'
            }
          ]
        },
        {
          id: 'ch4-prf-mac',
          title: 'Any PRF is a good MAC',
          see: ['#/learn/reduction'],
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
                'Because the key is secret, and the random function uses that same key.',
                'A random function\'s output on a new input is independent of earlier outputs.',
                'Because the verification oracle rejects every query in the ideal world, valid or not.',
                'Because the tag is longer than the message, so it hides the message.'
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
                'Because $E_K$ is not a permutation, so many inputs share the tag $T$.',
                'The second block XORs away the chaining value $T$, leaving $E_K(M_1) = T$.',
                'Because the adversary already queried the two-block message to the tagging oracle for its tag.',
                'Because $T$ is all zeros, so XORing it into a block changes nothing.'
              ],
              answer: 1,
              why: 'The first block produces chaining value $T$. The second block computes $E_K(T \\oplus M_1 \\oplus T) = E_K(M_1) = T$. The two copies of $T$ cancel, and the final value is again $T$.'
            }
          ]
        },
        {
          id: 'ch4-hmac',
          title: 'HMAC and combining MACs with encryption',
          see: ['#/proofs/etm'],
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
                'Because the MAC key is reused as the encryption key, which leaks it.',
                'The tag is computed on the plaintext and sent in the clear: equal messages, equal tags.',
                'Because encryption must always come after computing the MAC, never alongside it in parallel.',
                'Because the tag reveals the encryption key to anyone who sees it.'
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
            'Nothing: counter mode, for example, is IND-CPA secure yet malleable.',
            'That any modified ciphertext decrypts to $\\perp$ instead of a message.',
            'That modifications are detected with probability at least $1/2$.',
            'That only someone holding the key can produce a valid ciphertext.'
          ],
          answer: 0,
          why: 'IND-CPA is about what the adversary can learn. Malleable schemes like counter mode are IND-CPA secure and offer no integrity at all.'
        },
        {
          q: 'In the UF-CMA game, which of these is a winning output?',
          opts: [
            'A valid tag on a message previously sent to the tagging oracle.',
            'A valid tag on a message never sent to the tagging oracle.',
            'The MAC key $K$, recovered from the tags it has seen.',
            'Any pair $(M, T)$ where $T$ has the right length.'
          ],
          answer: 1,
          why: 'Forgery means verification accepts a message that was never legitimately tagged. Recovering the key would let the adversary do this, but the win condition is the forgery itself.'
        },
        {
          q: 'A PRF-based MAC uses 16-bit tags. Even if the PRF is perfect, what goes wrong?',
          opts: [
            'Nothing: a perfect PRF makes forgery hard whatever the tag length, so 16 bits is plenty.',
            'About $2^{16}$ forgery attempts succeed, since each is right with probability $2^{-16}$.',
            'The short tag reveals part of the key with every message.',
            'The MAC stops being deterministic once tags are that short.'
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
      blurb: 'Collision resistance, the birthday attack, Merkle–Damgård, and the random oracle model.',
      prereq: ['#/primer/counting', '#/basics/birthday'],
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
                'Because SHA-256 has known design flaws that produce colliding inputs.',
                'Inputs vastly outnumber the $2^{256}$ outputs, so some must share one.',
                'Because SHA-256 uses a key, and two keys can give the same output.',
                'They don\'t: SHA-256 gives every input its own distinct output.'
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
                'To keep the hash function secret from the adversary, just like an encryption key is.',
                'For a fixed function, an adversary that just prints a known collision exists.',
                'Because unkeyed hash functions cannot be computed in polynomial time.',
                'Because SHA-256 and other real hash functions require a secret key.'
              ],
              answer: 1,
              why: 'Existence of an adversary is a mathematical fact, not a matter of knowledge. With a random public key and a well-designed family, a single hardcoded collision only works for a tiny fraction of keys, so the definition becomes meaningful.'
            }
          ]
        },
        {
          id: 'ch5-birthday',
          title: 'The birthday attack',
          see: ['#/basics/birthday'],
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
                'Because both properties are defined using the same public key.',
                'A second preimage $x\'$ of $x$ is itself a collision $(x, x\')$.',
                'Because second-preimage resistance is only defined for such functions.',
                'It doesn\'t: the implication actually goes the other way round.'
              ],
              answer: 1,
              why: 'This is a direct reduction: given a second-preimage finder, pick $x$ yourself, run the finder, and output the pair. If the finder succeeds, you have a collision.'
            }
          ]
        },
        {
          id: 'ch5-md',
          title: 'Merkle–Damgård: from short inputs to long ones',
          see: ['#/proofs/merkle'],
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
                'To make the hash output longer and so harder to attack.',
                'So colliding messages of different lengths force a collision in $h$.',
                'To prevent the birthday attack on the final compression step.',
                'To turn the hash into a keyed family, as the collision-resistance definition requires.'
              ],
              answer: 1,
              why: 'Without length encoding, the proof breaks for messages of different lengths. With it, different lengths mean different last blocks, so equal final outputs mean $h$ itself collided.'
            },
            {
              q: 'What does length extension let an adversary do?',
              opts: [
                'Find collisions in the compression function $h$ by extending both inputs.',
                'Compute $H(M \\,\\|\\, \\mathrm{pad} \\,\\|\\, X)$ from $H(M)$ and $|M|$ alone.',
                'Recover the message $M$ from its hash $H(M)$ and its length.',
                'Shorten the hash output so that collisions become easy to find.'
              ],
              answer: 1,
              why: 'The hash output is the full internal state. Continuing the chain from it hashes extra blocks, which breaks naive MACs like $H(K \\,\\|\\, M)$.'
            }
          ]
        },
        {
          id: 'ch5-ro',
          title: 'The random oracle model',
          see: ['#/basics/rom', '#/learn/romprog'],
          body: [
            'Some schemes need more from a hash function than collision resistance — they want its outputs to look completely random and unrelated to its inputs. The **random oracle model** captures this by pretending that $H$ is a truly random function that every party, including the adversary, can only access by querying an oracle.',
            'In a proof in this model, the reduction gets to see every hash query the adversary makes, and it can choose the answers itself as long as they look random. That extra power makes many proofs possible, including security proofs for RSA-OAEP encryption (Chapter 6) and for full-domain-hash RSA signatures.',
            'The catch: a real hash function is not a random oracle. It is a fixed, public piece of code. Canetti, Goldreich, and Halevi constructed (contrived) schemes that are secure in the random oracle model but insecure with *any* real hash function plugged in. So a random-oracle proof is a strong heuristic, not a guarantee.',
            'The practical attitude in Bellare and Rogaway is that a random-oracle proof rules out a huge class of generic attacks — any attack must exploit something about the concrete hash function beyond its behavior as a random function. That is far better than no proof at all, and schemes proven this way have held up well in practice.'
          ],
          quiz: [
            {
              q: 'What is the main limitation of proofs in the random oracle model?',
              opts: [
                'They only apply to symmetric encryption, not to signatures or public-key schemes.',
                'Real hashes are fixed public code, and some schemes are secure only in the model.',
                'They require the hash function\'s key to stay secret from the adversary.',
                'They cannot handle adversaries that choose their queries adaptively.'
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
            'That no two distinct inputs have the same hash value at all.',
            'That no efficient adversary can find two distinct inputs with equal hashes.',
            'That every hash output looks uniformly random to an observer.',
            'That the hash value cannot be computed by anyone who does not hold the secret key.'
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
            'If the compression function $h$ is collision resistant, so is $H$.',
            'If $H$ is collision resistant, then its compression function $h$ is a PRF.',
            'Merkle–Damgård hashes are random oracles whenever $h$ is collision resistant.',
            'Merkle–Damgård hashes resist length-extension attacks.'
          ],
          answer: 0,
          why: 'Any collision in $H$ can be traced back, block by block, to a collision in $h$. Length extension is a separate property, and Merkle–Damgård hashes do not resist it.'
        },
        {
          q: 'Why is $\\Mac_K(M) = H(K \\,\\|\\, M)$ insecure when $H$ is SHA-256?',
          opts: [
            'Because SHA-256 is not collision resistant, so two different messages get the same tag.',
            'Length extension turns the tag of $M$ into a tag of $M \\,\\|\\, \\mathrm{pad} \\,\\|\\, X$.',
            'Because the key is too short compared with SHA-256\'s output.',
            'Because SHA-256\'s 256-bit output is too long to use as a tag.'
          ],
          answer: 1,
          why: 'SHA-256 is a Merkle–Damgård hash, so its output is a full chaining state that can be extended. That gives a forgery without any knowledge of $K$ (beyond its length, which is usually public).'
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
      prereq: ['#/primer/modular', '#/primer/groups'],
      sections: [
        {
          id: 'ch6-setting',
          title: 'Encryption without a shared secret',
          see: ['#/learn/hybrid', '#/proofs/prg-hybrid'],
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
                'Because public keys are short enough to be guessed by brute force.',
                'The adversary can encrypt $M_0$ and $M_1$ with $pk$ and compare.',
                'Because the secret key can be computed from the public key.',
                'Because decryption is too slow to run on every candidate message.'
              ],
              answer: 1,
              why: 'Anyone can encrypt in the public-key setting. With a deterministic scheme, re-encrypting the candidates and comparing identifies which one was encrypted.'
            }
          ]
        },
        {
          id: 'ch6-numbers',
          title: 'Number theory you need',
          see: ['#/primer/modular', '#/primer/groups'],
          body: [
            'Public-key cryptography is built on arithmetic modulo a number. For a positive integer $N$, $\\Z_N = \\{0, 1, \\ldots, N-1\\}$ with addition and multiplication mod $N$. The elements that have a multiplicative inverse are those **coprime** to $N$ — sharing no factor with $N$ except $1$, i.e. $\\gcd(a, N) = 1$. They form the group $\\Z_N^*$, whose size is written $\\varphi(N)$. For example, $\\Z_{10}^* = \\{1, 3, 7, 9\\}$, so $\\varphi(10) = 4$.',
            'For a prime $p$, every nonzero element is invertible, so $\\varphi(p) = p - 1$. For $N = pq$ with $p, q$ distinct primes, $\\varphi(N) = (p-1)(q-1)$.',
            '**Euler\'s theorem**: for any $a \\in \\Z_N^*$, $a^{\\varphi(N)} \\equiv 1 \\pmod N$. Consequently, exponents can be reduced modulo $\\varphi(N)$: $a^x \\equiv a^{x \\bmod \\varphi(N)} \\pmod N$.',
            'Two computations are easy even for numbers thousands of bits long. **Modular exponentiation** $a^x \\bmod N$ takes about $\\log_2 x$ squarings and multiplications (square-and-multiply). **Modular inverses** are found with the extended Euclidean algorithm.',
            'Two computations are believed hard. **Factoring**: given $N = pq$ for large random primes, find $p$ and $q$. **Discrete logarithm**: given a generator $g$ of a suitable large group and $X = g^x$, find $x$. Every scheme in this chapter rests on one of these.'
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
            'RSA key generation picks two large random primes $p, q$, sets $N = pq$, and chooses an exponent $e$ coprime to $\\varphi(N)$. It then computes $d$ with $ed \\equiv 1 \\pmod{\\varphi(N)}$, using the extended Euclidean algorithm. The public key is $(N, e)$; the secret key is $(N, d)$.',
            'The RSA function on $\\Z_N^*$ is $f(x) = x^e \\bmod N$ and its inverse is $f^{-1}(y) = y^d \\bmod N$. They really are inverses: $(x^e)^d = x^{ed} = x^{1 + k\\varphi(N)} = x \\cdot (x^{\\varphi(N)})^k \\equiv x \\pmod N$ by Euler\'s theorem. (Euler\'s theorem covers $x \\in \\Z_N^*$. Using the Chinese Remainder Theorem one can show $x^{ed} \\equiv x$ for every $x \\in \\Z_N$, but we will not need that.)',
            'A tiny example: $p = 5$, $q = 11$, so $N = 55$ and $\\varphi(N) = 40$. Take $e = 3$; then $d = 27$, since $3 \\cdot 27 = 81 = 2 \\cdot 40 + 1$ (at this size you can just try multiples of $3$). Applying $f$ to $x = 7$ gives $7^3 = 343 \\equiv 13 \\pmod{55}$. Applying $f^{-1}$ gives $13^{27} \\bmod 55 = 7$.',
            'Anyone can compute $f$. Knowing $d$ (or the factors $p, q$) lets you invert $f$, and recovering $d$ from $(N, e)$ is provably as hard as factoring $N$. But nobody has proved that inverting $f$ *without* finding $d$ requires factoring — that is why we state the RSA assumption separately below. So $f$ is a **trapdoor permutation**: a permutation that is easy in one direction for everyone, and easy in the other direction only for whoever holds the trapdoor $d$.',
            'The **RSA assumption** is that, for a random $y \\in \\Z_N^*$, no efficient adversary given $(N, e, y)$ can find $x$ with $x^e \\equiv y \\pmod N$. Real moduli are 2048 bits or more; $2^{2048}$ is a 617-digit number.'
          ],
          quiz: [
            {
              q: 'Why does $(x^e)^d \\equiv x \\pmod N$ hold?',
              opts: [
                'Because $e = d$, so raising to $e$ twice cancels out.',
                '$ed = 1 + k\\varphi(N)$, and Euler gives $x^{\\varphi(N)} \\equiv 1$ for $x \\in \\Z_N^*$.',
                'Because $N$ is prime, so Fermat\'s little theorem applies directly.',
                'Because exponentiation mod $N$ is commutative, so the order in which $e$ and $d$ are applied is irrelevant.'
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
            'It is also **malleable**. Given $C = M^e \\bmod N$, anyone can compute $C \\cdot 2^e \\bmod N = (2M)^e \\bmod N$, a valid encryption of $2M$, without knowing $M$. In a protocol where the adversary can see decryptions of modified ciphertexts, this leaks the plaintext.',
            'And the RSA assumption only says it is hard to invert $f$ on a *random* input. Real messages are not random: they are short, structured, or guessable. If $M$ is a small number and $e = 3$, then $M^3$ may be less than $N$, and the "encryption" can be undone with an ordinary cube root.',
            'Secure RSA encryption first transforms the message with randomized padding. **RSA-OAEP**, the standardized method, applies two hash-based mixing rounds with fresh randomness before applying $f$. It is proved IND-CCA secure (secure even when the adversary can see decryptions of other ciphertexts; defined at the end of this chapter) under the RSA assumption, in the random oracle model. The original 1994 proof had a gap, found by Shoup in 2001 and repaired for RSA soon after — a good lesson in why proofs get checked.'
          ],
          quiz: [
            {
              q: 'Given a textbook RSA ciphertext $C = M^e \\bmod N$, how can an adversary produce an encryption of $2M$?',
              opts: [
                'It cannot do this without knowing $d$.',
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
          see: ['#/proofs/elgamal', '#/learn/reduction'],
          body: [
            'Let $G$ be a cyclic group of prime order $q$ with generator $g$ — for example, a prime-order subgroup of $\\Z_p^*$ or an elliptic-curve group.',
            'The **Diffie–Hellman key exchange** (1976) is where these problems come from. Alice picks a secret $x$ and sends $g^x$; Bob picks a secret $y$ and sends $g^y$. Both can now compute $g^{xy}$: Alice as $(g^y)^x$, Bob as $(g^x)^y$. An eavesdropper sees only $g^x$ and $g^y$. Is that enough to find $g^{xy}$?',
            'Three problems in $G$ form a hierarchy. **DL**: given $g^x$, find $x$. **CDH**: given $g^x$ and $g^y$, compute $g^{xy}$. **DDH**: given $g^x$, $g^y$, and $Z$, decide whether $Z = g^{xy}$ or $Z$ is a random group element.',
            'Solving DL lets you solve CDH, and solving CDH lets you solve DDH, so DDH is the strongest assumption of the three. In some groups DDH is easy even though DL is hard. In the full group $\\Z_p^*$ one can efficiently test whether an element is a square, and $g^{xy}$ is a square exactly when $xy$ is even — which is computable from $g^x$ and $g^y$. A random $Z$ passes this test only half the time, so DDH is easy there. That is why schemes use prime-order subgroups.',
            '**ElGamal encryption.** The secret key is a random $x \\in \\Z_q$, and the public key is $X = g^x$. To encrypt a group element $M$, pick a random $y \\in \\Z_q$ and output $(Y, W) = (g^y, \\; X^y \\cdot M)$. To decrypt, compute $W \\cdot (Y^x)^{-1}$. Since $Y^x = g^{xy} = X^y$, the mask cancels. (Encoding a message as a group element is awkward; in practice $X^y$ is instead hashed into a symmetric key — "hashed ElGamal" — which leads to the hybrid encryption section below.)',
            '**Theorem.** For any IND-CPA adversary $A$ against ElGamal there is a DDH adversary $B$, about as efficient, with $\\Adv^{\\mathrm{ind-cpa}}(A) \\le 2 \\, \\Adv^{\\mathrm{ddh}}(B)$.',
            'Proof idea: we only handle one left-or-right query, which is enough by the remark at the start of the chapter. $B$ gets a DDH challenge $(g^x, g^y, Z)$. It sets $pk = g^x$, picks a random bit $b$ of its own, answers the left-or-right query with $(g^y, Z \\cdot M_b)$, and outputs $1$ if $A$ guesses $b$. If $Z = g^{xy}$, this is a real encryption and $A$ is correct with probability $\\tfrac12 + \\tfrac12 \\Adv(A)$. If $Z$ is a random group element, then $Z \\cdot M_b$ is uniform no matter what $M_b$ is — a one-time pad in the group — and $A$ is correct with probability exactly $\\tfrac12$. The gap between these cases, $\\tfrac12 \\Adv(A)$, is $B$\'s DDH advantage. $\\qed$'
          ],
          quiz: [
            {
              q: 'In the ElGamal proof, why can the adversary do no better than guessing when $Z$ is random?',
              opts: [
                'Because the public key $g^x$ is hidden from the adversary.',
                '$M_b$ times a uniform group element is uniform, whatever $b$ is.',
                'Because the adversary cannot compute discrete logarithms in $G$.',
                'Because the same randomness $y$ is reused for both messages.'
              ],
              answer: 1,
              why: 'In a group, multiplication by a uniform random element is a bijection that maps any fixed $M_b$ to a uniform output. So the ciphertext carries no information about $b$.'
            }
          ]
        },
        {
          id: 'ch6-hybrid',
          title: 'Putting it together: hybrid encryption',
          see: ['#/proofs/hashed-elgamal', '#/proofs/etm'],
          body: [
            'Public-key operations are slow — thousands of times slower than a block cipher — and schemes like ElGamal only encrypt a single group element. Nobody encrypts a video file with RSA.',
            'Instead, systems use **hybrid encryption**. To send $M$ to Bob: pick a fresh random symmetric key $K$; encrypt $K$ under Bob\'s public key (or, equivalently, derive $K$ together with an encapsulation of it, as below); encrypt $M$ under $K$ with an authenticated symmetric scheme (Chapter 4\'s Encrypt-then-MAC, or GCM). Bob decrypts $K$ with $sk$, then decrypts $M$ with $K$.',
            'Formally, a **key encapsulation mechanism** (KEM) outputs a fresh key $K$ and an encapsulation $C_1$ that only $sk$ can open — for example $C_1 = g^y$ and $K = H(X^y)$, which is hashed ElGamal. A **data encapsulation mechanism** (DEM) encrypts $M$ under $K$. Since each $K$ is used only once, the DEM only needs one-time security. The KEM/DEM theorem bounds the combined scheme\'s advantage by a small multiple of the KEM\'s advantage plus the DEM\'s — another reduction in the now-familiar pattern.',
            'PGP, HPKE (RFC 9180) and age use hybrid encryption directly. TLS 1.3 and Signal use the closely related Diffie–Hellman key exchange to agree on $K$, then the same symmetric machinery. Either way, it uses every chapter of this course: a hash function to derive keys (Chapter 5), a MAC for integrity (Chapter 4), a PRF-based symmetric scheme for bulk data (Chapter 3), and a public-key primitive to establish the key in the first place.',
            'Finally, a word on stronger attacks. Real adversaries can often send modified ciphertexts and observe how the receiver reacts — an error message, a timing difference. Bleichenbacher\'s 1998 "million-message" attack decrypted SSL key-exchange ciphertexts by sending about a million modified ciphertexts and watching whether the server reported a padding error. The padding scheme (PKCS #1 v1.5) had no security proof, and certainly none against such attacks. The modern target is **IND-CCA** security, where the adversary may also ask for decryptions of any ciphertext other than its challenge. RSA-OAEP achieves it (in the random oracle model), and so does hybrid encryption when *both* the KEM is CCA-secure and the DEM is authenticated.'
          ],
          quiz: [
            {
              q: 'In hybrid encryption, what does the public-key scheme encrypt?',
              opts: [
                'The entire message.',
                'A fresh random symmetric key.',
                'The hash of the message.',
                'The receiver\'s long-term secret key.'
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
            'Because the public key must change for every message encrypted, so it needs fresh randomness.',
            'The adversary has $pk$, so it can re-encrypt candidates and compare.',
            'Because the underlying RSA function is itself randomized.',
            'Because decryption needs the randomness used in encryption.'
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
            'Collision resistance of the hash function used to encode messages.'
          ],
          answer: 2,
          why: 'The proof replaces the mask $g^{xy}$ with a random group element; any adversary that notices the swap solves DDH.'
        },
        {
          q: 'Which is a reason textbook RSA should not be used to encrypt?',
          opts: [
            'It cannot be decrypted efficiently, even by the key holder.',
            'It is deterministic and malleable, and leaks small or structured messages.',
            'It needs the sender and receiver to agree on a shared secret key before anything is sent.',
            'It only works when the modulus $N$ is itself a prime number.'
          ],
          answer: 1,
          why: 'Textbook RSA fails IND-CPA by determinism, allows controlled modification via its multiplicative structure, and gives no protection for non-random messages. Randomized padding such as OAEP fixes these issues.'
        },
        {
          q: 'Why do real systems use hybrid encryption instead of public-key encryption alone?',
          opts: [
            'Public-key schemes are insecure for messages longer than one block.',
            'Public-key operations are slow and short-input; symmetric crypto handles bulk data.',
            'Symmetric schemes automatically provide forward secrecy for every message, which public-key schemes cannot.',
            'Public-key schemes cannot be randomized, so they leak repeated messages.'
          ],
          answer: 1,
          why: 'Hybrid encryption uses one public-key operation to transport a symmetric key, then fast symmetric encryption for everything else. It is provably secure when both the KEM and the DEM meet the required security notions.'
        }
      ]
    }
  ];
}());
