import { el, text, clear } from './dom.js';
import { DELEGATE_VALUE, questionVisible } from '../lib/schema.js';

export { DELEGATE_VALUE, questionVisible };

export const DELEGATE_OPTION = {
  value: DELEGATE_VALUE,
  label: "I'm not sure — ask the agent to investigate and recommend options before acting.",
  description: 'The generated prompt will ask the agent to inspect the project, propose options with tradeoffs, and pause for your decision instead of guessing.',
};

/**
 * Renders one question into a container. Calls onChange(questionId, value) on every edit.
 * Rendering is fully re-driven from state (see render.js), so this only needs to read the
 * current value and attach change handlers — it never needs to diff.
 */
export function renderQuestion(question, currentValue, onChange) {
  const wrap = el('div', { class: 'question', dataset: { questionId: question.id } });

  // radio/checkbox/priorityOrder render a *group* of controls, so there is no single element
  // for a `for=` to point at — an orphan <label for> names nothing. Those types get a plain
  // labelled element that the group references with aria-labelledby instead.
  const isGroup = ['radio', 'checkbox', 'priorityOrder'].includes(question.type);
  const labelId = `qlabel-${question.id}`;
  const labelRow = el(isGroup ? 'div' : 'label', {
    class: 'question__label',
    id: labelId,
    for: isGroup ? null : `q-${question.id}`,
  }, [
    question.label,
    question.required ? el('span', { class: 'question__required', 'aria-label': 'required' }, ['*']) : null,
  ]);
  wrap.appendChild(labelRow);

  if (question.help) {
    const helpId = `help-${question.id}`;
    const toggle = text('button', 'Why are we asking this?', {
      type: 'button',
      class: 'question__help-toggle',
      'aria-expanded': 'false',
      'aria-controls': helpId,
    });
    const helpBody = text('p', question.help, { class: 'question__help', id: helpId, hidden: true });
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      helpBody.hidden = open;
    });
    wrap.appendChild(toggle);
    wrap.appendChild(helpBody);
  }

  const options = question.allowDelegate ? [...(question.options || []), DELEGATE_OPTION] : question.options;

  if (question.type === 'radio' || question.type === 'checkbox') {
    const isMulti = question.type === 'checkbox';
    const selected = isMulti ? (Array.isArray(currentValue) ? currentValue : []) : currentValue;
    const list = el('ul', { class: 'option-list', role: isMulti ? 'group' : 'radiogroup', 'aria-labelledby': labelId });
    options.forEach((opt, i) => {
      const inputId = `q-${question.id}-${i}`;
      const checked = isMulti ? selected.includes(opt.value) : selected === opt.value;
      const input = el('input', {
        type: isMulti ? 'checkbox' : 'radio',
        id: inputId,
        name: `q-${question.id}`,
        checked,
        onChange: () => {
          if (isMulti) {
            const next = new Set(selected);
            input.checked ? next.add(opt.value) : next.delete(opt.value);
            onChange(question.id, Array.from(next));
          } else {
            onChange(question.id, opt.value);
          }
        },
      });
      const li = el('li', {}, [
        el('label', { class: `option${opt.value === DELEGATE_VALUE ? ' option--delegate' : ''}`, for: inputId }, [
          input,
          el('span', { class: 'option__body' }, [
            text('span', opt.label, { class: 'option__label' }),
            opt.description ? text('span', opt.description, { class: 'option__desc' }) : null,
          ]),
        ]),
      ]);
      list.appendChild(li);
    });
    wrap.appendChild(list);
  } else if (question.type === 'select') {
    const select = el('select', {
      id: `q-${question.id}`,
      class: 'field-select',
      onChange: (e) => onChange(question.id, e.target.value),
    });
    select.appendChild(text('option', 'Choose one…', { value: '' }));
    options.forEach((opt) => {
      const optionEl = text('option', opt.label, { value: opt.value });
      if (opt.value === currentValue) optionEl.selected = true;
      select.appendChild(optionEl);
    });
    wrap.appendChild(select);
  } else if (question.type === 'text' || question.type === 'textarea') {
    const delegated = currentValue === DELEGATE_VALUE;
    const field = question.type === 'text'
      ? el('input', {
        type: 'text',
        id: `q-${question.id}`,
        class: 'field-text',
        placeholder: question.placeholder || '',
        disabled: delegated,
        onInput: (e) => onChange(question.id, e.target.value),
      })
      : el('textarea', {
        id: `q-${question.id}`,
        class: 'field-textarea',
        placeholder: question.placeholder || '',
        disabled: delegated,
        onInput: (e) => onChange(question.id, e.target.value),
      });
    // A delegated answer is stored as the sentinel, so the field itself must not also show it
    // as if the human had typed those words.
    field.value = delegated ? '' : (currentValue || '');
    wrap.appendChild(field);

    // Free-text questions can be delegated too — the stage modules already compile a distinct
    // "ask the agent to investigate and recommend" branch for them, and before this the option
    // rendered only for the option-typed questions, so those branches were unreachable.
    if (question.allowDelegate) {
      const delegateId = `q-${question.id}-delegate`;
      const input = el('input', {
        type: 'checkbox',
        id: delegateId,
        checked: delegated,
        onChange: () => {
          // Reflected here rather than waiting for a re-render: only questions other answers
          // depend on trigger one, so without this the field would stay editable while its
          // stored value had already become the delegate sentinel.
          field.disabled = input.checked;
          field.value = '';
          onChange(question.id, input.checked ? DELEGATE_VALUE : '');
        },
      });
      wrap.appendChild(el('div', { class: 'delegate-toggle' }, [
        el('label', { class: 'option option--delegate', for: delegateId }, [
          input,
          el('span', { class: 'option__body' }, [
            text('span', DELEGATE_OPTION.label, { class: 'option__label' }),
            text('span', DELEGATE_OPTION.description, { class: 'option__desc' }),
          ]),
        ]),
      ]));
    }
  } else if (question.type === 'priorityOrder') {
    wrap.appendChild(renderPriorityOrder(question, currentValue, onChange));
  }

  return wrap;
}

function renderPriorityOrder(question, currentValue, onChange) {
  // This widget owns its own re-render: reordering must redraw the ranked list immediately,
  // but that must not depend on (or trigger) the parent question list re-rendering, which
  // would cost focus in any open text field elsewhere on the same screen.
  let order = Array.isArray(currentValue) && currentValue.length
    ? currentValue
    : question.options.map((o) => o.value);
  const list = el('ol', { class: 'priority-list', 'aria-label': `${question.label} — ranked, use the arrow buttons to reorder` });

  function move(index, delta) {
    const next = order.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    order = next;
    onChange(question.id, next);
    draw();
  }

  function draw() {
    clear(list);
    order.forEach((value, i) => {
      const opt = question.options.find((o) => o.value === value) || { label: value };
      const li = el('li', { class: 'priority-item' }, [
        text('span', String(i + 1), { class: 'priority-item__rank' }),
        text('span', opt.label),
        el('span', { class: 'priority-item__buttons' }, [
          el('button', {
            type: 'button',
            'aria-label': `Move ${opt.label} up`,
            disabled: i === 0,
            onClick: () => move(i, -1),
          }, ['↑']),
          el('button', {
            type: 'button',
            'aria-label': `Move ${opt.label} down`,
            disabled: i === order.length - 1,
            onClick: () => move(i, 1),
          }, ['↓']),
        ]),
      ]);
      list.appendChild(li);
    });
  }
  draw();
  return list;
}
