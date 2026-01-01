import { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronRight, ChevronLeft, Check, Loader2, RefreshCw, Link2, FileText, StickyNote, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Agent,
  AgentTemplate,
  AgentGuardrails,
  LearningObjective,
  ScaffoldingLevel,
  agentTemplates,
  agentTemplatesByCategory,
  categoryLabels,
  ideaCards,
  GeneratedAgentSetup,
} from './types';
import { supabase } from '@/integrations/supabase/client';
import { usePlanetSources } from '@/hooks/usePlanetSources';
import { FileUpload } from '@/components/sources/FileUpload';
import { useAuth } from '@/hooks/useAuth';

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  onCreateAgent: (agent: Omit<Agent, 'id' | 'timesUsed' | 'uniqueUsers' | 'createdAt'>) => void;
  planetId: string;
  planetColor: string;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function CreateAgentModal({
  open,
  onClose,
  onCreateAgent,
  planetId,
  planetColor,
}: CreateAgentModalProps) {
  const { user } = useAuth();
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
  const [behaviorsEdited, setBehaviorsEdited] = useState(false);
  const [pendingLevelChange, setPendingLevelChange] = useState<ScaffoldingLevel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegeneratingBehaviors, setIsRegeneratingBehaviors] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  
  // Add source form state
  const [addSourceOpen, setAddSourceOpen] = useState(false);
  const [newSourceType, setNewSourceType] = useState<'link' | 'file' | 'text'>('link');
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceContent, setNewSourceContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Use the planet sources hook with realtime enabled when on step 3
  const { sources, loading: sourcesLoading, addSource } = usePlanetSources(
    open && step === 3 ? planetId : undefined, 
    { enableRealtime: true }
  );

  // Also fetch sources when modal opens (for other steps that might need it)
  const { sources: allSources } = usePlanetSources(open ? planetId : undefined);
  

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
    setBehaviorsEdited(false);
    setPendingLevelChange(null);
    setIsGenerating(false);
    setIsRegeneratingBehaviors(false);
    setHasGenerated(false);
    setAddSourceOpen(false);
    setNewSourceType('link');
    setNewSourceTitle('');
    setNewSourceContent('');
    setSubmitting(false);
  };

  const handleAddSourceSubmit = async () => {
    if (!newSourceTitle.trim()) return;
    
    setSubmitting(true);
    const result = await addSource(newSourceType, newSourceTitle, newSourceContent);
    setSubmitting(false);
    
    if (result) {
      setNewSourceTitle('');
      setNewSourceContent('');
      setNewSourceType('link');
      setAddSourceOpen(false);
    }
  };

  const handleFileUploadComplete = async (fileData: {
    title: string;
    url: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
  }) => {
    if (!user || !planetId) return;

    try {
      const sourceData = {
        planet_id: planetId,
        user_id: user.id,
        title: fileData.title,
        type: 'file' as const,
        url: fileData.url,
        file_name: fileData.file_name,
        mime_type: fileData.mime_type,
        size_bytes: fileData.size_bytes,
      };

      const { error } = await supabase
        .from('sources')
        .insert(sourceData);

      if (error) throw error;

      setAddSourceOpen(false);
      setNewSourceType('link');
      toast.success('File uploaded!');
    } catch (error) {
      console.error('Error saving file source:', error);
      toast.error('Failed to save file');
    }
  };

  // Generate behaviors based on scaffolding level
  const generateBehaviorsForLevel = async (level: ScaffoldingLevel) => {
    if (!selectedTemplate || !detailedDescription.trim()) return;
    
    setIsRegeneratingBehaviors(true);
    try {
      const templateInfo = agentTemplates.find(t => t.id === selectedTemplate);
      
      const { data, error } = await supabase.functions.invoke('generate-agent-setup', {
        body: {
          agentType: templateInfo?.name || selectedTemplate,
          agentName: agentName,
          description: detailedDescription,
          scaffoldingLevel: level,
        },
      });

      if (error) throw error;

      const setup = data as GeneratedAgentSetup;
      setScaffoldingBehaviors(setup.scaffolding.behaviors);
      setBehaviorsEdited(false);
      toast.success('Behaviors regenerated!');
    } catch (err) {
      console.error('Error regenerating behaviors:', err);
      toast.error('Failed to regenerate behaviors');
    } finally {
      setIsRegeneratingBehaviors(false);
    }
  };

  const handleScaffoldingLevelChange = (newLevel: ScaffoldingLevel) => {
    if (newLevel === scaffoldingLevel) return;
    
    if (behaviorsEdited && scaffoldingBehaviors.length > 0) {
      // User has edited behaviors, show confirmation
      setPendingLevelChange(newLevel);
    } else {
      // No edits, just change and regenerate
      setScaffoldingLevel(newLevel);
      generateBehaviorsForLevel(newLevel);
    }
  };

  const confirmLevelChange = () => {
    if (pendingLevelChange) {
      setScaffoldingLevel(pendingLevelChange);
      generateBehaviorsForLevel(pendingLevelChange);
      setPendingLevelChange(null);
    }
  };

  const cancelLevelChange = () => {
    setPendingLevelChange(null);
  };

  const updateBehavior = (index: number, text: string) => {
    setScaffoldingBehaviors(prev => prev.map((b, i) => i === index ? text : b));
    setBehaviorsEdited(true);
  };

  const removeBehavior = (index: number) => {
    setScaffoldingBehaviors(prev => prev.filter((_, i) => i !== index));
    setBehaviorsEdited(true);
  };

  const addBehavior = () => {
    setScaffoldingBehaviors(prev => [...prev, '']);
    setBehaviorsEdited(true);
  };

  const typeIcons = {
    link: Link2,
    file: FileText,
    text: StickyNote,
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
        // Allow proceeding if: using all sources, has selected sources, or there are no sources
        return useAllSources || selectedSourceIds.length > 0 || sources.length === 0;
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
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-foreground mb-2">Select sources</h3>
                <p className="text-sm text-muted-foreground">
                  Agents use the sources attached to this planet as context for helping you learn.
                </p>
              </div>
              <a 
                href={`/planets/${encodeURIComponent(planetId)}/sources`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 shrink-0"
              >
                Manage sources <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Use all sources toggle */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
              <Checkbox
                id="use-all"
                checked={useAllSources}
                onCheckedChange={(checked) => {
                  setUseAllSources(!!checked);
                  if (checked) setSelectedSourceIds([]);
                }}
              />
              <label htmlFor="use-all" className="text-sm text-foreground cursor-pointer flex-1">
                Use all sources on this planet
              </label>
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground italic">
              {useAllSources 
                ? "This agent will use everything attached to this planet."
                : "This agent will only use the sources you choose."}
            </p>

            {/* Source list or empty state */}
            {sourcesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : sources.length === 0 ? (
              <div className="text-center py-8 bg-slate-900/30 rounded-lg border border-slate-800">
                <p className="text-muted-foreground text-sm mb-3">No sources on this planet yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAddSourceOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Add source
                </Button>
              </div>
            ) : (
              <>
                {!useAllSources && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto overflow-x-hidden pr-1">
                    {sources.map(source => {
                      const IconComponent = typeIcons[source.type];
                      return (
                        <TooltipProvider key={source.id}>
                          <Tooltip delayDuration={300}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleSourceSelection(source.id)}
                                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 min-w-0 ${
                                  selectedSourceIds.includes(source.id)
                                    ? 'border-2 bg-slate-800/50'
                                    : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                                }`}
                                style={{
                                  borderColor: selectedSourceIds.includes(source.id) ? planetColor : undefined,
                                }}
                              >
                                <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${
                                  selectedSourceIds.includes(source.id) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                                }`}>
                                  {selectedSourceIds.includes(source.id) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0 overflow-hidden">
                                  <div className="font-medium text-foreground text-sm truncate whitespace-nowrap overflow-hidden text-ellipsis">{source.title}</div>
                                </div>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs break-words">
                              <p>{source.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                )}

                {/* Add source button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAddSourceOpen(true)}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add source
                </Button>
              </>
            )}

            {/* Add source dialog */}
            {addSourceOpen && (
              <div className="p-4 rounded-lg border border-slate-700 bg-slate-900/70 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Add new source</h4>
                  <Button variant="ghost" size="icon" onClick={() => setAddSourceOpen(false)} className="h-6 w-6">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs value={newSourceType} onValueChange={(v) => setNewSourceType(v as 'link' | 'file' | 'text')}>
                  <TabsList className="bg-slate-800/50 h-8">
                    <TabsTrigger value="link" className="text-xs h-7 px-3">
                      <Link2 className="w-3 h-3 mr-1" /> Link
                    </TabsTrigger>
                    <TabsTrigger value="file" className="text-xs h-7 px-3">
                      <FileText className="w-3 h-3 mr-1" /> File
                    </TabsTrigger>
                    <TabsTrigger value="text" className="text-xs h-7 px-3">
                      <StickyNote className="w-3 h-3 mr-1" /> Note
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {newSourceType !== 'file' && (
                  <Input
                    placeholder="Title"
                    value={newSourceTitle}
                    onChange={(e) => setNewSourceTitle(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 h-8 text-sm"
                  />
                )}

                {newSourceType === 'link' && (
                  <Input
                    placeholder="https://..."
                    value={newSourceContent}
                    onChange={(e) => setNewSourceContent(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 h-8 text-sm"
                  />
                )}

                {newSourceType === 'text' && (
                  <Textarea
                    placeholder="Enter your notes..."
                    value={newSourceContent}
                    onChange={(e) => setNewSourceContent(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 min-h-[80px] text-sm"
                  />
                )}

                {newSourceType === 'file' && (
                  <FileUpload
                    planetId={planetId}
                    onUploadComplete={handleFileUploadComplete}
                    onCancel={() => setAddSourceOpen(false)}
                    planetColor={planetColor}
                  />
                )}

                {newSourceType !== 'file' && (
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setAddSourceOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleAddSourceSubmit}
                      disabled={!newSourceTitle.trim() || submitting}
                      style={{ backgroundColor: planetColor }}
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                )}
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
              {scaffoldingBehaviors.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generateBehaviorsForLevel(scaffoldingLevel)}
                  disabled={isRegeneratingBehaviors}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isRegeneratingBehaviors ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3 mr-1" />
                  )}
                  Regenerate behaviors
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
                  onClick={() => handleScaffoldingLevelChange(item.level)}
                  disabled={isRegeneratingBehaviors}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    scaffoldingLevel === item.level
                      ? 'border-2 bg-slate-800/50'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                  } ${isRegeneratingBehaviors ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    borderColor: scaffoldingLevel === item.level ? planetColor : undefined,
                  }}
                >
                  <div className="font-medium text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
                </button>
              ))}
            </div>

            {/* Editable behaviors list */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-foreground">Behaviors</div>
                {behaviorsEdited && (
                  <span className="text-xs text-muted-foreground">(edited)</span>
                )}
              </div>
              
              {isRegeneratingBehaviors ? (
                <div className="flex items-center justify-center py-8 bg-slate-900/30 rounded-lg border border-slate-800">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : scaffoldingBehaviors.length === 0 ? (
                <div className="text-center py-6 bg-slate-900/30 rounded-lg border border-slate-800">
                  <p className="text-sm text-muted-foreground mb-2">No behaviors yet</p>
                  <Button variant="outline" size="sm" onClick={addBehavior}>
                    <Plus className="w-4 h-4 mr-1" /> Add behavior
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {scaffoldingBehaviors.map((behavior, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={behavior}
                        onChange={(e) => updateBehavior(i, e.target.value)}
                        placeholder="Describe a behavior..."
                        className="bg-slate-900/50 border-slate-700 flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBehavior(i)}
                        className="shrink-0 text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {scaffoldingBehaviors.length < 7 && (
                    <Button variant="outline" size="sm" onClick={addBehavior} className="mt-2">
                      <Plus className="w-4 h-4 mr-1" /> Add behavior
                    </Button>
                  )}
                </div>
              )}
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
  <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[min(720px,92vw)] max-w-[92vw] bg-slate-950 border-slate-800 max-h-[90vh] overflow-y-auto overflow-x-hidden">
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

    {/* Confirmation dialog for level change when behaviors edited */}
    <AlertDialog open={!!pendingLevelChange} onOpenChange={() => setPendingLevelChange(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Replace behaviors?</AlertDialogTitle>
          <AlertDialogDescription>
            Changing support level will regenerate behaviors. Your current edits will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={cancelLevelChange}>Keep my edits</AlertDialogCancel>
          <AlertDialogAction onClick={confirmLevelChange} style={{ backgroundColor: planetColor }}>
            Replace behaviors
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
