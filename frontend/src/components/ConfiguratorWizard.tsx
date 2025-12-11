import { useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Ruler, DollarSign, Palette, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Progress } from './ui/progress';
import { Card, CardContent } from './ui/card';

interface ConfiguratorWizardProps {
  onComplete: (config: ConfigurationData) => void;
  onBack: () => void;
}

export interface ConfigurationData {
  spaceWidth: number;
  spaceDepth: number;
  budget: number;
  purpose: string;
  style: string;
}

export function ConfiguratorWizard({ onComplete, onBack }: ConfiguratorWizardProps) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [config, setConfig] = useState<ConfigurationData>({
    spaceWidth: 120,
    spaceDepth: 60,
    budget: 5000,
    purpose: 'balanced',
    style: 'modern'
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Generate configuration
      setIsGenerating(true);
      setTimeout(() => {
        onComplete(config);
      }, 2500);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-amber-500" />
            <h2 className="mb-4">Generating Your Custom Plan</h2>
            <div className="space-y-2 text-neutral-600">
              <p className="animate-pulse">Analyzing space layout...</p>
              <p className="animate-pulse delay-100">Checking product compatibility...</p>
              <p className="animate-pulse delay-200">Optimizing ergonomic configuration...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={handlePrevious}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <span className="text-sm text-neutral-600">
              Step {step} / {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Card>
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Ruler className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2>Space & Budget</h2>
                    <p className="text-neutral-600">Tell us about your workspace dimensions and budget range</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Desk Width (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={config.spaceWidth}
                      onChange={(e) => setConfig({ ...config, spaceWidth: Number(e.target.value) })}
                      placeholder="e.g., 120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depth">Desk Depth (cm)</Label>
                    <Input
                      id="depth"
                      type="number"
                      value={config.spaceDepth}
                      onChange={(e) => setConfig({ ...config, spaceDepth: Number(e.target.value) })}
                      placeholder="e.g., 60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Total Budget (¥)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <Input
                      id="budget"
                      type="number"
                      value={config.budget}
                      onChange={(e) => setConfig({ ...config, budget: Number(e.target.value) })}
                      className="pl-10"
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <p className="text-sm text-neutral-500">
                    We will recommend the best solution within this budget
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2>Main Purpose</h2>
                    <p className="text-neutral-600">Choose the main scenario for your desk setup</p>
                  </div>
                </div>

                <RadioGroup
                  value={config.purpose}
                  onValueChange={(value) => setConfig({ ...config, purpose: value })}
                >
                  <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="work" id="work" />
                        <Label htmlFor="work" className="flex-1 cursor-pointer">
                          <div>
                            <div className="mb-1">Work Optimized</div>
                            <p className="text-sm text-neutral-600">
                              Focus on productivity, optimizing work efficiency and long-hour comfort
                            </p>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="gaming" id="gaming" />
                        <Label htmlFor="gaming" className="flex-1 cursor-pointer">
                          <div>
                            <div className="mb-1">Gaming Optimized</div>
                            <p className="text-sm text-neutral-600">
                              High-performance displays and peripherals for immersive gaming
                            </p>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="balanced" id="balanced" />
                        <Label htmlFor="balanced" className="flex-1 cursor-pointer">
                          <div>
                            <div className="mb-1">Balanced</div>
                            <p className="text-sm text-neutral-600">
                              Work and play combined, versatile desktop configuration
                            </p>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <RadioGroupItem value="creative" id="creative" />
                        <Label htmlFor="creative" className="flex-1 cursor-pointer">
                          <div>
                            <div className="mb-1">Creative Work</div>
                            <p className="text-sm text-neutral-600">
                              Design, video editing, optimizing color and space for creative work
                            </p>
                          </div>
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2>Style Preference</h2>
                    <p className="text-neutral-600">Choose your preferred desk setup style</p>
                  </div>
                </div>

                <RadioGroup
                  value={config.style}
                  onValueChange={(value) => setConfig({ ...config, style: value })}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <RadioGroupItem value="minimal" id="minimal" />
                          <Label htmlFor="minimal" className="cursor-pointer">
                            <div className="mb-1">Minimalist</div>
                            <p className="text-sm text-neutral-600">
                              Clean, pure, focused
                            </p>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <RadioGroupItem value="modern" id="modern" />
                          <Label htmlFor="modern" className="cursor-pointer">
                            <div className="mb-1">Modern</div>
                            <p className="text-sm text-neutral-600">
                              Fashionable, professional, efficient
                            </p>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <RadioGroupItem value="cyberpunk" id="cyberpunk" />
                          <Label htmlFor="cyberpunk" className="cursor-pointer">
                            <div className="mb-1">Cyberpunk</div>
                            <p className="text-sm text-neutral-600">
                              Tech-savvy, RGB, futuristic
                            </p>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <RadioGroupItem value="warm" id="warm" />
                          <Label htmlFor="warm" className="cursor-pointer">
                            <div className="mb-1">Warm & Cozy</div>
                            <p className="text-sm text-neutral-600">
                              Wood, natural, homey
                            </p>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <RadioGroupItem value="industrial" id="industrial" />
                          <Label htmlFor="industrial" className="cursor-pointer">
                            <div className="mb-1">Industrial</div>
                            <p className="text-sm text-neutral-600">
                              Metal, vintage, rugged
                            </p>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="cursor-pointer hover:border-amber-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <RadioGroupItem value="scandinavian" id="scandinavian" />
                          <Label htmlFor="scandinavian" className="cursor-pointer">
                            <div className="mb-1">Scandinavian</div>
                            <p className="text-sm text-neutral-600">
                              Bright, fresh, minimalist
                            </p>
                          </Label>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {step === 1 ? 'Back to Home' : 'Previous'}
              </Button>
              <Button onClick={handleNext} className="bg-amber-500 hover:bg-amber-600 text-neutral-900">
                {step === totalSteps ? 'Generate Plan' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
