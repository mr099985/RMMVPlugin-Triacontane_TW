//=============================================================================
// HiddenParameter.js
// ----------------------------------------------------------------------------
// (C)2015-2018 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2018/04/03 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 隱藏參數插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @help HiddenParameter.js
 *
 * 從裝備或狀態窗口中隱藏參數顯示。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */


(function() {
    'use strict';

    Window_EquipStatus.prototype.windowWidth = function() {
        return 0;
    };

    Window_Status.prototype.drawBlock3 = function(y) {
        this.drawEquipments(48, y);
    };
})();
