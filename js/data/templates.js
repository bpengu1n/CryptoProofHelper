/* Proof Builder templates: guided prompts -> a LaTeX skeleton you can paste
 * into your problem set and fill in. */
window.CP_TEMPLATES = [
  {
    id: 'reduction',
    title: 'Reduction to an assumption',
    blurb: 'One scheme, one assumption. The workhorse.',
    fields: [
      { k: 'scheme', label: 'Scheme / construction', ph: 'e.g. \\Pi = (Gen, Enc, Dec), ElGamal over G' },
      { k: 'goal',   label: 'Security notion you must prove', ph: 'e.g. IND-CPA' },
      { k: 'assum',  label: 'Assumption you are reducing to', ph: 'e.g. DDH in G' },
      { k: 'input',  label: 'What does the assumption\'s challenger hand B?', ph: 'e.g. (g^a, g^b, Z)', hint: 'Copy this straight from the assumption. You do not get to choose it.' },
      { k: 'out',    label: 'What must B output to win?', ph: 'e.g. a bit: real vs random' },
      { k: 'embed',  label: 'Where does the challenge go in A\'s view?', rows: 3, ph: 'e.g. pk := g^a; challenge ct := (g^b, m_b * Z)', hint: 'The creative step. A\'s view must be distributed exactly as in the real game.' },
      { k: 'oracles',label: 'How does B answer each oracle query, without the secret?', rows: 4, ph: 'Enc query m: ...   Dec query c: ...   H query x: ...', hint: 'Go query type by query type. If one is unanswerable, the embedding is wrong.' },
      { k: 'extract',label: 'How does A\'s output become B\'s output?', rows: 2, ph: 'e.g. output 1 iff b\' = b' },
      { k: 'bound',  label: 'Resulting advantage bound', ph: 'e.g. Adv_B >= eps, or eps/q_H' }
    ],
    build: function (v) {
      return [
        '\\begin{theorem}',
        'If ' + (v.assum || '[assumption]') + ' holds, then ' + (v.scheme || '[scheme]') +
          ' is ' + (v.goal || '[notion]') + '-secure.',
        '\\end{theorem}',
        '',
        '\\begin{proof}',
        'Suppose toward a contradiction that there is a PPT adversary $\\mathcal{A}$ with',
        '$\\mathsf{Adv}^{\\text{' + (v.goal || 'notion') + '}}_{\\mathcal{A}}(\\lambda) = \\varepsilon(\\lambda)$ non-negligible.',
        'We construct a PPT $\\mathcal{B}$ against ' + (v.assum || '[assumption]') + '.',
        '',
        '\\paragraph{Setup.} $\\mathcal{B}$ receives ' + (v.input || '[challenge input]') + '.',
        '',
        '\\paragraph{Simulation.} ' + (v.embed || '[embed the challenge in A\'s view]'),
        '',
        '$\\mathcal{B}$ answers $\\mathcal{A}$\'s queries as follows:',
        '\\begin{itemize}',
        '  \\item ' + (v.oracles || '[oracle-by-oracle simulation]').split('\n').join('\n  \\item '),
        '\\end{itemize}',
        '',
        '\\paragraph{Claim (the simulation is faithful).}',
        'In the case where $\\mathcal{B}$\'s input is \\emph{real}, $\\mathcal{A}$\'s view is distributed',
        'identically to the real ' + (v.goal || 'security') + ' experiment. [Justify, line by line.]',
        'In the \\emph{random} case, $\\mathcal{A}$\'s view is independent of the challenge bit,',
        'so it succeeds with probability exactly $1/2$. [Justify.]',
        '',
        '\\paragraph{Output.} ' + (v.extract || '[map A\'s output to B\'s]'),
        '',
        '\\paragraph{Accounting.} ' + (v.bound || '$\\mathsf{Adv}(\\mathcal{B}) \\ge \\varepsilon$') + '.',
        'Moreover $\\mathcal{B}$ runs in time $t_{\\mathcal{A}} + O(q \\cdot \\text{(work per query)})$, hence PPT.',
        'This contradicts ' + (v.assum || '[assumption]') + ', so $\\varepsilon$ is negligible.',
        '\\end{proof}'
      ].join('\n');
    }
  },
  {
    id: 'gamehop',
    title: 'Sequence of games',
    blurb: 'Several primitives, or a bad event to remove first.',
    fields: [
      { k: 'goal',  label: 'Security notion', ph: 'e.g. IND-CCA' },
      { k: 'g0',    label: 'Game 0 (the real experiment)', rows: 2, ph: 'The standard IND-CCA game for Pi' },
      { k: 'hops',  label: 'One hop per line: "change -- justification"', rows: 6,
        ph: 'reject unseen tags -- SUF-CMA of the MAC\nencrypt 0^|m| instead of m_b -- IND-CPA of Pi_E',
        hint: 'One change per hop, each justified by exactly one of: indistinguishability, failure event, bridging.' },
      { k: 'final', label: 'Final game and why the adversary cannot win it', rows: 2, ph: 'The challenge bit b is never used, so Pr[S_n] = 1/2 exactly.' },
      { k: 'total', label: 'Final collected bound', ph: 'Adv <= Adv^suf-cma + Adv^ind-cpa' }
    ],
    build: function (v) {
      var hops = (v.hops || 'change -- justification').split('\n').filter(function (x) { return x.trim(); });
      var lines = [
        '\\begin{proof}',
        'We proceed by a sequence of games. Let $S_i$ denote the event that $\\mathcal{A}$',
        'wins in $\\mathsf{Game}_i$.',
        '',
        '\\paragraph{$\\mathsf{Game}_0$.} ' + (v.g0 || '[the real ' + (v.goal || '') + ' experiment]') + ' By definition',
        '$\\mathsf{Adv}^{\\text{' + (v.goal || 'notion') + '}}(\\mathcal{A}) = |\\Pr[S_0] - 1/2|$.'
      ];
      hops.forEach(function (h, i) {
        var parts = h.split('--');
        lines.push('');
        lines.push('\\paragraph{$\\mathsf{Game}_{' + (i + 1) + '}$.} Identical to $\\mathsf{Game}_{' + i + '}$ except: ' +
                   parts[0].trim() + '.');
        lines.push('\\emph{Justification:} ' + (parts[1] ? parts[1].trim() : '[type of transition]') + '.');
        lines.push('Hence $|\\Pr[S_{' + i + '}] - \\Pr[S_{' + (i + 1) + '}]| \\le \\delta_{' + i + '}$,');
        lines.push('where [exhibit the distinguisher / bound the bad event].');
      });
      lines.push('');
      lines.push('\\paragraph{Final game.} ' + (v.final || '[why the bit is now information-theoretically hidden]'));
      lines.push('');
      lines.push('\\paragraph{Collecting.} By the triangle inequality,');
      lines.push('$\\mathsf{Adv}(\\mathcal{A}) \\le \\sum_{i} \\delta_i = ' +
                 (v.total || '[sum]') + '$, which is negligible as a finite sum of negligible terms.');
      lines.push('\\end{proof}');
      return lines.join('\n');
    }
  },
  {
    id: 'hybrid',
    title: 'Hybrid argument',
    blurb: 'One-to-many: q messages, q queries, q rounds.',
    fields: [
      { k: 'q',    label: 'What is being repeated, and how many times?', ph: 'e.g. q(lambda) encryption queries' },
      { k: 'real', label: 'The real distribution (Hyb_0)', ph: 'e.g. all q ciphertexts encrypt m_0^i' },
      { k: 'ideal',label: 'The ideal distribution (Hyb_q)', ph: 'e.g. all q ciphertexts encrypt m_1^i' },
      { k: 'hyb',  label: 'Definition of Hyb_i', rows: 2, ph: 'first i items ideal, remaining q-i real',
        hint: 'Then check: does Hyb_0 equal the real game and Hyb_q the ideal one, exactly?' },
      { k: 'bi',   label: 'How B_i plants its single challenge', rows: 3,
        ph: 'positions <= i: generate ideally itself; position i+1: the challenge; positions > i+1: generate really itself' },
      { k: 'prim', label: 'Underlying assumption for one step', ph: 'e.g. single-message IND-CPA' }
    ],
    build: function (v) {
      return [
        '\\begin{proof}',
        'Let $q = q(\\lambda)$ be ' + (v.q || '[the polynomial number of repetitions]') + '.',
        '',
        '\\paragraph{Hybrids.} For $i = 0,\\dots,q$ define $\\mathsf{Hyb}_i$: ' +
          (v.hyb || '[first $i$ ideal, remaining real]') + '.',
        'Then $\\mathsf{Hyb}_0$ is ' + (v.real || '[the real distribution]') + ' and',
        '$\\mathsf{Hyb}_q$ is ' + (v.ideal || '[the ideal distribution]') + '.',
        '',
        '\\paragraph{Neighbouring hybrids.} Fix $i \\in \\{0,\\dots,q-1\\}$ and suppose $\\mathcal{D}$',
        'distinguishes $\\mathsf{Hyb}_i$ from $\\mathsf{Hyb}_{i+1}$ with advantage $\\delta_i$.',
        'Construct $\\mathcal{B}_i$ against ' + (v.prim || '[the assumption]') + ':',
        (v.bi || '[how B_i plants the challenge]'),
        '',
        'If $\\mathcal{B}_i$\'s challenge is real, $\\mathcal{D}$\'s input is distributed exactly as',
        '$\\mathsf{Hyb}_i$; if ideal, exactly as $\\mathsf{Hyb}_{i+1}$. Hence',
        '$\\mathsf{Adv}(\\mathcal{B}_i) = \\delta_i$, so each $\\delta_i$ is negligible.',
        '',
        '\\paragraph{Summing.} By the triangle inequality,',
        '\\[ |\\Pr[\\mathcal{D}(\\mathsf{Hyb}_0)=1] - \\Pr[\\mathcal{D}(\\mathsf{Hyb}_q)=1]|',
        '   \\le \\sum_{i=0}^{q-1} \\delta_i \\le q(\\lambda)\\cdot\\mathsf{negl}(\\lambda), \\]',
        'which is negligible because $q$ is polynomial in $\\lambda$.',
        '\\end{proof}'
      ].join('\n');
    }
  },
  {
    id: 'simulation',
    title: 'Simulation-based proof',
    blurb: 'Zero-knowledge, MPC, semantic security: "leaks nothing beyond".',
    fields: [
      { k: 'real', label: 'What is in the real view?', rows: 2, ph: 'e.g. (a, c, z) transcript plus A\'s coins' },
      { k: 'sim',  label: 'What may the simulator use?', ph: 'e.g. the statement x only, plus black-box access to A',
        hint: 'If the witness or an honest party\'s input appears here, the proof is void.' },
      { k: 'strategy', label: 'Simulator strategy', rows: 4, ph: 'e.g. sample c and z first, then set a := g^z * y^{-c}; rewind A on mismatch' },
      { k: 'indist', label: 'Why the two views are indistinguishable', rows: 3, ph: 'e.g. both are uniform on the accepting transcripts, so identical' },
      { k: 'time', label: 'Why the simulator runs in (expected) polynomial time', ph: 'e.g. each rewind succeeds w.p. 1/|C|, so expected |C| attempts' }
    ],
    build: function (v) {
      return [
        '\\begin{proof}',
        'We exhibit a PPT simulator $\\mathcal{S}$ such that',
        '\\[ \\{\\mathsf{Real}_{\\Pi,\\mathcal{A}}(x)\\}_{x} \\approx_c \\{\\mathsf{Ideal}_{\\mathcal{F},\\mathcal{S}}(x)\\}_{x}. \\]',
        '',
        '\\paragraph{The real view.} ' + (v.real || '[what the adversary sees in a real execution]'),
        '',
        '\\paragraph{The simulator.} $\\mathcal{S}$ is given ' + (v.sim || '[only the public input]') +
          ' --- crucially, \\emph{not} the witness / honest inputs. It proceeds:',
        (v.strategy || '[simulation strategy]'),
        '',
        '\\paragraph{Indistinguishability.} ' + (v.indist || '[why the two distributions are close]'),
        '',
        '\\paragraph{Efficiency.} ' + (v.time || '[expected polynomial running time]'),
        '\\end{proof}'
      ].join('\n');
    }
  }
];

/* "Start here" triage: from what you are asked to prove, to the move to make. */
window.CP_TRIAGE = [
  { q: 'The statement is "if X is secure, so is my scheme", with one assumption.',
    tech: 'reduction', hint: 'Straight reduction. Write both games out first, then find the slot the challenge fits into.' },
  { q: 'The scheme combines two or more primitives (encrypt + MAC, KEM + DEM, hash + signature).',
    tech: 'gamehop', hint: 'Game hopping: peel one primitive per hop, so each hop has exactly one justification.' },
  { q: 'You must go from one message / query / round to many.',
    tech: 'hybrid', hint: 'Hybrid ladder. Confirm the count is polynomial before you start.' },
  { q: 'Your simulation breaks only when something unlucky happens (a collision, a repeated IV, a forgery).',
    tech: 'badevent', hint: 'Identical-until-bad. Charge the gap to $\\Pr[\\bad]$ and bound it in the idealised game.' },
  { q: 'The scheme uses a block cipher but you want to reason about random outputs.',
    tech: 'switching', hint: 'PRP $\\to$ random permutation $\\to$ random function; remember the $q^{2}/2^{n+1}$ term.' },
  { q: 'The scheme hashes something and you are allowed the ROM.',
    tech: 'romprog', hint: 'Program or extract. Keep the table consistent, and pay the factor $q_H$ for guessing.' },
  { q: 'You need to pull a secret out of the adversary (soundness, knowledge extraction).',
    tech: 'rewinding', hint: 'Rewind to the fork point; two transcripts, same first message, distinct challenges.' },
  { q: 'The claim is "leaks nothing beyond the output" rather than a guessing game.',
    tech: 'simulation', hint: 'Build a simulator that never touches the secret input.' },
  { q: 'The claim holds against **unbounded** adversaries, or is an impossibility result.',
    tech: 'infotheoretic', hint: 'No reduction is possible. Compute probabilities directly, or count with pigeonhole.' }
];

/* Pre-submission self-review. */
window.CP_CHECKLIST = [
  { g: 'Statement', items: [
    'The theorem names the assumption, the model (standard / ROM), and the exact security notion.',
    'Every quantifier is present: "for every PPT $\\A$ there exists a negligible $\\mu$...".',
    'One advantage convention is fixed and used consistently throughout.'
  ]},
  { g: 'The reduction', items: [
    'Every value the reduction uses is one it was actually given or generated itself.',
    'Every oracle query type has a stated answer, including the edge cases (repeats, $\\perp$, forbidden queries).',
    'The simulated view is argued identical to the real one \u2014 or the difference is bounded, not waved at.',
    'The reduction\'s running time is stated, and it is polynomial.'
  ]},
  { g: 'Game hops', items: [
    'Each hop changes exactly one thing.',
    'Each hop is labelled with its type: indistinguishability, failure event, or bridging.',
    'Bad events are bounded in the game where the relevant values are uniform.',
    'The final game gives an exact probability (usually $1/2$), not another bound.'
  ]},
  { g: 'Hybrids', items: [
    'The number of hybrids is polynomial in $\\lambda$.',
    '$\\Hyb_0$ and $\\Hyb_q$ were checked against the actual game definitions.',
    'Both plants verified: real challenge gives $\\Hyb_i$, ideal gives $\\Hyb_{i+1}$.'
  ]},
  { g: 'Bookkeeping', items: [
    'Every factor is accounted for: the $1/q$ from guessing, the $2$ from the convention, the birthday term.',
    'The final bound is a single displayed inequality.',
    'Each negligible-summing step notes that the number of terms is polynomial.',
    'The proof ends by stating the contradiction or the conclusion explicitly.'
  ]}
];
