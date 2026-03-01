import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const AUTH_API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000"
).replace(/\/+$/, "");
const RATE_API_BASE_URL = (
  (import.meta.env.VITE_RATE_API_BASE_URL as string | undefined) ?? "http://localhost:8001"
).replace(/\/+$/, "");

type PeriodFilter = "month" | "3months" | "6months" | "year" | "all";

interface TeamOption {
  id: string;
  name: string;
}

interface ReviewApiRow {
  review_id: string;
  created_at: string;
  from_user_id: string;
  from_username: string;
  from_fullname: string;
  to_user_id: string;
  to_username: string;
  to_fullname: string;
  context: string;
  topic: string;
  category: string;
  feedback_type: string;
  rate: number;
}

interface ReviewCard {
  id: string;
  createdAt: string;
  dateLabel: string;
  authorName: string;
  authorSlug: string;
  authorAvatar: string;
  score: number;
  category: string;
  tags: string[];
  comment: string;
}

const periodLabels: Record<PeriodFilter, string> = {
  month: "Последний месяц",
  "3months": "Последние 3 месяца",
  "6months": "Последние 6 месяцев",
  year: "Последний год",
  all: "Все время",
};

const getScoreColor = (score: number) => {
  if (score >= 4) {
    return "#00AE1D";
  }
  if (score === 3) {
    return "#FFD900";
  }
  return "#FF0000";
};

const formatDate = (isoDate: string) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}-${month}-${year}`;
};

export default function EmployeesReviewsPage() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isManager = userRole === "manager";

  const [teams, setTeams] = useState<TeamOption[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  const [reviews, setReviews] = useState<ReviewCard[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>("month");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  useEffect(() => {
    let disposed = false;

    const loadTeams = async () => {
      setIsLoadingTeams(true);
      setTeamsError(null);

      try {
        const response = await fetch(`${AUTH_API_BASE_URL}/v1/departments/`, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Не удалось загрузить команды (${response.status})`);
        }

        const payload = (await response.json()) as Array<{ id: string; name: string }>;
        if (disposed) {
          return;
        }

        const mappedTeams = payload.map((department) => ({
          id: department.id,
          name: department.name,
        }));
        setTeams(mappedTeams);
        if (mappedTeams.length > 0) {
          setSelectedTeamId((prevValue) => prevValue || mappedTeams[0].id);
        }
      } catch (error) {
        if (!disposed) {
          setTeamsError(error instanceof Error ? error.message : "Ошибка загрузки команд");
        }
      } finally {
        if (!disposed) {
          setIsLoadingTeams(false);
        }
      }
    };

    void loadTeams();
    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    let disposed = false;

    const loadReviews = async () => {
      if (!selectedTeamId) {
        setReviews([]);
        return;
      }

      setIsLoadingReviews(true);
      setReviewsError(null);

      try {
        const response = await fetch(`${RATE_API_BASE_URL}/v1/reviews/department/${selectedTeamId}`, {
          headers: { accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Не удалось загрузить отзывы команды (${response.status})`);
        }

        const payload = (await response.json()) as ReviewApiRow[];
        if (disposed) {
          return;
        }

        const mappedReviews = payload.map((reviewItem) => {
          const authorName = reviewItem.from_fullname?.trim() || reviewItem.from_username || "Неизвестный";
          const authorSlug = reviewItem.from_username || reviewItem.from_user_id;
          const score = Number.isFinite(reviewItem.rate)
            ? Math.min(5, Math.max(1, Number(reviewItem.rate)))
            : 1;

          return {
            id: reviewItem.review_id,
            createdAt: reviewItem.created_at,
            dateLabel: formatDate(reviewItem.created_at),
            authorName,
            authorSlug,
            authorAvatar: `https://picsum.photos/seed/${encodeURIComponent(authorSlug)}/60/60`,
            score,
            category: reviewItem.category || "Без категории",
            tags: [reviewItem.topic, reviewItem.feedback_type].filter(Boolean),
            comment: reviewItem.context || "",
          } satisfies ReviewCard;
        });
        setReviews(mappedReviews);
      } catch (error) {
        if (!disposed) {
          setReviewsError(error instanceof Error ? error.message : "Ошибка загрузки отзывов");
          setReviews([]);
        }
      } finally {
        if (!disposed) {
          setIsLoadingReviews(false);
        }
      }
    };

    void loadReviews();
    return () => {
      disposed = true;
    };
  }, [selectedTeamId]);

  const handleAuthorClick = (authorSlug: string) => {
    if (isManager) {
      navigate(`/employee/${encodeURIComponent(authorSlug)}`);
    }
  };

  const selectedTeamName = useMemo(() => {
    const selectedTeam = teams.find((teamItem) => teamItem.id === selectedTeamId);
    return selectedTeam?.name ?? "Выберите команду";
  }, [selectedTeamId, teams]);

  const filteredReviews = useMemo(() => {
    if (selectedPeriod === "all") {
      return reviews;
    }

    const now = new Date();
    const periodMonths: Record<Exclude<PeriodFilter, "all">, number> = {
      month: 1,
      "3months": 3,
      "6months": 6,
      year: 12,
    };
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - periodMonths[selectedPeriod]);

    return reviews.filter((reviewItem) => {
      const reviewDate = new Date(reviewItem.createdAt);
      if (Number.isNaN(reviewDate.getTime())) {
        return false;
      }
      return reviewDate >= cutoffDate;
    });
  }, [reviews, selectedPeriod]);

  const summary = useMemo(() => {
    const uniqueAuthors = new Set(reviews.map((reviewItem) => reviewItem.authorSlug));
    const avgScore = reviews.length
      ? (reviews.reduce((sum, item) => sum + item.score, 0) / reviews.length).toFixed(1)
      : "0.0";

    return {
      totalReviews: reviews.length,
      authorsCount: uniqueAuthors.size,
      avgScore,
    };
  }, [reviews]);

  return (
    <div className="min-h-screen bg-white font-wix">
      <main className="max-w-[1440px] mx-auto px-[56px] pt-16 pb-20">
        <div className="flex flex-col items-center justify-center gap-[15px] mb-[70px]">
          <h1 className="text-[48px] font-bold leading-[60px] text-black text-center">Сотрудники</h1>
          <p className="text-[18px] font-bold leading-[24px] text-center text-black">
            Отзывы по выбранной команде
          </p>
          {teamsError ? <p className="text-sm text-red-600">{teamsError}</p> : null}
        </div>

        <div className="flex justify-center items-center gap-[20px] mb-[70px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
            className="w-[220px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{summary.totalReviews}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">отзывов в команде</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-[220px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{summary.authorsCount}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">авторов отзывов</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-[220px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{summary.avgScore}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">средняя оценка</p>
          </motion.div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Отзывы команды</h2>

          <div className="flex space-x-4">
            <div className="min-w-[240px]">
              <label className="sr-only" htmlFor="team-select">
                Команда
              </label>
              <select
                id="team-select"
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                disabled={isLoadingTeams || teams.length === 0}
              >
                {isLoadingTeams ? <option value="">Загружаем команды...</option> : null}
                {!isLoadingTeams && teams.length === 0 ? <option value="">{selectedTeamName}</option> : null}
                {teams.map((teamItem) => (
                  <option key={teamItem.id} value={teamItem.id}>
                    {teamItem.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPeriodDropdown((prevValue) => !prevValue)}
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
                        selectedPeriod === period ? "bg-gray-100 font-semibold" : ""
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

        <div className="space-y-6">
          {reviewsError ? <div className="text-center py-12 text-red-600">{reviewsError}</div> : null}
          {isLoadingReviews ? <div className="text-center py-12 text-gray-500">Загружаем отзывы...</div> : null}

          {!isLoadingReviews && !reviewsError && !selectedTeamId ? (
            <div className="text-center py-12 text-gray-500">Выберите команду, чтобы посмотреть отзывы</div>
          ) : null}

          {!isLoadingReviews && !reviewsError && selectedTeamId && filteredReviews.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Нет отзывов за выбранный период</div>
          ) : null}

          {!isLoadingReviews && !reviewsError
            ? filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.authorAvatar}
                        alt={review.authorName}
                        className="w-10 h-10 rounded-full"
                        onClick={() => handleAuthorClick(review.authorSlug)}
                        style={{ cursor: isManager ? "pointer" : "default" }}
                        title={isManager ? `Перейти в профиль ${review.authorName}` : ""}
                      />
                      <h3 className="text-lg font-bold text-black">{review.authorName}</h3>
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getScoreColor(review.score) }} />
                      <span className="text-xs font-semibold text-gray-600">Балл: {review.score}/5</span>
                    </div>
                    <span className="text-sm text-gray-500">{review.dateLabel}</span>
                  </div>

                  <h4 className="text-base font-bold text-black">{review.category}</h4>

                  <div className="flex items-center gap-2 flex-wrap">
                    {review.tags.map((tag, index) => (
                      <span
                        key={`${review.id}-${tag}-${index}`}
                        className="border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed text-gray-700">{review.comment || "Без комментария"}</p>
                </div>
              ))
            : null}
        </div>
      </main>
    </div>
  );
}
