import React, { useState } from 'react';
import { ArrowLeft, Users, Heart, AlertTriangle, Puzzle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

const mockEmployees = [
    {id: 1, first_name: "Иван", last_name: "Иванов", gender: "М", age: 28, team: "Альфа", position: "Frontend", belbin: "Руководитель", thomas: "Соперничество", score: 8.5, customRating: 8, customChoice: "Удаленка"},
    {id: 2, first_name: "Анна", last_name: "Смирнова", gender: "Ж", age: 32, team: "Альфа", position: "Backend", belbin: "Руководитель", thomas: "Соперничество", score: 7.2, customRating: 9, customChoice: "Офис"},
    {id: 3, first_name: "Петр", last_name: "Кузнецов", gender: "М", age: 25, team: "Альфа", position: "QA", belbin: "Руководитель", thomas: "Избегание", score: 6.8, customRating: 7, customChoice: "Гибрид"},
    {id: 4, first_name: "Мария", last_name: "Попова", gender: "Ж", age: 29, team: "Альфа", position: "Дизайнер", belbin: "Вдохновитель", thomas: "Соперничество", score: 9.1, customRating: 10, customChoice: "Удаленка"},
    {id: 5, first_name: "Сергей", last_name: "Соколов", gender: "М", age: 35, team: "Альфа", position: "Аналитик", belbin: "Аналитик", thomas: "Приспособление", score: 8.0, customRating: 6, customChoice: "Офис"},
    {id: 6, first_name: "Елена", last_name: "Михайлова", gender: "Ж", age: 31, team: "Бета", position: "Product", belbin: "Руководитель", thomas: "Сотрудничество", score: 8.8, customRating: 9, customChoice: "Гибрид"},
    {id: 7, first_name: "Дмитрий", last_name: "Новиков", gender: "М", age: 27, team: "Бета", position: "Frontend", belbin: "Рабочая пчёлка", thomas: "Сотрудничество", score: 7.5, customRating: 8, customChoice: "Удаленка"},
    {id: 8, first_name: "Ольга", last_name: "Федорова", gender: "Ж", age: 26, team: "Бета", position: "Backend", belbin: "Генератор идей", thomas: "Компромисс", score: 8.2, customRating: 7, customChoice: "Офис"},
    {id: 9, first_name: "Андрей", last_name: "Морозов", gender: "М", age: 30, team: "Бета", position: "QA", belbin: "Контролер", thomas: "Сотрудничество", score: 7.9, customRating: 8, customChoice: "Гибрид"},
    {id: 10, first_name: "Наталья", last_name: "Волкова", gender: "Ж", age: 34, team: "Бета", position: "Аналитик", belbin: "Снабженец", thomas: "Компромисс", score: 8.6, customRating: 9, customChoice: "Удаленка"}
];

const BELBIN_ROLES = ["Рабочая пчёлка", "Руководитель", "Мотиватор", "Генератор идей", "Снабженец", "Аналитик", "Вдохновитель", "Контролер"];
const COLORS = ['#3b82f6', '#ef4444', '#fbbf24', '#10b981', '#8b5cf6'];

export default function QuestionnaireReport({ onBack }: { onBack: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState("Альфа");
  
  const teamMembers = mockEmployees.filter(e => e.team === selectedTeam);
  
  // Calculations
  const avgAge = (teamMembers.reduce((a, b) => a + b.age, 0) / teamMembers.length).toFixed(1);
  const males = teamMembers.filter(m => m.gender === 'М').length;
  const females = teamMembers.filter(m => m.gender === 'Ж').length;
  
  const avgScore = (teamMembers.reduce((a, b) => a + b.score, 0) / teamMembers.length).toFixed(1);
  
  const thomasCounts = teamMembers.reduce((acc: any, m) => {
    acc[m.thomas] = (acc[m.thomas] || 0) + 1;
    return acc;
  }, {});
  const domStyle = Object.keys(thomasCounts).reduce((a, b) => thomasCounts[a] > thomasCounts[b] ? a : b);
  const domPercent = Math.round((thomasCounts[domStyle] / teamMembers.length) * 100);
  
  const teamRoles = teamMembers.map(m => m.belbin);
  const missingRoles = BELBIN_ROLES.filter(r => !teamRoles.includes(r));
  const leadersCount = teamRoles.filter(r => r === "Руководитель").length;

  // Chart Data
  const barData = teamMembers.map(m => ({ name: m.last_name, value: m.score }));
  const pieData = Object.keys(thomasCounts).map(key => ({ name: key, value: thomasCounts[key] }));
  const radarData = [
    { subject: 'Комм.', A: selectedTeam === 'Альфа' ? 4 : 8, fullMark: 10 },
    { subject: 'Проф.', A: selectedTeam === 'Альфа' ? 9 : 9, fullMark: 10 },
    { subject: 'Отв.', A: selectedTeam === 'Альфа' ? 8 : 8, fullMark: 10 },
    { subject: 'Помощь', A: selectedTeam === 'Альфа' ? 7 : 9, fullMark: 10 },
  ];

  // Custom Questions Data
  const customChoiceCounts = teamMembers.reduce((acc: any, m) => {
    acc[m.customChoice] = (acc[m.customChoice] || 0) + 1;
    return acc;
  }, {});
  const customPieData = Object.keys(customChoiceCounts).map(key => ({ name: key, value: customChoiceCounts[key] }));
  const customBarData = teamMembers.map(m => ({ name: m.last_name, value: m.customRating }));

  return (
    <div className="max-w-[1240px] mx-auto pt-8 pb-20 px-8 font-wix">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Назад к списку анкет
      </button>
      
      <h1 className="text-4xl font-bold mb-8 text-center">📊 HR Analytics Dashboard</h1>
      
      <div className="flex justify-center gap-4 mb-8">
        {["Альфа", "Бета"].map(team => (
          <button 
            key={team}
            onClick={() => setSelectedTeam(team)}
            className={`px-6 py-2 rounded-full font-bold transition-colors ${selectedTeam === team ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Команда {team}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[30px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 mb-12">
        <h2 className="text-2xl font-bold text-blue-600 border-b-2 border-gray-100 pb-4 mb-6">Команда: {selectedTeam}</h2>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center">
            <b className="text-slate-600 text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Users className="w-4 h-4"/> Демография</b>
            <div className="text-slate-800 leading-relaxed">
              {teamMembers.length} чел. | Ср. возраст: {avgAge}<br/>
              М: {males}, Ж: {females}
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center">
            <b className="text-slate-600 text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Heart className="w-4 h-4"/> Вайб</b>
            <div className="text-slate-800 leading-relaxed">
              Ср. оценка: {avgScore} / 10<br/>
              📉 Проблемная зона: <span className="text-rose-600 font-medium">Коммуникация (4.3)</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border flex flex-col justify-center ${domStyle === 'Соперничество' && domPercent >= 40 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <b className="text-slate-600 text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Конфликты</b>
            <div className={`leading-relaxed ${domStyle === 'Соперничество' && domPercent >= 40 ? 'text-red-800' : 'text-slate-800'}`}>
              Доминирует: {domStyle} ({domPercent}%)<br/>
              {domStyle === 'Соперничество' && domPercent >= 40 ? 
                <span className="font-bold text-sm mt-2 block">🚨 ВЫСОКИЙ РИСК: Энергия уходит на споры!</span> : 
                <span className="font-bold text-sm mt-2 block text-emerald-600">Баланс стилей соблюден</span>}
            </div>
          </div>

          <div className={`p-5 rounded-2xl border flex flex-col justify-center ${leadersCount > 1 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <b className="text-slate-600 text-xs uppercase tracking-wider mb-2 flex items-center gap-2"><Puzzle className="w-4 h-4"/> Роли & Белбин</b>
            <div className={`leading-relaxed ${leadersCount > 1 ? 'text-red-800' : 'text-slate-800'}`}>
              Пусто: {missingRoles.slice(0, 2).join(', ')}...<br/>
              {leadersCount > 1 ? 
                <span className="font-bold text-sm mt-2 block">🚨 КОНФЛИКТ РОЛЕЙ: {leadersCount} 'Руководителя'!</span> : 
                <span className="font-bold text-sm mt-2 block text-emerald-600">Роли сбалансированы</span>}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-10 border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm">
                <th className="p-4 font-medium">Имя Фамилия</th>
                <th className="p-4 font-medium">Должность</th>
                <th className="p-4 font-medium">Ср. балл</th>
                <th className="p-4 font-medium">BELBIN</th>
                <th className="p-4 font-medium">THOMAS</th>
                <th className="p-4 font-medium">Формат работы (Кастом)</th>
                <th className="p-4 font-medium">Оценка условий (Кастом)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {teamMembers.map((m) => (
                <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{m.first_name} {m.last_name}</td>
                  <td className="p-4 text-slate-600">{m.position}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full font-bold ${selectedTeam === 'Альфа' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {m.score}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600">{m.belbin}</td>
                  <td className="p-4 text-slate-600">{m.thomas}</td>
                  <td className="p-4 text-slate-600">{m.customChoice}</td>
                  <td className="p-4 text-slate-600">{m.customRating} / 10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts Row 1 (Standard) */}
        <h3 className="text-xl font-bold mb-4">Стандартные метрики</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 h-[320px]">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="text-center font-bold text-sm text-slate-600 mb-2">Баллы сотрудников</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="text-center font-bold text-sm text-slate-600 mb-2">Стили конфликтов</h4>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="text-center font-bold text-sm text-slate-600 mb-2">Профиль здоровья</h4>
            <ResponsiveContainer width="100%" height="90%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fill: '#64748b'}} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar name="Балл" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 (Custom Questions) */}
        <h3 className="text-xl font-bold mb-4">Кастомные вопросы</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[320px]">
          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="text-center font-bold text-sm text-slate-600 mb-2">Предпочитаемый формат работы</h4>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={customPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {customPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4">
            <h4 className="text-center font-bold text-sm text-slate-600 mb-2">Оценка условий труда (1-10)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={customBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} domain={[0, 10]} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
