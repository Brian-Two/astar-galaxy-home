import { useState } from 'react';
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Check, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Agent,
  AgentTemplate,
  AgentGuardrails,
  LearningObjective,
  ScaffoldingLevel,
  agentTemplates,
  agentTemplatesByCategory,
  categoryLabels,
  PlanetSource,
  ideaCards,
  GeneratedAgentSetup,
} from './types';
import { supabase } from '@/integrations/supabase/client';

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
  const [shortDescription, setShortDescription] = useState('');
  const [detailedDescription, setDetailedDescription] = useState('');
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
  const [scaffoldingBehaviors, setScaffoldingBehaviors] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  

  const resetForm = () => {
    setStep(1);
    setSelectedTemplate(null);
    setAgentName('');
    setShortDescription('');
    setDetailedDescription('');
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
    setScaffoldingBehaviors([]);
    setIsGenerating(false);
    setHasGenerated(false);
    
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTemplate && agentName.trim() && detailedDescription.trim();
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

  // Auto-generate when moving from step 1 to step 2
  const handleNextFromStep1 = async () => {
    if (!selectedTemplate || !agentName.trim() || !detailedDescription.trim()) return;
    
    setIsGenerating(true);
    try {
      const templateInfo = agentTemplates.find(t => t.id === selectedTemplate);
      
      const { data, error } = await supabase.functions.invoke('generate-agent-setup', {
        body: {
          agentType: templateInfo?.name || selectedTemplate,
          agentName: agentName,
          description: detailedDescription,
        },
      });

      if (error) throw error;

      const setup = data as GeneratedAgentSetup;
      
      setObjectives(
        setup.learning_objectives.map((text, i) => ({
          id: String(Date.now() + i),
          text,
          showToOthers: true,
        }))
      );
      
      setGuardrails({
        dontGiveFullAnswers: setup.guardrails.dont_give_full_answers_immediately,
        askWhatKnown: setup.guardrails.ask_what_i_know_first,
        stayWithinSources: setup.guardrails.stay_within_selected_sources,
        keepConcise: setup.guardrails.keep_responses_concise,
        customAvoid: setup.guardrails.avoid_or_never_do.join('\n'),
      });
      
      setScaffoldingLevel(setup.scaffolding.level);
      setScaffoldingBehaviors(setup.scaffolding.behaviors);
      setHasGenerated(true);
      setStep(2);
    } catch (err) {
      console.error('Generation error:', err);
      toast.error('Failed to generate setup. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = () => {
    if (!selectedTemplate) return;
    const template = agentTemplates.find(t => t.id === selectedTemplate);
    
    onCreateAgent({
      name: agentName,
      template: selectedTemplate,
      description: shortDescription || template?.description || '',
      learningObjectives: objectives.filter(o => o.text.trim()),
      selectedSourceIds,
      useAllSources,
      guardrails,
      scaffoldingLevel,
      scaffoldingBehaviors,
      planetId,
    });
    handleClose();
  };

  const addObjective = () => {
    if (objectives.length < 6) {
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

  const handleIdeaCardClick = (ideaCard: typeof ideaCards[0]) => {
    setSelectedTemplate(ideaCard.template);
    setAgentName(ideaCard.title);
    setDetailedDescription(ideaCard.description);
  };

  const handleRegenerate = async () => {
    if (!selectedTemplate || !agentName.trim() || !detailedDescription.trim()) return;
    
    setIsGenerating(true);
    try {
      const templateInfo = agentTemplates.find(t => t.id === selectedTemplate);
      
      const { data, error } = await supabase.functions.invoke('generate-agent-setup', {
        body: {
          agentType: templateInfo?.name || selectedTemplate,
          agentName: agentName,
          description: detailedDescription,
        },
      });

      if (error) throw error;

      const setup = data as GeneratedAgentSetup;
      
      setObjectives(
        setup.learning_objectives.map((text, i) => ({
          id: String(Date.now() + i),
          text,
          showToOthers: true,
        }))
      );
      
      setGuardrails({
        dontGiveFullAnswers: setup.guardrails.dont_give_full_answers_immediately,
        askWhatKnown: setup.guardrails.ask_what_i_know_first,
        stayWithinSources: setup.guardrails.stay_within_selected_sources,
        keepConcise: setup.guardrails.keep_responses_concise,
        customAvoid: setup.guardrails.avoid_or_never_do.join('\n'),
      });
      
      setScaffoldingLevel(setup.scaffolding.level);
      setScaffoldingBehaviors(setup.scaffolding.behaviors);
      toast.success('Setup regenerated!');
    } catch (err) {
      console.error('Regeneration error:', err);
      toast.error('Failed to regenerate setup. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-5">
            {/* Agent Type Dropdown */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Agent type</label>
              <Select
                value={selectedTemplate || ''}
                onValueChange={(value) => setSelectedTemplate(value as AgentTemplate)}
              >
                <SelectTrigger className="bg-slate-900/50 border-slate-700">
                  <SelectValue placeholder="Select an agent type..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700">
                  {(Object.keys(agentTemplatesByCategory) as Array<keyof typeof agentTemplatesByCategory>).map((category) => (
                    <SelectGroup key={category}>
                      <SelectLabel className="text-muted-foreground font-semibold">{categoryLabels[category]}</SelectLabel>
                      {agentTemplatesByCategory[category].map((template) => {
                        const IconComponent = template.icon;
                        return (
                          <SelectItem key={template.id} value={template.id} className="cursor-pointer">
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-4 h-4" style={{ color: planetColor }} />
                              <span>{template.name}</span>
                              <span className="text-muted-foreground text-xs ml-1">– {template.description}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent Name */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Name your agent</label>
              <Input
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                placeholder="e.g., Physics Quiz Master"
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            {/* Short Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Short description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                placeholder="e.g., Helps me master forces and motion"
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Describe what you want this agent to do</label>
              <Textarea
                value={detailedDescription}
                onChange={e => setDetailedDescription(e.target.value)}
                placeholder="Help me learn MIPS by asking me questions, generating practice problems, and only giving hints until I try…"
                className="bg-slate-900/50 border-slate-700 min-h-[100px]"
              />
            </div>


            {/* Idea Cards */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Ideas</h4>
              <div className="grid grid-cols-2 gap-2">
                {ideaCards.map((idea) => (
                  <button
                    key={idea.id}
                    onClick={() => handleIdeaCardClick(idea)}
                    disabled={isGenerating}
                    className="p-3 rounded-lg border border-slate-700 bg-slate-900/30 hover:bg-slate-800/50 hover:border-slate-600 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-sm font-medium text-foreground group-hover:text-white transition-colors">{idea.title}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Learning objectives</h3>
                <p className="text-sm text-muted-foreground">
                  Define what this agent should help you achieve. These objectives will be used later to award stars when you hit them.
                </p>
              </div>
              {hasGenerated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              )}
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
            {objectives.length < 6 && (
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">AI Guardrails</h3>
                <p className="text-sm text-muted-foreground">
                  Set boundaries for how this agent should behave.
                </p>
              </div>
              {hasGenerated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              )}
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Scaffolding level</h3>
                <p className="text-sm text-muted-foreground">
                  Determine how much support the agent should give you.
                </p>
              </div>
              {hasGenerated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerate}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              )}
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
            {scaffoldingBehaviors.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-900/30 border border-slate-800 mt-4">
                <div className="text-xs text-muted-foreground mb-2">Generated behaviors</div>
                <div className="space-y-1">
                  {scaffoldingBehaviors.map((behavior, i) => (
                    <div key={i} className="text-sm text-foreground">• {behavior}</div>
                  ))}
                </div>
              </div>
            )}
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
                {scaffoldingBehaviors.length > 0 && (
                  <ul className="list-disc list-inside text-muted-foreground text-xs mt-1">
                    {scaffoldingBehaviors.slice(0, 3).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  const stepTitles = [
    'Describe Agent',
    'Objectives',
    'Sources',
    'Guardrails',
    'Scaffolding',
    'Review',
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-slate-950 border-slate-800 max-h-[90vh] overflow-y-auto">
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
                style={{ 
                  width: i === step - 1 ? '32px' : '16px',
                  backgroundColor: i + 1 <= step ? planetColor : undefined,
                }}
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
              onClick={() => step === 1 ? handleNextFromStep1() : setStep((step + 1) as Step)}
              disabled={!canProceed() || (step === 1 && isGenerating)}
              style={{ backgroundColor: canProceed() ? planetColor : undefined }}
            >
              {step === 1 && isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
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
