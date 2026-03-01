import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, GripVertical, CheckCircle2, Save } from 'lucide-react';

interface QuestionnaireBuilderProps {
  onBack: () => void;
  onSave: (data: any, isDraft?: boolean) => void;
  initialData?: any;
}

export default function QuestionnaireBuilder({ onBack, onSave, initialData }: QuestionnaireBuilderProps) {
  const [title, setTitle] = useState('Новая анкета');
  const [description, setDescription] = useState('');
  const [blocks, setBlocks] = useState<any[]>([]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setBlocks(initialData.blocks || []);
    }
  }, [initialData]);

  const addBlock = (type: string) => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      title: type === 'belbin' ? 'Тест Белбина (Командные роли)' : 
             type === 'thomas' ? 'Тест Томаса-Килманна (Стили конфликта)' : '',
      options: type === 'choice' ? ['Вариант 1', 'Вариант 2'] : []
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlock = (id: string, field: string, value: any) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const updateOption = (blockId: string, optIndex: number, value: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        const newOptions = [...b.options];
        newOptions[optIndex] = value;
        return { ...b, options: newOptions };
      }
      return b;
    }));
  };

  const addOption = (blockId: string) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, options: [...b.options, `Вариант ${b.options.length + 1}`] };
      }
      return b;
    }));
  };

  const removeOption = (blockId: string, optIndex: number) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return { ...b, options: b.options.filter((_: any, i: number) => i !== optIndex) };
      }
      return b;
    }));
  };

  const handleSaveDraft = () => {
    onSave({ title, description, blocks }, true);
  };

  const handleSaveActive = () => {
    onSave({ title, description, blocks }, false);
  };

  return (
    <div className="max-w-[800px] mx-auto pt-8 pb-20 px-8 font-wix">
      <button onClick={onBack} className="flex items-center text-gray-500 hover:text-black mb-6 transition-colors">
        <ArrowLeft className="w-5 h-5 mr-2" /> Назад
      </button>

      <div className="bg-white rounded-[30px] p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 mb-8">
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-bold border-none outline-none placeholder-gray-300 mb-4"
          placeholder="Название анкеты"
        />
        <textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full text-lg text-gray-600 border-none outline-none resize-none placeholder-gray-300"
          placeholder="Описание анкеты (необязательно)"
          rows={2}
        />
      </div>

      <div className="space-y-6 mb-10">
        {blocks.map((block) => (
          <div key={block.id} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-200 relative group">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab p-2 bg-white rounded-full shadow-md border border-gray-100">
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {block.type === 'rating' ? 'Шкала 1-10' : 
                   block.type === 'choice' ? 'Один из списка' : 
                   block.type === 'text' ? 'Текстовый ответ' : 
                   block.type === 'belbin' ? 'Предустановленный тест' : 'Предустановленный тест'}
                </span>
              </div>
              <button onClick={() => removeBlock(block.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {(block.type === 'belbin' || block.type === 'thomas') ? (
              <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                <CheckCircle2 className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="font-bold text-blue-900">{block.title}</h3>
                  <p className="text-sm text-blue-700">Этот блок автоматически сгенерирует вопросы и добавит аналитику в отчет.</p>
                </div>
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  value={block.title}
                  onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                  className="w-full text-xl font-semibold border-b border-gray-200 pb-2 mb-4 outline-none focus:border-black transition-colors"
                  placeholder="Введите ваш вопрос"
                />
                
                {block.type === 'choice' && (
                  <div className="space-y-3 pl-4">
                    {block.options.map((opt: string, optIdx: number) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border border-gray-300" />
                        <input 
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(block.id, optIdx, e.target.value)}
                          className="flex-1 border-b border-gray-200 pb-1 outline-none focus:border-black text-gray-700"
                        />
                        <button onClick={() => removeOption(block.id, optIdx)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button onClick={() => addOption(block.id)} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mt-2">
                      <Plus className="w-4 h-4 mr-1" /> Добавить вариант
                    </button>
                  </div>
                )}

                {block.type === 'rating' && (
                  <div className="flex justify-between items-center px-4 py-6 bg-gray-50 rounded-xl">
                    <span className="text-gray-500 font-medium">1 (Минимум)</span>
                    <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <div key={n} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center text-sm text-gray-400">{n}</div>
                      ))}
                    </div>
                    <span className="text-gray-500 font-medium">10 (Максимум)</span>
                  </div>
                )}

                {block.type === 'text' && (
                  <div className="w-full h-24 bg-gray-50 rounded-xl border border-gray-200 border-dashed flex items-center justify-center text-gray-400">
                    Поле для текстового ответа сотрудника
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-[20px] p-6 border border-gray-200 border-dashed flex flex-col items-center justify-center gap-4 mb-12">
        <h3 className="font-bold text-gray-600">Добавить блок</h3>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => addBlock('rating')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:border-black transition-colors">Шкала 1-10</button>
          <button onClick={() => addBlock('choice')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:border-black transition-colors">Один из списка</button>
          <button onClick={() => addBlock('text')} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:border-black transition-colors">Текст</button>
          <div className="w-px h-8 bg-gray-300 mx-2" />
          <button onClick={() => addBlock('belbin')} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">Тест Белбина</button>
          <button onClick={() => addBlock('thomas')} className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">Тест Томаса-Килманна</button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button onClick={onBack} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors">Отмена</button>
        
        <div className="flex gap-4">
          <button 
            onClick={handleSaveDraft} 
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
          >
            <Save className="w-5 h-5" />
            Сохранить черновик
          </button>
          <button 
            onClick={handleSaveActive} 
            className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
          >
            Опубликовать анкету
          </button>
        </div>
      </div>
    </div>
  );
}
