//=============================================================================
// MouseWheelExtend.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2016 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.2.0 2017/05/18 ホイールクリックしたときにスイッチを切り替えられる機能を追加
// 1.1.0 2016/07/04 マウスホイールの状態をスイッチや変数に格納する機能など4種類の機能を追加
// 1.0.0 2016/07/03 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 滑鼠滾輪擴展插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param MessageScroll
 * @text 訊息滾動
 * @desc 向前滾動滑鼠滾輪可以播放訊息。但是不能退回訊息。
 * @default ON
 *
 * @param CursorMove
 * @text 光標滾動
 * @desc 移動滑鼠滾輪以移動窗口中的光標。
 * @default ON
 *
 * @param WheelOk
 * @text 滾輪點擊決定
 * @desc 滑鼠滾輪點擊具有與決定按鈕相同的功能。
 * @default ON
 *
 * @param WheelCancel
 * @text 滾輪點擊取消
 * @desc 滑鼠滾輪點擊具有與取消按鈕相同的功能。
 * @default OFF
 *
 * @param WheelSwitch
 * @text 滾輪點擊開啟開關
 * @desc 單擊滑鼠滾輪可打開任意開關。僅在地圖畫面上有效。
 * @default 0
 *
 * @param WheelToggle
 * @text 滾輪點擊打開/關閉開關
 * @desc 單擊滑鼠滾輪可以打開/關閉任何開關。僅在地圖畫面上有效。
 * @default 0
 *
 * @param ScrollDirection
 * @text 滾輪方向
 * @desc 使滑鼠滾輪滾動具有與十字鍵同等的功能。
 * @default OFF
 *
 * @param ScrollVariable
 * @text 滾輪滾動值
 * @desc 滾動滑鼠滾輪以設置任意變量的值。
 * 下 : 2 左 : 4 右 : 6 上 : 8　僅在地圖畫面上有效。
 * @default 0
 *
 * @param SensitivityY
 * @text 滾輪縱向靈敏
 * @desc 滑鼠滾輪的縱向旋轉的靈敏度。通常這樣就OK了。
 * @default 20
 *
 * @param SensitivityX
 * @text 滾輪橫向靈敏
 * @desc 滑鼠滾輪的橫向旋轉的靈敏度。通常這樣就OK了。
 * @default 20
 *
 * @help 擴張不太被使用滑鼠滾輪的功能。
 * 可以設置單個可用性。
 * 請注意，沒有滑鼠滾輪的環境沒有意義（手機，一些PC）。
 * 根據滑鼠左右滾動或是如果不能獲得正確判定動作也沒有。
 *
 * ・播放訊息
 * 向前滾動滑鼠滾輪可以播放訊息。但是不能退回訊息。
 *
 * ・光標移動
 * 移動滑鼠滾輪以移動窗口中的光標。
 *
 * ・點擊決定、取消
 * 使滑鼠滾輪點擊具有與決定、取消相同的功能。
 * 兩方都指定的情況由決定優先。
 *
 * ・點擊開關切換
 * 單擊滑鼠滾輪可打開任意開關。僅在地圖畫面上有效。
 * 可用於觸發一般劇情。
 * 在作為切換的情況下，每次單擊時開關都會打開和關閉。
 *
 * ・滾動十字鍵
 * 使滑鼠滾輪滾動具有與十字鍵同等的功能。
 *
 * ・滾動變數
 * 滾動滑鼠滾輪以設置任意變量的值。
 * 下:2 左:4 右:6 上:8　僅在地圖畫面上有效。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName = 'MouseWheelExtend';

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
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
    var paramCursorMove      = getParamBoolean(['CursorMove', 'カーソル移動']);
    var paramMessageScroll   = getParamBoolean(['MessageScroll', 'メッセージ送り']);
    var paramWheelOk         = getParamBoolean(['WheelOk', 'クリックで決定']);
    var paramWheelCancel     = getParamBoolean(['WheelCancel', 'クリックでキャンセル']);
    var paramWheelSwitch     = getParamNumber(['WheelSwitch', 'クリックでスイッチ'], 0);
    var paramWheelToggle     = getParamNumber(['WheelToggle', 'クリックでトグル'], 0);
    var paramScrollDirection = getParamBoolean(['ScrollDirection', 'スクロールで十字キー']);
    var paramScrollVariable  = getParamNumber(['ScrollVariable', 'スクロールで変数'], 0);
    var paramSensitivityY    = getParamNumber(['SensitivityY', '感度Y'], 1);
    var paramSensitivityX    = getParamNumber(['SensitivityX', '感度X'], 1);

    var _Game_Map_update = Game_Map.prototype.update;
    Game_Map.prototype.update = function(sceneActive) {
        _Game_Map_update.apply(this, arguments);
        this.updateWheelTrigger();
    };

    Game_Map.prototype.updateWheelTrigger = function() {
        if (TouchInput.isMiddleTriggered()) {
            if (paramWheelSwitch) {
                $gameSwitches.setValue(paramWheelSwitch, true);
            }
            if (paramWheelToggle) {
                var prevValue = $gameSwitches.value(paramWheelToggle);
                $gameSwitches.setValue(paramWheelToggle, !prevValue);
            }
        }
        if (paramScrollVariable) {
            var prevValue = $gameVariables.value(paramScrollVariable);
            var value = 0;
            if (TouchInput.wheelX >= paramSensitivityX) {
                value = 4;
            }
            if (TouchInput.wheelX <= -paramSensitivityX) {
                value = 6;
            }
            if (TouchInput.wheelY >= paramSensitivityY) {
                value = 2;
            }
            if (TouchInput.wheelY <= -paramSensitivityY) {
                value = 8;
            }
            if (prevValue !== value) {
                $gameVariables.setValue(paramScrollVariable, value);
            }
        }
    };
    
    if (paramMessageScroll) {
        //=============================================================================
        // Window_Message
        //  ホイールでメッセージ送りをします。
        //=============================================================================
        var _Window_Message_isTriggered      = Window_Message.prototype.isTriggered;
        Window_Message.prototype.isTriggered = function() {
            return _Window_Message_isTriggered.apply(this, arguments) || TouchInput.wheelY >= paramSensitivityY;
        };
    }

    if (paramCursorMove) {
        //=============================================================================
        // Window_Selectable
        //  ホイールでカーソル移動をします。
        //=============================================================================
        var _Window_Selectable_processCursorMove      = Window_Selectable.prototype.processCursorMove;
        Window_Selectable.prototype.processCursorMove = function() {
            var lastIndex = this.index();
            _Window_Selectable_processCursorMove.apply(this, arguments);
            if (this.index() !== lastIndex) return;
            if (this.isCursorMovable()) {
                if (TouchInput.wheelY >= paramSensitivityY) {
                    this.cursorDown(false);
                }
                if (TouchInput.wheelY <= -paramSensitivityY) {
                    this.cursorUp(false);
                }
                if (TouchInput.wheelX >= paramSensitivityX) {
                    this.cursorLeft(false);
                }
                if (TouchInput.wheelX <= -paramSensitivityX) {
                    this.cursorRight(false);
                }
                if (this.index() !== lastIndex) {
                    SoundManager.playCursor();
                }
            }
        };
    }


    //=============================================================================
    // TouchInput
    //  ホイールクリックを決定ボタンにリンクします。
    //=============================================================================
    var _TouchInput_update2 = TouchInput.update;
    TouchInput.update = function() {
        _TouchInput_update2.apply(this, arguments);
        this._middleTriggered = this._events.middleTriggered;
        this._events.middleTriggered = false;
    };

    var _TouchInput__onMiddleButtonDown = TouchInput._onMiddleButtonDown;
    TouchInput._onMiddleButtonDown      = function(event) {
        _TouchInput__onMiddleButtonDown.apply(this, arguments);
        if (paramWheelOk) {
            Input.setCurrentStateForWheelExtendOk(true);
        } else if (paramWheelCancel) {
            Input.setCurrentStateForWheelExtendCancel(true);
        }
        this._events.middleTriggered = true;
    };

    var _TouchInput__onMouseUp = TouchInput._onMouseUp;
    TouchInput._onMouseUp      = function(event) {
        _TouchInput__onMouseUp.apply(this, arguments);
        if (event.button === 1) {
            if (paramWheelOk) {
                Input.setCurrentStateForWheelExtendOk(false);
            } else if (paramWheelCancel) {
                Input.setCurrentStateForWheelExtendCancel(false);
            }
        }
    };

    TouchInput.isMiddleTriggered = function() {
        return this._middleTriggered;
    };

    if (paramScrollDirection) {
        TouchInput._wheelValidFrame = 12;
        
        var _TouchInput__onWheel = TouchInput._onWheel;
        TouchInput._onWheel      = function(event) {
            _TouchInput__onWheel.apply(this, arguments);
            if (event.deltaY <= -paramSensitivityY) {
                this._wheelUp = TouchInput._wheelValidFrame;
                Input.setCurrentStateForWheelExtendUp(true);
            }
            if (event.deltaY >= paramSensitivityY) {
                this._wheelDown = TouchInput._wheelValidFrame;
                Input.setCurrentStateForWheelExtendDown(true);
            }
            if (event.deltaX <= -paramSensitivityX) {
                this._wheelRight = TouchInput._wheelValidFrame;
                Input.setCurrentStateForWheelExtendRight(true);
            }
            if (event.deltaX >= paramSensitivityX) {
                this._wheelLeft = TouchInput._wheelValidFrame;
                Input.setCurrentStateForWheelExtendLeft(true);
            }
        };

        var _TouchInput_update = TouchInput.update;
        TouchInput.update = function() {
            _TouchInput_update.apply(this, arguments);
            this.updateWheelDirection();
        };

        TouchInput.updateWheelDirection = function() {
            if (this._wheelUp > 0) {
                this._wheelUp--;
                if (this._wheelUp <= 0) {
                    Input.setCurrentStateForWheelExtendUp(false);
                }
            }
            if (this._wheelDown > 0) {
                this._wheelDown--;
                if (this._wheelDown <= 0) {
                    Input.setCurrentStateForWheelExtendDown(false);
                }
            }
            if (this._wheelRight > 0) {
                this._wheelRight--;
                if (this._wheelRight <= 0) {
                    Input.setCurrentStateForWheelExtendRight(false);
                }
            }
            if (this._wheelLeft > 0) {
                this._wheelLeft--;
                if (this._wheelLeft <= 0) {
                    Input.setCurrentStateForWheelExtendLeft(false);
                }
            }
        };
    }

    //=============================================================================
    // Input
    //  マウスホイールの情報をキー入力に変換します。
    //=============================================================================
    Input.setCurrentStateForWheelExtendOk = function(value) {
        this.setCurrentStateForWheelExtend(13, value);
    };

    Input.setCurrentStateForWheelExtendCancel = function(value) {
        this.setCurrentStateForWheelExtend(27, value);
    };

    Input.setCurrentStateForWheelExtendDown = function(value) {
        this.setCurrentStateForWheelExtend(40, value);
    };

    Input.setCurrentStateForWheelExtendLeft = function(value) {
        this.setCurrentStateForWheelExtend(37, value);
    };

    Input.setCurrentStateForWheelExtendRight = function(value) {
        this.setCurrentStateForWheelExtend(39, value);
    };

    Input.setCurrentStateForWheelExtendUp = function(value) {
        this.setCurrentStateForWheelExtend(38, value);
    };

    Input.setCurrentStateForWheelExtend = function(code, value) {
        this._currentState[this.keyMapper[code]] = !!value;
    };
})();

