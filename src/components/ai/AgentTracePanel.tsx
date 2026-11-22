import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ChevronDown, Loader2 } from 'lucide-react';
import type { AgentTraceStep, AgentUsage } from '../../config/agent';

interface TraceBlockProps {
  steps: AgentTraceStep[];
  usage: AgentUsage | null;
  /** true = 回答尚未生成完（实时展开显示思考过程）；false = 已完成，默认折叠 */
  live?: boolean;
}

/** 检索命中的明细结构（search_knowledge 工具的 detail.hits） */
interface RetrievalHit {
  title?: string;
  source?: string;
  score?: number;
}

/**
 * 消息内嵌「思考过程」块（仿 DeepSeek/Claude 交互）
 * - 思考中：步骤实时逐条出现，最后一步带 spinner
 * - 回答完成：自动折叠为一行摘要，点击可展开/收起明细
 */
export const TraceBlock: React.FC<TraceBlockProps> = ({ steps, usage, live = false }) => {
  const [expanded, setExpanded] = useState(false);
  const showDetail = live || expanded;

  if (!steps.length && !live) return null;

  const totalSec = typeof usage?.total_ms === 'number' ? (usage.total_ms / 1000).toFixed(1) : null;

  return (
    <div className="mb-3 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden">
      {/* 折叠摘要行 */}
      {!live && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.04] transition-colors"
        >
          <span className="text-xs text-primary-purple font-medium">
            ✨ 思考过程
            {totalSec && <span className="text-gray-500 font-normal">（{totalSec}s）</span>}
          </span>
          <span className="text-[10px] text-gray-500 truncate">
            {steps.map((s) => s.name).join(' · ')}
          </span>
          <ChevronDown
            size={14}
            className={`ml-auto flex-shrink-0 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* 展开的步骤明细 */}
      <AnimatePresence initial={false}>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2.5 space-y-2">
              <AnimatePresence>
                {steps.map((step, idx) => {
                  const isLast = idx === steps.length - 1;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="w-4 h-4 rounded-full bg-primary-purple/20 text-primary-purple flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-gray-300 font-medium">
                            {step.name === '🔍 检索知识库' && <Search size={10} className="inline mr-1 -mt-0.5" />}
                            {step.name === '📄 读取完整简历' && <FileText size={10} className="inline mr-1 -mt-0.5" />}
                            {step.name}
                          </span>
                          {typeof step.ms === 'number' && step.ms > 0 && (
                            <span className="text-[10px] text-gray-500">{step.ms}ms</span>
                          )}
                          {live && isLast && (
                            <Loader2 size={10} className="inline animate-spin text-primary-purple" />
                          )}
                        </div>

                        {/* 检索命中明细 */}
                        {Array.isArray(step.detail?.hits) && (step.detail.hits as RetrievalHit[]).length > 0 && (
                          <div className="mt-1 space-y-1">
                            {(step.detail.hits as RetrievalHit[]).map((hit, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                                  <div
                                    className="h-full bg-gradient-to-r from-primary-purple to-primary-violet"
                                    style={{ width: `${Math.round((hit.score ?? 0) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 truncate max-w-[140px]">
                                  {hit.title || hit.source}
                                </span>
                                <span className="text-[10px] text-primary-purple tabular-nums">
                                  {(hit.score ?? 0).toFixed(3)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* 统计徽章 */}
              {usage && live && (
                <div className="flex gap-2 pt-1">
                  {typeof usage.total_ms === 'number' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                      ⏱ {(usage.total_ms / 1000).toFixed(1)}s
                    </span>
                  )}
                  {typeof usage.tool_rounds === 'number' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                      🔧 {usage.tool_rounds} 轮工具
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
