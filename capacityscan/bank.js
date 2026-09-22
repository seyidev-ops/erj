/* ═══ ERJ CAPACITY AUDIT · question bank ═══
   Five dimensions, two questions each, every question scored 0 / 1 / 2.
   Raw 0-20 halves to the published 0-10 Capacity Score.
   One question per family is the profession's central task and is flagged
   core:true — a zero there fails the audit whatever the total says. */
window.ERJ_CAPACITY_BANK = {
 "dims": [
  {
   "k": "knowledge",
   "label": "Functional knowledge"
  },
  {
   "k": "execution",
   "label": "Core task execution"
  },
  {
   "k": "tools",
   "label": "Tools and systems"
  },
  {
   "k": "judgement",
   "label": "Professional judgement"
  },
  {
   "k": "evidence",
   "label": "Applied evidence"
  }
 ],
 "families": [
  {
   "id": "admin",
   "label": "Administration · Virtual & Executive Assistance",
   "q": [
    {
     "d": "knowledge",
     "q": "Asked to take over a busy executive's calendar tomorrow, could you explain how you would handle competing requests across time zones?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain which decisions an assistant makes alone and which must go back to the person they support?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given an inbox of eighty unread messages, could you sort it into what needs a reply today, what can wait, and what you can answer yourself?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you turn a meeting you sat in on into notes, decisions and action items someone else can act on without asking you anything?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you build and maintain a shared folder structure and a working tracker in Google Workspace or Microsoft 365 without help?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you set up scheduling links, video calls and a task board such as Trello, Asana or ClickUp for the team you support?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "If two directors need the same slot and neither will move, could you decide what to do and defend the decision?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell which requests are routine and which must be escalated before you act on them?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you run a calendar, inbox or document system for somebody other than yourself?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you talk a stranger through one administrative system you set up and what it changed?",
     "core": false
    }
   ]
  },
  {
   "id": "support",
   "label": "Customer Service · Support · Success",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain what happens to a customer ticket from the moment it arrives to the moment it is closed?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what a response time commitment means and what happens when it is missed?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given an angry customer whose order is wrong, could you resolve the issue end to end without someone stepping in?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you write a reply that calms a complaint without promising something the business cannot deliver?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you work a helpdesk such as Zendesk, Freshdesk or Intercom — queues, tags, macros — without training first?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you keep a knowledge base or CRM record accurate enough that the next agent needs no handover call?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you decide when to refund, when to replace and when to escalate, and explain the reasoning?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you notice the same complaint recurring across tickets and report it as a pattern rather than answering it again?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you handled real customers, in writing or on calls, for an employer or a business of your own?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you take one case you resolved and explain what happened and how it ended?",
     "core": false
    }
   ]
  },
  {
   "id": "sales",
   "label": "Sales · Business Development",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain the stages a deal moves through, and what has to be true before it moves on?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what makes a prospect qualified, and what makes one worth dropping?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given a first conversation with a prospect, could you run it yourself, find their real problem and qualify them?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you write outreach and follow-up that gets replies, without sending the same message to everyone?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you keep a CRM such as HubSpot, Pipedrive or Salesforce accurate enough for someone else to run your pipeline?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you use prospecting tools — LinkedIn, email finders, sequences — to build a list of real, reachable buyers?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you decide which deals to stop working on, and say why, when your pipeline is full of maybes?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you handle a price or trust objection honestly, without inventing a claim to win the moment?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you closed business, or contributed directly to closing it, for an employer or yourself?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you take one deal and explain it from first contact to signature or loss?",
     "core": false
    }
   ]
  },
  {
   "id": "marketing",
   "label": "Digital Marketing · Social Media",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain who a product's buyer is, where they pay attention, and what moves them from interest to purchase?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what each channel is actually good at, rather than posting the same thing everywhere?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Could you plan and publish a month of content on your own — calendar, copy, assets, scheduling — and keep it running?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you run one campaign end to end, from objective to creative to reporting?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you work the scheduling and creation tools — Meta Suite, Buffer, Canva or their equivalents — without help?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you set up and read analytics, in GA4 or native platform insights, well enough to say what happened?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you look at a week of performance and decide what to change, rather than just posting more?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell the difference between a number that flatters the page and a number that affects the business?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you run real pages, accounts or campaigns, for an employer, a client or a project of your own?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain one result you produced and what actually caused it?",
     "core": false
    }
   ]
  },
  {
   "id": "writing",
   "label": "Writing · Content · Copywriting",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain how a piece should be structured for a particular reader and purpose?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you take a brief and say what it is missing before you start writing?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given a brief and a deadline, could you produce a clear, correct, finished piece without anyone rewriting it?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you cut and edit your own draft, removing what you liked writing but the reader does not need?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you work in a CMS or shared document system, formatting and publishing without breaking anything?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you research a subject you do not know, and use AI assistance without letting it introduce errors?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell when a draft is wrong for the audience even though the sentences are good?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you check a claim before publishing it, and attribute what is not yours?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you written work that was published, or delivered to a client or employer?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you take one piece and explain who it was for and what it was meant to do?",
     "core": false
    }
   ]
  },
  {
   "id": "finance",
   "label": "Finance · Accounting · Bookkeeping",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain the accounting cycle, and what debits and credits do to each account?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what the profit and loss, balance sheet and cash flow each tell a business owner?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given one month of bank statements and the records, could you reconcile the account and explain every discrepancy?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you prepare routine reports — a P&L, a cash position, an ageing list — that somebody else can rely on?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you work a spreadsheet to a professional standard: formulas, lookups, pivots, clean structure?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you operate an accounting environment such as QuickBooks, Xero, Sage or an ERP module?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell a routine entry from an abnormal one, and know which one needs to go to someone senior?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you catch your own error before it reaches the accounts, and explain how you found it?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you kept real books, or completed coursework or a simulated set you worked through fully?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain a set of accounts you produced and what they showed?",
     "core": false
    }
   ]
  },
  {
   "id": "data",
   "label": "Data · Business Analysis",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain the difference between a business question, the data available and the metric that answers it?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what an average hides, and when it is the wrong thing to report?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given a messy dataset and a question, could you clean it, analyse it and answer the question on your own?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you build a report or dashboard that somebody non-technical can read without you explaining it?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you work Excel or Google Sheets to a professional standard — lookups, pivots, cleaning, charts?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you write SQL, or work a BI tool such as Power BI, Tableau or Looker, to get data yourself?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell when a result is not trustworthy — too few rows, a broken join, a biased sample?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you choose the right comparison, rather than the one that makes the number look best?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you produced analysis that someone actually used to decide something?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain one finding and the decision it changed?",
     "core": false
    }
   ]
  },
  {
   "id": "dev",
   "label": "Software Development · IT · Technical Support",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain the fundamentals of the language or systems you work in, without reciting a tutorial?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain how the parts of an application or a network fit together?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Could you write and debug working code, or diagnose and fix a real technical fault, with nobody sitting beside you?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you work inside somebody else's existing codebase or system, rather than only building from scratch?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you use version control properly — branches, commits, pull requests — on a shared project?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you set up your own working environment, and use the ticketing, deployment or monitoring tools a team runs on?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Given an error you have never seen, could you read it, form a hypothesis and test it methodically?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell when your fix is a proper solution and when it is a workaround that will return?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you shipped or maintained something real that other people used?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain what you built, the problem it solved and one thing you would now do differently?",
     "core": false
    }
   ]
  },
  {
   "id": "pm",
   "label": "Project Management · Operations",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain scope, dependency, critical path and risk in terms a client would understand?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what actually causes a project to slip, beyond people being slow?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given a goal and a team, could you produce a plan with owners, dates and dependencies that holds up?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you run the weekly cadence yourself — status, unblocking, chasing, reporting — without being reminded?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you run a project tool such as Asana, Jira, ClickUp or Monday well enough for a team to work inside it?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you keep documentation and reporting current enough that a stakeholder never has to ask where things stand?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "When something breaks and the date cannot move, could you decide what slips and defend the decision?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you escalate with a recommendation rather than just handing over the problem?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you run a real project or process end to end, with other people depending on it?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain one project, what went wrong in it, and what you changed?",
     "core": false
    }
   ]
  },
  {
   "id": "design",
   "label": "Design · Creative",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain hierarchy, type, colour and spacing as decisions rather than preferences?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what a brief is asking for, and what would make a design fail it?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given a brief, could you produce finished, usable design work that does not need another designer to fix it?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you take critical feedback and iterate without losing the intent of the work?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you work Figma, the Adobe tools or an equivalent to a professional standard?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you prepare and hand off files — exports, assets, specs — so a developer or printer can use them?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you look at your own work and judge whether it solves the brief, not just whether it looks good?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell when a design is finished and further decoration is making it worse?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Do you have a portfolio of real work, client work, or credible self-directed projects?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you take one piece and explain the constraints you were working inside?",
     "core": false
    }
   ]
  },
  {
   "id": "hr",
   "label": "HR · Recruitment · People Operations",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain the hiring cycle from role brief to signed offer, and who owns each step?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what must stay confidential, and what happens when it does not?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Could you run a role end to end — write the brief, source, screen, shortlist — and defend your shortlist?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you run a people process such as onboarding, records or an initial grievance intake, correctly?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you work an applicant tracking system or HRIS well enough to keep a hiring process auditable?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you use assessment and scheduling tools to run a structured process rather than a series of chats?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you judge a candidate against the role requirements rather than against how the conversation felt?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell what must go to a lawyer or a senior manager before you act?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you hired real people, or run real people processes, in an organisation?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain one hire or one process you ran, end to end?",
     "core": false
    }
   ]
  },
  {
   "id": "legal",
   "label": "Legal · Compliance",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain the area you work in and where its rules actually come from?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain the difference between a legal requirement and an internal policy choice?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given a contract or policy, could you read it and identify the clauses that matter and the risk they carry?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you draft or mark up a routine document to a standard that a supervisor would accept?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you research a point properly, using primary sources rather than a summary you found?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you keep matter records and version control so that a file survives an audit?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you state the limit of your own authority and stop there?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you separate a real legal risk from a commercial preference dressed up as one?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you worked on real matters or documents, in practice, in-house or in a supervised setting?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain one matter you worked on and how it resolved?",
     "core": false
    }
   ]
  },
  {
   "id": "teaching",
   "label": "Teaching · Online Tutoring · Learning",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain your subject at the level you intend to teach it, without reading from slides?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain what a learner should be able to do at the end of a lesson, not just what you will cover?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Could you plan and deliver a lesson that moves a learner to a stated outcome, on your own?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you assess where a learner actually is and change your plan accordingly?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you run the delivery tools — video, whiteboard, an LMS — without the technology interrupting the lesson?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you produce your own materials and assessments rather than only using someone else's?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you work out why a learner is stuck, rather than repeating the explanation louder?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell when the plan is wrong rather than the learner?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you taught real learners, in a classroom, online or one to one?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain one learner or group and what they could do afterwards that they could not do before?",
     "core": false
    }
   ]
  },
  {
   "id": "product",
   "label": "Product Management",
   "q": [
    {
     "d": "knowledge",
     "q": "Could you explain the difference between a user problem, a feature request and a business outcome?",
     "core": false
    },
    {
     "d": "knowledge",
     "q": "Could you explain a trade-off you would have to make and who it affects?",
     "core": false
    },
    {
     "d": "execution",
     "q": "Given a problem, could you define what to build, with acceptance criteria a team can work from?",
     "core": true
    },
    {
     "d": "execution",
     "q": "Could you prioritise a backlog and say no to a stakeholder with reasons they accept?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you run the tracking tools a delivery team works in, and keep them true?",
     "core": false
    },
    {
     "d": "tools",
     "q": "Could you get your own data — analytics, interviews, usage — rather than waiting to be told?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Faced with two reasonable options, could you decide using evidence rather than seniority in the room?",
     "core": false
    },
    {
     "d": "judgement",
     "q": "Could you tell when to stop building something that is not working?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Have you shipped a product or feature that real users used?",
     "core": false
    },
    {
     "d": "evidence",
     "q": "Could you explain one thing you shipped and what measurably changed?",
     "core": false
    }
   ]
  }
 ]
};
