import { calculateMatchScore, cleanSkillsArray } from './server/utils/skillMatcher.js';
import jobService from './server/utils/jobService.js';

const resume="JavaScript, React.js, Node.js, C++";
const job="We need a developer with JavaScript, Python, React.js";
console.log('clean resume', cleanSkillsArray(resume.split(',')));
console.log('clean job', cleanSkillsArray(job.split(',')));
console.log(calculateMatchScore(resume, job));

console.log('empty job', calculateMatchScore(resume, ''));

const jobs = [
  { title:'A', skills:['javascript','react.js'] },
  { title:'B', skills:['python'] }
];
console.log(jobService.calculateMatchScores(jobs,['JavaScript','C++']));
