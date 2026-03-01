import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Download } from 'lucide-react';

interface ReportData {
  id: number;
  employee: string;
  team: string;
  reviewsReceived: number;
  avgScore: number;
  positiveReviews: number;
  neutralReviews: number;
  negativeReviews: number;
  surveysCompleted: number;
  enpsScore: number;
  engagementScore: number;
  lastReviewDate: string;
  lastSurveyDate: string;
}

const mockReportData: ReportData[] = [
  { id: 1, employee: "Антон Миронов", team: "Альфа", reviewsReceived: 12, avgScore: 4.5, positiveReviews: 9, neutralReviews: 2, negativeReviews: 1, surveysCompleted: 3, enpsScore: 45, engagementScore: 8.5, lastReviewDate: "28-02-2026", lastSurveyDate: "25-02-2026" },
  { id: 2, employee: "Екатерина Андреева", team: "Альфа", reviewsReceived: 8, avgScore: 3.2, positiveReviews: 3, neutralReviews: 3, negativeReviews: 2, surveysCompleted: 3, enpsScore: 20, engagementScore: 6.8, lastReviewDate: "20-02-2026", lastSurveyDate: "18-02-2026" },
  { id: 3, employee: "Алина Сакунова", team: "Альфа", reviewsReceived: 10, avgScore: 3.8, positiveReviews: 5, neutralReviews: 4, negativeReviews: 1, surveysCompleted: 2, enpsScore: 35, engagementScore: 7.2, lastReviewDate: "15-01-2026", lastSurveyDate: "10-01-2026" },
  { id: 4, employee: "Сергей Петров", team: "Бета", reviewsReceived: 15, avgScore: 4.2, positiveReviews: 11, neutralReviews: 3, negativeReviews: 1, surveysCompleted: 3, enpsScore: 50, engagementScore: 8.1, lastReviewDate: "25-02-2026", lastSurveyDate: "22-02-2026" },
  { id: 5, employee: "Мария Кузнецова", team: "Бета", reviewsReceived: 9, avgScore: 4.7, positiveReviews: 8, neutralReviews: 1, negativeReviews: 0, surveysCompleted: 3, enpsScore: 60, engagementScore: 9.0, lastReviewDate: "27-02-2026", lastSurveyDate: "26-02-2026" },
  { id: 6, employee: "Дмитрий Волков", team: "Бета", reviewsReceived: 11, avgScore: 3.9, positiveReviews: 6, neutralReviews: 4, negativeReviews: 1, surveysCompleted: 2, enpsScore: 40, engagementScore: 7.5, lastReviewDate: "05-12-2025", lastSurveyDate: "01-12-2025" },
  { id: 7, employee: "Елена Соколова", team: "Гамма", reviewsReceived: 13, avgScore: 4.6, positiveReviews: 10, neutralReviews: 2, negativeReviews: 1, surveysCompleted: 3, enpsScore: 55, engagementScore: 8.8, lastReviewDate: "26-02-2026", lastSurveyDate: "24-02-2026" },
  { id: 8, employee: "Иван Новиков", team: "Гамма", reviewsReceived: 7, avgScore: 3.5, positiveReviews: 4, neutralReviews: 2, negativeReviews: 1, surveysCompleted: 2, enpsScore: 25, engagementScore: 7.0, lastReviewDate: "10-10-2025", lastSurveyDate: "05-10-2025" },
  { id: 9, employee: "Ольга Федорова", team: "Гамма", reviewsReceived: 14, avgScore: 4.3, positiveReviews: 10, neutralReviews: 3, negativeReviews: 1, surveysCompleted: 3, enpsScore: 48, engagementScore: 8.3, lastReviewDate: "22-02-2026", lastSurveyDate: "20-02-2026" },
  { id: 10, employee: "Андрей Морозов", team: "Дельта", reviewsReceived: 6, avgScore: 3.0, positiveReviews: 2, neutralReviews: 3, negativeReviews: 1, surveysCompleted: 1, enpsScore: 15, engagementScore: 6.2, lastReviewDate: "15-08-2025", lastSurveyDate: "10-08-2025" },
];

const getScoreColor = (score: number) => {
  if (score >= 4) return 'text-green-600';
  if (score >= 3) return 'text-yellow-600';
  return 'text-red-600';
};

const getEnpsColor = (score: number) => {
  if (score >= 50) return 'text-green-600';
  if (score >= 30) return 'text-yellow-600';
  return 'text-red-600';
};

export default function ReportsPage() {
  const [selectedTeam, setSelectedTeam] = useState('Все команды');
  const [selectedEmployee, setSelectedEmployee] = useState('Все сотрудники');
  const [selectedPeriod, setSelectedPeriod] = useState('Последний месяц');
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);

  const teams = ['Все команды', 'Альфа', 'Бета', 'Гамма', 'Дельта'];
  const employees = ['Все сотрудники', ...mockReportData.map(d => d.employee)];
  const periods = ['Последний месяц', 'Последние 3 месяца', 'Последние 6 месяцев', 'Последний год'];

  const filterDataByPeriod = (data: ReportData[], period: string): ReportData[] => {
    const now = new Date('2026-03-01');
    const periodMonths: Record<string, number> = {
      'Последний месяц': 1,
      'Последние 3 месяца': 3,
      'Последние 6 месяцев': 6,
      'Последний год': 12
    };

    const monthsToSubtract = periodMonths[period];
    const cutoffDate = new Date(now);
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToSubtract);

    return data.filter(item => {
      // Check if either last review or last survey is within the period
      const [reviewDay, reviewMonth, reviewYear] = item.lastReviewDate.split('-').map(Number);
      const reviewDate = new Date(reviewYear, reviewMonth - 1, reviewDay);
      
      const [surveyDay, surveyMonth, surveyYear] = item.lastSurveyDate.split('-').map(Number);
      const surveyDate = new Date(surveyYear, surveyMonth - 1, surveyDay);
      
      return reviewDate >= cutoffDate || surveyDate >= cutoffDate;
    });
  };

  const filteredData = mockReportData.filter(item => {
    const teamMatch = selectedTeam === 'Все команды' || item.team === selectedTeam;
    const employeeMatch = selectedEmployee === 'Все сотрудники' || item.employee === selectedEmployee;
    return teamMatch && employeeMatch;
  });

  const periodFilteredData = filterDataByPeriod(filteredData, selectedPeriod);

  const handleExport = (format: 'csv' | 'xlsx') => {
    console.log(`Экспорт в формате ${format}`);
    // Здесь будет логика экспорта
    setShowFormatDropdown(false);
  };

  // Calculate summary stats
  const totalReviews = periodFilteredData.reduce((sum, item) => sum + item.reviewsReceived, 0);
  const avgScore = periodFilteredData.length > 0 ? (periodFilteredData.reduce((sum, item) => sum + item.avgScore, 0) / periodFilteredData.length).toFixed(1) : '0.0';
  const totalSurveys = periodFilteredData.reduce((sum, item) => sum + item.surveysCompleted, 0);
  const avgEnps = periodFilteredData.length > 0 ? Math.round(periodFilteredData.reduce((sum, item) => sum + item.enpsScore, 0) / periodFilteredData.length) : 0;

  return (
    <div className="min-h-screen bg-white font-wix">
      <main className="max-w-[1440px] mx-auto px-[56px] pt-16 pb-20">
        
        {/* Title Section */}
        <div className="flex flex-col items-center justify-center gap-[15px] mb-[70px]">
          <h1 className="text-[48px] font-bold leading-[60px] text-black text-center">
            Отчёты
          </h1>
          <p className="text-[18px] font-bold leading-[24px] text-center text-black">
            Общая сводка по отзывам и анкетированию
          </p>
        </div>

        {/* Summary Stats Cards */}
        <div className="flex justify-center items-center gap-[20px] mb-[70px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{totalReviews}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              всего отзывов
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{avgScore}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              средний балл
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{totalSurveys}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              анкет заполнено
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{avgEnps}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              средний eNPS
            </p>
          </motion.div>
        </div>

        {/* Filters and Export Section */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Детальный отчёт</h2>
          
          <div className="flex items-center space-x-4">
            {/* Team Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowTeamDropdown(!showTeamDropdown);
                  setShowEmployeeDropdown(false);
                  setShowPeriodDropdown(false);
                  setShowFormatDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <span>{selectedTeam}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showTeamDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {teams.map(team => (
                    <button
                      key={team}
                      onClick={() => {
                        setSelectedTeam(team);
                        setShowTeamDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {team}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Employee Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowEmployeeDropdown(!showEmployeeDropdown);
                  setShowTeamDropdown(false);
                  setShowPeriodDropdown(false);
                  setShowFormatDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors min-w-[180px]"
              >
                <span className="truncate">{selectedEmployee}</span>
                <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </button>
              {showEmployeeDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                  {employees.map(employee => (
                    <button
                      key={employee}
                      onClick={() => {
                        setSelectedEmployee(employee);
                        setShowEmployeeDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                    >
                      {employee}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Period Filter */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowPeriodDropdown(!showPeriodDropdown);
                  setShowTeamDropdown(false);
                  setShowEmployeeDropdown(false);
                  setShowFormatDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <span>{selectedPeriod}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showPeriodDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                  {periods.map(period => (
                    <button
                      key={period}
                      onClick={() => {
                        setSelectedPeriod(period);
                        setShowPeriodDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl whitespace-nowrap"
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Export Button */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowFormatDropdown(!showFormatDropdown);
                  setShowTeamDropdown(false);
                  setShowEmployeeDropdown(false);
                  setShowPeriodDropdown(false);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#FFCC00] via-[#FF8800] to-[#FF0000] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                <span>Сохранить в формате</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showFormatDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px]">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-xl font-medium"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-xl font-medium"
                  >
                    XLSX
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Сотрудник
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Команда
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Отзывов получено
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Средний балл
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Позитивных
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Нейтральных
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Негативных
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Анкет заполнено
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    eNPS
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Вовлечённость
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Последний отзыв
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Последняя анкета
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {periodFilteredData.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                      Нет данных за выбранный период
                    </td>
                  </tr>
                ) : (
                  periodFilteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.employee}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row.team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {row.reviewsReceived}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${getScoreColor(row.avgScore)}`}>
                      {row.avgScore.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">
                      {row.positiveReviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600 font-medium">
                      {row.neutralReviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                      {row.negativeReviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      {row.surveysCompleted}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${getEnpsColor(row.enpsScore)}`}>
                      {row.enpsScore}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-semibold ${getScoreColor(row.engagementScore)}`}>
                      {row.engagementScore.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                      {row.lastReviewDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600">
                      {row.lastSurveyDate}
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Footer Info */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Показано записей: {periodFilteredData.length} из {mockReportData.length}
        </div>
      </main>
    </div>
  );
}
