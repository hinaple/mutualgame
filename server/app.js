const screen = document.getElementById("screen");
let questions = null;
let isHost = null;
let qindex = -1;
let queElement = null;
let ways = [null, null];
let changed = false;
let selected = null;

if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
    swal({
        title: "PC 접속 감지됨",
        text: "이 게임은 모바일에 최적화되어있습니다.\nPC 접속을 권장하지 않으니 모바일 기기로 다시 접속해주세요!",
        icon: "warning",
        button: "확인"
    }).then(() => {
        let screen = document.getElementById("screen");
        screen.parentElement.removeChild(screen);
        let aTag = document.createElement('p');
        aTag.appendChild(document.createTextNode("PC접속을 권장하지 않습니다.\n모바일로 다시 접속해주세요."));
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
        get(dir).then(res => {
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
}

function select(num) {
    if(selected !== null) return;
    ways[num == 0? 1: 0].style.backgroundColor = "#242219";
    ways[num].style.backgroundColor = "#f0ebd8";
    selected = changed? (num == 0? 1: 0): num;
    socket.emit("select", changed? (num == 0? 1: 0): num);
}

rend("main.html");

const socket = io();

socket.on("dscnct", () => {
    swal({
        title: "상대와의 연결이 끊어졌습니다!",
        text: "메인으로 돌아가서 다시 연결하세요.",
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
        await sleep(3000);
    }

    selected = null;
    await rend("game.html");

    queElement = document.getElementById("question");
    ways[0] = document.getElementById("way0");
    ways[1] = document.getElementById("way1");

    changed = Math.random > 0.5? true: false;
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

/*====host part from here====*/
function host() {
    rend("host.html").then(() => socket.emit("host"));
}

let code = null;
socket.on("code", data => {
    code = data;
    document.getElementById("code").value = "yeegu.me/" + code;
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
    cd = cd.replace(/(?:https?:(?:\/\/)?)?(?:yeegu\.me\/)?([a-z0-9]{6})\/?/i, "$1");
    if(cd.length != 6) swal({
        title: "잘못된 코드입니다!",
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
        title: "존재하지 않는 코드입니다!",
        icon: "error",
        button: "확인"
    });
})