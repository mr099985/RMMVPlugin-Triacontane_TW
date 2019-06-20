/*=============================================================================
 NumberInputCancelable.js
----------------------------------------------------------------------------
 (C)2019 Triacontane
 Translator : ReIris
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.0.0 2019/05/12 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc 取消輸入數值功能插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param validSwitchId
 * @text 功能開關ID
 * @desc 當指定的開關ID為ON時，啟用插件功能。指定為 0 則始終啟用。
 * @default 0
 * @type switch
 *
 * @param canceledSwitchId
 * @text 取消開關ID
 * @desc 這是在取消輸入數值處理時，變為ON的開關ID。
 * @default 0
 * @type switch
 *
 * @help NumberInputCancelable.js
 *
 * 事件命令的「輸入數值」時可以進行取消。
 * 取消的情況，保留目標變量中的值不變。
 * 需要參數「取消開關ID」的開關為開啟。
 * （執行數值輸入處理時，已打開一次的開關將再次關閉。）
 *
 * 您可以取消鼠標操作。在觸摸操作的情況下，需要兩指觸摸。
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
    var param = createPluginParameter('NumberInputCancelable');

    /**
     * Window_NumberInput
     */
    var _Window_NumberInput_initialize = Window_NumberInput.prototype.initialize;
    Window_NumberInput.prototype.initialize = function() {
        _Window_NumberInput_initialize.apply(this, arguments);
        this.setHandler('cancel', this.onCancel.bind(this));
    };

    var _Window_NumberInput_start = Window_NumberInput.prototype.start;
    Window_NumberInput.prototype.start = function() {
        _Window_NumberInput_start.apply(this, arguments);
        if (param.canceledSwitchId) {
            $gameSwitches.setValue(param.canceledSwitchId, false);
        }
    };

    Window_NumberInput.prototype.isCancelEnabled = function() {
        return !param.validSwitchId || $gameSwitches.value(param.validSwitchId);
    };

    Window_NumberInput.prototype.onCancel = function() {
        if (param.canceledSwitchId) {
            $gameSwitches.setValue(param.canceledSwitchId, true);
        }
        this._messageWindow.terminateMessage();
        this.updateInputData();
        this.deactivate();
        this.close();
    };
})();
