import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import styles from "./FeedbackForm.module.css";

const ratings = [1, 2, 3, 4, 5];

const AUTH_API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000"
).replace(/\/+$/, "");
const RATE_API_BASE_URL = (
  (import.meta.env.VITE_RATE_API_BASE_URL as string | undefined) ?? "http://localhost:8001"
).replace(/\/+$/, "");

interface FeedbackFormProps {
  selectedEmployee?: string;
}

interface DepartmentOption {
  id: string;
  name: string;
}

interface EmployeeOption {
  id: string;
  username: string;
  fullname: string;
  department_id: string;
}

interface TopicOption {
  id: string;
  name: string;
  categories: string[];
}

interface UserApiResponse {
  id: string;
  username: string;
  fullname?: string | null;
  department_id: string;
}

interface TopicApiResponse {
  id: string;
  name: string;
  categories?: string[];
}

interface DepartmentApiResponse {
  id: string;
  name: string;
}

const dedupe = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export default function FeedbackForm({ selectedEmployee }: FeedbackFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [teamId, setTeamId] = useState("");
  const [employee, setEmployee] = useState("");
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [context, setContext] = useState("");
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [isLoadingLookups, setIsLoadingLookups] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lookupsError, setLookupsError] = useState<string | null>(null);

  const resolveEmployee = (inputValue: string, source: EmployeeOption[]): EmployeeOption | null => {
    const query = normalize(inputValue);
    if (!query) {
      return null;
    }

    const exact = source.find(
      (employeeItem) =>
        normalize(employeeItem.fullname) === query || normalize(employeeItem.username) === query,
    );
    if (exact) {
      return exact;
    }

    const partial = source.filter(
      (employeeItem) =>
        normalize(employeeItem.fullname).includes(query) ||
        normalize(employeeItem.username).includes(query),
    );
    if (partial.length === 1) {
      return partial[0];
    }

    return null;
  };

  useEffect(() => {
    let disposed = false;

    const loadLookups = async () => {
      setIsLoadingLookups(true);
      setLookupsError(null);

      try {
        const [usersResponse, topicsResponse, departmentsResponse] = await Promise.all([
          fetch(`${AUTH_API_BASE_URL}/v1/users/`, { headers: { accept: "application/json" } }),
          fetch(`${RATE_API_BASE_URL}/v1/topics/`, { headers: { accept: "application/json" } }),
          fetch(`${AUTH_API_BASE_URL}/v1/departments/`, { headers: { accept: "application/json" } }),
        ]);

        if (!usersResponse.ok) {
          throw new Error(`Не удалось загрузить сотрудников (${usersResponse.status})`);
        }
        if (!topicsResponse.ok) {
          throw new Error(`Не удалось загрузить топики (${topicsResponse.status})`);
        }
        if (!departmentsResponse.ok) {
          throw new Error(`Не удалось загрузить команды (${departmentsResponse.status})`);
        }

        const usersPayload = (await usersResponse.json()) as UserApiResponse[];
        const topicsPayload = (await topicsResponse.json()) as TopicApiResponse[];
        const departmentsPayload = (await departmentsResponse.json()) as DepartmentApiResponse[];

        if (disposed) {
          return;
        }

        setDepartments(
          departmentsPayload.map((department) => ({
            id: department.id,
            name: department.name,
          })),
        );

        setEmployees(
          usersPayload
            .filter((userItem) => Boolean(userItem.department_id))
            .map((userItem) => ({
              id: userItem.id,
              username: userItem.username,
              fullname: (userItem.fullname ?? "").trim() || userItem.username,
              department_id: userItem.department_id,
            })),
        );

        setTopics(
          topicsPayload.map((topicItem) => ({
            id: topicItem.id,
            name: topicItem.name,
            categories: dedupe(topicItem.categories ?? []),
          })),
        );
      } catch (error) {
        if (disposed) {
          return;
        }
        setLookupsError(error instanceof Error ? error.message : "Ошибка загрузки данных");
      } finally {
        if (!disposed) {
          setIsLoadingLookups(false);
        }
      }
    };

    loadLookups();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedEmployee) {
      return;
    }
    setEmployee(selectedEmployee);
    const resolved = resolveEmployee(selectedEmployee, employees);
    if (resolved) {
      setEmployeeId(resolved.id);
      setTeamId(resolved.department_id);
    }
  }, [selectedEmployee, employees]);

  const employeesForSelectedTeam = useMemo(
    () => (teamId ? employees.filter((employeeItem) => employeeItem.department_id === teamId) : employees),
    [employees, teamId],
  );

  const matchedTopic = useMemo(
    () => topics.find((topicItem) => topicItem.name.toLowerCase() === topic.trim().toLowerCase()) ?? null,
    [topic, topics],
  );

  const categoryOptions = useMemo(() => {
    if (matchedTopic) {
      return matchedTopic.categories;
    }
    return dedupe(topics.flatMap((topicItem) => topicItem.categories));
  }, [matchedTopic, topics]);

  useEffect(() => {
    setCategory("");
    setSelectedCategories([]);
  }, [topic]);

  useEffect(() => {
    const resolved = resolveEmployee(employee, employeesForSelectedTeam);
    setEmployeeId(resolved?.id ?? null);
  }, [employee, employeesForSelectedTeam]);

  useEffect(() => {
    setEmployee("");
    setEmployeeId(null);
  }, [teamId]);

  const addCategory = () => {
    const normalizedCategory = category.trim();
    if (!normalizedCategory) {
      return;
    }
    setSelectedCategories((prev) =>
      prev.some((item) => normalize(item) === normalize(normalizedCategory))
        ? prev
        : [...prev, normalizedCategory],
    );
    setCategory("");
  };

  const removeCategory = (categoryToRemove: string) => {
    setSelectedCategories((prev) => prev.filter((item) => item !== categoryToRemove));
  };

  const handleSubmit = async () => {
    if (!teamId || !employee || !rating || !topic || !context.trim()) {
      alert("Пожалуйста, заполните все обязательные поля");
      return;
    }

    if (selectedCategories.length === 0) {
      alert("Добавьте хотя бы одну категорию");
      return;
    }

    if (!user?.id) {
      alert("Не удалось определить текущего пользователя. Перезайдите в систему.");
      return;
    }

    const targetEmployee = employeeId
      ? employeesForSelectedTeam.find((employeeItem) => employeeItem.id === employeeId) ?? null
      : resolveEmployee(employee, employeesForSelectedTeam);

    if (!targetEmployee) {
      alert("Выберите сотрудника из списка выбранной команды");
      return;
    }

    try {
      setIsSubmitting(true);

      const responses = await Promise.all(
        selectedCategories.map((categoryItem) =>
          fetch(`${RATE_API_BASE_URL}/v1/reviews/`, {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              from_user_id: user.id,
              to_user_id: targetEmployee.id,
              topic,
              category: categoryItem,
              context: context.trim(),
              is_positive: rating >= 4,
              rate: rating,
            }),
          }),
        ),
      );

      const failedResponse = responses.find((response) => !response.ok);
      if (failedResponse) {
        const payload = (await failedResponse.json().catch(() => null)) as { detail?: string } | null;
        throw new Error(payload?.detail || `Ошибка отправки (${failedResponse.status})`);
      }

      alert("Отзывы успешно отправлены и сохранены");
      setTeamId("");
      setEmployee("");
      setEmployeeId(null);
      setRating(null);
      setTopic("");
      setCategory("");
      setSelectedCategories([]);
      setContext("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Не удалось отправить отзыв");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>Оставить отзыв</h2>

      {lookupsError ? <p className={styles.error}>{lookupsError}</p> : null}
      {isLoadingLookups ? <p className={styles.hint}>Загружаем команды, сотрудников, топики и категории...</p> : null}

      <label>
        Команда <span className={styles.required}>*</span>
      </label>
      <select className={styles.select} value={teamId} onChange={(e) => setTeamId(e.target.value)} required>
        <option value="">Выберите команду</option>
        {departments.map((department) => (
          <option key={department.id} value={department.id}>
            {department.name}
          </option>
        ))}
      </select>

      <label>
        О ком отзыв <span className={styles.required}>*</span>
      </label>
      <input
        placeholder={teamId ? "Начните вводить имя сотрудника" : "Сначала выберите команду"}
        value={employee}
        onChange={(e) => setEmployee(e.target.value)}
        list="employees-list"
        autoComplete="off"
        disabled={!teamId}
        required
      />
      <datalist id="employees-list">
        {employeesForSelectedTeam.map((employeeItem) => (
          <option
            key={employeeItem.id}
            value={employeeItem.fullname}
            label={`${employeeItem.fullname} (${employeeItem.username})`}
          />
        ))}
      </datalist>

      <label>
        Тема отзыва <span className={styles.required}>*</span>
      </label>
      <select className={styles.select} value={topic} onChange={(e) => setTopic(e.target.value)} required>
        <option value="">Выберите тему</option>
        {topics.map((topicItem) => (
          <option key={topicItem.id} value={topicItem.name}>
            {topicItem.name}
          </option>
        ))}
      </select>

      <label>
        Категории <span className={styles.required}>*</span>
      </label>
      <div className={styles.categoryInputRow}>
        <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Выберите категорию</option>
          {categoryOptions.map((categoryOption) => (
            <option key={categoryOption} value={categoryOption}>
              {categoryOption}
            </option>
          ))}
        </select>
        <button type="button" className={styles.addCategoryButton} onClick={addCategory}>
          Добавить
        </button>
      </div>
      <p className={styles.hint}>
        {matchedTopic
          ? "Категории отфильтрованы по выбранной теме"
          : "Сначала выберите тему, чтобы сузить категории"}
      </p>

      <div className={styles.tags}>
        {selectedCategories.map((categoryItem) => (
          <button
            key={categoryItem}
            type="button"
            className={`${styles.tag} ${styles.tagActive}`}
            onClick={() => removeCategory(categoryItem)}
            title="Нажмите, чтобы удалить категорию"
          >
            {categoryItem}
          </button>
        ))}
      </div>

      <label>
        Оценка <span className={styles.required}>*</span>
      </label>
      <div className={styles.rating}>
        {ratings.map((r) => (
          <button
            key={r}
            type="button"
            className={`${styles.rateBtn} ${rating === r ? styles.active : ""}`}
            onClick={() => setRating(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <label>
        Контекст <span className={styles.required}>*</span>
      </label>
      <textarea
        placeholder="Почему вы ставите эту оценку?"
        value={context}
        onChange={(e) => setContext(e.target.value)}
        required
      />

      <button className={styles.submit} onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Отправляем..." : "Отправить отзыв"}
      </button>
    </div>
  );
}
