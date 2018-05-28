cc.Class({
    extends: cc.Component,

    properties: {
        _spriteFrameArr:[],
        _type:0,
        _selfI:0,
        _selfJ:0,
        _fallDownNum:0,   //向下掉落
        _moveLeftNum:0,   //向左合并
    },

    // use this for initialization
    onLoad: function () {
        var that = this;
        //点击方块，将此方块的｛种类，下标位置｝发射出去
        this.node.on(cc.Node.EventType.TOUCH_START,function(){
            var node = cc.find('script');
            node.emit(GameConfig.Event.clickBlank,{
                i:that._selfI,
                j:that._selfJ,
                type:that._type
            });
        });
    },

    init:function(spriteArr,i,j){
        this._spriteFrameArr = spriteArr;
        this._type = ~~(Math.random()*GameConfig.blank_type);
        this.getComponent(cc.Sprite).spriteFrame = this._spriteFrameArr[this._type];
        this._selfI = i;
        this._selfJ = j;
        this.node.getChildByName('label').getComponent(cc.Label).string = i+','+j;
    },

    //检查颜色是否一致
    checkSameColor:function(type){
        return this._type == type;
    },

    //当前某方块的信息：下标位置与种类
    showInfo:function(){
        return {i:this._selfI,j:this._selfJ,type:this._type};
    },

    //下落多少
    setFallDownNum:function(num){
        this._fallDownNum = num;
        //this.node.getChildByName('label').getComponent(cc.Label).string = this._fallDownNum;
    },

    startFallDown:function(){
        this._selfJ -= this._fallDownNum;
        this.node.getChildByName('label').getComponent(cc.Label).string = this._selfI+','+this._selfJ;
        this.node.runAction(cc.moveBy(0.5,cc.p(0, -GameConfig.blank_width*this._fallDownNum)));
        return this._fallDownNum;
    },

    setMoveLeftNum:function(num){
        this._moveLeftNum = num;
        // this.node.getChildByName('label').getComponent(cc.Label).string = this._moveLeftNum;
    },

    startMoveLeft:function(){
        this._selfI -= this._moveLeftNum;
        this.node.getChildByName('label').getComponent(cc.Label).string = this._selfI+','+this._selfJ;
        this.node.runAction(cc.moveBy(0.5,cc.p(-GameConfig.blank_width*this._moveLeftNum,0)));
        return this._moveLeftNum;
    },
  
    // update: function (dt) {
    // },
});
