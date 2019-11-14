//=============================================================================
// SaveFileDrawFace.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.1 2017/03/28 既存のタイトルを非表示にする機能を追加
// 1.1.0 2017/03/26 マップ名表示機能を追加
// 1.0.0 2017/03/26 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.1.1.1 ]存檔顯示角色頭像
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param VisibleItems
 * @text 顯示行數
 * @desc 可以在存檔窗口中顯示的行數。
 * 在默認窗口尺寸的情況下，3 就可以了。
 * @default 3
 *
 * @param ShowMapName
 * @text 是否顯示地圖名稱
 * @desc 存檔窗口右上顯示地圖名稱。
 * （不會應用在插件之前已保存的檔案中）
 * @default OFF
 *
 * @param HiddenGameTitle
 * @text 隱藏遊戲標題
 * @desc 隱藏顯示遊戲標題的部分。(ON/OFF)
 * @default OFF
 *
 * @help 在存檔窗口中使用頭像替換行走圖。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName = 'SaveFileDrawFace';

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
        return value.toUpperCase() === 'ON';
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var param             = {};
    param.visibleItems    = getParamNumber(['VisibleItems', '表示行数']);
    param.showMapName     = getParamBoolean(['ShowMapName', 'マップ名表示']);
    param.hiddenGameTitle = getParamBoolean(['HiddenGameTitle', 'ゲームタイトル非表示']);

    //=============================================================================
    // DataManager
    //  マップ名の保存を追加
    //=============================================================================
    if (param.showMapName) {
        var _DataManager_makeSavefileInfo = DataManager.makeSavefileInfo;
        DataManager.makeSavefileInfo      = function() {
            var info     = _DataManager_makeSavefileInfo.apply(this, arguments);
            info.mapName = $gameMap.displayName();
            return info;
        };
    }

    //=============================================================================
    // Window_SavefileList
    //  歩行グラフィックを非表示にして顔グラフィックを表示します。
    //=============================================================================
    Window_SavefileList.prototype.drawPartyCharacters = function(info, x, y) {};

    if (param.hiddenGameTitle) {
        Window_SavefileList.prototype.drawGameTitle = function(info, x, y, width) {};
    }

    Window_SavefileList.prototype.drawPartyFaces = function(info, x, y) {
        if (!info.faces) return;
        info.faces.forEach(function(faceData, index) {
            this.drawFace(faceData[0], faceData[1], x + index * (Window_Base._faceWidth + 4), y);
        }, this);
    };

    Window_SavefileList.prototype.drawMapName = function(info, x, y, width) {
        if (!info.mapName) return;
        this.drawText(info.mapName, x, y, width, param.hiddenGameTitle ? 'left' : 'right');
    };

    var _Window_SavefileList_drawContents      = Window_SavefileList.prototype.drawContents;
    Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
        if (valid) {
            var faceY    = rect.y + this.itemHeight() / 2 - Window_Base._faceHeight / 2 + this.lineHeight() / 2;
            var faceMaxY = rect.y + rect.height - Window_Base._faceHeight;
            this.drawPartyFaces(info, rect.x, Math.min(faceY, faceMaxY));
            if (param.showMapName) {
                this.drawMapName(info, rect.x + 192, rect.y, rect.width - 192);
            }
        }
        _Window_SavefileList_drawContents.apply(this, arguments);
    };

    Window_SavefileList.prototype.maxVisibleItems = function() {
        return param.visibleItems;
    };

    var _Window_SavefileList_drawItem      = Window_SavefileList.prototype.drawItem;
    Window_SavefileList.prototype.drawItem = function(index) {
        _Window_SavefileList_drawItem.apply(this, arguments);
        var id   = index + 1;
        var rect = this.itemRectForText(index);
        this.drawFileId(id, rect.x, rect.y);
    };
})();

