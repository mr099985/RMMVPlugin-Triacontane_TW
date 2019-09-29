//=============================================================================
// DWindow.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.3.3 2016/12/01 プラグインコマンド集との競合を解消
// 1.3.2 2016/11/27 createUpperLayerの再定義方法を修正し、競合を解消（by 奏 ねこま様）
// 1.3.1 2016/09/13 前回の修正で戦闘画面に入るとエラーが発生する問題を修正
// 1.3.0 2016/09/13 ウィンドウの不透明度を調整できる機能を追加
// 1.2.0 2016/07/16 ウィンドウをピクチャの間に差し込むことのできる機能を追加
// 1.1.1 2016/04/29 createUpperLayerによる競合対策
// 1.1.0 2016/01/16 ウィンドウを最前面に表示できる機能を追加
// 1.0.0 2015/11/12 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc [ ver.1.3.3 ]動態窗口生成插件
 * @author トリアコンタン( 翻譯 : ReIris )
 *
 * @param GameVariablesXPos
 * @desc 儲存 X 座標的遊戲變數ID
 * @default 1
 *
 * @param GameVariablesYPos
 * @desc 儲存 Y 座標的遊戲變數ID
 * @default 2
 *
 * @param GameVariablesWidth
 * @desc 儲存窗口寬度的遊戲變數ID
 * @default 3
 *
 * @param GameVariablesHeight
 * @desc 儲存窗口高度的遊戲變數ID
 * @default 4
 *
 * @param AlwaysOnTop
 * @desc 窗口是否顯示最前
 * @default OFF
 *
 * @param IncludePicture
 * @desc 如果想要在圖片中夾帶窗口，請指定圖片編號作為標準值。
 * @default 0
 *
 * @help 在畫面上的指定位置顯示一個空窗口。
 * 最多可以指定顯示 10 個窗口。
 * 顯示坐標預先儲存在遊戲變數 ID 中，或者在執行插件命令時直接指定。
 * 使用它來創造一個不足以使用插件的自製系統。
 * 它不能顯示文字。要顯示文字請使用 DTextPicture.js。
 *
 * 如果為「IncludePicture」指定圖片編號，
 * 則窗口將顯示在帶有該編號的圖片上方，
 * 並顯示在該編號上方的圖片下方。
 *
 * 插件命令
 *   從事件命令中「插件命令」執行。
 *   （參數間使用半形空格區分）
 *
 *  D_WINDOW_DRAW [窗口ID] [不透明度] : 顯示窗口
 *  範例 1 (座標指定為變數)：D_WINDOW_DRAW 1 255
 *  範例 2 (座標直接指定)：D_WINDOW_DRAW 1 20 20 320 80 255
 *  ※ 請為窗口 ID 指定 1 到 10 之間的值。
 *  指定的最後一個值是不透明度（0-255）。
 *
 *  D_WINDOW_ERASE [窗口ID] : 窗口消除
 *  例：D_WINDOW_ERASE 1
 *  ※ 請為窗口 ID 指定 1 到 10 之間的值。
 *
 *  D_WINDOW_OPACITY [窗口ID] [不透明度] [時間(f)]
 *  在指定時間內更改已顯示窗口的不透明度。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
(function() {
    var pluginName = 'DWindow';

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length <= 2) min = -Infinity;
        if (arguments.length <= 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var window = SceneManager._scene._windowLayer.children[0];
        return window ? window.convertEscapeCharacters(text) : text;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramGameVariablesXPos   = getParamNumber(['GameVariablesXPos', 'X座標の変数番号'], 0);
    var paramGameVariablesYPos   = getParamNumber(['GameVariablesYPos', 'Y座標の変数番号'], 0);
    var paramGameVariablesWidth  = getParamNumber(['GameVariablesWidth', '横幅の変数番号'], 0);
    var paramGameVariablesHeight = getParamNumber(['GameVariablesHeight', '高さの変数番号'], 0);
    var paramAlwaysOnTop         = getParamBoolean(['AlwaysOnTop', '最前面に表示']);
    var paramIncludePicture      = getParamNumber(['IncludePicture', 'ピクチャに含める'], 0);

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンド[D_WINDOW_DRAW]などを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        try {
            this.pluginCommandDWindow(command, args);
        } catch (e) {
            if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
                var window  = require('nw.gui').Window.get();
                var devTool = window.showDevTools();
                devTool.moveTo(0, 0);
                devTool.resizeTo(Graphics.width, Graphics.height);
                window.focus();
            }
            console.log('プラグインコマンドの実行中にエラーが発生しました。');
            console.log('- コマンド名 　: ' + command);
            console.log('- コマンド引数 : ' + args);
            console.log('- エラー原因   : ' + e.toString());
            throw e;
        }
    };

    Game_Interpreter.prototype.pluginCommandDWindow = function(command, args) {
        var windowInfo = {};
        var number     = 0;
        switch (command.toUpperCase()) {
            case 'D_WINDOW_DRAW' :
                switch (args.length) {
                    case 1:
                    case 2:
                        number             = getArgNumber(args[0], 1, 10);
                        windowInfo.x       = $gameVariables.value(paramGameVariablesXPos) || 0;
                        windowInfo.y       = $gameVariables.value(paramGameVariablesYPos) || 0;
                        windowInfo.width   = $gameVariables.value(paramGameVariablesWidth) || 0;
                        windowInfo.height  = $gameVariables.value(paramGameVariablesHeight) || 0;
                        windowInfo.opacity = args.length > 1 ? getArgNumber(args[1], 0, 255) : 255;
                        break;
                    case 5:
                    case 6:
                        number             = getArgNumber(args[0], 1, 10);
                        windowInfo.x       = getArgNumber(args[1], 0);
                        windowInfo.y       = getArgNumber(args[2], 0);
                        windowInfo.width   = getArgNumber(args[3], 0);
                        windowInfo.height  = getArgNumber(args[4], 0);
                        windowInfo.opacity = args.length > 5 ? getArgNumber(args[5], 0, 255) : 255;
                        break;
                    default:
                        throw new Error(command + 'に指定した引数[' + args + 'が不正です。');
                }
                $gameMap.setDrawDWindow(number, windowInfo);
                break;
            case 'D_WINDOW_ERASE' :
                number = getArgNumber(args[0], 1, 10);
                $gameMap.setEraseDWindow(number);
                break;
            case 'D_WINDOW_OPACITY' :
                number                   = getArgNumber(args[0], 1, 10);
                windowInfo.targetOpacity = getArgNumber(args[1], 0, 255);
                windowInfo.duration      = getArgNumber(args[2], 1);
                $gameMap.setOpacityDWindow(number, windowInfo);
                break;
        }
    };

    //=============================================================================
    // Game_Map
    //  動的ウィンドウ表示用の変数を追加定義します。
    //=============================================================================
    var _Game_Map_setup      = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.apply(this, arguments);
        if (!this.dWindowInfos) this.dWindowInfos = [];
    };

    Game_Map.prototype.setDrawDWindow = function(number, windowInfo) {
        this.dWindowInfos[number] = windowInfo;
    };

    Game_Map.prototype.setEraseDWindow = function(number) {
        this.dWindowInfos[number] = null;
    };

    Game_Map.prototype.setOpacityDWindow = function(number, windowInfo) {
        if (this.dWindowInfos[number]) {
            this.dWindowInfos[number].targetOpacity = windowInfo.targetOpacity;
            this.dWindowInfos[number].duration      = windowInfo.duration;
        }
    };

    var _Game_Map_update      = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.apply(this, arguments);
        this.updateDynamicWindow();
    };

    Game_Map.prototype.updateDynamicWindow = function() {
        if (!this.dWindowInfos) return;
        for (var i = 0, n = this.dWindowInfos.length; i < n; i++) {
            var info = this.dWindowInfos[i];
            if (info && info.duration > 0) {
                var d        = info.duration;
                info.opacity = (info.opacity * (d - 1) + info.targetOpacity) / d;
                info.duration--;
            }
        }
    };

    //=============================================================================
    // Spriteset_Map
    //  動的ウィンドウの情報を保持し、作成する処理を追加定義します。
    //=============================================================================
    var _Spriteset_Map_createUpperLayer = null;
    if (Spriteset_Map.prototype.hasOwnProperty('createUpperLayer')) {
        _Spriteset_Map_createUpperLayer = Spriteset_Map.prototype.createUpperLayer;
    }
    Spriteset_Map.prototype.createUpperLayer = function() {
        if (!paramAlwaysOnTop && paramIncludePicture === 0) {
            this.createDynamicWindow();
            if (_Spriteset_Map_createUpperLayer) {
                _Spriteset_Map_createUpperLayer.apply(this, arguments);
            } else {
                Spriteset_Base.prototype.createUpperLayer.apply(this, arguments);
            }
        } else {
            if (_Spriteset_Map_createUpperLayer) {
                _Spriteset_Map_createUpperLayer.apply(this, arguments);
            } else {
                Spriteset_Base.prototype.createUpperLayer.apply(this, arguments);
            }
            this.createDynamicWindow();
        }
    };

    Spriteset_Map.prototype.createDynamicWindow = function() {
        this._DynamicWindows = [];
        for (var i = 0; i < 10; i++) {
            this._DynamicWindows[i] = new Window_Dynamic(i);
            if (paramIncludePicture > 0) {
                this._pictureContainer.addChildAt(this._DynamicWindows[i], paramIncludePicture + i);
            } else {
                this.addChild(this._DynamicWindows[i]);
            }
        }
    };

    //=============================================================================
    // Window_Dynamic
    //  マップ画面に自由に配置できる動的ウィンドウです。
    //=============================================================================
    function Window_Dynamic() {
        this.initialize.apply(this, arguments);
    }

    Window_Dynamic.prototype             = Object.create(Window_Base.prototype);
    Window_Dynamic.prototype.constructor = Window_Dynamic;

    Window_Dynamic.prototype.initialize = function(number) {
        this._windowNumber = number;
        var info           = this.windowInfo();
        if (info != null) {
            Window_Base.prototype.initialize.call(this, info.x, info.y, info.width, info.height);
        } else {
            Window_Base.prototype.initialize.call(this, 0, 0, 0, 0);
        }
        this.update();
    };

    Window_Dynamic.prototype.windowInfo = function() {
        return $gameMap.dWindowInfos[this._windowNumber];
    };

    Window_Dynamic.prototype.windowOpacity = function() {
        return $gameMap.dWindowInfos[this._windowNumber].opacity;
    };

    Window_Dynamic.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        var info = this.windowInfo();
        if (info != null) {
            if (info.x !== this.x || info.y !== this.y || info.width !== this.width || info.height !== this.height)
                this.move(info.x, info.y, info.width, info.height);
            this.show();
            this.updateOpacity();
        } else {
            this.hide();
        }
    };

    Window_Dynamic.prototype.updateOpacity = function() {
        this.opacity = this.windowOpacity();
    };
})();
