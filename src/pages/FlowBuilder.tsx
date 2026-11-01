import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow, addEdge, useNodesState, useEdgesState, Controls,
  MiniMap, Background, Connection, Panel, ReactFlowProvider
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import { useStore } from '../store';
import { t } from '../i18n';
import {
  Plus, Play, Save, Type, FileInput,
  Image as ImageIcon, Mic, Bot, Brain, Eye, Languages,
  Code, FileText, GitBranch, Repeat, Database, Bell,
  Braces, MessageCircle, FileOutput, HardDrive
} from 'lucide-react';

const nodeCategories = {
  input: {
    label: { uk: 'Введення', en: 'Input' },
    color: 'from-emerald-500 to-green-600',
    nodes: [
      { type: 'textInput', label: { uk: 'Текст', en: 'Text Input' }, icon: Type },
      { type: 'fileInput', label: { uk: 'Файл', en: 'File Input' }, icon: FileInput },
      { type: 'imageInput', label: { uk: 'Зображення', en: 'Image Input' }, icon: ImageIcon },
      { type: 'audioInput', label: { uk: 'Аудіо', en: 'Audio Input' }, icon: Mic },
    ]
  },
  ai: {
    label: { uk: 'AI', en: 'AI' },
    color: 'from-indigo-500 to-purple-600',
    nodes: [
      { type: 'llm', label: { uk: 'LLM', en: 'LLM Node' }, icon: Brain },
      { type: 'agent', label: { uk: 'Агент', en: 'AI Agent' }, icon: Bot },
      { type: 'vision', label: { uk: 'Зір', en: 'Vision Model' }, icon: Eye },
      { type: 'embedding', label: { uk: 'Embedding', en: 'Embedding' }, icon: Database },
      { type: 'classifier', label: { uk: 'Класифікатор', en: 'Classifier' }, icon: GitBranch },
      { type: 'summarizer', label: { uk: 'Сумаризатор', en: 'Summarizer' }, icon: FileText },
      { type: 'translator', label: { uk: 'Перекладач', en: 'Translator' }, icon: Languages },
      { type: 'codeAssistant', label: { uk: 'Код', en: 'Code Assistant' }, icon: Code },
    ]
  },
  processing: {
    label: { uk: 'Обробка', en: 'Processing' },
    color: 'from-amber-500 to-orange-600',
    nodes: [
      { type: 'textProcessor', label: { uk: 'Текст', en: 'Text Processor' }, icon: Type },
      { type: 'jsonParser', label: { uk: 'JSON', en: 'JSON Parser' }, icon: Braces },
      { type: 'conditional', label: { uk: 'Умова', en: 'Conditional' }, icon: GitBranch },
      { type: 'loop', label: { uk: 'Цикл', en: 'Loop' }, icon: Repeat },
      { type: 'javascript', label: { uk: 'JavaScript', en: 'JavaScript' }, icon: Code },
    ]
  },
  memory: {
    label: { uk: "Пам'ять", en: 'Memory' },
    color: 'from-cyan-500 to-blue-600',
    nodes: [
      { type: 'shortMemory', label: { uk: 'Коротка', en: 'Short-Term' }, icon: MessageCircle },
      { type: 'longMemory', label: { uk: 'Довга', en: 'Long-Term' }, icon: HardDrive },
      { type: 'vectorDB', label: { uk: 'Векторна БД', en: 'Vector DB' }, icon: Database },
      { type: 'convMemory', label: { uk: 'Діалог', en: 'Conversation' }, icon: MessageCircle },
    ]
  },
  output: {
    label: { uk: 'Виведення', en: 'Output' },
    color: 'from-rose-500 to-pink-600',
    nodes: [
      { type: 'textOutput', label: { uk: 'Текст', en: 'Text Output' }, icon: Type },
      { type: 'jsonOutput', label: { uk: 'JSON', en: 'JSON Output' }, icon: Braces },
      { type: 'fileOutput', label: { uk: 'Файл', en: 'File Output' }, icon: FileOutput },
      { type: 'notification', label: { uk: 'Сповіщення', en: 'Notification' }, icon: Bell },
    ]
  }
};

function CustomNode({ data }: { data: any }) {
  const Icon = data.icon || Type;
  return (
    <div className="px-4 py-3 rounded-xl border border-indigo-500/30 bg-slate-900/90 backdrop-blur-sm min-w-[160px]">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-indigo-400" />
        <span className="text-xs font-medium text-white">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-[10px] text-slate-400">{data.description}</p>
      )}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

function FlowBuilderInner() {
  const { language, flowProjects, addFlowProject, updateFlowProject } = useStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [projectName, setProjectName] = useState(language === 'uk' ? 'Новий Flow' : 'New Flow');
  const [showNodePanel, setShowNodePanel] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [runResults, setRunResults] = useState<string[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } } as Edge, eds)),
    [setEdges]
  );

  const addNode = (nodeType: string, label: string, icon: any) => {
    const id = `node-${Date.now()}-${nodeIdCounter}`;
    setNodeIdCounter(prev => prev + 1);
    const newNode: Node = {
      id,
      type: 'custom',
      position: { x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: {
        label,
        icon,
        nodeType,
        description: '',
      },
    };
    setNodes((nds: Node[]) => [...nds, newNode]);
  };

  const handleNewProject = () => {
    setNodes([]);
    setEdges([]);
    setSelectedProject(null);
    setProjectName(language === 'uk' ? 'Новий Flow' : 'New Flow');
    setRunResults([]);
  };

  const handleSave = () => {
    const serializedNodes = nodes.map(n => ({
      ...n,
      data: { ...n.data, icon: undefined }
    }));
    
    if (selectedProject) {
      updateFlowProject(selectedProject, {
        name: projectName,
        nodes: serializedNodes as any[],
        edges: edges as any[],
        updatedAt: Date.now(),
      });
    } else {
      const project = {
        id: `flow-${Date.now()}`,
        name: projectName,
        description: '',
        nodes: serializedNodes as any[],
        edges: edges as any[],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      addFlowProject(project);
      setSelectedProject(project.id);
    }
  };

  const handleLoadProject = (projectId: string) => {
    const project = flowProjects.find(p => p.id === projectId);
    if (project) {
      setNodes(project.nodes.map((n: any) => ({
        ...n,
        data: { ...n.data, icon: Type }
      })));
      setEdges(project.edges as Edge[]);
      setSelectedProject(projectId);
      setProjectName(project.name);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setRunResults([]);
    
    for (const node of nodes) {
      await new Promise(r => setTimeout(r, 500));
      setRunResults(prev => [...prev, `✓ ${node.data.label} (${node.data.nodeType})`]);
    }
    
    setIsRunning(false);
    setRunResults(prev => [...prev, `\n${language === 'uk' ? 'Flow завершено!' : 'Flow completed!'}`]);
  };

  return (
    <div className="h-full flex">
      {/* Node Panel */}
      {showNodePanel && (
        <div className="w-56 border-r border-indigo-500/20 overflow-y-auto glass-light p-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">{t('flow.nodes', language)}</h3>
          {Object.entries(nodeCategories).map(([catKey, category]) => (
            <div key={catKey} className="mb-4">
              <h4 className={`text-xs font-medium mb-2 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}>
                {category.label[language]}
              </h4>
              <div className="space-y-1">
                {category.nodes.map((node) => {
                  const Icon = node.icon;
                  return (
                    <button
                      key={node.type}
                      onClick={() => addNode(node.type, node.label[language], node.icon)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-indigo-400" />
                      {node.label[language]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Flow Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-12 border-b border-indigo-500/20 flex items-center justify-between px-4 glass-light">
          <div className="flex items-center gap-3">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="bg-transparent text-sm text-white border-none focus:outline-none font-medium w-48"
            />
            <select
              onChange={(e) => e.target.value && handleLoadProject(e.target.value)}
              className="bg-slate-800/50 border border-indigo-500/20 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
              value={selectedProject || ''}
            >
              <option value="">{language === 'uk' ? 'Відкрити проєкт...' : 'Open project...'}</option>
              {flowProjects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleNewProject}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-lg text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              {t('flow.save', language)}
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning || nodes.length === 0}
              className="px-3 py-1.5 rounded-lg text-xs bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-30"
            >
              <Play className="w-3.5 h-3.5" />
              {t('flow.run', language)}
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-slate-950/50"
          >
            <Controls />
            <MiniMap className="!bg-slate-900/80" />
            <Background color="rgba(99, 102, 241, 0.1)" gap={20} />
            <Panel position="bottom-right">
              {runResults.length > 0 && (
                <div className="glass rounded-xl p-3 max-w-xs max-h-48 overflow-y-auto">
                  <h4 className="text-xs font-medium text-indigo-300 mb-2">
                    {language === 'uk' ? 'Результати' : 'Results'}
                  </h4>
                  {runResults.map((r, i) => (
                    <p key={i} className="text-xs text-slate-300 font-mono">{r}</p>
                  ))}
                </div>
              )}
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default function FlowBuilder() {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner />
    </ReactFlowProvider>
  );
}
