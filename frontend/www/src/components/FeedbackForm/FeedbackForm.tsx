import { useState } from "react";
import styles from "./FeedbackForm.module.css";

const ratings = [1, 2, 3, 4, 5];

export default function FeedbackForm() {
  const [rating, setRating] = useState<number | null>(null);

  return (
    <div className={styles.card}>
      <h2>Оставить отзыв</h2>

      <label>О ком отзыв</label>
      <input placeholder="Выберите сотрудника" />

      <label>Оценка</label>

      <div className={styles.rating}>
        {ratings.map((r) => (
          <button
            key={r}
            className={`${styles.rateBtn} ${rating === r ? styles.active : ""}`}
            onClick={() => setRating(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <label>Контекст</label>
      <textarea placeholder="Почему вы ставите эту оценку?" />

      <label>Категории качества</label>

      <div className={styles.tags}>
        <span>Экспертность в своей области</span>
        <span>Способность решать сложные задачи</span>
        <span>Обучение и развитие навыков</span>
      </div>

      <button className={styles.submit}>Отправить отзыв</button>
    </div>
  );
}
