//=============================================================================
// SimpleVoice.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.0 2017/07/16 ボイスのチャンネル指定機能を追加。同一チャンネルのボイスが同時再生されないようになります。
// 1.0.1 2017/06/26 英語表記のプラグインコマンドの指定方法を変更
// 1.0.0 2017/06/25 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver.1.1.0 ]簡易語音播放
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param FolderName
 * @text 資料夾名稱
 * @type string
 * @desc 包含語音文件的資料夾名稱。
 * @default voice
 *
 * @param OptionName
 * @text 設定項目名稱
 * @type string
 * @desc 選項畫面上顯示語音音量的設定項目名稱。
 * @default 語音音量
 *
 * @param OptionValue
 * @text 預設音量
 * @type number
 * @desc 語音音量的預設值。
 * @default 100
 *
 * @help 輕鬆支持語音播放。
 * 除了將檔案文件夾與普通音效分開之外，
 * 也可以在設置畫面上單獨指定音量。
 *
 * 播放和循環播放是通過插件命令進行的。
 *
 * 插件命令
 *  從事件命令中「插件命令」執行。
 *  （參數指定使用半形空格區分）
 *
 * SV_PLAY_VOICE aaa 90 100 0 2   # 播放指定的語音。
 * ※具體的數值為以下。
 * 0 : 文件名稱(不需要擴張名)
 * 1 : 音量(省略的情況為 90 )
 * 2 : 音調(省略的情況為 100 )
 * 3 : 左右聲道(省略的情況為 0 )
 * 4 : 頻道編號
 *
 * 通過指定頻道編號(數字)，可以同時停止與指定的頻道匹配的所有聲音。
 * 這將防止同一頻道的聲音重疊和播放。
 *
 * SV_PLAY_LOOP_VOICE aaa 90 100 0    # 播放指定循環的語音。
 * 
 * SV_STOP_VOICE aaa   # 停止播放語音aaa。
 * SV_STOP_VOICE 1     # 停止播放在頻道[1]播放的所有聲音。
 * ※名稱或頻道編號省略的情況直接停止全部語音。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
 
(function() {
    'use strict';
    var pluginName    = 'SimpleVoice';
    var metaTagPrefix = 'SV_';

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
    var param         = {};
    param.folderName  = getParamString(['FolderName', 'フォルダ名']);
    param.optionName  = getParamString(['OptionName', 'オプション名称']);
    param.optionValue = getParamNumber(['OptionValue', 'オプション初期値']);

    var pluginCommandMap = new Map();
    setPluginCommand('ボイスの演奏', 'execPlayVoice');
    setPluginCommand('PLAY_VOICE', 'execPlayVoice');
    setPluginCommand('ボイスのループ演奏', 'execPlayLoopVoice');
    setPluginCommand('PLAY_LOOP_VOICE', 'execPlayLoopVoice');
    setPluginCommand('ボイスの停止', 'execStopVoice');
    setPluginCommand('STOP_VOICE', 'execStopVoice');

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

    Game_Interpreter.prototype.execPlayVoice = function(args, loop) {
        var voice    = {};
        voice.name   = args.length >= 1 ? args[0] : '';
        voice.volume = args.length >= 2 ? getArgNumber(args[1], 0, 100) : 90;
        voice.pitch  = args.length >= 3 ? getArgNumber(args[2], 50, 150) : 100;
        voice.pan    = args.length >= 4 ? getArgNumber(args[3], -100, 100) : 0;
        var channel  = args.length >= 5 ? getArgNumber(args[4], 1) : undefined;
        AudioManager.playVoice(voice, loop || false, channel);
    };

    Game_Interpreter.prototype.execPlayLoopVoice = function(args) {
        this.execPlayVoice(args, true);
    };

    Game_Interpreter.prototype.execStopVoice = function(args) {
        var channel = Number(args[0]);
        if (isNaN(channel)) {
            AudioManager.stopVoice(args[0], null);
        } else {
            AudioManager.stopVoice(null, channel);
        }
    };

    //=============================================================================
    // ConfigManager
    //  ボイスボリュームの設定機能を追加します。
    //=============================================================================
    Object.defineProperty(ConfigManager, 'voiceVolume', {
        get: function() {
            return AudioManager._voiceVolume;
        },
        set: function(value) {
            AudioManager.voiceVolume = value;
        }
    });

    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData      = function() {
        var config         = _ConfigManager_makeData.apply(this, arguments);
        config.voiceVolume = this.voiceVolume;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData;
    ConfigManager.applyData      = function(config) {
        _ConfigManager_applyData.apply(this, arguments);
        var symbol       = 'voiceVolume';
        this.voiceVolume = config.hasOwnProperty(symbol) ? this.readVolume(config, symbol) : param.optionValue;
    };

    //=============================================================================
    // Window_Options
    //  ボイスボリュームの設定項目を追加します。
    //=============================================================================
    var _Window_Options_addVolumeOptions      = Window_Options.prototype.addVolumeOptions;
    Window_Options.prototype.addVolumeOptions = function() {
        _Window_Options_addVolumeOptions.apply(this, arguments);
        this.addCommand(param.optionName, 'voiceVolume');
    };

    //=============================================================================
    // AudioManager
    //  ボイスの演奏機能を追加定義します。
    //=============================================================================
    Object.defineProperty(AudioManager, 'voiceVolume', {
        get: function() {
            return this._voiceVolume;
        },
        set: function(value) {
            this._voiceVolume = value;
        }
    });

    AudioManager.updateVoiceParameters = function(buffer, voice) {
        this.updateBufferParameters(buffer, this._voiceVolume, voice);
    };

    AudioManager._voiceBuffers = [];
    AudioManager._voiceVolume  = 100;
    AudioManager.playVoice     = function(voice, loop, channel) {
        if (voice.name) {
            this.stopVoice(voice.name, channel);
            var buffer = this.createBuffer(param.folderName, voice.name);
            this.updateVoiceParameters(buffer, voice);
            buffer.play(loop);
            buffer.name = voice.name;
            buffer.channel = channel;
            this._voiceBuffers.push(buffer);
        }
    };

    AudioManager.stopVoice = function(name, channel) {
        this._voiceBuffers.forEach(function(buffer) {
            if (!name && !channel || buffer.name === name || buffer.channel === channel) {
                buffer.stop();
            }
        });
        this.filterPlayingVoice();
    };

    AudioManager.filterPlayingVoice = function() {
        this._voiceBuffers = this._voiceBuffers.filter(function(audio) {
            return audio.isPlaying();
        });
    };

    var _AudioManager_stopAll = AudioManager.stopAll;
    AudioManager.stopAll = function() {
        _AudioManager_stopAll.apply(this, arguments);
        this.stopVoice();
    };

    //=============================================================================
    // Scene_Base
    //  フェードアウト時にSEの演奏も停止します。
    //=============================================================================
    var _Scene_Base_fadeOutAll = Scene_Base.prototype.fadeOutAll;
    Scene_Base.prototype.fadeOutAll = function() {
        _Scene_Base_fadeOutAll.apply(this, arguments);
        AudioManager.stopVoice();
    };
})();

