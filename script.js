const colors = ["(109, 16, 20)","(197, 16, 26)","(249, 100, 16)","(255, 203, 5)","(159, 205, 22)","(84, 133, 182)","(0, 39, 76)","(47, 21, 189)","(185, 106, 189)","(117, 42, 117)","(235, 16, 154)","(138, 86, 57)","(136, 136, 136)","(16, 16, 16)"];
const darkColors = ["(93, 0, 4)","(181, 0, 10)","(233, 84, 0)","(239, 187, 0)","(143, 189, 0)","(68, 117, 166)","(0, 23, 60)","(31, 5, 173)","(169, 90, 173)","(101, 26, 101)","(219, 0, 138)","(122, 70, 41)","(120, 120, 120)","(0, 0, 0)"];
var down = 1;
var toGo = 10;
var lineofScrimm = 25;
var homeScore = 0;
var awayScore = 0;
var poss = "home";
var playClock = 7;
var periodLength = 300;
var gameClock = 300;
var updatePlayClock = -1;
var updateGameClock = -1;
var audio = false;
var awayColor = false;
var homeColor = false;
const fieldColor = "rgb(0, 153, 0)";
var gameGoing = false;
var gameActive = false;
const awayDefenders = [26,25,24,16,7];
const homeDefenders = [9,10,11,19,28];
var awayDefpos = [26,25,24,16,7];
var homeDefpos = [9,10,11,19,28];
var rbpos = 34;
var homeTOL = 3;
var awayTOL = 3;
var homeName = "HOME TEAM";
var awayName = "AWAY TEAM";
var activeTimeout = false;
var firstMove = true;
var amountMoved = 0;
var moveTackles;
var adjustment = 0;
var pat = false;
var goal = false;
var quarter = 1;
var overtime = false;
var defenderInterval = 500;
var mousedownID = -1;
const dpadElems = ["topDpad","leftDpad","botDpad","rightDpad"];
const dpadDx = [0,-1,0,1];
const dpadDy = [-1,0,1,0];
var controlStyle = 0;
const diagrams = ["KeyboardControls","LeftControlsMod","RightControlsMod"];

function touchback() {
	if (poss == "home" && overtime == false) {
		changePoss(-25);
	} else if (poss == "away" && overtime == false) {
		changePoss(25);
	} else if (poss == "home" && overtime == false) {
		changePoss(25);
	} else if (poss == "away" && overtime == false) {
		changePoss(-25);
	} else {
		//console.log('WTF');
	}
}

function clearPlayClock() {
	clearInterval(updatePlayClock);
	updatePlayClock = -1;
}

function safePlayClock() {
	if (updatePlayClock == -1) {
		runPlayClock();
	}
}

function clearGameClock() {
	clearInterval(updateGameClock);
	updateGameClock = -1;
}

function safeGameClock() {
	if (updateGameClock == -1) {
		runGameClock();
	}
}

function advance() {
	document.getElementById("setupCont").style.display = "none";
	document.getElementById("explainControls").style.display = "block";
}

function blink(elem) {
	var m = 0;
	var blinking = setInterval(function() {
		if (m % 2 == 0) {
			elem.style.backgroundColor = fieldColor;
		} else if (m % 2 == 1 && poss == "home") {
			elem.style.backgroundColor = awayColor;
		} else if (m % 2 == 1 && poss == "away") {
			elem.style.backgroundColor = homeColor;
		}
		if (m == 3) {
			clearInterval(blinking);
		}
		m++;
	}, 300);
}

function mousedown(event,dx,dy) {
	whilemousedown(dx,dy);
	if (mousedownID == -1) {
		mousedownID = setInterval(function() { whilemousedown(dx,dy); }, 100);
	}
}

function mouseup(event,dx,dy) {
	if(mousedownID != -1) {
		clearInterval(mousedownID);
		mousedownID=-1;
	}
}

function whilemousedown(dx,dy) {
	if (gameGoing == true) {
		moveRB(dx,dy);
	}
}

function setup() {
	for (var i = 0; i < dpadElems.length; i++) {
		(function(i) {
			document.getElementById(dpadElems[i]).addEventListener("touchstart",function(){ mousedown(event,dpadDx[i],dpadDy[i]); });
			document.getElementById(dpadElems[i]).addEventListener("touchend",function(){ mouseup(event,dpadDx[i],dpadDy[i]); });
		}(i));
	}
}

function chooseControls(opt) {
	var list = document.getElementsByClassName("boxControl");
	list[controlStyle].classList.remove("selectedBox");
	list[opt].classList.add("selectedBox");
	controlStyle = opt;
	var univ = document.getElementById("gameCont");
	var dpad = document.getElementById("fullDpad");
	var away = document.getElementById("awayTimeout");
	var home = document.getElementById("homeTimeout");
	document.getElementById("controlDiagram").src = diagrams[opt] + ".png";
	if (opt == 0) {
		univ.style.width = "100vw";
		univ.style.left = "0px";
		dpad.style.display = "none";
		away.style.display = "none";
		home.style.display = "none";
	} else {
		toMobile();
		univ.style.width = "calc(100vw - 260px)";
		dpad.style.display = "block";
		away.style.display = "block";
		home.style.display = "block";
		if (opt == 1) {
			away.style.right = "";
			home.style.right = "";
			away.style.left = "33px";
			home.style.left = "147px";
			dpad.style.right = "";
			dpad.style.left = "10px";
			univ.style.left = "260px";
		} else {
			away.style.left = "";
			home.style.left = "";
			away.style.right = "147px";
			home.style.right = "33px";
			dpad.style.left = "";
			dpad.style.right = "10px";
			univ.style.left = "0px";
		}
	}
}

function toMobile() {
	document.getElementById("scoreboard").classList.add("scoreboardMobile");
	document.getElementById("yardLine").classList.add("yardLineMobile");
	document.getElementById("field").classList.add("fieldMobile");
	document.getElementById("fieldCont").classList.add("fieldContMobile");
}

function setDifficulty(level) {
	var list = document.getElementsByClassName("boxLevel");
	for (var i = 0; i < list.length; i++) {
		list[i].classList.remove("selectedBox");
	}
	list[3 - level].classList.add("selectedBox");
	defenderInterval = 250 * level;
	if (defenderInterval == 0) {
		defenderInterval = 125;
	}
}

function confirmTeam(team) {
	var inputs = document.getElementsByClassName("nameInput");
	var errors = document.getElementsByClassName("error");
	var veils = document.getElementsByClassName("veil");
	var names = document.getElementsByClassName("teamName");
	var potName = inputs[team].value;
	if (potName.length > 8) {
		errors[team].innerHTML = "Team name cannot be longer than 8 characters.";
		return;
	} else if (potName == 0) {
		errors[team].innerHTML = "Please enter a team name.";
		return;
	} else if ((team == 0 && awayColor == false) || (team == 1 && homeColor == false)) {
		errors[team].innerHTML = "Please choose a color.";
		return;
	} else if (homeColor == awayColor) {
		errors[team].innerHTML = "Please pick a different color.";
		return;
	} else if (inputs[0].value.toUpperCase() == inputs[1].value.toUpperCase()) {
		errors[team].innerHTML = "Please choose a different name.";
		return;
	} else {
		errors[team].innerHTML = "";
		names[team].innerHTML = inputs[team].value.toUpperCase();
		if (team == 0) {
			//set away
			veils[0].style.display = "block";
			veils[1].style.display = "none";
			awayName = inputs[team].value.toUpperCase();
		} else if (team == 1) {
			//set home
			veils[1].style.display = "block";
			document.getElementById("botVeil").style.display = "none";
			homeName = inputs[team].value.toUpperCase();
		}
	}
}

function chooseColor(team,color) {
	var list = document.getElementsByClassName("colorCircle");
	var scores = document.getElementsByClassName("teamScore");
	var finals = document.getElementsByClassName("finalScore");
	var names = document.getElementsByClassName("teamName");
	var offset;
	if (team == 'a') {
		offset = 0;
		awayColor = "rgb" + colors[color];
		document.getElementById("awayTimeout").style.backgroundColor = awayColor;
	} else {
		offset = 1;
		homeColor = "rgb" + colors[color];
		document.getElementById("homeTimeout").style.backgroundColor = homeColor;
	}
	scores[offset].style.backgroundColor = "rgb" + darkColors[color];
	finals[offset].style.backgroundColor = "rgb" + darkColors[color];
	names[offset].style.backgroundColor = "rgb" + colors[color];
	for (var i = 0; i < 15; i++) {
		list[i + offset * 15].classList.remove("colorHighlight");
	}
	list[offset * 15 + color].classList.add("colorHighlight");
}

function launchOvertime() {
	//console.log('OT');
	quarter++;
	down = 1;
	toGo = 10;
	document.getElementById("message").style.display = "none";
	document.getElementById("messOvertime").style.display = "none";
	document.getElementById("messDoubleOvertime").style.display = "none";
	document.getElementById("messTripleOvertime").style.display = "none";
	document.getElementById("period").innerHTML = ordinal(quarter);
	document.getElementById("gameClock").innerHTML = "";
	poss = "away";
	overtime = true;
	changePoss(-25);
	gameGoing = true;
	gameClock = 4;
	updateDownDisplay();
	safePlayClock()
}

function twoPoint() {
	document.getElementById("message").style.display = "none";
	document.getElementById("messTD").style.display = "none";
	document.getElementById("downBox").innerHTML = "2 PT ATT";
	//console.log('2PT CONVERSION');
	if (poss == "home") {
		lineofScrimm = -45;
	} else {
		lineofScrimm = 45;
	}
	pat = true;
	resetField();
	gameGoing = true;
}

function extrapoint() {
	document.getElementById("message").style.display = "none";
	document.getElementById("messTD").style.display = "none";
	if (poss == "home" && overtime == false) {
		score('h',1,false);
	} else if (poss == "away" && overtime == false) {
		score('a',1,false);
	} else if (poss == "home" && overtime == true) {
		score('h',1,false);
	} else if (poss == "away" && overtime == true) {
		score('a',1,false);
	}
	touchback();
	gameGoing = true;
	clearPlayClock();
	clearGameClock()
	safeGameClock();
	safePlayClock()
	updateDownDisplay();
}

function goforit() {
	//console.log('Going for it');
	document.getElementById("message").style.display = "none";
	document.getElementById("messFourth").style.display = "none";
	resetforFourth();
	safeGameClock();
	safePlayClock()
}

function fieldGoalChance(dist) {
	var yardage
	if (poss == "home") {
		yardage = Math.abs(50 + dist);
	} else {
		yardage = Math.abs(50 - dist);
	}
	//var yardage = (50 - dist);
	var chance = (-0.04 * Math.pow(yardage,2) + 100);
	if (chance < 0) {
		chance = 0;
	}
	return chance.toFixed(1);
}

function moveDefenders() {
	//console.log('Moving defenders');
	moveTackles = setInterval(function() {
		var list = document.getElementsByClassName("cell");
		var randomDefender;
		var direction;
		if (amountMoved <= 6) {
			randomDefender = Math.floor(Math.random() * 3);
			if (poss == "home") {
				direction = 2;
			} else {
				direction = 3;
			}
		} else {
			randomDefender = Math.floor(Math.random() * 5);
			direction = Math.floor(Math.random() * 4);
		}
		var dx;
		var dy;
		if (direction == 0) {
			dx = 0;
			dy = 1;
		} else if (direction == 1) {
			dx = 0;
			dy = -1;
		} else if (direction == 2) {
			dx = 1;
			dy = 0;
		} else if (direction == 3) {
			dx = -1;
			dy = 0;
		}
		var tacklePos;
		if (poss == "home") {
			tacklePos = awayDefpos[randomDefender];
		} else {
			tacklePos = homeDefpos[randomDefender];
		}
		var newXPos = cellTocoord(tacklePos).x + dx;
		if (newXPos < 0 || newXPos > 11) {
			newXPos = cellTocoord(tacklePos).x - dx;
		}
		var newYPos = cellTocoord(tacklePos).y + dy;
		if (newYPos < 0 || newYPos > 2) {
			newYPos = cellTocoord(tacklePos).y - dy;
		}
		var moveTo = coordTocell(newXPos,newYPos);
		var moveTostate = list[moveTo].style.backgroundColor;
		if ((moveTostate == awayColor && poss == "home") || (moveTostate == homeColor && poss == "away")) {
			//console.log('Buttfumble');
		} else if ((moveTostate == awayColor && poss == "away") || (moveTostate == homeColor && poss == "home")) {
			if (pat == false) {
				tackled();
				blink(list[tacklePos]);
			} else {
				//console.log('Failed two point Def');
				blink(list[tacklePos]);
				firstMove = true;
				gameGoing = false;
				clearInterval(moveTackles);
				document.getElementById("downBox").innerHTML = "NO GOOD";
				setTimeout(function() {
					touchback();
					gameGoing = true;
					pat = false;
					clearPlayClock();
					resetPlayClock();
					updateDownDisplay();
				}, 2000);
			}
		} else {
			list[tacklePos].style.backgroundColor = fieldColor;
			if (poss == "home") {
				list[moveTo].style.backgroundColor = awayColor;
				awayDefpos[randomDefender] = moveTo;
			} else {
				list[moveTo].style.backgroundColor = homeColor;
				homeDefpos[randomDefender] = moveTo;
			}
		}
		amountMoved++;
	}, defenderInterval);
}

function timeout(team) {
	if (gameClock > 0) {
		clearGameClock();
		clearPlayClock();
		activeTimeout = true;
		gameGoing = false;
		var list = document.getElementsByClassName("timeout");
		var names = document.getElementsByClassName("teamName");
		if (team == 'h') {
			list[2 + homeTOL].style.visibility = "hidden";
			names[1].innerHTML = "TIMEOUT";
			setTimeout(function() { names[1].innerHTML = homeName; }, 5000);
			homeTOL--;
		} else {
			list[awayTOL - 1].style.visibility = "hidden";
			names[0].innerHTML = "TIMEOUT";
			setTimeout(function() { names[0].innerHTML = awayName; }, 5000);
			awayTOL--;
		}
		setTimeout(function() {
			playClock = 7;
			document.getElementById("playClock").innerHTML = "7";
			safePlayClock()
			//safeGameClock();
			gameGoing = true;
			activeTimeout = false;
		}, 5000);
	}
}

function moveRB(dx,dy) {
	if (firstMove == true) {
		clearGameClock()
		if (overtime == false) {
			safeGameClock();
		}
		moveDefenders();
		firstMove = false;
	}
	gameActive = true;
	clearPlayClock();
	var list = document.getElementsByClassName("cell");
	var xPos = cellTocoord(rbpos).x + dx;
	if (xPos < 0 && poss == "home") {
		xPos = 11;
		lineofScrimm -= 12;
		adjustment += 12;
		if (list[coordTocell(11,cellTocoord(rbpos).y)].style.backgroundColor == fieldColor) {
			updateFieldPos();
		}
	} else if (xPos > 11 && poss == "away") {
		xPos = 0;
		lineofScrimm += 12;
		adjustment += 12;
		if (list[coordTocell(0,cellTocoord(rbpos).y)].style.backgroundColor == fieldColor) {
			updateFieldPos();
		}
	}
	var yPos;
	if (cellTocoord(rbpos).y + dy <= 2 && cellTocoord(rbpos).y + dy >= 0) {
		yPos = cellTocoord(rbpos).y + dy;
	} else {
		return;
	}
	var moveTo = coordTocell(xPos,yPos);
	var toCond = list[moveTo].style.backgroundColor;
	var yardLines = document.getElementsByClassName("lineCell");
	if (poss == "home" && toCond == fieldColor) {
		list[moveTo].style.backgroundColor = homeColor;
		list[rbpos].style.backgroundColor = fieldColor;
		rbpos = moveTo;
		if (yardLines[cellTocoord(rbpos).x].innerHTML == "G" && pat == false) {
			//console.log('TOUCHDOWN');
			score('h',6,false);
			rbpos = 34;
			onScore();
		} else if (yardLines[cellTocoord(rbpos).x].innerHTML == "G" && pat == true) {
			c//onsole.log('2PT CONVERSION');
			score('h',2,false);
			clearInterval(moveTackles);
			gameGoing = false;
			firstMove = true;
			pat = false;
			setTimeout(function() {
				/*if (overtime == false) {
					changePoss(-25);
				} else {
					changePoss(25);
				}*/
				touchback();
				gameGoing = true;
				clearPlayClock();
				resetPlayClock();
				updateDownDisplay();
			}, 3500);
		}
	} else if (poss == "away" && toCond == fieldColor) {
		list[moveTo].style.backgroundColor = awayColor;
		list[rbpos].style.backgroundColor = fieldColor;
		rbpos = moveTo;
		if (yardLines[cellTocoord(rbpos).x].innerHTML == "G" && pat == false) {
			//console.log('TOUCHDOWN');
			score('a',6,false);
			rbpos = 1;
			onScore();
		} else if (yardLines[cellTocoord(rbpos).x].innerHTML == "G" && pat == true) {
			//console.log('2PT CONVERSION');
			score('a',2,false);
			clearInterval(moveTackles);
			pat = false;
			gameGoing = false;
			firstMove = true;
			setTimeout(function() {
				/*if (overtime == false) {
					changePoss(25);
				} else {
					changePoss(-25);
				}*/
				touchback();
				gameGoing = true;
				clearPlayClock();
				resetPlayClock();
				updateDownDisplay();
			}, 3500);
		}
	} else {
		//if tackled
		if (pat == false) {
			tackled();
		} else {
			//console.log('Failed two point');
			gameGoing = false;
			firstMove = true;
			clearInterval(moveTackles);
			document.getElementById("downBox").innerHTML = "NO GOOD";
			setTimeout(function() {
				touchback();
				gameGoing = true;
				pat = false;
				clearPlayClock();
				resetPlayClock();
				updateDownDisplay();
			}, 2000);
		}
		blink(list[moveTo]);
	}
}

function onScore() {
	gameGoing = false;
	gameActive = false;
	firstMove = true;
	awayDefpos = awayDefenders.slice(0);
	homeDefpos = homeDefenders.slice(0);
	clearInterval(moveTackles);
	clearGameClock()
	amountMoved = 0;
	adjustment = 0;
	setTimeout(function() {
		document.getElementById("message").style.display = "block";
		document.getElementById("messTD").style.display = "block";
	}, 3000);
}

function tackled() {
	if (poss == "home" && cellTocoord(rbpos).x == 0) {
		lineofScrimm += 12;
	} else if (poss == "away" && cellTocoord(rbpos).x == 11) {
		lineofScrimm -= 12;
	}
	gameActive = false;
	gameGoing = false;
	firstMove = true;
	awayDefpos = awayDefenders.slice(0);
	homeDefpos = homeDefenders.slice(0);
	clearInterval(moveTackles);
	amountMoved = 0;
	if (gameClock > 0) {
		setTimeout(function() {
			resetPlay();
			if (down !== 4) {
				resetPlayClock();
			}
			//adjustment = 0;
		}, 1500);
	}
}

function fieldGoal() {
	document.getElementById("message").style.display = "none";
	document.getElementById("messFourth").style.display = "none";
	var downDisplay = document.getElementById("downBox");
	downDisplay.innerHTML = String(50 - Math.abs(lineofScrimm) + 17) + " YD ATT";
	var bar = fieldGoalChance(lineofScrimm);
	var attempt = (Math.floor(Math.random() * 1000)) / 10;
	setTimeout(function() {
		//run 3 seconds off game clock
		if (overtime == false) {
			gameClock -= 3;
			if (gameClock < 3) {
				gameClock = 0;
				changePeriod();
			} else {
				safeGameClock();
			}
		}
		
		if (attempt <= bar) {
			//console.log('Field Goal');
			if (poss == "home") {
				score('h',3,false);
			} else {
				score('a',3,false);
			}
			setTimeout(function() {
				touchback();
				if (poss == "home" && overtime == false) {
					downDisplay.innerHTML = decodeEntities("1st & 10 &#9654;");
					downDisplay.style.backgroundColor = awayColor;
				} else if (poss == "away" && overtime == false) {
					downDisplay.innerHTML = decodeEntities("&#9664; 1st & 10");
					downDisplay.style.backgroundColor = homeColor;
				} else if (poss == "home" && overtime == false) {
					downDisplay.innerHTML = decodeEntities("1st & 10 &#9654;");
					downDisplay.style.backgroundColor = awayColor;
				} else if (poss == "away" && overtime == false) {
					downDisplay.innerHTML = decodeEntities("&#9664; 1st & 10");
					downDisplay.style.backgroundColor = homeColor;
				}
				gameGoing = true;
				clearPlayClock();
				safePlayClock()
			}, 3500);
		} else {
			downDisplay.innerHTML = "NO GOOD";
			setTimeout(function() {
				if (poss == "home") {
					downDisplay.innerHTML = decodeEntities("1st & 10 &#9654;");
					downDisplay.style.backgroundColor = awayColor;
				} else {
					downDisplay.innerHTML = decodeEntities("&#9664; 1st & 10");
					downDisplay.style.backgroundColor = homeColor;
				}
				changePoss(lineofScrimm);
				gameGoing = true;
			}, 1000);
		}
	}, 1500);
}

function punt() {
	document.getElementById("message").style.display = "none";
	document.getElementById("messFourth").style.display = "none";
	var distance = Math.floor(Math.random() * 20) + 35;
	if (poss == "home") {
		var newPos = lineofScrimm - distance;
	} else {
		var newPos = lineofScrimm + distance;
	}
	if (newPos <= -50) {
		newPos = -30;
	} else if (newPos >= 50) {
		newPos = 30;
	}
	changePoss(newPos);
	clearGameClock()
	if (overtime == false) {
		gameClock -= 3;
		if (gameClock < 3) {
			gameClock = 0;
			changePeriod();
		} else {
			safeGameClock();
		}
	}
	gameGoing = true;
	updateDownDisplay();
}

function changePeriod() {
	playClock = 7;
	firstMove = true;
	document.getElementById("playClock").innerHTML = "7";
	document.getElementById("playClock").classList.remove("redPlay");
	clearPlayClock();
	var display = document.getElementById("period");
	var downDisplay = document.getElementById("downBox");
	document.getElementById("gameClock").innerHTML = "0:00";
	gameGoing = false;
	if (quarter == 1 || quarter == 3) {
		if (quarter == 1) {
			downDisplay.innerHTML = "END OF Q1";
		} else {
			downDisplay.innerHTML = "END OF Q3";
		}
		setTimeout(function() {
			quarter++;
			document.getElementById("gameClock").innerHTML = toMins(gameClock);
			display.innerHTML = ordinal(quarter);
			gameClock = periodLength;
			clearInterval(runPlayClock);
			resetPlayClock();
			if (down !== 4) {
				safeGameClock();
			}
			updateDownDisplay();
			resetField();
			gameGoing = true;
		}, 1000);
	}
	if (quarter == 2) {
		downDisplay.innerHTML = "HALFTIME";
		document.getElementById("message").style.display = "none";
		if (down == 4) {
			document.getElementById("messFourth").style.display = "none";
		}
		setTimeout(function() {
			quarter++;
			display.innerHTML = ordinal(quarter);
			gameClock = periodLength;
			gameGoing = true;
			poss = "home";
			changePoss(-25);
			safeGameClock();
			updateDownDisplay();
		}, 2000);
	}
	if (quarter == 4) {
		document.getElementById("puntOption").style.display = "none";
		if (homeScore !== awayScore) {
			finalScore();
		} else {
			document.getElementById("message").style.display = "block";
			document.getElementById("messOvertime").style.display = "block";
		}
	}
	if (quarter == 5) {
		document.getElementById("extraOption").style.display = "none";
		if (homeScore !== awayScore) {
			finalScore();
		} else {
			document.getElementById("message").style.display = "block";
			document.getElementById("messDoubleOvertime").style.display = "block";
		}
	}
	if (quarter == 6) {
		document.getElementById("fieldOption").style.display = "none";
		if (homeScore !== awayScore) {
			finalScore();
		} else {
			document.getElementById("message").style.display = "block";
			document.getElementById("messTripleOvertime").style.display = "block";
		}
	}
	if (quarter == 7) {
		if (homeScore !== awayScore) {
			finalScore();
		} else {
			document.getElementById("message").style.display = "block";
			document.getElementById("messCoinFlip").style.display = "block";
			document.getElementById("coinPrompt").innerHTML = awayName + ", what is your call?";
		}
	}
}

function flipCoin(call) {
	var flip = Math.floor(Math.random() * 2);
	if (flip == call) {
		awayScore++;
	} else {
		homeScore++;
	}
	document.getElementById("messCoinFlip").style.display = "none";
	finalScore();
}

function finalScore() {
	document.getElementById("message").style.display = "block";
	document.getElementById("messWinner").style.display = "block";
	var scores = document.getElementsByClassName("finalScore");
	var names = document.getElementsByClassName("finalName");
	//scores[1].style.backgroundColor = homeColor;
	//scores[0].style.backgroundColor = awayColor;
	names[1].style.backgroundColor = homeColor;
	names[0].style.backgroundColor = awayColor;
	names[1].innerHTML = homeName;
	names[0].innerHTML = awayName;
	scores[1].innerHTML = homeScore;
	scores[0].innerHTML = awayScore;
	if (homeScore > awayScore) {
		document.getElementById("winnerMessage").innerHTML = "Congrats " + homeName + "!";
		scores[1].style.color = "#ffbf27";
	} else {
		document.getElementById("winnerMessage").innerHTML = "Congrats " + awayName + "!";
		scores[0].style.color = "#ffbf27";
	}
	
}

function resetforFourth() {
	if (poss == "home") {
		rbpos = 34;
	} else {
		rbpos = 1;
	}
	down = 4;
	gameGoing = true;
	updateDownDisplay();
	resetField();
}

function resetPlay() {
	var forwardProgress;
	if (poss == "home") {
		forwardProgress = (11 - cellTocoord(rbpos).x) + adjustment;
		lineofScrimm = lineofScrimm - (11 - cellTocoord(rbpos).x);
	} else {
		forwardProgress = cellTocoord(rbpos).x + adjustment;
		lineofScrimm = lineofScrimm + cellTocoord(rbpos).x;
	}
	adjustment = 0;
	toGo = toGo - forwardProgress;
	if (toGo <= 0) {
		toGo = 10;
		down = 1;
		if ((poss == "home" && lineofScrimm <= -40) || (poss == "away" && lineofScrimm >= 40)) {
			goal = true;
			var goalLine;
			if (poss == "home") {
				goalLine = -50;
			} else {
				goalLine = 50;
			}
			toGo = Math.abs(goalLine - lineofScrimm);
		}
	} else {
		down++;
	}
	if (down == 4) {
		document.getElementById("message").style.display = "block";
		document.getElementById("messFourth").style.display = "block";
		document.getElementById("fgChance").innerHTML = "Your chance is: " + fieldGoalChance(lineofScrimm) + "%";
		clearGameClock()
		clearPlayClock();
	} else if (down > 4) {
		//console.log('Turnover on Downs');
		changePoss(lineofScrimm);
		gameGoing = true;
	} else {
		document.getElementById("playClock").innerHTML = "7";
		playClock = 7;
		gameGoing = true;
		if (poss == "home") {
			rbpos = 34;
		} else {
			rbpos = 1;
		}
	}
	if (down !== 4) {
		updateDownDisplay();
		resetField();
	}
}

function changePoss(line) {
	if (overtime == true) {
		gameClock--;
		if (gameClock == 0) {
			changePeriod();
		}
	}
	toGo = 10;
	down = 1;
	goal = false;
	var scrim = document.getElementById("los");
	var toMak = document.getElementById("ltm");
	if (poss == "home") {
		poss = "away";
		scrim.style.left = "calc((100% / 12 * 1) - 2px)";
		toMak.style.left = "calc((100% / 12 * 11) - 2px)";
		rbpos = 1;
	} else {
		poss = "home";
		scrim.style.left = "calc((100% / 12 * 11) - 2px)";
		toMak.style.left = "calc((100% / 12 * 1) - 2px)";
		rbpos = 34;
	}
	lineofScrimm = line;
	resetField();
}

function resetField() {
	//resets colors
	var list = document.getElementsByClassName("cell");
	for (var j = 0; j < list.length; j++) {
		list[j].style.backgroundColor = fieldColor;
	}
	if (poss == 'home') {
		for (var i = 0; i < homeDefenders.length; i++) {
			list[awayDefenders[i]].style.backgroundColor = awayColor;
		}
		list[34].style.backgroundColor = homeColor;
	} else if (poss == 'away') {
		for (var k = 0; k < homeDefenders.length; k++) {
			list[homeDefenders[k]].style.backgroundColor = homeColor;
		}
		list[1].style.backgroundColor = awayColor;
	}
	if (poss == "home") {
		rbpos = 34;
	} else {
		rbpos = 1;
	}
	updateFieldPos();
}

function startGame() {
	document.getElementById("initCont").style.display = "none";
	var signal = document.getElementById("countdown");
	signal.style.display = "block";
	periodLength = document.getElementById('quarterTime').value;
	gameClock = periodLength;
	document.getElementById("gameClock").innerHTML = toMins(gameClock);
	resetField();
	updateDownDisplay();
	var counter = 3;
	var counting = setInterval(function() {
		counter--;
		signal.innerHTML = counter;
		if (counter == 0) {
			signal.innerHTML = "GO";
		} else if (counter == -1) {
			safeGameClock();
			safePlayClock()
			clearInterval(counting);
			gameGoing = true;
			signal.style.display = "none";
		}
	}, 1000);
}

function updateFieldPos() {
	//moves yard lines
	var startPos = lineofScrimm;
	if (poss == "home") {
		startPos = startPos - 11;
	}
	var index = document.getElementsByClassName("lineCell");
	for (var i = 0; i < index.length; i++) {
		index[i].innerHTML = fieldLine(startPos + i);
	}
	var scrim = document.getElementById("los");
	var toMak = document.getElementById("ltm");
	var leftToShow;
	if (adjustment == 0) {
		los.style.display = "block";
		toMak.style.display = "block";
		if (poss == "home") {
			scrim.style.left = "calc((100% / 12 * 11) - 2px)";
			if ((11 - toGo) >= 1) {
				toMak.style.left = "calc((100% / 12 * " + String(11 - toGo) + ") - 2px)";
			} else {
				toMak.style.display = "none";
			}
		} else {
			scrim.style.left = "calc((100% / 12) - 2px)";
			if ((toGo + 1) <= 11) {
				toMak.style.left = "calc((100% / 12 * " + String(toGo + 1) + ") - 2px)";
			} else {
				toMak.style.display = "none";
			}
		}
	} else {
		scrim.style.display = "none";
		leftToShow = toGo - adjustment;
		if (leftToShow > 0) {
			toMak.style.display = "block";
			if (poss == "home") {
				toMak.style.left = "calc((100% / 12 * " + String(11 - leftToShow) + ") - 2px)";
			} else {
				toMak.style.left = "calc((100% / 12 * " + String(leftToShow + 1) + ") - 2px)";
			}
		} else {
			toMak.style.display = "none";
		}
	}
	
	//check for safety
	if (poss == "home" && lineofScrimm >= 50) {
		//console.log('Safety');
		score('a',2,true);
		gameGoing = false;
		changePoss(-20);
		updateDownDisplay();
		clearGameClock()
		clearPlayClock();
		setTimeout(function() {
			safeGameClock();
			safePlayClock()
			gameGoing = true;
		}, 3000);
	} else if (poss == "away" && lineofScrimm <= -50) {
		//console.log('Safety');
		score('h',2,true);
		gameGoing = false;
		changePoss(20);
		updateDownDisplay();
		clearGameClock()
		clearPlayClock();
		setTimeout(function() {
			safeGameClock();
			safePlayClock()
			gameGoing = true;
		}, 3000);
	}
}

function score(team,point,issafety) {
	//console.log("team " + team + " scored " + point + " point(s)");
	var list = document.getElementsByClassName("teamScore");
	//animation
	if (point !== 1) {
		var text;
		if (point == 2 && issafety == false) {
			text = "2PT CONVERSION";
		} else if (point == 2 && issafety == true) {
			text = "SAFETY";
		} else if (point == 3) {
			text = "FIELD GOAL";
		} else if (point == 6) {
			text = "TOUCHDOWN";
		}
		var elem = document.getElementById("scoring");
		elem.innerHTML = text;
		elem.style.display = "block";
		var scoreClass;
		if (team == 'h') {
			elem.style.backgroundColor = homeColor;
		} else if (team == 'a') {
			elem.style.backgroundColor = awayColor;
		}
		var j = 0;
		var ani = setInterval(function() {
			elem.style.letterSpacing = String(Number(j / 2) + 1) + "px";
			j++;
			if (j == 20) {
				//update scoreboard
				if (team == 'h') {
					homeScore += point;
					list[1].innerHTML = homeScore;
				} else if (team == 'a') {
					awayScore += point;
					list[0].innerHTML = awayScore;
				}
			}
			if (j >= 40) {
				clearInterval(ani);
			}
		}, 50);
		setTimeout(function() {
			elem.style.display = "none";
			elem.classList.remove(scoreClass);
		}, 3000);
	} else {
		if (team == 'h') {
			homeScore++;
			list[1].innerHTML = homeScore;
		} else {
			awayScore++;
			list[0].innerHTML = awayScore;
		}
	}
}

function resetPlayClock() {
	document.getElementById("playClock").innerHTML = "7";
	playClock = 7;
	safePlayClock()
}

function runGameClock() {
	var gameClockDisplay = document.getElementById("gameClock");
	if (overtime == false) {
		updateGameClock = setInterval(function() {
			gameClock--;
			if (gameClock <= 0 && gameActive == false) {
				changePeriod();
				clearGameClock()
				gameClock = 0;
			} else if (gameClock <= 0 && gameActive == true) {
				gameClock = 0;
			}
			gameClockDisplay.innerHTML = toMins(gameClock);
		}, 1000);
	} else {
	}
}

function runPlayClock() {
	var playClockDisplay = document.getElementById("playClock");
	playClockDisplay.classList.remove("redPlay");
	updatePlayClock = setInterval(function() {
		if (gameClock <= 0) {
			clearPlayClock();
		}
		playClock--;
		if (playClock >= 0) {
			playClockDisplay.innerHTML = playClock;
		}
		if (playClock == 2) {
			playClockDisplay.classList.add("redPlay");
		}
		if (playClock == 0) {
			//console.log('Delay of Game');
			gameGoing = false;
			clearPlayClock();
			clearGameClock()
			if (audio == true) {
				document.getElementById("whistleSound").play();
			}
			if (poss == "home") {
				lineofScrimm += 5;
			} else {
				lineofScrimm -= 5;
			}
			//still delay of game
			setTimeout(function() { 
				gameGoing = true;
				resetPlayClock();
				toGo += 5;
				resetField();
				if (pat == false) {
					updateDownDisplay();
				}
			}, 3000);
		}
	}, 1000);
}

function updateDownDisplay() {
	var elem = document.getElementById("downBox");
	var remain = toGo;
	if (goal == true) {
		remain = "GOAL";
	}
	if (poss == "home") {
		elem.innerHTML = decodeEntities("&#9664; " + ordinal(down) + " & " + remain);
		elem.style.backgroundColor = homeColor;
	} else {
		elem.innerHTML = decodeEntities(ordinal(down) + " & " + remain + " &#9654;");
		elem.style.backgroundColor = awayColor;
	}
}

function toMins(time) {
	var secs = time % 60;
	if (secs < 10) {
		secs = "0" + secs;
	}
	var mins = (time - secs) / 60;
	return mins + ":" + secs;
}

function cellTocoord(cellNum) {
	var col = cellNum % 3;
	var row = (cellNum - col) / 3;
	return {
		x: row,
		y: col
	};
}

function coordTocell(x,y) {
	return x * 3 + y;
}

function fieldLine(pos) {
	var display = 50 - Math.abs(pos);
	if (pos % 10 == 0 && pos < 0 && pos > -50) {
		display = "&#9664; " + display;
	} else if (pos % 10 == 0 && pos > 0 && pos < 50) {
		display = display + " &#9654;";
	} else if (pos == -50 || pos == 50) {
		display = "G";
	} else if (pos < -50 || pos > 50) {
		display = "-";
	}
	return decodeEntities(display);
}

function ordinal(num) {
	if (num == 1) { return "1st"; }
	if (num == 2) { return "2nd"; }
	if (num == 3) { return "3rd"; }
	if (num == 4) { return "4th"; }
	if (num == 5) { return "OT"; }
	if (num == 6) { return "2OT"; }
	if (num == 7) { return "3OT"; }
}

window.onkeydown = function(event) {
	if (gameGoing == true) {
		if (poss == "away") {
			if (event.keyCode == 87) { moveRB(0,-1); }
			if (event.keyCode == 83) { moveRB(0,1); }
			if (event.keyCode == 65) { moveRB(-1,0); }
			if (event.keyCode == 68) { moveRB(1,-0); }
		} else {
			if (event.keyCode == 73) { moveRB(0,-1); }
			if (event.keyCode == 75) { moveRB(0,1); }
			if (event.keyCode == 74) { moveRB(-1,0); }
			if (event.keyCode == 76) { moveRB(1,-0); }
		}
		if (event.keyCode == 84 && gameActive == false && activeTimeout == false) { timeout('a'); }
		if (event.keyCode == 80 && gameActive == false && activeTimeout == false) { timeout('h'); }
	}
}

var decodeEntities = (function() {
	var element = document.createElement('div');
	function decodeHTMLEntities (str) {
		if(str && typeof str === 'string') {
			str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
			str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
			element.innerHTML = str;
			str = element.textContent;
			element.textContent = '';
		}
		return str;
	}
	return decodeHTMLEntities;
})();
