import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import styles from "./NotificationsPage.module.css";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = [
    {
      id: "q1",
      text: "Насколько вы удовлетворены своей текущей работой?",
      type: "rating" as const
    },
    {
      id: "q2",
      text: "Что вам больше всего нравится в вашей работе?",
      type: "text" as const
    },
    {
      id: "q3",
      text: "Насколько вероятно, что вы порекомендуете нашу компанию как место работы?",
      type: "rating" as const
    },
    {
      id: "q4",
      text: "Какие области требуют улучшения?",
      type: "text" as const
    }
  ];

  const handleRatingChange = (questionId: string, value: number) => {
    setAnswers({ ...answers, [questionId]: value.toString() });
  };

  const handleTextChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = () => {
    const allAnswered = questions.every(q => answers[q.id]);
    if (!allAnswered) {
      alert("Пожалуйста, ответьте на все вопросы");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate('/team')}>
            <ArrowLeft className={styles.backIcon} />
          </button>
          <h1>Уведомления</h1>
        </header>

        <div className={styles.content}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Спасибо за прохождение анкеты!</h2>
            <p className={styles.successText}>Ваши ответы помогут нам улучшить рабочую среду</p>
            <button className={styles.backToTeamButton} onClick={() => navigate('/team')}>
              Вернуться к команде
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/team')}>
          <ArrowLeft className={styles.backIcon} />
        </button>
        <h1>Уведомления</h1>
      </header>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Анкета удовлетворенности сотрудников</h2>
            <div className={styles.deadline}>
              <Calendar className={styles.calendarIcon} />
              <span>Дедлайн: 15 марта 2026</span>
            </div>
          </div>

          <p className={styles.description}>
            Пожалуйста, уделите несколько минут для заполнения этой анкеты. 
            Ваши ответы помогут нам улучшить условия работы.
          </p>

          <div className={styles.questions}>
            {questions.map((question, index) => (
              <div key={question.id} className={styles.question}>
                <label className={styles.questionLabel}>
                  {index + 1}. {question.text} <span className={styles.required}>*</span>
                </label>

                {question.type === "rating" ? (
                  <div className={styles.ratingContainer}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        className={`${styles.ratingButton} ${
                          answers[question.id] === rating.toString() ? styles.activeRating : ""
                        }`}
                        onClick={() => handleRatingChange(question.id, rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className={styles.textarea}
                    placeholder="Введите ваш ответ..."
                    value={answers[question.id] || ""}
                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                    rows={4}
                  />
                )}
              </div>
            ))}
          </div>

          <button className={styles.submitButton} onClick={handleSubmit}>
            Отправить анкету
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
