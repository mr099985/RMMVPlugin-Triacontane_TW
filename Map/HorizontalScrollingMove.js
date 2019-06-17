//=============================================================================
// HorizontalScrollingMove.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2017/07/25 上向きを許容するパラメータを追加
// 1.0.0 2017/03/29 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 橫向卷軸移動插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param ValidSwitchId
 * @text 有效開關ID
 * @desc 這是一個開關ID，可以進行橫向滾動。指定為 0 始終有效。
 * @default 0
 * @type switch
 *
 * @param ValidUpPlayer
 * @text 玩家上下移動
 * @desc 當玩家上下移動時，可以向上移動。
 * @default false
 * @type boolean
 *
 * @param ValidUpEvent
 * @text 事件上下移動
 * @desc 當事件上下移動時，可以向上移動。
 * @default false
 * @type boolean
 *
 * @help 限制角色向左或向右移動的方向。
 * 主要是假想為橫向卷軸遊戲中的角色移動。
 * 但是，具有梯子屬性的圖塊可以向上移動。
 *
 * 僅在指定的開關為ON時有效。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName = 'HorizontalScrollingMove';

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

    var getParamBoolean = function(paramNames) {
        var value = getParamString(paramNames);
        return value.toUpperCase() === 'TRUE';
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var param           = {};
    param.validSwitchId = getParamNumber(['ValidSwitchId', '有効スイッチ番号']);
    param.validUpPlayer = getParamBoolean(['ValidUpPlayer', 'プレイヤー上向き許容']);
    param.validUpEvent  = getParamBoolean(['ValidUpEvent', 'イベント上向き許容']);

    //=============================================================================
    // Game_CharacterBase
    //  横移動時に別の方向を向こうとした場合、矯正します。
    //=============================================================================
    var _Game_CharacterBase_setDirection      = Game_CharacterBase.prototype.setDirection;
    Game_CharacterBase.prototype.setDirection = function(d) {
        var prevDirection = this.direction();
        _Game_CharacterBase_setDirection.apply(this, arguments);
        if (this.isHorizontalMove()) {
            this.modifyDirectionForHorizontalMove(prevDirection);
        }
    };

    Game_CharacterBase.prototype.isHorizontalMove = function() {
        return !param.validSwitchId || $gameSwitches.value(param.validSwitchId);
    };

    Game_CharacterBase.prototype.modifyDirectionForHorizontalMove = function(prevDirection) {
        if (this.isNeedModifyDirection() && !this.isOnLadder() && !this.isDirectionFixed()) {
            this._direction = prevDirection;
        }
    };

    Game_CharacterBase.prototype.isNeedModifyDirection = function() {
        return this.direction() === 2 || (this.isNeedModifyUpper() && this.direction() === 8);
    };

    Game_CharacterBase.prototype.isNeedModifyUpper = function() {
        return false;
    };

    Game_Player.prototype.isNeedModifyUpper= function() {
        return !param.validUpPlayer;
    };

    Game_Follower.prototype.isNeedModifyUpper= function() {
        return !param.validUpPlayer;
    };

    Game_Event.prototype.isNeedModifyUpper = function() {
        return !param.validUpEvent;
    };
})();

