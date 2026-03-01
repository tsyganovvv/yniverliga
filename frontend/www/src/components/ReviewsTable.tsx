import { useState, useMemo, useRef, useEffect, useLayoutEffect, RefObject } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowUpDown, Tag, X, ChevronDown, Check, Filter, SortAsc, SortDesc } from 'lucide-react';

interface Review {
  id: number;
  author: string;
  recipient: string;
  score: number;
  category: string;
  comment: string;
  date: string;
}

const reviewsData: Review[] = [
  { id: 1, author: "Иван Иванов", recipient: "Анна Смирнова", score: 5, category: "Надежность", comment: "Всегда сдает задачи в срок, очень приятно работать вместе.", date: "2026-02-28" },
  { id: 2, author: "Анна Смирнова", recipient: "Сергей Петров", score: 3, category: "Коммуникация", comment: "Рабочие вопросы решаются, но иногда долго отвечает в мессенджерах.", date: "2026-02-27" },
  { id: 3, author: "Сергей Петров", recipient: "Иван Иванов", score: 1, category: "Сроки", comment: "Сорвал дедлайн по важному проекту, не предупредив заранее.", date: "2026-02-25" },
  { id: 4, author: "Мария Кузнецова", recipient: "Дмитрий Волков", score: 4, category: "Помощь", comment: "Помог разобраться с новой документацией, очень доходчиво.", date: "2026-02-24" },
  { id: 5, author: "Дмитрий Волков", recipient: "Елена Соколова", score: 3, category: "Правила", comment: "Средний результат, без особых замечаний, но и без инициативы.", date: "2026-02-22" },
  { id: 6, author: "Елена Соколова", recipient: "Анна Смирнова", score: 5, category: "Наставничество", comment: "Лучший ментор, которого я встречала в этой компании!", date: "2026-02-20" },
  { id: 7, author: "Мария Кузнецова", recipient: "Сергей Петров", score: 2, category: "Тон общения", comment: "Довольно резкое общение на планерках, демотивирует команду.", date: "2026-02-18" },
];

type SortKey = 'date' | 'score' | 'author' | 'recipient' | 'category';
type SortOrder = 'asc' | 'desc';

// Helper to highlight text
const HighlightedText = ({ 
  text, 
  highlight
}: { 
  text: string, 
  highlight: string
}) => {
  if (!highlight.trim()) return <>{text}</>;
  
  const words = highlight.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return <>{text}</>;

  const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-orange-100 text-[#F27D26] rounded-sm px-0.5 font-medium">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

interface FilterDropdownProps {
  title: string;
  columnKey: keyof Review;
  options: (string | number)[];
  selectedValues: (string | number)[];
  onFilterChange: (values: (string | number)[]) => void;
  sortKey: SortKey;
  sortOrder: SortOrder;
  onSortChange: (key: SortKey, order: SortOrder) => void;
  isActive: boolean;
  align?: 'left' | 'right';
}

const FilterDropdown = ({ 
  title, 
  columnKey, 
  options, 
  selectedValues, 
  onFilterChange,
  sortKey,
  sortOrder,
  onSortChange,
  isActive,
  align = 'left'
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 8,
        left: align === 'right' ? rect.right : rect.left,
      });
    }
  }, [isOpen, align]);

  useEffect(() => {
    const handleScroll = () => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 8,
          left: (align === 'right' ? rect.right : rect.left),
        });
      }
    };

    if (isOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen, align]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        (!dropdownContentRef.current || !dropdownContentRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toString().toLowerCase().includes(search.toLowerCase())
  );

  const toggleValue = (value: string | number) => {
    if (selectedValues.includes(value)) {
      onFilterChange(selectedValues.filter(v => v !== value));
    } else {
      onFilterChange([...selectedValues, value]);
    }
  };

  const toggleAll = () => {
    if (selectedValues.length === options.length) {
      onFilterChange([]);
    } else {
      onFilterChange([...options]);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors hover:bg-gray-100 ${
          isActive || selectedValues.length > 0 ? 'text-[#F27D26]' : 'text-gray-400'
        }`}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider">{title}</span>
        <Filter className={`w-3 h-3 ${selectedValues.length > 0 ? 'fill-current' : ''}`} />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              ref={dropdownContentRef}
              style={{ 
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                transform: align === 'right' ? 'translateX(-100%)' : 'none',
              }}
              className="w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-[9999] overflow-hidden"
            >
              {/* Sorting Section */}
              <div className="p-2 border-b border-gray-50">
                <button 
                  onClick={() => { onSortChange(columnKey as SortKey, 'asc'); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors ${
                    sortKey === columnKey && sortOrder === 'asc' ? 'bg-orange-50 text-[#F27D26]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SortAsc className="w-4 h-4" />
                  По возрастанию
                </button>
                <button 
                  onClick={() => { onSortChange(columnKey as SortKey, 'desc'); setIsOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-colors ${
                    sortKey === columnKey && sortOrder === 'desc' ? 'bg-orange-50 text-[#F27D26]' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <SortDesc className="w-4 h-4" />
                  По убыванию
                </button>
              </div>

              {/* Filter Section */}
              <div className="p-3">
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Поиск..."
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#F27D26]/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input 
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-gray-300 text-[#F27D26] focus:ring-[#F27D26]"
                      checked={selectedValues.length === options.length && options.length > 0}
                      onChange={toggleAll}
                    />
                    <span className="text-xs font-medium text-gray-700">(Выделить все)</span>
                  </label>
                  {filteredOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#F27D26] focus:ring-[#F27D26]"
                        checked={selectedValues.includes(opt)}
                        onChange={() => toggleValue(opt)}
                      />
                      <span className="text-xs text-gray-600 truncate">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-2 border-t border-gray-50 flex justify-end gap-2">
                <button 
                  onClick={() => onFilterChange([])}
                  className="px-3 py-1.5 text-[10px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Очистить
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 bg-[#F27D26] text-white rounded-lg text-[10px] font-bold hover:bg-[#d96a1d] transition-colors"
                >
                  Применить
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

export default function ReviewsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Per-column filters
  const [columnFilters, setColumnFilters] = useState<Record<string, (string | number)[]>>({
    author: [],
    recipient: [],
    score: [],
    category: [],
    date: []
  });

  const uniqueValues = useMemo(() => {
    return {
      author: Array.from(new Set(reviewsData.map(r => r.author))).sort(),
      recipient: Array.from(new Set(reviewsData.map(r => r.recipient))).sort(),
      score: Array.from(new Set(reviewsData.map(r => r.score))).sort((a, b) => b - a),
      category: Array.from(new Set(reviewsData.map(r => r.category))).sort(),
      date: Array.from(new Set(reviewsData.map(r => r.date))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    };
  }, []);

  const sortedAndFilteredReviews = useMemo(() => {
    let result = reviewsData.filter(review => {
      // Global search
      const searchWords = searchTerm.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      const matchesSearch = searchWords.every(word => 
        review.author.toLowerCase().includes(word) || 
        review.recipient.toLowerCase().includes(word) ||
        review.category.toLowerCase().includes(word) ||
        review.comment.toLowerCase().includes(word)
      );

      // Column filters
      const matchesAuthor = columnFilters.author.length === 0 || columnFilters.author.includes(review.author);
      const matchesRecipient = columnFilters.recipient.length === 0 || columnFilters.recipient.includes(review.recipient);
      const matchesScore = columnFilters.score.length === 0 || columnFilters.score.includes(review.score);
      const matchesCategory = columnFilters.category.length === 0 || columnFilters.category.includes(review.category);
      const matchesDate = columnFilters.date.length === 0 || columnFilters.date.includes(review.date);

      return matchesSearch && matchesAuthor && matchesRecipient && matchesScore && matchesCategory && matchesDate;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortKey === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortKey === 'score') {
        comparison = a.score - b.score;
      } else if (sortKey === 'author') {
        comparison = a.author.localeCompare(b.author);
      } else if (sortKey === 'recipient') {
        comparison = a.recipient.localeCompare(b.recipient);
      } else if (sortKey === 'category') {
        comparison = a.category.localeCompare(b.category);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchTerm, columnFilters, sortKey, sortOrder]);

  const handleFilterChange = (key: string, values: (string | number)[]) => {
    setColumnFilters(prev => ({ ...prev, [key]: values }));
  };

  const handleSortChange = (key: SortKey, order: SortOrder) => {
    setSortKey(key);
    setSortOrder(order);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setColumnFilters({
      author: [],
      recipient: [],
      score: [],
      category: [],
      date: []
    });
    setSortKey('date');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm !== "" || Object.values(columnFilters).some(v => Array.isArray(v) && v.length > 0);

  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      <div className="p-8 border-b border-gray-50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold">Последние отзывы</h3>
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-[#F27D26] rounded-full text-xs font-bold hover:bg-orange-100 transition-colors"
              >
                <X className="w-3 h-3" />
                Сбросить фильтры
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Поиск по комментариям..." 
                className="pl-10 pr-10 py-2.5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-[#F27D26]/20 transition-all outline-none w-full sm:w-72"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-4">
                <FilterDropdown 
                  title="Отправитель"
                  columnKey="author"
                  options={uniqueValues.author}
                  selectedValues={columnFilters.author}
                  onFilterChange={(v) => handleFilterChange('author', v)}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  isActive={sortKey === 'author'}
                />
              </th>
              <th className="px-8 py-4">
                <FilterDropdown 
                  title="Получатель"
                  columnKey="recipient"
                  options={uniqueValues.recipient}
                  selectedValues={columnFilters.recipient}
                  onFilterChange={(v) => handleFilterChange('recipient', v)}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  isActive={sortKey === 'recipient'}
                />
              </th>
              <th className="px-8 py-4">
                <FilterDropdown 
                  title="Оценка"
                  columnKey="score"
                  options={uniqueValues.score}
                  selectedValues={columnFilters.score}
                  onFilterChange={(v) => handleFilterChange('score', v)}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  isActive={sortKey === 'score'}
                />
              </th>
              <th className="px-8 py-4">
                <FilterDropdown 
                  title="Категория"
                  columnKey="category"
                  options={uniqueValues.category}
                  selectedValues={columnFilters.category}
                  onFilterChange={(v) => handleFilterChange('category', v)}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  isActive={sortKey === 'category'}
                />
              </th>
              <th className="px-8 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Комментарий</th>
              <th className="px-8 py-4">
                <FilterDropdown 
                  title="Дата"
                  columnKey="date"
                  options={uniqueValues.date}
                  selectedValues={columnFilters.date}
                  onFilterChange={(v) => handleFilterChange('date', v)}
                  sortKey={sortKey}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  isActive={sortKey === 'date'}
                  align="right"
                />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {sortedAndFilteredReviews.map((review) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key={review.id} 
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[10px] font-bold text-[#F27D26]">
                        {review.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        <HighlightedText text={review.author} highlight={searchTerm} />
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-gray-600">
                    <HighlightedText text={review.recipient} highlight={searchTerm} />
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center px-4 py-1 rounded-lg text-xs font-bold ${
                      review.score >= 4 ? 'bg-green-50 text-green-700' : 
                      review.score === 3 ? 'bg-gray-100 text-gray-600' : 
                      'bg-red-50 text-red-700'
                    }`}>
                      {review.score}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-medium text-[#F27D26] bg-orange-50/50 px-2 py-1 rounded-md">
                      <HighlightedText text={review.category} highlight={searchTerm} />
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm text-gray-500 max-w-md break-words leading-relaxed">
                      <HighlightedText text={review.comment} highlight={searchTerm} />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-medium text-gray-400">
                    {new Date(review.date).toLocaleDateString('ru-RU')}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        
        {sortedAndFilteredReviews.length === 0 && (
          <div className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-4">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Ничего не найдено</p>
            <p className="text-gray-400 text-sm mt-1">Попробуйте изменить параметры поиска или фильтрации</p>
            <button 
              onClick={resetFilters}
              className="mt-6 text-sm font-bold text-[#F27D26] hover:underline"
            >
              Сбросить все фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
