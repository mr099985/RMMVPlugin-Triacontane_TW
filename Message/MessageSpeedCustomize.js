//=============================================================================
// MessageSpeedCustomize.js
// ----------------------------------------------------------------------------
// (C)2016 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.2.3 2018/11/28 BugFixWaitOfTextEnd.jsと組み合わせたとき、末尾の動作がおかしくなる問題を修正
// 1.2.2 2018/07/22 瞬間表示機能が有効なとき、\!を使用すると以後のメッセージまで瞬間表示されてしまう問題を修正
// 1.2.1 2017/12/30 パラメータの型指定機能に対応し、ヘルプの記述を修正
// 1.2.0 2016/11/05 ノベルゲーム総合プラグインから、メッセージ表示速度を調整する制御文字を流用
// 1.1.2 2016/07/24 複数行「\>」が指定されている場合もデフォルトと同じ動作をするよう修正
// 1.1.1 2016/07/23 制御文字「\>\<」が指定されている場合、そちらを優先するよう修正
// 1.1.0 2016/07/12 文章の表示中に決定キーもしくは左クリックで文章を瞬間表示する機能を追加
// 1.0.0 2016/04/12 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc 訊息速度調整插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param VariableSpeed
 * @text 顯示速度變數
 * @desc 控制訊息顯示速度的變數ID
 * @default 1
 * @type variable
 *
 * @param RapidShow
 * @text 瞬間顯示
 * @desc 在訊息顯示中按下確定鍵或點擊左鍵瞬間顯示全部訊息。(ON/OFF)
 * @default false
 * @type boolean
 *
 * @help 訊息顯示速度調整
 * 參數中指定的變數ID帶入以下的值的效果。
 * 0     : 瞬間顯示
 * 1     : 與原本一樣的顯示速度
 * 2以上 : 指定的間隔顯示一文字
 *
 * ※ 參數指定的並不是顯示速度，而是取得顯示速度的變數值。
 * 變數值越大，顯示越慢。
 *
 * ※ 與公開發布中的「オプション任意項目作成プラグイン」組合
 * 可以在設置畫面中操作顯示速度變數
 * https://raw.githubusercontent.com/triacontane/RPGMakerMV/master/CustomizeConfigItem.js
 *
 * 利用控制字元「\ms[n]」可以在這個對話中任意變更速度值。
 * 這個使用只有一時變更效果，接下來的訊息會依照原本變數速度。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function () {
    'use strict';
    var pluginName = 'MessageSpeedCustomize';

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON' || (value || '').toUpperCase() === 'TRUE';
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramVariableSpeed  = getParamNumber(['VariableSpeed', '表示速度変数'], 1, 5000);
    var paramRapidShow      = getParamBoolean(['RapidShow', '瞬間表示']);

    //=============================================================================
    // Window_Message
    //  メッセージの表示間隔を調整します。
    //=============================================================================
    var _Window_Message_clearFlags      = Window_Message.prototype.clearFlags;
    Window_Message.prototype.clearFlags = function() {
        _Window_Message_clearFlags.apply(this, arguments);
        this._tempMessageSpeed = null;
        this._showAll = false;
    };

    var _Window_Message_updateWait = Window_Message.prototype.updateWait;
    Window_Message.prototype.updateWait = function() {
        if (paramRapidShow && this._textState && this.isTriggered() && !this.pause) {
            this._showAll = true;
        }
        return _Window_Message_updateWait.apply(this, arguments);
    };

    var _Window_Message_updateMessage = Window_Message.prototype.updateMessage;
    Window_Message.prototype.updateMessage = function() {
        var speed = this.getMessageSpeed();
        if (this._textState && !this._lineShowFast) {
            if (speed <= 0 || this._showAll) {
                this._showFast = true;
            } else if (!this.isEndOfText(this._textState)) {
                this._waitCount = speed - 1;
            }
        }
        return _Window_Message_updateMessage.apply(this, arguments);
    };

    var _Window_Message_startPause = Window_Message.prototype.startPause;
    Window_Message.prototype.startPause = function() {
        _Window_Message_startPause.apply(this, arguments);
        this._showAll = false;
    };

    Window_Message.prototype.getMessageSpeed = function() {
        return this._tempMessageSpeed !== null ? this._tempMessageSpeed : $gameVariables.value(paramVariableSpeed);
    };

    Window_Message.prototype.setTempMessageSpeed = function(speed) {
        if (speed >= 0) {
            this._tempMessageSpeed = speed;
            if (speed > 0) this._showFast = false;
        } else {
            this._tempMessageSpeed = null;
        }
    };

    var _Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
    Window_Message.prototype.processEscapeCharacter = function(code, textState) {
        if (code === '>') this._waitCount = 0;
        switch (code) {
            case 'MS':
                this.setTempMessageSpeed(this.obtainEscapeParam(textState));
                break;
            default:
                _Window_Message_processEscapeCharacter.apply(this, arguments);
        }
    };
})();

