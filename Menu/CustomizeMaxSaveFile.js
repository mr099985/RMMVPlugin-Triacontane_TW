//=============================================================================
// CustomizeMaxSaveFile.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.1 2017/02/25 セーブファイル数により大きな値を設定できるよう上限を開放
// 1.1.0 2016/11/03 オートセーブなど最大数以上のIDに対してセーブするプラグインとの競合に対応
// 1.0.0 2016/03/19 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc [ ver.1.1.1 ]最大存檔數量變更
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param SaveFileNumber
 * @text 最大存檔數量
 * @desc 最大存檔數量
 * @default 20
 *
 * @help 最大存檔數量透過參數指定來變更。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function () {
    'use strict';
    var pluginName = 'CustomizeMaxSaveFile';

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };
    var paramSaveFileNumber = getParamNumber(['SaveFileNumber', 'セーブファイル数'], 0);

    //=============================================================================
    // DataManager
    //  セーブファイルの数をカスタマイズします。
    //=============================================================================
    var _DataManager_loadGlobalInfo = DataManager.loadGlobalInfo;
    DataManager.loadGlobalInfo = function() {
        if (!this._globalInfo) {
            this._globalInfo = _DataManager_loadGlobalInfo.apply(this, arguments);
        }
        return this._globalInfo;
    };

    var _DataManager_saveGlobalInfo = DataManager.saveGlobalInfo;
    DataManager.saveGlobalInfo = function(info) {
        _DataManager_saveGlobalInfo.apply(this, arguments);
        this._globalInfo = null;
    };

    var _DataManager_maxSavefiles = DataManager.maxSavefiles;
    DataManager.maxSavefiles = function() {
        return paramSaveFileNumber ? paramSaveFileNumber : _DataManager_maxSavefiles.apply(this, arguments);
    };

    var _DataManager_isThisGameFile = DataManager.isThisGameFile;
    DataManager.isThisGameFile = function(savefileId) {
        if (savefileId > this.maxSavefiles()) {
            return false;
        } else {
            return _DataManager_isThisGameFile.apply(this, arguments);
        }
    };
})();

