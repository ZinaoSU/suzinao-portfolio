import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, BrainCircuit, X } from 'lucide-react';
import type { AgentTraceStep, AgentUsage } from '../../config/agent';

interface AgentTracePanelProps {
  steps: AgentTraceStep[];
  usage: AgentUsage | null;
  onClose: () => void;
}

/** 检索命中的明细结构（search_knowledge 工具的 detail.hits） */
interface RetrievalHit {
  title?: string;
  source?: string;
  score?: number;
}

/**
 * Agent 过程可视化面板（可开关）
 * 实时展示 Agent 的执行轨迹：意图识别 → 工具调用 → 检索命中 → 生成回答
 */
export const AgentTracePanel: React.FC<AgentTracePanelProps> = ({ steps, usage, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-white/10 bg-gradient-to-b from-primary-purple/5 to-transparent overflow-hidden"
    >
      <div className="px-5 py-3 max-h-[220px] overflow-y-auto">
        <div className="flex items-center gap-2 mb-2">
          <BrainCircuit size={14} className="text-primary-purple" />
          <span className="text-xs font-semibold text-primary-purple">
            🤖 看看我是怎么想的（Agent 执行轨迹）
          </span>
          <button
            onClick={onClose}
            className="ml-auto w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            title="收起面板"
          >
            <X size={12} />
          </button>
        </div>

        {steps.length === 0 && (
          <p className="text-xs text-gray-500">提问后这里会实时展示 Agent 的思考步骤…</p>
        )}

        <div className="space-y-1.5">
          <AnimatePresence>
            {steps.map((step, idx) => (
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
            ))}
          </AnimatePresence>
        </div>

        {/* 统计卡 */}
        {usage && (
          <div className="flex gap-3 mt-3">
            {typeof usage.total_ms === 'number' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                ⏱ {(usage.total_ms / 1000).toFixed(1)}s
              </span>
            )}
            {typeof usage.tool_rounds === 'number' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                🔧 工具调用 {usage.tool_rounds} 轮
              </span>
            )}
            {typeof usage.trace_steps === 'number' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">
                📊 {usage.trace_steps} 步
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
