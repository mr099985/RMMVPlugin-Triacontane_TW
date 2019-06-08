/*=============================================================================
 NewGameSe.js
----------------------------------------------------------------------------
 (C)2018 Triacontane
 Translator : ReIris
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.1.0 2018/11/23 ニューゲーム以外でも専用効果音が演奏できるよう修正
 1.0.0 2018/08/03 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc 開始遊戲專用音效插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param soundEffect
 * @text 開始遊戲音效
 * @desc 開始遊戲選擇的音效設定。
 * @default
 * @type struct<AudioSe>
 *
 * @param includeContinue
 * @text 包含讀取、設置
 * @desc 選擇讀取，設置時也演奏專用音效。
 * @default false
 * @type boolean
 *
 * @help NewGameSe.js
 *
 * 選擇開始遊戲時播放專用音效。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
 
/*~struct~AudioSe:
 * @param name
 * @desc 文件名
 * @default
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param volume
 * @desc 音量
 * @default 90
 * @type number
 * @min 0
 * @max 100
 *
 * @param pitch
 * @desc 音調
 * @default 100
 * @type number
 * @min 50
 * @max 150
 *
 * @param pan
 * @desc 左右聲道
 * @default 0
 * @type number
 * @min -100
 * @max 100
 */

(function() {
    'use strict';

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

    var param = createPluginParameter('NewGameSe');

    var _Window_TitleCommand_playOkSound = Window_TitleCommand.prototype.playOkSound;
    Window_TitleCommand.prototype.playOkSound = function() {
        if (param.soundEffect && this.isNeedTitleSound()) {
            AudioManager.playStaticSe(param.soundEffect);
        } else {
            _Window_TitleCommand_playOkSound.apply(this, arguments);
        }
    };

    Window_TitleCommand.prototype.isNeedTitleSound = function() {
        return this.currentSymbol() === 'newGame' || param.includeContinue
    };
})();
