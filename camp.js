// Temporary safe zones ("camps"). One per chapter, in the chapter's safe room.
window.CAMP={
 D:{N:[80,22],S:[80,122],E:[138,72],W:[22,72]},
 C:[
 {kind:'lantern',fire:[56,88],bye:['"Go. Owen and I will keep the lamp lit until morning."','"Will you come back? ...You can say yes even if it\'s a lie."'],
  req:{who:1,text:'"There are things in the gallery. Make them stop scratching. Please."',kills:3,reward:{k:'ammo',n:8},done:'"It\'s quiet. Thank you. I drew you a picture. It\'s a truck."'}},
 {kind:'campfire',fire:[64,96],bye:['"The tide turns soon. Don\'t look back at the water."','"I\'ll keep your fish warm. Joke. There is no fish."','"Thu always comes back. You come back too."'],
  req:{who:0,text:'"My nets need scrap to weight them. Bring me 3 pieces."',need:{k:'scrap',n:3},reward:{k:'ammo',n:12},done:'"Good weight. Take these shells, I won\'t miss them."'}},
 {kind:'lantern',fire:[80,96],bye:['"Doctors don\'t say goodbye. We say: keep the wound clean."','"Patient 14 is... discharged. Ha. Go."'],
  req:{who:0,text:'"I need one herb to make a poultice for 14."',need:{k:'herb',n:1},reward:{k:'herb',n:2},done:'"Good. Take two; I grew them from your one. Medicine is strange."'}},
 {kind:'campfire',fire:[80,100],bye:['"The steppe takes everyone in the end. Not tonight."','"Ride safe, uncle. I\'ll keep the fire."'],
  req:{who:1,text:'"Wolves - no, worse - circle the trucks. Thin them out. Four."',kills:4,reward:{k:'ammo',n:12},done:'"Grandfather would have liked you."'}},
 {kind:'lantern',fire:[80,96],bye:['"Last train leaves when you do. Don\'t miss it."','"I\'ll stand where the signs are. So you can find us."'],
  req:{who:0,text:'"The platform lights need wire. Three scraps."',need:{k:'scrap',n:3},reward:{k:'herb',n:2},done:'"Light. Real light. Take these."'}},
 {kind:'campfire',fire:[64,96],bye:['"Sing something on the way down. They hate singing."','"Tiago will remember your face. He remembers everything."'],
  req:{who:0,text:'"My grandson is hungry. Bring a herb, I\'ll make soup."',need:{k:'herb',n:1},reward:{k:'ammo',n:14},done:'"Soup and shells. Fair trade, no?"'}},
 {kind:'lantern',fire:[56,96],bye:['"Diner\'s closed. Go on, hon. Somebody\'s waiting."','"Daisy says bye. Daisy is a very good dog. Daisy is me."'],
  req:{who:0,text:'"Grill\'s out. Clear the lot so I can get the generator. Five."',kills:5,reward:{k:'ammo',n:16},done:'"Order up. On the house."'}},
 {kind:'lantern',fire:[80,90],bye:['"..."'],req:{who:0,text:'',kills:3,reward:{k:'ammo',n:6},done:''}}]};
