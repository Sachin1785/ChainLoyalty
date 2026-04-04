
"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Filter,
  Target,
  Plus,
  Save,
  Play,
  X,
  Trash2,
  Star,
  MoreHorizontal,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { createRule, updateRule, fetchAllBadges } from "@/lib/utils/api";

interface Node {
  id: string;
  type: 'trigger' | 'filter' | 'action';
  label: string;
  x: number;
  y: number;
  data: any;
  color: string;
}

interface Connection {
  from: string;
  to: string;
}

const COLORS = {
  trigger: 'bg-purple-600',
  filter: 'bg-indigo-500',
  action: 'bg-emerald-500',
};

const SOFT_COLORS = {
  trigger: 'bg-purple-50 text-purple-600',
  filter: 'bg-indigo-50 text-indigo-500',
  action: 'bg-emerald-50 text-emerald-500',
};

const DEFAULT_NODES: Node[] = [
  { id: '1', type: 'trigger', label: 'PURCHASE_EVENT', x: 60, y: 220, data: { eventType: 'purchase' }, color: COLORS.trigger },
  { id: '2', type: 'filter', label: 'AMOUNT_THRESHOLD', x: 330, y: 220, data: { conditionType: 'threshold', field: 'amount', value: 50 }, color: COLORS.filter },
  { id: '3', type: 'action', label: 'TOKEN_EMISSION', x: 600, y: 220, data: { rewardType: 'points', rewardValue: 100 }, color: COLORS.action },
];
const DEFAULT_CONNECTIONS: Connection[] = [
  { from: '1', to: '2' },
  { from: '2', to: '3' }
];

export function LogicNebula({ ruleToEdit, onDeploySuccess, onNewRule }: { ruleToEdit?: any, onDeploySuccess?: () => void, onNewRule?: () => void }) {
  const [nodes, setNodes] = useState<Node[]>(DEFAULT_NODES);
  const [connections, setConnections] = useState<Connection[]>(DEFAULT_CONNECTIONS);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [ruleName, setRuleName] = useState('My Logic Rule');
  const [availableBadges, setAvailableBadges] = useState<any[]>([]);

  // Fetch badges for selection in action nodes
  useEffect(() => {
    async function loadBadges() {
      try {
        const resp = await fetchAllBadges();
        setAvailableBadges(resp || []);
      } catch (e) {
        console.error("Failed to load badges for nebula:", e);
      }
    }
    loadBadges();
  }, []);

  // Sync ruleToEdit to graph nodes
  useEffect(() => {
    if (ruleToEdit) {
      setRuleName(ruleToEdit.name);
      
      const newNodes: Node[] = [];
      const newConns: Connection[] = [];
      
      const tId = `t-${Date.now()}`;
      newNodes.push({
        id: tId,
        type: 'trigger',
        label: ruleToEdit.trigger?.type?.toUpperCase() + '_EVENT' || 'TRIGGER',
        x: 60, y: 220,
        data: { eventType: ruleToEdit.trigger?.type },
        color: COLORS.trigger
      });

      let lastId = tId;
      (ruleToEdit.conditions || []).forEach((c: any, i: number) => {
         const fId = `f-${Date.now()}-${i}`;
         newNodes.push({
           id: fId,
           type: 'filter',
           label: `FILTER_${i}`,
           x: 60 + (i + 1) * 270, y: 220,
           data: { conditionType: c.conditionType, field: c.field, value: c.value },
           color: COLORS.filter
         });
         newConns.push({ from: lastId, to: fId });
         lastId = fId;
      });

      const aId = `a-${Date.now()}`;
      const firstAction = ruleToEdit.actions?.[0];
      const isBadge = firstAction?.type === 'AWARD_BADGE';
      newNodes.push({
        id: aId,
        type: 'action',
        label: isBadge ? 'MINT_BADGE' : 'GRANT_POINTS',
        x: 60 + ((ruleToEdit.conditions?.length || 0) + 1) * 270, y: 220,
        data: { 
           rewardType: isBadge ? 'badge' : 'points',
           rewardValue: isBadge ? firstAction?.payload?.badgeId : firstAction?.payload?.amount,
           automaticMint: ruleToEdit.automaticMint !== false
        },
        color: COLORS.action
      });
      newConns.push({ from: lastId, to: aId });

      setNodes(newNodes);
      setConnections(newConns);
    } else {
      // If ruleToEdit is null, reset to default canvas
      setRuleName('My Logic Rule');
      setNodes(DEFAULT_NODES);
      setConnections(DEFAULT_CONNECTIONS);
    }
  }, [ruleToEdit]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const addNode = (type: Node['type']) => {
    const defaults: Record<Node['type'], any> = {
      trigger: { eventType: 'purchase' },
      filter: { conditionType: 'threshold', field: 'amount', value: 0 },
      action: { rewardType: 'points', rewardValue: 100 },
    };
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      label: `NEW_${type.toUpperCase()}`,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      data: defaults[type],
      color: COLORS[type]
    };
    setNodes([...nodes, newNode]);
    setSelectedNode(newNode.id);
  };

  // ── Deploy graph to backend ────────────────────────────────────────────
  const deployRule = useCallback(async () => {
    const trigger = nodes.find(n => n.type === 'trigger');
    const filters = nodes.filter(n => n.type === 'filter');
    const actions = nodes.filter(n => n.type === 'action');

    if (!trigger) {
      setDeployResult({ ok: false, msg: 'Add a Trigger node first.' });
      return;
    }
    if (actions.length === 0) {
      setDeployResult({ ok: false, msg: 'Add at least one Action node.' });
      return;
    }

    // Map event type label → backend event value
    const eventTypeMap: Record<string, string> = {
      PURCHASE_EVENT: 'purchase', REFERRAL_EVENT: 'referral',
      SIGNUP_EVENT: 'signup', ACHIEVEMENT_EVENT: 'achievement',
    };
    const backendTriggerType = eventTypeMap[trigger.label] ??
      (trigger.data?.eventType ?? trigger.label.toLowerCase().replace('_event', ''));

    const conditions = filters.map((f, i) => ({
      id: `c${i}`,
      conditionType: f.data?.conditionType ?? 'threshold',
      field: f.data?.field ?? 'amount',
      value: f.data?.value ?? 0,
    }));

    const firstAction = actions[0];
    const rewardType = firstAction.data?.rewardType ?? 'points';
    const rewardValue = firstAction.data?.rewardValue ?? 100;

    const rulePayload = {
      name: ruleName || `Nebula Rule – ${Date.now()}`,
      trigger: { id: 't1', type: backendTriggerType, label: trigger.label, value: backendTriggerType },
      conditions,
      actions: [
        rewardType === 'badge'
          ? { id: 'a1', type: 'AWARD_BADGE', payload: { badgeId: rewardValue } }
          : { id: 'a1', type: 'GRANT_POINTS', payload: { amount: rewardValue } },
      ],
      enabled: true,
      automaticMint: firstAction.data?.automaticMint ?? true,
    };

    try {
      setDeploying(true);
      setDeployResult(null);
      if (ruleToEdit?.id) {
         await updateRule(ruleToEdit.id, rulePayload);
         setDeployResult({ ok: true, msg: `Rule "${rulePayload.name}" updated!` });
      } else {
         await createRule(rulePayload);
         setDeployResult({ ok: true, msg: `Rule "${rulePayload.name}" deployed!` });
      }
      onDeploySuccess?.();
      setTimeout(() => setDeployResult(null), 4000);
    } catch (e: any) {
      setDeployResult({ ok: false, msg: e.response?.data?.detail ?? e.message ?? 'Deploy failed' });
    } finally {
      setDeploying(false);
    }
  }, [nodes, ruleName]);

  const updateNode = (id: string, updates: Partial<Node>) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const deleteNode = (id: string) => {
    setNodes(nodes.filter(n => n.id !== id));
    setConnections(connections.filter(c => c.from !== id && c.to !== id));
    if (selectedNode === id) setSelectedNode(null);
  };

  const activeNode = nodes.find(n => n.id === selectedNode);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsConnecting(null)}
      className="relative w-full h-full bg-[#F8F7F3] rounded-[40px] overflow-hidden flex border border-gray-100 shadow-inner"
    >
      {/* Visual Grid Background */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ 
        backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', 
        backgroundSize: '24px 24px' 
      }} />

      {/* Control Panel (Pill Floating) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/80 backdrop-blur-md rounded-full border border-gray-100 shadow-xl z-50">
        <button 
          onClick={() => {
            onNewRule?.();
            setRuleName('My Logic Rule');
            setNodes(DEFAULT_NODES);
            setConnections(DEFAULT_CONNECTIONS);
          }}
          title="Clear canvas and create new protocol rule"
          className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus size={16} strokeWidth={3} />
        </button>
        <div className="w-px h-6 bg-gray-100 mx-1" />
        <ToolButton onClick={() => addNode('trigger')} label="Event" icon={<Zap size={14} />} color="text-purple-600 bg-purple-50" />
        <ToolButton onClick={() => addNode('filter')} label="Condition" icon={<Filter size={14} />} color="text-indigo-600 bg-indigo-50" />
        <ToolButton onClick={() => addNode('action')} label="Protocol" icon={<Target size={14} />} color="text-emerald-600 bg-emerald-50" />
        <div className="w-px h-6 bg-gray-100 mx-2" />
        {/* Rule Name input */}
        <input
          value={ruleName}
          onChange={e => setRuleName(e.target.value)}
          placeholder="Rule name…"
          className="h-10 px-4 rounded-full border border-gray-100 text-xs font-semibold outline-none bg-white/80 w-36 focus:ring-2 focus:ring-purple-100"
        />
        <button
          onClick={() => setIsSimulating(!isSimulating)}
          className={`h-10 px-4 rounded-full font-bold text-xs flex items-center gap-2 transition-all ${isSimulating ? 'bg-purple-600 text-white animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'}`}
        >
          {isSimulating ? <Star size={14} className="animate-spin" /> : <Play size={14} />}
          {isSimulating ? 'Live Test' : 'Test'}
        </button>
        <button
          onClick={deployRule}
          disabled={deploying}
          className="h-10 px-6 rounded-full font-bold text-xs flex items-center gap-2 bg-black text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
        >
          {deploying ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Deploy Rule
        </button>
      </div>

      {/* Deploy Result Toast */}
      <AnimatePresence>
        {deployResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-xl z-[60] text-xs font-bold ${
              deployResult.ok
                ? 'bg-emerald-600 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {deployResult.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {deployResult.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Properties Sidebar (Optional Floating Right) */}
      <AnimatePresence>
        {activeNode && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-8 top-8 bottom-8 w-80 bg-white rounded-[32px] shadow-2xl z-50 border border-gray-50 flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-[#F8F7F3]/50">
               <div>
                  <h3 className="text-lg font-bold tracking-tight">Node Configuration</h3>
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">Logic_Protocol_{activeNode.id.slice(0,4)}</p>
               </div>
               <button onClick={() => setSelectedNode(null)} className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                  <X size={20} />
               </button>
            </div>
            
            <div className="flex-1 p-6 space-y-5 overflow-y-auto custom-scrollbar">
               {/* Global Label */}
               <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Friendly Label</label>
                  <input 
                    value={activeNode.label}
                    onChange={(e) => updateNode(activeNode.id, { label: e.target.value })}
                    className="w-full h-10 bg-[#F8F7F3] rounded-xl px-4 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-purple-50 border-none transition-all shadow-inner"
                  />
               </div>

               {/* TYPE SPECIFIC RULES */}
               <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="text-[10px] font-black uppercase text-purple-600 tracking-tighter">Nebula_Rule_Settings</div>
                  
                  {activeNode.type === 'trigger' && (
                    <div className="space-y-3">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Event Origin</label>
                          <select className="w-full h-10 bg-[#F8F7F3] rounded-xl px-4 text-sm font-semibold outline-none border-none shadow-inner">
                             <option>Web3 Wallet Event</option>
                             <option>EAS Attestation</option>
                             <option>API Webhook</option>
                          </select>
                       </div>
                    </div>
                  )}

                  {activeNode.type === 'filter' && (
                    <div className="space-y-3">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Logic Operator</label>
                          <select className="w-full h-10 bg-[#F8F7F3] rounded-xl px-4 text-sm font-semibold outline-none border-none shadow-inner">
                             <option>Greater than (&gt;)</option>
                             <option>Less than (&lt;)</option>
                             <option>Exactly Equals (==)</option>
                             <option>Has Attestation</option>
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Threshold Value</label>
                          <input 
                            type="number"
                            placeholder="0.00"
                            className="w-full h-10 bg-[#F8F7F3] rounded-xl px-4 text-sm font-semibold outline-none border-none shadow-inner"
                          />
                       </div>
                    </div>
                  )}

                  {activeNode.type === 'action' && (
                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Protocol Action</label>
                          <div className="grid grid-cols-2 gap-2">
                             <button 
                               onClick={() => updateNode(activeNode.id, { data: { ...activeNode.data, rewardType: 'badge' }})}
                               className={`h-10 rounded-xl text-[10px] font-bold uppercase transition-all ${activeNode.data?.rewardType === 'badge' ? 'bg-purple-600 text-white shadow-lg' : 'bg-[#F8F7F3] text-gray-400 border border-gray-100 hover:bg-white'}`}
                             >
                               Mint Badge
                             </button>
                             <button 
                               onClick={() => updateNode(activeNode.id, { data: { ...activeNode.data, rewardType: 'points' }})}
                               className={`h-10 rounded-xl text-[10px] font-bold uppercase transition-all ${activeNode.data?.rewardType === 'points' || !activeNode.data?.rewardType ? 'bg-emerald-600 text-white shadow-lg' : 'bg-[#F8F7F3] text-gray-400 border border-gray-100 hover:bg-white'}`}
                             >
                               Emit Points
                             </button>
                          </div>
                       </div>

                       {activeNode.data?.rewardType === 'badge' ? (
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Badge Registry</label>
                             <select 
                               value={activeNode.data?.rewardValue || ''}
                               onChange={(e) => updateNode(activeNode.id, { data: { ...activeNode.data, rewardValue: e.target.value }})}
                               className="w-full h-10 bg-[#F8F7F3] rounded-xl px-4 text-sm font-semibold outline-none border-none shadow-inner"
                             >
                                <option value="">Select Badge Standard</option>
                                {availableBadges.map(b => (
                                   <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                             </select>
                          </div>
                       ) : (
                          <div className="space-y-1">
                             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Points Amount</label>
                             <input 
                               type="number"
                               value={activeNode.data?.rewardValue || 0}
                               onChange={(e) => updateNode(activeNode.id, { data: { ...activeNode.data, rewardValue: parseInt(e.target.value) }})}
                               placeholder="100"
                               className="w-full h-10 bg-[#F8F7F3] rounded-xl px-4 text-sm font-semibold outline-none border-none shadow-inner"
                             />
                          </div>
                       )}

                       <div className="flex items-center justify-between p-3 bg-purple-50/50 rounded-2xl border border-purple-100">
                          <div>
                             <h4 className="text-[10px] font-black uppercase tracking-widest text-purple-600 mb-1">Auto-Mint</h4>
                             <p className="text-[8px] font-bold text-purple-800/60 leading-tight">Emit instantly on-chain.</p>
                          </div>
                          <button
                             onClick={() => updateNode(activeNode.id, { data: { ...activeNode.data, automaticMint: !(activeNode.data?.automaticMint ?? true) }})}
                             className={`w-10 h-5 rounded-full transition-colors relative ${activeNode.data?.automaticMint !== false ? 'bg-purple-600' : 'bg-gray-200'}`}
                          >
                             <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${activeNode.data?.automaticMint !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                       </div>
                    </div>
                  )}
               </div>

               <div className="space-y-4 pt-8">
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 border-dashed">
                     <p className="text-[10px] font-medium text-purple-400 leading-relaxed uppercase">Real-time sync enabled. Changes are logged to the protocol history.</p>
                  </div>
                  <button 
                    onClick={() => deleteNode(activeNode.id)}
                    className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={16} /> Terminate Node
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Invisible Background Click Layer for Deselection */}
        <div 
          className="absolute inset-0 z-0 cursor-default" 
          onClick={() => setSelectedNode(null)} 
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#CBD5E1" />
            </marker>
          </defs>
          {connections.map((conn, idx) => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            if (!from || !to) return null;

            const x1 = from.x + 220;
            const y1 = from.y + 40;
            const x2 = to.x;
            const y2 = to.y + 40;

            return (
              <g key={idx}>
                <path 
                  d={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`}
                  stroke="#CBD5E1"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrow)"
                  className="transition-all duration-300"
                />
                {isSimulating && (
                  <circle r="4" fill="#A855F7">
                    <animateMotion dur="2s" repeatCount="indefinite" path={`M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`} />
                  </circle>
                )}
              </g>
            );
          })}

          {isConnecting && (
             <path 
              d={`M ${nodes.find(n => n.id === isConnecting)!.x + 220} ${nodes.find(n => n.id === isConnecting)!.y + 40} L ${mousePos.x} ${mousePos.y}`}
              stroke="#A855F7"
              strokeWidth="2"
              strokeDasharray="4,4"
              fill="none"
            />
          )}
        </svg>

        {nodes.map((node) => (
          <motion.div
            key={node.id}
            drag
            dragMomentum={false}
            onDrag={(e, info) => updateNode(node.id, { x: node.x + info.delta.x, y: node.y + info.delta.y })}
            onMouseDown={(e) => { 
                e.stopPropagation(); 
                setSelectedNode(node.id); 
            }}
            onClick={(e) => e.stopPropagation()}
            className={`absolute w-[220px] bg-white rounded-[24px] shadow-sm border border-gray-100 transition-all cursor-grab active:cursor-grabbing group hover:shadow-xl hover:border-purple-200 z-20 ${selectedNode === node.id ? '!z-40 ring-2 ring-purple-600 ring-offset-4' : ''}`}
            style={{ x: node.x, y: node.y }}
          >
            {/* Quick Delete Button */}
            <button 
                onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg"
            >
                <X size={12} strokeWidth={3} />
            </button>

            {/* Header */}
            <div className={`p-4 rounded-t-[24px] flex items-center justify-between ${SOFT_COLORS[node.type]}`}>
               <div className="flex items-center gap-2">
                 <NodeIcon type={node.type} />
                 <span className="text-[10px] font-bold uppercase tracking-widest">{node.type}</span>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-current opacity-40" />
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="font-bold text-sm tracking-tight text-gray-900 group-hover:text-purple-600 transition-colors">
                {node.label}
              </div>
              <div className="mt-4 flex items-center justify-between">
                 <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Live_Logic</span>
                 </div>
                 <button className="text-gray-200 hover:text-gray-400 transition-colors">
                    <MoreHorizontal size={14} />
                 </button>
              </div>
            </div>

            {/* In Port */}
            <div 
              className="absolute -left-2 top-10 w-4 h-4 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-indigo-500 hover:border-indigo-500 cursor-pointer z-10 transition-colors group/port"
              onMouseUp={(e) => { 
                e.stopPropagation(); 
                if (isConnecting && isConnecting !== node.id) {
                  setConnections([...connections, { from: isConnecting, to: node.id }]);
                }
                setIsConnecting(null);
              }}
            >
              <div className="w-1 h-1 rounded-full bg-gray-200 group-hover/port:bg-white" />
            </div>

            {/* Out Port */}
            <div 
              className="absolute -right-2 top-10 w-4 h-4 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-purple-600 hover:border-purple-600 cursor-pointer z-10 transition-colors group/port"
              onMouseDown={(e) => { e.stopPropagation(); setIsConnecting(node.id); }}
            >
              <div className="w-1 h-1 rounded-full bg-gray-200 group-hover/port:bg-white" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ToolButton({ icon, label, color, onClick }: { icon: any, label: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${color}`}
    >
      {icon}
      {label}
    </button>
  );
}

function NodeIcon({ type }: { type: Node['type'] }) {
  switch (type) {
    case 'trigger': return <Zap size={14} />;
    case 'filter': return <Filter size={14} />;
    case 'action': return <Target size={14} />;
  }
}


