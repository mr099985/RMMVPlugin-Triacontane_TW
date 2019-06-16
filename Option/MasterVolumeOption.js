//=============================================================================
// MasterVolumeOption.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.2 2018/01/15 RPGアツマールのマスターボリューム調整機能と競合する旨をヘルプに追記
// 1.1.1 2017/06/29 マスターボリュームの増減値を変更したときに計算誤差が表示される場合がある問題を修正
// 1.1.0 2017/06/26 ボリュームの変化量を変更できる機能を追加（byツミオさん）
// 1.0.0 2017/06/24 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 主音量插件
 * @author トリアコンタン/Tsumio(協助)( 翻譯 : ReIris ) 
 *
 * @param ItemName
 * @text 主音量名稱
 * @type string
 * @desc 設定主音量名稱
 * @default 主音量
 *
 * @param DefaultValue
 * @text 預設音量
 * @type number
 * @desc 預設主音量的大小
 * @default 100
 *
 * @param OffsetValue
 * @text 移動量
 * @type number
 * @desc 所有音量一次移動的量(包含其他音量控制).
 * @default 20
 *
 * @help 注意！
 * 此插件與 RPGアツマール 伺服端提供的主音量調整功能衝突。
 * 因此在 RPGアツマール 上無法使用。
 *
 * 遊戲版本 1.5.0 利用追加的主音量 API。
 * 在設置畫面追加主音量設定。
 * BGM / BGS / ME / SE 全部的音量都會一起調整。
 *
 * 遊戲版本 1.5.0 以前無法使用。
 *
 * 這個插件沒有任何插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName = 'MasterVolumeOption';

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
    var param          = {};
    param.itemName     = getParamString(['ItemName', '項目名称']);
    param.defaultValue = getParamNumber(['DefaultValue', '初期値']);
    param.offsetValue  = getParamNumber(['OffsetValue', '音量の増減量']);//ツミオ加筆

    //=============================================================================
    // ConfigManager
    //  マスターボリュームの設定機能を追加します。
    //=============================================================================
    Object.defineProperty(ConfigManager, 'masterVolume', {
        get: function() {
            return Math.floor(AudioManager._masterVolume * 100);
        },
        set: function(value) {
            AudioManager.masterVolume = value.clamp(0, 100) / 100;
        }
    });

    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData      = function() {
        var config          = _ConfigManager_makeData.apply(this, arguments);
        config.masterVolume = this.masterVolume;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData      = function(config) {
        _ConfigManager_applyData.apply(this, arguments);
        var symbol        = 'masterVolume';
        this.masterVolume = config.hasOwnProperty(symbol) ? this.readVolume(config, symbol) : param.defaultValue;
    };

    //=============================================================================
    // Window_Options
    //  マスターボリュームの設定項目を追加します。
    //=============================================================================
    var _Window_Options_addVolumeOptions      = Window_Options.prototype.addVolumeOptions;
    Window_Options.prototype.addVolumeOptions = function() {
        this.addCommand(param.itemName, 'masterVolume');
        _Window_Options_addVolumeOptions.apply(this, arguments);
    };

    //=============================================================================
    // Window_Options
    //  バーの移動量の設定を付け加えます（ツミオ加筆）
    //=============================================================================
    var _Window_Options_volumeOffset      = Window_Options.prototype.volumeOffset;
    Window_Options.prototype.volumeOffset = function() {
        _Window_Options_volumeOffset.call(this);
        return param.offsetValue;
    };

})();

