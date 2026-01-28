import { useState } from 'react';
import { Shield, Users, BookOpen, TrendingUp, Compass, Heart, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const GapTestPage = () => {
  const [currentStep, setCurrentStep] = useState(-1);
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const [answers, setAnswers] = useState({
    family: Array(10).fill(0),
    community: Array(10).fill(0),
    academic: Array(10).fill(0),
    economic: Array(10).fill(0),
    identity: Array(10).fill(0),
    spiritual: Array(10).fill(0),
  });
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      key: 'identity',
      name: 'Identity Trainer',
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

  const handleUserInfoChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (trainerKey, questionIndex, value) => {
    setAnswers({
      ...answers,
      [trainerKey]: answers[trainerKey].map((ans, idx) =>
        idx === questionIndex ? parseInt(value) : ans
      ),
    });
  };

  const handleNext = () => {
    if (currentStep < trainers.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submission = {
        name: userInfo.name,
        email: userInfo.email,
        answers: Object.keys(answers).map((key) => ({
          trainer: key,
          questions: answers[key],
        })),
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/gap-test`, submission);
      setResult(response.data);
      setCurrentStep(trainers.length);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Gap test submission error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreMessage = (score) => {
    // Convert to 60-point scale for display (score/10)
    const displayScore = Math.round(score / 10);
    if (displayScore <= 20) return { message: 'Wild Dog - Surviving, not living', color: 'text-red-600' };
    if (displayScore <= 35) return { message: 'In Transition - Building the foundation', color: 'text-orange-600' };
    if (displayScore <= 45) return { message: 'Self-Trained - Making real progress', color: 'text-malumz-gold' };
    return { message: 'Malumz - Leading and training others', color: 'text-green-600' };
  };

  // User Info Step
  if (currentStep === -1) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary text-center mb-6">
            Mind the Gap Test
          </h1>
          <p className="text-center text-malumz-text-secondary text-lg mb-12">
            Discover where you stand across the Six Trainers framework. Takes about 10 minutes.
          </p>
          <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 shadow-lg">
            <h2 className="font-serif text-2xl font-bold text-malumz-text-primary mb-6">
              Before We Begin
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  required
                  data-testid="gap-test-name-input"
                  className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-malumz-text-secondary mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleUserInfoChange}
                  required
                  data-testid="gap-test-email-input"
                  className="w-full bg-malumz-cream border border-malumz-brown/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-malumz-orange focus:border-transparent transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
              <button
                onClick={() => setCurrentStep(0)}
                disabled={!userInfo.name || !userInfo.email}
                data-testid="gap-test-start-button"
                className="w-full bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-8 py-4 font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                Start the Test
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Step
  if (result) {
    const scoreMessage = getScoreMessage(result.total_score);
    return (
      <div className="min-h-screen pt-32 pb-16 bg-malumz-cream">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <CheckCircle2 size={64} className="text-malumz-gold mx-auto mb-6" />
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-malumz-text-primary mb-4">
              Your Score
            </h1>
            <div className={`text-7xl font-bold ${scoreMessage.color} mb-4`}>
              {Math.round(result.total_score / 10)}/60
            </div>
            <p className={`text-2xl font-semibold ${scoreMessage.color}`}>
              {scoreMessage.message}
            </p>
          </div>

          <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 mb-8">
            <h2 className="font-serif text-2xl font-bold text-malumz-text-primary mb-6">
              Breakdown by Trainer
            </h2>
            <div className="space-y-4">
              {Object.entries(result.scores_by_trainer).map(([trainerKey, score]) => {
                const trainer = trainers.find((t) => t.key === trainerKey);
                const Icon = trainer.icon;
                return (
                  <div key={trainerKey} className="flex items-center justify-between p-4 bg-malumz-cream rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={trainer.color} size={24} />
                      <span className="font-semibold text-malumz-text-primary">
                        {trainer.name}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-malumz-gold">
                      {Math.round(score / 10)}/10
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-malumz-paper border-l-4 border-malumz-orange p-8 rounded-lg mb-8">
            <h3 className="font-serif text-xl font-bold text-malumz-text-primary mb-4">
              What's Next?
            </h3>
            <p className="text-malumz-text-secondary leading-relaxed mb-4">
              {result.total_score <= 35
                ? "You're in transition. The Dog Trainer book will give you the framework to understand your gaps and start rebuilding systematically."
                : "You're making progress. The 30-Day Rebuild Program will help you push from self-trained to Malumz level."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                to="/book"
                data-testid="result-buy-book-cta"
                className="bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-6 py-3 font-semibold text-center transition-all"
              >
                Buy the Book - R299
              </Link>
              <Link
                to="/"
                data-testid="result-home-cta"
                className="bg-transparent border-2 border-malumz-orange text-malumz-orange hover:bg-malumz-orange hover:text-white rounded-full px-6 py-3 font-semibold text-center transition-all"
              >
                Explore Programs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Question Steps
  const trainer = trainers[currentStep];
  const Icon = trainer.icon;
  const progress = ((currentStep + 1) / trainers.length) * 100;

  return (
    <div className="min-h-screen pt-32 pb-16 bg-malumz-cream">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-malumz-text-secondary mb-2">
            <span>Progress</span>
            <span>{currentStep + 1} of {trainers.length}</span>
          </div>
          <div className="w-full bg-malumz-paper rounded-full h-3">
            <div
              className="bg-malumz-gold rounded-full h-3 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Trainer Card */}
        <div className="bg-white border border-malumz-brown/10 rounded-xl p-8 shadow-lg mb-8">
          <div className="flex items-center gap-4 mb-8">
            <div className={`${trainer.bgColor} p-4 rounded-full`}>
              <Icon className={trainer.color} size={40} />
            </div>
            <h2 className="font-serif text-3xl font-bold text-malumz-text-primary">
              {trainer.name}
            </h2>
          </div>

          <div className="space-y-6">
            {trainer.questions.map((question, index) => (
              <div key={index} className="space-y-3">
                <label className="block text-malumz-text-secondary font-medium">
                  {index + 1}. {question}
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-malumz-text-muted w-24">Strongly Disagree</span>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={answers[trainer.key][index]}
                    onChange={(e) =>
                      handleAnswerChange(trainer.key, index, e.target.value)
                    }
                    data-testid={`gap-test-question-${currentStep}-${index}`}
                    className="flex-1 h-2 bg-malumz-paper rounded-lg appearance-none cursor-pointer accent-malumz-orange"
                  />
                  <span className="text-sm text-malumz-text-muted w-24 text-right">Strongly Agree</span>
                  <div className="w-12 text-center">
                    <span className="text-2xl font-bold text-malumz-gold">
                      {answers[trainer.key][index]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            data-testid="gap-test-previous-button"
            className="flex items-center gap-2 bg-transparent border-2 border-malumz-brown text-malumz-brown hover:bg-malumz-brown hover:text-white rounded-full px-6 py-3 font-medium transition-all disabled:opacity-30"
          >
            <ArrowLeft size={20} />
            Previous
          </button>
          {currentStep < trainers.length - 1 ? (
            <button
              onClick={handleNext}
              data-testid="gap-test-next-button"
              className="flex items-center gap-2 bg-malumz-orange text-white hover:bg-malumz-orange-dark rounded-full px-6 py-3 font-medium transition-all"
            >
              Next
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              data-testid="gap-test-submit-button"
              className="flex items-center gap-2 bg-malumz-gold text-malumz-text-primary hover:bg-malumz-gold/90 rounded-full px-8 py-3 font-semibold transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Calculating...' : 'See My Score'}
              <CheckCircle2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
