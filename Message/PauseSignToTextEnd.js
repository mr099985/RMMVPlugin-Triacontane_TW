//=============================================================================
// PauseSignToTextEnd.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2016 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.2.1 2018/06/03 MessageWindowPopup.jsとの併用時、プラグインの定義順次第でポーズサインの表示が正常に行われない場合がある問題を修正
// 1.2.0 2017/06/24 有効、無効を切り替えるスイッチを追加
// 1.1.0 2017/04/23 ポーズサインを非表示にできるスイッチを追加
// 1.0.0 2017/01/16 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 暫停圖示顯示結尾插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param ValidateSwitchId
 * @type number
 * @desc 當此開關ID為ON時，暫停圖示顯示於訊息結尾。如果為0，則始終顯示於訊息結尾。
 * @default 0
 *
 * @param InvisibleSwitchId
 * @type number
 * @desc 當此開關ID為ON時，不顯示暫停圖示。
 * @default 0
 *
 * @help 訊息窗口中的暫停圖示顯示於訊息結尾。
 *
 * 但是，如果使用了氣泡呼出窗口插件，則氣泡呼出窗口插件優先。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName    = 'PauseSignToTextEnd';

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
    var param = {};
    param.invisibleSwitchId = getParamNumber(['InvisibleSwitchId', '非表示スイッチ番号'], 0);
    param.validateSwitchId  = getParamNumber(['ValidateSwitchId', '有効スイッチ番号'], 0);

    //=============================================================================
    // Window_Message
    //  ポーズサインの位置を変更します。
    //=============================================================================
    var _Window_Message_startPause = Window_Message.prototype.startPause;
    Window_Message.prototype.startPause = function() {
        _Window_Message_startPause.apply(this, arguments);
        if ((!this.isPopup || !this.isPopup()) && this.isValidPauseSignTextEnd()) {
            this.setPauseSignToTextEnd();
        } else {
            this._refreshPauseSign();
        }
    };

    Window_Message.prototype.isValidPauseSignTextEnd = function() {
        return !param.validateSwitchId || $gameSwitches.value(param.validateSwitchId);
    };

    Window_Message.prototype.isVisiblePauseSign = function() {
        return !$gameSwitches.value(param.invisibleSwitchId);
    };

    Window_Message.prototype.setPauseSignToTextEnd = function() {
        var textState = this._textState;
        var x = this.padding + textState.x;
        var y = this.padding + textState.y + textState.height;
        this._windowPauseSignSprite.anchor.x = 0;
        this._windowPauseSignSprite.anchor.y = 1;
        this._windowPauseSignSprite.move(x, y);
    };

    var _Window_Message__updatePauseSign = Window_Message.prototype.hasOwnProperty() ?
        Window_Message.prototype._updatePauseSign : null;
    Window_Message.prototype._updatePauseSign = function() {
        if (_Window_Message__updatePauseSign) {
            _Window_Message__updatePauseSign.apply(this, arguments);
        } else {
            Window_Base.prototype._updatePauseSign.apply(this, arguments);
        }
        if (!this.isPopup || !this.isPopup()) {
            this._windowPauseSignSprite.visible = this.isVisiblePauseSign();
        }
    };
})();
