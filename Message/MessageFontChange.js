//=============================================================================
// MessageFontChange.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2016 Triacontane
// Translator : ReIris
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2016/09/16 初版
// ----------------------------------------------------------------------------
// [Blog]   : http://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc [ ver1.0.0 ]更改訊息字體
 * @author トリアコンタン ( 翻譯 : ReIris )
 *
 * @param Font1
 * @text 字體 1
 * @desc 1 號字體設定
 * @default ヒラギノゴシック ProN W3,Hiragino Gothic ProN,ＭＳ Ｐゴシック,MS PGothic
 *
 * @param Font2
  * @text 字體 2
 * @desc 2 號字體設定
 * @default ヒラギノ明朝 ProN W3,Hiragino Mincho ProN,ＭＳ Ｐ明朝,MS PMincho
 *
 * @param Font3
 * @text 字體 3
 * @desc 3 號字體設定
 * @default
 *
 * @param Font4
 * @text 字體 4
 * @desc 4 號字體設定
 * @default
 *
 * @param Font5
 * @text 字體 5
 * @desc 5 號字體設定
 * @default
 *
 * @param DefaultFont
 * @text 預設字體編號 
 * @desc 預設使用的字體編號。(1-5)
 * @default 0
 *
 * @help 顯示文章時可以一時變更使用的字體。
 * 無需讀取，因為它不在 fonts 資料夾中，
 * 而是從玩家的作業環境中有安裝的字體中選擇。
 *
 * 請指定參數中使用的字體。（最多5個）
 * 可以指定多種字體。請用逗號(,)分隔。
 * 如果指定了多個，將按順序檢查並在找到後立即使用。
 * 如果找不到所有內容，則使用普通字體。
 *
 * 在顯示文章中使用以下控制字元。
 * \fc[1] # 使用指定的字體編號
 * \fc[0] # 指定字體返回預設值
 *
 * 利用規約：
 *  不需要作者許可，可以進行修改和二次發布。
 *  使用形式（商業用途，18禁使用等）沒有限制。
 */

(function() {
    'use strict';
    var pluginName    = 'MessageFontChange';
    var setting       = {
        fontChangeCode: 'FC',
    };

    var getParamString = function(paramNames) {
        var value = getParamOther(paramNames);
        return value === null ? '' : value;
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
    var paramFonts = {};
    for (var i = 1; i < 6; i++) {
        paramFonts[i] = getParamString(['Font' + i, 'フォント' + i]);
    }
    var paramDefaultFont = getParamNumber(['DefaultFont', 'デフォルトフォント'], 0, 5);

    var _Window_Message_processEscapeCharacter      = Window_Message.prototype.processEscapeCharacter;
    Window_Message.prototype.processEscapeCharacter = function(code, textState) {
        switch (code) {
            case setting.fontChangeCode:
                this.changeFontFace(this.obtainEscapeParam(textState));
                break;
            default:
                _Window_Message_processEscapeCharacter.apply(this, arguments);
        }
    };

    Window_Message.prototype.changeFontFace = function(fontIndex) {
        var fonts = paramFonts[fontIndex];
        this.contents.fontFace = (fonts ? fonts + ',' : '') + this.standardFontFace();
    };

    var _Window_Message_standardFontFace = Window_Message.prototype.standardFontFace;
    Window_Message.prototype.standardFontFace = function() {
        var fonts = paramFonts[paramDefaultFont];
        return (fonts ? fonts + ',' : '') + _Window_Message_standardFontFace.apply(this, arguments);
    };
})();

