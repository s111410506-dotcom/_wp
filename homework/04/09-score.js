const students = [
  { name: "小明", score: 55 },
  { name: "小華", score: 82 }
];

function getPassed(list) {
  return list.filter(s => s.score >= 60).map(s => s.name);
}

console.log("及格名單:", getPassed(students));