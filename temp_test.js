import { getMatchedSkills } from './server/utils/skillMatcher.js';

const resume = "Strong understanding of HTML and JavaScript, React JS, Node js";
const job = "Looking for developer with JavaScript, React.js, Node.js, Docker";
console.log(getMatchedSkills(resume, job));
