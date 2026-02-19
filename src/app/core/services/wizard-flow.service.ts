import { Injectable, signal, computed } from '@angular/core';

/**
 * WizardStep represents each numbered step in the character creation wizard.
 * Each entry includes the route key, display label and whether it requires the
 * action bar (footer "PROCEED" button).
 */
export interface WizardStep {
  index: number;
  key: string;
  label: string;
  actionLabel: string;
  hasActionBar: boolean;
}

export const WIZARD_STEPS: WizardStep[] = [
  { index: 1,  key: 'identity',     label: 'IDENTITY',   actionLabel: 'PROCEED > SPECIES',    hasActionBar: true },
  { index: 2,  key: 'species',      label: 'SPECIES',    actionLabel: 'PROCEED > BIOMETRICS', hasActionBar: true },
  { index: 3,  key: 'attributes',   label: 'BIOMETRICS', actionLabel: 'PROCEED > ORIGIN',     hasActionBar: true },
  { index: 4,  key: 'origin',       label: 'ORIGIN',     actionLabel: 'PROCEED > EDUCATION',  hasActionBar: true },
  { index: 5,  key: 'education',    label: 'EDUCATION',  actionLabel: 'PROCEED > CAREER',     hasActionBar: true },
  { index: 6,  key: 'career',       label: 'CAREER',     actionLabel: 'PROCEED > MUSTER_OUT', hasActionBar: true },
  { index: 7,  key: 'mustering',    label: 'MUSTER',     actionLabel: 'PROCEED > NETWORK',    hasActionBar: true },
  { index: 8,  key: 'npc',          label: 'NETWORK',    actionLabel: 'PROCEED > PACKAGE',    hasActionBar: true },
  { index: 9,  key: 'skillPackage', label: 'PACKAGE',    actionLabel: 'FINALIZE_CHARACTER',   hasActionBar: true },
  { index: 10, key: 'sheet',        label: 'FINALIZE',   actionLabel: '',                     hasActionBar: false },
];

/**
 * WizardFlowService centralises all wizard navigation and step-validation logic.
 *
 * Responsibilities:
 *  - Tracks the current step (signal).
 *  - Exposes computed derivations (current step metadata, progress).
 *  - Provides `advance()`, `goTo()`, `reset()` navigation primitives.
 *  - Maintains a validation-callback registry so each step component can
 *    register its own `canProceed` predicate without coupling to the wizard.
 */
@Injectable({ providedIn: 'root' })
export class WizardFlowService {
  /** 1-based current step index */
  readonly currentStepIndex = signal<number>(1);

  /** Total number of wizard steps */
  readonly totalSteps = WIZARD_STEPS.length;

  /** Metadata for the active step */
  readonly currentStep = computed(() =>
    WIZARD_STEPS.find(s => s.index === this.currentStepIndex()) ?? WIZARD_STEPS[0]
  );

  /** Whether the sticky action bar should be shown */
  readonly showActionBar = computed(() => this.currentStep().hasActionBar);

  /** Label for the action button in the current step */
  readonly actionLabel = computed(() => this.currentStep().actionLabel);

  /** Percentage progress (for optional progress indicators) */
  readonly progressPercent = computed(() =>
    Math.round(((this.currentStepIndex() - 1) / (this.totalSteps - 1)) * 100)
  );

  /** Registry: stepIndex → canProceed predicate */
  private readonly validators = new Map<number, () => boolean>();

  /** Registry: stepIndex → finish action */
  private readonly finishActions = new Map<number, () => void>();

  /**
   * Registers a "can proceed" validator for a given step.
   * Step components call this in their constructor / ngOnInit.
   */
  registerValidator(stepIndex: number, validator: () => boolean): void {
    this.validators.set(stepIndex, validator);
  }

  /**
   * Registers the "finish" action for a given step.
   * Called when the user clicks the action button in the footer.
   */
  registerFinishAction(stepIndex: number, action: () => void): void {
    this.finishActions.set(stepIndex, action);
  }

  unregisterStep(stepIndex: number): void {
    this.validators.delete(stepIndex);
    this.finishActions.delete(stepIndex);
  }

  /** Whether the current step has completed validation */
  canProceed(): boolean {
    const validator = this.validators.get(this.currentStepIndex());
    return validator ? validator() : true;
  }

  /** Execute finish action for the current step (wizard footer button click) */
  executeFinish(): void {
    const action = this.finishActions.get(this.currentStepIndex());
    if (action) {
      action();
    }
  }

  /** Navigate to the next sequential step */
  advance(): void {
    const next = this.currentStepIndex() + 1;
    if (next <= this.totalSteps) {
      this.currentStepIndex.set(next);
      this.scrollToTop();
    }
  }

  /** Navigate to a specific step by index */
  goTo(stepIndex: number): void {
    if (stepIndex >= 1 && stepIndex <= this.totalSteps) {
      this.currentStepIndex.set(stepIndex);
      this.scrollToTop();
    }
  }

  /** Reset wizard back to step 1 */
  resetToStart(): void {
    this.validators.clear();
    this.finishActions.clear();
    this.currentStepIndex.set(1);
    this.scrollToTop();
  }

  private scrollToTop(): void {
    window.scrollTo(0, 0);
    const content = document.querySelector('.wizard-content');
    if (content) {
      content.scrollTop = 0;
    }
  }
}
