//=============================================================================
// IconDescription.js
// ----------------------------------------------------------------------------
// (C)2015-2018Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 2.0.1 2018 05/05 古いコアスクリプト用の設定を削除
//                  バトル画面で除去されたステータスアイコンの説明が残ってしまう問題を修正
// 2.0.0 2016/08/22 本体v1.3.0によりウィンドウ透過の実装が変更されたので対応
// 1.0.1 2016/05/31 ウィンドウが重なったときに裏側のウィンドウのアイコンに反応する不具合を修正
// 1.0.0 2016/03/16 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.2.0.1 ]添加顯示圖標說明
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param 効果音
 * @text 音效
 * @desc 顯示幫助時播放的音效檔名。
 * @default Cancel1
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @help
 * 單擊或觸摸窗口中顯示的圖標可以顯示登錄的說明。
 * 再次點擊圖標可以關閉說明。
 *
 * 插件命令詳細
 * 事件命令中的「插件命令」執行。
 *  （參數中間使用半形空格區分）
 *
 * ADD_ICON_DESC [圖標ID] [說明]
 * 範例：ADD_ICON_DESC 128 盾的圖標。
 *
 * 將描述說明添加到指定的圖標ID。
 * 可以使用控制字元。
 * 高級設置在代碼的「用戶重寫區域」中定義。
 * 如有必要，可以進行編輯。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function () {
    'use strict';
    //=============================================================================
    // ユーザ書き換え領域 - 開始 -
    //  高度な設定を記述しています。必要な場合は書き換えてください。
    //=============================================================================
    var settings = {
        /* iconDesc:アイコンごとの説明文です。コマンドによって追加された場合、そちらを優先します。 */
        iconDesc:{
            1:'',
            2:'',
            3:'',
        },
        /* captionInfo:注釈ウィンドウの情報です。 */
        captionInfo:{
            /* フォントサイズ */
            fontSize:22,
            /* 余白 */
            padding:8
        },
        /* se:アイコンをクリックした際の効果音情報です。ファイル名はパラメータから取得します。 */
        se:{
            volume:90,
            pitch:100,
            pan:0
        }
    };
    //=============================================================================
    // ユーザ書き換え領域 - 終了 -
    //=============================================================================

    var pluginName = 'IconDescription';

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value == null ? '' : value;
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON' || (value || '').toUpperCase() === 'FALSE';
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getCommandName = function (command) {
        return (command || '').toUpperCase();
    };

    var getArgString = function (arg, upperFlg) {
        arg = convertEscapeCharacters(arg);
        return upperFlg ? arg.toUpperCase() : arg;
    };

    var getArgNumber = function (arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var window = SceneManager._scene._windowLayer.children[0];
        return window ? window.convertEscapeCharacters(text) : text;
    };

    var concatArgs = function (args, start, end) {
        if (!start) start = 0;
        if (!end) end = args.length;
        var result = '';
        for (var i = start, n = end; i < n; i++) {
            result += args[i] + (i < n - 1 ? ' ' : '');
        }
        return result;
    };

    //=============================================================================
    // パラメータのバリデーション
    //=============================================================================
    var paramSeName          = getParamString(['SeName', '効果音']);
    var paramThroughWindow   = getParamBoolean(['ThroughWindow', 'ウィンドウ透過']);

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        this.pluginCommandIconDescription(command, args);
    };

    Game_Interpreter.prototype.pluginCommandIconDescription = function (command, args) {
        switch (getCommandName(command)) {
            case 'ADD_ICON_DESC' :
            case 'アイコン説明追加':
                $gameSystem.addIconDescription(getArgNumber(args[0]), getArgString(concatArgs(args, 1)));
                break;
        }
    };

    //=============================================================================
    // Game_System
    //  アイコン情報の登録と取得を追加します。
    //=============================================================================
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.apply(this, arguments);
        this._iconDescriptions = null;
    };

    Game_System.prototype.addIconDescription = function(id, desc) {
        if (!this._iconDescriptions) this._iconDescriptions = {};
        this._iconDescriptions[id] = desc;
    };

    Game_System.prototype.getIconDescription = function(id) {
        return this._iconDescriptions ? this._iconDescriptions[id] : null;
    };

    //=============================================================================
    // Scene_Base
    //  ウィンドウのアイコンタッチを検出します。
    //=============================================================================
    var _Scene_Base_updateChildren = Scene_Base.prototype.updateChildren;
    Scene_Base.prototype.updateChildren = function() {
        _Scene_Base_updateChildren.apply(this, arguments);
        if (!this._windowLayer) return;
        this._windowLayer.children.some(function(windowObject) {
            return windowObject.updateIconTouch();
        });
    };

    //=============================================================================
    // Window_Base
    //  drawIconの位置を記憶してクリックされた場合にキャプションを表示します。
    //=============================================================================
    var _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(x, y, width, height) {
        _Window_Base_initialize.apply(this, arguments);
        this._iconRects = {};
    };

    var _Window_Base_drawIcon = Window_Base.prototype.drawIcon;
    Window_Base.prototype.drawIcon = function(iconIndex, x, y) {
        _Window_Base_drawIcon.apply(this, arguments);
        this.addIconRect(iconIndex, x, y);
    };

    Window_Base.prototype.addIconRect = function(iconIndex, x, y) {
        var rect = new Rectangle(x, y, Window_Base._iconWidth, Window_Base._iconHeight);
        this._iconRects[rect.x + ':' + rect.y] = {index:iconIndex, rect:rect};
    };

    Window_Base.prototype.updateIconTouch = function() {
        if (this.isAnyTriggered() && this._captionWindow) {
            this.eraseCaption();
            return false;
        }
        if (!TouchInput.isTriggered() || !this.isTouchedInsideFrame()) return false;
        var tx = this.canvasToLocalX(TouchInput.x) - this.padding;
        var ty = this.canvasToLocalY(TouchInput.y) - this.padding;
        for (var propName in this._iconRects) {
            if (!this._iconRects.hasOwnProperty(propName)) continue;
            var rectInfo = this._iconRects[propName];
            if (rectInfo.rect.contains(tx, ty)) {
                var text = $gameSystem.getIconDescription(rectInfo.index) || settings.iconDesc[rectInfo.index];
                if (text) this.popupCaption(text);
            }
        }
        return true;
    };

    Window_Base.prototype.popupCaption = function(text) {
        if (paramSeName) {
            var se = settings.se;
            se.name = paramSeName;
            AudioManager.playSe(se);
        }
        if (!this._captionWindow) {
            this._captionWindow = new Window_Caption(TouchInput.x, TouchInput.y, text);
            this.parent.parent.addChild(this._captionWindow);
        } else {
            this._captionWindow.refresh(text);
            this._captionWindow.x = TouchInput.x;
            this._captionWindow.y = TouchInput.y;
        }
        TouchInput.clear();
    };

    Window_Base.prototype.eraseCaption = function() {
        this.parent.parent.removeChild(this._captionWindow);
        this._captionWindow = null;
        TouchInput.clear();
    };

    Window_Base.prototype.isAnyTriggered = function() {
        return Input.isTriggered('ok') || Input.isTriggered('escape') || Input.dir4 !== 0 ||
            TouchInput.isTriggered() || TouchInput.isCancelled();
    };
    Window_Base.prototype.isTouchedInsideFrame = Window_Selectable.prototype.isTouchedInsideFrame;

    //=============================================================================
    // Window_Selectable
    //  再描画時にアイコンリストを初期化します。
    //=============================================================================
    var _Window_Selectable_drawAllItems = Window_Selectable.prototype.drawAllItems;
    Window_Selectable.prototype.drawAllItems = function() {
        this._iconRects = {};
        _Window_Selectable_drawAllItems.apply(this, arguments);
    };

    /**
     * Window_Caption
     * アイコン画像に対応するヘルプを表示します。
     * @constructor
     */
    function Window_Caption() {
        this.initialize.apply(this, arguments);
    }

    Window_Caption.prototype = Object.create(Window_Base.prototype);
    Window_Caption.prototype.constructor = Window_Caption;

    Window_Caption.prototype.initialize = function(x, y, text) {
        Window_Base.prototype.initialize.call(this, x, y, 100, 100);
        this.refresh(text);
    };

    Window_Caption.prototype.refresh = function(text) {
        this._text = text;
        this.width = this.windowWidth();
        this.height = this.windowHeight();
        this.setPositionInScreen();
        this.createContents();
        this.drawTextEx(this._text, 0, 0);
    };

    Window_Caption.prototype.setPositionInScreen = function() {
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x + this.width > Graphics.boxWidth) this.x = Graphics.boxWidth - this.width;
        if (this.y + this.height > Graphics.boxHeight) this.y = Graphics.boxHeight - this.height;
    };

    Window_Caption.prototype.windowWidth = function() {
        return this.drawTextEx(this._text, 0, this.contents.height) + this.padding * 2;
    };

    Window_Caption.prototype.windowHeight = function() {
        return this.calcTextHeight({text:this._text, index:0}) + this.padding * 2;
    };

    Window_Caption.prototype.standardPadding = function() {
        return settings.captionInfo.padding;
    };

    Window_Caption.prototype.standardFontSize = function() {
        return settings.captionInfo.fontSize;
    };
})();

