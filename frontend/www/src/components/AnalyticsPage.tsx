import React, { useState, useEffect } from 'react';
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

interface Questionnaire {
  id: string;
  title: string;
  description: string;
  blocks: any[];
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
}

const AnalyticsPage: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'builder' | 'report'>('dashboard');
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Последний месяц');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const periods = ['Последний месяц', 'Последние 3 месяца', 'Последние 6 месяцев', 'Последний год', 'Все время'];

  useEffect(() => {
    // Load questionnaires from localStorage
    const saved = localStorage.getItem('questionnaires');
    if (saved) {
      setQuestionnaires(JSON.parse(saved));
    }
  }, []);

  const saveQuestionnaires = (data: Questionnaire[]) => {
    localStorage.setItem('questionnaires', JSON.stringify(data));
    setQuestionnaires(data);
  };

  const handleSave = (data: any, isDraft: boolean = false) => {
    const questionnaire: Questionnaire = {
      id: editingId || Date.now().toString(),
      title: data.title,
      description: data.description,
      blocks: data.blocks,
      status: isDraft ? 'draft' : 'active',
      createdAt: new Date().toISOString(),
    };

    if (editingId) {
      saveQuestionnaires(questionnaires.map(q => q.id === editingId ? questionnaire : q));
    } else {
      saveQuestionnaires([...questionnaires, questionnaire]);
    }

    setEditingId(null);
    setView('dashboard');
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setView('builder');
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить эту анкету?')) {
      saveQuestionnaires(questionnaires.filter(q => q.id !== id));
    }
  };

  if (view === 'builder') {
    const editingQuestionnaire = editingId ? questionnaires.find(q => q.id === editingId) : null;
    return (
      <QuestionnaireBuilder 
        onBack={() => {
          setView('dashboard');
          setEditingId(null);
        }} 
        onSave={handleSave}
        initialData={editingQuestionnaire}
      />
    );
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">{questionnaires.filter(q => q.status !== 'draft').length}</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              анкетирований проведено
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">215</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              сотрудников показали <span className="text-[#00AE1D]">прогресс</span>
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="w-[200px] h-[180px] bg-white border border-black rounded-[30px] shadow-[5px_5px_30px_rgba(0,0,0,0.25)] flex flex-col items-center justify-center p-[20px] gap-1"
          >
            <span className="text-[42px] font-bold leading-[50px] text-black">47</span>
            <p className="text-[14px] font-bold leading-[20px] text-center text-black">
              сотрудников показали <span className="text-[#FF0000]">регресс</span>
            </p>
          </motion.div>
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
          <div className="flex flex-col items-center gap-5 min-w-[140px]">
            <div 
              onClick={() => {
                setEditingId(null);
                setView('builder');
              }}
              className="w-[140px] h-[140px] bg-white border border-black rounded-[20px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-[50px] h-[50px] text-black" strokeWidth={1} />
            </div>
            <span className="text-[14px] font-bold text-center">Новая анкета</span>
          </div>

          {/* Display saved questionnaires */}
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} className="flex flex-col items-center gap-5 min-w-[140px]">
              <div 
                onClick={() => questionnaire.status === 'draft' ? handleEdit(questionnaire.id) : setView('report')}
                className="w-[140px] h-[140px] bg-white border border-black rounded-[20px] flex flex-col items-center justify-center p-5 gap-3 relative cursor-pointer hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md group"
              >
                {questionnaire.status === 'draft' ? (
                  <>
                    <FileText className="w-[32px] h-[32px] text-gray-400" strokeWidth={1.5} />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-center">Черновик</span>
                      <span className="text-[10px] font-bold text-black opacity-60">
                        {new Date(questionnaire.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </>
                ) : questionnaire.status === 'active' ? (
                  <>
                    <BarChart2 className="w-[32px] h-[32px] text-gray-400" />
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-center">Смотреть анкету</span>
                      <div className="bg-[#00AE1D] px-2 py-0.5 rounded-full">
                        <span className="text-[8px] font-bold text-white uppercase">Активна</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[32px] h-[32px] bg-gradient-to-r from-[#FFCC00] via-[#FF8800] to-[#FF0000] rounded-lg flex items-center justify-center">
                      <BarChart2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-center">Смотреть анкету</span>
                      <span className="text-[10px] font-bold text-black opacity-60">
                        {new Date(questionnaire.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                  </>
                )}
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(questionnaire.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <span className="text-[14px] font-bold text-center">
                {questionnaire.title.length > 15 ? questionnaire.title.substring(0, 15) + '...' : questionnaire.title}
              </span>
            </div>
          ))}
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
            <div className="relative">
              <button 
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                className="flex items-center justify-between px-5 py-4 w-[185px] border border-black rounded-[20px] text-[14px] font-bold"
              >
                <span>{selectedPeriod}</span>
                <ChevronDown className="w-5 h-5" />
              </button>
              {showPeriodDropdown && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10">
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
