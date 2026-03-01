import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Review {
  id: number;
  author: string;
  authorAvatar: string;
  score: number;
  category: string;
  date: string;
  tags: string[];
  comment: string;
}

const reviewsData: Review[] = [
  {
    id: 1,
    author: "Антон Миронов",
    authorAvatar: "https://picsum.photos/seed/anton1/60/60",
    score: 5,
    category: "Профессионализм",
    date: "28-02-2026",
    tags: ["Экспертность в своей области", "Способность решать сложные задачи", "Обучение и развитие навыков"],
    comment: "Антон проявляет высокий уровень профессионализма и ответственности в своей работе. Отличается глубокими знаниями в своей области, вниманием к деталям и умением эффективно решать поставленные задачи. Всегда соблюдает сроки выполнения работы и поддерживает высокий стандарт качества. Благодаря ответственному подходу и компетентности сотрудник заслужил уважение коллег и доверие руководства. Его вклад в работу команды является значимым и положительно влияет на общие результаты!"
  },
  {
    id: 2,
    author: "Екатерина Андреева",
    authorAvatar: "https://picsum.photos/seed/kate1/60/60",
    score: 1,
    category: "Соблюдение сроков",
    date: "15-02-2026",
    tags: ["Задержки в выполнении задач"],
    comment: "Отсутствие своевременного информирования о возможных задержках затрудняет планирование работы всей команды и негативно влияет на общий рабочий процесс. Вместо того чтобы заранее обозначать риски по срокам, сотрудник нередко сообщает о проблемах уже после наступления дедлайна. Бесит!"
  },
  {
    id: 3,
    author: "Алина Сакунова",
    authorAvatar: "https://picsum.photos/seed/alina1/60/60",
    score: 3,
    category: "Инициативность",
    date: "05-01-2026",
    tags: ["Редко предлагает улучшения", "Недостаток инициативы"],
    comment: "В большинстве случаев Алина ожидает чёткой постановки задач и дополнительных указаний, прежде чем приступать к новым действиям или предлагать изменения. Предложения по улучшению процессов, оптимизации работы или развитию текущих решений со стороны Алины появляются нечасто."
  },
  {
    id: 4,
    author: "Антон Миронов",
    authorAvatar: "https://picsum.photos/seed/anton2/60/60",
    score: 5,
    category: "Профессионализм",
    date: "20-12-2025",
    tags: ["Экспертность в своей области", "Способность решать сложные задачи", "Обучение и развитие навыков"],
    comment: "Антон проявляет высокий уровень профессионализма и ответственности в своей работе. Отличается глубокими знаниями в своей области, вниманием к деталям и умением эффективно решать поставленные задачи. Всегда соблюдает сроки выполнения работы и поддерживает высокий стандарт качества. Благодаря ответственному подходу и компетентности сотрудник заслужил уважение коллег и доверие руководства. Его вклад в работу команды является значимым и положительно влияет на общие результаты!"
  },
  {
    id: 5,
    author: "Екатерина Андреева",
    authorAvatar: "https://picsum.photos/seed/kate2/60/60",
    score: 1,
    category: "Соблюдение сроков",
    date: "10-11-2025",
    tags: ["Задержки в выполнении задач"],
    comment: "Отсутствие своевременного информирования о возможных задержках затрудняет планирование работы всей команды и негативно влияет на общий рабочий процесс. Вместо того чтобы заранее обозначать риски по срокам, сотрудник нередко сообщает о проблемах уже после наступления дедлайна. Бесит!"
  },
  {
    id: 6,
    author: "Алина Сакунова",
    authorAvatar: "https://picsum.photos/seed/alina2/60/60",
    score: 3,
    category: "Инициативность",
    date: "03-09-2025",
    tags: ["Редко предлагает улучшения", "Недостаток инициативы"],
    comment: "В большинстве случаев Алина ожидает чёткой постановки задач и дополнительных указаний, прежде чем приступать к новым действиям или предлагать изменения. Предложения по улучшению процессов, оптимизации работы или развитию текущих решений со стороны Алины появляются нечасто."
  }
];

const getScoreColor = (score: number) => {
  if (score >= 4) return '#00AE1D';
  if (score === 3) return '#FFD900';
  return '#FF0000';
};

type PeriodFilter = 'month' | '3months' | '6months' | 'year' | 'all';

const periodLabels: Record<PeriodFilter, string> = {
  'month': 'Последний месяц',
  '3months': 'Последние 3 месяца',
  '6months': 'Последние 6 месяцев',
  'year': 'Последний год',
  'all': 'Все время'
};

export default function EmployeesReviewsPage() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isManager = userRole === 'manager';
  const [selectedPeriod, setSelectedPeriod] = React.useState<PeriodFilter>('month');
  const [showPeriodDropdown, setShowPeriodDropdown] = React.useState(false);

  const handleAuthorClick = (authorName: string) => {
    if (isManager) {
      // В реальном приложении здесь будет ID сотрудника
      const employeeId = authorName.toLowerCase().replace(/\s+/g, '-');
      navigate(`/employee/${employeeId}`);
    }
  };

  const filterReviewsByPeriod = (reviews: Review[], period: PeriodFilter): Review[] => {
    if (period === 'all') return reviews;

    const now = new Date('2026-03-01'); // Current date from context
    const periodMonths: Record<Exclude<PeriodFilter, 'all'>, number> = {
      'month': 1,
      '3months': 3,
      '6months': 6,
      'year': 12
    };

    const monthsToSubtract = periodMonths[period];
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToSubtract);

    return reviews.filter(review => {
      const [day, month, year] = review.date.split('-').map(Number);
      const reviewDate = new Date(year, month - 1, day);
      return reviewDate >= cutoffDate;
    });
  };

  const filteredReviews = filterReviewsByPeriod(reviewsData, selectedPeriod);

  return (
    <div className="min-h-screen bg-white font-wix">
      <main className="max-w-[1440px] mx-auto px-[56px] pt-16 pb-20">
        
        {/* Title Section */}
        <div className="flex flex-col items-center justify-center gap-[15px] mb-[70px]">
          <h1 className="text-[48px] font-bold leading-[60px] text-black text-center">
            Сотрудники
          </h1>
          <p className="text-[18px] font-bold leading-[24px] text-center text-black">
            Все сотрудники компании
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-center items-center gap-[20px] mb-[70px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">2980</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              сотрудников в филиале
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">9</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              подразделений
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">34</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              новых сотрудника за год
            </p>
          </motion.div>
        </div>

        {/* Reviews Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Недавние отзывы</h2>
          
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <span>Все команды</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              <span>Все сотрудники</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <span>{periodLabels[selectedPeriod]}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              
              {showPeriodDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {(Object.keys(periodLabels) as PeriodFilter[]).map((period) => (
                    <button
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setShowPeriodDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                        selectedPeriod === period ? 'bg-gray-100 font-semibold' : ''
                      }`}
                    >
                      {periodLabels[period]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Нет отзывов за выбранный период
            </div>
          ) : (
            filteredReviews.map((review) => (
            <div 
              key={review.id}
              className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img 
                    src={review.authorAvatar} 
                    alt={review.author}
                    className="w-10 h-10 rounded-full"
                    onClick={() => handleAuthorClick(review.author)}
                    style={{ cursor: isManager ? 'pointer' : 'default' }}
                    title={isManager ? `Перейти в профиль ${review.author}` : ''}
                  />
                  <h3 className="text-lg font-bold text-black">
                    {review.author}
                  </h3>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getScoreColor(review.score) }}
                  />
                  <span className="text-xs font-semibold text-gray-600">
                    Балл: {review.score}/5
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {review.date}
                </span>
              </div>

              {/* Category */}
              <h4 className="text-base font-bold text-black">
                {review.category}
              </h4>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {review.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm leading-relaxed text-gray-700">
                {review.comment}
              </p>
            </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
