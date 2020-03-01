//=============================================================================
// FixImageLoading.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 2.0.0 2017/06/09 本体ver1.5.0に合わせて再作成
// 1.1.1 2016/11/20 ロード完了時にframeが更新されない不具合を修正
//                  ロード中にframeが変更された場合に、ロード完了まで反映を遅らせる仕様を追加
// 1.1.0 2016/11/16 liply_GC.jsとの競合を解消 by 奏 ねこま様
// 1.0.0 2016/05/02 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:ja
 * @plugindesc [ ver.2.0.0 ]讀取圖像時防止閃爍
 * @author トリアコンタン
 *
 * @help 顯示未顯示圖像時防止發生閃爍。
 * 保留先前顯示的圖像，直到圖像讀取完成。
 *
 * 相反，如果要在顯示之前刪除圖像，請刪除圖片等。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';

    var _Sprite__renderCanvas = Sprite.prototype._renderCanvas;
    Sprite.prototype._renderCanvas = function(renderer) {
        _Sprite__renderCanvas.apply(this, arguments);
        if (this.isExistLoadingBitmap()) {
            this._renderCanvas_PIXI(renderer);
        }
    };

    var _Sprite__renderWebGL      = Sprite.prototype._renderWebGL;
    Sprite.prototype._renderWebGL = function(renderer) {
        _Sprite__renderWebGL.apply(this, arguments);
        if (this.isExistLoadingBitmap()) {
            if (this._isPicture) {
                this._speedUpCustomBlendModes(renderer);
                renderer.setObjectRenderer(renderer.plugins.picture);
                renderer.plugins.picture.render(this);
            } else {
                renderer.setObjectRenderer(renderer.plugins.sprite);
                renderer.plugins.sprite.render(this);
            }
        }
    };

    Sprite.prototype.isExistLoadingBitmap = function() {
        return this.bitmap && !this.bitmap.isReady();
    };
})();

