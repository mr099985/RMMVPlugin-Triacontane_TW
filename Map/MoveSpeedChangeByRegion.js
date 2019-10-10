//=============================================================================
// MoveSpeedChangeByRegion.js
// ----------------------------------------------------------------------------
// (C)2015-2018 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.1 2018/02/15 フォロワーを連れているときにフォロワーの移動速度がおかしくなる問題を修正
// 1.0.0 2018/02/12 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.1.0.1 ]區域移動速度變更
 * @author トリアコンタン( 翻譯 : ReIris )
 *
 * @param slowlyTerrainTags
 * @text 降速地形標記
 * @desc 降低移動速度的地形標記。可以指定複數。
 * @default
 * @type number[]
 *
 * @param fasterTerrainTags
 * @text 提速地形標記
 * @desc 提升移動速度的地形標記。可以指定複數
 * @default
 * @type number[]
 *
 * @param slowlyRegions
 * @text 降速區域 ID
 * @desc 降低移動速度的區域ID。可以指定複數。
 * @default
 * @type number[]
 *
 * @param fasterRegions
 * @text 提速區域 ID
 * @desc 提升移動速度的區域ID。可以指定複數。
 * @default
 * @type number[]
 *
 * @param deltaSpeed
 * @text 速度變化量
 * @desc 速度的上升、下降變化量。
 * @default 1
 * @type number
 *
 * @help 區域移動速度變更插件
 *
 * 在指定地形或區域內自動提高或降低角色的移動速度。
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
     * @param pluginName plugin name(MoveSpeedChangeByRegion)
     * @returns {any} Created parameter
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

    var param = createPluginParameter('MoveSpeedChangeByRegion');
    if (!param.slowlyTerrainTags) {
        param.slowlyTerrainTags = [];
    }
    if (!param.fasterTerrainTags) {
        param.fasterTerrainTags = [];
    }
    if (!param.slowlyRegions) {
        param.slowlyRegions = [];
    }
    if (!param.fasterRegions) {
        param.fasterRegions = [];
    }

    //=============================================================================
    // Game_CharacterBase
    //  地形による速度変化を設定
    //=============================================================================
    var _Game_CharacterBase_realMoveSpeed      = Game_CharacterBase.prototype.realMoveSpeed;
    Game_CharacterBase.prototype.realMoveSpeed = function() {
        return _Game_CharacterBase_realMoveSpeed.apply(this, arguments) +
            this.changeSpeedByTerrainTags() + this.changeSpeedByRegions();
    };

    Game_CharacterBase.prototype.changeSpeedByTerrainTags = function() {
        var terrainTag = this.terrainTag();
        var speed      = 0;
        if (param.slowlyTerrainTags.contains(terrainTag)) {
            speed -= this.getDeltaSpeed();
        }
        if (param.fasterTerrainTags.contains(terrainTag)) {
            speed += this.getDeltaSpeed();
        }
        return speed;
    };

    Game_CharacterBase.prototype.changeSpeedByRegions = function() {
        var region = this.regionId();
        var speed  = 0;
        if (param.slowlyRegions.contains(region)) {
            speed -= this.getDeltaSpeed();
        }
        if (param.fasterRegions.contains(region)) {
            speed += this.getDeltaSpeed();
        }
        return speed;
    };

    Game_CharacterBase.prototype.getDeltaSpeed = function() {
        return param.deltaSpeed;
    };

    //=============================================================================
    // Game_Follower
    //  実移動速度を再定義
    //=============================================================================
    Game_Follower.prototype.realMoveSpeed = function() {
        return _Game_CharacterBase_realMoveSpeed.apply(this, arguments);
    };
})();

