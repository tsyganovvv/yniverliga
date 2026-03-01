import { useState } from 'react';
import { Bell, Edit2, Trash2 } from 'lucide-react';
import styles from './ProfilePage.module.css';

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

const mockReviews: Review[] = [
  {
    id: 1,
    author: "Антон Миронов",
    authorAvatar: "https://picsum.photos/seed/anton/60/60",
    score: 5,
    category: "Профессионализм",
    date: "28-02-2026",
    tags: ["Экспертность в своей области", "Способность решать сложные задачи", "Обучение и развитие навыков"],
    comment: "Антон проявляет высокий уровень профессионализма и ответственности в своей работе. Отличается глубокими знаниями в своей области, вниманием к деталям и умением эффективно решать поставленные задачи. Всегда соблюдает сроки выполнения работы и поддерживает высокий стандарт качества. Благодаря ответственному подходу и компетентности сотрудник заслужил уважение коллег и доверие руководства. Его вклад в работу команды является значимым и положительно влияет на общие результаты!"
  },
  {
    id: 2,
    author: "Екатерина Андреева",
    authorAvatar: "https://picsum.photos/seed/kate/60/60",
    score: 1,
    category: "Соблюдение сроков",
    date: "15-01-2026",
    tags: ["Задержки в выполнении задач"],
    comment: "Отсутствие своевременного информирования о возможных задержках затрудняет планирование работы всей команды и негативно влияет на общий рабочий процесс. Вместо того чтобы заранее обозначать риски по срокам, сотрудник нередко сообщает о проблемах уже после наступления дедлайна. Бесит!"
  },
  {
    id: 3,
    author: "Алина Сакунова",
    authorAvatar: "https://picsum.photos/seed/alina/60/60",
    score: 3,
    category: "Инициативность",
    date: "10-11-2025",
    tags: ["Редко предлагает улучшения", "Недостаток инициативы"],
    comment: "В большинстве случаев Алина ожидает чёткой постановки задач и дополнительных указаний, прежде чем приступать к новым действиям или предлагать изменения. Предложения по улучшению процессов, оптимизации работы или развитию текущих решений со стороны Алины появляются нечасто."
  }
];

const getScoreColor = (score: number) => {
  if (score >= 4) return '#00AE1D';
  if (score === 3) return '#FFD900';
  return '#FF0000';
};

export default function ProfilePage() {
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

  return (
    <div className={styles.page}>
      {/* Header with notification */}
      <header className={styles.topBar}>
        <Bell className={styles.bellIcon} />
      </header>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <img 
          src="https://picsum.photos/seed/profile/200/200" 
          alt="Profile"
          className={styles.avatar}
        />
        <div className={styles.profileInfo}>
          <h1 className={styles.name}>Анна Котенкова</h1>
          <p className={styles.position}>Должность: Маркетолог</p>
          <button className={styles.editButton}>
            <Edit2 className={styles.editIcon} />
          </button>
        </div>
      </div>

      {/* Reviews Section */}
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

        {/* Reviews List */}
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
                    src={review.authorAvatar} 
                    alt={review.author}
                    className={styles.reviewAvatar}
                  />
                  <span className={styles.authorName}>{review.author}</span>
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

              <div className={styles.reviewActions}>
                <button className={styles.actionButton}>
                  <Edit2 className={styles.actionIcon} />
                </button>
                <button className={styles.actionButtonDelete}>
                  <Trash2 className={styles.actionIcon} />
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
