import { el, text, clear } from './dom.js';
import { computeStageStatus, prerequisitesMet, STATUS_LABEL } from '../state.js';

const STATUS_BADGE_CHAR = {
  not_started: '·',
  in_progress: '…',
  needs_review: '!',
  revising: '↻',
  paused: '‖',
  complete: '✓',
};

const GROUPS = [
  { label: 'Orientation', ids: ['orientation'] },
  { label: 'Governance', ids: ['capstone', 'capstone-ratification', 'roadmap', 'source-of-truth', 'rulebook', 'roles', 'forms'] },
  { label: 'Bootstrap & first checkpoint', ids: ['bootstrap', 'orchestrator-init', 'first-execution', 'return-disposition'] },
  { label: 'Scale', ids: ['scaling'] },
];

export function renderJourneyMap(container, stages, currentStageId, onNavigate) {
  clear(container);

  const total = stages.length;
  const completeCount = stages.filter((s) => computeStageStatus(s) === 'complete').length;
  const progress = el('div', { class: 'journey-progress' }, [
    el('div', { class: 'journey-progress__track' }, [
      el('div', { class: 'journey-progress__fill', style: `width:${Math.round((completeCount / total) * 100)}%` }),
    ]),
    text('p', `${completeCount} of ${total} stages complete`, { class: 'journey-progress__label' }),
  ]);
  container.appendChild(progress);

  const list = el('ul', { class: 'journey-list' });

  for (const group of GROUPS) {
    const groupStages = group.ids.map((id) => stages.find((s) => s.id === id)).filter(Boolean);
    if (!groupStages.length) continue;
    list.appendChild(el('li', { class: 'journey-list__group-label', role: 'presentation' }, [group.label]));
    for (const stage of groupStages) {
      const status = computeStageStatus(stage);
      const unlocked = prerequisitesMet(stage, stages);
      // Locked stages stay fully operable — visiting one shows which prerequisites are
      // missing, with links straight to them — so this deliberately does not set
      // aria-disabled: that would tell assistive tech the link is inert when it isn't. The
      // "Complete earlier stages first" text below is read as part of the link's own content.
      const link = el('a', {
        href: `#/stage/${stage.id}`,
        class: 'journey-link',
        dataset: { status },
        'aria-current': stage.id === currentStageId ? 'page' : null,
        onClick: (e) => {
          e.preventDefault();
          onNavigate(stage.id);
        },
      }, [
        el('span', { class: 'journey-link__badge', 'aria-hidden': 'true' }, [STATUS_BADGE_CHAR[status]]),
        el('span', {}, [
          `${stage.number}. ${stage.title}`,
          // Status and lock state are reported together rather than one replacing the other:
          // showing only "Complete earlier stages first" next to a ✓ badge read as a
          // contradiction, and colour alone must never be the carrier of either fact.
          text('span', STATUS_LABEL[status] + (unlocked ? '' : ' · complete earlier stages first'), { class: 'journey-link__meta' }),
        ]),
      ]);
      list.appendChild(el('li', {}, [link]));
    }
  }

  container.appendChild(list);
}
