//=============================================================================
// MessageCommon.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/05/02 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc 訊息公共事件呼叫插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @help 在顯示訊息時可以呼叫公共事件。
 * 公共事件是並行執行的。
 *
 * 以下的控制字元請在「顯示文字」中使用。
 * \CE[1] # 執行公共事件[1]。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';

    //=============================================================================
    // Game_System
    //  メッセージコモンイベントを更新します。
    //=============================================================================
    Game_System.prototype.addMessageCommonEvents = function(id) {
        if (!this._messageCommonEvents) {
            this._messageCommonEvents = [];
        }
        var interpreter = new Game_Interpreter();
        interpreter.setup($dataCommonEvents[id].list);
        this._messageCommonEvents.push(interpreter);
    };

    Game_System.prototype.updateMessageCommonEvents = function() {
        if (!this._messageCommonEvents || this._messageCommonEvents.length === 0) return;
        this._messageCommonEvents.forEach(function(interpreter) {
            interpreter.update();
        });
        this._messageCommonEvents = this._messageCommonEvents.filter(function(interpreter) {
            return interpreter.isRunning();
        });
    };

    //=============================================================================
    // Window_Message
    //  メッセージコモンイベントを呼び出します。
    //=============================================================================
    var _Window_Message_processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
    Window_Message.prototype.processEscapeCharacter = function(code, textState) {
        if (code === 'CE') {
            this.callMessageCommon(this.obtainEscapeParam(textState));
            return;
        }
        _Window_Message_processEscapeCharacter.apply(this, arguments);
    };

    Window_Message.prototype.callMessageCommon = function(commonEventId) {
        $gameSystem.addMessageCommonEvents(commonEventId);
    };

    var _Window_Message_update = Window_Message.prototype.update;
    Window_Message.prototype.update = function() {
        $gameSystem.updateMessageCommonEvents();
        _Window_Message_update.apply(this, arguments);
    };
})();

