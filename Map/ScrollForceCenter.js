//=============================================================================
// ScrollForceCenter.js
// ----------------------------------------------------------------------------
// (C) 2016 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2019/04/28 中心座標を指定したぶんだけずらせる機能を追加
// 1.0.0 2016/09/15 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc [ ver.1.1.0 ]強制畫面中央滾動
 * @author トリアコンタン( 翻譯 : ReIris )
 *
 * @param adjustX
 * @text X 座標修正
 * @desc 畫面中心將移動指定的座標值。
 * @default 0
 * @type number
 * @min -500
 * @max 500
 *
 * @param adjustY
 * @text Y 座標修正
 * @desc 畫面中心將移動指定的座標值。
 * @default 0
 * @type number
 * @min -500
 * @max 500
 *
 * @help 無論地圖畫面上的地圖大小如何，玩家將始終位於畫面中央。
 * 當地圖以外的地方進入畫面時，將以黑色顯示。
 *
 * 插件命令
 *  從事件命令中「插件命令」執行。
 *  （參數指定使用半形空格區分）
 *
 * SFC_DISABLE_RESERVE # 禁止強制中央滾動並進行正常滾動。
 * SFC_ENABLE_RESERVE  # 允許強制中央滾動。
 *
 * 以上設置不會立即反映，在下一個轉移場景後生效。
 *
 * 此外，如果在地圖設置的注釋欄中對其進行如下描述，
 * 則可以在地圖設置上控制強制中央滾動的禁止/允許。
 * 此設置將優先於插件命令。
 * <SFC_Disable> # 此地圖禁用強制中央。
 * <SFC_Enable>  # 此地圖允許強制中央。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var metaTagPrefix = 'SFC';

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getMetaValue = function(object, name) {
        var metaTagName = metaTagPrefix + (name ? name : '');
        return object.meta.hasOwnProperty(metaTagName) ? object.meta[metaTagName] : undefined;
    };

    var getMetaValues = function(object, names) {
        if (!Array.isArray(names)) return getMetaValue(object, names);
        for (var i = 0, n = names.length; i < n; i++) {
            var value = getMetaValue(object, names[i]);
            if (value !== undefined) return value;
        }
        return undefined;
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
    var param = createPluginParameter('ScrollForceCenter');

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (!command.match(new RegExp('^' + metaTagPrefix))) return;
        this.pluginCommandScrollForceCenter(command.replace(metaTagPrefix, ''), args);
    };

    Game_Interpreter.prototype.pluginCommandScrollForceCenter = function(command) {
        switch (getCommandName(command)) {
            case '禁止予約' :
            case '_DISABLE_RESERVE':
                $gameMap.setDisableForceCenterReserve(true);
                break;
            case '許可予約' :
            case '_ENABLE_RESERVE':
                $gameMap.setDisableForceCenterReserve(false);
                break;

        }
    };

    var _Game_Player_updateScroll      = Game_Player.prototype.updateScroll;
    Game_Player.prototype.updateScroll = function(lastScrolledX, lastScrolledY) {
        _Game_Player_updateScroll.apply(this, arguments);
        if ($gameMap.isForceCenter()) {
            var x1 = lastScrolledX;
            var y1 = lastScrolledY;
            var x2 = this.scrolledX();
            var y2 = this.scrolledY();
            if (y2 > y1 && y2 <= this.centerY()) {
                $gameMap.scrollDown(y2 - y1);
            }
            if (x2 < x1 && x2 >= this.centerX()) {
                $gameMap.scrollLeft(x1 - x2);
            }
            if (x2 > x1 && x2 <= this.centerX()) {
                $gameMap.scrollRight(x2 - x1);
            }
            if (y2 < y1 && y2 >= this.centerY()) {
                $gameMap.scrollUp(y1 - y2);
            }
        }
    };

    var _Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        _Game_Map_initialize.apply(this, arguments);
        this._disableForceCenter        = false;
        this._disableForceCenterReserve = false;
    };

    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        this.refreshDisableForceCenter();
        _Game_Map_setup.apply(this, arguments);
    };

    Game_Map.prototype.isForceCenter = function() {
        return !this._disableForceCenter;
    };

    Game_Map.prototype.setDisableForceCenterReserve = function(value) {
        this._disableForceCenterReserve = !!value;
    };

    Game_Map.prototype.refreshDisableForceCenter = function() {
        var disableForceCenter;
        if (getMetaValues($dataMap, ['禁止', '_Disable'])) {
            disableForceCenter = true;
        } else if (getMetaValues($dataMap, ['許可', '_Enable'])) {
            disableForceCenter = false;
        } else {
            disableForceCenter = this._disableForceCenterReserve;
        }
        this._disableForceCenter = disableForceCenter;
    };


    var _Game_Map_setDisplayPos = Game_Map.prototype.setDisplayPos;
    Game_Map.prototype.setDisplayPos = function(x, y) {
        _Game_Map_setDisplayPos.apply(this, arguments);
        if (this.isForceCenterHorizontal()) {
            this._displayX = x + (param.adjustX || 0);
            this._parallaxX = this._displayX;
        }
        if (this.isForceCenterVertical()) {
            this._displayY = y + (param.adjustY || 0);
            this._parallaxY = this._displayY;
        }
    };

    Game_Map.prototype.isForceCenterVertical = function() {
        return !this.isLoopVertical() && this.isForceCenter();
    };

    Game_Map.prototype.isForceCenterHorizontal = function() {
        return !this.isLoopHorizontal() && this.isForceCenter();
    };

    var _Game_Map_scrollDown = Game_Map.prototype.scrollDown;
    Game_Map.prototype.scrollDown = function(distance) {
        var forceCenterDisplayY = this._displayY + distance;
        _Game_Map_scrollDown.apply(this, arguments);
        if (this.isForceCenterVertical()) {
            this._displayY = forceCenterDisplayY;
        }
    };

    var _Game_Map_scrollLeft      = Game_Map.prototype.scrollLeft;
    Game_Map.prototype.scrollLeft = function(distance) {
        var forceCenterDisplayX = this._displayX - distance;
        _Game_Map_scrollLeft.apply(this, arguments);
        if (this.isForceCenterHorizontal()) {
            this._displayX = forceCenterDisplayX;
        }
    };

    var _Game_Map_scrollRight      = Game_Map.prototype.scrollRight;
    Game_Map.prototype.scrollRight = function(distance) {
        var forceCenterDisplayX = this._displayX + distance;
        _Game_Map_scrollRight.apply(this, arguments);
        if (this.isForceCenterHorizontal()) {
            this._displayX = forceCenterDisplayX;
        }
    };

    var _Game_Map_scrollUp = Game_Map.prototype.scrollUp;
    Game_Map.prototype.scrollUp = function(distance) {
        var forceCenterDisplayY = this._displayY - distance;
        _Game_Map_scrollUp.apply(this, arguments);
        if (this.isForceCenterVertical()) {
            this._displayY = forceCenterDisplayY;
        }
    };
})();

