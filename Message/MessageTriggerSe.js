//=============================================================================
// MessageTriggerSe.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.2.0 2018/06/22 メッセージに続きがある場合のみ効果音を演奏する設定を追加
// 1.1.0 2017/12/06 効果音の音量、ピッチ、左右バランスを後から変更できる機能を追加
// 1.0.0 2017/12/05 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 訊息播放SE插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param validateSwitchId
 * @text 有效開關ID
 * @desc 控制插件功能有效的開關ID。指定為 0 則常時有效。
 * @default 0
 * @type switch
 *
 * @param soundEffect
 * @text 効果音
 * @desc 在換頁時播放的 SE 。
 * @default
 * @type struct<SE>
 *
 * @param doseContinueOnly
 * @text 僅有延續情況
 * @desc 僅當消息後跟還有消息時才演奏 SE 。
 * @default false
 * @type boolean
 *
 * @help MessageTriggerSe.js
 *
 * 發送訊息時播放指定的音效。
 * 在等待「\!」或者跳過「\^」時也會播放。
 *
 * ・腳本詳細
 * 更改音效效果如下。
 * 未指定的項目不會更改。
 *  名稱         : Book2
 *  音量         : 90
 *  音調         : 100
 *  左右聲道     : 0
 *
 *  -> $gameSystem.setMessageTriggerSe('Book2', 90, 100, 0);
 *
 * 這個插件沒有插件命令
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

/*~struct~SE:
 * @param name
 * @text 檔案名稱
 * @desc 音效檔案名稱
 * @default Book1
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param volume
 * @text 音量
 * @desc 音效的音量
 * @default 90
 * @type number
 * @min 0
 * @max 100
 *
 * @param pitch
 * @text 音調
 * @desc 音效的音調
 * @default 100
 * @type number
 * @min 50
 * @max 150
 *
 * @param pan
 * @text 聲道
 * @desc 音效的左右聲道
 * @default 0
 * @type number
 * @min -100
 * @max 100
 */

(function() {
    'use strict';

    //=============================================================================
    // ローカル関数
    //  プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします
    //=============================================================================
    /**
     * Create plugin parameter. param[paramName] ex. param.commandPrefix
     * @param pluginName plugin name(EncounterSwitchConditions)
     * @returns {Object} Created parameter
     */
    var createPluginParameter = function(pluginName) {
        var paramReplacer = function(key, value) {
            if (value === 'null') {
                return value;
            }
            if (value[0] === '"' && value[value.length - 1] === '"') {
                return value;
            }
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        };
        var parameter     = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), paramReplacer));
        PluginManager.setParameters(pluginName, parameter);
        return parameter;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var param = createPluginParameter('MessageTriggerSe');

    //=============================================================================
    // Game_System
    //  メッセージ送りSEを保持します。
    //=============================================================================
    Game_System.prototype.initMessageTriggerSeIfNeed = function() {
        if (!this._messageTriggerSe) {
            this._messageTriggerSe = this.createMessageTriggerSe();
        }
    };

    Game_System.prototype.createMessageTriggerSe = function() {
        var se    = param.soundEffect;
        se.volume = parseInt(se.volume);
        se.pitch  = parseInt(se.pitch);
        se.pan    = parseInt(se.pan);
        return se;
    };

    Game_System.prototype.getMessageTriggerSe = function() {
        this.initMessageTriggerSeIfNeed();
        return this._messageTriggerSe;
    };

    Game_System.prototype.setMessageTriggerSe = function(name, volume, pitch, pan) {
        this.initMessageTriggerSeIfNeed();
        if (name || name === '') {
            this._messageTriggerSe.name = name;
        }
        if (volume || volume === 0) {
            this._messageTriggerSe.volume = volume;
        }
        if (pitch || pitch === 0) {
            this._messageTriggerSe.pitch = pitch;
        }
        if (pan || pan === 0) {
            this._messageTriggerSe.pan = pan;
        }
    };

    //=============================================================================
    // Window_Message
    //  メッセージ送りSEを演奏します。
    //=============================================================================
    var _Window_Message_updateInput      = Window_Message.prototype.updateInput;
    Window_Message.prototype.updateInput = function() {
        var wasPause = this.pause;
        var input = _Window_Message_updateInput.apply(this, arguments);
        if (wasPause && !this.pause) {
            if (this.doesContinue()) {
                this.playMessageTriggerSe();
            } else {
                this._needMessageSe = true;
            }
        }
        return input;
    };

    var _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
    Window_Message.prototype.terminateMessage = function() {
        if (this._pauseSkip) {
            this._needMessageSe = true;
        }
        _Window_Message_terminateMessage.apply(this, arguments);
    };

    var _Window_Message_checkToNotClose = Window_Message.prototype.checkToNotClose;
    Window_Message.prototype.checkToNotClose = function() {
        if (this.isClosing() && this.isOpen() && this._needMessageSe) {
            if (this.doesContinue() || !param.doseContinueOnly) {
                this.playMessageTriggerSe();
            }
            this._needMessageSe = false;
        }
        _Window_Message_checkToNotClose.apply(this, arguments);
    };

    Window_Message.prototype.playMessageTriggerSe = function() {
        if (this.isValidMessageTriggerSe()) {
            AudioManager.playSe($gameSystem.getMessageTriggerSe());
        }
    };

    Window_Message.prototype.isValidMessageTriggerSe = function() {
        return param.validateSwitchId === 0 || $gameSwitches.value(param.validateSwitchId);
    };
})();

