/*=============================================================================
 TitleWaitingDemo.js
----------------------------------------------------------------------------
 (C)2019 Triacontane
 Translator : ReIris
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.1.0 2019/06/06 何らかのキー入力によって待機秒数をリセットする機能を追加 byツミオさん
 1.0.0 2019/06/05 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc 標題等待演示插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param mapId
 * @text 地圖ID
 * @desc 移動目的地的地圖ID
 * @default 1
 * @type number
 *
 * @param mapX
 * @text 地圖 X 座標
 * @desc 移動目的地的地圖 X 座標
 * @default 1
 * @type number
 *
 * @param mapY
 * @text 地圖 Y 座標
 * @desc 移動目的地的地圖 Y 座標
 * @default 1
 * @type number
 *
 * @param waitSecond
 * @text 待機秒數
 * @desc 在標題畫面上等待的秒數
 * @default 20
 * @type number
 *
 * @param shouldIgnoreKey
 * @text 忽略按鍵
 * @desc 是否忽略鍵輸入。
 * 如果啟用，即使有按鍵輸入，也不會重置等待秒數
 * @default true
 * @type boolean
 *
 * @help TitleWaitingDemo.js
 *
 * 在顯示標題畫面時等待一段時間後，
 * 遊戲從指定的地圖開始新遊戲。
 *
 * 可用於演示畫面或其他隱藏要素。
 *　
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
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

    var param = createPluginParameter('TitleWaitingDemo');

    var _Scene_Title_start      = Scene_Title.prototype.start;
    Scene_Title.prototype.start = function() {
        _Scene_Title_start.apply(this, arguments);
        this._waitingDemoFrame = 0;
    };

    var _Scene_Title_update      = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.apply(this, arguments);
        this._waitingDemoFrame++;
        this.updateInputKey();
        if (this.shouldStartWaitingDemo()) {
            this.startWaitingDemo();
            this._startWaitingDemo = true;
        }
    };

    Scene_Title.prototype.updateInputKey = function() {
        if (param.shouldIgnoreKey) {
            return;
        }
        if (this.isAnyKeyInputted()) {
            this.resetWaitingDemoFrame();
        }
    };

    Scene_Title.prototype.startWaitingDemo = function() {
        this.commandNewGame();
        $gamePlayer.reserveTransfer(param.mapId, param.mapX, param.mapY);
        this._commandWindow.open();
    };

    Scene_Title.prototype.shouldStartWaitingDemo = function() {
        var isTimeLimit = this._waitingDemoFrame > param.waitSecond * 60;
        return isTimeLimit && !this._startWaitingDemo;
    };

    Scene_Title.prototype.resetWaitingDemoFrame = function() {
        this._waitingDemoFrame = 0;
    };

    //キーかマウスのボタンがクリックされたかどうか
    Scene_Title.prototype.isAnyKeyInputted = function() {
        return Input._latestButton || TouchInput.isTriggered();
    };
})();
