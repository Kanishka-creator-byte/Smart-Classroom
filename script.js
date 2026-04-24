function getData(){
  return JSON.parse(localStorage.getItem("classrooms")) || {};
}

/* AUTH */
function signup(){
  let u=user.value.trim();
  let p=pass.value.trim();

  let email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let mobile=/^[0-9]{10}$/;

  if(!email.test(u) && !mobile.test(u)){
    return alert("Enter valid Email or Mobile");
  }

  localStorage.setItem("auth_"+u,p);
  alert("Account Created");
}

function login(){
  let u=user.value.trim();
  let p=pass.value.trim();

  if(localStorage.getItem("auth_"+u)===p){
    if(role.value==="teacher") location.href="dashboard.html";
    else location.href="student.html";
  } else alert("Invalid Login");
}

/* NAV */
function goSetup(){location.href="setup.html";}
function goLayout(){location.href="layout.html";}
function goBack(){history.back();}

/* SAVE ROOM */
function saveRoom(){
  let data=getData();
  let room=roomInput.value.trim();

  data[room]=data[room]||{students:[],layout:{},seatMap:{}};

  localStorage.setItem("currentRoom",room);
  localStorage.setItem("classrooms",JSON.stringify(data));
  alert("Saved");
}

/* VIEW ROOMS */
function viewRooms(){
  let data=getData();
  let html="<h3>Allocated Classrooms</h3>";

  for(let r in data){
    html+=`<div class="dash-btn blue" onclick="showRoom('${r}')">Room ${r}</div>`;
  }

  roomsList.innerHTML=html;
}

/* SHOW LAYOUT */
function showRoom(r){
  let data=getData();
  roomsList.innerHTML=`<h2>Room ${r}</h2><div id="grid">${data[r].layoutHTML || "No layout yet"}</div>`;
}

/* MULTI CSV */
function loadFile(){
  let data=getData();
  let room=localStorage.getItem("currentRoom");

  let files=fileInput.files;
  let all=[];

  let count=0;

  for(let f=0;f<files.length;f++){
    let reader=new FileReader();

    reader.onload=function(e){
      let lines=e.target.result.split("\n");

      for(let i=1;i<lines.length;i++){
        let d=lines[i].split(",");
        if(d.length>=5){
          all.push({
            roll:d[0],name:d[1],cls:d[3],dept:d[4]
          });
        }
      }

      count++;
      if(count===files.length){
        data[room].students=data[room].students.concat(all);
        localStorage.setItem("classrooms",JSON.stringify(data));
        alert("All files loaded");
      }
    };

    reader.readAsText(files[f]);
  }
}

/* ADD */
function addStudent(){
  let data=getData();
  let room=localStorage.getItem("currentRoom");

  data[room].students.push({
    name:name.value,
    roll:roll.value,
    cls:cls.value,
    dept:dept.value
  });

  localStorage.setItem("classrooms",JSON.stringify(data));
}

/* RULE */
function validPair(a,b){
  if(!a||!b) return true;

  let type=byWhat.value;
  let rule=sameDiff.value;

  if(type==="dept"){
    return (rule==="same") ? a.dept===b.dept : a.dept!==b.dept;
  } else {
    return (rule==="same") ? a.cls===b.cls : a.cls!==b.cls;
  }
}

/* GENERATE */
function generate(){
  let data=getData();
  let room=localStorage.getItem("currentRoom");

  let rows=parseInt(rowsInput.value)||3;
  let cols=parseInt(colsInput.value)||3;
  let per=parseInt(perBench.value);

  let students=[...data[room].students];

  if(mode.value==="roll") students.sort((a,b)=>a.roll-b.roll);
  else students.sort(()=>Math.random()-0.5);

  grid.innerHTML="";
  grid.style.gridTemplateColumns=`repeat(${cols},auto)`;

  let map={},i=0;

  for(let r=1;r<=rows;r++){
    for(let c=1;c<=cols;c++){

      let s1=students[i++];
      let s2=null;

      if(per===2){
        for(let j=i;j<students.length;j++){
          if(validPair(s1,students[j])){
            s2=students[j];
            students.splice(j,1);
            break;
          }
        }
      }

      let bench=document.createElement("div");
      bench.className="bench";

      bench.innerHTML=`
        <div class="studentBox">
          ${s1?`${s1.name}<br>${s1.roll}<br>${s1.dept}<br>${s1.cls}`:""}
        </div>
        <div class="studentBox">
          ${s2?`${s2.name}<br>${s2.roll}<br>${s2.dept}<br>${s2.cls}`:""}
        </div>
      `;

      if(s1) map[s1.roll]={room,row:r,col:c};
      if(s2) map[s2.roll]={room,row:r,col:c};

      grid.appendChild(bench);
    }
  }

  data[room].seatMap=map;
  data[room].layoutHTML=grid.innerHTML;

  localStorage.setItem("classrooms",JSON.stringify(data));
}

/* STUDENT */
function checkSeat(){
  let data=getData();
  let r=roll.value;

  for(let room in data){
    let map=data[room].seatMap;

    if(map[r]){
      let s=map[r];
      result.innerHTML=`Room:${s.room} Row:${s.row} Bench:${s.col}`;
      return;
    }
  }

  result.innerHTML="Seat Not Found ❌";
}

/* PDF */
function downloadPDF(){
  window.print();
}