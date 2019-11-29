//=============================================================================
// SystemSoundCustomize.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/05/22 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.1.0.0 ]系統音效變更
 * @author トリアコンタン( 翻譯 : ReIris )
 *
 * @help 讓系統音效在遊戲中變更。
 * 修改後的系統音效對每個保存檔案都有效。
 *
 * 變更是使用插件命令完成的。
 * 請為每個系統聲音效果指定類型索引作為參數。
 * 索引參照下方表。
 *
 * 插件命令
 *  從事件命令中「插件命令」執行。
 *  （參數指定使用半形空格區分）
 *
 * SSC_CHANGE_SYSTEM_SE 0 seName 90 100 0   # 指針音效變更為 seName
 * SSC_RESET_SYSTEM_SE 1                    # OK SE恢復預設
 * ※音量、音調、左右聲道省略的情況則使用預設值。
 *
 * 索引列表
 *  0 : 指針
 *  1 : OK
 *  2 : 取消
 *  3 : 蜂鳴器
 *  4 : 裝備
 *  5 : 保存
 *  6 : 讀取
 *  7 : 戰鬥開始
 *  8 : 逃跑
 *  9 : 敵人攻撃
 * 10 : 敵人傷害
 * 11 : 敵人崩塌
 * 12 : Boss 崩塌 1
 * 13 : Boss 崩塌 2
 * 14 : 角色傷害
 * 15 : 角色崩塌
 * 16 : 恢復
 * 17 : 未擊中
 * 18 : 閃避
 * 19 : 魔法閃避
 * 20 : 魔法反射
 * 21 : 商店
 * 22 : 使用物品
 * 23 : 使用技能
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
 
(function() {
    'use strict';
    var metaTagPrefix = 'SSC_';

    //=============================================================================
    // ローカル関数
    //  プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします
    //=============================================================================
    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(arg) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (isNotAString(text)) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    var isNotAString = function(args) {
        return String(args) !== args;
    };

    var convertAllArguments = function(args) {
        for (var i = 0; i < args.length; i++) {
            args[i] = convertEscapeCharacters(args[i]);
        }
        return args;
    };

    var setPluginCommand = function(commandName, methodName) {
        pluginCommandMap.set(metaTagPrefix + commandName, methodName);
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var pluginCommandMap = new Map();
    setPluginCommand('CHANGE_SYSTEM_SE', 'execChangeSystemSe');
    setPluginCommand('システム効果音変更', 'execChangeSystemSe');
    setPluginCommand('RESET_SYSTEM_SE', 'execResetSystemSe');
    setPluginCommand('システム効果音削除', 'execResetSystemSe');

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var pluginCommandMethod = pluginCommandMap.get(command.toUpperCase());
        if (pluginCommandMethod) {
            this[pluginCommandMethod](convertAllArguments(args));
        }
    };

    Game_Interpreter.prototype.execChangeSystemSe = function(args) {
        var typeIndex = getArgNumber(args.shift());
        $gameSystem.setSystemSound(typeIndex, args);
    };

    Game_Interpreter.prototype.execResetSystemSe = function(args) {
        $gameSystem.resetSystemSound(getArgNumber(args[0]));
    };

    //=============================================================================
    // Game_System
    //  カスタムシステム効果音を保持します。
    //=============================================================================
    var _Game_System_onAfterLoad = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function() {
        _Game_System_onAfterLoad.apply(this, arguments);
        this.initSystemSound(false);
        this._systemSounds.forEach(function(sound) {
            if (sound) AudioManager.loadStaticSe(sound);
        })
    };

    Game_System.prototype.initSystemSound = function() {
        if (!this._systemSounds) {
            this._systemSounds = [];
        }
    };

    Game_System.prototype.setSystemSound = function(typeIndex, systemSoundArgs) {
        this.initSystemSound();
        var systemSound = {
            name  : systemSoundArgs[0] || '',
            volume: getArgNumber(systemSoundArgs[1] || 90, 0, 100),
            pitch : getArgNumber(systemSoundArgs[2] || 100, 50, 150),
            pan   : getArgNumber(systemSoundArgs[3] || 0, -100, 100)
        };
        this._systemSounds[typeIndex] = systemSound;
        AudioManager.loadStaticSe(systemSound);
    };

    Game_System.prototype.resetSystemSound = function(typeIndex) {
        this.initSystemSound();
        this._systemSounds[typeIndex] = undefined;
    };

    Game_System.prototype.getSystemSound = function(typeIndex) {
        return this._systemSounds && this._systemSounds[typeIndex] ? this._systemSounds[typeIndex] : null;
    };

    //=============================================================================
    // SoundManager
    //  カスタムシステム効果音を演奏します。
    //=============================================================================
    var _SoundManager_playSystemSound = SoundManager.playSystemSound;
    SoundManager.playSystemSound = function(n) {
        var customSound = $gameSystem.getSystemSound(n);
        if (customSound) {
            AudioManager.playStaticSe(customSound);
        } else {
            _SoundManager_playSystemSound.apply(this, arguments);
        }
    };
})();

