var awayTeam = {name:"AWAY TEAM",score:0,tol:3,num:0,color:"skyblue",rgb:"rgb(0,162,232)",init:0,controls:'keyboard'};
var homeTeam = {name:"HOME TEAM",score:0,tol:3,num:1,color:"red",rgb:"rgb(237,28,36)",init:11,controls:'keyboard'};
var teams = {away:awayTeam,home:homeTeam};
var gameClock = 180;
var gameClockReset = 180;
var gameClockInterval = false;
var playClock = 7;
var playClockInterval = false;
var yardLine = -25;
var play = {down:1,toGo:10};
var offense = "away";
var conversion = false;
var rb = {x:0,y:1};
var df = {};
df["away"] = [{x:3,y:0},{x:3,y:1},{x:3,y:2},{x:6,y:1},{x:9,y:1}];
df["home"] = [{x:8,y:0},{x:8,y:1},{x:8,y:2},{x:5,y:1},{x:2,y:1}];
var dfReset = {};
dfReset["away"] = [{x:3,y:0},{x:3,y:1},{x:3,y:2},{x:6,y:1},{x:9,y:1}];
dfReset["home"] = [{x:8,y:0},{x:8,y:1},{x:8,y:2},{x:5,y:1},{x:2,y:1}];
var fieldColor = "rgb(20,164,20)";
var gamePrimed = false;
var gameActive = false;
var defenderInterval = false;
var defenderFrequency = 500;
var quarter = 1;
var currentTimeout = false;
var wrap = 0;
var goalToGo = false;
var possessions = 0;
var gameMode = 'classic';
var mousedownID = -1;

//setup

function test() {
  document.getElementById('setup').remove();
  document.getElementById('downMarker').children[0].textContent = "2nd & Goal";
  goToControls('left');
}

function chooseColor(elem) {
  for (let colors of elem.parentElement.children) {
    colors.children[0].style.display = 'none';
  }
  elem.children[0].style.display = 'block';
  teams[elem.parentElement.getAttribute('data-team')].rgb = getComputedStyle(elem).backgroundColor.replace(/\s/g, '');
  teams[elem.parentElement.getAttribute('data-team')].color = elem.getAttribute('data-color');
  let to = document.getElementById(elem.parentElement.getAttribute('data-team') + "Timeout");
  to.style.backgroundColor = `var(--${elem.getAttribute('data-color')})`;
}

function nextScreen() {
  var err = document.getElementById('launchError')
  var nameInp = document.getElementsByClassName('teamNameInput');
  if (nameInp[0].value.length == 0) {
    err.style.display = 'inline-block';
    err.textContent = 'Away Team, please enter a name';
    return;
  }
  if (nameInp[0].value.length > 8) {
    err.style.display = 'inline-block';
    err.textContent = 'Away Team, your name must be 8 characters or fewer';
    return;
  }
  if (nameInp[1].value.length == 0) {
    err.style.display = 'inline-block';
    err.textContent = 'Home Team, please enter a name';
    return;
  }
  if (nameInp[1].value.length > 8) {
    err.style.display = 'inline-block';
    err.textContent = 'Home Team, your name must be 8 characters or fewer';
    return;
  }
  if (nameInp[0].value === nameInp[1].value) {
    err.style.display = 'inline-block';
    err.textContent = 'The two teams must have different names';
    return;
  }
  if (teams['away'].rgb == teams['home'].rgb) {
    err.style.display = 'inline-block';
    err.textContent = 'The two teams must have different colors';
    return;
  }
  gameClock = Number(document.getElementById('periodLength').value);
  gameClockReset = Number(document.getElementById('periodLength').value);
  defenderFrequency = Number(document.getElementById('difficulty').value);
  document.getElementById('setup').children[0].style.display = 'none';
  document.getElementById('setup').children[1].style.display = 'block';
}

function changeGameMode(elem) {
  var btns = document.getElementsByClassName('gameMode');
  for (let btn of btns) {
    if (elem == btn) {
      btn.classList.add('gameModeSelected');
    } else {
      btn.classList.remove('gameModeSelected');
    }
  }
  gameMode = elem.getAttribute('data-mode');
}

function launch() {
  document.getElementById('setup').style.display = 'none';
  if (gameMode == 'frenzy') {
    quarter = 5;
    yardLine = 25;
    updateYardLines();
    document.getElementById('prompt').style.display = 'flex';
    document.getElementById('announceOT').style.display = 'block';
  } else if (gameMode == 'hardcore') {
    document.getElementById('puntButton').style.display = 'none';
    document.getElementById('fgButton').style.display = 'none';
    document.getElementById('patButton').style.display = 'none';
  }
  if (gameMode != 'frenzy') {
    gamePrimed = true;
    startGameClock();
    startPlayClock();
  }
  awayTeam.controls = document.getElementById('awayControls').value;
  homeTeam.controls = document.getElementById('homeControls').value;
  goToControls(awayTeam.controls);
  setupDpad();
  startGame();
}

function goToControls(style) {
  if (style != 'keyboard') {
    document.getElementById('dpadCont').style.display = 'block';
    document.getElementById('gameCont').style.width = 'calc(100vw - 260px)';
    if (style == 'left') {
      document.getElementById('gameCont').style.left = '260px';
      document.getElementById('gameCont').style.right = '';
      document.getElementById('dpadCont').style.left = '0px';
      document.getElementById('dpadCont').style.right = '';
    } else {
      document.getElementById('gameCont').style.right = '260px';
      document.getElementById('gameCont').style.left = '';
      document.getElementById('dpadCont').style.right = '0px';
      document.getElementById('dpadCont').style.left = '';
    }
  } else {
    document.getElementById('dpadCont').style.display = 'none';
    document.getElementById('gameCont').style.width = '100vw';
    document.getElementById('gameCont').style.left = '0px';
    document.getElementById('gameCont').style.right = '';
  }
}

//game stuff

function startGame() {
  resetField();
  document.getElementById('setup').style.display = 'none';
  var oppos = ['away','home'];
  var names = document.getElementsByClassName('teamName');
  var times = document.getElementsByClassName('teamTimeouts');
  var score = document.getElementsByClassName('teamScore');
  var input = document.getElementsByClassName('teamNameInput');
  var finalRow = document.getElementsByClassName("teamFinalCont");
  for (let i = 0; i < 2; i++) {
    teams[oppos[i]].name = input[i].value.toUpperCase();
    names[i].children[0].textContent = teams[oppos[i]].name;
    names[i].style.backgroundColor = `var(--${teams[oppos[i]].color})`;
    times[i].style.backgroundColor = `var(--${teams[oppos[i]].color})`;
    score[i].style.backgroundColor = `var(--${teams[oppos[i]].color}-dark)`;
    finalRow[i].children[0].style.backgroundColor = `var(--${teams[oppos[i]].color})`;
    finalRow[i].children[0].textContent = teams[oppos[i]].name;
    if (teams[oppos[i]].color != "maize") {
      finalRow[i].children[1].style.backgroundColor = `var(--${teams[oppos[i]].color}-dark)`;
    } else {
      finalRow[i].children[1].style.backgroundColor = 'rgb(152,134,5)';
    }
    document.getElementsByClassName('teamFinalName')[i].textContent = teams[oppos[i]].name;
  }
  document.getElementById('downMarker').style.backgroundColor = teams['away'].rgb;
  document.getElementById("scoreTime").children[1].textContent = convertTime(gameClock);
}

function callTimeout(team) {
  if (teams[team].tol > 0 && currentTimeout === false) {
    currentTimeout = true;
    stopPlayClock();
    stopGameClock();
    teams[team].tol--;
    document.getElementsByClassName("teamName")[teams[team].num].children[0].textContent = "TIMEOUT";
    document.getElementsByClassName("teamTimeouts")[teams[team].num].children[teams[team].tol].style.visibility = "hidden";
    setTimeout(function() {
      document.getElementsByClassName("teamName")[teams[team].num].children[0].textContent = teams[team].name;
      startPlayClock();
      currentTimeout = false;
    }, 5000);
  }
}

function updateScore(team,score) {
  var points;
  var fullName;
  switch(score.toUpperCase()) {
    case "TD":
      points = 6;
      fullName = "TOUCHDOWN";
      break;
    case "FG":
      points = 3;
      fullName = "FIELD GOAL";
      break;
    case "2P":
      points = 2;
      fullName = "2PT CONVERSION"
      break;
    case "SF":
      points = 2;
      fullName = "SAFETY"
      break;
    case "DOG":
      points = 0;
      fullName = "DELAY OF GAME";
      break;
    default:
      points = 1;
      fullName = "PAT";
      break;
  }
  teams[team].score += points;
  if (points === 1) { //no animation for extra point
    document.getElementById(team + "Score").children[0].textContent = teams[team].score;
    if (quarter > 4) {
      console.log('++ extra point');
      //possessions++;
      //advanceOT();
    }
  } else { //animations for all other scores
    var div = document.getElementById("scoreAni");
    if (points !== 0) {
      div.style.backgroundColor = `var(--${teams[team].color})`;
    } else {
      div.style.backgroundColor = "goldenrod";
      div.children[0].style.color = "#333";
    }
    div.children[0].textContent = fullName;
    div.children[0].style.letterSpacing = "5px";
    div.style.display = "block";
    var space = 5;
    var iter = 1;
    var scoreAnimation = setInterval(function() {
      iter++;
      div.children[0].style.letterSpacing = String(5 + iter * 0.3) + "px";
      if (iter == 40) {
        document.getElementById(team + "Score").children[0].textContent = teams[team].score;
      }
      if (iter == 80) {
        clearInterval(scoreAnimation);
        setTimeout(function() { div.style.display = "none"; div.children[0].style.color = "white"; }, 500);
      }
      if (score.toUpperCase() == "DOG" && iter == 80) {
        resetField();
        startPlayClock();
      }
      if (score.toUpperCase() == "TD" && iter == 80) {
        document.getElementById("prompt").style.display = "flex";
        document.getElementById('conversionPrompt').style.display = 'block';
        document.getElementById('fourthDownPrompt').style.display = 'none';
        document.getElementById('gameFinal').style.display = 'none';
        document.getElementById('announceOT').style.display = 'none';
      }
      if (score.toUpperCase() == "2P" && iter == 80 && quarter < 5) {
        conversion = false;
        touchback();
      }
      if (score.toUpperCase() == "FG" && iter == 80 && quarter < 5) {
        touchback();
        if (gameClock <= 0) {
          changeQuarter();
        }
      }
      if (score.toUpperCase() == "SF" && iter == 80) {
        if (offense == "away") {
          changePoss(20);
        } else {
          changePoss(-20);
        }
      }
      if ((score.toUpperCase() == "2P" || score.toUpperCase() == "FG") && iter == 80) {
        console.log('++ acutal score');
        conversion = false;
        touchback();
        //advanceOT();
      }
    }, 18);
  }
}

function updateYardLines() {
  var index = document.getElementsByClassName("yardLine");
  for (let i = 0; i < index.length; i++) {
    index[i].innerHTML = convertYardLine(yardLine + i);
  }
}

function resetField() {
  updateYardLines();
  document.getElementById("lineOfScrimm").style.display = "block";
  ltc = document.getElementById('lineToConvert');
  if (play.toGo > 10) {
    ltc.style.display = 'none';
  } else {
    ltc.style.display = 'block';
    let distance;
    if (goalToGo == true && offense == 'away') {
      distance = 51 - yardLine;
    } else if (goalToGo == true && offense == 'home') {
      distance = Math.abs(39 + yardLine);
    } else if (offense == 'away') {
      distance = play.toGo + 1;
    } else {
      distance = 11 - play.toGo;
    }
    ltc.style.left = `calc(((100% - 130px) / 12 * ${distance}) + 10px * ${distance} + 3px)`;
  }
  gamePrimed = true;
  var cells = document.getElementsByClassName("fieldCell");
  for (let x = 0; x < 12; x++) {
    for (let y = 0; y < 3; y++) {
      let cell = cells[convCoordToNum(x,y)];
      var isDefense = false;
      for (let pos of dfReset[offense]) {
        if (pos.x == x && pos.y == y) { //there is a defender
          isDefense = true;
          break;
        }
      }
      if (isDefense) {
        cell.style.backgroundColor = teams[getDefense()].rgb;
      } else if (rb.x == x && rb.y == y) {
        cell.style.backgroundColor = teams[offense].rgb;
      } else {
        cell.style.backgroundColor = fieldColor;
      }
    }
  }
  resetPositions();
}

function move(player,dir,team) {
  if (!gamePrimed) {
    return;
  }
  if (gameActive == false) {
    gameActive = true;
    moveDefenders();
    stopPlayClock();
    if (!conversion) {
      startGameClock();
    }
  }
  var cells = document.getElementsByClassName("fieldCell");
  var newPos = {};
  newPos.x = player.x + dir.x;
  newPos.y = player.y + dir.y;
  if (newPos.x < 0 && team == offense && team != "away") {
    newPos.x = 11;
    yardLine -= 12;
    wrap += 11;
    if (play.toGo <= 10 || wrap - play.toGo >= 11) {
      document.getElementById("lineToConvert").style.display = 'none';
    } else if (wrap - play.toGo != 0) {
      let ltc = document.getElementById("lineToConvert");
      ltc.style.display = 'block';
      ltc.style.left = `calc(((100%-130px)/12* ${11-play.toGo+wrap}) +10px* ${11-play.toGo+wrap} +3px)`;
    }
    document.getElementById("lineOfScrimm").style.display = "none";
    updateYardLines();
  } else if (newPos.x < 0 && ((team == offense && team == "away") || team != offense)) {
    newPos.x = 0;
  } else if (newPos.x > 11 && team == offense && team != "home") {
    newPos.x = 0;
    yardLine += 12;
    wrap += 11;
    if (play.toGo <= 10 || wrap - play.toGo >= 11) {
      document.getElementById("lineToConvert").style.display = 'none';
    } else if (wrap - play.toGo != 0) {
      let ltc = document.getElementById("lineToConvert");
      ltc.style.display = 'block';
      ltc.style.left = `calc(((100% - 130px) / 12 * ${play.toGo-wrap}) + 10px * ${play.toGo-wrap} + 3px)`;
    }
    document.getElementById("lineOfScrimm").style.display = "none";
    updateYardLines();
  } else if (newPos.x > 11 && ((team == offense && team == "home") || team != offense)) {
    newPos.x = 11;
  }
  if (newPos.y < 0) {
    newPos.y = 0;
  } else if (newPos.y > 2) {
    newPos.y = 2;
  }
  //check for conflicts
  var newCell = cells[convCoordToNum(newPos.x,newPos.y)];
  var newSpotColor = getComputedStyle(newCell).backgroundColor.replace(/\s/g, '');
  if (newSpotColor == teams[team].rgb) { //defender moved into own man
    cells[convCoordToNum(player.x,player.y)].style.backgroundColor = teams[team].rgb;
    return; //do nothing more
  } else if (newSpotColor == teams[getOpponent(team)].rgb) { //rb runs into defense
    playerTackled();
    gameActive = false;
    gamePrimed = false;
  } else { //no conflicts
    cells[convCoordToNum(player.x,player.y)].style.backgroundColor = fieldColor;
    newCell.style.backgroundColor = `var(--${teams[team].color})`;
    if (offense == "away") {
      var currentLine = yardLine + getDistance(newPos.x);
    } else {
      var currentLine = yardLine - getDistance(newPos.x);
    }
    if ((currentLine >= 50 && offense == "away" && team == offense) || (currentLine <= -50 && offense == "home" && team == offense)) {
      console.log('scored');
      playEndedAfterScore();
      if (conversion) {
        updateScore(offense,'2p');
      } else {
        updateScore(offense,'td');
      }
    }
    //update position of players
    if (team === offense) {
      rb = newPos; //update rb
    } else {
      for (let defend of df[getOpponent(team)]) { //loop through & update defenders
        if (player.x === defend.x && player.y === defend.y) {
          defend.x = newPos.x;
          defend.y = newPos.y;
        }
      }
    }
  }
}

function mousedown(event,dir) {
	whilemousedown(dir);
	if (mousedownID == -1) {
		mousedownID = setInterval(function() { whilemousedown(dir); }, 100);
	}
}

function mouseup(event) {
	if (mousedownID != -1) {
		clearInterval(mousedownID);
		mousedownID = -1;
	}
}

function whilemousedown(dir) {
	if (gamePrimed == true) {
		move(rb,dir,offense);
	}
}

function setupDpad() {
  let kids = document.getElementById('fullDpad').children;
  let dirs = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
	for (var i = 0; i < kids.length; i++) {
		(function(i) {
			kids[i].addEventListener("touchstart",function(){ mousedown(event,dirs[i]); });
			kids[i].addEventListener("touchend",function(){ mouseup(event,dirs[i]); });
		}(i));
	}
}

function playerTackled() {
  stopDefenders();
  stopGameClock();
  gamePrimed = false;
  gameActive = false;
  var counter = 0;
  var cell = document.getElementsByClassName("fieldCell")[convCoordToNum(rb.x,rb.y)];
  var animation = setInterval(function() {
    if (counter % 2 == 0) {
      cell.style.backgroundColor = fieldColor;
    } else {
      cell.style.backgroundColor = teams[offense].rgb;
    }
    counter++;
    if (counter == 4) {
      clearInterval(animation);
      playerTackledCallback(rb.x);
    }
  },500);
}

function playerTackledCallback(x) {
  if (gameClock <= 0) {
    gameActive = false;
    gamePrimed = false;
    changeQuarter();
  } else {
    nextPlay();
  }
}

function nextPlay() {
  if (conversion) {
    console.log('failed 2pt');
    conversion = false;
    touchback();
    return;
  }
  var leftToGo;
  if (offense == "away") {
    leftToGo = play.toGo - getDistance(rb.x) - wrap * 12/11;
  } else {
    leftToGo = play.toGo - getDistance(rb.x) - wrap * 12/11;
  }
  if (offense == "away") {
    yardLine = yardLine + getDistance(rb.x);
  } else {
    yardLine = yardLine - getDistance(rb.x);
  }
  if (leftToGo <= 0) {
    play.down = 1;
    play.toGo = 10;
  } else if (play.down < 3) {
    play.down++;
    play.toGo = leftToGo;
  } else if (play.down == 3) {
    play.toGo = leftToGo;
    play.down = 4;
    updateDownMarker();
    stopPlayClock();
    document.getElementById("prompt").style.display = "flex";
    document.getElementById('conversionPrompt').style.display = 'none';
    document.getElementById('fourthDownPrompt').style.display = 'block';
    document.getElementById('gameFinal').style.display = 'none';
    document.getElementById('announceOT').style.display = 'none';
    document.getElementById("fourthMessage").textContent = `It's 4th & ${play.toGo}!`;
    document.getElementById("fgChance").textContent = `Your chance is ${fieldGoalChance(yardLine)}%.`;
    return;
  } else {
    if (quarter < 5) {
      if (offense == "away") {
        changePoss(yardLine + getDistance(rb.x) + wrap);
      } else {
        changePoss(yardLine - getDistance(rb.x) - wrap);
      }
    } else {
      //console.log('++ tackled');
      //possessions++;
      touchback();
      //advanceOT();
    }
  }
  if (play.down == 1 && (yardLine - 10 <= -50 || yardLine + 10 >= 50)) {
    goalToGo = true;
  }
  updateDownMarker();
  startGameClock();
  startPlayClock();
  gamePrimed = true;
  rb.y = 1;
  rb.x = teams[offense].init;
  resetField();
  //DO LAST
  wrap = 0;
}

function playEndedAfterScore() {
  rb.y = 1;
  rb.x = teams[offense].init;
  stopGameClock();
  stopDefenders();
  gamePrimed = false;
  gameActive = false;
  wrap = 0;
}

function moveDefenders() {
  if (defenderInterval === false) {
    var counter = 0;
    var which = 3;
    var directions = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
    defenderInterval = setInterval(function() {
      if (counter >= 5) {
        var dir = directions[Math.floor(Math.random() * 4)];
      } else if (offense == "away") {
        var dir = {x:-1,y:0};
      } else {
        var dir = {x:1,y:0};
      }
      var def = df[offense][Math.floor(Math.random() * which)];
      move(def,dir,getDefense());
      if (counter == 5) {
        which = 5;
      }
      counter++;
    }, defenderFrequency);
  }
}

function stopDefenders() {
  clearInterval(defenderInterval);
  defenderInterval = false;
}

function updateDownMarker() {
  if (goalToGo) {
    var down = `<span>${ordinal(play.down)} & Goal</span>`;
  } else {
    var down = `<span>${ordinal(play.down)} & ${play.toGo}</span>`;
  }
  var format = down;
  if (offense == "away" && !conversion) {
    format = down + "<img src='right.png'>";
  } else if (!conversion) {
    format =  "<img src='left.png'>" + down;
  } else if (offense == "away" && conversion) {
    format = "<span>2PT ATT</span> <img src='right.png'>";
  } else {
    format =  "<img src='left.png'> <span>2PT ATT</span>";
  }
  var div = document.getElementById("downMarker");
  div.style.backgroundColor = teams[offense].rgb;
  div.innerHTML = format;
}

function changePoss(yard) {
  if (quarter > 4) {
    var advance = advanceOT();
  }
  if (quarter > 4 && advance) {
    console.log('++ poss');
    //possessions++;
    if (offense == "away") {
      yard = -25;
    } else {
      yard = 25;
    }
  } else if (quarter > 4 && !advance) {
    return;
  }
  goalToGo = false;
  yardLine = yard;
  var los = document.getElementById("lineOfScrimm");
  var ltc = document.getElementById("lineToConvert");
  if (offense == "away") {
    offense = "home";
    los.style.left = `calc(((100% - 130px) / 12 * 11) + 10px * 11 + 3px)`;
    ltc.style.left = `calc(((100% - 130px) / 12 * 1) + 10px * 1 + 3px)`;
  } else {
    offense = "away";
    ltc.style.left = `calc(((100% - 130px) / 12 * 11) + 10px * 11 + 3px)`;
    los.style.left = `calc(((100% - 130px) / 12 * 1) + 10px * 1 + 3px)`;
  }
  goToControls(teams[offense].controls);
  play = {down:1,toGo:10};
  rb.y = 1;
  rb.x = teams[offense].init;
  stopPlayClock();
  stopGameClock();
  updateDownMarker();
  updateYardLines();
  resetField();
  setTimeout(function() {
    playClock = 7;
    startPlayClock();
    if (quarter < 5) {
      startGameClock();
    }
  }, 500);
}

function touchback() {
  if ((offense == "away" && quarter < 5) || (offense == "home" && quarter > 4)) {
    changePoss(25);
  } else {
    changePoss(-25);
  }
}

function punt() {
  document.getElementById("prompt").style.display = "none";
  gameClock -= 3;
  var puntLength = Math.floor(Math.random() * 25) + 35;
  if (offense == "away") {
    var newYardLine = yardLine + puntLength;
  } else {
    var newYardLine = yardLine - puntLength;
  }
  if (newYardLine <= -50) {
    newYardLine = -30;
  } else if (newYardLine >= 50) {
    newYardLine = 30;
  }
  changePoss(newYardLine);
  if (gameClock <= 0) {
    changeQuarter();
  }
}

function kickFieldGoal() {
  document.getElementById("prompt").style.display = "none";
  var threshold = Number(fieldGoalChance(yardLine));
  var kick = Math.random() * 100;
  gameClock -= 3;
  if (kick <= threshold) {
    updateScore(offense,'fg');
  } else {
    document.getElementById("downMarker").innerHTML = "<span>No Good</span>";
    setTimeout(function() {
      changePoss(yardLine);
      if (gameClock <= 0) {
        changeQuarter();
      } else if (quarter > 4) {
        //possessions++;
        //advanceOT();
      }
    }, 1500);
  }
}

function goForTwo() {
  stopGameClock();
  var los = document.getElementById("lineOfScrimm");
  var ltc = document.getElementById("lineToConvert");
  los.style.display = "block";
  los.style.left = "calc(((100% - 130px) / 12) + 13px)";
  ltc.style.display = "block";
  ltc.style.left = "calc(((100% - 130px) / 2) + 63px)";
  resetPositions();
  conversion = true;
  document.getElementById("prompt").style.display = "none";
  if (offense == "away") {
    yardLine = 45;
  } else {
    yardLine = -45;
  }
  updateYardLines();
  resetField();
  updateDownMarker();
  startPlayClock();
}

function resetPositions() {
  rb.x = teams[offense].init;
  rb.y = 1;
  for (var i = 0; i < dfReset[offense].length; i++) {
    df[offense][i].x = dfReset[offense][i].x;
    df[offense][i].y = dfReset[offense][i].y;
  }
}

function goForFourth() {
  document.getElementById("prompt").style.display = "none";
  resetPositions();
  startGameClock();
  startPlayClock();
  resetField();
}

//clock management

function startGameClock() {
  if (quarter > 4) {
    return;
  }
  document.getElementById("scoreTime").children[1].textContent = convertTime(gameClock);
  if (gameClockInterval === false) {
    gameClockInterval = setInterval(function() {
      gameClock--;
      document.getElementById("scoreTime").children[1].textContent = convertTime(gameClock);
      if (gameClock <= 0) {
        if (!gameActive) {
          stopPlayClock();
          changeQuarter();
        }
        stopGameClock();
      }
    }, 1000);
  }
}

function stopGameClock() {
  clearInterval(gameClockInterval);
  gameClockInterval = false;
}

function startPlayClock() {
  gamePrimed = true;
  var playCounter = document.getElementById("playClock").children[0];
  playCounter.textContent = playClock;
  playCounter.parentElement.classList.remove('within');
  if (playClockInterval === false) {
    playClockInterval = setInterval(function() {
      playClock--;
      playCounter.textContent = playClock;
      if (playClock == 2) {
        playCounter.parentElement.classList.add('within');
      }
      if (playClock <= 0) { //delay of game
        stopPlayClock();
        stopGameClock();
        if ((yardLine - 5 <= -50 && offense == "away") || (yardLine + 5 >= 50 && offense == "home")) {
          updateScore(getDefense(),'sf');
        } else {
          gamePrimed = false;
          if (offense == "away") {
            yardLine -= 5;
          } else {
            yardLine += 5;
          }
          play.toGo += 5;
          setTimeout(function() {
            updateYardLines();
            updateDownMarker();
            updateScore(offense,'dog');
          }, 750);
        }
      }
    }, 1000);
  }
}

function stopPlayClock() {
  clearInterval(playClockInterval);
  playClockInterval = false;
  playClock = 7;
}

function changeQuarter() {
  gamePrimed = false;
  gameActive = false;
  quarter++;
  var div = document.getElementById("scoreTime");
  if (quarter < 5) {
    div.children[0].textContent = `End ${ordinal(quarter - 1)}`;
  } else {
    if (awayTeam.score == homeTeam.score) {
      if (quarter == 5) {
        div.children[0].textContent = "End Reg";
        document.getElementById('prompt').style.display = 'flex';
        document.getElementById('conversionPrompt').style.display = 'none';
        document.getElementById('fourthDownPrompt').style.display = 'none';
        document.getElementById('gameFinal').style.display = 'none';
        document.getElementById('announceOT').style.display = 'block';
      } else {
        div.children[0].textContent = `End ${ordinal(quarter - 1)}`;
      }
    } else {
      endGame();
    }
  }
  div.children[1].textContent = "";
  if (quarter % 2 == 0) {
    setTimeout(function() {
      gameClock = gameClockReset;
      div.children[0].textContent = ordinal(quarter);
      div.children[1].textContent = convertTime(gameClock);
      startGameClock();
      startPlayClock();
      nextPlay();
    }, 2000);
  }
  if (quarter == 3) {
    setTimeout(function() {
      if (offense == "home") {
        offense = "away";
      }
      changePoss(25);
      gameClock = gameClockReset;
      div.children[0].textContent = ordinal(quarter);
      div.children[1].textContent = convertTime(gameClock);
      awayTeam.tol = 3;
      homeTeam.tol = 3;
      var timeouts = document.getElementsByClassName('teamTimeouts');
      for (let div of timeouts) {
        let kids = div.children;
        for (let bars of kids) {
          bars.style.visibility = "visible";
        }
      }
      startGameClock();
      startPlayClock();
    }, 2000);
  }
}

function endGame() {
  stopGameClock();
  document.getElementById('prompt').style.display = 'flex';
  document.getElementById('prompt').style.height = '100vh';
  document.getElementById('conversionPrompt').style.display = 'none';
  document.getElementById('fourthDownPrompt').style.display = 'none';
  document.getElementById('gameFinal').style.display = 'block';
  document.getElementById('announceOT').style.display = 'none';
  var finalRow = document.getElementsByClassName("teamFinalCont");
  finalRow[0].children[1].textContent = teams['away'].score;
  finalRow[1].children[1].textContent = teams['home'].score;
  if (teams['away'].score > teams['home'].score) {
    finalRow[0].children[1].style.color = 'gold';
  } else {
    finalRow[1].children[1].style.color = 'gold';
  }
}

function launchOT() {
  document.getElementById("puntButton").remove();
  teams['away'].tol = 2;
  teams['home'].tol = 2;
  var parents = document.getElementsByClassName('teamTimeouts');
  for (let div of parents) {
    for (let i = 0; i < div.children.length; i++) {
      if (i !== 2) {
        div.children[i].style.visibility = "visible";
      } else {
        div.children[i].style.visibility = "hidden";
      }
    }
  }
  offense = 'home';
  touchback();
  gameClock = 100;
  possessions = 0;
  document.getElementById("scoreTime").children[1].style.display = 'none';
  document.getElementById("scoreTime").children[0].textContent = 'OT';
}

function advanceOT() {
  possessions++;
  console.log('advance:' + possessions);
  if (possessions % 2 == 0) {
    if (teams['away'].score == teams['home'].score) {
      //possessions++;
      quarter++;
      if (quarter == 7) {
        document.getElementById("patButton").remove();
      } else if (quarter == 9) {
        document.getElementById("fgButton").remove();
      }
      document.getElementById('scoreTime').children[0].textContent = ordinal(quarter);
      return true;
    } else {
      gameActive = false;
      gamePrimed = false;
      setTimeout(function() {stopPlayClock();}, 1000);
      document.getElementsByClassName('teamFinalPeriod')[0].textContent = `Final-${ordinal(quarter)}`;
      endGame();
      return false;
    }
  } else {
    return true;
    //possessions++;
  }
}

//resources

function getDistance(x) {
  if (offense == "away") {
    return x;
  } else {
    return 11 - x;
  }
}

function convertTime(time) {
  var secs = time % 60;
  var mins = (time - secs) / 60;
  if (secs < 10 && secs > -1) {
    secs = "0" + secs;
  } else if (secs < 0) {
    secs = "00";
  }
  return mins + ":" + secs;
}

function ordinal(num) {
  switch (num) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    case 4:
      return "4th";
    case 5:
      return "OT";
    default:
      return `${num - 4}OT`;
  }
}

function convertYardLine(yard) {
  if (offense == "home") {
    yard -= 11;
  }
  if (yard < -50 || yard > 50) {
    return "-";
  } else if (yard == 50 || yard == -50) {
    return "G";
  } else if (yard === 0) {
    return "50";
  } else if (yard % 10 === 0 && yard < 0) { //arrow on left
    return "<img src='left.png'>" + String(50 - Math.abs(yard));
  } else if (yard % 10 === 0 && yard > 0) { //arrow on left
    return String(Math.abs(50 - Math.abs(yard))) + "<img src='right.png'>";
  } else if (yard > 0) {
    return String(Math.abs(50 - Math.abs(yard)));
  } else if (yard < 0) {
    return String(Math.abs(50 - Math.abs(yard)));
  } else {
    return "ERR";
  }
}

function convCoordToNum(x,y) {
  return y * 12 + x;
}

function convNumToCoord(num) {
  return {
    x: num % 12,
    y: ((num - (num % 12)) / 12)
  }
}

function getDefense() {
  if (offense == "away") {
    return "home";
  } else {
    return "away";
  }
}

function getOpponent(team) {
  if (team == "away") {
    return "home";
  } else {
    return "away";
  }
}

function fieldGoalChance(yl) {
	var yardage;
	if (offense == "home") {
		yardage = Math.abs(50 + yl);
	} else {
		yardage = Math.abs(50 - yl);
	}
	var chance = (-0.04 * Math.pow(yardage,2) + 100);
	if (chance < 0) {
		chance = 0;
	}
	return chance.toFixed(1);
}

//key press

window.onkeydown = function(event) {
	if (offense == 'away' && gamePrimed == true) {
		if (event.keyCode == 87) { move(rb,{x:0,y:-1},'away');} //w
		if (event.keyCode == 83) { move(rb,{x:0,y:1},'away'); } //s
		if (event.keyCode == 65) { move(rb,{x:-1,y:0},'away'); } //a
		if (event.keyCode == 68) { move(rb,{x:1,y:0},'away'); } //d
	} else if (offense == 'home' && gamePrimed == true) {
		if (event.keyCode == 73) { move(rb,{x:0,y:-1},'home'); } //i
		if (event.keyCode == 75) { move(rb,{x:0,y:1},'home'); } //k
		if (event.keyCode == 74) { move(rb,{x:-1,y:0},'home'); } //j
		if (event.keyCode == 76) { move(rb,{x:1,y:0},'home'); } //l
	}
  if (gamePrimed === true && gameActive === false && event.keyCode === 84) {
    callTimeout('away');
  } else if (gamePrimed === true && gameActive === false && event.keyCode === 80) {
    callTimeout('home');
  }
}

function dpadTimeout(team) {
  if (gamePrimed === true && gameActive === false) {
    callTimeout(team);
  }
}
