
(function(){
"use strict";
var KEY="tacocat_practice_results_v2";
var bank=[
["What is 1 + 1?",["2","3","4","1"],"2"],
["What is 2 + 2?",["4","3","5","6"],"4"],
["How many days are in a week?",["7","6","5","8"],"7"],
["Which animal says meow?",["Cat","Dog","Duck","Cow"],"Cat"],
["How many legs does a cat have?",["4","2","6","8"],"4"],
["What is 5 - 2?",["3","4","2","5"],"3"],
["What is the first letter of the alphabet?",["A","B","C","D"],"A"],
["How many months are in a year?",["12","10","11","13"],"12"],
["What comes after 9?",["10","8","11","12"],"10"],
["Which one is a fruit?",["Apple","Table","Shoe","Pencil"],"Apple"],
["What is 3 × 2?",["6","5","4","8"],"6"],
["What is 10 ÷ 2?",["5","4","6","10"],"5"]
];
var qs=[],answers=[],index=0,seconds=60,timer=null,startAt=0,username="";
function el(id){return document.getElementById(id)}
function shuffle(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t}return b}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){return[]}}
function write(x){localStorage.setItem(KEY,JSON.stringify(x))}
function show(id){["startCard","quizCard","doneCard"].forEach(function(x){el(x).classList.add("hidden")});el(id).classList.remove("hidden")}
function begin(){
 username=el("username").value.trim();
 if(!username){alert("Please enter a username.");return}
 qs=shuffle(bank).slice(0,10).map(function(x){return {q:x[0],a:shuffle(x[1]),c:x[2]}});answers=[];index=0;seconds=60;startAt=Date.now();
 show("quizCard");render();tick();timer=setInterval(function(){seconds--;tick();if(seconds<=0)finish(true)},1000)
}
function tick(){el("timer").textContent=seconds;el("timer").className=seconds<=10?"timer low":"timer"}
function render(){
 var q=qs[index];el("progress").textContent="Question "+(index+1)+" of 10";el("question").textContent=q.q;el("options").innerHTML="";
 el("nextBtn").disabled=true;el("nextBtn").textContent=index===9?"Submit":"Next";
 q.a.forEach(function(choice){var b=document.createElement("button");b.type="button";b.className="option";b.textContent=choice;
 b.addEventListener("click",function(){Array.prototype.forEach.call(document.querySelectorAll(".option"),function(x){x.classList.remove("selected")});b.classList.add("selected");answers[index]=choice;el("nextBtn").disabled=false});
 el("options").appendChild(b)})
}
function next(){if(!answers[index])return;if(index===9)finish(false);else{index++;render()}}
function finish(timedOut){
 if(timer){clearInterval(timer);timer=null}
 var elapsed=Math.min((Date.now()-startAt)/1000,60),score=0;
 qs.forEach(function(q,i){if(answers[i]===q.c)score++});

 saveResult({
username: username,
score: score,
time: Number(elapsed.toFixed(2)),
submitted_at: new Date().toISOString(),
timed_out: timedOut
});
 
 el("doneNote").textContent="Result saved for "+username+".";show("doneCard")
}
function admin(){
    window.location.href="/tacocat/admin/";
}
el("startBtn").addEventListener("click",begin);
el("nextBtn").addEventListener("click",next);
el("againBtn").addEventListener("click",function(){el("username").value="";show("startCard")});
el("adminBtn").addEventListener("click",admin);
el("doneAdminBtn").addEventListener("click",admin);
})();
