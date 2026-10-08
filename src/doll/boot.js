import { startStudio } from './app.js';
const app=await startStudio();
addEventListener('pagehide',event=>{if(!event.persisted)app.dispose();});
