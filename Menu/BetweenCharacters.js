//=============================================================================
// BetweenCharacters.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2018/01/30 パラメータの型指定機能に対応。MessageWindowPopup.jsとの競合を解消
// 1.0.0 2017/04/20 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 文字間距插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param BetweenVariableId
 * @text 文字間距變數ID
 * @desc 取得文字間距的變數ID(單位:像素)。
 * @default 0
 * @type variable
 *
 * @help 設定文字間距。
 * 指定變量的值將直接在變更文字間距（以像素為單位）。
 *
 * 請在顯示消息之前將值放在指定的變量中。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName    = 'BetweenCharacters';

    //=============================================================================
    // ローカル関数
    //  プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします
    //=============================================================================
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return '';
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamString(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value) || 0).clamp(min, max);
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var param       = {};
    param.betweenVariableId = getParamNumber(['BetweenVariableId', '字間変数番号']);

    var _Window_Base_processNormalCharacter = Window_Base.prototype.processNormalCharacter;
    Window_Base.prototype.processNormalCharacter = function(textState) {
        _Window_Base_processNormalCharacter.apply(this, arguments);
        textState.x += this.getBetweenCharacters();
    };

    Window_Base.prototype.getBetweenCharacters = function() {
        return $gameVariables.value(param.betweenVariableId) || 0;
    };
})();

