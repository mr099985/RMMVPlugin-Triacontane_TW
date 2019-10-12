//=============================================================================
// ChangeWindowTouchPolicy.js
// ----------------------------------------------------------------------------
// (C) 2015 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.1 2018/11/19 プラグインによって追加されたウィンドウの実装次第で挙動がおかしくなる現象を修正
// 1.1.0 2016/06/03 モバイルデバイスでウィンドウのカーソルを1回で決定できる機能を追加
// 1.0.0 2015/12/20 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc [ ver.1.1.1 ]窗口觸碰模式變更
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param 枠外タッチ動作
 * @text 窗口外觸碰模式
 * @desc 選擇觸碰窗口外部分的情況。(ok / cancel / off)
 * @default cancel
 *
 * @help 觸碰或點擊窗口時更改行為。
 * 1. 滑鼠懸停在項目上
 * 2. 點擊一次該點狀態以確定該項目
 * 3. 單擊窗口框外時添加行為（可自定義）
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
(function() {
    'use strict';
    var pluginName = 'ChangeWindowTouchPolicy';

    //=============================================================================
    // ローカル関数
    //  プラグインパラメータやプラグインコマンドパラメータの整形やチェックをします
    //=============================================================================
    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value == null ? '' : value;
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
    var paramActionOutsideFrame = getParamString(['ActionOutsideFrame', '枠外タッチ動作']).toLowerCase();

    //=============================================================================
    // Window_Selectable
    //  タッチ周りの仕様を書き換えのため元の処理を上書き
    //=============================================================================
    var _Window_Selectable_processTouch = Window_Selectable.prototype.processTouch;
    Window_Selectable.prototype.processTouch = function() {
        if (this.maxItems() === 0) {
            _Window_Selectable_processTouch.apply(this, arguments);
            return;
        }
        if (this.isOpenAndActive()) {
            if ((TouchInput.isMoved() || TouchInput.isTriggered()) && this.isTouchedInsideFrame()) {
                this.onTouch(TouchInput.isTriggered());
            } else if (TouchInput.isCancelled()) {
                if (this.isCancelEnabled()) this.processCancel();
            } else if (TouchInput.isTriggered()) {
                switch (paramActionOutsideFrame) {
                    case '決定':
                    case 'ok':
                        if (this.isOkEnabled()) this.processOk();
                        break;
                    case 'キャンセル':
                    case 'cancel':
                        if (this.isCancelEnabled()) this.processCancel();
                        break;
                    case 'なし':
                    case 'off':
                        break;
                }
            }
        }
    };

    var _Window_Selectable_onTouch      = Window_Selectable.prototype.onTouch;
    Window_Selectable.prototype.onTouch = function(triggered) {
        if (Utils.isMobileDevice() && this.isCursorMovable()) {
            var x        = this.canvasToLocalX(TouchInput.x);
            var y        = this.canvasToLocalY(TouchInput.y);
            var hitIndex = this.hitTest(x, y);
            this.select(hitIndex);
        }
        _Window_Selectable_onTouch.apply(this, arguments);
    };

    //=============================================================================
    // TouchInput
    //  ポインタ移動時にマウス位置の記録を常に行うように元の処理を上書き
    //=============================================================================
    TouchInput._onMouseMove = function(event) {
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);
        this._onMove(x, y);
    };
})();

