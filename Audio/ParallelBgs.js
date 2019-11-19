//=============================================================================
// ParallelBgs.js
// ----------------------------------------------------------------------------
// Copyright (c) 2016 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.2 2017/01/05 BGSの演奏状態によっては、セーブ＆ロードした際に一部のBGSが演奏されなくなる現象の修正(byくらむぼん氏)
// 1.0.1 2016/11/16 BGSをプレーしていない状態でセーブ＆ロードするとエラーになる現象の修正
// 1.0.0 2016/11/12 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver1.0.2 ]BGS 並行播放插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @help 複數的 BGS 並行播放效果。如果從插件命令更改 BGS 頻道，
 * 則可以在播放原始 BGS 時重新播放 BGS 。
 * 並行播放的每個 BGS 可以單獨調整音量，音高，左右聲道。
 * 演奏 BGS 頻道默認為[1]。
 *
 * 雖然對 BGS 頻道沒有限制，但如果同時播放過多的 BGS ，
 * 有可能操作會受到影響。
 *
 * 另外，地圖指定的自動演奏的 BGS 固定在第 [1] 頻道。
 *
 * 作為附加功能，當您在播放 BGS 時播放 SE 時，
 * 提供了一個插件命令來自動淡出 BGS 。將能夠更清楚地聽到 SE。
 * 您還可以設置淡出時間和 SE 的播放時間。
 *
 * 插件命令
 *  從事件命令中「插件命令」執行。
 *  （參數指定使用半形空格區分）
 *
 * PB_BGS_CHANGE_LINE 2            # 將 BGS 的頻道更改為 [2] 。
 * PB_BGS_ALL_STOP                 # 停止正在播放的所有 BGS。
 * PB_BGS_FADEOUT_FOR_SE 1         # 播放 SE 時自動淡出 BGS 。
 * PB_BGS_FADEOUT_TIME 3           # 指定自動淡出的時間。
 *
 * ※1 可以指定淡出方法。
 *  0 : 正常播放 SE 而不會淡出 BGS 。
 *  1 : 在播放 SE 的同時開始淡出 BGS 。
 *  2 : BGS 淡出完成後才播放 SE 。
 *
 * 設置 2 需要從執行 SE 到實際播放的時間。
 * 請注意使用方法。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var metaTagPrefix = 'PB_';

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var windowLayer = SceneManager._scene._windowLayer;
        return windowLayer ? windowLayer.children[0].convertEscapeCharacters(text) : text;
    };

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンドを追加定義します。
    //=============================================================================
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        if (!command.match(new RegExp('^' + metaTagPrefix))) return;
        try {
            this.pluginCommandParallelBgs(command.replace(metaTagPrefix, ''), args);
        } catch (e) {
            if ($gameTemp.isPlaytest() && Utils.isNwjs()) {
                var window = require('nw.gui').Window.get();
                if (!window.isDevToolsOpen()) {
                    var devTool = window.showDevTools();
                    devTool.moveTo(0, 0);
                    devTool.resizeTo(window.screenX + window.outerWidth, window.screenY + window.outerHeight);
                    window.focus();
                }
            }
            console.log('プラグインコマンドの実行中にエラーが発生しました。');
            console.log('- コマンド名 　: ' + command);
            console.log('- コマンド引数 : ' + args);
            console.log('- エラー原因   : ' + e.stack || e.toString());
        }
    };

    Game_Interpreter.prototype.pluginCommandParallelBgs = function(command, args) {
        switch (getCommandName(command)) {
            case 'BGS_CHANGE_LINE' :
            case 'BGS_ライン変更' :
                $gameSystem.setBgsLine(getArgNumber(args[0], 1));
                break;
            case 'BGS_ALL_STOP' :
            case 'BGS_全停止' :
                AudioManager.stopAllBgs();
                break;
            case 'BGS_FADEOUT_FOR_SE' :
            case 'BGS_SE演奏時フェードアウト' :
                $gameSystem.setBgsFadeForSe(getArgNumber(args[0], 0));
                break;
            case 'BGS_FADEOUT_TIME' :
            case 'BGS_フェードアウト時間' :
                $gameSystem.setBgsFadeTime(getArgNumber(args[0], 1));
                break;
        }
    };

    //=============================================================================
    // Game_System
    //  BGS演奏ラインを変更します。
    //=============================================================================
    var _Game_System_initialize      = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.apply(this, arguments);
        this.initBgsMember();
    };

    Game_System.prototype.initBgsMember = function() {
        this.setBgsLine(this.getBgsLine());
        this.setBgsFadeForSe(this.getBgsFadeForSe());
        this.setBgsFadeTime(this.getBgsFadeTime());
    };

    Game_System.prototype.getBgsLine = function() {
        return this._bgsLine || 1;
    };

    Game_System.prototype.setBgsLine = function(value) {
        this._bgsLine = value;
        AudioManager.setBgsLineIndex(value);
    };

    Game_System.prototype.getBgsFadeForSe = function() {
        return this._bgsFadeForPlayingSe || 0;
    };

    Game_System.prototype.setBgsFadeForSe = function(value) {
        this._bgsFadeForPlayingSe = value;
        AudioManager.setBgsFadeForSe(value);
    };

    Game_System.prototype.getBgsFadeTime = function() {
        return this._bgsFadeTime || 1;
    };

    Game_System.prototype.setBgsFadeTime = function(value) {
        this._bgsFadeTime = value;
        AudioManager.setBgsFadeTime(value);
    };

    var _Game_System_onAfterLoad      = Game_System.prototype.onAfterLoad;
    Game_System.prototype.onAfterLoad = function() {
        _Game_System_onAfterLoad.apply(this, arguments);
        this.initBgsMember();
    };

    var _Game_Map_autoplay      = Game_Map.prototype.autoplay;
    Game_Map.prototype.autoplay = function() {
        AudioManager.multiLineDisable = true;
        _Game_Map_autoplay.apply(this, arguments);
        AudioManager.multiLineDisable = false;
    };

    //=============================================================================
    // AudioManager
    //  複数のBGS演奏ラインを管理します。
    //=============================================================================
    AudioManager.multiLineDisable = false;
    AudioManager._bgsLineIndex    = 1;
    AudioManager._bgsFadeForSe    = 0;
    AudioManager._bgsFadeTime     = 1;
    AudioManager._allBgsBuffer    = [];
    AudioManager._currentAllBgs   = [];
    AudioManager._delaySeStack    = [];
    AudioManager._allStop         = false;
    AudioManager._stopAllBgs      = true;
    AudioManager._bgsFading       = false;
    AudioManager._bgsFadeCounter  = 0;

    var _AudioManager_bgsVolume = Object.getOwnPropertyDescriptor(AudioManager, 'bgsVolume');
    Object.defineProperty(AudioManager, 'bgsVolume', {
        get: function() {
            return _AudioManager_bgsVolume.get.call(this);
        },
        set: function(value) {
            _AudioManager_bgsVolume.set.call(this, value);
            var nowBgs = this._currentBgs;
            this.iterateAllBgs(function() {
                if (nowBgs !== this._currentBgs) this.updateBgsParameters(this._currentBgs);
            }.bind(this));
        },
        configurable: true
    });

    Object.defineProperty(AudioManager, '_bgsBuffer', {
        get: function() {
            return this._allBgsBuffer[this.getBgsLineIndex()];
        },
        set: function(value) {
            this._allBgsBuffer[this.getBgsLineIndex()] = value;
        }
    });

    Object.defineProperty(AudioManager, '_currentBgs', {
        get: function() {
            return this._currentAllBgs[this.getBgsLineIndex()];
        },
        set: function(value) {
            this._currentAllBgs[this.getBgsLineIndex()] = value;
        }
    });

    AudioManager.getBgsLineIndex = function() {
        return this.multiLineDisable ? 1 : this._bgsLineIndex;
    };

    AudioManager.setBgsLineIndex = function(index) {
        this._bgsLineIndex = index;
    };

    AudioManager.setBgsFadeForSe = function(value) {
        this._bgsFadeForSe = value;
    };

    AudioManager.setBgsFadeTime = function(value) {
        this._bgsFadeTime = value;
    };

    var _AudioManager_playBgs = AudioManager.playBgs;
    AudioManager.playBgs      = function(bgs, pos) {
        if (!bgs) return;
        this._stopAllBgs = false;
        if (Array.isArray(bgs)) {
            this.playAllBgs(bgs);
        } else {
            _AudioManager_playBgs.apply(this, arguments);
        }
        this._stopAllBgs = true;
    };

    AudioManager.playAllBgs = function(bgsArray) {
        this.stopAllBgs();
        var prevIndex      = this._bgsLineIndex;
        this._bgsLineIndex = 1;
        bgsArray.forEach(function(bgs, index) {
            this._bgsLineIndex = index;
            this.playBgs(bgs, null);
        }, this);
        this._bgsLineIndex = prevIndex;
    };

    var _AudioManager_replayBgs = AudioManager.replayBgs;
    AudioManager.replayBgs      = function(bgs) {
        if (!bgs) return;
        if (Array.isArray(bgs)) {
            this.replayAllBgs(bgs);
        } else {
            _AudioManager_replayBgs.apply(this, arguments);
        }
    };

    AudioManager.replayAllBgs = function(bgsArray) {
        this.stopAllBgs();
        var prevIndex      = this._bgsLineIndex;
        this._bgsLineIndex = 1;
        bgsArray.forEach(function(bgs, index) {
            this._bgsLineIndex = index;
            this.replayBgs(bgs);
        }, this);
        this._bgsLineIndex = prevIndex;
    };

    var _AudioManager_saveBgs = AudioManager.saveBgs;
    AudioManager.saveBgs      = function() {
        var bgsArray = [];
        this.iterateAllBgs(function() {
            bgsArray[this._bgsLineIndex] = _AudioManager_saveBgs.apply(this, arguments);
        }.bind(this));
        return bgsArray.length > 1 ? bgsArray : bgsArray[0];
    };

    var _AudioManager_stopBgs = AudioManager.stopBgs;
    AudioManager.stopBgs      = function() {
        if (!this._stopAllBgs) {
            _AudioManager_stopBgs.apply(this, arguments);
        } else {
            this.stopAllBgs();
        }
    };

    AudioManager.stopAllBgs = function() {
        this.iterateAllBgs(function() {
            _AudioManager_stopBgs.apply(this, arguments);
        }.bind(this));
    };

    var _AudioManager_fadeOutBgs = AudioManager.fadeOutBgs;
    AudioManager.fadeOutBgs      = function(time) {
        this.iterateAllBgs(function() {
            _AudioManager_fadeOutBgs.call(this, time);
        }.bind(this));
    };

    AudioManager.iterateAllBgs = function(callBack) {
        var prevIndex = this._bgsLineIndex;
        Object.keys(this._allBgsBuffer).forEach(function(index) {
            this._bgsLineIndex = index;
            callBack(this._bgsBuffer);
        }, this);
        this._bgsLineIndex = prevIndex;
    };

    var _AudioManager_playSe = AudioManager.playSe;
    AudioManager.playSe      = function(se) {
        if (this.isNeedFadeOut()) {
            this.fadeOutBgsForSe();
        }
        if (this._bgsFadeForSe === 2 && this._currentBgs && this._bgsFadeCounter > 0) {
            this._delaySeStack.push(se);
        } else {
            _AudioManager_playSe.apply(this, arguments);
        }
    };

    AudioManager.updateBgsFade = function() {
        if (this.isNeedFadeIn()) {
            this.fadeInBgsForSe();
        }
        if (this._bgsFadeCounter > 0) {
            this._bgsFadeCounter--;
            if (this._bgsFadeCounter === 0) {
                this.playDelayedSe();
            }
        }
    };

    AudioManager.fadeOutBgsForSe = function() {
        var prevCurrentBgs = this._currentBgs;
        this.fadeOutBgs(this._bgsFadeTime);
        this._currentBgs     = prevCurrentBgs;
        this._bgsFading      = true;
        this._bgsFadeCounter = this._bgsFadeTime * 60;
    };

    AudioManager.isNeedFadeOut = function() {
        return !this._bgsFading && this._bgsFadeForSe !== 0;
    };

    AudioManager.fadeInBgsForSe = function() {
        this.fadeInBgs(this._bgsFadeTime);
        this._bgsFading      = false;
        this._bgsFadeCounter = 0;
    };

    AudioManager.isNeedFadeIn = function() {
        return this._bgsFading && !this.isPlayingAnySe() && this._bgsFadeCounter === 0;
    };

    AudioManager.playDelayedSe = function() {
        while (this._delaySeStack.length > 0) {
            _AudioManager_playSe.call(this, this._delaySeStack.pop());
        }
    };

    AudioManager.isPlayingAnySe = function() {
        return this._seBuffers.some(function(audio) {
            return audio.isExist();
        });
    };

    //=============================================================================
    // WebAudio
    //  演奏が要求済みかどうかを返します。
    //=============================================================================
    WebAudio.prototype.isExist = function() {
        return this._autoPlay;
    };

    //=============================================================================
    // SceneManager
    //  AudioManagerの更新処理を呼び出します。
    //=============================================================================
    var _SceneManager_updateScene = SceneManager.updateScene;
    SceneManager.updateScene      = function() {
        _SceneManager_updateScene.apply(this, arguments);
        if (this._scene) {
            AudioManager.updateBgsFade();
        }
    };
})();

