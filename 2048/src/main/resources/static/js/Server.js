var stompClient = null;
/*记录玩家们的列表（姓名，分数，游戏盘）*/
/* 比如 [{"name":"n75q(randomForTest)","score":"0.0","playBoard":[[0,0,0,2],[0,0,0,0],[0,0,0,2],[0,0,0,0]]}
,{"name":"y7zv(randomForTest)","score":"0.0","playBoard":[[0,2,0,0],[0,0,0,2],[0,0,0,0],[0,0,0,0]]}]*/
var myList;
var startTime=new Date().getTime();


var PunishTriggered256=0;
var PunishTriggered518=0;
var PunishTriggered1024=0;

var PunishTriggeredO256=0;
var PunishTriggeredO518=0;
var PunishTriggeredO1024=0;


//连接服务器
connect();

function connect() {
    var socket = new SockJS('/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        /* 申请topic/Scores，client每send一次，就会执行一次funtion中的函数*/
        stompClient.subscribe('/topic/Scores', function (greeting) {
            updateMyList(JSON.parse(greeting.body));
        });
    });
}

/*发送数据到服务器端*/
function sendScore(name,score,arr,max,max_x,max_y) {
    /* 提取arr */
    var playBoard=new Array();
    var i, j;
    for (i = 0; i < 4; i++) {
        playBoard[i] = new Array();
        for (j = 0; j < 4; j++) {
            playBoard[i][j]=arr[i][j].value;
        }
    }


    console.log(JSON.stringify({
        'name': name,
        'score': score,
        'playboard':playBoard,
        'max':max,
        'max_x':max_x,
        'max_y':max_y,
        'timeStamp': (new Date().getTime() - startTime)
    }));
    stompClient.send("/app/hello", {}, JSON.stringify({
        'name': name,
        'score': score,
        'playBoard':playBoard,
        'max':max,
        'max_x':max_x,
        'max_y':max_y,
        'timeStamp': (new Date().getTime() - startTime)
    }));
}

/* 更新前端排行榜 */
function updateRanking(){
    var tmplist=myList; //玩家列表
    /*mylist（两个人）*/
    if(myList.length==2){
        if(parseFloat(tmplist[0].score)<parseFloat(tmplist[1].score)){
            document.getElementById("rank_1").innerHTML="1";
            document.getElementById("rankName_1").innerHTML=tmplist[1].name;
            document.getElementById("rankScore_1").innerHTML=tmplist[1].score;
            document.getElementById("rank_2").innerHTML="2";
            document.getElementById("rankName_2").innerHTML=tmplist[0].name;
            document.getElementById("rankScore_2").innerHTML=tmplist[0].score;
        }else{
            document.getElementById("rank_2").innerHTML="2";
            document.getElementById("rankName_2").innerHTML=tmplist[1].name;
            document.getElementById("rankScore_2").innerHTML=tmplist[1].score;
            document.getElementById("rank_1").innerHTML="1";
            document.getElementById("rankName_1").innerHTML=tmplist[0].name;
            document.getElementById("rankScore_1").innerHTML=tmplist[0].score;
        }
    }/*mylist（一个人）*/
    else{
        document.getElementById("rank_1").innerHTML="1";
        document.getElementById("rankName_1").innerHTML=tmplist[0].name;
        document.getElementById("rankScore_1").innerHTML=tmplist[0].score;
    }
}

/*每当对方做出操作，更新缩略图*/
function updateBoard(){
    var opponentBoard=new Array();
    /*判断一下哪个是对手的游戏盘*/
    var i,j;
    /*若当前页面的名字不等于myList[0].name，则myList[0].playBoard是对手的游戏盘（4*4的二维数组）*/
    if(myList[0].name!=g.name){
        for(i=0;i<4;i++){
            opponentBoard[i]=new Array();
            for(j=0;j<4;j++)
                opponentBoard[i][j]=myList[0].playBoard[i][j];
        }
    }
    /*反之，myList[1].playBoard是对手的游戏盘*/
    else{
        for(i=0;i<4;i++){
            opponentBoard[i]=new Array();
            for(j=0;j<4;j++)
                opponentBoard[i][j]=myList[1].playBoard[i][j];
        }
    }

    /*画出对手的缩略图*/
    for(i=0;i<4;i++)
        for(j=0;j<4;j++){
            //console.log(opponentBoard[i][j]);
            var item =
                        '<div class="number_cell2 spos' +
                        i +
                        j +
                        '" ><a class="number_cell_con2 sn' +
                        0 +
                        '"><div class="span_wrap2"><span>' +
                        0 +
                        "</span></div></a></div>";
                        $(".box2").append(item);
        }

    for (i = 0; i < 4; i++) {
          for (j = 0; j < 4; j++)
           {
            var item =
            '<div class="number_cell2 spos' +
            i +
            j +
            '" ><a class="number_cell_con2 sn' +
            opponentBoard[i][j] +
            '"><div class="span_wrap2"><span>' +
            opponentBoard[i][j] +
            "</span></div></a></div>";
            $(".box2").append(item);
          }


}

}


function updateboardIfPunish(i,max_x,max_y){
    myList[i].playBoard[max_x][max_y]=myList[i].playBoard[max_x][max_y]/2;
    updateBoard();
}


function  callPunishOrRewardsIfMax() {

    if(myList[0].name==g.name){
        if((PunishTriggered256 == 0 && myList[1].max == 32 )
            || (PunishTriggered518 == 0 && myList[1].max == 518 )
            || (PunishTriggered1024 == 0 && myList[1].max == 1024) ){
            console.log("很遗憾，宁的对手分数达到了256，518，1024，给宁惩罚");
            //Notice(myList[1].max);
            g.Punish(myList[0].max_x,myList[0].max_y);
            Notice(myList[1].max);
            if(myList[1].max == 32) PunishTriggered256=1;
            if(myList[1].max == 518) PunishTriggered518=1;
            if(myList[1].max == 1024) PunishTriggered1024=1;


            console.log("hhhhh");
            console.log(g.arr[myList[0].max_x][myList[0].max_y]);
            sendScore(
                g.name,
                g.score,
                g.arr,
                g.Max_Num,
                g.Max_Num_x,
                g.Max_Num_y
            );
        }
    }else{
        if((PunishTriggered256 == 0 && myList[0].max == 32 )
            || (PunishTriggered518 == 0 && myList[0].max == 518 )
            || (PunishTriggered1024 == 0 && myList[0].max == 1024)){
            console.log("很遗憾，宁的对手分数达到了256，518，1024，给宁惩罚");
            //Notice(myList[0].max);
            g.Punish(myList[1].max_x,myList[1].max_y);
            Notice(myList[0].max);

            if(myList[0].max == 32) PunishTriggered256=1;
            if(myList[0].max == 518) PunishTriggered518=1;
            if(myList[0].max == 1024) PunishTriggered1024=1;

            console.log("hhhhh");
            console.log(g.arr[myList[1].max_x][myList[1].max_y]);
            sendScore(
                g.name,
                g.score,
                g.arr,
                g.Max_Num,
                g.Max_Num_x,
                g.Max_Num_y
            );
        }
    }

    //自己到256的
    // if(myList[0].name==g.name){
    //     if((PunishTriggeredO256 == 0 && myList[0].max == 32 )
    //         || (PunishTriggeredO518 == 0 && myList[0].max == 518 )
    //         || (PunishTriggeredO1024 == 0 && myList[0].max == 1024) ){
    //
    //         if(myList[0].max == 32) updateboardIfPunish(1,myList[1].max_x,myList[1].max_y);
    //         if(myList[0].max == 518) updateboardIfPunish(1,myList[1].max_x,myList[1].max_y);
    //         if(myList[0].max == 1024) updateboardIfPunish(1,myList[1].max_x,myList[1].max_y);
    //
    //         if(myList[0].max == 32) PunishTriggeredO256=1;
    //         if(myList[0].max == 518) PunishTriggeredO518=1;
    //         if(myList[0].max == 1024) PunishTriggeredO1024=1;
    //
    //     }
    // }else{
    //     if((PunishTriggeredO256 == 0 && myList[1].max == 32 )
    //         || (PunishTriggeredO518 == 0 && myList[1].max == 518 )
    //         || (PunishTriggeredO1024 == 0 && myList[1].max == 1024) ){
    //
    //         if(myList[1].max == 32) updateboardIfPunish(0,myList[0].max_x,myList[0].max_y);
    //         if(myList[1].max == 518) updateboardIfPunish(0,myList[0].max_x,myList[0].max_y);
    //         if(myList[1].max == 1024) updateboardIfPunish(0,myList[0].max_x,myList[0].max_y);
    //
    //         if(myList[1].max == 32) PunishTriggeredO256=1;
    //         if(myList[1].max == 518) PunishTriggeredO518=1;
    //         if(myList[1].max == 1024) PunishTriggeredO1024=1;
    //
    //     }
    // }



}

function judgeWinner(){
    if(myList[0].timeStamp>100000){
        if(myList[0].name==g.name){
            if(myList[0].score>myList[1].score){
                Show_res_win();
                startTime=new Date().getTime();
            }else{
                Show_res_lose();
                startTime=new Date().getTime();
            }
        }else{
            if(myList[1].score>myList[0].score){
                Show_res_win();
                startTime=new Date().getTime();
            }else{
                Show_res_lose();
                startTime=new Date().getTime();
            }
        }
    }
}


/* 每当client发送一次数据， 更新一次列表 */
function updateMyList(message) {
    myList=message;
    updateRanking();

    /*有两个玩家时画出缩略图*/
    if(myList.length==2) {
        updateBoard();
        callPunishOrRewardsIfMax();
        judgeWinner();
    }
}

