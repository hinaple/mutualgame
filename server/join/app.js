if(!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
    swal({
        title: "PC 접속 감지됨",
        text: "이 게임은 모바일에 최적화되어있습니다.\nPC 접속을 권장하지 않으니 모바일 기기로 다시 접속해주세요!",
        icon: "warning",
        confirmButtonText: "확인"
    }).then(() => {
        let screen = document.getElementById("screen");
        screen.parentElement.removeChild(screen);
        let aTag = document.createElement('p');
        aTag.appendChild(document.createTextNode("PC접속을 권장하지 않습니다.\n모바일로 다시 접속해주세요."));
        aTag = document.body.appendChild(aTag).style.margin = "100px";
    });
}