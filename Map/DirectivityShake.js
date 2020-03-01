//=============================================================================
// DirectivityShake.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2016 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2016/11/03 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver1.0.0 ]方向震動
 * @author トリアコンタン( 翻譯 : ReIris )
 *
 * @help 事件命令中「搖動畫面」可以設定震動方向。
 * 可以指定角度並垂直或對角震動。
 *
 * 此外，除了通常的方法之外，您還可以將震動方法設置為 sin 波。
 * 設置成獨特的震動變形。
 *
 * 在執行「搖動畫面」之前，要先執行以下對應的命令內容。
 * 在搖動結束後將會自動恢復內建設置。
 *
 * 插件命令
 *  從事件命令中「插件命令」執行。
 *  （參數使用半形空格區分）
 *
 * DS_SET_ROTATION 90 # 角度[90度]震動。(角度:0...360)
 * DS_SIN_WAVE        # 設定震動 sin 波型。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var metaTagPrefix = 'DS_';

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
        var commandPrefix = new RegExp('^' + metaTagPrefix);
        if (!command.match(commandPrefix)) return;
        try {
            this.pluginCommandDirectivityShake(command.replace(commandPrefix, ''), args);
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

    Game_Interpreter.prototype.pluginCommandDirectivityShake = function(command, args) {
        switch (getCommandName(command)) {
            case '方向設定' :
            case 'SET_ROTATION' :
                $gameScreen.setShakeRotation(getArgNumber(args[0]));
                break;
            case 'SIN振動' :
            case 'SIN_WAVE' :
                $gameScreen.setShakeSinWave();
                break;
        }
    };

    //=============================================================================
    // Game_Screen
    //  シェイクの方向を保持します。
    //=============================================================================
    Game_Screen.prototype.getShakeRotation = function() {
        return this._shakeRotation;
    };

    Game_Screen.prototype.setShakeRotation = function(value) {
        this._shakeRotation = value * Math.PI / 180;
    };

    Game_Screen.prototype.setShakeSinWave = function() {
        this._shakeSinWave = true;
    };

    var _Game_Screen_clearShake = Game_Screen.prototype.clearShake;
    Game_Screen.prototype.clearShake = function() {
        _Game_Screen_clearShake.apply(this, arguments);
        this.clearDirectivityShake();
    };

    Game_Screen.prototype.clearDirectivityShake = function() {
        this._shakeRotation = 0;
        this._shakeSinWave  = false;
    };

    var _Game_Screen_updateShake = Game_Screen.prototype.updateShake;
    Game_Screen.prototype.updateShake = function() {
        var wasShake = this.isNeedShakeUpdate();
        if (this._shakeSinWave && wasShake) {
            this.updateSinShake();
        } else {
            _Game_Screen_updateShake.apply(this, arguments);
        }
        if (wasShake && !this.isNeedShakeUpdate()) {
            this.clearDirectivityShake();
        }
    };

    Game_Screen.prototype.updateSinShake = function() {
        this._shake = Math.sin(3 * this._shakeDuration * this._shakeSpeed * Math.PI / 180) * this._shakePower * 3;
        this._shakeDuration--;
    };

    Game_Screen.prototype.isNeedShakeUpdate = function() {
        return this._shakeDuration > 0 || this._shake !== 0;
    };

    //=============================================================================
    // Spriteset_Base
    //  シェイクの方向を反映します。
    //=============================================================================
    var _Spriteset_Base_updatePosition = Spriteset_Base.prototype.updatePosition;
    Spriteset_Base.prototype.updatePosition = function() {
        _Spriteset_Base_updatePosition.apply(this, arguments);
        var shakeRotation  = $gameScreen.getShakeRotation();
        if (shakeRotation) {
            var shakeDistance = Math.round($gameScreen.shake());
            this.x -= shakeDistance;
            this.x += Math.cos(shakeRotation) * shakeDistance;
            this.y += Math.sin(shakeRotation) * shakeDistance;
        }
    };
})();

