//=============================================================================
// BalloonPlaySe.js
// ----------------------------------------------------------------------------
// (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/12/13 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.1.0.0 ]顯示氣泡圖標時播放音效
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param SwitchId
 * @text 有效的開關ID
 * @desc 是否開啟插件功能的開關ID。0 的話無條件播放音效。
 * @default 0
 * @type switch
 *
 * @param SeInfo
 * @text 效果音
 * @desc 氣泡圖標顯示時播放的音效。
 * 給氣泡圖標選擇對應的音效。
 * @default
 * @type struct<SE>[]
 *
 * @help BalloonPlaySe.js
 *
 * 氣泡圖標顯示時自動播放對應音效。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

/*~struct~SE:
 *
 * @param Balloon
 * @text 氣泡圖標
 * @desc 目標氣泡圖標指定的播放音效
 * (1 : 驚嘆號 2 : 問號 3 : 樂符 4 : 心形 5 : 憤怒....)
 * @default 1
 * @type select
 * @option 驚嘆號
 * @value 1
 * @option 問號
 * @value 2
 * @option 樂符
 * @value 3
 * @option 心形
 * @value 4
 * @option 憤怒
 * @value 5
 * @option 流汗
 * @value 6
 * @option 蛛網
 * @value 7
 * @option 無言
 * @value 8
 * @option 燈泡
 * @value 9
 * @option Zzz
 * @value 10
 * @option 使用者自訂 1
 * @value 11
 * @option 使用者自訂 2
 * @value 12
 * @option 使用者自訂 3
 * @value 13
 * @option 使用者自訂 4
 * @value 14
 * @option 使用者自訂 5
 * @value 15
 *
 * @param name
 * @text 音效檔案名稱
 * @desc 播放的檔案名稱
 * @require 1
 * @dir audio/se/
 * @type file
 * @default
 *
 * @param volume
 * @text 音量
 * @desc 音量大小
 * @type number
 * @default 90
 * @min 0
 * @max 100
 *
 * @param pitch
 * @text 音調
 * @desc 音調高低
 * @type number
 * @default 100
 * @min 50
 * @max 150
 *
 * @param pan
 * @text 移動聲道
 * @desc 音效左右移動聲道
 * @type number
 * @default 0
 * @min -100
 * @max 100
 */

(function() {
    'use strict';

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var createParameter = function(pluginName) {
        var parameter = JSON.parse(JSON.stringify(PluginManager.parameters(pluginName), paramReplacer));
        PluginManager._parameters[pluginName.toLowerCase()] = parameter;
        return parameter;
    };

    var paramReplacer = function(key, value) {
        if (value === 'null') {
            return value;
        }
        if (value[0] === '"' && value[value.length - 1] === '"') {
            return value;
        }
        try {
            value = JSON.parse(value);
        } catch (e) {
            // do nothing
        }
        return value;
    };

    var param = createParameter('BalloonPlaySe');
    if (!param.SeInfo) {
        param.SeInfo = [];
    }

    //=============================================================================
    // Sprite_Balloon
    //  フキダシアイコン表示時にSEを演奏します。
    //=============================================================================
    var _Sprite_Balloon_setup = Sprite_Balloon.prototype.setup;
    Sprite_Balloon.prototype.setup = function(balloonId) {
        _Sprite_Balloon_setup.apply(this, arguments);
        if (this.isNeedPlayBalloonSe()) {
            this.playBalloonSe(balloonId);
        }
    };

    Sprite_Balloon.prototype.playBalloonSe = function(balloonId) {
        var balloonSe = param.SeInfo.filter(function(info) {
            return info.Balloon === balloonId;
        })[0];
        if (balloonSe) {
            AudioManager.playSe(balloonSe);
        }
    };

    Sprite_Balloon.prototype.isNeedPlayBalloonSe = function() {
        return (!param.SwitchId || $gameSwitches.value(param.SwitchId));
    };
})();

