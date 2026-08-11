import { el, text, clear, toast } from './dom.js';
import { renderQuestion, questionVisible } from './questions.js';
import { store, computeStageStatus, prerequisitesMet, snapshotPrereqs, STATUS_LABEL } from '../state.js';
import { compilePrompt, buildPromptCtx } from '../compiler.js';
import { findUnresolvedTokens, missingRequiredAnswers } from '../lib/schema.js';

/**
 * Renders the full stage screen: header, prerequisite gate, workspace-agent gate,
 * questionnaire, prompt panel (with mode switch, copy/download), recovery prompts,
 * advanced "how to do this yourself" accordion, and the completion gate.
 */
export function renderStage(container, stage, allStages, nav) {
  clear(container);

  const status = computeStageStatus(stage);
  const unlocked = prerequisitesMet(stage, allStages);

  container.appendChild(renderHeader(stage, allStages, status));

  if (!unlocked) {
    container.appendChild(renderPrereqGate(stage, allStages, nav));
    return;
  }

  if (stage.requiresWorkspaceAgent && orientationSaysNoAgent()) {
    container.appendChild(renderWorkspaceGate(nav));
    return;
  }

  if (status === 'needs_review') {
    container.appendChild(el('div', { class: 'banner banner--warning', role: 'status' }, [
      'An earlier stage changed since you completed this one. Review your answers below — the ',
      'generated prompt now reflects the updated context, and you will need to re-confirm the ',
      'completion checklist at the bottom.',
    ]));
  } else if (status === 'revising') {
    container.appendChild(el('div', { class: 'banner banner--warning', role: 'status' }, [
      'You marked this stage as needing revision, so it is not complete and the next stage stays ',
      'locked. Redirect your agent, then come back and record a new disposition below.',
    ]));
  } else if (status === 'paused') {
    container.appendChild(el('div', { class: 'banner banner--info', role: 'status' }, [
      'You paused the journey here. Nothing is lost — when you are ready, record a new ',
      'disposition below to continue.',
    ]));
  }

  // A single mutable hook lets the form column trigger a live prompt recompile without the two
  // columns needing to fully re-render each other — that would blow away focus mid-keystroke.
  let refreshPrompt = () => {};
  const onAnswerChanged = () => { refreshPrompt(); nav.onAnswersChanged(); };

  const grid = el('div', { class: 'stage-grid stage-grid--split' });
  grid.appendChild(renderFormColumn(stage, onAnswerChanged));
  const { el: promptColEl, refresh } = renderPromptColumn(stage);
  refreshPrompt = refresh;
  grid.appendChild(promptColEl);
  container.appendChild(grid);

  container.appendChild(renderRecoverySection(stage));
  container.appendChild(renderAdvancedSection(stage));
  container.appendChild(renderCompletionGate(stage, allStages, nav));
  container.appendChild(renderStageNav(stage, allStages, nav));
}

// "chat" counts as no workspace agent, not just "none": a chat-only assistant is by the
// Orientation option's own definition one that "cannot yet read or edit your project's files",
// and every stage from Capstone on asks its agent to inspect the repository directly.
function orientationSaysNoAgent() {
  const a = store.getAnswers('orientation');
  return a.agentCapability === 'none' || a.agentCapability === 'chat';
}

function renderHeader(stage, allStages, status) {
  const header = el('div', { class: 'stage-header' });
  header.appendChild(el('div', { class: 'stage-kicker' }, [
    `Stage ${stage.number} of ${allStages.length}`,
    el('span', { class: 'badge' }, [STATUS_LABEL[status]]),
  ]));
  header.appendChild(text('h1', stage.title));
  header.appendChild(text('p', stage.purpose, { class: 'stage-purpose' }));

  const facts = el('dl', { class: 'stage-facts' });
  facts.appendChild(text('dt', 'What the external agent will produce'));
  facts.appendChild(text('dd', stage.agentProduces));
  if (stage.prerequisites.length) {
    facts.appendChild(text('dt', 'Prerequisites'));
    facts.appendChild(text('dd', stage.prerequisites
      .map((id) => allStages.find((s) => s.id === id)?.title || id).join(', ')));
  }
  header.appendChild(facts);
  return header;
}

function renderPrereqGate(stage, allStages, nav) {
  const missing = stage.prerequisites
    .map((id) => allStages.find((s) => s.id === id))
    .filter((s) => s && computeStageStatus(s) !== 'complete');
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(text('p', 'Complete the following stage' + (missing.length > 1 ? 's' : '') + ' first — each one supplies decisions this stage\'s prompt depends on.'));
  const list = el('ul', {});
  missing.forEach((s) => {
    const link = text('a', `${s.number}. ${s.title}`, { href: `#/stage/${s.id}` });
    link.addEventListener('click', (e) => { e.preventDefault(); nav.goTo(s.id); });
    list.appendChild(el('li', {}, [link]));
  });
  wrap.appendChild(list);
  return wrap;
}

function renderWorkspaceGate(nav) {
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(el('div', { class: 'banner banner--info', role: 'status' }, [
    'To continue, use an AI agent that can work inside your project workspace.',
  ]));
  wrap.appendChild(text('p', 'From here on, every stage asks an agent to inspect and change files in your project, and to verify what it finds rather than take your word for it — a chat-only assistant with no file access cannot do that, and working around it by pasting your project documents somewhere would defeat the point. Stage 1 stays open, so you can keep exploring the idea. Once you have a workspace-capable agent (for example, a coding assistant that can read and edit your project directly), go back to Orientation and update your answer.'));
  const link = text('a', '← Back to Orientation', { href: '#/stage/orientation' });
  link.addEventListener('click', (e) => { e.preventDefault(); nav.goTo('orientation'); });
  wrap.appendChild(link);
  return wrap;
}

function renderFormColumn(stage, onChanged) {
  const col = el('div', {});
  const card = el('div', { class: 'card' });
  card.appendChild(text('h2', 'Your decisions', { class: 'section-title' }));
  card.appendChild(text('p', 'Structured questions capture what an agent cannot safely infer. Skip nothing marked required.', { class: 'section-lede' }));

  // Only questions that some OTHER question's dependsOn actually points at need a full
  // re-render on change (their answer can change what's visible). Every other question can
  // update its own value in place, so typing in a text field never loses focus.
  const dependedOnIds = new Set(stage.questions.filter((q) => q.dependsOn).map((q) => q.dependsOn.questionId));

  const questionsWrap = el('div', {});
  const rerenderQuestions = () => {
    clear(questionsWrap);
    for (const q of stage.questions) {
      if (!questionVisible(q, store.getAnswers(stage.id))) continue;
      questionsWrap.appendChild(renderQuestion(q, store.getAnswers(stage.id)[q.id], (id, value) => {
        store.setAnswer(stage.id, id, value);
        onChanged();
        if (dependedOnIds.has(id)) rerenderQuestions();
      }));
    }
  };
  rerenderQuestions();
  card.appendChild(questionsWrap);

  const freeWrap = el('div', { class: 'free-text-block question' });
  freeWrap.appendChild(text('label', stage.freeTextLabel, { class: 'question__label', for: `free-${stage.id}` }));
  const freeTa = el('textarea', {
    id: `free-${stage.id}`,
    class: 'field-textarea',
    placeholder: 'Optional — write in your own words.',
    onInput: (e) => { store.setFreeText(stage.id, e.target.value); onChanged(); },
  });
  freeTa.value = store.getFreeText(stage.id);
  freeWrap.appendChild(freeTa);
  card.appendChild(freeWrap);

  col.appendChild(card);
  return col;
}

function renderPromptColumn(stage) {
  const col = el('div', {});
  const panel = el('div', { class: 'prompt-panel' });

  const mode = store.getMode(stage.id);
  panel.appendChild(el('div', { class: 'prompt-panel__header' }, [
    text('h2', 'Generated prompt', { class: 'section-title', style: 'margin:0' }),
    el('div', { class: 'mode-switch', role: 'group', 'aria-label': 'Operating mode' }, [
      el('button', { type: 'button', 'aria-pressed': String(mode === 'same'), onClick: () => { store.setMode(stage.id, 'same'); rerenderPromptArea(); } }, ['Same agent']),
      el('button', { type: 'button', 'aria-pressed': String(mode === 'fresh'), onClick: () => { store.setMode(stage.id, 'fresh'); rerenderPromptArea(); } }, ['Fresh agent']),
    ]),
  ]));

  const modeHelp = text('p', '', { class: 'prompt-panel__hint' });
  const textarea = el('textarea', {
    class: 'prompt-textarea',
    'aria-label': 'Generated prompt — editable',
    onInput: (e) => store.setPromptEdit(stage.id, store.getMode(stage.id), e.target.value),
  });

  const buttonRow = el('div', { class: 'btn-row', style: 'margin-top:.8rem' });
  const copyBtn = text('button', 'Copy prompt', { type: 'button', class: 'btn btn--primary' });
  const downloadBtn = text('button', 'Download as Markdown', { type: 'button', class: 'btn' });
  const revertBtn = text('button', 'Revert edits', { type: 'button', class: 'btn btn--ghost' });
  buttonRow.append(copyBtn, downloadBtn, revertBtn);

  // Several stages fall through to a reasonable default branch when a required answer is
  // missing, and that default is then quoted to the agent as the human's own decision
  // ("The human is trusting your engineering judgment…"). That is the one thing this product
  // must never do, so an incomplete questionnaire withholds the prompt instead of inventing
  // the missing judgement.
  const missingBanner = el('div', { class: 'banner banner--warning', role: 'status', hidden: true });

  function currentCompiled() {
    const currentMode = store.getMode(stage.id);
    const ctx = buildPromptCtx(currentMode, store.journey);
    const layers = stage.buildLayers(store.getAnswers(stage.id), store.getFreeText(stage.id), ctx);
    return compilePrompt(layers, { stageTitle: stage.title, stageNumber: stage.number, stageId: stage.id }, ctx);
  }

  function rerenderPromptArea() {
    const currentMode = store.getMode(stage.id);
    modeHelp.textContent = currentMode === 'same'
      ? 'Continue in the same agent conversation that completed the previous step.'
      : 'Launch the agent from the root of your project and make sure it can read the project files. Give it the prompt below. Do not copy your project documents into this website.';

    const missing = missingRequiredAnswers(stage, store.getAnswers(stage.id));
    clear(missingBanner);
    missingBanner.hidden = missing.length === 0;
    if (missing.length) {
      missingBanner.appendChild(el('div', {}, [
        text('strong', 'Answer these first, so the prompt states your decisions and not a guess at them:'),
        el('ul', { style: 'margin:.4rem 0 0;padding-left:1.1rem' }, missing.map((q) => text('li', q.label))),
      ]));
    }
    const blocked = missing.length > 0;
    copyBtn.disabled = blocked;
    downloadBtn.disabled = blocked;
    textarea.readOnly = blocked;

    const edited = store.getPromptEdit(stage.id, currentMode);
    textarea.value = blocked
      ? 'This prompt is not ready yet.\n\nSome required decisions above are still blank. Rather than fill them with a plausible-sounding default and present it to your agent as your judgement, this stage waits for you.'
      : (edited !== null ? edited : currentCompiled());
    panel.querySelectorAll('.mode-switch button').forEach((b, i) => {
      b.setAttribute('aria-pressed', String((i === 0 && currentMode === 'same') || (i === 1 && currentMode === 'fresh')));
    });
  }

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textarea.value);
      toast('Prompt copied to clipboard.');
    } catch {
      textarea.focus();
      textarea.select();
      toast('Could not use the clipboard automatically — the text is selected, press ⌘/Ctrl+C.');
    }
  });

  downloadBtn.addEventListener('click', () => {
    const blob = new Blob([textarea.value], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: `${stage.number}-${stage.id}-prompt.md` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  revertBtn.addEventListener('click', () => {
    store.clearPromptEdit(stage.id, store.getMode(stage.id));
    rerenderPromptArea();
    toast('Reverted to the generated prompt.');
  });

  panel.appendChild(modeHelp);
  panel.appendChild(missingBanner);
  panel.appendChild(textarea);
  panel.appendChild(buttonRow);
  // Assembled first, then filled: rerenderPromptArea reads the mode-switch buttons out of the
  // panel, so it cannot run before they are attached.
  rerenderPromptArea();

  const tokens = missingRequiredAnswers(stage, store.getAnswers(stage.id)).length
    ? []
    : findUnresolvedTokens(currentCompiled());
  if (tokens.length) {
    panel.appendChild(el('p', { class: 'prompt-panel__hint', role: 'alert' }, [`Internal check found unresolved placeholders: ${tokens.join(', ')}`]));
  }

  col.appendChild(panel);
  return { el: col, refresh: rerenderPromptArea };
}

function renderRecoverySection(stage) {
  if (!stage.recoveryPrompts || !stage.recoveryPrompts.length) return el('div', {});
  const acc = accordion('Need a recovery prompt instead?', false);
  const body = acc.querySelector('.accordion__panel');
  body.appendChild(text('p', 'Use one of these instead of the primary prompt above when the primary case does not fit.'));
  for (const rp of stage.recoveryPrompts) {
    const sub = el('div', { class: 'question' });
    sub.appendChild(text('h3', rp.label));
    sub.appendChild(text('p', rp.description));
    const mode = store.getMode(stage.id);
    const ctx = buildPromptCtx(mode, store.journey);
    const compiled = compilePrompt(rp.buildLayers(store.getAnswers(stage.id), store.getFreeText(stage.id), ctx), { stageTitle: `${stage.title} — ${rp.label}`, stageNumber: stage.number, stageId: stage.id }, ctx);
    const ta = el('textarea', { class: 'prompt-textarea', 'aria-label': rp.label, readonly: true });
    ta.value = compiled;
    const copy = text('button', 'Copy this recovery prompt', { type: 'button', class: 'btn btn--small', style: 'margin-top:.5rem' });
    copy.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(compiled); toast('Recovery prompt copied.'); }
      catch { ta.focus(); ta.select(); toast('Select the text and copy manually.'); }
    });
    sub.append(ta, copy);
    body.appendChild(sub);
  }
  return acc;
}

function renderAdvancedSection(stage) {
  const acc = accordion('How to do this yourself', false);
  const body = acc.querySelector('.accordion__panel');
  const a = stage.advanced;

  const addPara = (title, content) => {
    body.appendChild(text('h3', title));
    body.appendChild(text('p', content));
  };
  addPara('Why this artifact exists', a.purpose);
  addPara('What it prevents', a.problemPrevented);
  addPara('Judgment vs. investigation', a.judgmentVsInvestigation);
  addPara('Anatomy of a strong prompt here', a.promptAnatomy);
  addPara('Authority boundary', a.authorityBoundary);
  addPara('Inputs and sources of truth', a.inputsAndSources);
  addPara('Output and evidence expectations', a.outputsAndEvidence);

  body.appendChild(text('h3', 'Common failure modes'));
  body.appendChild(el('ul', {}, a.failureModes.map((f) => text('li', f))));

  body.appendChild(text('h3', 'Signs of a weak result'));
  body.appendChild(el('ul', {}, a.weakResultSigns.map((f) => text('li', f))));

  addPara('Customizing this for your project', a.customization);
  addPara('When to stop and ask for clarification', a.whenToStop);
  addPara('Auditing the result without pasting it into this site', a.auditWithoutPasting);

  body.appendChild(text('h3', 'A weak instruction vs. a stronger one'));
  body.appendChild(el('div', { class: 'example-pair' }, [
    el('div', { class: 'example-card example-card--weak' }, [
      text('span', 'Weak', { class: 'example-card__tag' }),
      text('p', a.weakVsStrongExample.weak, { style: 'margin:0' }),
    ]),
    el('div', { class: 'example-card example-card--strong' }, [
      text('span', 'Stronger', { class: 'example-card__tag' }),
      text('p', a.weakVsStrongExample.strong, { style: 'margin:0' }),
    ]),
  ]));

  if (stage.methodProvenance) {
    body.appendChild(text('h3', 'Where this comes from'));
    const mp = stage.methodProvenance;
    if (mp.verified.length) body.appendChild(provenanceList('Directly from the method', mp.verified));
    if (mp.adapted.length) body.appendChild(provenanceList('Adapted from the Gauntlet Loop', mp.adapted));
    if (mp.productDesign.length) body.appendChild(provenanceList('This guide\'s product design', mp.productDesign));
  }

  return acc;
}

function provenanceList(label, items) {
  const wrap = el('div', {});
  wrap.appendChild(text('p', label, { style: 'font-weight:700;margin-bottom:.2rem' }));
  wrap.appendChild(el('ul', {}, items.map((i) => text('li', i))));
  return wrap;
}

function accordion(triggerLabel, openByDefault) {
  const wrap = el('div', { class: 'accordion', dataset: { open: String(openByDefault) } });
  const panelId = `panel-${Math.random().toString(36).slice(2, 8)}`;
  const trigger = el('button', {
    type: 'button',
    class: 'accordion__trigger',
    'aria-expanded': String(openByDefault),
    'aria-controls': panelId,
  }, [triggerLabel, el('span', { class: 'accordion__chevron', 'aria-hidden': 'true' }, ['⌄'])]);
  const panel = el('div', { class: 'accordion__panel', id: panelId, hidden: !openByDefault });
  trigger.addEventListener('click', () => {
    const open = wrap.dataset.open === 'true';
    wrap.dataset.open = String(!open);
    trigger.setAttribute('aria-expanded', String(!open));
    panel.hidden = open;
  });
  wrap.append(trigger, panel);
  return wrap;
}

function renderCompletionGate(stage, allStages, nav) {
  const wrap = el('div', { class: 'card' });
  wrap.appendChild(text('h2', 'Confirm and continue', { class: 'section-title' }));
  wrap.appendChild(text('p', 'This site never sees the agent\'s output. Confirm what actually happened, based on your own review.', { class: 'section-lede' }));

  const existingGate = store.getGate(stage.id);
  const checked = new Set(existingGate?.checkedItems || []);
  const list = el('ul', { class: 'gate-list' });
  stage.completionGate.filter((g) => g.kind === 'confirm').forEach((item) => {
    const id = `gate-${stage.id}-${item.id}`;
    const input = el('input', {
      type: 'checkbox',
      id,
      checked: checked.has(item.id),
      onChange: () => { input.checked ? checked.add(item.id) : checked.delete(item.id); },
    });
    list.appendChild(el('li', { class: 'gate-item' }, [input, el('label', { for: id }, [item.label])]));
  });
  wrap.appendChild(list);

  const artifactItem = stage.completionGate.find((g) => g.kind === 'text');
  let artifactInput = null;
  if (artifactItem) {
    const field = el('div', { class: 'question' });
    field.appendChild(el('label', { class: 'question__label', for: `artifact-${stage.id}` }, [artifactItem.label]));
    artifactInput = el('input', { type: 'text', id: `artifact-${stage.id}`, class: 'field-text', placeholder: 'e.g. docs/capstone.md', value: existingGate?.artifactPath || '' });
    field.appendChild(artifactInput);
    wrap.appendChild(field);
  }

  const fieldset = el('fieldset', { class: 'disposition-fieldset' }, [
    el('legend', {}, ['Your disposition']),
  ]);
  const dispositionOptions = [
    { value: 'accepted', label: 'Accept — mark this stage complete and unlock the next one.' },
    { value: 'revise', label: 'Needs revision — I will redirect the agent before continuing.' },
    { value: 'stopped', label: 'Stop here for now — I am pausing the journey at this stage.' },
  ];
  let disposition = existingGate?.disposition || null;
  const radioList = el('ul', { class: 'option-list' });
  dispositionOptions.forEach((opt) => {
    const inputId = `disp-${stage.id}-${opt.value}`;
    const input = el('input', {
      type: 'radio', name: `disp-${stage.id}`, id: inputId, checked: disposition === opt.value,
      onChange: () => { disposition = opt.value; },
    });
    radioList.appendChild(el('li', {}, [el('label', { class: 'option', for: inputId }, [input, el('span', { class: 'option__body' }, [text('span', opt.label, { class: 'option__label' })])])]));
  });
  fieldset.appendChild(radioList);
  wrap.appendChild(fieldset);

  const requiredIds = stage.completionGate.filter((g) => g.kind === 'confirm' && g.required).map((g) => g.id);
  const status = el('p', { class: 'section-lede', role: 'status' }, ['']);
  const confirmBtn = text('button', 'Save disposition', { type: 'button', class: 'btn btn--primary' });
  confirmBtn.addEventListener('click', () => {
    const missing = missingRequiredAnswers(stage, store.getAnswers(stage.id));
    if (disposition === 'accepted' && missing.length) {
      status.textContent = `Answer the required decisions above first (${missing.length} still blank) — this stage's prompt has not been generated yet.`;
      return;
    }
    if (disposition === 'accepted' && !requiredIds.every((id) => checked.has(id))) {
      status.textContent = 'Confirm every required item before accepting this stage.';
      return;
    }
    if (!disposition) {
      status.textContent = 'Choose a disposition above.';
      return;
    }
    store.completeStage(stage.id, {
      checkedItems: Array.from(checked),
      artifactPath: artifactInput ? artifactInput.value : '',
      disposition,
      prereqSnapshot: snapshotPrereqs(stage),
    });
    status.textContent = disposition === 'accepted' ? 'Saved — the next stage is unlocked.' : 'Saved.';
    nav.onStageCompleted(stage.id);
  });
  wrap.appendChild(el('div', { class: 'btn-row' }, [confirmBtn, status]));

  return wrap;
}

function renderStageNav(stage, allStages, nav) {
  const idx = allStages.findIndex((s) => s.id === stage.id);
  const prev = allStages[idx - 1];
  const next = allStages[idx + 1];
  const row = el('div', { class: 'btn-row', style: 'margin-top:1.5rem;justify-content:space-between' });
  const left = prev ? text('button', `← ${prev.title}`, { type: 'button', class: 'btn', onClick: () => nav.goTo(prev.id) }) : el('span', {});
  const rightEnabled = next && computeStageStatus(stage) === 'complete';
  const right = next
    ? text('button', `${next.title} →`, { type: 'button', class: 'btn btn--primary', disabled: !rightEnabled, onClick: () => nav.goTo(next.id) })
    : el('span', {});
  row.append(left, right);
  return row;
}
