//=============================================================================
// CustomizeConfigDefault.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015 Triacontane
// Translator : ReIris
// This plugin is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2016/08/01 項目自体を非表示にする機能を追加しました。
// 1.0.3 2016/06/22 多言語対応
// 1.0.2 2016/01/17 競合対策
// 1.0.1 2015/11/01 既存コードの再定義方法を修正（内容に変化なし）
// 1.0.0 2015/11/01 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 設置預設值設定插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param AlwaysDash
 * @text 始終衝刺
 * @desc 始終衝刺(ON/OFF)
 * @default OFF
 *
 * @param CommandRemember
 * @text 命令記住
 * @desc 命令記住(ON/OFF)
 * @default OFF
 *
 * @param BgmVolume
 * @text BGM 音量
 * @desc BGM 音量(0-100)
 * @default 100
 *
 * @param BgsVolume
 * @text BGS 音量
 * @desc BGS 音量(0-100)
 * @default 100
 *
 * @param MeVolume
 * @text Me 音量
 * @desc ME 音量(0-100)
 * @default 100
 *
 * @param SeVolume
 * @text Se 音量
 * @desc SE 音量(0-100)
 * @default 100
 *
 * @param EraseAlwaysDash
 * @text 隱藏始終奔跑
 * @desc 隱藏始終奔跑(ON/OFF)
 * @default OFF
 *
 * @param EraseCommandRemember
 * @text 隱藏命令記住
 * @desc 隱藏命令記住(ON/OFF)
 * @default OFF
 *
 * @param EraseBgmVolume
 * @text 隱藏 Bgm 音量
 * @desc 隱藏 Bgm 音量(ON/OFF)
 * @default OFF
 *
 * @param EraseBgsVolume
 * @text 隱藏 Bgs 音量
 * @desc 隱藏 Bgs 音量(ON/OFF)
 * @default OFF
 *
 * @param EraseMeVolume
 * @text 隱藏 Me 音量
 * @desc 隱藏 Me 音量(ON/OFF)
 * @default OFF
 *
 * @param EraseSeVolume
 * @text 隱藏 Se 音量
 * @desc 隱藏 Se 音量(ON/OFF)
 * @default OFF
 *
 * @help 在設置畫面中指定項目的預設值。
 * 也可以隱藏不需要的指令
 * 僅當尚未創建 config.rpgsave 時才執行此過程。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName = 'CustomizeConfigDefault';

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramAlwaysDash           = getParamBoolean(['AlwaysDash', '常時ダッシュ']);
    var paramCommandRemember      = getParamBoolean(['CommandRemember', 'コマンド記憶']);
    var paramBgmVolume            = getParamNumber(['BgmVolume', 'BGM音量'], 0, 100);
    var paramBgsVolume            = getParamNumber(['BgsVolume', 'BGS音量'], 0, 100);
    var paramMeVolume             = getParamNumber(['MeVolume', 'ME音量'], 0, 100);
    var paramSeVolume             = getParamNumber(['SeVolume', 'SE音量'], 0, 100);
    var paramEraseAlwaysDash      = getParamBoolean(['EraseAlwaysDash', '常時ダッシュ消去']);
    var paramEraseCommandRemember = getParamBoolean(['EraseCommandRemember', 'コマンド記憶消去']);
    var paramEraseBgmVolume       = getParamBoolean(['EraseBgmVolume', 'BGM音量消去']);
    var paramEraseBgsVolume       = getParamBoolean(['EraseBgsVolume', 'BGS音量消去']);
    var paramEraseMeVolume        = getParamBoolean(['EraseMeVolume', 'ME音量消去']);
    var paramEraseSeVolume        = getParamBoolean(['EraseSeVolume', 'SE音量消去']);

    //=============================================================================
    // ConfigManager
    //  それぞれの項目に初期値を与えます。
    //=============================================================================
    var _ConfigManagerApplyData = ConfigManager.applyData;
    ConfigManager.applyData     = function(config) {
        _ConfigManagerApplyData.apply(this, arguments);
        if (config.alwaysDash == null)      this.alwaysDash = paramAlwaysDash;
        if (config.commandRemember == null) this.commandRemember = paramCommandRemember;
        if (config.bgmVolume == null)       this.bgmVolume = paramBgmVolume;
        if (config.bgsVolume == null)       this.bgsVolume = paramBgsVolume;
        if (config.meVolume == null)        this.meVolume = paramMeVolume;
        if (config.seVolume == null)        this.seVolume = paramSeVolume;
    };

    //=============================================================================
    // Window_Options
    //  パラメータを空白にした項目を除去します。
    //=============================================================================
    var _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
    Window_Options.prototype.makeCommandList = function() {
        _Window_Options_makeCommandList.apply(this, arguments);
        if (paramEraseAlwaysDash) this.eraseOption('alwaysDash');
        if (paramEraseCommandRemember) this.eraseOption('commandRemember');
        if (paramEraseBgmVolume) this.eraseOption('bgmVolume');
        if (paramEraseBgsVolume) this.eraseOption('bgsVolume');
        if (paramEraseMeVolume) this.eraseOption('meVolume');
        if (paramEraseSeVolume) this.eraseOption('seVolume');
    };

    Window_Options.prototype.eraseOption = function(symbol) {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].symbol === symbol) {
                this._list.splice(i, 1);
                break;
            }
        }
    };
})();
