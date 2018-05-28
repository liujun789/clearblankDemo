window.GameConfig={
    blank_w:10,   
    blank_h:10,
    blank_width:40,
    blank_type:4,
    startPx:-200,
    startPy:-200,
    Event:{
        clickBlank:"click_blank"
    },
    _checkSameArr:[],
}
cc.Class({
    extends: cc.Component,

    properties: {
        blanks:[cc.SpriteFrame],  //方块种类
        blank_prefab:cc.Prefab,   
        _blanksArr:[],   
        _count:0,
    },

    // use this for initialization
    onLoad: function () {  
        this._blanksArr = [];        
        for(var i=0;i<GameConfig.blank_w;i++){
            var arr = []
            for(var j=0;j<GameConfig.blank_h;j++){
                arr.push(null)
            }
            this._blanksArr.push(arr)
        }
        cc.log("_blanksArr",this._blanksArr);

        //在10*10方格中，随机生成不同种类的方块
        this._buildRandom();

        this.node.on(GameConfig.Event.clickBlank,function(event){
            var data = event.getUserData();   //data：方块的种类与下标位置
            this._checkSameArr = [this._blanksArr[data.i][data.j]];
            //检查点击方块四周的方块
            this._checkNeighbor();
        },this);
        
    },

    _buildRandom:function(){
        var par = cc.find("Canvas/blanks");
        for(var i=0;i<GameConfig.blank_w;i++){
            for(var j=0;j<GameConfig.blank_h;j++){
                var blank = cc.instantiate(this.blank_prefab);
                blank.x = GameConfig.startPx+i*GameConfig.blank_width;
                blank.y = GameConfig.startPy+j*GameConfig.blank_width;
                par.addChild(blank);
                //显示方块种类及其对应的下标位置
                blank.getComponent('blank').init(this.blanks,i,j);
                //存储方块blank
                this._blanksArr[i][j] = blank;
            }
        }

    },   

    //check round and color 检查四周与颜色
    _checkNeighbor:function(){
        for(var j=0;j<this._checkSameArr.length;j++){
            var base_ob = this._checkSameArr[j].getComponent('blank').showInfo();
            var base_color = base_ob.type;
            var base = cc.p(base_ob.i,base_ob.j);
            var arr = [cc.p(0,1),cc.p(0,-1),cc.p(-1,0),cc.p(1,0)];  //上下左右
            for(var i=0;i<arr.length;i++){
                var p = arr[i];
                var targetP = cc.pAdd(p,base);
                if(this._blanksArr[targetP.x] && this._blanksArr[targetP.x][targetP.y]){  //保证targetP点不能越界                
                    var tempBlank = this._blanksArr[targetP.x][targetP.y];
                    if(tempBlank.getComponent('blank').checkSameColor(base_color)){ //判断周围方块与此方块颜色是否一致
                        if(this._checkSameArr.indexOf(tempBlank) == -1){
                            this._checkSameArr.push(tempBlank);
                        }                        
                    }
                }
            }
        }   
        
        //当有>=3个相同的方块依次相邻,则可以进行消除
        if(this._checkSameArr.length >= 3){
            this.deleteBlank()
        }else{
            this._checkSameArr = [];
        }        
    },

    //-----------------------掉落-------------------------------------
    //1.删除掉要删除的
    //2.更新掉落的下标
    deleteBlank:function(){
        //this._checkSameArr  存的是若干个blank
        for(var i=0;i<this._checkSameArr.length;i++){
            var node = this._checkSameArr[i];
            node.removeFromParent(true);   //清除方块显示而已，数据也要清除
            var ob = node.getComponent('blank').showInfo();              
            this._blanksArr[ob.i][ob.j] = null;   //数据清除
        }
        //进行掉落距离的检测
        for(var i=0;i<GameConfig.blank_w;i++){
            for(var j=0;j<GameConfig.blank_h;j++){
                var no = this._blanksArr[i][j];
                //检测node往下有几个null
                // 1,7     1,6~1,0
                if(no){
                    var fallDownNum = 0;
                    if(j>0){                        
                        for(var k=j-1;k>=0;k--){
                            if(this._blanksArr[i][k] == null){
                                fallDownNum++;                            
                            }
                        }                       
                    }
                    no.getComponent('blank').setFallDownNum(fallDownNum);
                }              
            }
        }
        
        //由上面可知下落距离，这里就进行下落对应的距离。
        for(var i=0;i<GameConfig.blank_w;i++){
            for(var j=0;j<GameConfig.blank_h;j++){
                var no = this._blanksArr[i][j];
                if(no){
                    //掉落更新下标   数组中的位置进行互换
                    var fall = no.getComponent('blank').startFallDown();
                    var temp = this._blanksArr[i][j];
                    this._blanksArr[i][j] = this._blanksArr[i][j-fall];
                    this._blanksArr[i][j-fall] = temp;
                }               
            }
        }
        

        this.scheduleOnce(function(){
            this.moveToLeft()
        },0.6)
        
    },

    //-----------------------向左合并-------------------------------------
    moveToLeft:function(){
        //检测最下面的一行  是否有为null的存在
        for(var i=GameConfig.blank_w-1;i>=0;i--){            
            //i,0  检测 i-1,0~0,0之间null的数量
            var countNum = 0;
            for(var j=i-1;j>=0;j--){
                if(this._blanksArr[j][0] == null){
                    countNum++;
                }
            } 
            //算出左移步数后  将整列都设置为同样的数量
            for(var k=0;k<GameConfig.blank_h;k++){
                if(this._blanksArr[i] != null && this._blanksArr[i][k] != null){
                    this._blanksArr[i][k].getComponent('blank').setMoveLeftNum(countNum);
                }
            }
        }

        //由上面可知左移步数，这里就进行左移对应的步数。
        for(var i=0;i<GameConfig.blank_w;i++){
            for(var j=0;j<GameConfig.blank_h;j++){
                var no = this._blanksArr[i][j];
                if(no){
                    // 掉落更新下标   数组中的位置进行互换
                    var fall = no.getComponent('blank').startMoveLeft();
                    var temp = this._blanksArr[i][j];
                    this._blanksArr[i][j] = this._blanksArr[i-fall][j];
                    this._blanksArr[i-fall][j] = temp;
                }                
            }
        }
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
