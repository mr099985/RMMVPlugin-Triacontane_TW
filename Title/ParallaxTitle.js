//=============================================================================
// ParallaxTitle.js
// ----------------------------------------------------------------------------
// (C) 2016 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.2.0 2018/10/14 TemplateEvent.jsとの競合を解消
// 1.1.0 2016/11/23 遠景のスクロール速度がマップとずれていた問題を修正
//                  ニューゲーム時にスクロール位置を引き継ぐ設定を追加
//                  ニューゲーム選択時にフェードアウトしなくなる設定を追加
// 1.0.0 2016/11/09 初版
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc 全景標題插件
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param ParallaxSettingMapId
 * @text 遠景地圖ID
 * @desc 將指定地圖ID的「地圖設置」中的「遠景」設置應用於標題畫面。
 * @default 0
 * @type number
 *
 * @param ViewForeground
 * @text 前景遠景
 * @desc 顯示在原始標題畫面前方。可以像霧一樣用於演出。
 * @default false
 * @type boolean
 *
 * @param InheritScroll
 * @text 繼承滾動狀態
 * @desc 在新遊戲中繼承遠景的滾動狀態。
 * @default false
 * @type boolean
 *
 * @param NoFadeout
 * @text 不淡出
 * @desc 選擇新遊戲時，沒有音效或畫面淡出。（ON/OFF）
 * @default false
 * @type boolean
 *
 * @help 除標題畫面外，可以指定遠景。
 * 遠景可以跟地圖畫面用相同的方式垂直和水平循環，並且可以自動滾動。
 * 還有一個顯示為近景的功能。
 * 指定時，請勿指定普通標題圖片或根據需要添加透明色。
 *
 * 這個插件沒有插件命令。
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */
 
var $dataTitleMap = null;

(function() {
    'use strict';
    var pluginName = 'ParallaxTitle';

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON' || (value || '').toUpperCase() === 'TRUE';
    };

    //=============================================================================
    // パラメータの取得と整形
    //=============================================================================
    var paramParallaxSettingMapId = getParamNumber(['ParallaxSettingMapId', '遠景設定マップID'], 0);
    var paramViewForeground       = getParamBoolean(['ViewForeground', '近景表示']);
    var paramInheritScroll        = getParamBoolean(['InheritScroll', 'スクロール引き継ぎ']);
    var paramNoFadeout            = getParamBoolean(['NoFadeout', 'フェードアウト無効']);

    //=============================================================================
    // ローカル変数
    //=============================================================================
    var localParallaxX = 0;
    var localParallaxY = 0;

    //=============================================================================
    // Game_Map
    //  タイトル遠景のスクロール状態を引き継ぎます。
    //=============================================================================
    var _Game_Map_setDisplayPos      = Game_Map.prototype.setDisplayPos;
    Game_Map.prototype.setDisplayPos = function(x, y) {
        _Game_Map_setDisplayPos.apply(this, arguments);
        this.inheritParallaxOrigin();
    };

    Game_Map.prototype.inheritParallaxOrigin = function() {
        if (!paramInheritScroll) return;
        if (localParallaxX) {
            this._parallaxX += localParallaxX;
            localParallaxX  = 0;
        }
        if (localParallaxY) {
            this._parallaxY += localParallaxY;
            localParallaxY  = 0;
        }
    };

    //=============================================================================
    // Scene_Boot
    //  遠景設定マップをロードしてグローバル変数に保持します。
    //=============================================================================
    var _Scene_Boot_create      = Scene_Boot.prototype.create;
    Scene_Boot.prototype.create = function() {
        _Scene_Boot_create.apply(this, arguments);
        this._parallaxMapGenerator = this.parallaxMapLoadGenerator();
        $dataMap = {};
    };

    var _Scene_Boot_isReady      = Scene_Boot.prototype.isReady;
    Scene_Boot.prototype.isReady = function() {
        var isReady = _Scene_Boot_isReady.apply(this, arguments);
        return this._parallaxMapGenerator.next().done && isReady;
    };

    Scene_Boot.prototype.parallaxMapLoadGenerator = function*() {
        while (!DataManager.isMapLoaded()) {
            yield false;
        }
        DataManager.loadMapData(paramParallaxSettingMapId);
        while (!DataManager.isMapLoaded()) {
            yield false;
        }
        $dataTitleMap = $dataMap;
        $dataMap = {};
        return true;
    };

    //=============================================================================
    // Scene_Title
    //  タイトル画面に遠景表示を追加します。
    //=============================================================================
    var _Scene_Title_createBackground      = Scene_Title.prototype.createBackground;
    Scene_Title.prototype.createBackground = function() {
        if (!paramViewForeground) {
            this.createParallax();
        }
        _Scene_Title_createBackground.apply(this, arguments);
    };

    var _Scene_Title_createForeground      = Scene_Title.prototype.createForeground;
    Scene_Title.prototype.createForeground = function() {
        if (paramViewForeground) {
            this.createParallax();
        }
        _Scene_Title_createForeground.apply(this, arguments);
    };

    Scene_Title.prototype.createParallax = function() {
        this.setupParallax();
        this._parallax = new TilingSprite();
        this._parallax.move(0, 0, Graphics.width, Graphics.height);
        this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
        this.addChild(this._parallax);
    };

    Scene_Title.prototype.setupParallax = function() {
        var data            = $dataTitleMap;
        this._parallaxName  = data.parallaxName || '';
        this._parallaxZero  = ImageManager.isZeroParallax(this._parallaxName);
        this._parallaxLoopX = data.parallaxLoopX;
        this._parallaxLoopY = data.parallaxLoopY;
        this._parallaxSx    = data.parallaxSx;
        this._parallaxSy    = data.parallaxSy;
        this._parallaxX     = 0;
        this._parallaxY     = 0;
    };

    var _Scene_Title_update      = Scene_Title.prototype.update;
    Scene_Title.prototype.update = function() {
        _Scene_Title_update.apply(this, arguments);
        this.updateParallax();
    };

    Scene_Title.prototype.updateParallax = function() {
        if (this._parallaxLoopX) {
            this._parallaxX += this._parallaxSx / (this.getTileWidth() * 2);
        }
        if (this._parallaxLoopY) {
            this._parallaxY += this._parallaxSy / (this.getTileWidth() * 2);
        }
        if (this._parallax.bitmap) {
            this._parallax.origin.x = this.parallaxOx();
            this._parallax.origin.y = this.parallaxOy();
        }
    };

    Scene_Title.prototype.getTileWidth = function() {
        return Game_Map.prototype.tileWidth.call(null);
    };

    Scene_Title.prototype.getHalfTileWidth = function() {
        return this.getTileWidth() / 2;
    };

    Scene_Title.prototype.parallaxOx = function() {
        if (this._parallaxZero) {
            return this._parallaxX * this.getTileWidth();
        } else if (this._parallaxLoopX) {
            return this._parallaxX * this.getHalfTileWidth();
        } else {
            return 0;
        }
    };

    Scene_Title.prototype.parallaxOy = function() {
        if (this._parallaxZero) {
            return this._parallaxY * this.getTileWidth();
        } else if (this._parallaxLoopY) {
            return this._parallaxY * this.getHalfTileWidth();
        } else {
            return 0;
        }
    };

    var _Scene_Title_commandNewGame      = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function() {
        if (paramNoFadeout) {
            this._noFadeout = true;
        }
        _Scene_Title_commandNewGame.apply(this, arguments);
        this.keepParallaxOrigin();
    };

    var _Scene_Title_commandNewGameSecond      = Scene_Title.prototype.commandNewGameSecond;
    Scene_Title.prototype.commandNewGameSecond = function() {
        if (_Scene_Title_commandNewGameSecond) _Scene_Title_commandNewGameSecond.apply(this, arguments);
        this.keepParallaxOrigin();
    };

    Scene_Title.prototype.keepParallaxOrigin = function() {
        if (paramInheritScroll) {
            localParallaxX = this._parallaxX;
            localParallaxY = this._parallaxY;
        }
    };

    Scene_Title.prototype.fadeOutAll = function() {
        if (!this._noFadeout) {
            Scene_Base.prototype.fadeOutAll.apply(this, arguments);
        }
    };
})();

