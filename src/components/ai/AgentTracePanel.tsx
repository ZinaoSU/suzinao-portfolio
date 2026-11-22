import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, ChevronDown, Loader2, CheckCircle2, BrainCircuit, PenLine, Sparkles } from 'lucide-react';
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

/** 步骤名 → 展示文案与图标（WorkBuddy 风格：动词短语 + 状态） */
function stepMeta(name: string): { icon: React.ReactNode; label: string } {
  if (name.includes('开始思考')) return { icon: <BrainCircuit size={12} />, label: '理解问题' };
  if (name.includes('检索知识库')) return { icon: <Search size={12} />, label: '检索知识库' };
  if (name.includes('读取完整简历')) return { icon: <FileText size={12} />, label: '读取完整简历' };
  if (name.includes('组织回答')) return { icon: <PenLine size={12} />, label: '组织回答' };
  return { icon: <Sparkles size={12} />, label: name.replace(/^[^\u4e00-\u9fa5]+/, '') || '处理中' };
}

function fmtMs(ms?: number): string {
  if (typeof ms !== 'number' || ms <= 0) return '';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

/**
 * 消息内嵌「深度思考」块（WorkBuddy 风格）
 * - 思考中：逐条显示「正在检索知识库…」，最后一步带 spinner
 * - 回答完成：自动折叠为「✨ 已深度思考（19.1s）」一行，点击展开明细
 */
export const TraceBlock: React.FC<TraceBlockProps> = ({ steps, usage, live = false }) => {
  const [expanded, setExpanded] = useState(false);
  const showDetail = live || expanded;

  if (!steps.length) return null;

  const totalSec = typeof usage?.total_ms === 'number' ? (usage.total_ms / 1000).toFixed(1) : null;

  return (
    <div className="mb-2.5 rounded-xl bg-white/[0.04] border border-white/10 overflow-hidden">
      {/* 完成后的折叠摘要行 */}
      {!live && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/[0.05] transition-colors"
        >
          <Sparkles size={13} className="text-primary-purple flex-shrink-0" />
          <span className="text-xs text-gray-300 font-medium">
            已深度思考{totalSec ? `（${totalSec}s）` : ''}
          </span>
          <ChevronDown
            size={14}
            className={`ml-auto flex-shrink-0 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      )}

      {/* 展开的明细 */}
      <AnimatePresence initial={false}>
        {showDetail && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 py-2.5 min-w-0">
              {/* 思考中标题 */}
              {live && (
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles size={13} className="text-primary-purple" />
                  <span className="text-xs text-primary-purple font-medium">深度思考中…</span>
                </div>
              )}

              <div className="space-y-2.5">
                <AnimatePresence>
                  {steps.map((step, idx) => {
                    const { icon, label } = stepMeta(step.name);
                    const isLast = live && idx === steps.length - 1;
                    const ms = fmtMs(step.ms);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs"
                      >
                        {/* 步骤行：状态图标 + 动词短语 + 耗时 */}
                        <div className="flex items-center gap-2">
                          {isLast ? (
                            <Loader2 size={12} className="animate-spin text-primary-purple flex-shrink-0" />
                          ) : (
                            <CheckCircle2 size={12} className="text-gray-500 flex-shrink-0" />
                          )}
                          <span className={`flex items-center gap-1.5 ${isLast ? 'text-gray-200' : 'text-gray-400'}`}>
                            {icon}
                            {isLast ? `${label}…` : label}
                          </span>
                          {!isLast && ms && <span className="text-[10px] text-gray-500 tabular-nums">{ms}</span>}
                        </div>

                        {/* 检索词子行 */}
                        {typeof step.detail?.query === 'string' && (step.detail.query as string).trim() && (
                          <div className="mt-1 ml-6 text-[11px] text-gray-500 italic truncate">
                            「{(step.detail.query as string).trim()}」
                          </div>
                        )}

                        {/* 检索命中明细 */}
                        {Array.isArray(step.detail?.hits) && (step.detail.hits as RetrievalHit[]).length > 0 && (
                          <div className="mt-1.5 ml-6 space-y-1">
                            {(step.detail.hits as RetrievalHit[]).slice(0, 4).map((hit, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                                  <div
                                    className="h-full bg-gradient-to-r from-primary-purple to-primary-violet"
                                    style={{ width: `${Math.round((hit.score ?? 0) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-gray-400 truncate max-w-[140px]">
                                  {hit.title || hit.source}
                                </span>
                                <span className="text-[10px] text-primary-purple tabular-nums">
                                  {(hit.score ?? 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
