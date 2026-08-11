import orientation from './01-orientation.js';
import capstone from './02-capstone.js';
import capstoneRatification from './03-capstone-ratification.js';
import roadmap from './04-roadmap.js';
import sourceOfTruth from './05-source-of-truth.js';
import rulebook from './06-rulebook.js';
import roles from './07-roles.js';
import forms from './08-forms.js';
import bootstrap from './09-bootstrap.js';
import orchestratorInit from './10-orchestrator-init.js';
import firstExecution from './11-first-execution.js';
import returnDisposition from './12-return-disposition.js';
import scaling from './13-scaling.js';

/** @type {import('../lib/schema.js').StageModule[]} */
export const stages = [
  orientation,
  capstone,
  capstoneRatification,
  roadmap,
  sourceOfTruth,
  rulebook,
  roles,
  forms,
  bootstrap,
  orchestratorInit,
  firstExecution,
  returnDisposition,
  scaling,
];
