//=============================================================================
// DescriptionExtend.js
// ----------------------------------------------------------------------------
// (C)2015-2018 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2018/05/22 プラグインの機能を無効化するスイッチを追加
// 1.0.0 2018/05/20 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.1.1.0 ] 說明視窗功能擴張
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param swapDescription
 * @text 是否更換說明
 * @desc 忽視原本的說明文替換成注釋裡填寫的說明。
 * 設定為 false 的情況會在下一行出現原本的說明文。
 * @default true
 * @type boolean
 *
 * @param helpLines
 * @text 幫助窗口行數
 * @desc 要變更幫助窗口高度的話請指定數值。
 * 0 的情況什麼都不會發生。
 * @default 0
 * @type number
 *
 * @param validSwitch
 * @text 有效開關 ID
 * @desc 指定變數 ID 為 ON 時此插件有效。
 * 0 的情況為常時有效。
 * @default 0
 * @type switch
 *
 * @param notePrefix
 * @text 注釋欄前置
 * @desc 在命名其他插件注釋欄或插件命令時指定的前置。
 * 通常不需要指定它。
 * @default
 *
 * @help DescriptionExtend.js
 *
 * 幫助視窗的說明擴張。能夠顯示 3 行以上的說明。
 * 請在注釋欄添加以下說明。
 * <ExtendDesc:aaa> // [aaa]的內容追加。
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
     * Get database meta information.
     * @param object Database item
     * @param name Meta name
     * @returns {String} meta value
     */
    var getMetaValue = function(object, name) {
        var tagName = param.notePrefix + name;
        return object.meta.hasOwnProperty(tagName) ? convertEscapeCharacters(object.meta[tagName]) : null;
    };

    /**
     * Get database meta information.(for multi language)
     * @param object Database item
     * @param names Meta name array (for multi language)
     * @returns {String} meta value
     */
    var getMetaValues = function(object, names) {
        var metaValue;
        names.some(function(name) {
            metaValue = getMetaValue(object, name);
            return metaValue !== null;
        });
        return metaValue;
    };

    /**
     * Convert escape characters.(require any window object)
     * @param text Target text
     * @returns {String} Converted text
     */
    var convertEscapeCharacters = function(text) {
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text.toString()) : text;
    };

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

    var param = createPluginParameter('DescriptionExtend');

    /**
     * Window_Help
     * 拡張説明を追記します。
     */
    var _Window_Help_initialize = Window_Help.prototype.initialize;
    Window_Help.prototype.initialize = function(numLines) {
        _Window_Help_initialize.call(this, numLines || param.helpLines);
    };

    var _Window_Help_setItem = Window_Help.prototype.setItem;
    Window_Help.prototype.setItem = function(item) {
        _Window_Help_setItem.apply(this, arguments);
        if (!item || !this.isValidDescriptionExtend()) {
            return;
        }
        var extendText = getMetaValues(item, ['拡張説明', 'ExtendDesc']);
        if (extendText) {
            this.setText((param.swapDescription ? '' : this._text + '\n') + extendText);
        }
    };

    Window_Help.prototype.isValidDescriptionExtend = function() {
        return !param.validSwitch || $gameSwitches.value(param.validSwitch)
    };
})();
