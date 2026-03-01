import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, BarChart2, FileText, ChevronDown } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import QuestionnaireBuilder from './QuestionnaireBuilder';
import QuestionnaireReport from './QuestionnaireReport';

const barData = [
  { name: 'Альфа', value: 8.5 },
  { name: 'Бета', value: 7.2 },
  { name: 'Гамма', value: 9.1 },
  { name: 'Дельта', value: 6.8 },
  { name: 'Омега', value: 8.1 },
];

const lineData = [
  { name: 'Окт', value: 6.5 },
  { name: 'Ноя', value: 7.2 },
  { name: 'Дек', value: 6.8 },
  { name: 'Янв', value: 7.5 },
  { name: 'Фев', value: 8.2 },
  { name: 'Мар', value: 8.8 },
];

const pieData = [
  { name: 'Низкий риск', value: 65 },
  { name: 'Средний риск', value: 25 },
  { name: 'Высокий риск', value: 10 },
];

const COLORS = ['#00AE1D', '#FFCC00', '#FF0000'];

const AnalyticsPage: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'builder' | 'report'>('dashboard');

  if (view === 'builder') {
    return <QuestionnaireBuilder onBack={() => setView('dashboard')} onSave={() => setView('dashboard')} />;
  }

  if (view === 'report') {
    return <QuestionnaireReport onBack={() => setView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-white font-wix">
      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-[56px] pt-[100px] pb-20">
        
        {/* Title Section */}
        <div className="flex flex-col items-center justify-center gap-[15px] mb-[70px]">
          <h1 className="text-[48px] font-bold leading-[60px] text-black text-center">
            Аналитика
          </h1>
          <p className="text-[18px] font-bold leading-[24px] text-center text-black">
            Интерпретация и визуализация психологических показателей
          </p>
        </div>

        {/* Top Stats Cards */}
        <div className="flex justify-center items-center gap-[20px] mb-[70px]">
          {/* Card 1 */}
          <div className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1">
            <span className="text-[42px] font-bold leading-[50px] text-black">8</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              анкетирований проведено
            </p>
          </div>

          {/* Card 2 */}
          <div className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1">
            <span className="text-[42px] font-bold leading-[50px] text-black">215</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              сотрудников показали <span className="text-[#00AE1D]">прогресс</span>
            </p>
          </div>

          {/* Card 3 */}
          <div className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1">
            <span className="text-[42px] font-bold leading-[50px] text-black">47</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              сотрудников показали <span className="text-[#FF0000]">регресс</span>
            </p>
          </div>
        </div>

        {/* Questionnaire Section Header */}
        <div className="flex justify-between items-center mb-[40px]">
          <h2 className="text-[40px] font-bold leading-[50px] text-black">
            Анкетирование
          </h2>
          <button className="flex items-center justify-between px-5 py-4 w-[335px] border border-black rounded-[20px] text-[14px] font-bold">
            <span>Выбрать прошедшее анкетирование</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Questionnaire Cards Grid */}
        <div className="flex gap-[30px] mb-[70px] overflow-x-auto pb-4 no-scrollbar">
          {/* New Questionnaire Card */}
          <div className="flex flex-col items-center gap-5 min-w-[200px]">
            <div 
              onClick={() => setView('builder')}
              className="w-[200px] h-[200px] bg-white border border-black rounded-[30px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-[80px] h-[80px] text-black" strokeWidth={1} />
            </div>
            <span className="text-[16px] font-bold text-center">Новая анкета</span>
          </div>

          {/* Card 2 - Active */}
          <div className="flex flex-col items-center gap-5 min-w-[200px]">
            <div 
              onClick={() => setView('report')}
              className="w-[200px] h-[200px] bg-white border border-black rounded-[30px] flex flex-col items-center justify-center p-8 gap-4 relative cursor-pointer hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
            >
              <BarChart2 className="w-[48px] h-[48px] text-gray-400" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-[12px] font-bold text-center">Смотреть анкету</span>
                <div className="bg-[#00AE1D] px-3 py-1 rounded-full">
                  <span className="text-[8px] font-bold text-white uppercase">Активна</span>
                </div>
              </div>
            </div>
            <span className="text-[16px] font-bold text-center">Оценка командного взаи...</span>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center gap-5 min-w-[200px]">
            <div 
              onClick={() => setView('report')}
              className="w-[200px] h-[200px] bg-white border border-black rounded-[30px] flex flex-col items-center justify-center p-8 gap-4 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="w-[48px] h-[48px] bg-gradient-to-r from-[#FFCC00] via-[#FF8800] to-[#FF0000] rounded-lg flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[12px] font-bold text-center">Смотреть анкету</span>
                <span className="text-[12px] font-bold text-black opacity-60">28.02.2026</span>
              </div>
            </div>
            <span className="text-[16px] font-bold text-center">Удовлетворённость рабо...</span>
          </div>

          {/* Card 4 - Draft */}
          <div className="flex flex-col items-center gap-5 min-w-[200px]">
            <div className="w-[200px] h-[200px] bg-white border border-black rounded-[30px] flex flex-col items-center justify-center p-8 gap-4">
              <FileText className="w-[48px] h-[48px] text-black" strokeWidth={1.5} />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[12px] font-bold text-center">Черновик</span>
                <span className="text-[12px] font-bold text-black opacity-60">12.02.2026</span>
              </div>
            </div>
            <span className="text-[16px] font-bold text-center">Эффективность текущих...</span>
          </div>

          {/* Card 5 */}
          <div className="flex flex-col items-center gap-5 min-w-[200px]">
            <div className="w-[200px] h-[200px] bg-white border border-black rounded-[30px] flex flex-col items-center justify-center p-8 gap-4">
              <div className="w-[48px] h-[48px] bg-gradient-to-r from-[#FFCC00] via-[#FF8800] to-[#FF0000] rounded-lg flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-[12px] font-bold text-center">Смотреть анкету</span>
                <span className="text-[12px] font-bold text-black opacity-60">27.08.2025</span>
              </div>
            </div>
            <span className="text-[16px] font-bold text-center">Эффективность текущих...</span>
          </div>
        </div>

        {/* Analysis Section Header */}
        <div className="flex justify-between items-center mb-[40px]">
          <h2 className="text-[40px] font-bold leading-[50px] text-black">
            Анализ анкетирований
          </h2>
          <div className="flex gap-10">
            <button className="flex items-center justify-between px-5 py-4 w-[185px] border border-black rounded-[20px] text-[14px] font-bold">
              <span>Все команды</span>
              <ChevronDown className="w-5 h-5" />
            </button>
            <button className="flex items-center justify-between px-5 py-4 w-[185px] border border-black rounded-[20px] text-[14px] font-bold">
              <span>Последний месяц</span>
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-black rounded-[20px] p-6 shadow-sm">
            <div className="text-gray-500 text-sm font-bold mb-2 uppercase">Средний eNPS</div>
            <div className="text-4xl font-bold flex items-end gap-3">
              42 <span className="text-green-500 text-lg font-medium mb-1">+5 с прошлого месяца</span>
            </div>
          </div>
          <div className="bg-white border border-black rounded-[20px] p-6 shadow-sm">
            <div className="text-gray-500 text-sm font-bold mb-2 uppercase">Вовлеченность</div>
            <div className="text-4xl font-bold flex items-end gap-3">
              8.2 <span className="text-green-500 text-lg font-medium mb-1">+0.4</span>
            </div>
          </div>
          <div className="bg-white border border-black rounded-[20px] p-6 shadow-sm">
            <div className="text-gray-500 text-sm font-bold mb-2 uppercase">Пройдено анкет</div>
            <div className="text-4xl font-bold flex items-end gap-3">
              128 <span className="text-gray-400 text-lg font-medium mb-1">из 140 сотрудников</span>
            </div>
          </div>
        </div>

        {/* Main Visualization */}
        <div className="w-full h-[450px] bg-white border border-black rounded-[30px] mb-[70px] p-10 shadow-[5px_5px_30px_rgba(0,0,0,0.1)]">
          <h3 className="text-xl font-bold mb-8">Динамика eNPS (Индекс лояльности)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={lineData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF8800" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF8800" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Area type="monotone" dataKey="value" stroke="#FF8800" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Secondary Visualizations Grid */}
        <div className="grid grid-cols-2 gap-[30px]">
          <div className="h-[400px] bg-white border border-black rounded-[30px] p-10 shadow-[5px_5px_30px_rgba(0,0,0,0.1)]">
            <h3 className="text-xl font-bold mb-8">Средний балл вовлеченности по командам</h3>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} domain={[0, 10]} />
                <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#FF8800" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-[400px] bg-white border border-black rounded-[30px] p-10 shadow-[5px_5px_30px_rgba(0,0,0,0.1)]">
            <h3 className="text-xl font-bold mb-8">Уровень риска выгорания</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[400px] bg-white border border-black rounded-[30px] p-10 shadow-[5px_5px_30px_rgba(0,0,0,0.1)]">
            <h3 className="text-xl font-bold mb-8">Динамика вовлеченности</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} domain={[0, 10]} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Line type="monotone" dataKey="value" stroke="#FF0000" strokeWidth={3} dot={{ r: 6, fill: '#FF0000', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[400px] bg-white border border-black rounded-[30px] p-10 shadow-[5px_5px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
             <div className="text-center">
                <BarChart2 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-medium">Дополнительные метрики появятся после следующего анкетирования</p>
             </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AnalyticsPage;
