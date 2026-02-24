import jobService from './server/utils/jobService.js';

const jobs = [
  { title:'A', skills:['javascript','react.js'] },
];
console.log(jobService.calculateMatchScores(jobs,['JavaScript']));
