/* The primer: what to read before the rest of the app makes sense.
 *
 * Everything here assumes high-school algebra and nothing else. Notation is
 * introduced and immediately translated, because the notation — not the
 * mathematics — is what makes a crypto paper unreadable the first time.
 *
 * Lesson shape:
 *   id, track, title, oneline
 *   body    — plain-language paragraphs
 *   jargon  — [{t: symbol or term, p: how you say it out loud}]
 *   example — {h, body:[...]}  a small worked thing
 *   check   — [{q, a}]  self-test, answer hidden until tapped
 *   use     — [{href, label}]  where this pays off in the rest of the app
 */

window.CP_TRACKS = [
  { id: 'math',   title: 'Ground floor',
    blurb: 'The discrete maths a crypto definition is written in. Seven short lessons.' },
  { id: 'proof',  title: 'Writing proofs',
    blurb: 'What a proof is, the five shapes almost all of them take, and how to write one down.' },
  { id: 'crypto', title: 'Crypto ideas',
    blurb: 'Why security has to be proved at all, and what the words in a security definition mean.' }
];

window.CP_PRIMER = [

  /* ------------------------------ ground floor ------------------------------ */

  {
    id: 'sets',
    track: 'math',
    title: 'Sets, strings, and functions',
    oneline: 'The three nouns every definition is built from.',
    body: [
      'Almost every line of a security definition is made of three things: a **set** (the collection of values something is allowed to be), a **string** (one particular value, usually written in bits), and a **function** (a rule that turns one value into another). None of them is harder than the plain English version. The notation is just very compressed.',
      'A **set** is a collection of distinct things, written inside braces: $\\{0, 1\\}$ is the set containing $0$ and $1$. Order does not matter and nothing appears twice. You write $x \\in S$ for "$x$ is one of the things in $S$", and $|S|$ for "how many things are in $S$".',
      'A **bit string** is a finite row of $0$s and $1$s, like $01101$. Crypto writes the set of all $n$-bit strings as $\\bits^n$ — read it as "$\\{0,1\\}$, $n$ of them in a row". There are $2^n$ such strings, so $|\\bits^n| = 2^n$. The star version $\\bits^{*}$ means strings of any finite length. Gluing two strings end to end is written $x \\| y$, called **concatenation**.',
      'A **function** $f : X \\to Y$ is a rule that takes any element of $X$ (the *domain*) and returns exactly one element of $Y$ (the *codomain*). Read the arrow as "goes to". Encryption, hashing, and key generation are all just functions with particular domains and codomains.',
      'Three words about functions come up constantly. $f$ is **injective** (one-to-one) if different inputs always give different outputs — nothing collides. It is **surjective** (onto) if every element of $Y$ is hit by something. It is a **bijection** if both: a perfect pairing, which means it can be undone. Bijections matter because relabelling by a bijection never changes how likely anything is; that fact alone justifies a lot of steps later on.'
    ],
    jargon: [
      { t: '$x \\in S$', p: 'x is in S; x is one of the elements of S' },
      { t: '$|S|$', p: 'the size of S, i.e. how many elements it has' },
      { t: '$\\bits^n$', p: 'all bit strings of length exactly n' },
      { t: '$\\bits^{*}$', p: 'all bit strings of any finite length' },
      { t: '$f : X \\to Y$', p: 'f is a function taking inputs from X and producing outputs in Y' },
      { t: '$x \\| y$', p: 'x concatenated with y — the two strings glued together' }
    ],
    example: {
      h: 'Counting the 3-bit strings',
      body: [
        '$\\bits^{3}$ is the set $\\{000, 001, 010, 011, 100, 101, 110, 111\\}$. Each of the three positions is chosen independently from two options, so the count is $2 \\cdot 2 \\cdot 2 = 2^{3} = 8$, matching the rule $|\\bits^{n}| = 2^{n}$.',
        'Now take $f : \\bits^{3} \\to \\bits^{3}$ defined by "flip every bit". It is a bijection: flipping twice gets you back where you started, so it can be undone, and no two inputs land on the same output. Take instead $g : \\bits^{3} \\to \\bits^{1}$ defined by "keep the first bit". That is not injective — $000$ and $011$ both give $0$ — so information has been destroyed and $g$ cannot be undone.'
      ]
    },
    check: [
      { q: 'How many strings are in $\\bits^{10}$?',
        a: '$2^{10} = 1024$. Ten positions, two choices each.' },
      { q: 'A 128-bit key is an element of which set, and how many keys are there?',
        a: 'An element of $\\bits^{128}$, and there are $2^{128}$ of them — about $3.4 \\times 10^{38}$.' },
      { q: 'Is "add 1, wrapping around from 255 to 0" a bijection on $\\bits^{8}$?',
        a: 'Yes. Every output comes from exactly one input, and "subtract 1, wrapping" undoes it. Nothing is lost.' }
    ],
    use: [
      { href: '#/basics/primitives', label: 'Primitive cheat sheet — every line uses this notation' }
    ]
  },

  {
    id: 'probability',
    track: 'math',
    title: 'Probability, only what you need',
    oneline: 'Chance, uniform sampling, and why $1/2$ is the number to beat.',
    body: [
      'Cryptography is soaked in probability because keys are chosen at random and attackers are allowed to guess. Fortunately the proofs use a small corner of the subject.',
      'An **experiment** is anything with a random outcome — flipping a coin, drawing a key. An **event** is a statement about the outcome that is either true or false, like "the coin came up heads" or "the attacker guessed correctly". $\\Pr[E]$ is the probability that event $E$ happens: a number between $0$ (never) and $1$ (always).',
      '**Uniform** means every outcome is equally likely. The notation $x \\rand S$ reads "$x$ is drawn uniformly at random from $S$", and it is everywhere: keys, random pads, challenge bits. If $S$ has $|S|$ elements, then each particular one has probability $1/|S|$ of being drawn. Guessing a uniform $128$-bit key correctly has probability $2^{-128}$.',
      'Four rules cover nearly every calculation you will meet. **Complement**: $\\Pr[\\text{not } E] = 1 - \\Pr[E]$. **Union bound**: $\\Pr[E_1 \\text{ or } E_2] \\le \\Pr[E_1] + \\Pr[E_2]$, which never needs any assumption at all and is therefore the workhorse. **Independence**: if $E_1$ and $E_2$ do not influence each other, $\\Pr[E_1 \\text{ and } E_2] = \\Pr[E_1] \\cdot \\Pr[E_2]$. **Conditioning**: $\\Pr[E \\mid F]$ is the probability of $E$ once you already know $F$ happened.',
      'The number to keep in mind is $1/2$. When a security game asks the attacker to guess one hidden bit, flipping a coin already wins half the time. So "the attacker wins with probability $1/2$" means the attacker learned nothing. All the interesting quantities in this app measure how far above $1/2$ an attacker can get.'
    ],
    jargon: [
      { t: '$\\Pr[E]$', p: 'the probability that E happens' },
      { t: '$x \\rand S$', p: 'x is sampled uniformly at random from the set S' },
      { t: '$\\Pr[E \\mid F]$', p: 'the probability of E given that F already happened' },
      { t: '$\\Pr[\\bigcup_i E_i] \\le \\sum_i \\Pr[E_i]$', p: 'union bound: the chance that at least one of them happens is at most the sum' }
    ],
    example: {
      h: 'Guessing a short key',
      body: [
        'A key is drawn $k \\rand \\bits^{3}$, so there are $8$ equally likely keys. An attacker who guesses one key wins with probability $1/8$. An attacker who guesses three distinct keys wins with probability $3/8$ — here the union bound is tight, because the three "I guessed $k$" events cannot overlap.',
        'Now suppose the attacker instead has to guess a single hidden bit $b \\rand \\bits$. Guessing wins with probability $1/2$, and no cleverness can improve that if the attacker never sees anything that depends on $b$. That is the whole shape of an indistinguishability argument: push the game until $b$ genuinely does not appear anywhere the attacker can see, and the probability is then exactly $1/2$ with nothing left to prove.'
      ]
    },
    check: [
      { q: 'You draw $x \\rand \\bits^{6}$. What is $\\Pr[x = 010101]$?',
        a: '$1/64$, i.e. $2^{-6}$. Every one of the $2^{6}$ strings is equally likely.' },
      { q: 'Two bad things each happen with probability at most $2^{-40}$. What can you say about the chance that at least one happens?',
        a: 'At most $2^{-40} + 2^{-40} = 2^{-39}$, by the union bound. You do not need to know whether they are independent — that is exactly why the union bound gets used so heavily.' },
      { q: 'An attacker wins a guess-the-bit game with probability $0.5$. How much has it learned?',
        a: 'Nothing. That is what pure guessing scores, so its behaviour carries no information about the hidden bit.' }
    ],
    use: [
      { href: '#/basics/birthday', label: 'Birthday bound and union bound' },
      { href: '#/basics/advantage', label: 'Advantage — the distance above $1/2$' }
    ]
  },

  {
    id: 'counting',
    track: 'math',
    title: 'Counting and the pigeonhole principle',
    oneline: 'How to prove something is impossible by counting how much room there is.',
    body: [
      'Counting arguments prove things no amount of cleverness can get around, because they are about how much room exists rather than about how hard a computation is. Two tools do most of the work.',
      'The **multiplication rule**: if you make a sequence of independent choices with $a$ options then $b$ options, there are $a \\cdot b$ total outcomes. That is why $|\\bits^{n}| = 2^{n}$, and why the number of functions from $\\bits^{n}$ to $\\bits^{m}$ is the astronomically larger $(2^{m})^{2^{n}}$ — each of the $2^{n}$ inputs independently picks one of $2^{m}$ outputs.',
      'The **pigeonhole principle**: if you put $n$ items into $m$ boxes and $n > m$, some box holds at least two items. It sounds too obvious to be useful, and it is the entire content of several impossibility results. If a hash compresses $\\bits^{256}$ down to $\\bits^{128}$, collisions must exist — there are more inputs than outputs, so two inputs must share an output. Collision resistance can therefore never mean "no collisions"; it can only mean "no efficient way to find one".',
      'The same style of argument shows the one-time pad needs a key as long as its message: fewer keys than messages would leave some messages unreachable from a given ciphertext, and that asymmetry is exactly what an unbounded attacker detects.',
      'A useful habit: whenever a claim says "impossible" rather than "computationally hard", look for the counting argument. Reductions cannot prove impossibility, because there is no assumption to reduce to.'
    ],
    jargon: [
      { t: 'pigeonhole', p: 'more items than boxes means some box has two items' },
      { t: 'counting argument', p: 'a proof that compares the sizes of two sets to rule something out' },
      { t: 'information-theoretic', p: 'true even against an attacker with unlimited time — usually proved by counting' }
    ],
    example: {
      h: 'Why a compressing hash must have collisions',
      body: [
        'Let $H : \\bits^{256} \\to \\bits^{128}$. The domain has $2^{256}$ elements; the codomain has $2^{128}$. Treat inputs as items and outputs as boxes: $2^{256} > 2^{128}$, so by pigeonhole at least two distinct inputs $x \\ne x\'$ satisfy $H(x) = H(x\')$.',
        'In fact the average box holds $2^{128}$ items. The proof is three lines and no assumption is used anywhere, which is the tell that it is a counting argument rather than a reduction.'
      ]
    },
    check: [
      { q: 'How many functions are there from $\\bits^{2}$ to $\\bits^{2}$?',
        a: '$(2^{2})^{2^{2}} = 4^{4} = 256$. Each of the $4$ inputs independently chooses one of $4$ outputs.' },
      { q: 'Thirteen people are in a room. Must two share a birth month?',
        a: 'Yes — $13$ items, $12$ boxes. Pigeonhole, with no further information needed about the people.' },
      { q: 'Can a reduction to a hardness assumption prove that a $128$-bit-output hash has no collisions?',
        a: 'No, and not because the reduction is hard to write: the statement is false. Collisions exist by counting. Only "hard to find" is provable.' }
    ],
    use: [
      { href: '#/learn/infotheoretic', label: 'Information-theoretic arguments' },
      { href: '#/proofs/otp', label: 'Worked proof: one-time-pad key length is optimal' }
    ]
  },

  {
    id: 'modular',
    track: 'math',
    title: 'Modular arithmetic',
    oneline: 'Arithmetic that wraps around, the way a clock does.',
    body: [
      'Modular arithmetic is ordinary arithmetic with wrap-around. On a $12$-hour clock, $5$ hours after $9$ o\'clock is $2$ o\'clock: you computed $9 + 5 = 14$ and then wrapped, because $14$ and $2$ differ by $12$. Written down, that is $14 \\equiv 2 \\pmod{12}$.',
      'In general $a \\bmod n$ means the remainder when $a$ is divided by $n$, always landing in $\\{0, 1, \\ldots, n-1\\}$. And $a \\equiv b \\pmod{n}$, read "$a$ is congruent to $b$ modulo $n$", means $a$ and $b$ leave the same remainder — equivalently that $n$ divides $a - b$. The set of remainders with $+$ and $\\times$ done mod $n$ is written $\\Z_n$.',
      'Addition, subtraction and multiplication all behave normally: you may reduce mod $n$ at any point without changing the answer, which is what keeps numbers small in practice. Division is the delicate one. $x$ has a **multiplicative inverse** mod $n$ — some $y$ with $x \\cdot y \\equiv 1$ — exactly when $x$ and $n$ share no factor other than $1$.',
      'That is why cryptography loves a **prime** modulus $p$. When $p$ is prime, every nonzero element has an inverse, so you can divide by anything except $0$ and the arithmetic is as well behaved as with rational numbers. The nonzero elements under multiplication mod $p$ are written $\\Z_p^{*}$, and that set is the starting point for the next lesson.'
    ],
    jargon: [
      { t: '$a \\bmod n$', p: 'the remainder of a divided by n' },
      { t: '$a \\equiv b \\pmod{n}$', p: 'a and b have the same remainder mod n' },
      { t: '$\\Z_n$', p: 'the numbers 0 through n-1, with arithmetic that wraps at n' },
      { t: '$\\Z_p^{*}$', p: 'the nonzero numbers mod a prime p, under multiplication' }
    ],
    example: {
      h: 'Arithmetic mod 7',
      body: [
        '$5 + 4 = 9 \\equiv 2 \\pmod{7}$. $5 \\cdot 4 = 20 \\equiv 6 \\pmod{7}$, since $20 - 6 = 14$ is a multiple of $7$.',
        'Inverses: $3 \\cdot 5 = 15 \\equiv 1 \\pmod{7}$, so $3$ and $5$ are each other\'s inverses — "dividing by $3$" mod $7$ is the same as multiplying by $5$. Because $7$ is prime, every one of $1,2,3,4,5,6$ has such a partner. Contrast mod $6$: the element $2$ has no inverse, because $2$ times anything is even and never leaves remainder $1$.'
      ]
    },
    check: [
      { q: 'What is $17 \\bmod 5$?',
        a: '$2$. Since $17 = 3 \\cdot 5 + 2$, the remainder is $2$.' },
      { q: 'What is the inverse of $2$ modulo $11$?',
        a: '$6$, because $2 \\cdot 6 = 12 \\equiv 1 \\pmod{11}$.' },
      { q: 'Why do schemes pick a prime modulus?',
        a: 'Because then every nonzero element is invertible, so division works and the structure is a clean group — which is what the security proofs need.' }
    ],
    use: [
      { href: '#/primer/groups', label: 'Next: groups, generators, and discrete log' }
    ]
  },

  {
    id: 'groups',
    track: 'math',
    title: 'Groups, generators, and discrete log',
    oneline: 'Where public-key cryptography actually lives.',
    body: [
      'A **group** is a set with one operation that behaves sensibly. Formally you need four things: the operation combines two elements into a third and never escapes the set (closure); regrouping does not matter (associativity); there is an identity element that changes nothing; and every element has an inverse that cancels it. That is the whole definition — $\\Z_p^{*}$ under multiplication mod a prime $p$ satisfies it, and so do the elliptic-curve groups used in practice.',
      'Crypto writes the group abstractly as $\\G$, usually of **prime order** $q$, meaning it has exactly $q$ elements. Prime order is convenient: every element except the identity generates the whole group.',
      'A **generator** $g$ is an element whose powers $g^{1}, g^{2}, g^{3}, \\ldots$ eventually list every element of the group exactly once before returning to the start. Such a group is called **cyclic**. Once you fix a generator, every element can be named as $g^{x}$ for exactly one exponent $x$, so the group looks like a scrambled copy of $\\Z_q$.',
      'Here is the point of all of it. Going forwards is easy: given $g$ and $x$, computing $g^{x}$ takes only about $\\log x$ multiplications by repeated squaring. Going backwards is believed hard: given $g$ and $h = g^{x}$, finding $x$ is the **discrete logarithm** problem, and for a well-chosen group of $256$-bit order nobody knows how to do it in any practical time. That gap — easy forwards, hard backwards — is the raw material out of which Diffie-Hellman, ElGamal, and most public-key cryptography is built.',
      'Two harder-to-break variants get their own names. **CDH**: given $g^{x}$ and $g^{y}$, produce $g^{xy}$. **DDH**: given $g^{x}$, $g^{y}$ and a third element, decide whether it is $g^{xy}$ or a random group element. DDH is the one that shows up whenever a proof needs something to look random.'
    ],
    jargon: [
      { t: '$\\G$', p: 'a group — a set with a well-behaved operation' },
      { t: 'order', p: 'the number of elements in the group' },
      { t: 'generator $g$', p: 'an element whose powers sweep out the entire group' },
      { t: '$g^{x}$', p: 'g combined with itself x times' },
      { t: 'discrete log', p: 'given g and g^x, recover x — believed hard' }
    ],
    example: {
      h: 'The group $\\Z_7^{*}$, all six elements of it',
      body: [
        'The elements are $\\{1,2,3,4,5,6\\}$ with multiplication mod $7$. Take $g = 3$ and list the powers: $3^{1} = 3$, $3^{2} = 9 \\equiv 2$, $3^{3} \\equiv 6$, $3^{4} \\equiv 4$, $3^{5} \\equiv 5$, $3^{6} \\equiv 1$. All six elements appeared, so $3$ is a generator and the group is cyclic.',
        'Discrete log in this group: solve $3^{x} \\equiv 5 \\pmod 7$. Reading the list, $x = 5$. That took a glance because the group has six elements. Replace $7$ with a $2048$-bit prime and the same list has more entries than there are atoms in the observable universe — the problem statement is unchanged, but no algorithm we know finishes it. Nothing about the mathematics got harder; only the size did.'
      ]
    },
    check: [
      { q: 'In $\\Z_7^{*}$ with $g = 3$, what is $3^{4} \\bmod 7$?',
        a: '$4$. From the list above, or directly: $81 = 11 \\cdot 7 + 4$.' },
      { q: 'Which is easier: computing $g^{x}$ from $x$, or computing $x$ from $g^{x}$?',
        a: 'Computing $g^{x}$ is easy — repeated squaring does it in about $\\log x$ steps. Recovering $x$ is the discrete log problem and is believed hard. Public-key cryptography lives in that gap.' },
      { q: 'What does DDH ask you to do that CDH does not?',
        a: 'DDH only asks you to *decide* whether a given element is $g^{xy}$ or random; CDH asks you to *produce* $g^{xy}$. Deciding is an easier job, so assuming DDH is hard is a stronger assumption.' }
    ],
    use: [
      { href: '#/basics/assumptions', label: 'Standard hardness assumptions' },
      { href: '#/proofs/elgamal', label: 'Worked proof: DDH implies ElGamal is IND-CPA' }
    ]
  },

  {
    id: 'growth',
    track: 'math',
    title: 'Growth rates: polynomial, exponential, negligible',
    oneline: 'Why "efficient" means polynomial and "negligible" means tiny forever.',
    body: [
      'Security statements never talk about a single fixed problem — they talk about a family of problems indexed by a **security parameter** $\\lambda$, which you can think of as the key length. Everything else is measured against it: how long the attacker runs, how many queries it makes, how likely it is to win.',
      'The reason is that any *fixed* problem can be brute-forced by a big enough machine, so "no attacker can break it" is not a claim mathematics can support. What you can claim is that the difficulty grows faster than the attacker\'s budget, and to say that you need to compare growth rates.',
      '**Polynomial** growth means bounded by $\\lambda^{c}$ for some constant $c$: $\\lambda$, $\\lambda^{2}$, $100\\lambda^{3} + 5$. **Exponential** growth means something like $2^{\\lambda}$. The gap is not a matter of degree. At $\\lambda = 128$: $\\lambda^{3}$ is about two million, an unremarkable amount of work, while $2^{\\lambda}$ is around $3 \\times 10^{38}$, which is not going to happen on any hardware ever built. This is why "efficient" is defined as "runs in polynomial time" — the class is closed under the things proofs do (running an algorithm a polynomial number of times is still polynomial) and it draws the line in the right place.',
      'Now the mirror image. A function $\\mu(\\lambda)$ is **negligible** if it eventually drops below $1/p(\\lambda)$ for *every* polynomial $p$. Plain reading: it shrinks so fast that no polynomial-time attacker can accumulate a meaningful chance of success, even repeating its attack polynomially many times. $2^{-\\lambda}$ is negligible. $1/\\lambda^{100}$ is not — it is small, but it is only polynomially small, and repeating the attack $\\lambda^{100}$ times would then succeed reliably.',
      'What makes the definition the right one is its closure: negligible plus negligible is negligible, and a polynomial times a negligible is still negligible. Those two facts are what let a proof accumulate a polynomial number of small losses and still conclude that the total is negligible. They are used, usually without comment, in essentially every proof in this app.'
    ],
    jargon: [
      { t: '$\\lambda$', p: 'the security parameter — roughly, the key length; everything is measured against it' },
      { t: 'PPT', p: 'probabilistic polynomial time: the formal version of "an efficient attacker"' },
      { t: '$\\negl(\\lambda)$', p: 'some negligible function — shrinks faster than one over any polynomial' },
      { t: '$\\poly(\\lambda)$', p: 'some polynomial amount — the formal version of "affordable"' }
    ],
    example: {
      h: 'Negligible or not?',
      body: [
        '$2^{-\\lambda}$: negligible. It beats $1/\\lambda^{c}$ for every $c$ once $\\lambda$ is large enough, since exponentials outrun polynomials.',
        '$\\lambda^{-\\log \\lambda}$: negligible too, though it grows slowly into it. The exponent itself grows, so it eventually passes every fixed polynomial.',
        '$1/\\lambda^{100}$: **not** negligible, however small it looks at $\\lambda = 128$. It fails the test against the single polynomial $p(\\lambda) = \\lambda^{101}$. Concretely: an attacker who repeats it $\\lambda^{100}$ times — still polynomial work — wins with constant probability.',
        '$q(\\lambda) \\cdot 2^{-\\lambda}$ for a polynomial $q$: negligible, by the closure rule. This exact expression is the output of nearly every hybrid argument.'
      ]
    },
    check: [
      { q: 'Is $1/2^{\\sqrt{\\lambda}}$ negligible?',
        a: 'Yes. $\\sqrt{\\lambda}$ grows without bound, so $2^{\\sqrt{\\lambda}}$ eventually outgrows every polynomial, even though it does so slowly.' },
      { q: 'Is $1/(1000\\lambda^{5})$ negligible?',
        a: 'No. It is inverse-polynomial. A constant factor of $1000$ changes nothing — polynomial is polynomial.' },
      { q: 'A proof loses $2^{-\\lambda}$ per step and takes $\\lambda^{3}$ steps. Is the total loss negligible?',
        a: 'Yes: $\\lambda^{3} \\cdot 2^{-\\lambda}$ is a polynomial times a negligible function, which is negligible. That closure property is exactly what makes hybrid arguments legal.' }
    ],
    use: [
      { href: '#/basics/negligible', label: 'Negligible function — the formal statement' },
      { href: '#/basics/ppt', label: 'PPT adversary and the security parameter' }
    ]
  },

  {
    id: 'logic',
    track: 'math',
    title: 'Logic and quantifiers',
    oneline: 'How to read a definition that has three "for every"s in it.',
    body: [
      'A security definition is a single sentence with several quantifiers stacked up, and reading it in the wrong order changes what it means. This lesson is about reading them in the right order.',
      '$\\forall$ means "for every" and $\\exists$ means "there exists". They do **not** commute. "For every lock there exists a key that opens it" is true and unremarkable. "There exists a key such that for every lock it opens it" is a master key — a far stronger claim. Same words, different order, different world.',
      'An **implication** $P \\implies Q$ says "if $P$ then $Q$". It makes no claim at all when $P$ is false; the only way to make it false is $P$ true together with $Q$ false. Its **contrapositive** is $\\neg Q \\implies \\neg P$ ("if not $Q$ then not $P$"), which is always logically equivalent — proving one proves the other. Its **converse** $Q \\implies P$ is a different statement entirely, and confusing the two is the most common logical error in a first proof.',
      'Negation flips quantifiers as it moves inward: the negation of "for every $x$, $P(x)$" is "there exists an $x$ with not $P(x)$" — one counterexample is enough. The negation of "there exists an $x$ with $P(x)$" is "for every $x$, not $P(x)$".',
      'Now read a real definition. "$\\Pi$ is secure" unpacks to: **for every** efficient adversary $\\A$, **there exists** a negligible function $\\mu$, such that **for every** $\\lambda$, the advantage of $\\A$ is at most $\\mu(\\lambda)$. Order matters throughout: $\\mu$ is chosen after $\\A$, so each adversary may have its own bound, but $\\mu$ must then work for all $\\lambda$. Negating it — which is what a proof by contradiction starts from — gives: **there exists** an efficient $\\A$ whose advantage is non-negligible. That negated sentence is the first line of nearly every proof in this app.'
    ],
    jargon: [
      { t: '$\\forall$', p: 'for every / for all' },
      { t: '$\\exists$', p: 'there exists / for at least one' },
      { t: '$P \\implies Q$', p: 'if P then Q' },
      { t: '$\\neg P$', p: 'not P' },
      { t: 'contrapositive', p: 'not Q implies not P — always equivalent to P implies Q' },
      { t: 'converse', p: 'Q implies P — a different claim, not equivalent' }
    ],
    example: {
      h: 'Unpacking a security definition into English',
      body: [
        'The symbols: $\\forall$ PPT $\\A$, $\\exists$ negligible $\\mu$, $\\forall \\lambda$: $\\Adv_{\\A}(\\lambda) \\le \\mu(\\lambda)$.',
        'The English: "Pick any efficient attacker you like. I can then name a function that shrinks faster than any inverse polynomial, and that attacker\'s chance of doing better than guessing never exceeds it, at any key length."',
        'The negation, which is where a proof by contradiction begins: "There is an efficient attacker whose advantage is *not* negligible — it stays above $1/p(\\lambda)$ for some polynomial $p$, for infinitely many $\\lambda$."'
      ]
    },
    check: [
      { q: 'What is the contrapositive of "if the scheme is broken then the assumption is false"?',
        a: '"If the assumption is true then the scheme is not broken." Equivalent to the original — and the reason reductions prove security by assuming a break.' },
      { q: 'Someone claims "there exists a negligible $\\mu$ such that for every PPT $\\A$, $\\Adv_{\\A} \\le \\mu$". Is that the standard definition?',
        a: 'No — the quantifiers are swapped. It demands one single bound covering all adversaries at once, which is strictly stronger than the standard definition where $\\mu$ may depend on $\\A$.' },
      { q: 'How do you disprove "every element of $\\G$ is a generator"?',
        a: 'Exhibit one that is not. The negation of a "for every" claim is a "there exists" claim, so a single counterexample settles it — the identity element works.' }
    ],
    use: [
      { href: '#/primer/what-is-proof', label: 'Next track: what a proof actually is' },
      { href: '#/basics/ppt', label: 'PPT adversary and the security parameter' }
    ]
  },

  /* ------------------------------ writing proofs ------------------------------ */

  {
    id: 'what-is-proof',
    track: 'proof',
    title: 'What a proof actually is',
    oneline: 'An argument with no gaps, written for a sceptical reader.',
    body: [
      'A proof is a chain of statements where each one follows from the ones before it by a rule the reader already accepts, ending at the thing you claimed. That is the whole of it. It is not a calculation, not evidence, and not a demonstration that you tried hard.',
      'The point is not certainty for its own sake. It is that a proof **explains** why something is true, and that explanation tells you exactly what the result depends on. If a proof of a scheme uses only that the hash is collision-resistant, then swapping in any other collision-resistant hash is safe. That transferable knowledge is not something testing can give you.',
      'Cryptography needs this more than most fields, because you cannot test for the absence of an attack. Running an attack suite and finding nothing tells you about the attacks you thought of. A proof covers every efficient attacker at once, including the ones nobody has invented.',
      'Write for a specific reader: someone competent and unhurried who is not going to fill in your gaps for you and who will not accept a step because it seems plausible. Every "clearly" and "obviously" in a proof is a place where you have decided your reader will not check. Sometimes that is fine. Sometimes it is where the bug is.',
      'A proof also has a **shape**, and there are not many of them: direct, contrapositive, contradiction, induction, cases. Knowing which shape you are in tells you what your first line should be — which is why the next four lessons exist, and why the main app is organised around techniques rather than results.'
    ],
    jargon: [
      { t: 'theorem', p: 'the statement being proved' },
      { t: 'lemma', p: 'a smaller result proved on the way to a bigger one' },
      { t: 'hypothesis', p: 'what you are allowed to assume' },
      { t: 'QED / $\\qed$', p: 'the marker that the proof is finished' }
    ],
    example: {
      h: 'Evidence versus proof',
      body: [
        'Claim: every odd number is the difference of two consecutive squares.',
        '*Evidence*: $1 = 1 - 0$, $3 = 4 - 1$, $5 = 9 - 4$, $7 = 16 - 9$. Four cases, a clear pattern, no proof — the pattern could fail at the fifth case, and in other problems it does.',
        '*Proof*: let the odd number be $2k+1$ for an integer $k$. Then $(k+1)^{2} - k^{2} = k^{2} + 2k + 1 - k^{2} = 2k+1$. Since every odd number has the form $2k+1$, every odd number is such a difference. $\\qed$',
        'The proof also tells you *which* two squares, which the examples never would have. That extra information is typical: a proof usually hands you more than the statement asked for.'
      ]
    },
    check: [
      { q: 'Why is "we ran every known attack and none worked" not a security proof?',
        a: 'It only covers attacks someone already thought of. A proof quantifies over every efficient adversary, including future ones.' },
      { q: 'What does the word "clearly" usually mark in a draft proof?',
        a: 'A step the author decided not to justify. Sometimes justified, sometimes the location of the error — worth checking each one before submitting.' }
    ],
    use: [
      { href: '#/primer/direct', label: 'Next: the direct proof' }
    ]
  },

  {
    id: 'direct',
    track: 'proof',
    title: 'The direct proof',
    oneline: 'Assume the hypothesis, walk to the conclusion.',
    body: [
      'The default shape. To prove "if $P$ then $Q$": assume $P$, then derive $Q$ using definitions and things already proved. Most of the difficulty is in the first two lines, not the middle.',
      'The reliable opening move is to **unfold the definitions**. "Assume $n$ is even" is not usable; "assume $n = 2k$ for some integer $k$" is, because now you have an object to manipulate. Nearly every stuck proof in an early course is stuck because a definition has not been unfolded into a concrete form.',
      'Then work forwards from what you have and backwards from what you want, and try to meet in the middle. Writing the goal down explicitly — "I need to produce an integer $m$ with $x = 2m$" — turns a vague search into a specific target.',
      'Two habits keep the writing honest. Introduce every symbol before you use it ("let $k$ be an integer such that..."), and make sure each new line is justified by a previous line plus a named rule. If you cannot name why a line follows, that is a gap, not a style issue.',
      'In this app, a **reduction** is a direct proof in disguise: assume an attacker exists, construct a new algorithm from it, and derive that the assumption is broken. Same shape, with an algorithm in the middle instead of an equation.'
    ],
    jargon: [
      { t: 'unfold a definition', p: 'replace a word with the concrete condition it stands for' },
      { t: 'WLOG', p: 'without loss of generality — the remaining cases are identical by symmetry, and you should be able to say why' }
    ],
    example: {
      h: 'The sum of two even numbers is even',
      body: [
        '**Claim.** If $m$ and $n$ are even integers then $m+n$ is even.',
        '**Proof.** Assume $m$ and $n$ are even. By definition there are integers $a$ and $b$ with $m = 2a$ and $n = 2b$. *(The definitions are now unfolded into usable objects.)* Then $m + n = 2a + 2b = 2(a+b)$. Since $a+b$ is an integer, $m+n$ has the form $2 \\cdot (\\text{integer})$, which is the definition of even. $\\qed$',
        'Note what the proof does not do: it never tests a single number. It shows the property holds for *all* even $m,n$ simultaneously, because $a$ and $b$ were arbitrary.'
      ]
    },
    check: [
      { q: 'You must prove "if $x$ is a multiple of $6$ then $x$ is a multiple of $3$". What is line one?',
        a: '"Assume $x$ is a multiple of $6$; write $x = 6k$ for some integer $k$." Then $x = 3(2k)$, and $2k$ is an integer. Unfolding the definition is the whole proof.' },
      { q: 'Why does proving it for $m = 4$, $n = 6$ not prove the claim above?',
        a: 'Because the claim quantifies over all even integers. One instance is an example, not a proof — you need an argument that treats $m$ and $n$ as arbitrary.' }
    ],
    use: [
      { href: '#/learn/reduction', label: 'Security by reduction — a direct proof with an algorithm in it' }
    ]
  },

  {
    id: 'contrapositive',
    track: 'proof',
    title: 'Contrapositive and contradiction',
    oneline: 'Attack the statement from the other end — the shape almost every crypto proof takes.',
    body: [
      'Sometimes assuming $P$ gives you nothing to hold on to, while assuming $Q$ is false hands you a concrete object. Two closely related shapes exploit that.',
      '**Contrapositive.** Instead of proving $P \\implies Q$, prove $\\neg Q \\implies \\neg P$. These are logically equivalent, so a proof of either is a proof of both. Choose it when the negation of the conclusion is the more usable assumption.',
      '**Contradiction.** Assume the statement is false, derive something impossible, conclude the assumption was untenable. The engine is that a true statement cannot imply a false one, so if your only assumption leads somewhere absurd, that assumption has to go.',
      'Cryptography lives in this shape. "If DDH is hard then ElGamal is IND-CPA" is proved by assuming an efficient attacker breaks ElGamal and building from it an efficient algorithm that solves DDH — contradicting the hypothesis that DDH is hard. Formally it is the contrapositive: an attacker on the scheme yields an attacker on the assumption.',
      'Two warnings. First, contradiction proofs are easy to write badly, because any wrong step also produces a contradiction and you will happily conclude you were finished. Check that the absurdity you reached really follows. Second, do not reach for contradiction when a direct proof exists; the direct version is usually shorter and tells the reader more about why the result is true.'
    ],
    jargon: [
      { t: 'contradiction', p: 'a statement and its negation both derived — impossible, so something upstream was wrong' },
      { t: 'toward a contradiction', p: 'the standard opening phrase for the assumption you intend to destroy' }
    ],
    example: {
      h: 'Two classics, one crypto',
      body: [
        '**Contrapositive.** Claim: if $n^{2}$ is even then $n$ is even. Assuming $n^{2}$ is even gives you $n^{2} = 2k$, from which extracting anything about $n$ needs work. So prove the contrapositive: assume $n$ is odd, write $n = 2k+1$, and compute $n^{2} = 4k^{2} + 4k + 1 = 2(2k^{2}+2k) + 1$, which is odd. Hence $n^{2}$ odd, and the original claim follows. $\\qed$',
        '**Contradiction, in crypto shape.** Claim: if the DDH problem is hard in $\\G$ then ElGamal is IND-CPA secure. Suppose not: there is an efficient $\\A$ winning the IND-CPA game with non-negligible advantage. Build $\\B$ that takes a DDH challenge, dresses it up as an ElGamal public key and ciphertext, runs $\\A$, and reports what $\\A$ says. Then $\\B$ solves DDH efficiently and non-negligibly often — contradicting hardness. Therefore no such $\\A$ exists. $\\qed$',
        'The second proof is the first proof with an algorithm where the algebra was. That is all a reduction is.'
      ]
    },
    check: [
      { q: 'Give the contrapositive of "if the reduction is efficient then the assumption is broken".',
        a: '"If the assumption is not broken then the reduction is not efficient."' },
      { q: 'A proof by contradiction assumes an attacker with non-negligible advantage. What must the proof end by contradicting?',
        a: 'The hardness assumption stated in the theorem — you must exhibit an efficient algorithm that beats it, which is impossible if the assumption holds.' }
    ],
    use: [
      { href: '#/learn/reduction', label: 'Security by reduction' },
      { href: '#/proofs/elgamal', label: 'Worked proof: DDH implies ElGamal' }
    ]
  },

  {
    id: 'induction',
    track: 'proof',
    title: 'Induction, and why hybrids are induction',
    oneline: 'Prove step one, prove that each step carries to the next, get all of them.',
    body: [
      'Induction proves a statement $P(n)$ for every natural number $n$ using two pieces. The **base case**: $P(0)$ (or $P(1)$) holds. The **inductive step**: for every $n$, if $P(n)$ holds then $P(n+1)$ holds. Together they give $P(n)$ for all $n$ — the dominoes are set up and the first is pushed.',
      'The assumption "$P(n)$ holds" inside the step is the **induction hypothesis**. It is not circular: you are not assuming what you want to prove, you are proving a conditional, one that says the property is inherited from each number to the next.',
      'Cryptography uses this in a specific and important way. A **hybrid argument** proves that two far-apart distributions are indistinguishable by building a chain of intermediate ones, $\\Hyb_0, \\Hyb_1, \\ldots, \\Hyb_q$, where consecutive ones differ in exactly one small place. Each neighbouring pair is close by the assumption; the chain then transfers closeness from one end to the other.',
      'The one thing you must check is the count. Each link costs you a little, and the total cost is roughly $q$ times the per-link cost. If $q$ is polynomial in $\\lambda$, a polynomial times a negligible is negligible and the argument goes through. If $q$ were exponential — say a hybrid per key — the sum proves nothing at all. "Is $q$ polynomial?" is the question to ask before writing any hybrid proof.',
      'The same discipline applies in ordinary induction: an induction that loses a constant factor per step has lost $2^{n}$ by step $n$. Always look at what accumulates.'
    ],
    jargon: [
      { t: 'base case', p: 'the first instance, proved outright' },
      { t: 'induction hypothesis', p: 'the assumption that the claim holds at n, used to get n+1' },
      { t: '$\\Hyb_i$', p: 'the i-th hybrid: an intermediate game between the two you care about' }
    ],
    example: {
      h: 'From the classic to the crypto version',
      body: [
        '**Classic.** Claim: $1 + 2 + \\cdots + n = \\frac{n(n+1)}{2}$. Base case $n = 1$: the left side is $1$, the right side is $\\frac{1 \\cdot 2}{2} = 1$. Step: assume it holds at $n$. Then $1 + \\cdots + n + (n+1) = \\frac{n(n+1)}{2} + (n+1) = \\frac{n(n+1) + 2(n+1)}{2} = \\frac{(n+1)(n+2)}{2}$, which is the formula at $n+1$. $\\qed$',
        '**Crypto.** Claim: a scheme secure for one encryption is secure for $q$ encryptions. Define $\\Hyb_i$ as the game where the first $i$ ciphertexts encrypt the left messages and the remaining $q - i$ encrypt the right ones. Then $\\Hyb_0$ is the all-right game and $\\Hyb_q$ is the all-left game, and consecutive hybrids differ in a single ciphertext — precisely what one-message security covers. So each neighbouring gap is at most $\\varepsilon$, and the total is at most $q \\cdot \\varepsilon$, negligible whenever $q$ is polynomial.',
        'Same skeleton: a base, a step that moves one notch, and a count that has to stay under control.'
      ]
    },
    check: [
      { q: 'A hybrid argument has one hybrid per possible key, i.e. $2^{\\lambda}$ of them. Is it valid?',
        a: 'No. Summing exponentially many negligible gaps gives no bound. The chain must have polynomial length.' },
      { q: 'What plays the role of the base case in a hybrid argument?',
        a: 'Checking that $\\Hyb_0$ really is the first real game and $\\Hyb_q$ really is the target game. Both endpoints have to be verified against the actual definitions — a very common place to slip.' }
    ],
    use: [
      { href: '#/learn/hybrid', label: 'Hybrid argument — the full technique' },
      { href: '#/proofs/prg-hybrid', label: 'Worked proof: the hybrid ladder' }
    ]
  },

  {
    id: 'cases',
    track: 'proof',
    title: 'Cases, counterexamples, and moves that do not work',
    oneline: 'Splitting a proof honestly, disproving in one line, and the four ways proofs go wrong.',
    body: [
      '**Proof by cases.** When the situation splits, prove each branch separately — but the branches must be *exhaustive*. "Either the adversary queried the hash at $x^{*}$ or it did not" is a legal split because nothing else is possible. Say explicitly why your cases cover everything; a missed case is a hole no amount of detail in the other branches will fill.',
      '**Disproof by counterexample.** To refute "for every $x$, $P(x)$", exhibit one $x$ where $P$ fails, and verify the failure. That is a complete disproof — no general argument needed. It is also how you should test any construction you suspect is broken before trying to prove it secure: spend ten minutes looking for the counterexample first.',
      'Now the failure modes, in rough order of how often they appear in submitted work.',
      '**Assuming the conclusion.** Somewhere in the middle, a line uses the thing being proved. Common in game hops: a step "because the ciphertext looks random" is illegitimate if looking random is what you are trying to establish.',
      '**Using something you were not given.** In crypto this is concrete and checkable: your reduction writes down the secret key, but the reduction was never handed a secret key. If an algorithm you construct uses a value, trace where that value came from. This single check catches more broken reductions than any other.',
      '**A gap papered over.** "Clearly the distributions are identical." Are they? Identical, or only close? If close, how close — the difference has to appear in the final bound rather than evaporating.',
      '**Quantifier drift.** Proving "there exists an adversary that fails" when the claim was "every adversary fails". Re-read your first line against the definition after you finish.'
    ],
    jargon: [
      { t: 'exhaustive cases', p: 'the branches cover every possibility, with nothing left over' },
      { t: 'counterexample', p: 'a single instance where the claim fails, which disproves it outright' },
      { t: 'circular', p: 'the proof uses the thing it is trying to prove' }
    ],
    example: {
      h: 'A one-line disproof',
      body: [
        '**Claim (false).** If $G$ is a secure PRG then $G\'(s) = G(s) \\| s_1$ is a secure PRG, where $s_1$ is the first bit of the seed.',
        '**Disproof.** The claim is quantified over every secure $G$, so one bad $G$ settles it. Start from any secure PRG $G_1$ on $\\lambda - 1$ bits and set $G(s) = s_1 \\| G_1(s_2 \\cdots s_\\lambda)$. This $G$ is still secure: $s_1$ is a uniform bit independent of the seed $G_1$ actually uses, so its output is a uniform bit followed by a pseudorandom string.',
        'Now look at $G\'(s) = G(s) \\| s_1 = s_1 \\| G_1(s_2 \\cdots s_\\lambda) \\| s_1$. Its first and last bits are always equal. The distinguisher $\\D$ that outputs $1$ exactly when they match says $1$ with probability $1$ on $G\'$ output and $1/2$ on a uniform string, so $\\Adv(\\D) = 1/2$ — very far from negligible.',
        'One counterexample killed a general claim, in a paragraph rather than a page. Notice also what the disproof needed: not "$G\'$ feels leaky", but a specific $G$, a specific $\\D$, and its advantage computed. Always spend ten minutes hunting for this before you start proving.'
      ]
    },
    check: [
      { q: 'Your case split is "the adversary wins" and "the adversary loses badly". What is wrong?',
        a: 'Not exhaustive — there is a middle. Cases must partition every possibility, and a vague word like "badly" is a sign the split is not well defined.' },
      { q: 'Which single check catches the most broken reductions?',
        a: 'Trace every value the reduction uses back to something it was actually given or generated. A reduction that quietly uses the secret key is the classic failure.' }
    ],
    use: [
      { href: '#/drill', label: 'Spot-the-flaw drills' },
      { href: '#/checklist', label: 'The pre-submission checklist' }
    ]
  },

  {
    id: 'writing',
    track: 'proof',
    title: 'Writing it down so it reads as a proof',
    oneline: 'Structure, signposting, and sentences — the marks lost here are the cheapest to keep.',
    body: [
      'A correct argument in your head and a proof on the page are different artefacts. The gap is mostly mechanical, which means the marks lost there are the easiest to recover.',
      '**State before you prove.** Write the claim in full: the assumption, the model (standard model or random-oracle model), and the exact security notion. A theorem statement missing its assumption is not a theorem.',
      '**Announce the shape in the first sentence.** "We proceed by a sequence of games." "Suppose toward a contradiction..." "We construct a simulator $\\Sim$." The reader now knows what to expect and can follow the rest at speed.',
      '**Introduce every symbol.** "Let $q$ denote the number of hash queries made by $\\A$." A symbol that appears without introduction forces the reader to guess, and guessing is where they stop believing you.',
      '**Write sentences.** A proof is prose with mathematics in it, not a column of formulas. Each displayed line should be reachable from the last by a stated reason: "by the union bound", "since $f$ is a bijection", "because $\\B$ never queried $x$".',
      '**Finish the accounting.** End with a single displayed inequality that collects every loss — the $1/q$ from guessing which query mattered, the birthday term, the factor of $2$ from the advantage convention. Then say what it means: this is negligible, hence the claim. A proof that trails off after the interesting step is incomplete, even when every idea in it is right.',
      'One more, specific to this subject: fix an advantage convention at the start and hold it. Whether $\\Adv = |\\Pr[\\text{win}] - 1/2|$ or the doubled distinguishing version, both appear in textbooks, they differ by a factor of $2$, and mixing them mid-proof is the most common bookkeeping error there is.'
    ],
    jargon: [
      { t: 'standard model', p: 'no idealised components — no random oracle' },
      { t: 'ROM', p: 'random-oracle model: the hash is treated as a perfectly random function everyone queries' },
      { t: 'tight', p: 'the reduction loses only a small constant factor, not a factor of q' }
    ],
    example: {
      h: 'The skeleton of a written proof',
      body: [
        '**Theorem.** If $F$ is a secure PRF, then $\\Pi$ is IND-CPA secure in the standard model. Concretely, for every PPT $\\A$ making $q$ queries there is a PPT $\\B$ with $\\Adv^{\\text{ind-cpa}}_{\\Pi,\\A}(\\lambda) \\le 2\\Adv^{\\text{prf}}_{F,\\B}(\\lambda) + \\frac{q^{2}}{2^{n}}$.',
        '*Proof.* We proceed by a sequence of games. Let $S_i$ be the event that $\\A$ wins in $\\Game_i$. **Game 0** is the real experiment, so $\\Adv = |\\Pr[S_0] - 1/2|$. **Game 1** replaces $F_k$ by a random function; the gap is $\\Adv^{\\text{prf}}(\\B)$ for the distinguisher $\\B$ we exhibit below. **Game 2** ... In $\\Game_2$ the challenge bit is never used, so $\\Pr[S_2] = 1/2$ exactly. Collecting the gaps by the triangle inequality gives the bound stated. $\\qed$',
        'Notice how much of that is scaffolding rather than mathematics — and that the scaffolding is what makes the mathematics checkable. The **Build** tab in this app generates exactly this skeleton for you.'
      ]
    },
    check: [
      { q: 'Your theorem says "the scheme is secure". What is missing?',
        a: 'The assumption it rests on, the model, and the precise notion — for example "IND-CPA secure in the standard model, assuming $F$ is a secure PRF".' },
      { q: 'Why fix the advantage convention in the first paragraph?',
        a: 'The two standard conventions differ by a factor of $2$. Fixing one and stating it prevents the single most common bookkeeping error in a submitted proof.' }
    ],
    use: [
      { href: '#/build', label: 'Proof builder — generates this skeleton' },
      { href: '#/checklist', label: 'Before you submit' }
    ]
  },

  /* ------------------------------ crypto ideas ------------------------------ */

  {
    id: 'why-prove',
    track: 'crypto',
    title: 'Why cryptography has to be proved',
    oneline: 'You cannot test for the absence of an attack.',
    body: [
      'In most of software, you convince yourself something works by running it. Cryptography cannot do that, and the reason is structural rather than cultural.',
      'Suppose you build an encryption scheme and hand it to twenty clever people who fail to break it. What have you learned? That those twenty people, in that amount of time, with the ideas they happened to have, did not find an attack. The attacker you actually face is not on the list. History is full of schemes that survived years of scrutiny and then fell to one new idea.',
      'A proof changes the quantifier. Instead of "these attacks failed", it says "**every** efficient attack fails", covering attacks nobody has thought of yet. That is a claim only a mathematical argument can support.',
      'But a proof of what, exactly? Nobody can prove that discrete log is hard — that would settle open problems in complexity theory. So cryptography proves **conditional** statements: *if* this well-studied problem is hard, *then* this scheme is secure. The value is real even though the hypothesis is unproved. It moves all the risk into one clearly labelled place, a problem that specialists have attacked for decades, and it guarantees your scheme adds no new weakness of its own.',
      'That is why every theorem in this app has the same silhouette: **assumption $\\implies$ scheme is secure**. The work of the proof is building a bridge from any break of the scheme back to a break of the assumption. If someone breaks the scheme, they have broken the famous problem too — so you may as well trust the scheme as much as you trust the problem.'
    ],
    jargon: [
      { t: 'assumption', p: 'a problem everyone believes is hard but nobody has proved is hard' },
      { t: 'provable security', p: 'proving "if the assumption holds then the scheme is secure"' },
      { t: 'reduction', p: 'the bridge: turning an attack on the scheme into an attack on the assumption' }
    ],
    example: {
      h: 'What the theorem is really promising',
      body: [
        '"If DDH is hard in $\\G$ then ElGamal is IND-CPA secure" does **not** promise ElGamal is unbreakable. It promises something more precise and more useful: any efficient attacker breaking ElGamal can be mechanically converted into an efficient algorithm solving DDH.',
        'So ElGamal is exactly as strong as DDH — no stronger, and importantly no weaker. All the doubt is now concentrated in one much-studied problem instead of being spread across the details of your scheme.',
        'It also tells you what would invalidate it: not a clever attack on ElGamal specifically, but a break of DDH. That is why DDH is false in pairing-friendly groups, and why the theorem simply does not apply there.'
      ]
    },
    check: [
      { q: 'Does "if factoring is hard then RSA-OAEP is secure" prove RSA-OAEP is secure?',
        a: 'No — it proves a conditional. If factoring turns out to be easy, the theorem still holds but says nothing useful. The security rests on the assumption.' },
      { q: 'Why prove security relative to the *weakest* assumption that suffices?',
        a: 'A weaker assumption is more likely to be true, so the theorem is stronger. Proving something from DDH when CDH would do gives you a worse result.' }
    ],
    use: [
      { href: '#/basics/assumptions', label: 'Standard hardness assumptions' }
    ]
  },

  {
    id: 'keys',
    track: 'crypto',
    title: 'Keys, randomness, and Kerckhoffs',
    oneline: 'The secret is the key, and it has to be genuinely random.',
    body: [
      '**Kerckhoffs\'s principle**: the design of the system is public, and only the key is secret. This is not an ethical stance, it is engineering. Algorithms leak — through reverse engineering, staff turnover, patents, standards documents. Keys can be rotated when they leak; a secret design cannot. So every definition in cryptography hands the full description of the scheme to the attacker and keeps back only $k$.',
      'The **key space** is the set keys are drawn from, usually $\\bits^{\\lambda}$. The key is drawn **uniformly at random**, written $k \\rand \\bits^{\\lambda}$, and both words carry weight. *Uniform*: every key equally likely, so brute-force guessing costs the full $2^{\\lambda}$ on average. *Random*: unpredictable to the attacker, which means from a proper source of entropy, not from the current time or a fixed test value.',
      'Randomness appears in a second role that beginners often merge with the first. Beyond the key, encryption itself usually consumes fresh random bits per message — a nonce, an IV, an ephemeral exponent. This is why the same message encrypted twice must give different ciphertexts: a deterministic scheme lets an attacker see that two ciphertexts are equal, which already breaks the definition of IND-CPA.',
      'Reusing that per-message randomness is a catastrophe rather than a weakness. Reuse a one-time pad key and the two ciphertexts XOR to the XOR of the plaintexts. Reuse a CTR-mode nonce and you have done the same thing. Reuse the ephemeral value in ECDSA and the private key falls out of two signatures with simple algebra. The proofs of these schemes all contain a step assuming freshness, and the attacks are just that step failing.',
      'So when a security game writes $k \\rand \\bits^{\\lambda}$ and samples a fresh $r$ for every encryption, it is encoding two real-world requirements at once. Both are load-bearing.'
    ],
    jargon: [
      { t: 'Kerckhoffs\'s principle', p: 'assume the attacker knows the algorithm; only the key is secret' },
      { t: 'key space', p: 'the set of possible keys, typically $\\bits^{\\lambda}$' },
      { t: 'nonce / IV', p: 'a per-message value that must never repeat under the same key' },
      { t: 'entropy', p: 'genuine unpredictability, measured in bits' }
    ],
    example: {
      h: 'What happens when a pad is reused',
      body: [
        'One-time pad: $c = m \\oplus k$, where $\\oplus$ is bitwise XOR. Used once with a fresh uniform $k$, this is perfectly secret — the ciphertext is uniform regardless of $m$, so it carries no information at all.',
        'Now encrypt two messages with the same $k$: $c_1 = m_1 \\oplus k$ and $c_2 = m_2 \\oplus k$. The attacker computes $c_1 \\oplus c_2 = m_1 \\oplus m_2$, since the two copies of $k$ cancel. The key never appears, and the relationship between the plaintexts is exposed; with any knowledge of English, both messages usually fall out.',
        'The name "one-**time** pad" is the entire security argument compressed into a word, and the proof breaks at precisely the step that assumed $k$ was fresh.'
      ]
    },
    check: [
      { q: 'Why must a secure encryption scheme be randomised?',
        a: 'A deterministic scheme sends equal plaintexts to equal ciphertexts, so an attacker who sees a repeat learns the messages were equal. That alone loses the IND-CPA game.' },
      { q: 'The attacker knows your algorithm in every definition here. Why concede that?',
        a: 'Kerckhoffs: algorithms leak and cannot be rotated, keys can. Security that depends on a secret design is not security you can maintain.' }
    ],
    use: [
      { href: '#/proofs/otp', label: 'Worked proof: one-time-pad key length is optimal' }
    ]
  },

  {
    id: 'adversary',
    track: 'crypto',
    title: 'Adversaries and oracles',
    oneline: 'The attacker is an algorithm with a budget and a vending machine.',
    body: [
      'The **adversary** $\\A$ is not a person or a threat model. It is an algorithm: it receives an input, may flip coins, does a bounded amount of work, and outputs something. Nothing more mysterious than that.',
      'Its budget is written **PPT** — probabilistic polynomial time. *Probabilistic*: it may use randomness. *Polynomial time*: its running time is at most $\\lambda^{c}$ for some constant, i.e. affordable. Quantifying over all PPT algorithms is what makes a security proof cover attacks nobody has invented: it does not matter how the attack works, only that it is efficient.',
      'An **oracle** models the access the attacker gets in the real world. Written as a superscript, $\\A^{\\Enc_k(\\cdot)}$ means "$\\A$ runs, and whenever it likes it may hand over a message and immediately receive its encryption". Think of a vending machine: put an input in, get the output out, learn nothing about the internals. The oracle is how a definition says "the attacker can get things encrypted without ever seeing the key".',
      'The two facts that matter about oracles: each call costs one unit of the query budget $q$, and $q$ must be polynomial; and the attacker sees **only** the outputs, never the machinery inside. That second fact is the leverage every reduction runs on. If your reduction can answer every oracle call convincingly, the attacker cannot tell it is talking to a simulation rather than the real challenger — and then the attacker works just as well for you as it did for its intended target.',
      'Definitions also fence the oracle with restrictions, and those are load-bearing rather than decorative. In IND-CCA the attacker may decrypt anything **except** the challenge ciphertext; without that fence the game is trivially winnable and the definition would be empty. In EUF-CMA the forgery must be on a message never sent to the signing oracle. When you read a definition, read its restrictions twice.'
    ],
    jargon: [
      { t: '$\\A$', p: 'the adversary — an arbitrary efficient algorithm' },
      { t: 'PPT', p: 'probabilistic polynomial time: randomised and efficient' },
      { t: '$\\A^{\\calO(\\cdot)}$', p: 'A with oracle access to O — it may query O and receive answers' },
      { t: '$q$', p: 'the number of queries, always polynomial in the security parameter' },
      { t: 'challenger', p: 'the other side of the game: it holds the key and runs the rules' }
    ],
    example: {
      h: 'Reading one line of notation',
      body: [
        'The line: $(m_0, m_1) \\gets \\A^{\\Enc_k(\\cdot)}(1^{\\lambda})$.',
        'In English: the adversary is started with the security parameter as input (written $1^{\\lambda}$, a string of $\\lambda$ ones, purely so that "polynomial in the input length" means "polynomial in $\\lambda$"). While running, it may ask for encryptions of any messages it chooses and get them back. Eventually it outputs two messages, $m_0$ and $m_1$.',
        'What it never gets: the key $k$, or any view of how encryption works internally. That is why the reduction later on can replace the real encryption oracle with something it can compute itself — the adversary has no way to look inside.'
      ]
    },
    check: [
      { q: 'Why is the adversary given $1^{\\lambda}$ instead of $\\lambda$?',
        a: 'Running time is measured against input length. Writing $\\lambda$ in binary takes $\\log \\lambda$ bits, so "polynomial in the input" would mean polynomial in $\\log \\lambda$ — far too weak. The unary string makes the input length $\\lambda$.' },
      { q: 'In IND-CCA, why is the adversary barred from decrypting the challenge ciphertext?',
        a: 'Otherwise it just decrypts it and reads the answer, winning always. The restriction is what leaves the definition with content.' }
    ],
    use: [
      { href: '#/basics/ppt', label: 'PPT adversary and the security parameter' },
      { href: '#/basics/games', label: 'Security games and experiment notation' }
    ]
  },

  {
    id: 'game',
    track: 'crypto',
    title: 'Security games and advantage',
    oneline: 'A definition is a game with rules, and security means you cannot beat a coin flip.',
    body: [
      'Every security definition in this app is a **game** between a challenger and the adversary. The challenger sets up keys and enforces the rules; the adversary interacts and finally outputs something; a stated condition decides who won. Writing the game out line by line, like code, is the single most useful habit in this subject — most proof bugs become visible only once the game is written down explicitly.',
      'There are two flavours. **Decision games** hide a bit $b$ and ask the adversary to guess it: is this the encryption of $m_0$ or $m_1$? Is this a PRF output or a random string? **Search games** ask the adversary to produce something: a forged tag, a preimage, a collision.',
      'This is where **advantage** comes in, and the difference between the flavours is the thing beginners most often get wrong. In a decision game, guessing already wins half the time, so the score that matters is the distance above that: $\\Adv(\\A) = |\\Pr[\\A \\text{ wins}] - 1/2|$. In a search game there is nothing to subtract — guessing a valid forgery does not happen by accident — so $\\Adv(\\A) = \\Pr[\\A \\text{ wins}]$.',
      'One wrinkle worth meeting now, because it is the most common bookkeeping error in submitted proofs. A decision game can equivalently be scored in **distinguishing** form: $|\\Pr[\\A(\\text{left}) = 1] - \\Pr[\\A(\\text{right}) = 1]|$. That measures the same thing but comes out exactly twice as large. Both conventions are standard, textbooks differ, and the fix is to pick one at the start of your proof and never mix them.',
      '"Secure" then means: for every PPT adversary, the advantage is negligible. Not zero — a lucky guesser exists — but too small to matter, forever, as $\\lambda$ grows.',
      'Reading a game for leverage is a skill you can practise. Ask: what does the adversary *not* see? Which single line would you have to change to make the game unwinnable outright? That line is almost always where the proof\'s first move goes.'
    ],
    jargon: [
      { t: '$\\Exp$ / $\\Game$', p: 'the experiment: the game written out as code' },
      { t: '$b \\rand \\bits$', p: 'the challenger flips a fair coin for the hidden bit' },
      { t: '$b\'$', p: 'the adversary\'s guess at the hidden bit' },
      { t: '$\\Adv$', p: 'how much better than guessing the adversary does' },
      { t: 'IND-CPA', p: 'indistinguishability under chosen-plaintext attack — the game below' }
    ],
    example: {
      h: 'IND-CPA, line by line and then in English',
      body: [
        '$k \\gets \\Gen(1^{\\lambda})$; $(m_0, m_1) \\gets \\A^{\\Enc_k(\\cdot)}(1^{\\lambda})$ with $|m_0| = |m_1|$; $b \\rand \\bits$; $c \\gets \\Enc_k(m_b)$; $b\' \\gets \\A^{\\Enc_k(\\cdot)}(c)$; the adversary wins iff $b\' = b$.',
        'In English: a key is generated. The adversary gets to encrypt whatever it likes, as often as it likes, then names two messages of equal length. The challenger secretly flips a coin, encrypts whichever message the coin selected, and hands back the ciphertext. The adversary may keep using its encryption oracle, and finally guesses which message was encrypted. It wins if it guessed right.',
        'The equal-length requirement is not a technicality to skim past: ciphertext length usually reveals plaintext length, so without it every scheme loses and the definition would be unsatisfiable.',
        'Since a coin flip wins half the time, the scheme is secure exactly when no efficient adversary gets meaningfully past $1/2$ — that is, when $|\\Pr[b\' = b] - 1/2|$ is negligible.'
      ]
    },
    check: [
      { q: 'A forger wins the EUF-CMA game with probability $1/2$. What is its advantage?',
        a: '$1/2$. Search game: there is no $1/2$ to subtract, because guessing a valid forgery is not a free half. Subtracting here is a very common slip.' },
      { q: 'Why must $|m_0| = |m_1|$ in the IND-CPA game?',
        a: 'Ciphertext length leaks plaintext length in essentially every real scheme. Without the restriction the adversary wins by measuring, and no scheme could satisfy the definition.' },
      { q: 'Your proof reaches a final game where the hidden bit is never used. What is $\\Pr[\\A \\text{ wins}]$ there?',
        a: 'Exactly $1/2$. The adversary\'s view is independent of $b$, so it is guessing. Reaching such a game is the goal of a game-hopping proof.' }
    ],
    use: [
      { href: '#/basics/games', label: 'Security games and experiment notation' },
      { href: '#/basics/advantage', label: 'Advantage — the formal statement' }
    ]
  },

  {
    id: 'reduction-idea',
    track: 'crypto',
    title: 'What a reduction is, without symbols',
    oneline: 'Borrow the attacker, use it as a component, break something famous.',
    body: [
      'This is the central idea of the whole subject, and it is genuinely simple once separated from its notation.',
      'You want to show your scheme is secure. You cannot prove that outright, so you argue by consequence: *if* someone could break my scheme, *then* I could use them to solve a problem everybody agrees is unsolvable. Since that problem is unsolvable, nobody can break my scheme.',
      'An analogy that survives scrutiny. Suppose someone claims a machine that reliably picks tomorrow\'s winning lottery numbers. You need not inspect the machine. You reason: if it worked, I could use it to become arbitrarily rich, and arbitrarily-rich-making machines do not exist. The machine does not work. Crucially you proved this **without understanding the machine at all** — you only used what it outputs. A reduction does exactly that with an attacker.',
      'Mechanically there are four moves. You are handed a challenge from the hard problem. You **dress it up** so it looks to the attacker exactly like the scheme it expects to attack. You **answer all its questions** — every oracle query — using only what you were given, never a secret you do not have. And you **translate its answer** into an answer for the hard problem.',
      'The two places reductions go wrong are worth memorising now, because you will meet them constantly. First: the disguise has to be perfect. If the attacker\'s view differs at all from the real game, it may simply refuse to work, and your proof has to argue the view is identical — or bound how far off it is and carry that into the final bound. Second: you must be able to answer every query without secrets you were never given. A reduction that writes down the secret key it never received is broken, and this is the first thing to check in anyone\'s proof, including your own.',
      'Everything in the **Techniques** tab is this idea with extra structure. Game hopping is a chain of small reductions. A hybrid argument is a reduction repeated along a ladder. Identical-until-bad is a reduction plus a probability bound on the case where the disguise slips. Learn this one and the rest are variations.'
    ],
    jargon: [
      { t: '$\\B$', p: 'the reduction: the algorithm you build, which runs $\\A$ inside itself' },
      { t: 'embedding', p: 'placing the challenge inside the view you show the adversary' },
      { t: 'simulation', p: 'answering the adversary\'s queries without the real secrets' },
      { t: 'tight', p: 'the reduction loses only a small factor — the bound stays strong' }
    ],
    example: {
      h: 'The shape, with the algebra left out',
      body: [
        'Claim: if DDH is hard then ElGamal is IND-CPA.',
        '**Given.** $\\B$ receives a DDH challenge: three group elements, and it must decide whether the third is $g^{xy}$ or random.',
        '**Dress up.** $\\B$ publishes the first element as the public key and builds a challenge ciphertext out of the second and third. To $\\A$, this is an ordinary ElGamal public key and ciphertext.',
        '**Answer questions.** ElGamal is public-key, so $\\A$ can encrypt for itself and there is nothing to simulate. (In other proofs this is the hard step.)',
        '**Translate.** If the third element really was $g^{xy}$, $\\A$ is playing the real game and its guess is meaningful. If it was random, the ciphertext hides the message perfectly and $\\A$ is guessing at $1/2$. So $\\B$ outputs "real" exactly when $\\A$ guesses correctly, and $\\B$\'s edge on DDH is $\\A$\'s edge on ElGamal.',
        'No property of $\\A$ was used beyond "it wins more often than chance". That is why the proof covers every efficient attacker at once.'
      ]
    },
    check: [
      { q: 'In one sentence, what does a reduction prove?',
        a: 'That breaking the scheme is at least as hard as solving the underlying problem — because any break can be converted into a solution.' },
      { q: 'Your reduction answers a decryption query by running $\\Dec_k$. What should you check?',
        a: 'Whether it ever received $k$. Usually it did not, and the proof is broken. Simulating with a secret you were not given is the classic error.' },
      { q: 'Why does the disguise have to be indistinguishable from the real game?',
        a: 'The attacker only promises to work against the real game. Show it something detectably different and it is entitled to do nothing useful — so your bound would not follow.' }
    ],
    use: [
      { href: '#/learn/reduction', label: 'Security by reduction — the full skeleton' },
      { href: '#/proofs/prg-onetime', label: 'A first worked proof, annotated' }
    ]
  },

  {
    id: 'where-next',
    track: 'crypto',
    title: 'Where to go from here',
    oneline: 'A map of the rest of the app, and the order that works.',
    body: [
      'You now have the vocabulary the rest of this app is written in: sets and strings, probability and the number $1/2$, growth rates and negligible, quantifiers, the five proof shapes, adversaries, games, advantage, and the reduction idea. That is enough to read every page here — slowly at first, which is normal.',
      'A route that works. **One:** read the **Foundations** tab, all ten definitions, without trying to memorise them. You have met most of the ideas here in plain language, and this is the same content in the notation your course uses.',
      '**Two:** read one worked proof end to end — start with *PRG one-time secrecy*, which is the shortest. Every step carries a "why this step" note naming the move that produced it. Read the why lines first; they are the actual lesson.',
      '**Three:** read *Security by reduction* in the **Techniques** tab, then go back to that same proof and identify each skeleton step in it. Techniques become real when you can point at them in a proof you have already read.',
      '**Four:** run the **Drill** tab, warm-up set first. Getting a question wrong here is cheap and is how the distinctions stick.',
      '**Five:** open the **Build** tab and generate a skeleton for a problem you actually have. Filling in a structurally correct outline is far easier than facing a blank page, and it will show you which parts of your argument are still vague.',
      'Two standing habits. Whenever a symbol stops you, the **Notation** page decodes it. Whenever a page is too dense, the plain-English box at the top of every technique, definition and proof says the same thing without the machinery. Neither is cheating; being fluent in the notation is a consequence of reading, not a prerequisite for it.'
    ],
    jargon: [],
    example: {
      h: 'A realistic first week',
      body: [
        '**Day 1.** This primer, the ground-floor track. **Day 2.** The proofs track, plus the Foundations pages on negligible functions, PPT and advantage.',
        '**Day 3.** The crypto track here, then the *PRG one-time secrecy* worked proof, twice — once for the story, once tracking every symbol.',
        '**Day 4.** *Security by reduction*, then the *PRF implies IND-CPA for CTR mode* proof. **Day 5.** Warm-up drills, then technique drills. **Day 6.** Build a skeleton for a real problem set question and fill it in. **Day 7.** Spot-the-flaw drills, then the checklist.',
        'Nobody absorbs this on one pass. The second reading of a proof you already met is where it turns from symbols into argument.'
      ]
    },
    check: [
      { q: 'A page uses a symbol you do not recognise. What is the fastest fix?',
        a: 'The Notation page, reachable from Basics — it lists every symbol this app uses with a plain reading.' },
      { q: 'You have read a technique but cannot use it. What is the next step?',
        a: 'Open a worked proof that uses it and match each skeleton step to a step in the proof. Techniques only become usable once you can see one in action.' }
    ],
    use: [
      { href: '#/basics', label: 'Foundations — the ten definitions' },
      { href: '#/proofs/prg-onetime', label: 'Start with the shortest worked proof' },
      { href: '#/glossary', label: 'Notation decoder' }
    ]
  }
];

/* The notation decoder. Every symbol the app uses, with how you say it aloud. */
window.CP_GLOSSARY = [
  { g: 'Sets, strings and functions', items: [
    { s: '$\\{0,1\\}$', n: 'the set containing 0 and 1', p: 'braces list the elements of a set' },
    { s: '$\\bits^{n}$', n: 'bit strings of length n', p: 'all rows of n zeros and ones; there are $2^{n}$ of them' },
    { s: '$\\bits^{*}$', n: 'bit strings of any length', p: 'no length restriction, but always finite' },
    { s: '$x \\in S$', n: 'x is in S', p: 'x is one of the elements of the set S' },
    { s: '$|S|$', n: 'size of S', p: 'how many elements S has. On a string, its length instead' },
    { s: '$f : X \\to Y$', n: 'f maps X to Y', p: 'f takes an input from X and returns an output in Y' },
    { s: '$x \\| y$', n: 'x concat y', p: 'the two strings glued end to end' },
    { s: '$\\oplus$', n: 'XOR', p: 'bitwise exclusive or; its own inverse, which is why pads cancel' },
    { s: '$1^{\\lambda}$', n: 'unary lambda', p: 'a string of $\\lambda$ ones, used so "polynomial in the input" means polynomial in $\\lambda$' }
  ]},
  { g: 'Numbers and groups', items: [
    { s: '$\\N, \\Z, \\R$', n: 'naturals, integers, reals', p: 'the usual number systems' },
    { s: '$\\Z_n$', n: 'integers mod n', p: 'the values $0$ to $n-1$, arithmetic wrapping at n' },
    { s: '$a \\equiv b \\pmod n$', n: 'a is congruent to b mod n', p: 'a and b leave the same remainder when divided by n' },
    { s: '$\\G$', n: 'a group', p: 'a set with one well-behaved operation; in crypto, usually of prime order' },
    { s: '$g$', n: 'a generator', p: 'an element whose powers sweep out the whole group' },
    { s: '$g^{x}$', n: 'g to the x', p: 'g combined with itself x times. Easy forwards, hard to reverse' }
  ]},
  { g: 'Probability', items: [
    { s: '$\\Pr[E]$', n: 'probability of E', p: 'a number between 0 and 1' },
    { s: '$x \\rand S$', n: 'x sampled uniformly from S', p: 'every element of S equally likely' },
    { s: '$x \\gets \\A(y)$', n: 'x is the output of A on y', p: 'plain arrow: the result of running an algorithm, which may itself be randomised' },
    { s: '$\\Pr[E \\mid F]$', n: 'probability of E given F', p: 'the chance of E once F is known to have happened' },
    { s: '$\\E$', n: 'expectation', p: 'the average value of a random quantity' },
    { s: '$\\Delta(X,Y)$', n: 'statistical distance', p: 'how far apart two distributions are, even for an unbounded observer' }
  ]},
  { g: 'Growth and efficiency', items: [
    { s: '$\\lambda$', n: 'security parameter', p: 'roughly the key length; every other quantity is measured against it' },
    { s: 'PPT', n: 'probabilistic polynomial time', p: 'the formal definition of an efficient, randomised algorithm' },
    { s: '$\\poly(\\lambda)$', n: 'some polynomial', p: 'an affordable amount of work or queries' },
    { s: '$\\negl(\\lambda)$', n: 'some negligible function', p: 'shrinks faster than one over any polynomial' },
    { s: '$q$', n: 'the query count', p: 'how many oracle calls the adversary makes; always polynomial' }
  ]},
  { g: 'The players', items: [
    { s: '$\\A$', n: 'the adversary', p: 'an arbitrary efficient algorithm trying to win the game' },
    { s: '$\\B$', n: 'the reduction', p: 'the algorithm you build, which runs $\\A$ inside itself' },
    { s: '$\\D$', n: 'the distinguisher', p: 'an adversary whose job is to tell two things apart' },
    { s: '$\\Sim$', n: 'the simulator', p: 'produces a convincing view without access to the secrets' },
    { s: '$\\A^{\\calO(\\cdot)}$', n: 'A with oracle access to O', p: 'A may query O and see only the answers' }
  ]},
  { g: 'Games and security', items: [
    { s: '$\\Exp$, $\\Game_i$', n: 'experiment, game i', p: 'the security game written out as code' },
    { s: '$\\Hyb_i$', n: 'hybrid i', p: 'an intermediate distribution in a hybrid argument' },
    { s: '$\\Adv$', n: 'advantage', p: 'how far past guessing the adversary gets' },
    { s: '$b$, $b\'$', n: 'the challenge bit and the guess', p: 'the hidden coin, and what the adversary says it was' },
    { s: '$\\approx_c$', n: 'computationally indistinguishable', p: 'no efficient algorithm can tell these apart' },
    { s: '$\\bad$', n: 'the bad event', p: 'the unlucky case where two games stop agreeing' },
    { s: '$\\perp$', n: 'bottom', p: 'rejection or failure — what decryption returns on an invalid ciphertext' }
  ]},
  { g: 'Schemes', items: [
    { s: '$\\Pi$', n: 'the scheme', p: 'the construction being analysed, usually a tuple of algorithms' },
    { s: '$\\Gen, \\Enc, \\Dec$', n: 'key generation, encryption, decryption', p: 'the three algorithms of an encryption scheme' },
    { s: '$\\Mac, \\Vrfy$', n: 'tag and verify', p: 'the two algorithms of a message authentication code' },
    { s: '$F_k$', n: 'the PRF keyed by k', p: 'a function that should look random to anyone without k' },
    { s: '$H$', n: 'a hash function', p: 'in the ROM, treated as a perfectly random function' }
  ]},
  { g: 'Logic', items: [
    { s: '$\\forall$', n: 'for all', p: 'the claim must hold in every case' },
    { s: '$\\exists$', n: 'there exists', p: 'one case suffices' },
    { s: '$\\implies$', n: 'implies', p: 'if the left side holds then so does the right' },
    { s: '$\\neg$', n: 'not', p: 'negation' },
    { s: '$\\qed$', n: 'QED', p: 'end of proof' }
  ]}
];

/* The suggested route through the whole app, for someone starting cold. */
window.CP_PATH = [
  { href: '#/primer/sets', label: 'Ground floor: seven short maths lessons',
    note: 'Sets and strings, probability, counting, modular arithmetic, groups, growth rates, logic.' },
  { href: '#/primer/what-is-proof', label: 'Writing proofs: the five shapes',
    note: 'What a proof is, and the structures nearly all of them use.' },
  { href: '#/primer/why-prove', label: 'Crypto ideas: games, adversaries, reductions',
    note: 'Why security must be proved, and what the words in a definition mean.' },
  { href: '#/basics', label: 'Foundations: the ten definitions',
    note: 'The same ideas in the notation your course uses. Each has a plain-English opening.' },
  { href: '#/proofs/prg-onetime', label: 'Read one worked proof end to end',
    note: 'The shortest one. Read the "why this step" notes first.' },
  { href: '#/learn/reduction', label: 'Learn the reduction skeleton',
    note: 'Then return to that proof and point at each step of the skeleton in it.' },
  { href: '#/drill', label: 'Drill, warm-up set first',
    note: 'Cheap mistakes now, instead of expensive ones on a problem set.' },
  { href: '#/build', label: 'Build a skeleton for your own problem',
    note: 'Filling in a correct structure beats staring at a blank page.' }
];
