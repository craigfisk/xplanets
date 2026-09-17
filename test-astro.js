const { HelioVector, Body, MakeTime, StateVector } = require('astronomy-engine');

const date = new Date();
const time = MakeTime(date);
const v = StateVector(Body.Earth, time);
console.log(v);
