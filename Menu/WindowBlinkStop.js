//=============================================================================
// WindowBlinkStop.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/12/09 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================
/*:
 * @plugindesc 停止窗口選擇閃爍插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @help WindowBlinkStop.js
 *
 * 選擇中窗口游標的閃爍停止。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';

    var _Window__updateCursor = Window.prototype._updateCursor;
    Window.prototype._updateCursor = function() {
        this._animationCount = 0;
        _Window__updateCursor.apply(this, arguments);
    };
})();

