import { useState, useEffect } from "react";
import styles from "./FeedbackForm.module.css";

const ratings = [1, 2, 3, 4, 5];

const topics = [
  "Профессионализм",
  "Коммуникация",
  "Командная работа",
  "Лидерство",
  "Инициативность",
  "Качество работы"
];

const qualityCategories = [
  "Экспертность в своей области",
  "Способность решать сложные задачи",
  "Обучение и развитие навыков"
];

interface FeedbackFormProps {
  selectedEmployee?: string;
}

export default function FeedbackForm({ selectedEmployee }: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [employee, setEmployee] = useState("");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (selectedEmployee) {
      setEmployee(selectedEmployee);
    }
  }, [selectedEmployee]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = () => {
    if (!employee || !rating || !topic || !context) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }
    alert("Отзыв успешно отправлен!");
    // Reset form
    setEmployee("");
    setRating(null);
    setTopic("");
    setContext("");
    setSelectedCategories([]);
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Оставить отзыв</h2>

      <label>О ком отзыв <span className={styles.required}>*</span></label>
      <input 
        placeholder="Выберите сотрудника" 
        value={employee}
        onChange={(e) => setEmployee(e.target.value)}
        required
      />

      <label>Тема отзыва <span className={styles.required}>*</span></label>
      <select 
        value={topic} 
        onChange={(e) => setTopic(e.target.value)}
        className={styles.select}
        required
      >
        <option value="">Выберите тему</option>
        {topics.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <label>Оценка <span className={styles.required}>*</span></label>

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

      <label>Контекст <span className={styles.required}>*</span></label>
      <textarea 
        placeholder="Почему вы ставите эту оценку?" 
        value={context}
        onChange={(e) => setContext(e.target.value)}
        required
      />

      <label>Категории качества</label>

      <div className={styles.tags}>
        {qualityCategories.map((category) => (
          <button
            key={category}
            type="button"
            className={`${styles.tag} ${selectedCategories.includes(category) ? styles.tagActive : ""}`}
            onClick={() => toggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <button className={styles.submit} onClick={handleSubmit}>Отправить отзыв</button>
    </div>
  );
}
