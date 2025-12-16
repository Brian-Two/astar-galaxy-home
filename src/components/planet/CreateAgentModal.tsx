import { useState } from 'react';
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Agent,
  AgentTemplate,
  AgentGuardrails,
  LearningObjective,
  ScaffoldingLevel,
  agentTemplates,
  PlanetSource,
} from './types';

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onCreateAgent: (agent: Omit<Agent, 'id' | 'timesUsed' | 'uniqueUsers' | 'createdAt'>) => void;
  planetId: string;
  planetColor: string;
  sources: PlanetSource[];
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function CreateAgentModal({
  open,
  onClose,
  onCreateAgent,
  planetId,
  planetColor,
  sources,
}: CreateAgentModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentName, setAgentName] = useState('');
  const [objectives, setObjectives] = useState<LearningObjective[]>([
    { id: '1', text: '', showToOthers: true },
  ]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [useAllSources, setUseAllSources] = useState(false);
  const [guardrails, setGuardrails] = useState<AgentGuardrails>({
    dontGiveFullAnswers: true,
    askWhatKnown: true,
    stayWithinSources: true,
    keepConcise: false,
    customAvoid: '',
  });
  const [scaffoldingLevel, setScaffoldingLevel] = useState<ScaffoldingLevel>('medium');

  const resetForm = () => {
    setStep(1);
    setSelectedTemplate(null);
    setAgentName('');
    setObjectives([{ id: '1', text: '', showToOthers: true }]);
    setSelectedSourceIds([]);
    setUseAllSources(false);
    setGuardrails({
      dontGiveFullAnswers: true,
      askWhatKnown: true,
      stayWithinSources: true,
      keepConcise: false,
      customAvoid: '',
    });
    setScaffoldingLevel('medium');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTemplate && agentName.trim();
      case 2:
        return objectives.some(o => o.text.trim());
      case 3:
        return useAllSources || selectedSourceIds.length > 0;
      case 4:
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleCreate = () => {
    if (!selectedTemplate) return;
    const template = agentTemplates.find(t => t.id === selectedTemplate);
    
    onCreateAgent({
      name: agentName,
      template: selectedTemplate,
      description: template?.description || '',
      learningObjectives: objectives.filter(o => o.text.trim()),
      selectedSourceIds,
      useAllSources,
      guardrails,
      scaffoldingLevel,
      planetId,
    });
    handleClose();
  };

  const addObjective = () => {
    if (objectives.length < 3) {
      setObjectives([...objectives, { id: String(Date.now()), text: '', showToOthers: true }]);
    }
  };

  const removeObjective = (id: string) => {
    if (objectives.length > 1) {
      setObjectives(objectives.filter(o => o.id !== id));
    }
  };

  const updateObjective = (id: string, text: string) => {
    setObjectives(objectives.map(o => o.id === id ? { ...o, text } : o));
  };

  const toggleSourceSelection = (sourceId: string) => {
    setSelectedSourceIds(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-3">Choose an agent type</h3>
              <div className="grid grid-cols-2 gap-3">
                {agentTemplates.map(template => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedTemplate === template.id
                          ? 'border-2 bg-slate-800/50'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                      }`}
                      style={{
                        borderColor: selectedTemplate === template.id ? planetColor : undefined,
                      }}
                    >
                      <div className="mb-2">
                        <IconComponent 
                          className="w-6 h-6" 
                          style={{ color: selectedTemplate === template.id ? planetColor : '#94a3b8' }}
                        />
                      </div>
                      <div className="font-medium text-foreground">{template.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Name your agent</h3>
              <Input
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="e.g., Physics Quiz Master"
                className="bg-slate-900/50 border-slate-700"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Learning objectives</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Define what this agent should help you achieve. These objectives will be used later to award stars when you hit them.
              </p>
            </div>
            <div className="space-y-3">
              {objectives.map((obj, i) => (
                <div key={obj.id} className="flex items-start gap-2">
                  <span className="text-muted-foreground text-sm mt-2.5">{i + 1}.</span>
                  <Input
                    value={obj.text}
                    onChange={e => updateObjective(obj.id, e.target.value)}
                    placeholder="e.g., Master Newton's three laws of motion"
                    className="bg-slate-900/50 border-slate-700 flex-1"
                  />
                  {objectives.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeObjective(obj.id)}
                      className="text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {objectives.length < 3 && (
              <Button variant="outline" size="sm" onClick={addObjective} className="mt-2">
                <Plus className="w-4 h-4 mr-1" /> Add objective
              </Button>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Select sources</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Agents use the sources attached to this planet as context for helping you learn.
              </p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Checkbox
                id="use-all"
                checked={useAllSources}
                onCheckedChange={(checked) => {
                  setUseAllSources(!!checked);
                  if (checked) setSelectedSourceIds([]);
                }}
              />
              <label htmlFor="use-all" className="text-sm text-foreground cursor-pointer">
                Use all sources on this planet
              </label>
            </div>
            {!useAllSources && (
              <div className="space-y-2">
                {sources.map(source => (
                  <button
                    key={source.id}
                    onClick={() => toggleSourceSelection(source.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                      selectedSourceIds.includes(source.id)
                        ? 'border-2 bg-slate-800/50'
                        : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                    }`}
                    style={{
                      borderColor: selectedSourceIds.includes(source.id) ? planetColor : undefined,
                    }}
                  >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      selectedSourceIds.includes(source.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                    }`}>
                      {selectedSourceIds.includes(source.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{source.title}</div>
                      <div className="text-xs text-muted-foreground">{source.type}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">AI Guardrails</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Set boundaries for how this agent should behave.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { key: 'dontGiveFullAnswers', label: "Don't give full answers immediately" },
                { key: 'askWhatKnown', label: 'Ask what I already know before explaining' },
                { key: 'stayWithinSources', label: 'Stay within the selected sources' },
                { key: 'keepConcise', label: 'Keep responses concise' },
              ].map(item => (
                <div key={item.key} className="flex items-center gap-3">
                  <Checkbox
                    id={item.key}
                    checked={guardrails[item.key as keyof typeof guardrails] as boolean}
                    onCheckedChange={(checked) => 
                      setGuardrails(prev => ({ ...prev, [item.key]: !!checked }))
                    }
                  />
                  <label htmlFor={item.key} className="text-sm text-foreground cursor-pointer">
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <label className="text-sm text-foreground block mb-2">
                Things this agent should avoid or never do:
              </label>
              <Textarea
                value={guardrails.customAvoid}
                onChange={e => setGuardrails(prev => ({ ...prev, customAvoid: e.target.value }))}
                placeholder="e.g., Don't solve homework problems directly..."
                className="bg-slate-900/50 border-slate-700 min-h-[80px]"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-2">Scaffolding level</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Determine how much support the agent should give you.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { level: 'light' as ScaffoldingLevel, title: 'Light support', desc: 'More questions, less step-by-step instruction' },
                { level: 'medium' as ScaffoldingLevel, title: 'Medium support', desc: 'Balanced guidance and questioning' },
                { level: 'heavy' as ScaffoldingLevel, title: 'Heavy support', desc: 'More detailed guidance, examples, and breakdowns' },
              ].map(item => (
                <button
                  key={item.level}
                  onClick={() => setScaffoldingLevel(item.level)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    scaffoldingLevel === item.level
                      ? 'border-2 bg-slate-800/50'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                  }`}
                  style={{
                    borderColor: scaffoldingLevel === item.level ? planetColor : undefined,
                  }}
                >
                  <div className="font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        const template = agentTemplates.find(t => t.id === selectedTemplate);
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Review your agent</h3>
            <div className="space-y-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <div>
                <span className="text-muted-foreground text-sm">Name:</span>
                <div className="text-foreground font-medium">{agentName}</div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Type:</span>
                <div className="text-foreground flex items-center gap-2">
                  {template && <template.icon className="w-4 h-4" style={{ color: planetColor }} />}
                  {template?.name}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Learning objectives:</span>
                <ul className="list-disc list-inside text-foreground text-sm mt-1">
                  {objectives.filter(o => o.text.trim()).map(o => (
                    <li key={o.id}>{o.text}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Sources:</span>
                <div className="text-foreground text-sm">
                  {useAllSources 
                    ? 'All planet sources' 
                    : `${selectedSourceIds.length} selected`}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">Scaffolding:</span>
                <div className="text-foreground text-sm capitalize">{scaffoldingLevel} support</div>
              </div>
            </div>
          </div>
        );
    }
  };

  const stepTitles = [
    'Type & Name',
    'Objectives',
    'Sources',
    'Guardrails',
    'Scaffolding',
    'Review',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create new agent</DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-1 mb-4">
          {stepTitles.map((title, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  i + 1 <= step ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
                style={{ width: i === step - 1 ? '32px' : '16px' }}
              />
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground mb-2">
          Step {step} of 6: {stepTitles[step - 1]}
        </div>

        <div className="min-h-[320px]">
          {renderStep()}
        </div>

        <div className="flex justify-between pt-4 border-t border-slate-800">
          <Button
            variant="ghost"
            onClick={() => step > 1 ? setStep((step - 1) as Step) : handleClose()}
            className="text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step > 1 ? 'Back' : 'Cancel'}
          </Button>
          {step < 6 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!canProceed()}
              style={{ backgroundColor: canProceed() ? planetColor : undefined }}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              style={{ backgroundColor: planetColor }}
            >
              Create agent
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
