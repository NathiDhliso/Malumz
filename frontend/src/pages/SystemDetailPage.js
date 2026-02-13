import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const systemsData = {
  'predator-protocol': {
    name: 'Predator Protocol',
    trainer: 'Family Trainer',
    timeCommitment: '15 minutes',
    summary: 'A 3-check system to identify whether a person in your family or community poses a genuine threat. Passing all three checks means the person is safe. Failing any one means action is required.',
    sections: [
      { heading: 'The Breakdown', content: 'Many men either trust everyone or trust no one. The Predator Protocol gives you a structured way to evaluate threat without paranoia. Three checks: Pattern (have they done this before?), Access (do they have unsupervised access?), Power (do they have leverage over the vulnerable person?).' },
      { heading: 'Tier 1 Adaptation', content: 'No pen needed. Ask yourself the three questions out loud while walking. Use your phone voice recorder to capture your answers. Share with your Circle partner.' },
      { heading: 'Tier 2 Extension', content: 'Write a formal risk assessment. Cross-reference with school records, family history, and community reports. File with your Circle facilitator.' },
      { heading: 'Practice Scenario', content: 'Your sister\'s new boyfriend has been spending more and more time alone with her 8-year-old son. Run the three checks. What do you find?' },
      { heading: 'Circle Integration', content: 'Week 2 of Family Trainer month. Facilitator reads the scenario. Each man runs the protocol silently, then shares findings. No judgement on the scenario — only on the process.' },
    ],
  },
  '3-chair-tribunal': {
    name: '3-Chair Tribunal',
    trainer: 'Family Trainer',
    timeCommitment: '30 minutes',
    summary: 'A conflict resolution method using three physical chairs representing three perspectives: yours, theirs, and the observer.',
    sections: [
      { heading: 'The Breakdown', content: 'Most arguments fail because both sides are locked into their own chair. The Tribunal forces you to physically move between three positions: your perspective, their perspective, and a neutral observer.' },
      { heading: 'Tier 1 Adaptation', content: 'Use three spots on the floor if you don\'t have chairs. Even three stones in a yard work. The physical movement is what matters, not the furniture.' },
      { heading: 'Tier 2 Extension', content: 'Record a voice note from each chair position. Play them back to yourself. The difference in tone will surprise you.' },
      { heading: 'Practice Scenario', content: 'You and your partner are arguing about money. Sit in Chair 1 and state your case for 2 minutes. Move to Chair 2 and argue her case for 2 minutes. Move to Chair 3 and describe what you just witnessed.' },
      { heading: 'Circle Integration', content: 'Pairs exercise. One man presents a real conflict (anonymised). His partner facilitates the three-chair process. Debrief as a group.' },
    ],
  },
  'provision-audit': {
    name: 'Provision Audit',
    trainer: 'Economic Trainer',
    timeCommitment: '20 minutes weekly',
    summary: 'BREAD/SHIELD/FIRE diagnostic to assess your economic provision across three dimensions.',
    sections: [
      { heading: 'The Breakdown', content: 'BREAD: Basic needs (food, rent, transport). SHIELD: Protection layer (insurance, savings, emergency fund). FIRE: Future investment (education, assets, retirement). The ATM metaphor: you can only withdraw what you\'ve deposited.' },
      { heading: 'Tier 1 Adaptation', content: 'Unemployed adaptation: BREAD becomes "What did I do today to move toward income?" SHIELD becomes "Who owes me and who do I owe?" FIRE becomes "What skill did I practice today?"' },
      { heading: 'Tier 2 Extension', content: 'Weekly spreadsheet tracking. Monthly trend analysis. Quarterly Circle review of all members\' BREAD/SHIELD/FIRE ratios.' },
      { heading: 'Practice Scenario', content: 'It\'s Friday. You have R800 until payday next Thursday. Run the BREAD audit. What must be covered? What can wait? Record a voice note with your plan.' },
      { heading: 'Circle Integration', content: 'Economic Trainer month, Week 1. Every man shares their BREAD score (not the actual rand amount — just the score). Group identifies common gaps.' },
    ],
  },
  'circuit-breaker': {
    name: 'Circuit Breaker',
    trainer: 'Academic Trainer',
    timeCommitment: '5 minutes per incident',
    summary: 'Identifies and breaks logical fallacies in arguments before they escalate to emotional damage.',
    sections: [
      { heading: 'The Breakdown', content: 'Four common derailment types: Ad Hominem (attacking the person, not the argument), Strawman (misrepresenting what was said), False Emotion (manufacturing tears or rage to win), Circular Reasoning (using the conclusion as the premise).' },
      { heading: 'Tier 1 Adaptation', content: 'Memorise the four types. When you feel an argument heating up, ask yourself: "Which type is happening right now?" Just naming it breaks the circuit.' },
      { heading: 'Tier 2 Extension', content: 'Keep a log of circuit-break moments. Review weekly. Look for patterns in which derailment type you or your partner default to.' },
      { heading: 'Practice Scenario', content: 'Your partner says: "You never help around the house." Is this Ad Hominem, Strawman, or something else? What\'s the Circuit Breaker response?' },
      { heading: 'Circle Integration', content: 'Academic Trainer month. Role-play exercise: one man argues a position, the other must identify the fallacy type within 30 seconds.' },
    ],
  },
  'blacksmith': {
    name: 'Blacksmith',
    trainer: 'Masculine Trainer',
    timeCommitment: '45 minutes',
    summary: 'A structured process for forging strength from crisis. The forge process turns pain into purpose.',
    sections: [
      { heading: 'The Breakdown', content: 'The Blacksmith process: Heat (acknowledge the crisis), Hammer (identify what needs to change), Shape (create the action plan), Cool (test the plan under pressure). Job loss example: the shame is the heat, the résumé rewrite is the hammer, the application schedule is the shape, the first rejection is the cooling.' },
      { heading: 'Tier 1 Adaptation', content: 'Voice note the four stages. You don\'t need to write anything. Speak the heat, speak the hammer, speak the shape, speak the cool.' },
      { heading: 'Tier 2 Extension', content: 'Written journal entry for each stage. Timeline with deadlines. Accountability partner check-in at each stage.' },
      { heading: 'Practice Scenario', content: 'You\'ve been retrenched. Walk through the four stages. What is each stage for this specific crisis?' },
      { heading: 'Circle Integration', content: 'Masculine Trainer month. One man volunteers a current crisis (real or past). The group walks him through the forge. Facilitator watches for isolation warning signs.' },
    ],
  },
  'war-room': {
    name: 'War Room',
    trainer: 'Community Trainer',
    timeCommitment: '2 hours (facilitated)',
    summary: 'The structured group session format for Brotherhood Circle meetings. Round-by-round facilitation guide.',
    sections: [
      { heading: 'The Breakdown', content: 'Five rounds: Check-in (2 min each), Teaching (20 min from the book), Discussion (30 min facilitated), Action Items (10 min), Check-out (2 min each). Safety protocol: if anyone discloses suicidal thoughts, pause everything and follow the crisis protocol.' },
      { heading: 'Tier 1 Adaptation', content: 'WhatsApp voice note version: each man records a 2-minute check-in. Facilitator records a 5-minute teaching. Discussion happens via voice notes over 48 hours.' },
      { heading: 'Tier 2 Extension', content: 'In-person with printed handouts, whiteboard tracking, and post-session written reflections.' },
      { heading: 'Practice Scenario', content: 'It\'s Week 3 of Community Trainer month. One man hasn\'t shown up for two weeks. Another seems withdrawn. How does the facilitator handle the War Room this week?' },
      { heading: 'Circle Integration', content: 'This IS the Circle integration. The War Room is the session format itself.' },
    ],
  },
  'cool-head-drill': {
    name: 'Cool Head Drill',
    trainer: 'Masculine Trainer',
    timeCommitment: '5 minutes',
    summary: '4-7-8 breathing technique combined with trigger identification and de-escalation.',
    sections: [
      { heading: 'The Breakdown', content: '4-7-8 breathing: inhale for 4 seconds, hold for 7, exhale for 8. The science: activates the parasympathetic nervous system, drops heart rate within 90 seconds. Combined with trigger identification: "What just happened? What did I feel? What do I usually do? What will I do instead?"' },
      { heading: 'Tier 1 Adaptation', content: 'Just the breathing. No analysis needed in the moment. Breathe first, think second. The 4-7-8 works even if you can\'t articulate the trigger.' },
      { heading: 'Tier 2 Extension', content: 'Pair with Circuit Breaker (identify the logical fallacy) and Blacksmith (forge the response). Triple-stack for maximum de-escalation.' },
      { heading: 'Practice Scenario', content: 'Your boss just humiliated you in front of colleagues. You feel heat in your chest. Run the Cool Head Drill right now. Time yourself.' },
      { heading: 'Circle Integration', content: 'Opening exercise every week. 2 minutes of 4-7-8 breathing before the War Room begins. Normalises the practice.' },
    ],
  },
  'anchor-drop': {
    name: 'Anchor Drop',
    trainer: 'Spiritual Trainer',
    timeCommitment: '2 minutes',
    summary: 'A compressed spiritual grounding exercise designed for men working early shifts or with no time.',
    sections: [
      { heading: 'The Breakdown', content: 'Two minutes. Three steps: Name one thing you\'re grateful for (10 seconds). State your purpose for today in one sentence (10 seconds). Ask for strength — from God, the universe, your ancestors, whatever your anchor is (10 seconds). The remaining 90 seconds: silence.' },
      { heading: 'Tier 1 Adaptation', content: 'Do it on the taxi. Do it at the gate before your shift. Do it in the shower. No special location needed. No book needed. Just two minutes and honesty.' },
      { heading: 'Tier 2 Extension', content: 'Journal the daily anchor drops. Review weekly for patterns in what you\'re grateful for and what purpose statements recur.' },
      { heading: 'Practice Scenario', content: 'It\'s 4 AM. Your alarm went off. You have a 45-minute taxi ride to work. Drop the anchor before you leave the house.' },
      { heading: 'Circle Integration', content: 'Spiritual Trainer month. Every man shares their most common anchor drop statement. Group discusses what it reveals.' },
    ],
  },
  'dark-room-protocol': {
    name: 'Dark Room Protocol',
    trainer: 'Spiritual Trainer',
    timeCommitment: '15 minutes',
    summary: 'A method for processing shame and secrets when you have no accountability partner available.',
    sections: [
      { heading: 'The Breakdown', content: 'The Envelope Method: Write the thing you cannot say out loud on a piece of paper. Seal it in an envelope. Address it to yourself. Keep it for 7 days. After 7 days, open it and read it as if someone else wrote it. Then decide: share it with your Circle partner, or burn it and move on.' },
      { heading: 'Tier 1 Adaptation', content: 'No pen or paper? Record a voice note. Lock it in a folder on your phone. Listen to it after 7 days. The delay is what matters — it separates the shame from the processing.' },
      { heading: 'Tier 2 Extension', content: 'Write a full letter to yourself. Include context, feelings, and what you wish you could change. After 7 days, write a response letter as if you were your own counsellor.' },
      { heading: 'Practice Scenario', content: 'There\'s something you\'ve never told anyone. Not because it\'s criminal — because it\'s shameful. Use the Dark Room Protocol this week. You don\'t have to share the content. Just share that you did it.' },
      { heading: 'Circle Integration', content: 'Spiritual Trainer month, final week. Facilitator asks: "Did anyone use the Dark Room this month?" No details required. Just acknowledgement.' },
    ],
  },
};

export const SystemDetailPage = () => {
  const { slug } = useParams();
  const system = systemsData[slug];

  if (!system) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <h1 className="font-serif text-4xl font-bold text-malumz-text-primary mb-4">
            System Not Found
          </h1>
          <p className="text-malumz-text-secondary mb-8">
            This system guide is being prepared and will be available soon.
          </p>
          <Link
            to="/systems"
            className="text-malumz-orange font-medium hover:underline"
          >
            ← Back to all systems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-8 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <Link
            to="/systems"
            className="inline-flex items-center gap-2 text-malumz-orange font-medium hover:underline mb-6"
          >
            <ArrowLeft size={18} />
            All Systems
          </Link>
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-3">
            {system.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="text-malumz-text-muted text-sm bg-white px-3 py-1 rounded-full">
              {system.trainer}
            </span>
            <span className="text-malumz-text-muted text-sm bg-white px-3 py-1 rounded-full">
              {system.timeCommitment}
            </span>
          </div>
          <p className="text-lg text-malumz-text-secondary leading-relaxed">
            {system.summary}
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 space-y-12">
          {system.sections.map((section, index) => (
            <div key={index}>
              <h2 className="font-serif text-2xl font-bold text-malumz-text-primary mb-4">
                {section.heading}
              </h2>
              <div className="bg-malumz-cream border-l-4 border-malumz-orange rounded-r-lg p-6">
                <p className="text-malumz-text-secondary leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 text-center">
          <p className="text-malumz-text-muted text-sm italic mb-6">
            Oral option: All content on this page can be consumed via voice note. Record yourself reading each section aloud and replay during your commute.
          </p>
          <Link
            to="/systems"
            className="text-malumz-orange font-medium hover:underline"
          >
            ← Back to all systems
          </Link>
        </div>
      </section>
    </div>
  );
};
