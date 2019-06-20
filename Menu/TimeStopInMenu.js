//=============================================================================
// TimeStopInMenu.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/02/11 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 選單停止計算遊玩時間插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @help 停止在地圖或戰鬥畫面之外計算遊玩時間。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';

    var _SceneManager_renderScene = SceneManager.renderScene;
    SceneManager.renderScene = function() {
        var frame = Graphics.frameCount;
        _SceneManager_renderScene.apply(this, arguments);
        if (this.disableFrameCountAdd()) {
            Graphics.frameCount = frame
        }
    };

    SceneManager.disableFrameCountAdd = function() {
        return !(this._scene instanceof Scene_Map || this._scene instanceof Scene_Battle);
    };
})();

