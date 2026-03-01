import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import styles from './EmployeeDetailPage.module.css';

interface Review {
  id: number;
  recipient: string;
  recipientAvatar: string;
  score: number;
  category: string;
  date: string;
  tags: string[];
  comment: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    recipient: "Мария Иванова",
    recipientAvatar: "https://picsum.photos/seed/maria/60/60",
    score: 5,
    category: "Профессионализм",
    date: "25-02-2026",
    tags: ["Экспертность в своей области", "Способность решать сложные задачи"],
    comment: "Мария проявляет высокий уровень профессионализма и ответственности в своей работе. Отличается глубокими знаниями в своей области."
  },
  {
    id: 2,
    recipient: "Петр Сидоров",
    recipientAvatar: "https://picsum.photos/seed/petr/60/60",
    score: 4,
    category: "Коммуникация",
    date: "10-01-2026",
    tags: ["Помощь коллегам", "Командная работа"],
    comment: "Петр всегда готов помочь коллегам, хорошо работает в команде."
  },
  {
    id: 3,
    recipient: "Анна Котенкова",
    recipientAvatar: "https://picsum.photos/seed/anna/60/60",
    score: 5,
    category: "Инициативность",
    date: "15-12-2025",
    tags: ["Проактивность", "Новые идеи"],
    comment: "Анна постоянно предлагает новые идеи и берет инициативу в свои руки."
  }
];

const getScoreColor = (score: number) => {
  if (score >= 4) return '#00AE1D';
  if (score === 3) return '#FFD900';
  return '#FF0000';
};

export default function EmployeeDetailPage() {
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [selectedPeriod, setSelectedPeriod] = useState('Последний месяц');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const periods = ['Последний месяц', 'Последние 3 месяца', 'Последние 6 месяцев', 'Последний год', 'Все время'];

  const filterReviewsByPeriod = (reviews: Review[], period: string): Review[] => {
    if (period === 'Все время') return reviews;

    const now = new Date('2026-03-01');
    const periodMonths: Record<string, number> = {
      'Последний месяц': 1,
      'Последние 3 месяца': 3,
      'Последние 6 месяцев': 6,
      'Последний год': 12
    };

    const monthsToSubtract = periodMonths[period] || 1;
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToSubtract);

    return reviews.filter(review => {
      const [day, month, year] = review.date.split('-').map(Number);
      const reviewDate = new Date(year, month - 1, day);
      return reviewDate >= cutoffDate;
    });
  };

  const filteredReviews = filterReviewsByPeriod(mockReviews, selectedPeriod);

  const socialPortraitData = [
    { subject: 'Коммуникация', value: 8.5, fullMark: 10 },
    { subject: 'Профессионализм', value: 9.2, fullMark: 10 },
    { subject: 'Ответственность', value: 8.8, fullMark: 10 },
    { subject: 'Инициативность', value: 7.5, fullMark: 10 },
    { subject: 'Помощь коллегам', value: 8.0, fullMark: 10 },
    { subject: 'Соблюдение сроков', value: 7.8, fullMark: 10 },
  ];

  const handleRecipientClick = (recipientName: string) => {
    const newEmployeeId = recipientName.toLowerCase().replace(/\s+/g, '-');
    navigate(`/employee/${newEmployeeId}`);
  };

  return (
    <div className={styles.page}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        <ArrowLeft className={styles.backIcon} />
        Назад
      </button>

      <div className={styles.profileCard}>
        <img 
          src="https://picsum.photos/seed/sergey/200/200" 
          alt="Profile"
          className={styles.avatar}
        />
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>Сергей Корсаков</h1>
          <p className={styles.position}>Должность: Backend-разработчик</p>
          <p className={styles.avgScore}>Средняя оценка: <span className={styles.scoreValue}>4.5</span></p>
        </div>
      </div>

      <div className={styles.portraitSection}>
        <div className={styles.portraitHeader}>
          <h2 className={styles.portraitTitle}>Портрет сотрудника</h2>
          <div className={styles.portraitActions}>
            <button className={styles.portraitButton}>Динамика за</button>
            <button className={styles.portraitButton}>Последний месяц</button>
          </div>
        </div>
        
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={socialPortraitData}>
              <PolarGrid stroke="#E5E5E5" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#333', fontSize: 14, fontWeight: 600 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 10]} 
                tick={{ fill: '#999', fontSize: 12 }}
              />
              <Radar 
                name="Оценка" 
                dataKey="value" 
                stroke="#FF8800" 
                fill="#FF8800" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' 
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.reviewsSection}>
        <div className={styles.reviewsHeader}>
          <h2 className={styles.reviewsTitle}>Отзывы, оставленные сотрудником</h2>
          
          <div className={styles.filterWrapper}>
            <button 
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className={styles.filterButton}
            >
              {selectedPeriod}
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {showPeriodDropdown && (
              <div className={styles.dropdown}>
                {periods.map(period => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setShowPeriodDropdown(false);
                    }}
                    className={styles.dropdownItem}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.reviewsList}>
          {filteredReviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Нет отзывов за выбранный период
            </div>
          ) : (
            filteredReviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAuthor}>
                  <img 
                    src={review.recipientAvatar} 
                    alt={review.recipient}
                    className={styles.reviewAvatar}
                    onClick={() => handleRecipientClick(review.recipient)}
                    title={`Перейти в профиль ${review.recipient}`}
                  />
                  <span className={styles.authorName}>{review.recipient}</span>
                  <div 
                    className={styles.scoreIndicator}
                    style={{ backgroundColor: getScoreColor(review.score) }}
                  />
                  <span className={styles.scoreText}>Балл: {review.score}/5</span>
                </div>
                <span className={styles.reviewDate}>{review.date}</span>
              </div>

              <h3 className={styles.reviewCategory}>{review.category}</h3>

              <div className={styles.tags}>
                {review.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <p className={styles.reviewComment}>{review.comment}</p>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
