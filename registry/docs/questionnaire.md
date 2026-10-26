---
name: questionnaire
title: Questionnaire
type: ui
surface: both
description: "A short set of questions asked one at a time, with choice cards, number or letter shortcuts, progress and one native form submit."
use_for: "Use for onboarding or feedback: what you are building, which APIs you need, how many calls a month. Give Questionnaire the items (name, required, multiple), then a QuestionnaireItem per question with QuestionnaireTitle, QuestionnaireDescription, QuestionnaireChoices of QuestionnaireChoice (and QuestionnaireInput for another answer) and QuestionnaireError, and QuestionnaireActions with Previous, Skip, Next and Submit. The answers submit as FormData."
never: [More than one question on screen, Animating between questions, Choices without a visible label]
source: "Extrapolated from context-dashboard c0ddf7a src/components/shell/support-chat.tsx (quick topics) and src/components/ui/form.tsx"
---
