import type { Dict } from './pt'

export const en: Dict = {
  meta: {
    title: 'Murilo Castilho — Internal systems, data and applied AI',
    description:
      'Murilo Castilho builds custom internal systems, automation and applied AI (RAG in production) for real operations. Portfolio, stack and career.',
    ogDescription:
      'Custom internal systems, automation and applied AI (RAG in production) for real operations.',
  },
  a11y: {
    skip: 'Skip to content',
    newTab: '(opens in a new tab)',
  },
  nav: {
    label: 'Main',
    brandLabel: 'murilo.dev, go to top',
    links: {
      sobre: 'about',
      stack: 'stack',
      projetos: 'projects',
      carreira: 'career',
      contato: 'contact',
    },
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menuLabel: 'Navigation menu',
    switchLang: 'Switch language to Portuguese',
    openPalette: 'Open command palette',
  },
  palette: {
    title: 'Command palette',
    placeholder: 'Search a section or action…',
    inputLabel: 'Search commands',
    empty: 'Nothing found.',
    results: 'results',
    close: 'Close command palette',
    kindSection: 'section',
    kindAction: 'action',
    hintNavigate: 'navigate',
    hintSelect: 'select',
    hintClose: 'close',
    actions: {
      copyEmail: 'Copy email',
      github: 'Open GitHub',
      linkedin: 'Open LinkedIn',
      switchLang: 'Mudar para Português',
    },
    sections: {
      sobre: 'Go to About',
      stack: 'Go to Stack',
      projetos: 'Go to Projects',
      carreira: 'Go to Career',
      processo: 'Go to How I work',
      contato: 'Go to Contact',
    },
  },
  toast: { emailCopied: 'Email copied' },
  hero: {
    whoami: 'whoami',
    name1: 'Murilo',
    name2: 'Castilho.',
    roles: ['custom internal systems', 'applied AI (RAG in production)', 'end-to-end automation'],
    rolesLabel: 'Current focus',
    lede: 'I build internal systems, automation and applied AI for real operations — from raw ERP data to the screen the team uses every day.',
    status: 'Available for projects',
    ctaProjects: 'See projects',
    ctaGithub: 'GitHub',
    ctaContact: 'Get in touch',
  },
  terminal: {
    windowLabel: 'Interactive terminal',
    bodyLabel: 'Terminal output',
    inputLabel: 'Type a command and press Enter',
    placeholder: 'type help or ask a question',
    demoCommand: 'has murilo put AI into production?',
    demoLines: [
      '↳ searching the index…',
      '↳ 3 relevant passages',
      'Yes. Murilo runs an AI assistant with RAG in production: a chat that answers from the BI dashboards and respects each user’s permissions.',
      'sources: Projects · Internal platform + AI assistant, About',
      '↳ now it’s real: ask me anything about Murilo',
    ],
    ask: {
      searching: '↳ searching the index…',
      foundOne: '↳ 1 relevant passage',
      foundMany: '↳ {n} relevant passages',
      sources: 'sources:',
      sourceLabel: 'Go to section',
      errors: {
        offline: '✗ assistant offline right now — use the contact section below',
        rate_limited: '✗ too many questions in a row, try again in 1 minute',
        network: '✗ connection failed, try again',
      },
    },
    chipsLabel: 'Suggested questions',
    chips: [
      'Has he used AI in production?',
      'What kind of systems does he build?',
      'How to hire him?',
    ],
    out: {
      help: [
        'available commands:',
        '  about      what I build',
        '  stack      day-to-day tools',
        '  projects   systems in production',
        '  career     where I come from',
        '  contact    get in touch',
        '  ask ...    ask about me (or just type the question)',
        '             e.g. ask has murilo put AI into production?',
        '  lang pt    switch language (lang en goes back)',
        '  clear      clear the terminal',
      ],
      about: ['↳ data, systems and AI — end to end.', '↳ scrolling to the about section…'],
      stack: [
        '↳ Python, FastAPI, React, TypeScript, SQL and applied AI.',
        '↳ scrolling to the stack section…',
      ],
      projects: [
        '↳ a dozen-plus internal systems built from scratch.',
        '↳ scrolling to the projects section…',
      ],
      career: [
        "↳ from admin assistant to building the company's systems.",
        '↳ scrolling to the career section…',
      ],
      contact: ['↳ email, LinkedIn and GitHub right below.', '↳ scrolling to the contact section…'],
      hire: [
        '✓ request accepted. hiring starts with a conversation.',
        '↳ opening the contact section…',
      ],
      langPt: ['✓ idioma alterado para português.'],
      langEn: ['✓ language switched to English.'],
      askUsage: ['usage: ask <question>', 'e.g. ask what kind of systems does murilo build?'],
      askInvalid: ['↳ the question must be between 3 and 300 characters.'],
      unknown: ['command not found, try help'],
    },
  },
  stats: {
    label: 'Numbers',
    items: {
      years: { unit: 'years', label: 'in the same operation, moving up in role' },
      systems: { unit: '', label: 'internal systems built from scratch' },
      ai: { unit: '', label: 'AI assistant in production' },
    },
  },
  marquee: {
    label: 'Technologies I use',
    pauseLabel: 'Pause technologies animation',
    playLabel: 'Play technologies animation',
    pause: 'pause',
    play: 'play',
  },
  sections: {
    sobre: { eyebrow: 'About', line1: 'Data, systems and AI —', line2: 'end to end.' },
    stack: { eyebrow: 'Stack', line1: 'Day-to-day', line2: 'tools.' },
    projetos: { eyebrow: 'Projects', line1: 'Systems the operation', line2: 'uses every day.' },
    carreira: { eyebrow: 'Career', line1: 'I grew up inside', line2: 'the operation.' },
    processo: { eyebrow: 'How I work', line1: 'AI as leverage,', line2: 'not decoration.' },
    contato: {
      eyebrow: 'Contact',
      line1: 'Got a process running on spreadsheets?',
      line2: "Let's turn it into a system.",
    },
  },
  about: {
    lede: 'I work halfway between the people who run the business and the people who write the code: I understand the rules, model the data and ship the system.',
    cards: [
      {
        title: 'Data that backs decisions',
        text: 'Modeling straight from the source — ERP, spreadsheet, legacy system — into something reliable enough to pay out bonuses or steer the operation.',
      },
      {
        title: 'Automation that replaces manual work',
        text: 'Python pipelines that read from production systems and deliver, ready to use, what someone now assembles by hand, spreadsheet by spreadsheet.',
      },
      {
        title: 'Business rules turned into code',
        text: 'The rule that only lives in the head of someone who has been in the area for years becomes a calculation, a query or a screen anyone can audit.',
      },
      {
        title: 'Custom-built, fast',
        text: 'With AI as a building tool — not just an analysis one — a system designed for one specific operation ships in days, not months.',
      },
    ],
  },
  stack: {
    groups: {
      backend: 'Back-end & data',
      frontend: 'Front-end',
      ai: 'Applied AI',
      bi: 'BI',
      infra: 'Infra',
    },
    building: {
      title: 'In progress',
      items: [
        'Multi-step autonomous agents',
        'End-to-end automation',
        'Packaging it as an offer for clients',
      ],
    },
  },
  projects: {
    lede: 'A dozen-plus internal systems built from scratch at a transport group — from raw data to the screen the team uses. No screenshots: company data does not leave the building, so each project comes with a schematic of how it works.',
    production: 'in production',
    diagramPrefix: 'Flow diagram',
    alsoTitle: '+ also built',
    items: {
      platform: {
        domain: 'controllership',
        title: 'Internal platform + AI assistant',
        text: "A portal that brings the controllership tools into one place, with its own login and permissions by role and by city. It started as a chat that answers questions based on the company's own BI dashboards: the dashboards become embeddings, the model searches them before answering and respects what each user is allowed to see. It also provides single sign-on (SSO) for the systems that run inside it.",
        steps: ['Question', 'Vector search|permission filter', 'LLM', 'Answer|with source'],
      },
      routes: {
        domain: 'logistics',
        title: 'Route Management',
        text: 'Replaces a freight-route spreadsheet that several people edited at once. It separates route, validity period and stops, which keeps the history of how each route ran in each period, and every change goes through an approval flow that compares before and after.',
        steps: [
          'Regional requests',
          'Comparison|before / after',
          'Manager approves',
          'New validity',
        ],
      },
      balance: {
        domain: 'accounting',
        title: 'Balance Sheet and Income Statement',
        text: 'Rebuilds the balance sheet and income statement from the ERP trial balance, replacing the manual spreadsheet. Mapping is done by chart-of-accounts level, so a new account is classified from day one. Validated line by line against the official close, with no discrepancy.',
        steps: ['Trial balance', 'Tree|chart of accounts', 'Mapping|per node', 'BS / IS'],
      },
      payments: {
        domain: 'finance',
        title: 'Vendor Payments',
        text: "Replaces the vendors' bank-account spreadsheet. It pulls open payables from the ERP, handles cancellations, installments and advance offsets, and generates the deposit data sheet as a PDF, emailed in batch.",
        steps: [
          'ERP|open payables',
          'Rules|cancelled, installment…',
          'PDF|deposit data',
          'Email|in batch',
        ],
      },
      planner: {
        domain: 'management',
        title: 'Planner',
        text: 'Action plans with a task and subtask kanban, delegation, blockers, notifications and a feed. Integrated with the portal through single sign-on and continuously evolving from user feedback.',
        steps: ['Plan', 'Tasks|kanban', 'Delegation', 'Notification'],
      },
      crm: {
        domain: 'sales',
        title: 'Quote CRM',
        text: 'A queue of freight quotes that did not become sales, where sales logs the reason and the follow-up history. The rule for which quotes enter the queue came from analysing real data, not from guesswork. The analysis has cross-filtered charts.',
        steps: ['Quotes', 'Queue|not closed', 'Reason|+ follow-up', 'Analysis'],
      },
    },
    also: {
      portaria: {
        name: 'Gatehouse Control',
        text: 'entry and exit of vehicles, employees and visitors per site',
      },
      aparelhos: {
        name: 'Devices and Lines Control',
        text: 'inventory of phones, SIM cards and extensions, with auditing',
      },
      parametrizacao: {
        name: 'Organizational Setup',
        text: 'branch and manager hierarchy that feeds the HR dashboards',
      },
      metas: {
        name: 'Targets and bonus model',
        text: 'scoring across five operational indicators, with DAX tuned for large queries',
      },
      rh: {
        name: 'HR model',
        text: '42 tables, 102 measures and 101 relationships, documented for maintenance',
      },
      interjornada: {
        name: 'Rest-period ETL',
        text: "calculates the mandatory rest between drivers' shifts straight from the ERP",
      },
      bilhetagem: {
        name: 'Ticketing reports',
        text: 'SQL that rebuilds information the system does not provide out of the box',
      },
      whatsapp: {
        name: 'WhatsApp report parser',
        text: 'structures a sales report from loose text and became the basis of a data mart proposal',
      },
      frequencia: {
        name: 'Unified Attendance BI',
        text: 'clickable prototype that merged 5 time-tracking dashboards into one',
      },
      pezinhos: {
        name: 'Pezinhos do Futuro',
        text: 'website and sign-up for a martial arts social project for children',
      },
      domos: {
        name: 'Domos Barbearia',
        text: 'freelance landing page, free hosting, straight to booking and WhatsApp',
      },
    },
  },
  career: {
    lede: "From administrative routine to building the company's systems, studying along the way.",
    present: 'present',
    educationTitle: 'Education',
    org: {
      passengers: 'Transport group · passenger unit',
      cargo: 'Transport group · freight unit',
    },
    items: {
      bi: {
        role: 'Full BI Analyst → internal systems and AI',
        bullets: [
          'Full-stack systems (React + FastAPI) in production',
          'AI assistant (RAG) in production',
          'Automation straight from the source systems',
        ],
      },
      junior: {
        role: 'Junior BI Analyst',
        bullets: ['Power BI dashboards', 'SQL for data collection', 'ETL in Python'],
      },
      traffic: { role: 'Traffic Analyst', bullets: [] },
      admin: { role: 'Administrative Assistant', bullets: [] },
    },
    education: {
      ads: { course: 'Systems Analysis and Development', school: 'UNIARP' },
      se: { course: 'Software Engineering', school: 'UNOPAR' },
    },
  },
  process: {
    steps: [
      {
        title: 'Understand the rule',
        text: 'Talk to the people who run it and find where the data is born.',
      },
      {
        title: 'Model the data',
        text: 'A single source, no spreadsheet in the middle.',
      },
      {
        title: 'Build fast',
        text: 'A custom system, shipped in short phases and validated with the people who use it.',
      },
      {
        title: 'AI on top',
        text: 'Assistants and automation on top of reliable data.',
      },
    ],
    closing:
      'A mid-sized company with no in-house IT team, paying a lot for generic software or with no system at all, can now afford a custom project built quickly — because AI multiplies the speed of someone who already understands data and business rules.',
  },
  contact: {
    lede: 'A job, a freelance gig or just a chat about data and applied AI — I reply fast.',
    copy: 'Copy',
    copied: 'Copied',
    copyAria: 'Copy email to clipboard',
    copiedStatus: 'Email copied',
    links: {
      linkedin: 'LinkedIn',
      githubProjects: 'GitHub · projects',
      githubPersonal: 'GitHub · personal',
    },
  },
  footer: {
    copyright: '© 2026 Murilo Castilho · Santa Catarina, Brazil',
    built: 'Built with React, Vite and Tailwind',
    hint: 'press',
  },
}
