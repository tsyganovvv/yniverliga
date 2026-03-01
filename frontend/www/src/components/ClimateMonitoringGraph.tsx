import { useRef, useCallback, useState, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';

export interface ClimateGraphNode {
  id: string;
}

export interface ClimateGraphLink {
  source: string;
  target: string;
  score: number;
  categories: string;
  desc: string;
}

export interface ClimateGraphData {
  nodes: ClimateGraphNode[];
  links: ClimateGraphLink[];
}

const gData = {
  nodes: [
    { id: "Иван Иванов" }, { id: "Анна Смирнова" }, { id: "Сергей Петров" },
    { id: "Мария Кузнецова" }, { id: "Дмитрий Волков" }, { id: "Елена Соколова" }
  ],
  links: [
    {
      source: "Иван Иванов", target: "Анна Смирнова",
      score: 5, categories: "Надежность, Качество",
      desc: "Всегда сдает задачи в срок, очень приятно работать вместе."
    },
    {
      source: "Анна Смирнова", target: "Сергей Петров",
      score: 3, categories: "Коммуникация",
      desc: "Рабочие вопросы решаются, но иногда долго отвечает в мессенджерах."
    },
    {
      source: "Сергей Петров", target: "Иван Иванов",
      score: 1, categories: "Сроки, Ответственность",
      desc: "Сорвал дедлайн по важному проекту, не предупредив заранее."
    },
    {
      source: "Мария Кузнецова", target: "Дмитрий Волков",
      score: 4, categories: "Помощь в задачах",
      desc: "Помог разобраться с новой документацией, очень доходчиво."
    },
    {
      source: "Дмитрий Волков", target: "Елена Соколова",
      score: 3, categories: "Соблюдение правил",
      desc: "Средний результат, без особых замечаний, но и без инициативы."
    },
    {
      source: "Елена Соколова", target: "Анна Смирнова",
      score: 5, categories: "Наставничество",
      desc: "Лучший ментор, которого я встречала в этой компании!"
    },
    {
      source: "Мария Кузнецова", target: "Сергей Петров",
      score: 2, categories: "Тон общения",
      desc: "Довольно резкое общение на планерках, демотивирует команду."
    }
  ]
};

interface ClimateMonitoringGraphProps {
  graphData?: ClimateGraphData;
}

export default function ClimateMonitoringGraph({ graphData }: ClimateMonitoringGraphProps) {
  const fgRef = useRef<ForceGraphMethods>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const graph = graphData ?? gData;

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
          setTimeout(() => {
            if (fgRef.current) {
              fgRef.current.zoomToFit(400, 100);
            }
          }, 100);
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge')?.strength(-300);
      fgRef.current.d3Force('link')?.distance(40);
      fgRef.current.d3Force('center')?.strength(0.8);
    }
  }, []);

  const handleNodeClick = useCallback((node: any) => {
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(3, 1000);
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[600px] bg-white rounded-[32px] overflow-hidden mt-12 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="absolute top-8 left-8 w-80 z-10 pointer-events-none">
        <div className="glass-card pointer-events-auto">
          <h1 className="text-[#111827] text-lg font-bold mb-2">Мониторинг климата</h1>
          <p className="text-gray-500 text-sm mb-6">Наведите на стрелку, чтобы прочитать содержание отзыва.</p>

          <div className="space-y-3">
            <div className="flex items-center text-xs font-semibold text-gray-600">
              <div className="w-6 h-1.5 rounded-full bg-[#22c55e] mr-3" />
              Позитив (4-5)
            </div>
            <div className="flex items-center text-xs font-semibold text-gray-600">
              <div className="w-6 h-1.5 rounded-full bg-[#94a3b8] mr-3" />
              Нейтрально (3)
            </div>
            <div className="flex items-center text-xs font-semibold text-gray-600">
              <div className="w-6 h-1.5 rounded-full bg-[#ef4444] mr-3" />
              Негатив (1-2)
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full text-xs font-medium text-gray-500 z-10 whitespace-nowrap border border-gray-100 shadow-sm">
        Подсказка: наведите на связь, чтобы увидеть причину оценки
      </div>

<ForceGraph2D
  ref={fgRef}
  graphData={graph}
  backgroundColor="#ffffff"
  nodeId="id"
  nodeVal={15} 
  
  d3AlphaDecay={0.05}
  d3VelocityDecay={0.3}
  
  linkDirectionalArrowLength={5}
  linkDirectionalArrowRelPos={1}
  linkCurvature={0.1}
  linkWidth={2}
  linkHoverPrecision={50}
  cooldownTicks={100}
  
  onEngineStop={() => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 100);
    }
  }}

  linkColor={(link: any) => {
    if (link.score >= 4) return 'rgba(34, 197, 94, 0.4)';
    if (link.score === 3) return 'rgba(148, 163, 184, 0.4)';
    return 'rgba(239, 68, 68, 0.4)';
  }}
  
  linkLabel={(link: any) => `
    <div class="graph-tooltip-integrated">
      <div class="tooltip-header">
        <span class="tooltip-title">Отзыв коллеге</span>
        <span class="tooltip-score ${link.score >= 4 ? 'score-5' : (link.score === 3 ? 'score-3' : 'score-1')}">
          Оценка: ${link.score}
        </span>
      </div>
      <div class="tooltip-body">
        <span class="tooltip-cats">Тема: ${link.categories}</span>
        <div class="tooltip-desc">"${link.desc}"</div>
      </div>
    </div>
  `}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 13 / globalScale;
          ctx.font = `600 ${fontSize}px Inter`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Рисуем узел
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = '#F27D26'; // Primary orange
          ctx.shadowColor = 'rgba(242, 125, 38, 0.2)';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Текст под узлом
          ctx.fillStyle = '#111827';
          ctx.fillText(label, node.x, node.y + 14);
        }}
        onNodeClick={handleNodeClick}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
}
