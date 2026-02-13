import { useState, useEffect, useCallback } from 'react';
import { Shield, Users, BookOpen, TrendingUp, Compass, Heart, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const trainers = [
  {
    key: 'family',
    name: 'Family Trainer',
    icon: Shield,
    color: 'text-malumz-orange',
    bgColor: 'bg-malumz-orange/10',
    questions: [
      'I have a stable home environment',
      'I provide emotional support to my family',
      'I am present and engaged with my children/family',
      'I have healthy boundaries with family members',
      'I can resolve conflicts peacefully at home',
      'I contribute financially to my household',
      'I feel loved and supported by my family',
      'I prioritize family time regularly',
      'I communicate openly with my partner/family',
      'I am building a legacy for future generations',
    ],
  },
  {
    key: 'masculine',
    name: 'Masculine Trainer',
    icon: Heart,
    color: 'text-malumz-orange',
    bgColor: 'bg-malumz-orange/10',
    questions: [
      'I understand my role as a man',
      'I balance strength with compassion',
      'I treat women with respect and dignity',
      'I am comfortable expressing emotions',
      'I lead through service, not dominance',
      'I have a clear sense of purpose',
      'I am confident in who I am',
      'I respect both masculine and feminine energy',
      'I reject toxic masculinity',
      'I am becoming the man I want to be',
    ],
  },
  {
    key: 'community',
    name: 'Community Trainer',
    icon: Users,
    color: 'text-malumz-gold',
    bgColor: 'bg-malumz-gold/10',
    questions: [
      'I have a solid group of male friends I can trust',
      'I actively participate in my community',
      'I have accountability partners who check on me',
      'I contribute to the wellbeing of others',
      'I have mentors or role models',
      'I mentor younger men in my community',
      'I ask for help when I need it',
      'I show up for my friends in times of need',
      'I feel connected to my cultural heritage',
      'I am building lasting relationships',
    ],
  },
  {
    key: 'economic',
    name: 'Economic Trainer',
    icon: TrendingUp,
    color: 'text-malumz-gold',
    bgColor: 'bg-malumz-gold/10',
    questions: [
      'I have a stable source of income',
      'I save money consistently',
      'I have a financial plan for the future',
      'I am not overwhelmed by debt',
      'I invest in assets that grow',
      'I have multiple income streams',
      'I understand basic financial principles',
      'I can provide for my family\'s needs',
      'I am building generational wealth',
      'I make wise financial decisions',
    ],
  },
  {
    key: 'academic',
    name: 'Academic Trainer',
    icon: BookOpen,
    color: 'text-malumz-orange',
    bgColor: 'bg-malumz-orange/10',
    questions: [
      'I am continuously learning new skills',
      'I read books regularly',
      'I can articulate my thoughts clearly',
      'I am comfortable with critical thinking',
      'I have completed my formal education goals',
      'I seek knowledge beyond my comfort zone',
      'I have a structured approach to learning',
      'I can teach others what I know',
      'I value education and personal growth',
      'I have overcome educational disadvantages',
    ],
  },
  {
    key: 'spiritual',
    name: 'Spiritual Trainer',
    icon: Compass,
    color: 'text-malumz-gold',
    bgColor: 'bg-malumz-gold/10',
    questions: [
      'I have a clear set of moral values',
      'I practice a faith or spiritual discipline',
      'I seek wisdom beyond material success',
      'I find meaning in helping others',
      'I reflect on my life\'s purpose regularly',
      'I have a moral compass that guides decisions',
      'I practice gratitude and humility',
      'I believe in something greater than myself',
      'I find peace in difficult times',
      'My spiritual life gives me strength',
    ],
  },
];

const allQuestions = trainers.flatMap((t) =>
  t.questions.map((q, i) => ({ trainerKey: t.key, trainerName: t.name, trainerIcon: t.icon, trainerColor: t.color, trainerBg: t.bgColor, questionIndex: i, text: q }))
);

const TOTAL_QUESTIONS = allQuestions.length;

const scaleOptions = [
  { value: 1, label: 'Never', emoji: '1' },
  { value: 2, label: 'Rarely', emoji: '2' },
  { value: 3, label: 'Sometimes', emoji: '3' },
  { value: 4, label: 'Often', emoji: '4' },
  { value: 5, label: 'Always', emoji: '5' },
];

const getScoreCategory = (score) => {
  if (score <= 20) return { label: 'Wild Dog', description: 'Surviving, not living. The rebuild starts now.', color: 'text-red-600', bg: 'bg-red-50' };
  if (score <= 35) return { label: 'In Transition', description: 'Building the foundation. Keep going.', color: 'text-orange-600', bg: 'bg-orange-50' };
  if (score <= 45) return { label: 'Self-Trained', description: 'Making real progress. Time to train others.', color: 'text-malumz-gold', bg: 'bg-yellow-50' };
  return { label: 'Malumz', description: 'Leading and training others. You are the movement.', color: 'text-green-600', bg: 'bg-green-50' };
};

export const GapTestPage = () => {
  const [currentQ, setCurrentQ] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [animating, setAnimating] = useState(false);

  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / TOTAL_QUESTIONS) * 100;

  const advance = useCallback((nextQ) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentQ(nextQ);
      setAnimating(false);
    }, 300);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (currentQ < 0 || currentQ >= TOTAL_QUESTIONS) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 5) {
        handleAnswer(num);
      }
      if (e.key === 'Backspace' && currentQ > 0) {
        advance(currentQ - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleAnswer = (value) => {
    if (animating) return;
    const q = allQuestions[currentQ];
    const key = `${q.trainerKey}-${q.questionIndex}`;
    setAnswers((prev) => ({ ...prev, [key]: value }));

    if (currentQ < TOTAL_QUESTIONS - 1) {
      advance(currentQ + 1);
    } else {
      advance(TOTAL_QUESTIONS);
    }
  };

  const calculateResults = () => {
    const trainerScores = {};
    trainers.forEach((t) => {
      let sum = 0;
      t.questions.forEach((_, i) => {
        const key = `${t.key}-${i}`;
        sum += answers[key] || 0;
      });
      trainerScores[t.key] = Math.round((sum / (t.questions.length * 5)) * 10);
    });
    const total = Object.values(trainerScores).reduce((a, b) => a + b, 0);
    return { trainerScores, total };
  };

  const handleRestart = () => {
    setCurrentQ(-1);
    setAnswers({});
    setAnimating(false);
  };

  if (currentQ === -1) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-lg mx-auto px-4 md:px-8 text-center">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
            Mind the Gap
          </h1>
          <p className="text-malumz-text-secondary text-lg mb-2">
            60 questions. 6 Trainers. About 5 minutes.
          </p>
          <p className="text-malumz-text-muted text-sm mb-10">
            Rate each statement honestly. No right or wrong answers.
          </p>

          <div className="bg-white border border-malumz-brown/10 rounded-2xl p-8 shadow-lg mb-8">
            <div className="space-y-4 text-left mb-8">
              {trainers.map((t) => {
                const Icon = t.icon;
                return (
                  <div key={t.key} className="flex items-center gap-3">
                    <div className={`${t.bgColor} p-2 rounded-lg`}>
                      <Icon className={t.color} size={20} />
                    </div>
                    <span className="font-medium text-malumz-text-primary text-sm">{t.name}</span>
                    <span className="text-malumz-text-muted text-xs ml-auto">10 questions</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => advance(0)}
              className="w-full bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-2xl px-8 py-5 font-semibold text-lg transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              Start
            </button>
          </div>

          <p className="text-malumz-text-muted text-xs">
            No sign-up required. Your answers stay on your device.
          </p>
        </div>
      </div>
    );
  }

  if (currentQ >= TOTAL_QUESTIONS) {
    const { trainerScores, total } = calculateResults();
    const category = getScoreCategory(total);

    return (
      <div className="min-h-screen pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-lg mx-auto px-4 md:px-8">
          <div className={`${category.bg} rounded-2xl p-8 text-center mb-8`}>
            <p className="text-malumz-text-muted text-sm mb-2">Your Score</p>
            <div className={`text-7xl font-bold ${category.color} mb-2`}>
              {total}/60
            </div>
            <p className={`text-2xl font-bold ${category.color} mb-1`}>
              {category.label}
            </p>
            <p className="text-malumz-text-secondary text-sm">
              {category.description}
            </p>
          </div>

          <div className="bg-white border border-malumz-brown/10 rounded-2xl p-6 mb-8">
            <h2 className="font-serif text-xl font-bold text-malumz-text-primary mb-5">
              Trainer Breakdown
            </h2>
            <div className="space-y-4">
              {trainers.map((t) => {
                const Icon = t.icon;
                const score = trainerScores[t.key];
                const pct = (score / 10) * 100;
                return (
                  <div key={t.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={t.color} size={18} />
                        <span className="font-medium text-malumz-text-primary text-sm">
                          {t.name}
                        </span>
                      </div>
                      <span className="font-bold text-malumz-gold text-lg">{score}/10</span>
                    </div>
                    <div className="w-full bg-malumz-paper rounded-full h-3">
                      <div
                        className="bg-malumz-gold rounded-full h-3 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border-l-4 border-malumz-orange rounded-r-2xl p-6 mb-8">
            <h3 className="font-serif text-lg font-bold text-malumz-text-primary mb-3">
              What Now?
            </h3>
            <p className="text-malumz-text-secondary text-sm leading-relaxed mb-4">
              {total <= 35
                ? "You're in transition. The Dog Trainer book will give you the framework to understand your gaps and start rebuilding systematically."
                : "You're making progress. A Brotherhood Circle will help you push further with 20 men holding you accountable."}
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/book"
                className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-xl px-6 py-3.5 font-semibold text-center transition-all text-sm"
              >
                Get the Book
              </Link>
              <Link
                to="/join"
                className="bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white rounded-xl px-6 py-3.5 font-semibold text-center transition-all text-sm"
              >
                Start a Brotherhood Circle
              </Link>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="flex items-center gap-2 mx-auto text-malumz-text-muted text-sm hover:text-malumz-text-secondary transition-colors"
          >
            <RotateCcw size={14} />
            Take it again
          </button>
        </div>
      </div>
    );
  }

  const q = allQuestions[currentQ];
  const Icon = q.trainerIcon;
  const currentAnswer = answers[`${q.trainerKey}-${q.questionIndex}`];
  const trainerStart = allQuestions.findIndex((item) => item.trainerKey === q.trainerKey);
  const questionInTrainer = currentQ - trainerStart + 1;
  const isNewTrainer = currentQ === trainerStart;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-malumz-cream">
      <div className="max-w-lg mx-auto px-4 md:px-8">
        <div className="mb-6">
          <div className="flex justify-between text-xs text-malumz-text-muted mb-1.5">
            <span>{currentQ + 1} of {TOTAL_QUESTIONS}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-malumz-paper rounded-full h-2">
            <div
              className="bg-malumz-gold rounded-full h-2 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={`flex items-center gap-2 mb-4 ${isNewTrainer ? '' : ''}`}>
          <div className={`${q.trainerBg} p-1.5 rounded-lg`}>
            <Icon className={q.trainerColor} size={16} />
          </div>
          <span className="font-medium text-malumz-text-secondary text-xs">
            {q.trainerName} — {questionInTrainer}/10
          </span>
        </div>

        <div className={`transition-all duration-300 ${animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}>
          <div className="bg-white border border-malumz-brown/10 rounded-2xl p-6 md:p-8 shadow-lg mb-6 min-h-[140px] flex items-center">
            <p className="font-serif text-xl md:text-2xl font-bold text-malumz-text-primary leading-snug">
              {q.text}
            </p>
          </div>

          <div className="grid grid-cols-5 gap-2 md:gap-3 mb-6">
            {scaleOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className={`flex flex-col items-center gap-1 py-4 md:py-5 rounded-xl border-2 font-bold transition-all active:scale-95 ${
                  currentAnswer === opt.value
                    ? 'border-malumz-orange bg-malumz-orange/10 text-malumz-orange'
                    : 'border-malumz-brown/10 bg-white text-malumz-text-primary hover:border-malumz-orange/40 hover:bg-malumz-orange/5'
                }`}
              >
                <span className="text-2xl md:text-3xl">{opt.emoji}</span>
                <span className="text-[10px] md:text-xs text-malumz-text-muted font-normal">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => { if (currentQ > 0) advance(currentQ - 1); }}
            disabled={currentQ === 0}
            className="flex items-center gap-1.5 text-malumz-text-muted text-sm hover:text-malumz-text-secondary transition-colors disabled:opacity-30"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <span className="text-malumz-text-muted text-xs">
            Press 1–5 or tap
          </span>
        </div>
      </div>
    </div>
  );
};
