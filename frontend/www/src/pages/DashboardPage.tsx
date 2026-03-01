import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import ClimateMonitoringGraph from '../components/ClimateMonitoringGraph';
import ReviewsTable from '../components/ReviewsTable';
import AnalyticsPage from '../components/AnalyticsPage';
import EmployeesReviewsPage from '../components/EmployeesReviewsPage';
import ReportsPage from '../components/ReportsPage';

const navItems = [
  { name: 'Сотрудники', id: 'employees' },
  { name: 'Отзывы', id: 'reviews' },
  { name: 'Анкетирование', id: 'analytics' },
  { name: 'Отчёты', id: 'reports' },
];

const stats = [
  { value: '1567', label: 'отзывов' },
  { value: '594', label: 'позитивных' },
  { value: '768', label: 'нейтральных' },
  { value: '205', label: 'негативных' },
  { value: '4.2', label: 'средний балл' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('employees');
  const [selectedPeriod, setSelectedPeriod] = useState('Последний месяц');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  const isManager = userRole === 'manager';

  const periods = ['Последний месяц', 'Последние 3 месяца', 'Последние 6 месяцев', 'Последний год', 'Все время'];

  useEffect(() => {
    if (!isManager) {
      navigate('/team');
    }
  }, [isManager, navigate]);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  return (
    <div className="min-h-screen pb-20 bg-white font-wix">
      <header className="flex items-center justify-between px-8 py-6 bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex-1"></div>
        <nav className="flex items-center space-x-12">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`text-[16px] font-bold leading-5 transition-colors relative ${
                activeTab === item.id 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#FFCC00] via-[#FF8800] to-[#FF0000]' 
                  : 'text-black hover:text-gray-700'
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <div className="flex-1"></div>
      </header>

      {activeTab === 'employees' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="employees"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmployeesReviewsPage />
          </motion.div>
        </AnimatePresence>
      ) : activeTab === 'analytics' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="analytics"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AnalyticsPage />
          </motion.div>
        </AnimatePresence>
      ) : activeTab === 'reports' ? (
        <AnimatePresence mode="wait">
          <motion.div
            key="reports"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ReportsPage />
          </motion.div>
        </AnimatePresence>
      ) : (
        <main className="max-w-[1440px] mx-auto px-[56px] mt-16">
          <div className="flex flex-col items-center justify-center gap-[15px] mb-[70px]">
            <h1 className="text-[48px] font-bold leading-[60px] text-black text-center">
              Общая статистика
            </h1>
            <p className="text-[18px] font-bold leading-[24px] text-center text-black">
              Агрегированные данные обратной связи
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-[20px] mb-[70px]">
            {stats.map((stat, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={stat.label}
                className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
              >
                <span className="text-[42px] font-bold leading-[50px] text-black">{stat.value}</span>
                <span className="text-[14px] font-bold leading-[20px] text-center text-black">{stat.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Сводка по отзывам</h2>
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                <span>Все команды</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <span>{selectedPeriod}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showPeriodDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                    {periods.map((period) => (
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
                        {period}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Детальный граф взаимодействий</h2>
              <ClimateMonitoringGraph />
            </div>

            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Детальный список отзывов</h2>
              <ReviewsTable />
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

function BarChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3V21H21" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 17V13" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 17V9" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 17V15" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
