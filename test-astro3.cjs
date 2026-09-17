const astro = require('astronomy-engine');
const time = astro.MakeTime(new Date());
const state = astro.HelioState(astro.Body.Earth, time);
console.log('HelioState:', state);
