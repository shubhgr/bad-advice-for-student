"use client";

import { FormEvent, useState } from "react";
import {
  BOLLYWOOD_CHARACTERS,
  AREA_TO_EXPLORE_OPTIONS,
  STUDENT_CRIME_OPTIONS,
  STUDENT_STAGE_OPTIONS,
  SUPERPOWER_OPTIONS,
  type ChoiceOption,
} from "@/data/questionnaire";
import { EMPTY_RESPONSES, UserResponses } from "@/lib/types";
import StepProgress from "@/components/StepProgress";

interface QuestionnaireProps {
  onSubmit: (responses: UserResponses) => void;
}

type FieldKey = keyof UserResponses;

type StepConfig =
  | {
      kind: "text";
      field: FieldKey;
      label: string;
      placeholder: string;
    }
  | {
      kind: "choice";
      field: FieldKey;
      label: string;
      options: string[] | ChoiceOption[];
      layout?: "stack" | "grid2";
    }
  | {
      kind: "image-choice";
      field: "bollywoodCharacter";
      label: string;
    };

const STEPS: StepConfig[] = [
  {
    kind: "text",
    field: "name",
    label: "Drop your name. We need someone to blame.",
    placeholder: "Your name",
  },
  {
    kind: "choice",
    field: "studentStage",
    label: "Okay, where are you currently fighting for your life?",
    options: STUDENT_STAGE_OPTIONS,
    layout: "grid2",
  },
  {
    kind: "image-choice",
    field: "bollywoodCharacter",
    label: "Pick the character you unfortunately (or fortunately) relate to.",
  },
  {
    kind: "choice",
    field: "superpower",
    label: "If college gave you ONE unfair advantage, what are you stealing?",
    options: SUPERPOWER_OPTIONS,
    layout: "grid2",
  },
  {
    kind: "choice",
    field: "studentCrime",
    label: "Which academically questionable decision sounds most like you?",
    options: STUDENT_CRIME_OPTIONS,
    layout: "grid2",
  },
  {
    kind: "choice",
    field: "areaToExplore",
    label: "Pick the field that gives your brain cells a little dopamine hit.",
    options: AREA_TO_EXPLORE_OPTIONS,
  },
];

function normalizeOptions(options: string[] | ChoiceOption[]): ChoiceOption[] {
  return options.map((option) =>
    typeof option === "string"
      ? { value: option, title: option }
      : option
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="btn-outline questionnaire-back"
      aria-label="Back"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export default function Questionnaire({ onSubmit }: QuestionnaireProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [responses, setResponses] = useState<UserResponses>(EMPTY_RESPONSES);

  const currentStep = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const isLastStep = stepIndex === totalSteps - 1;

  function updateField(field: FieldKey, value: string) {
    setResponses((prev) => ({ ...prev, [field]: value }));
  }

  function canProceed(): boolean {
    if (currentStep.kind === "text") {
      return responses[currentStep.field].trim().length > 0;
    }
    return true;
  }

  function handleNext() {
    if (!canProceed()) return;

    if (isLastStep) {
      onSubmit(responses);
      return;
    }

    setStepIndex((prev) => prev + 1);
  }

  function handleBack() {
    if (stepIndex > 0) setStepIndex((prev) => prev - 1);
  }

  function handleTextSubmit(e: FormEvent) {
    e.preventDefault();
    handleNext();
  }

  function handleChoiceSelect(field: FieldKey, value: string) {
    updateField(field, value);
    if (isLastStep) {
      onSubmit({ ...responses, [field]: value });
      return;
    }
    setStepIndex((prev) => prev + 1);
  }

  return (
    <div className="questionnaire-layout animate-fade-in">
      <div className="questionnaire-progress">
        <StepProgress total={totalSteps} current={stepIndex} />
      </div>

      <div className="questionnaire-body">
        <div
          className={`relative flex w-full flex-col ${
            currentStep.kind === "image-choice"
              ? "character-question-layout"
              : "gap-6"
          }`}
        >
          {stepIndex > 0 && <BackButton onBack={handleBack} />}

          <h2 className="text-xl font-bold leading-snug text-white">
            {currentStep.label}
          </h2>

          {currentStep.kind === "text" && (
            <form onSubmit={handleTextSubmit} className="flex flex-col gap-5">
              <input
                type="text"
                value={responses[currentStep.field]}
                onChange={(e) => updateField(currentStep.field, e.target.value)}
                placeholder={currentStep.placeholder}
                className="input-field"
                autoFocus
              />
              <StepActions
                canProceed={canProceed()}
                isFinal={isLastStep}
                onNext={handleNext}
              />
            </form>
          )}

          {currentStep.kind === "choice" && (
            <div className="option-step">
              <div
                className={`option-grid ${
                  currentStep.layout === "grid2"
                    ? "option-grid-2"
                    : "area-category-grid"
                }`}
              >
                {normalizeOptions(currentStep.options).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleChoiceSelect(currentStep.field, option.value)
                    }
                    className={`option-button ${
                      currentStep.layout === "grid2"
                        ? "option-tile"
                        : "area-category-button"
                    }`}
                  >
                    <span className="option-tile-title">{option.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep.kind === "image-choice" && (
            <div className="character-step">
              <div className="character-grid">
                {BOLLYWOOD_CHARACTERS.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() =>
                      handleChoiceSelect(
                        "bollywoodCharacter",
                        `${character.name} (${character.personalityTrait})`
                      )
                    }
                    className="character-card"
                    aria-label={`${character.name}, ${character.personalityTrait}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={character.image}
                      alt=""
                      className="character-card-image"
                      aria-hidden="true"
                      draggable={false}
                    />
                    <span className="character-card-footer">
                      <span className="character-card-name">
                        {character.name}
                      </span>
                      <span className="character-card-trait">
                        {character.personalityTrait}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepActions({
  canProceed,
  isFinal,
  onNext,
}: {
  canProceed: boolean;
  isFinal: boolean;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {isFinal ? (
        <button type="button" onClick={onNext} className="btn-accent">
          Give Me Advice
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="btn-primary disabled:opacity-60"
        >
          Next
        </button>
      )}
    </div>
  );
}
