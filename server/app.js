const screen = document.getElementById("screen");
let sounds = [];
sounds.push(new Audio());
sounds[0].src = "../sounds/main.mp3";
sounds[0].volume = 0.8;
sounds[0].loop = true;
sounds.push(new Audio());
sounds[1].src = "../sounds/bgm.mp3";
sounds[1].volume = 0.8;
sounds[1].loop = true;
let questions = null;
let isHost = null;
let qindex = -1;
let queElement = null;
let ways = [null, null];
let changed = false;
let selected = null;
let resultData = null;
let names = [null, null];

if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
    swal({
        title: "PC 접속 감지됨",
        text: "이 게임은 모바일에 최적화되어있습니다😥\n"
        +"PC 접속을 권장하지 않으니 모바일 기기로 다시 접속해주세요!🙏",
        icon: "warning",
        button: "확인"
    }).then(() => {
        let screen = document.getElementById("screen");
        screen.parentElement.removeChild(screen);
        let aTag = document.createElement('p');
        aTag.appendChild(document.createTextNode("PC접속을 권장하지 않습니다😥\n"
        +"모바일로 다시 접속해주세요."));
        document.body.appendChild(aTag).style.margin = "100px";
    });
}

const get = url => new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.open('GET', url);
    req.send();
  
    req.onreadystatechange = function () {
        if (req.readyState == XMLHttpRequest.DONE) {
            if (req.status == 200) resolve(req.response);
            else reject(req.statusText);
        }
    };
});

const sleep = msec => new Promise((resolve, reject) => {
    setTimeout(resolve, msec);
});

function rend(dir) {
    return new Promise(resolve => {
        get("../pages/" + dir).then(res => {
            screen.innerHTML = res;
            resolve(true);
        });
    });
}

function copy() {
    var copyText = document.getElementById("code");
    copyText.select();
    document.execCommand("Copy");
}

function reset() {
    questions = null
    isHost = null;
    qindex = null;
    queElement = null;
    ways = [null, null];
    changed = false;
    selected = null;
    resultData = null;
    names = [null, null];
}

function select(num) {
    if(selected !== null) return;
    ways[num == 0? 1: 0].style.backgroundColor = "#242219";
    ways[num].style.backgroundColor = "#f0ebd8";
    selected = changed? (num == 0? 1: 0): num;
    socket.emit("select", changed? (num == 0? 1: 0): num);
}

function result() {
    let myName = document.getElementById("myname").value;
    if(myName.length <= 0) {
        swal({
            title: "이름을 입력해주세요!",
            icon: "warning",
            button: "확인"
        });
        return;
    }
    if(myName.length >= 6) {
        swal({
            title: "이름은 6글자보다 짧게 해주세요!",
            icon: "warning",
            button: "확인"
        });
        return;
    }
    names[0] = myName;
    document.getElementById("myname").setAttribute("disable", "disable");
    let resultbtn = document.getElementById("resultbtn");
    resultbtn.setAttribute("onlick", "");
    resultbtn.style.backgroundColor = "#242219";
    resultbtn.textContent = "로딩중..."
    socket.emit("name", names[0]);
    if(names[1] !== null) {
        rend("fin.html").then(() => {
            sounds[1].pause();
            sounds[1].currentTime = 0;
            sounds[0].currentTim = 0;
            sounds[0].play();
            let score = 0;
            for(let i = 0; i < resultData.length; i++) {
                if(resultData[i]) score++;
            }
            document.getElementById("name0").textContent = names[0];
            document.getElementById("name1").textContent = names[1];
            document.getElementById("score").textContent = (score * 10) + '%';
        });
    }
}

function capture() {
    html2canvas(document.body).then(canvas => {
        var el = document.getElementById("captured");
        el.href = canvas.toDataURL("image/jpeg");
        el.download = '이구동성.jpg';
        el.click();
    });
}

function goHome() {
    swal({
        title: "메인으로 돌아가실래요?",
        text: "진행중인 게임이 있으면 종료됩니다!",
        icon: "warning",
        buttons: {
            cancel: {
                text: "취소",
                value: false,
                visible: true
            },
            confirm: {
                text: "확인",
                value: true,
                visible: true
            }
        }
    }).then(tmp => {
        if(tmp) location.reload();
    })
}

function start() {
    rend("main.html").then(() => sounds[0].play());
}


const socket = io();

socket.on("dscnct", () => {
    swal({
        title: "상대와의 연결이 끊어졌습니다😫",
        text: "메인으로 돌아가서 다시 연결해주세요.",
        icon: "error",
        button: "확인"
    }).then(() => location.reload());
    reset();
});

socket.on("play", async data => {
    if(data.match !== null) {
        if(data.match === 0) {
            if(selected == 2)
                queElement.textContent = "다음엔 조금 더 빨리 골라볼까요?⏱";
            else queElement.textContent = "상대방의 선택이 조금 느렸네요⏱";
        }
        else if(data.match === true) 
            queElement.textContent = "상대방과 같은 선택지를 골랐네요!🙌";
        else if(data.match === false)
            queElement.textContent = "상대방과 다른 선택지를 골랐어요😥";

        let greenload = document.getElementById("greenload");
        greenload.style.opacity = "1";
        greenload.style.animation = "loadbar 3s linear";
        await sleep(3000);
    }
    else {
        sounds[0].pause();
        sounds[0].currentTime = 0;
        sounds[1].currentTime = 0;
        sounds[1].play();
    }
    if(data.index === 'e') {
        resultData = data.result;
        rend("name.html");
        return;
    }
    selected = null;
    await rend("game.html");

    queElement = document.getElementById("question");
    ways[0] = document.getElementById("way0");
    ways[1] = document.getElementById("way1");

    changed = Math.random() > 0.5? true: false;
    queElement.textContent = questions[data.index].question;
    ways[changed? 0: 1].textContent = questions[data.index].ways[0];
    ways[changed? 1: 0].textContent = questions[data.index].ways[1];
    await sleep(3000);
    if(selected === null) {
        selected = 2;
        ways[0].style.backgroundColor = "#242219";
        ways[1].style.backgroundColor = "#242219";
        socket.emit("select", false);
    }
});

socket.on("name", data => {
    names[1] = data;
    if(names[0] !== null) {
        rend("fin.html").then(() => {
            sounds[1].pause();
            sounds[1].currentTime = 0;
            sounds[0].currentTim = 0;
            sounds[0].play();
            let score = 0;
            for(let i = 0; i < resultData.length; i++) {
                if(resultData[i]) score++;
            }
            document.getElementById("name0").textContent = names[0];
            document.getElementById("name1").textContent = names[1];
            document.getElementById("score").textContent = (score * 10) + '%';
        });
    }
})

/*====host part from here====*/
function host() {
    rend("host.html").then(() => socket.emit("host"));
}

let code = null;
socket.on("code", data => {
    code = data;
    document.getElementById("code").value =  code;
}); 

socket.on("start", data => {
    questions = data;
    isHost = true;
    qindex = 0;
    socket.emit("ready", qindex);
});

/*====join part from here====*/
function join() {
    let cd = document.getElementById("code").value;
    //cd = cd.replace(/(?:https?:(?:\/\/)?)?(?:yeegu\.me\/)?([a-z0-9]{6})\/?/i, "$1");
    if(cd.length != 6) swal({
        title: "잘못된 형식의 코드입니다😫",
        icon: "warning",
        button: "확인"
    });
    else socket.emit("join", cd);
}

socket.on("joinCheck", data => {
    if(data.bool) {
        questions = data.que;
        isHost = true;
        qindex = 0;
        socket.emit("ready", qindex);
    }
    else swal({
        title: "존재하지 않는 코드입니다😫",
        icon: "error",
        button: "확인"
    });
})