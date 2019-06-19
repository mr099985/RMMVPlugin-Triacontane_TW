/*=============================================================================
 ChoiceWindowInMessage.js
----------------------------------------------------------------------------
 (C)2019 Triacontane
 Translator : ReIris
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2019/02/17 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc 選項於訊息窗口內部插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @help ChoiceWindowInMessage.js
 *
 * 讓事件命令的「選項」與「輸入數值」顯示在訊息窗口中。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';

    /**
     * Scene_Map
     * 選択肢ウィンドウをWindowLayerから外します。(重なり時のマスクを避けるため)
     */
    var _Scene_Map_createMessageWindow = Scene_Map.prototype.createMessageWindow;
    Scene_Map.prototype.createMessageWindow = function() {
        _Scene_Map_createMessageWindow.apply(this, arguments);
        this.changeParentChoiceWindow()
    };

    var _Scene_Battle_createMessageWindow = Scene_Battle.prototype.createMessageWindow;
    Scene_Battle.prototype.createMessageWindow = function() {
        _Scene_Battle_createMessageWindow.apply(this, arguments);
        this.changeParentChoiceWindow()
    };

    Scene_Base.prototype.changeParentChoiceWindow = function() {
        this._messageWindow.subWindows().forEach(function(win) {
            if (win.isInnerMessage()) {
                this.addChild(this._windowLayer.removeChild(win));
            }
        }, this);
    };

    /**
     * Game_Message
     * メッセージおよび選択肢の行数を返します。
     */
    Game_Message.prototype.messageLines = function() {
        return this._texts.length;
    };

    Game_Message.prototype.choiceLines = function() {
        return this._choices.length;
    };

    Game_Message.prototype.isChoiceOrInput = function() {
        return this.isChoice() || this.isNumberInput();
    };

    Game_Message.prototype.setBaseWindowLine = function(value) {
        this._baseLine = value;
    };

    Game_Message.prototype.getBaseWindowLine = function() {
        return this._baseLine;
    };

    Game_Message.prototype.isOutInnerMessage = function(addLines) {
        var messageLines = this.messageLines();
        return messageLines > 0 && messageLines + addLines > this.getBaseWindowLine();
    };

    /**
     * Game_Interpreter
     * 文章の表示後に選択肢と数値入力が来た場合の挙動を変更します。
     */
    var _Game_Interpreter_setupChoices = Game_Interpreter.prototype.setupChoices;
    Game_Interpreter.prototype.setupChoices = function(params) {
        if ($gameMessage.isOutInnerMessage(params[0].length)) {
            this._index--;
            return;
        }
        _Game_Interpreter_setupChoices.apply(this, arguments);
    };

    var _Game_Interpreter_setupNumInput = Game_Interpreter.prototype.setupNumInput;
    Game_Interpreter.prototype.setupNumInput = function(params) {
        if ($gameMessage.isOutInnerMessage(1)) {
            this._index--;
            return;
        }
        _Game_Interpreter_setupNumInput.apply(this, arguments);
    };

    /**
     * Window_Base
     * メッセージウィンドウに内部に表示するかどうかを返します。
     */
    Window_Base.prototype.isInnerMessage = function() {
        return false;
    };

    /**
     * Window_Message
     * テキストの高さを返します。
     */
    var _Window_Message_initialize = Window_Message.prototype.initialize;
    Window_Message.prototype.initialize = function() {
        _Window_Message_initialize.apply(this, arguments);
        $gameMessage.setBaseWindowLine(this.numVisibleRows());
    };

    var _Window_Message_startMessage = Window_Message.prototype.startMessage;
    Window_Message.prototype.startMessage = function() {
        this.height = this.windowHeight();
        _Window_Message_startMessage.apply(this, arguments);
    };

    var _Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
    Window_Message.prototype.updatePlacement = function() {
        _Window_Message_updatePlacement.apply(this, arguments);
        $gameMessage.setBaseWindowLine(this.numVisibleRows());
    };

    Window_Message.prototype.getTextHeight = function() {
        return this._textState ? this._textState.y + this._textState.height : 0;
    };

    var _Window_Message_doesContinue = Window_Message.prototype.doesContinue;
    Window_Message.prototype.doesContinue = function() {
        return _Window_Message_doesContinue.apply(this, arguments) || $gameMessage.isChoiceOrInput();
    };

    Window_Message.prototype.openForChoice = function() {
        if (!this._textState) {
            this.contents.clear();
        }
        if ($gameMessage.isChoice()) {
            var prevHeight = this.height;
            var lines = $gameMessage.choiceLines();
            if (lines > this.numVisibleRows()) {
                this.height = this.fittingHeight(lines);
            } else {
                this.height = this.windowHeight();
            }
            if (prevHeight !== this.height) {
                this.updatePlacement();
            }
        }
        this.open();
    };

    /**
     * Window_ChoiceList
     * 選択肢をメッセージウィンドウに含めます。
     */
    var _Window_ChoiceList_start = Window_ChoiceList.prototype.start;
    Window_ChoiceList.prototype.start = function() {
        this._messageWindow.openForChoice();
        _Window_ChoiceList_start.apply(this, arguments);
    };

    var _Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
    Window_ChoiceList.prototype.updatePlacement = function() {
        _Window_ChoiceList_updatePlacement.apply(this, arguments);
        this.x = this._messageWindow.x;
        this.y = this._messageWindow.y + this._messageWindow.getTextHeight();
    };

    var _Window_ChoiceList_windowWidth = Window_ChoiceList.prototype.windowWidth;
    Window_ChoiceList.prototype.windowWidth = function() {
        _Window_ChoiceList_windowWidth.apply(this, arguments);
        return this._messageWindow.width;
    };

    var _Window_ChoiceList_updateBackground = Window_ChoiceList.prototype.updateBackground;
    Window_ChoiceList.prototype.updateBackground = function() {
        _Window_ChoiceList_updateBackground.apply(this, arguments);
        this.opacity = 0;
    };

    Window_ChoiceList.prototype.isInnerMessage = function() {
        return true;
    };

    /**
     * Window_NumberInput
     * 選択肢をメッセージウィンドウに含めます。
     */
    var _Window_NumberInput_start = Window_NumberInput.prototype.start;
    Window_NumberInput.prototype.start = function() {
        this._messageWindow.openForChoice();
        _Window_NumberInput_start.apply(this, arguments);
    };

    var _Window_NumberInput_updatePlacement = Window_NumberInput.prototype.updatePlacement;
    Window_NumberInput.prototype.updatePlacement = function() {
        _Window_NumberInput_updatePlacement.apply(this, arguments);
        this.opacity = 0;
        this.x = this._messageWindow.x;
        this.y = this._messageWindow.y + this._messageWindow.getTextHeight();
    };

    var _Window_NumberInput_windowWidth = Window_NumberInput.prototype.windowWidth;
    Window_NumberInput.prototype.windowWidth = function() {
        _Window_NumberInput_windowWidth.apply(this, arguments);
        return this._messageWindow.width;
    };

    Window_NumberInput.prototype.isInnerMessage = function() {
        return true;
    };

    var _Window_NumberInput_buttonY = Window_NumberInput.prototype.buttonY;
    Window_NumberInput.prototype.buttonY = function() {
        if (this._messageWindow.y >= Graphics.boxHeight / 2) {
            return _Window_NumberInput_buttonY.apply(this, arguments) - this._messageWindow.getTextHeight();
        } else {
            return this._messageWindow.y + this._messageWindow.height - this.y + 8;
        }
    };
})();
