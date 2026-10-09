import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  applyEdgeChanges,
  applyNodeChanges,
  Handle,
  Position,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Shield, Users, Globe, Smartphone, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

// Custom Node for Protected Brand Asset (Clean White Clay Design)
const BrandNode = ({ data = {} }) => {
  return (
    <div className="px-5 py-4 rounded-2xl bg-white border border-blue-200 shadow-[6px_6px_16px_rgba(180,195,220,0.4),-6px_-6px_16px_rgba(255,255,255,0.95)] min-w-[220px] transition-all hover:scale-[1.02]">
      <Handle type="source" position={Position.Right} className="!bg-blue-600 !w-3 !h-3 !border-2 !border-white" />
      <div className="flex items-center gap-2.5 mb-2">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest font-bold block">
            {data.badge || 'Protected Asset'}
          </span>
          <h4 className="text-sm font-bold text-slate-800">{data.subLabel || data.label || 'Brand Target'}</h4>
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium">{data.label || 'Monitored Enterprise'}</p>
      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] font-mono text-emerald-600 flex items-center gap-1.5 font-semibold">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        Continuous Shield Active
      </div>
    </div>
  );
};

// Custom Node for Malicious Vectors (Clean White Clay Design with Severity Accents)
const ThreatNode = ({ data = {} }) => {
  const riskScore = data.riskScore ?? 85;
  const isCritical = riskScore >= 90;
  
  const accentBorder = isCritical ? 'border-rose-200' : 'border-amber-200';
  const badgeBg = isCritical ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200';
  const iconColor = isCritical ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50';

  const getVectorIcon = () => {
    const et = (data.entityType || '').toLowerCase();
    const lbl = (data.label || '').toLowerCase();
    if (et.includes('social') || lbl.includes('social')) return <Users className="w-4 h-4" />;
    if (et.includes('url') || et.includes('portal') || lbl.includes('url')) return <Globe className="w-4 h-4" />;
    if (et.includes('app') || et.includes('apk') || lbl.includes('app')) return <Smartphone className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className={`px-5 py-4 rounded-2xl bg-white border ${accentBorder} shadow-[6px_6px_16px_rgba(180,195,220,0.35),-6px_-6px_16px_rgba(255,255,255,0.95)] min-w-[240px] transition-all hover:scale-[1.02]`}>
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-3 !h-3 !border-2 !border-white" />

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border border-slate-100 ${iconColor}`}>
            {getVectorIcon()}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              {data.badge || 'Threat Vector'}
            </span>
            <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{data.label || 'Malicious Node'}</h4>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${badgeBg}`}>
          {riskScore}/100
        </span>
      </div>

      <div className="text-xs font-mono text-slate-600 break-all bg-slate-50 p-2 rounded-xl border border-slate-100">
        {data.subLabel || 'Suspicious payload indicator'}
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex justify-between items-center font-mono">
        <span>Type: <strong className="text-slate-700">{data.entityType || 'Attack Vector'}</strong></span>
        <span className="text-rose-600 font-bold">{data.status || 'Active'}</span>
      </div>
    </div>
  );
};

export default function CampaignGraph({ graphData, onSelectNode }) {
  const nodeTypes = useMemo(() => ({
    brandNode: BrandNode,
    threatNode: ThreatNode
  }), []);

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeData, setSelectedNodeData] = useState(null);

  useEffect(() => {
    if (graphData && Array.isArray(graphData.nodes)) {
      const formattedNodes = graphData.nodes.map((node) => ({
        ...node,
        type: node.type || (node.id?.includes('brand') ? 'brandNode' : 'threatNode'),
        data: node.data || { label: node.id, subLabel: 'Node' }
      }));

      const formattedEdges = (graphData.edges || []).map((e) => ({
        ...e,
        style: { stroke: '#3b82f6', strokeWidth: 2.5, ...(e.style || {}) },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 18,
          height: 18,
          color: e.style?.stroke || '#3b82f6'
        }
      }));

      setNodes(formattedNodes);
      setEdges(formattedEdges);
    } else {
      // Fallback baseline nodes
      setNodes([
        {
          id: 'brand',
          type: 'brandNode',
          data: { label: 'Official Brand Asset', subLabel: 'ApexPay Global', entityType: 'Legitimate Enterprise', badge: 'Protected Asset', status: 'Targeted' },
          position: { x: 50, y: 150 }
        },
        {
          id: 'social-1',
          type: 'threatNode',
          data: { label: 'Fake Social Profile', subLabel: '@ApexPay_SupportDesk_VIP', entityType: 'Social Vector', riskScore: 94, badge: 'Critical Threat', status: 'Active' },
          position: { x: 380, y: 60 }
        },
        {
          id: 'url-1',
          type: 'threatNode',
          data: { label: 'Suspicious Phishing URL', subLabel: 'apexpay-login-portal-auth.com', entityType: 'Credential Phish', riskScore: 88, badge: 'High Threat', status: 'Active' },
          position: { x: 720, y: 150 }
        },
        {
          id: 'app-1',
          type: 'threatNode',
          data: { label: 'Trojanized Mobile APK', subLabel: 'ApexPay Quick Loan APK', entityType: 'Spyware Payload', riskScore: 91, badge: 'Critical Payload', status: 'Active' },
          position: { x: 1060, y: 240 }
        }
      ]);
      setEdges([
        { id: 'e-brand-social', source: 'brand', target: 'social-1', animated: true, style: { stroke: '#2563eb', strokeWidth: 2.5 } },
        { id: 'e-social-url', source: 'social-1', target: 'url-1', animated: true, style: { stroke: '#e11d48', strokeWidth: 2.5 } },
        { id: 'e-url-app', source: 'url-1', target: 'app-1', animated: true, style: { stroke: '#d97706', strokeWidth: 2.5 } }
      ]);
    }
  }, [graphData]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const handleNodeClick = (_, node) => {
    setSelectedNodeData(node?.data || null);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="relative w-full h-[480px] rounded-3xl bg-slate-50 border border-slate-200/80 overflow-hidden shadow-[inset_2px_2px_6px_rgba(180,195,220,0.25),inset_-2px_-2px_6px_rgba(255,255,255,0.95)]">
      {/* Top Banner Guide Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200/80 shadow-[4px_4px_12px_rgba(180,195,220,0.25)] pointer-events-auto flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          <div>
            <span className="text-[10px] font-mono text-blue-600 uppercase tracking-wider font-bold block">
              Attack Kill-Chain Flow
            </span>
            <span className="text-xs font-semibold text-slate-700">
              Brand Asset &rarr; Social Lure &rarr; Phishing Domain &rarr; Rogue Mobile APK
            </span>
          </div>
        </div>
      </div>

      {/* Selected Node Inspector Drawer */}
      {selectedNodeData && (
        <div className="absolute top-4 right-4 z-10 max-w-sm bg-white p-4 rounded-2xl border border-blue-200 shadow-[6px_8px_20px_rgba(180,195,220,0.4)] animate-slide-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-blue-600 uppercase font-bold">Node Telemetry</span>
            <button
              onClick={() => setSelectedNodeData(null)}
              className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-xs font-bold"
            >
              &times;
            </button>
          </div>
          <h4 className="text-sm font-bold text-slate-800 mb-1">{selectedNodeData.label}</h4>
          <p className="text-xs text-slate-600 font-mono mb-2 break-all bg-slate-50 p-2 rounded-xl border border-slate-100">
            {selectedNodeData.subLabel}
          </p>
          <div className="text-xs text-slate-600 space-y-1.5 border-t border-slate-100 pt-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Vector Category:</span>
              <span className="font-semibold text-slate-700">{selectedNodeData.entityType}</span>
            </div>
            {selectedNodeData.riskScore && (
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Severity:</span>
                <span className="text-rose-600 font-bold">{selectedNodeData.riskScore} / 100</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Enforcement:</span>
              <span className="text-emerald-600 font-bold">{selectedNodeData.status || 'Active'}</span>
            </div>
          </div>
        </div>
      )}

      {/* React Flow Container */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#cbd5e1" gap={24} size={1.5} />
        <Controls className="!bg-white !border-slate-200 !shadow-[4px_4px_10px_rgba(180,195,220,0.3)] !rounded-xl !text-slate-700" />
      </ReactFlow>
    </div>
  );
}
