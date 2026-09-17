const astro = require('astronomy-engine');
console.log(Object.keys(astro));
const date = new Date();
const time = astro.MakeTime(date);
const v = astro.HelioVector(astro.Body.Earth, time);
console.log('HelioVector keys:', Object.keys(v));
